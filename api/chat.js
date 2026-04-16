// api/chat.js — Vercel Serverless Function
// Proxy seguro para Gemini API — chave nunca exposta ao browser

const MAX_RETRIES = 3;

async function callGemini(url, body, attempt = 1) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    // Retry em 429 (rate limit) e 5xx com backoff exponencial
    if ((res.status === 429 || res.status >= 500) && attempt < MAX_RETRIES) {
      const delay = 1000 * attempt;
      console.warn(`Tentativa ${attempt} falhou (${res.status}). Aguardando ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
      return callGemini(url, body, attempt + 1);
    }
    const message = data?.error?.message || `Gemini retornou status ${res.status}`;
    throw { status: res.status, message };
  }

  return res.json();
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY não configurada nas variáveis de ambiente do Vercel.'
    });
  }

  const { messages, system } = req.body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Campo "messages" obrigatório (array não vazio).' });
  }

  // Converter formato Claude → Gemini
  // Claude: role "assistant" → Gemini: role "model"
  // Garantir que o histórico sempre começa com "user"
  const geminiContents = messages
    .filter((m, i) => !(i === 0 && m.role === 'assistant'))
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) }]
    }));

  // CRÍTICO: API Gemini 2.0+ exige camelCase "systemInstruction"
  const body = {
    ...(system && {
      systemInstruction: { parts: [{ text: system }] }
    }),
    contents: geminiContents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
      topP: 0.9,
      candidateCount: 1,
    },
    // Desabilitar function calling — sem isso o Gemini pode retornar functionCall em vez de texto
    tool_config: {
      function_calling_config: { mode: 'NONE' }
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT',       threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ]
  };

  try {
    const model = 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const data = await callGemini(url, body);

    // Extrair texto de forma robusta
    const candidate = data?.candidates?.[0];
    const parts = candidate?.content?.parts;

    if (!parts || parts.length === 0) {
      const blockReason = candidate?.finishReason;
      if (blockReason && blockReason !== 'STOP') {
        return res.status(200).json({
          text: 'Não consegui processar essa mensagem. Pode reformular de outra forma?'
        });
      }
      console.error('Resposta sem parts:', JSON.stringify(data));
      return res.status(500).json({ error: 'Resposta vazia do Gemini.' });
    }

    // Coletar texto de todas as parts
    const text = parts
      .filter(p => typeof p.text === 'string')
      .map(p => p.text)
      .join('') || 'Não consegui gerar uma resposta. Tente novamente.';

    return res.status(200).json({ text });

  } catch (err) {
    console.error('Erro interno:', err);
    const status = err.status || 500;
    const message = err.message || 'Erro interno do servidor.';
    return res.status(status).json({ error: message });
  }
};
