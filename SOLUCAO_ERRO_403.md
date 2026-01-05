# 🚨 Solução para Erro 403 da API da Caixa em Produção

## Problema Identificado

A API da Caixa (`servicebus2.caixa.gov.br`) está retornando **erro 403 (Forbidden)** quando requisições são feitas a partir do servidor de produção (Render), mas funciona normalmente no localhost.

### Por que isso acontece?

1. **Detecção de Bot/Server**: A API da Caixa detecta que as requisições vêm de um servidor/datacenter e não de um navegador real
2. **Bloqueio por IP**: IPs de servidores em cloud (AWS, Render, etc.) podem estar em listas de bloqueio
3. **Headers Insuficientes**: Falta de headers específicos do navegador
4. **Rate Limiting**: Muitas requisições em sequência podem acionar proteções anti-DDoS

## Soluções Implementadas

### 1. ✅ Sistema de Retry com Backoff Exponencial
- 3 tentativas automáticas por requisição
- Delay progressivo: 1s, 2s, 3s entre tentativas
- Reduz chance de bloqueio temporário

### 2. ✅ Randomização de User-Agent
- Rotação entre 5 User-Agents diferentes
- Simula requisições de diferentes navegadores
- Dificulta identificação de padrão

### 3. ✅ Headers Completos de Navegador Real
- Adicionados todos os headers de um navegador Chrome/Firefox
- Incluindo: `sec-ch-ua`, `sec-fetch-*`, `Origin`, `Referer`
- Maior semelhança com requisição legítima

### 4. ✅ Delay Aleatório Entre Requisições
- 2-4 segundos aleatórios entre cada modalidade
- Evita padrão robótico de requisições
- Reduz risco de rate limiting

### 5. ✅ Configuração Axios Otimizada
- Timeout aumentado para 20s
- Aceita redirecionamentos (maxRedirects: 5)
- Validação de status customizada

## Arquivos Modificados

- ✅ [src/api/ApiLoterias.js](src/api/ApiLoterias.js) - Sistema de retry e randomização
- ✅ [src/api/ApiLototeca.js](src/api/ApiLototeca.js) - Mesmas melhorias para Loteca
- ✅ [src/config/axiosConfig.js](src/config/axiosConfig.js) - Configuração global do Axios
- ✅ [src/config/apiConfig.js](src/config/apiConfig.js) - Configurações centralizadas

## Como Testar

### 1. Commit e Push
```bash
git add .
git commit -m "fix: implementar retry e anti-bloqueio para API da Caixa"
git push origin main
```

### 2. Monitorar Logs no Render
Acesse o dashboard do Render e verifique os logs. Você deve ver:
- ✅ `Sucesso na tentativa X` quando funcionar
- ⏳ `Aguardando Xms antes da tentativa Y...` durante retry
- ⏳ `Aguardando Xms antes da próxima requisição...` entre modalidades

### 3. Verificar Dados na Aplicação
Após deploy, acesse seu site e verifique se os dados das loterias aparecem corretamente.

## Soluções Adicionais (Se Ainda Não Funcionar)

### Opção A: Usar Proxy HTTP
Adicionar proxy ao axios para rotear requisições:
```javascript
const { HttpsProxyAgent } = require('https-proxy-agent');
const agent = new HttpsProxyAgent('http://proxy-server:port');
// Usar o agent nas requisições
```

### Opção B: API Alternativa
Usar APIs públicas alternativas como fallback:
- `loteriascaixa-api.herokuapp.com` (não oficial)
- `brasilapi.com.br/api/caixa`

### Opção C: Serverless Function
Criar uma função serverless (Vercel/Netlify) para fazer as requisições:
- Roda em IP diferente a cada execução
- Menor chance de bloqueio

### Opção D: Cache Agressivo
- Salvar dados no banco e atualizar apenas 1x por dia
- Usar dados em cache quando API falhar
- Reduzir dependência da API da Caixa

## Monitoramento

Adicione variável de ambiente para ativar logs detalhados:
```bash
NODE_ENV=development
```

## Próximos Passos

1. ✅ Fazer deploy e testar
2. ⏳ Monitorar logs por 24h
3. ⏳ Se ainda falhar, implementar Opção B (API alternativa)
4. ⏳ Considerar cache mais agressivo para reduzir requisições

## Notas Importantes

- ⚠️ A API da Caixa não é oficial e pode mudar/bloquear a qualquer momento
- ⚠️ Considere implementar cache em banco de dados para não depender 100% da API
- ⚠️ Monitore os logs regularmente para detectar problemas
- ⚠️ O sistema agora aguarda mais tempo entre requisições (2-4s), então a sincronização inicial pode levar ~30-40 segundos

## Suporte

Se o problema persistir após estas mudanças, considere:
1. Entrar em contato com a Caixa para solicitar acesso oficial à API
2. Usar uma API alternativa de terceiros
3. Implementar scraping do site HTML como fallback (já existe no código)
