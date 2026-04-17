# Plano de Integração: Design Premium GitHub + Lógica Avançada Local

O objetivo é atualizar o `index.html` local com o novo design "Premium" vindo do GitHub, preservando toda a lógica avançada (onboarding Blocos 3 e 4, tracking de 1RM, relatórios de ciclo e histórico de logs) que existe localmente mas não está no GitHub.

## 1. Sistema de Design (CSS)
- Adotar as variáveis `:root` do GitHub (`--orange-dim`, `--orange-glow`, etc.).
- Substituir a seção `<style>` inteira pela estética premium.
- Manter compatibilidade com os IDs locais (`screen-home` vs `s-home`) para evitar quebrar o JS existente, ou mapear as classes adequadamente.

## 2. Estrutura HTML (Telas)
- **Splash**: Layout rico com linhas de funcionalidades.
- **Onboarding**: Manter o chat, mas com visual novo.
- **Home**: Novos cards de Próximo Treino, Grade da Semana e Card de Borg.
- **Progresso**: Integrar o novo gráfico de evolução e barra Nuckols. **Essencial**: Preservar a tabela de Força de Referência 1RM.
- **Perfil**: Novo layout gamificado com estatísticas (Sessões, Sequência, Volume, Nível).
- **Execução**: Novos cards de exercício com inputs de carga e botões de Borg integrados.
- **Tela de Conclusão**: Adotar o `screen-finish` para um encerramento polido.

## 3. Lógica JavaScript
- **System Prompt**: MANTER o prompt local (com Blocos 3 e 4 de recuperação).
- **Dados de Treino**: Manter templates `WK` ou `TEMPLATES` locais (são mais completos).
- **Log e Relatórios**: Preservar lógica de `caleb_session_logs` e `caleb_cycle_reports`.
- **Funções**: 
    - `finishWorkout`: Manter lógica de logs, geração de relatórios e check de deload.
    - `navTo`: Adaptar para os novos IDs de tela se necessário.
    - `callCaleb`: Manter lógica de retry e tratamento de erro local.

## 4. Verificação
- Testar fluxo de onboarding (Blocos 3/4).
- Verificar timer de treino e salvamento.
- Conferir se gráficos e 1RM persistem após a mudança.
