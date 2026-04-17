# Melhores Melhorias para CALEB.IA

**Priorizadas por impacto e urgência**  
**Data:** 13/04/2026

---

## 🔥 PRIORIDADE CRÍTICA (CORRIGIR AGORA)

### 1. Corrigir API Gemini — System Instruction
**Arquivo:** `api/chat.js:20`
```js
// ANTES (errado):
system_instruction: { parts: [{ text: system || '' }] }

// DEPOIS (correto):
systemInstruction: { parts: [{ text: system || '' }] }
```
**Por que:** API do Gemini 2.0 requer camelCase e formato correto
**Impacto:** Alto - sem isso a AI não recebe instruções corretas

---

### 2. Tratamento Robusto de JSON.parse
**Arquivos:** `index.html:957, 1086, 1214`
```js
// ANTES:
const sessions = JSON.parse(localStorage.getItem('caleb_sessions')||'[]');

// DEPOIS:
const sessions = (() => {
  try {
    return JSON.parse(localStorage.getItem('caleb_sessions')) || [];
  } catch {
    return [];
  }
})();
```
**Por que:** Evita crashes se localStorage estiver corrompido
**Impacto:** Alto - evita quebra de aplicação

---

### 3. Eliminar Risco XSS
**Arquivo:** `index.html:1261-1278`
```js
// ANTES:
appendBubble('chat-messages','caleb', reply);

// DEPOIS:
const wrap = document.createElement('div');
wrap.className = 'bubble-wrap';
wrap.innerHTML = `<div class="avatar-c">C</div><div class="bubble caleb">${escapeHtml(reply)}</div>`;
c.appendChild(wrap);

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
```
**Por que:** Remove risco de XSS ao usar innerHTML
**Impacto:** Médio-Alto - segurança do usuário

---

### 4. Completar Protocolo 002
**Arquivo:** `index.html:744-752`
```js
// Adicionar exercícios faltantes no protocolo 002:
D: { 
  title:'Treino D', 
  sub:'Ombros + Core', 
  rir:'RIR 1', 
  exercises:[
    // Adicionar os exercícios que estão faltando
    {name:'Elevação Lateral com Cabos', ...},
    {name:'Crucifixo Invertido', ...},
    // etc...
  ]
}
```
**Por que:** Completa a base de dados de treinos
**Impacto:** Médio - funcionalidade incompleta

---

## 🚀 PRIORIDADE ALTA (FAZER EM BREVE)

### 5. Salvar Pesos dos Exercícios
**Função:** `finishWorkout()` (linha ~1157)
```js
// Salvar pesos em localStorage:
function saveWorkoutWeights(workoutData) {
  const workouts = JSON.parse(localStorage.getItem('caleb_workouts') || '{}');
  workouts[new Date().toISOString()] = workoutData;
  localStorage.setItem('caleb_workouts', JSON.stringify(workouts));
}

// Na função finishWorkout():
const workoutWeights = [];
document.querySelectorAll('.set-input').forEach((input, idx) => {
  const weight = input.value;
  if (weight) {
    workoutWeights.push({exercise: wk.exercises[idx].name, weight: parseFloat(weight)});
  }
});
saveWorkoutWeights(workoutWeights);
```
**Por que:** Permite rastrear progressão real dos pesos
**Impacto:** Alto - funcionalidade essencial para app de treino

---

### 6. Implementar Retry na API
**Arquivo:** `api/chat.js` e `index.html:callCaleb()`
```js
// Nova função de retry:
async function callCalebWithRetry(messages, system, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await callCaleb(messages, system);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

// Substituir chamadas existentes:
const reply = await callCalebWithRetry(onboardingHistory, SYSTEM);
```
**Por que:** Melhora experiência do usuário com falhas de rede
**Impacto:** Médio-Alto - UX muito melhorada

---

### 7. Desabilitar Botões Durante Loading
**Funções:** `sendOnboarding()` e `sendChat()`
```js
// Adicionar botão disabled:
function setLoading(isLoading) {
  const buttons = document.querySelectorAll('.chat-send-btn, .btn-primary');
  buttons.forEach(btn => {
    btn.disabled = isLoading;
    btn.style.opacity = isLoading ? '0.5' : '';
  });
}

// Usar:
showLoader('Caleb está pensando...');
setLoading(true);
try {
  const reply = await callCaleb(...);
} finally {
  hideLoader();
  setLoading(false);
}
```
**Por que:** Evita múltiplas requisições concorrentes
**Impacto:** Médio - UX melhorada

---

### 8. Gerar Dados Dinâmicos de Progresso
**Função:** `updateChart()` e `updateMetrics()`
```js
// Gerar semana dinamicamente:
function generateWeekGrid() {
  const sessions = JSON.parse(localStorage.getItem('caleb_sessions') || '[]');
  const today = new Date();
  const weekDays = [];
  
  // Gerar grid da semana baseado em sessões completadas
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - (today.getDay() - i));
    const hasSession = sessions.some(s => 
      new Date(s.date).toDateString() === date.toDateString()
    );
    weekDays.push({date, hasSession});
  }
  
  return weekDays;
}

// Atualizar funções:
function updateProgressCharts() {
  const weekData = generateWeekGrid();
  // Renderizar grid dinamicamente
}
```
**Por que:** Progresso real em vez de dados hardcoded
**Impacto:** Alto - valor real do app

---

## 🎯 PRIORIDADE MÉDIA (IMPLEMENTAR DEPOIS)

### 9. Sistema de Ciclos e Semanas
**Função:** `updateNextWorkoutCard()` (linha ~953)
```js
// Implementar lógica de ciclos:
function getCurrentCycle() {
  const sessions = JSON.parse(localStorage.getItem('caleb_sessions') || '[]');
  const weeksCompleted = Math.floor(sessions.length / 4);
  const currentWeek = (sessions.length % 4) + 1;
  
  return {
    cycle: weeksCompleted + 1,
    week: currentWeek,
    totalWeeks: 4,
    isDeloadWeek: currentWeek === 4
  };
}

// Atualizar UI:
const cycle = getCurrentCycle();
document.getElementById('home-cycle-badge').textContent = 
  `Ciclo ${cycle.cycle} — Semana ${cycle.week} de ${cycle.totalWeeks}`;
```
**Por que:** Progressão real do programa de treino
**Impacto:** Alto - funcionalidade core

---

### 10. Deload Automático
**Função:** `finishWorkout()` (linha ~1157)
```js
// Verificar necessidade de deload:
function shouldTriggerDeload() {
  const recentSessions = JSON.parse(localStorage.getItem('caleb_sessions') || '[]')
    .slice(-3); // Últimas 3 sessões
  
  const avgBorg = recentSessions.reduce((sum, s) => sum + (s.avgBorg || 0), 0) / recentSessions.length;
  return avgBorg >= 8.5; // Limite para deload
}

// Aplicar:
if (shouldTriggerDeload()) {
  showNotification('Recomendado: Deload nesta semana (-40% volume)');
  // Aplicar redução de volume automaticamente
}
```
**Por que:** Recuperação baseada em dados do usuário
**Impacto:** Médio - prevenção de overtraining

---

## 🔧 PRIORIDADE BAIXA (MELHORIAS MENORES)

### 11. Limpar Intervals (Memory Leak)
**Função:** `init()` (linha ~776)
```js
// Limpar intervals:
let timeUpdateInterval;

function init() {
  // Limpar interval anterior se existir
  if (timeUpdateInterval) clearInterval(timeUpdateInterval);
  
  timeUpdateInterval = setInterval(updateAllTimes, 30000);
  
  // Limpar na saída da página
  window.addEventListener('beforeunload', () => {
    clearInterval(timeUpdateInterval);
    clearInterval(workoutTimer);
  });
}
```
**Por que:** Evita memory leaks
**Impacto:** Baixo - performance em longo prazo

---

### 12. Duração Consistente
**Função:** `defaultProfile()` (linha ~936)
```js
// Padronizar duração:
function parseDuration(duration) {
  if (typeof duration === 'number') return duration;
  if (typeof duration === 'string') {
    const match = duration.match(/(\d+)/);
    return match ? parseInt(match[1]) : 60;
  }
  return 60;
}

// Usar:
const duration = parseDuration(userProfile.duracao);
```
**Por que:** Evita inconsistências de dados
**Impacto:** Baixo - prevenção de bugs

---

### 13. Melhor UX em Erros
**Funções:** `sendOnboarding()` e `sendChat()`
```js
// Sistema de notificações:
function showError(message, type = 'error') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => notification.remove(), 5000);
}

// Usar:
catch(e) {
  hideLoader();
  showError(`Erro: ${e.message}`, 'error');
}
```
**Por que:** Feedback visual melhor
**Impacto:** Baixo - UX aprimorada

---

## 🎯 IMPLEMENTAÇÃO SUGERIDA (ORDEM)

1. **Fase 1:** Items 1-4 (Erros críticos)
2. **Fase 2:** Items 5-8 (Funcionalidades essenciais)
3. **Fase 3:** Items 9-10 (Sistema inteligente)
4. **Fase 4:** Items 11-13 (Polimento)

**Tempo estimado:** 3-4 dias para implementação completa