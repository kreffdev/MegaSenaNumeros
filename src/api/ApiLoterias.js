const axios = require('axios');
const ConcursoModel = require('../models/ConcursoModel');

class ApiLoterias {
  constructor() {
    this.urlBase = 'https://servicebus2.caixa.gov.br/portaldeloterias/api';
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

    const url = `${this.urlBase}/${endpoint}`;
    console.log(`🔍 Buscando ${modalidade}:`, url);

    // Tentar com retry (máximo 3 tentativas)
    for (let tentativa = 1; tentativa <= 3; tentativa++) {
      try {
        // Delay progressivo entre tentativas (exceto na primeira)
        if (tentativa > 1) {
          const delayTime = tentativa * 1000; // 1s, 2s, 3s
          console.log(`⏳ Aguardando ${delayTime}ms antes da tentativa ${tentativa}...`);
          await this.delay(delayTime);
        }

        const response = await axios.get(url, {
          headers: {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
            'Accept-Encoding': 'gzip, deflate, br',
            'User-Agent': this.getRandomUserAgent(),
            'Origin': 'https://loterias.caixa.gov.br',
            'Referer': 'https://loterias.caixa.gov.br/',
            'Connection': 'keep-alive',
            'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="122"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-site',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          },
          timeout: 20000,
          maxRedirects: 5,
          validateStatus: (status) => status < 500 // Aceita qualquer status code < 500
        });

        // Verificar se recebeu 403
        if (response.status === 403) {
          console.log(`⚠️ Tentativa ${tentativa}: Recebeu 403 (Forbidden)`);
          if (tentativa < 3) {
            continue; // Tentar novamente
          }
          throw new Error('API bloqueou após 3 tentativas (403)');
        }

        if (response.data && response.status === 200) {
          console.log(`✅ Sucesso na tentativa ${tentativa}`);
          return this.processarDados(modalidade, response.data);
        }

        throw new Error(`Status inesperado: ${response.status}`);
      } catch (error) {
        if (tentativa === 3) {
          // Última tentativa falhou
          console.error(`❌ Erro ao buscar ${modalidade} após ${tentativa} tentativas:`, error.message);
          return this.gerarDadosPadrao(modalidade);
        }
        console.log(`⚠️ Tentativa ${tentativa} falhou: ${error.message}`);
      }
    }

    return this.gerarDadosPadrao(modalidade);
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
        // Delay entre requisições para evitar bloqueio (2-4 segundos aleatório)
        const delayTime = 2000 + Math.random() * 2000;
        console.log(`⏳ Aguardando ${Math.round(delayTime)}ms antes da próxima requisição...`);
        await this.delay(delayTime);
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
