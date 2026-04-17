# PRD: CALEB.IA - Documento de Requisitos e Verificação

**Versão:** 1.0  
**Data:** 13/04/2026  
**Última atualização:** Auditoria de Código

---

## 📋 ESCOPO

### Visão Geral
CALEB.IA é um aplicativo de treino pessoal com IA que oferece protocolos de treinamento personalizados baseados em ciência, monitoramento de progresso e suporte via chat.

### Público-Alvo
- Atletas iniciantes a avançados
- Pessoas buscando ganho muscular, perda de gordura ou força
- Usuários que precisam de flexibilidade na programação
- Entusiastas de treino baseado em evidência científica

---

## ✅ FUNCIONALIDADES EXISTENTES (VERIFICAR)

### 1. Sistema de Onboarding
- [x] Formulário passo a passo com perguntas estratégicas
- [x] Salva perfil em localStorage
- [x] Geração de protocolo baseado em respostas
- [x] Controle de estado de onboarding

**Critérios de Verificação:**
- Todos os 13 campos de perfil salvos corretamente
- Sistema funciona sem internet (após primeiro setup)
- Validação de respostas mínimas
- Transição suave para home screen

---

### 2. Chat com IA
- [x] Interação com Gemini API
- [x] Histórico de conversação persistido
- [x] Quick actions para ações comuns
- [x] Escape básico de HTML

**Critérios de Verificação:**
- Mensagens enviadas/recebidas em <2s
- Histórico mantido corretamente
- Sem erros de XSS
- Respostas seguem sistema prompt

---

### 3. Sistema de Treinos
- [x] 3 protocolos (001/002/003)
- [x] Timer de sessão
- [x] Registro de Borg CR10
- [x] Sistema de check de sets

**Critérios de Verificação:**
- Protocolos completos e balanceados
- Timer sem drift
- Borg escala 1-10 funcionando
- Sets check visualmente claros

---

### 4. Progresso e Métricas
- [x] Gráficos de progresso
- [x] Classificação Nuckols
- [x] Aderência semanal
- [x] Relatório de ciclo

**Critérios de Verificação:**
- Gráficos renderizam corretamente
- Cálculos de ratio precisos
- Progressão visual consistente
- Dados atualizados após cada sessão

---

### 5. Interface e Navegação
- [x] 5 telas principais
- [x] Bottom navigation
- [x] Transições suaves
- [x] Design responsivo

**Critérios de Verificação:**
- Navegação sem bugs
- Transições animadas
- Adaptado para mobile
- Performance aceitável

---

## ❌ ERROS CRÍTICOS (VERIFICAR E CORRIGIR)

### 1. API Gemini Mal Formatada
**Localização:** `api/chat.js:20`

**Verificação:**
- [ ] Fazer chamada de teste à API
- [ ] Verificar se system instruction está sendo recebida
- [ ] Testar com diferentes prompts

**Critérios de Sucesso:**
- Respostas seguem sistema prompt corretamente
- Sem erros 400/500 na API
- Respostas consistentes

---

### 2. Vulnerabilidade XSS
**Localização:** `index.html:1261-1278`

**Verificação:**
- [ ] Injetar script via input de usuário
- [ ] Verificar se escapeHtml() funciona
- [ ] Testar caracteres especiais

**Critérios de Sucesso:**
- Nenhum script executado via innerHTML
- Todos caracteres escapados corretamente
- Conteúdo exibido como texto puro

---

### 3. JSON.parse Inseguro
**Localização:** `index.html:957, 1086, 1214`

**Verificação:**
- [ ] Corromper localStorage manualmente
- [ ] Verificar tratamento de erros
- [ ] Testar com dados inválidos

**Critérios de Sucesso:**
- App não quebra com localStorage corrompido
- Valores padrão aplicados corretamente
- Sem erros no console

---

### 4. Protocolo 002 Incompleto
**Localização:** `index.html:744-752`

**Verificação:**
- [ ] Acessar treino D do protocolo 002
- [ ] Verificar se todos exercícios são mostrados
- [ ] Comparar com protocolos A, B, C

**Critérios de Sucesso:**
- Todos exercícios exibidos
- Dados consistentes com outros protocolos
- Nenhuma sessão quebrada

---

## 🔧 MELHORIAS ESSENCIAIS (VERIFICAR)

### 1. Sistema de Pesos
**Localização:** `finishWorkout()` (linha ~1157)

**Verificar:**
- [ ] Campos de peso funcionam
- [ ] Validação de números
- [ ] Persistência em localStorage
- [ ] Exibição de histórico

**Critérios de Sucesso:**
- Pesos salvos corretamente
- Interface intuitiva
- Dados disponíveis para análise

---

### 2. Retry na API
**Localização:** `callCaleb()` (linha ~1244)

**Verificar:**
- [ ] Comportamento com falha de rede
- [ ] Tentativas automáticas
- [ | Feedback visual para usuário
- [ ] Timeout adequado

**Critérios de Sucesso:**
- 3 tentativas automáticas
- Mensagem de carregamento durante retry
- Sem duplicação de mensagens

---

### 3. Sistema de Ciclos
**Localização:** `updateNextWorkoutCard()` (linha ~953)

**Verificar:**
- [ ] Contagem de semanas
- [ ] Progressão entre ciclos
- [ ] Deload automático
- [ ] UI atualizada corretamente

**Critérios de Sucesso:**
- Ciclos avançam automaticamente
- Semana correta mostrada
- Deload ativado quando necessário

---

## 📊 TESTES DE INTEGRIDADE

### Dados Persistentes
```javascript
// Testar localStorage
const testData = {
  caleb_profile: {nome: 'Teste'},
  caleb_sessions: [{date: new Date().toISOString(), avgBorg: 7.5}],
  caleb_conversation: [{role: 'user', content: 'teste'}]
};

Object.entries(testData).forEach(([key, value]) => {
  localStorage.setItem(key, JSON.stringify(value));
  const retrieved = JSON.parse(localStorage.getItem(key));
  console.assert(JSON.stringify(retrieved) === JSON.stringify(value), `${key} falhou`);
});
```

### API Response Validation
```javascript
// Testar resposta da API
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    messages: [{role: 'user', content: 'test'}],
    system: 'Sistema de teste'
  })
});

console.assert(response.ok, 'Falha na API');
const data = await response.json();
console.assert(data.text && typeof data.text === 'string', 'Resposta inválida');
```

### UI Responsiveness
```javascript
// Testar diferentes tamanhos de tela
const sizes = [375, 768, 1024, 1440];
sizes.forEach(width => {
  window.resizeTo(width, 667);
  console.assert(
    document.querySelector('.screen').offsetWidth > 0,
    `UI quebrada em ${width}px`
  );
});
```

---

## 🎯 CRITÉRIOS DE QUALIDADE

### Performance
- [ ] Tempo de carregamento inicial < 2s
- [ ] Transições < 200ms
- [ ] Scroll sem lag
- [ ] Memória estável (sem leaks)

### Segurança
- [ ] Nenhum XSS detectado
- [ ] Dados sensíveis não expostos
- [ ] CORS configurado corretamente
- [ ] Input validation em todos os campos

### Usabilidade
- [ ] Fluxo de onboarding < 3 minutos
- [ ] Chat intuitivo e rápido
- [ ] Feedback visual claro
- [ ] Nenhum caminho bloqueado

### Acessibilidade
- [ ] Texto legível (tamanho mínimo 14px)
- [ ] Contraste adequado (> 4.5:1)
- [ ] Navegação por teclado
- [ ] Labels claros

---

## 📋 CHECKLIST FINAL DE VERIFICAÇÃO

### Antes do Deploy
- [ ] Todos erros críticos corrigidos
- [ ] Testes manuais completados
- [ ] Performance otimizada
- [ ] Mobile testado em dispositivos reais
- [ ] Segurança validada

### Pós-Deploy
- [ ] Monitoramento de erros
- [ ] Feedback inicial de usuários
- [ ] Primeiros 100 sessões monitoradas
- [ ] Performance em produção verificada
- [ ] Atualização do PRD com aprendizados

---

## 📈 MÉTRICAS DE SUCESSO

### Técnicas
- [ ] Tempo de resposta da API < 1.5s
- [ ] Taxa de erro < 0.5%
- [ ] Score Lighthouse > 90
- [ ] Core Web Vitals pass

### de Negócio
- [ ] Taxa de onboarding completo > 85%
- [ ] Sessões semanais por usuário > 3
- [ ] Tempo médio de sessão > 40min
- [ ] Satisfação do usuário > 4.5/5

---

## 🔍 PROCESSO DE VERIFICAÇÃO CONTÍNUA

### Semanal
- [ ] Review de código
- [ ] Testes automatizados
- [ ] Performance monitoring
- [ ] Feedback de usuários

### Mensal
- [ ] Security audit
- [ ] Usability testing
- [ ] Competitor analysis
- [ ] PRD atualizado

---

**Status Atual:** 🟡 Em Revisão  
**Próxima Verificação:** Pós-correção dos erros críticos  
**Responsável:** Time de Desenvolvimento

---

*Este PRD deve ser atualizado a cada sprint e após cada deploy.*