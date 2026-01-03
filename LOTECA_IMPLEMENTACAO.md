# Sistema de Sincronização Automática da Loteca

## ✅ Implementação Concluída

### Componentes Criados:

1. **Model (LotecaModel.js)**
   - Armazena concursos com 14 jogos
   - Campos: concurso, rodada, jogos[], dataAtualizacao, ativo

2. **API (ApiLototeca.js)**
   - Busca dados da API oficial da Caixa
   - Fallback para scraping HTML se API falhar
   - Fallback para jogos padrão se tudo falhar
   - Métodos principais:
     - `buscarConcursoAtual()` - busca da Caixa
     - `sincronizar()` - sincroniza com banco
     - `buscarConcursoAtivo()` - retorna concurso ativo do banco

3. **Serviço (LotecaSyncService.js)**
   - Sincronização automática com cron
   - Roda 3x por dia: 10h, 14h e 18h
   - Backup a cada 6 horas
   - Sincroniza imediatamente ao iniciar servidor

4. **Controller (lotecaController.js)**
   - `obterJogosAtuais` - retorna jogos para frontend
   - `sincronizarManual` - força sincronização
   - `salvarPalpites` - salva escolhas do usuário

5. **Rotas Criadas:**
   - GET `/api/loteca/jogos` - buscar jogos atuais
   - POST `/api/loteca/sincronizar` - sincronizar manualmente
   - POST `/api/loteca/salvar-palpites` - salvar palpites

## 🎯 Como Funciona:

1. **Ao iniciar o servidor**: Sincroniza imediatamente com a Caixa
2. **Automaticamente**: Sincroniza 3x por dia (10h, 14h, 18h)
3. **API da Caixa**: Usa endpoint oficial `https://servicebus2.caixa.gov.br/portaldeloterias/api/loteca`
4. **Fallback inteligente**: Se API falhar, usa jogos padrão para não quebrar

## 📊 Teste Realizado:

✓ API da Caixa retornou Concurso **1226** com 14 jogos
✓ Estrutura de dados funcionando corretamente

## 🔄 Próximos Passos:

1. Criar interface frontend para Loteca
2. Mostrar os 14 jogos reais
3. Permitir seleção de palpites (1, X, 2)
4. Integrar com sistema de apostas existente

## 🚀 Para Testar:

```bash
# Testar API manualmente
node src/api/testarApiLoteca.js

# Iniciar servidor (sincronização roda automaticamente)
npm start
```

## 📝 Endpoints Disponíveis:

```javascript
// Buscar jogos do concurso ativo
GET http://localhost:3000/api/loteca/jogos

// Forçar sincronização
POST http://localhost:3000/api/loteca/sincronizar

// Salvar palpites
POST http://localhost:3000/api/loteca/salvar-palpites
Body: {
  "concurso": 1226,
  "palpites": ["1", "X", "2", "1", "1", "X", "2", "1", "X", "2", "1", "X", "1", "2"]
}
```
