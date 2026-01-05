/**
 * Configuração de APIs e endpoints alternativos para loterias
 */

module.exports = {
  // API Principal da Caixa
  caixa: {
    base: 'https://servicebus2.caixa.gov.br/portaldeloterias/api',
    timeout: 20000,
    retries: 3
  },

  // APIs alternativas (fallback)
  alternativas: {
    // API não oficial que faz scraping
    loteriasAPI: {
      base: 'https://loteriascaixa-api.herokuapp.com/api',
      enabled: true
    },
    
    // Outra alternativa
    brasilAPI: {
      base: 'https://brasilapi.com.br/api/caixa/v1',
      enabled: false // Desabilitado por padrão, habilitar se necessário
    }
  },

  // Configurações de requisição
  request: {
    // Delay entre requisições (ms)
    minDelay: 2000,
    maxDelay: 4000,
    
    // Tentar APIs alternativas se Caixa falhar?
    usarFallback: true,
    
    // User-Agents para rotação
    userAgents: [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0'
    ]
  },

  // Mapeamento de modalidades
  modalidades: {
    megasena: 'megasena',
    lotofacil: 'lotofacil',
    quina: 'quina',
    lotomania: 'lotomania',
    duplasena: 'duplasena',
    diadesorte: 'diadesorte',
    timemania: 'timemania',
    maismilionaria: 'maismilionaria',
    supersete: 'supersete',
    loteca: 'loteca'
  }
};
