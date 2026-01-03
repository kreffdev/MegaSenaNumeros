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
  }

  /**
   * Busca dados de uma modalidade específica
   */
  async buscarModalidade(modalidade) {
    try {
      const endpoint = this.modalidades[modalidade];
      if (!endpoint) {
        throw new Error(`Modalidade ${modalidade} não encontrada`);
      }

      const url = `${this.urlBase}/${endpoint}`;
      console.log(`🔍 Buscando ${modalidade}:`, url);

      const response = await axios.get(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 15000
      });

      if (response.data) {
        return this.processarDados(modalidade, response.data);
      }

      throw new Error('Resposta vazia da API');
    } catch (error) {
      console.error(`❌ Erro ao buscar ${modalidade}:`, error.message);
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
        // Delay entre requisições para não sobrecarregar a API
        await new Promise(resolve => setTimeout(resolve, 500));
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
