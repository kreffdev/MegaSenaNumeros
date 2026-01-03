# ✅ Interface da Loteca - Implementação Completa

## Arquivos Criados/Modificados:

### 1. **JavaScript**
- ✅ `public/assets/js/loteca.js` - Lógica da interface
  - Carrega jogos da API
  - Gerencia seleção de palpites
  - Gera palpites aleatórios
  - Confirma e salva palpites

### 2. **HTML**
- ✅ `src/views/index.ejs` - Interface adicionada
  - Container da Loteca
  - Header com info do concurso
  - Barra de progresso (0-14 jogos)
  - Lista de 14 jogos com botões 1/X/2
  - Botões de ação (Aleatório, Limpar, Confirmar)

### 3. **CSS**
- ✅ `public/assets/css/global.css` - Estilos completos
  - Layout responsivo
  - Animações e transições
  - Estados de hover e seleção
  - Media queries para mobile

### 4. **Configuração**
- ✅ `public/assets/js/modalidades.js` - Integração
  - Config da Loteca adicionada
  - Toggle entre Loteca e outras modalidades
  - Mostra/esconde interfaces apropriadas

### 5. **Footer**
- ✅ `src/views/includes/footer.ejs` - Script adicionado
  - Carrega loteca.js

## 🎮 Funcionalidades:

### Carregamento Automático
- Ao clicar na Loteca, carrega jogos da API automaticamente
- Exibe concurso, rodada e data de atualização
- Mostra os 14 jogos reais sincronizados com a Caixa

### Seleção de Palpites
- Para cada jogo: 3 botões (1, X, 2)
- Só permite 1 escolha por jogo
- Feedback visual imediato (botão selecionado fica roxo brilhante)

### Barra de Progresso
- Atualiza em tempo real
- Mostra "X de 14 jogos"
- Indicador visual de percentual

### Botões de Ação
1. **🎲 Palpites Aleatórios**: Gera escolhas aleatórias para os 14 jogos
2. **🔄 Limpar**: Remove todas as seleções
3. **✓ Confirmar**: Salva palpites (só habilita com 14 seleções)

### Validações
- Botão Confirmar desabilitado até completar 14 jogos
- Validação no backend (14 palpites obrigatórios)
- Feedback de sucesso/erro

## 🎨 Design:

### Layout
- Cards com gradiente e sombras
- Números do jogo em círculos roxos
- Times exibidos: "Time Casa × Time Visitante"
- Botões de palpite circulares

### Cores
- Roxo vibrante para seleção (#8b5cf6)
- Fundo escuro com transparência
- Verde para botão aleatório
- Estados de hover animados

### Responsivo
- Desktop: Grid com 3 colunas (número, times, opções)
- Tablet: Grid ajustado
- Mobile: Stack vertical, botões menores

## 🔄 Fluxo de Uso:

1. **Usuário clica** no card "Loteca"
2. **Sistema carrega** jogos da API
3. **Exibe** 14 jogos reais do concurso ativo
4. **Usuário escolhe** palpites (1, X ou 2) para cada jogo
5. **Progresso atualiza** a cada seleção
6. **Ao completar 14**, botão Confirmar habilita
7. **Confirmar** salva no backend
8. **Limpa** interface para novo palpite

## 🌐 Endpoints Usados:

```javascript
GET /api/loteca/jogos
// Retorna: { sucesso, dados: { concurso, rodada, jogos[], dataAtualizacao } }

POST /api/loteca/salvar-palpites
// Body: { concurso, palpites: ["1","X","2",...] }
// Retorna: { sucesso, mensagem }
```

## 📱 Testes Recomendados:

1. Clicar no card Loteca e verificar carregamento
2. Fazer palpites manualmente
3. Testar botão Aleatório
4. Verificar progresso
5. Confirmar com 14 palpites
6. Testar responsividade mobile

## 🚀 Para Testar Agora:

1. Iniciar servidor: `npm start`
2. Acessar: `http://localhost:3000`
3. Clicar no card "Loteca" (10º card)
4. Verificar se carrega os 14 jogos
5. Fazer palpites e confirmar
