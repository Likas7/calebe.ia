# Auditoria de Código — CALEB.IA

**Data:** 13/04/2026  
**Arquivos analisados:** index.html (1329 linhas), api/chat.js (45 linhas), vercel.json

---

## 🔴 ERROS CRÍTICOS

### 1. API Gemini — System Instruction Mal Formatado
**Arquivo:** `api/chat.js:20`
```js
system_instruction: { parts: [{ text: system || '' }] }
```
**Problema:** Usando `system_instruction` (com underscore) em vez de `systemInstruction`. API do Gemini 2.0 requer o formato correto.

---

### 2. XSS via innerHTML
**Arquivo:** `index.html:1261-1278`
```js
function esc(t) {
  return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
           .replace(/\n/g,'<br>');
}
```
**Problema:** Função de escape usada com `innerHTML` (linha 1267-1269). Risco de XSS. Melhor alternativa: usar `textContent` diretamente.

---

### 3. JSON.parse sem Tratamento de Erros
**Arquivo:** `index.html:957, 1086, 1214`
```js
const sessions = JSON.parse(localStorage.getItem('caleb_sessions')||'[]');
```
**Problema:** Se localStorage estiver corrompido, lança erro silencioso.

---

### 4. Protocolo 002 — Treino D Incompleto
**Arquivo:** `index.html:744-752`
**Problema:** Treino D do protocolo 002 parece ter definição incompleta comparado com A, B, C.

---

## 🟡 PONTOS DE MELHORIA

| # | Localização | Problema | Sugestão |
|---|------------|----------|---------|
| 1 | `index.html` | Pesos dos exercícios não são salvos após treino | Salvar em localStorage em `finishWorkout()` |
| 2 | `index.html` | Botões não desabilitam durante loading | Adicionar `disabled` nos botões de envio |
| 3 | `api/chat.js` | Sem retry em caso de falha na API | Adicionar lógica de retry ou botão |
| 4 | `index.html:280, 755` | Gráficos/semana são hardcoded | Gerar dinamicamente de `caleb_sessions` |
| 5 | `index.html` | Sem lógica real de ciclos/semanas | Implementar contagem baseada em sessões |
| 6 | `index.html` | Prompt menciona deload mas não реалиza | Adicionar verificação automática de Borg |

---

## 🟢 OBSERVAÇÕES MENORES

| # | Localização | Issue |
|---|------------|------|
| 1 | `index.html:1200` | Fallback hardcoded `peso = 75` |
| 2 | `index.html:776` | `setInterval` nunca é limpo (memory leak) |
| 3 | `index.html:588` | Duração armazenada como string "30-45" mas tratada inconsistentemente |
| 4 | `index.html:108` | Treino D do protocolo 002 aparentemente incompleto |

---

## 📁 ESTRUTURA ATUAL

```
caleb-ia/
├── index.html      (1329 linhas) — Frontend SPA completo
├── api/
│   └── chat.js    (45 linhas)  — Proxy para Gemini API
└── vercel.json    (8 linhas)  — Config Vercel
```

---

## ✅ FUNCIONALIDADES EXISTENTES

- Splash screen com onboarding
- Chat interativo com Gemini (onboarding + dúvidas)
- 5 telas: Home, Chat, FAQ, Workout, Progress, Perfil
- Sistema de ciclos (001/002/003)
- Timer de treino
- Escala de Borg CR10
- Gráficos de progresso (hardcoded)
- Classificação Nuckols
- LocalStorage para persistência
- Navegação bottom nav

---

## ⚠️ FUNCIONALIDADES FALTANDO

- Salvamento de pesos dos exercícios
- Progressão real de ciclos (baseada em sessões)
- Deload automático
- Retry na API
- Dados dinâmicos (grids, charts)
- Tratamento robusto de localStorage
- Limpeza de intervals/timers