const axios = require('axios');

/**
 * Configuração global do axios para melhorar compatibilidade com APIs
 * que podem estar bloqueando requisições de servidores
 */
const axiosInstance = axios.create({
  // Desabilitar verificação de certificado SSL (use com cuidado)
  // httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
  
  // Configurações de timeout e retry
  timeout: 20000,
  maxRedirects: 5,
  
  // Headers padrão mais realistas
  headers: {
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'DNT': '1'
  },
  
  // Validar status HTTP
  validateStatus: function (status) {
    return status >= 200 && status < 500; // Aceita 2xx, 3xx, 4xx
  }
});

// Interceptor para adicionar logs detalhados (apenas em desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
  axiosInstance.interceptors.request.use(
    config => {
      console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    },
    error => {
      console.error('❌ Erro na requisição:', error.message);
      return Promise.reject(error);
    }
  );

  axiosInstance.interceptors.response.use(
    response => {
      console.log(`📥 ${response.status} ${response.config.url}`);
      return response;
    },
    error => {
      if (error.response) {
        console.error(`❌ ${error.response.status} ${error.config?.url}`);
      } else {
        console.error('❌ Erro sem resposta:', error.message);
      }
      return Promise.reject(error);
    }
  );
}

module.exports = axiosInstance;
