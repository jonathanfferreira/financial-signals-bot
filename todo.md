# TODO - Bot de Sinais Financeiros

## Funcionalidades Principais

### Backend
- [x] Configurar schema do banco de dados para sinais, ativos e histórico
- [x] Implementar lógica de análise de indicadores técnicos (EMA, RSI, BBANDS, MACD)
- [x] Criar endpoint para buscar dados de ativos usando yfinance
- [x] Criar endpoint para análise de sinais em tempo real
- [x] Criar endpoint para histórico de sinais gerados
- [ ] Implementar sistema de notificações (Telegram opcional)
- [ ] Criar job automático para análise periódica (a cada 5 minutos)

### Frontend
- [x] Design sofisticado e tecnológico com tema dark
- [x] Dashboard principal com visualização de sinais ativos
- [x] Painel de seleção de ativos para monitoramento
- [ ] Visualização de gráficos com indicadores técnicos
- [x] Histórico de sinais gerados com filtros
- [ ] Painel de configurações (intervalo de análise, ativos monitorados)
- [ ] Sistema de notificações em tempo real
- [x] Responsividade completa para mobile e desktop
- [x] Animações e transições suaves

### Integrações
- [x] Integração com API de dados financeiros (yfinance via backend)
- [x] Sistema de autenticação para usuários
- [x] Armazenamento de preferências do usuário

## Melhorias Futuras
- [ ] Backtesting de estratégias
- [ ] Alertas customizáveis por usuário
- [ ] Exportação de relatórios
- [ ] Integração com múltiplas corretoras
