const axios = require('axios');
const ConcursoModel = require('../models/ConcursoModel');

class ApiLoterias {
  constructor() {
    this.urlBase = 'https://servicebus2.caixa.gov.br/portaldeloterias/api';
    // APIs alternativas que não bloqueiam servidores
    this.urlAlternativa = 'https://loteriascaixa-api.herokuapp.com/api';
    // API pública confiável (outra alternativa)
    this.urlLoteAPI = 'https://loteriascaixa-api.herokuapp.com/api';
    
    this.modalidades = {
      megasena: 'megasena',
      lotofacil: 'lotofacil',
      quina: 'quina',
      lotomania: 'lotomania',
      duplasena: 'duplasena',
      diadesorte: 'diadesorte',
      timemania: 'timemania',
      maismilionaria: 'maismilionaria',
      supersete: 'supersete'
    };
    
    // Mapeamento para API alternativa 1 (com /latest)
    this.modalidadesAlternativas = {
      megasena: 'megasena',
      lotofacil: 'lotofacil',
      quina: 'quina',
      lotomania: 'lotomania',
      duplasena: 'duplasena',
      diadesorte: 'diadesorte',
      timemania: 'timemania',
      maismilionaria: 'maismilionaria',
      supersete: 'supersete'
    };
    
    // Mapeamento para outra API (formato com hífen)
    this.modalidadesHifen = {
      megasena: 'mega-sena',
      lotofacil: 'lotofacil',
      quina: 'quina',
      lotomania: 'lotomania',
      duplasena: 'dupla-sena',
      diadesorte: 'dia-de-sorte',
      timemania: 'timemania',
      maismilionaria: '+milionaria',
      supersete: 'super-sete'
    };
    
    // Lista de User-Agents para rotacionar e evitar bloqueio
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0'
    ];
  }

  /**
   * Função helper para adicionar delay entre requisições
   */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Retorna um User-Agent aleatório da lista
   */
  getRandomUserAgent() {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  /**
   * Busca dados de uma modalidade específica com retry e estratégias anti-bloqueio
   */
  async buscarModalidade(modalidade) {
    const endpoint = this.modalidades[modalidade];
    if (!endpoint) {
      throw new Error(`Modalidade ${modalidade} não encontrada`);
    }

    // Tentar API principal da Caixa primeiro (apenas 1 tentativa para não perder tempo)
    const url = `${this.urlBase}/${endpoint}`;
    console.log(`🔍 Buscando ${modalidade}:`, url);

    try {
      const response = await axios.get(url, {
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'pt-BR,pt;q=0.9',
          'User-Agent': this.getRandomUserAgent(),
          'Origin': 'https://loterias.caixa.gov.br',
          'Referer': 'https://loterias.caixa.gov.br/'
        },
        timeout: 8000,
        validateStatus: (status) => status < 500
      });

      if (response.status === 200 && response.data) {
        console.log(`✅ API Caixa funcionou para ${modalidade}`);
        return this.processarDados(modalidade, response.data);
      }
      
      if (response.status === 403) {
        console.log(`⚠️ API Caixa bloqueou (403) - usando API alternativa...`);
      }
    } catch (error) {
      console.log(`⚠️ Erro na API Caixa: ${error.message} - tentando alternativa...`);
    }

    // Se falhou, tentar API alternativa
    return await this.buscarModalidadeAlternativa(modalidade);
  }

  /**
   * Busca dados usando API alternativa (loteriascaixa-api)
   */
  async buscarModalidadeAlternativa(modalidade) {
    const endpointAlt = this.modalidadesAlternativas[modalidade];
    const endpointHifen = this.modalidadesHifen[modalidade];
    
    if (!endpointAlt) {
      console.error(`❌ Modalidade ${modalidade} não tem alternativa`);
      return this.gerarDadosPadrao(modalidade);
    }

    // Tentativa 1: API alternativa com /latest
    try {
      const urlAlt = `${this.urlAlternativa}/${endpointAlt}/latest`;
      console.log(`🔄 Tentando API alternativa (1):`, urlAlt);

      const response = await axios.get(urlAlt, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': this.getRandomUserAgent()
        },
        validateStatus: (status) => status < 500
      });

      if (response.status === 200 && response.data) {
        console.log(`✅ API alternativa (1) funcionou para ${modalidade}`);
        console.log(`📊 Dados: Concurso ${response.data.concurso || response.data.numero || 'N/A'}`);
        return this.processarDadosAlternativos(modalidade, response.data);
      }
    } catch (error) {
      console.log(`⚠️ Tentativa 1 falhou: ${error.message}`);
    }

    // Tentativa 2: API alternativa sem /latest
    try {
      const urlAlt2 = `${this.urlAlternativa}/${endpointAlt}`;
      console.log(`🔄 Tentando API alternativa (2):`, urlAlt2);

      const response = await axios.get(urlAlt2, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.data) {
        console.log(`✅ API alternativa (2) funcionou para ${modalidade}`);
        return this.processarDadosAlternativos(modalidade, response.data);
      }
    } catch (error) {
      console.log(`⚠️ Tentativa 2 falhou: ${error.message}`);
    }

    // Tentativa 3: Usando formato com hífen
    if (endpointHifen) {
      try {
        const urlHifen = `${this.urlLoteAPI}/${endpointHifen}/latest`;
        console.log(`🔄 Tentando com hífen (3):`, urlHifen);

        const response = await axios.get(urlHifen, {
          timeout: 10000,
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.data) {
          console.log(`✅ Formato hífen funcionou para ${modalidade}`);
          return this.processarDadosAlternativos(modalidade, response.data);
        }
      } catch (error) {
        console.log(`⚠️ Tentativa 3 falhou: ${error.message}`);
      }
    }

    // Se tudo falhou, usar dados padrão
    console.error(`❌ Todas as tentativas falharam para ${modalidade}`);
    return this.gerarDadosPadrao(modalidade);
  }

  /**
   * Processa dados da API alternativa
   */
  processarDadosAlternativos(modalidade, data) {
    try {
      const dadosProcessados = {
        modalidade: modalidade,
        numeroConcurso: data.concurso || data.numero || data.numeroConcurso || 0,
        dataApuracao: data.data || data.dataApuracao || data.dataSorteio || '',
        dataSorteio: data.dataProximoConcurso || data.proximoConcurso?.data || '',
        valorEstimadoProximoConcurso: data.valorEstimadoProximoConcurso || data.proximoConcurso?.valorEstimado || data.premiacaoEstimada || 0,
        numerossorteados: data.dezenas || data.listaDezenas || data.numerosSorteados || data.numeros || [],
        valorArrecadado: data.valorArrecadado || data.arrecadacaoTotal || 0,
        acumulou: data.acumulou || data.acumulada || false,
        valorAcumuladoConcurso: data.valorAcumuladoConcursoEspecial || data.valorAcumuladoProximoConcurso || data.valorAcumulado || 0
      };

      // Campos específicos por modalidade
      if (modalidade === 'diadesorte' && (data.mesSorte || data.mes)) {
        dadosProcessados.mesSorte = data.mesSorte || data.mes;
      }

      if (modalidade === 'timemania' && (data.nomeTimeCoracao || data.timeCoracao)) {
        dadosProcessados.nomeTimeCoracao = data.nomeTimeCoracao || data.timeCoracao;
      }

      if (modalidade === 'maismilionaria' && (data.trevos || data.listaTrevos)) {
        dadosProcessados.trevos = data.trevos || data.listaTrevos;
      }

      console.log(`📦 Processados ${dadosProcessados.numerossorteados.length} números do concurso ${dadosProcessados.numeroConcurso}`);
      return dadosProcessados;
    } catch (error) {
      console.error(`Erro ao processar dados alternativos de ${modalidade}:`, error);
      return this.gerarDadosPadrao(modalidade);
    }
  }

  /**
   * Processa dados retornados pela API
   */
  processarDados(modalidade, data) {
    try {
      const dadosProcessados = {
        modalidade: modalidade,
        numeroConcurso: data.numero || 0,
        dataApuracao: data.dataApuracao || '',
        dataSorteio: data.dataProximoConcurso || '',
        valorEstimadoProximoConcurso: data.valorEstimadoProximoConcurso || 0,
        numerossorteados: [],
        valorArrecadado: data.valorArrecadado || 0,
        acumulou: data.acumulou || false,
        valorAcumuladoConcurso: data.valorAcumuladoConcursoEspecial || data.valorAcumuladoProximoConcurso || 0
      };

      // Processar números sorteados
      if (data.listaDezenas && Array.isArray(data.listaDezenas)) {
        dadosProcessados.numerossorteados = data.listaDezenas;
      } else if (data.dezenas && Array.isArray(data.dezenas)) {
        dadosProcessados.numerossorteados = data.dezenas;
      }

      // Campos específicos por modalidade
      if (modalidade === 'diadesorte' && data.mesSorte) {
        dadosProcessados.mesSorte = data.mesSorte;
      }

      if (modalidade === 'timemania' && data.nomeTimeCoracao) {
        dadosProcessados.nomeTimeCoracao = data.nomeTimeCoracao;
      }

      if (modalidade === 'maismilionaria' && data.listaTrevos) {
        dadosProcessados.trevos = data.listaTrevos;
      }

      return dadosProcessados;
    } catch (error) {
      console.error(`Erro ao processar dados de ${modalidade}:`, error);
      return this.gerarDadosPadrao(modalidade);
    }
  }

  /**
   * Gera dados padrão quando API falha
   */
  gerarDadosPadrao(modalidade) {
    return {
      modalidade: modalidade,
      numeroConcurso: 1,
      dataApuracao: new Date().toLocaleDateString('pt-BR'),
      dataSorteio: '',
      valorEstimadoProximoConcurso: 0,
      numerossorteados: [],
      valorArrecadado: 0,
      acumulou: false,
      valorAcumuladoConcurso: 0
    };
  }

  /**
   * Salva ou atualiza dados no banco
   */
  async salvarConcurso(dados) {
    try {
      const existente = await ConcursoModel.findOne({ modalidade: dados.modalidade });

      if (existente) {
        Object.assign(existente, dados);
        existente.dataAtualizacao = new Date();
        await existente.save();
        console.log(`✓ ${dados.modalidade} atualizado - Concurso ${dados.numeroConcurso}`);
        return existente;
      } else {
        const novo = await ConcursoModel.create(dados);
        console.log(`✓ ${dados.modalidade} criado - Concurso ${dados.numeroConcurso}`);
        return novo;
      }
    } catch (error) {
      console.error(`❌ Erro ao salvar ${dados.modalidade}:`, error);
      throw error;
    }
  }

  /**
   * Sincroniza uma modalidade específica
   */
  async sincronizarModalidade(modalidade) {
    try {
      const dados = await this.buscarModalidade(modalidade);
      return await this.salvarConcurso(dados);
    } catch (error) {
      console.error(`❌ Erro ao sincronizar ${modalidade}:`, error);
      return null;
    }
  }

  /**
   * Sincroniza todas as modalidades
   */
  async sincronizarTodas() {
    console.log('🔄 Iniciando sincronização de todas as modalidades...');
    
    const modalidades = Object.keys(this.modalidades);
    const resultados = [];

    for (const modalidade of modalidades) {
      try {
        const resultado = await this.sincronizarModalidade(modalidade);
        if (resultado) {
          resultados.push(resultado);
        }
        // Delay pequeno entre requisições (1 segundo fixo)
        await this.delay(1000);
      } catch (error) {
        console.error(`Erro em ${modalidade}:`, error);
      }
    }

    console.log(`✓ Sincronização concluída: ${resultados.length}/${modalidades.length} modalidades`);
    return resultados;
  }

  /**
   * Busca todos os concursos do banco
   */
  async buscarTodosConcursos() {
    try {
      return await ConcursoModel.find().sort({ modalidade: 1 });
    } catch (error) {
      console.error('Erro ao buscar concursos:', error);
      return [];
    }
  }

  /**
   * Busca concurso de uma modalidade específica
   */
  async buscarConcursoPorModalidade(modalidade) {
    try {
      return await ConcursoModel.findOne({ modalidade });
    } catch (error) {
      console.error(`Erro ao buscar ${modalidade}:`, error);
      return null;
    }
  }
}

module.exports = new ApiLoterias();
