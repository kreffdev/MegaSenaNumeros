const axios = require('axios');
const cheerio = require('cheerio');
const LotecaModel = require('../models/LotecaModel');

class ApiLoteca {
  constructor() {
    this.urlBase = 'https://servicebus2.caixa.gov.br/portaldeloterias/api/loteca';
  }

  /**
   * Busca o concurso atual da Loteca direto da API da Caixa
   */
  async buscarConcursoAtual() {
    try {
      console.log('🔍 Buscando concurso atual da Loteca...');
      
      // Endpoint da API pública da Caixa
      const response = await axios.get(this.urlBase, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });

      if (response.data) {
        // Verificar se o concurso já foi sorteado
        const dataApuracao = response.data.dataApuracao;
        const jaFoiSorteado = dataApuracao && this.verificarSeJaPassou(dataApuracao);
        
        if (jaFoiSorteado) {
          console.log(`⚠️ Concurso ${response.data.numero} já foi sorteado em ${dataApuracao}`);
          console.log(`📅 Próximo concurso: ${response.data.numeroConcursoProximo} (${response.data.dataProximoConcurso})`);
          
          // Retornar indicando que não há jogos disponíveis
          return {
            concurso: response.data.numeroConcursoProximo || response.data.numero + 1,
            rodada: `Concurso ${response.data.numeroConcursoProximo || response.data.numero + 1}`,
            jogos: [],
            semJogosDisponiveis: true,
            mensagem: 'Jogos ainda não disponíveis para o próximo concurso',
            dataProximoConcurso: response.data.dataProximoConcurso,
            valorEstimado: response.data.valorEstimadoProximoConcurso || 0
          };
        }
        
        return this.processarDadosCaixa(response.data);
      }

      throw new Error('Resposta vazia da API');
    } catch (error) {
      console.error('❌ Erro ao buscar dados da Caixa:', error.message);
      
      // Fallback: tentar scraping do site HTML
      return await this.buscarPorScraping();
    }
  }

  /**
   * Verifica se uma data já passou
   */
  verificarSeJaPassou(dataString) {
    try {
      // Formato: DD/MM/YYYY
      const [dia, mes, ano] = dataString.split('/').map(Number);
      const dataApuracao = new Date(ano, mes - 1, dia);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      return dataApuracao < hoje;
    } catch (error) {
      console.error('Erro ao verificar data:', error);
      return false;
    }
  }

  /**
   * Processa dados retornados pela API da Caixa
   */
  processarDadosCaixa(data) {
    try {
      const jogos = [];
      
      // A API da Caixa retorna os jogos em listaResultadoEquipeEsportiva
      if (data.listaResultadoEquipeEsportiva && Array.isArray(data.listaResultadoEquipeEsportiva)) {
        data.listaResultadoEquipeEsportiva.forEach((jogo, index) => {
          jogos.push({
            numeroJogo: jogo.nuSequencial || index + 1,
            timeCasa: jogo.nomeEquipeUm || `Time ${index + 1}`,
            timeVisitante: jogo.nomeEquipeDois || `Time ${index + 1}`,
            dataHoraJogo: `${jogo.dtJogo || ''} - ${jogo.diaSemana || ''}`,
            resultado: this.calcularResultado(jogo.nuGolEquipeUm, jogo.nuGolEquipeDois),
            placar: `${jogo.nuGolEquipeUm || 0} x ${jogo.nuGolEquipeDois || 0}`
          });
        });
      }

      // Fallback se não encontrou jogos
      if (jogos.length === 0) {
        console.warn('⚠ Nenhum jogo encontrado, usando dados padrão');
        return {
          concurso: data.numero || 1,
          rodada: `Concurso ${data.numero || 1}`,
          jogos: this.gerarJogosPadrao(),
          dataApuracao: data.dataApuracao || '',
          proximoConcurso: data.numeroConcursoProximo || 0
        };
      }

      return {
        concurso: data.numero || 1,
        rodada: `Concurso ${data.numero} - Jogo ${data.numeroJogo || ''}`,
        jogos: jogos,
        dataApuracao: data.dataApuracao || '',
        proximoConcurso: data.numeroConcursoProximo || 0,
        valorEstimado: data.valorEstimadoProximoConcurso || 0
      };
    } catch (error) {
      console.error('Erro ao processar dados:', error);
      return {
        concurso: 1,
        rodada: 'Concurso 1',
        jogos: this.gerarJogosPadrao()
      };
    }
  }

  /**
   * Scraping do site HTML como fallback
   */
  async buscarPorScraping() {
    try {
      console.log('🔍 Tentando scraping do site da Caixa...');
      
      const response = await axios.get('https://loterias.caixa.gov.br/Paginas/Loteca.aspx', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      const jogos = [];
      
      // Tentar extrair jogos do HTML
      // A estrutura exata depende do site atual da Caixa
      $('.jogo-loteca').each((index, element) => {
        if (index < 14) {
          const timeCasa = $(element).find('.time-casa').text().trim();
          const timeVisitante = $(element).find('.time-visitante').text().trim();
          
          jogos.push({
            numeroJogo: index + 1,
            timeCasa: timeCasa || `Time Casa ${index + 1}`,
            timeVisitante: timeVisitante || `Time Visitante ${index + 1}`,
            dataHoraJogo: ''
          });
        }
      });

      if (jogos.length === 0) {
        console.log('⚠️ Scraping não encontrou jogos, usando dados padrão');
        return {
          concurso: 1,
          rodada: 'Concurso 1',
          jogos: this.gerarJogosPadrao()
        };
      }

      return {
        concurso: 1,
        rodada: 'Concurso Atual',
        jogos
      };
    } catch (error) {
      console.error('❌ Erro no scraping:', error.message);
      return {
        concurso: 1,
        rodada: 'Concurso 1',
        jogos: this.gerarJogosPadrao()
      };
    }
  }

  /**
   * Calcula o resultado baseado nos gols (1=Casa, X=Empate, 2=Visitante)
   */
  calcularResultado(golsCasa, golsVisitante) {
    if (golsCasa === null || golsVisitante === null) return null;
    if (golsCasa > golsVisitante) return '1';
    if (golsCasa < golsVisitante) return '2';
    return 'X';
  }

  /**
   * Gera 14 jogos padrão quando não consegue buscar da Caixa
   */
  gerarJogosPadrao() {
    const times = [
      ['Flamengo', 'Palmeiras'],
      ['Corinthians', 'São Paulo'],
      ['Santos', 'Grêmio'],
      ['Internacional', 'Atlético-MG'],
      ['Fluminense', 'Botafogo'],
      ['Cruzeiro', 'Vasco'],
      ['Athletico-PR', 'Bahia'],
      ['Fortaleza', 'Goiás'],
      ['Ceará', 'Sport'],
      ['América-MG', 'Coritiba'],
      ['Red Bull Bragantino', 'Cuiabá'],
      ['Atlético-GO', 'Avaí'],
      ['Juventude', 'Chapecoense'],
      ['CRB', 'Náutico']
    ];

    return times.map((times, index) => ({
      numeroJogo: index + 1,
      timeCasa: times[0],
      timeVisitante: times[1],
      dataHoraJogo: 'A definir'
    }));
  }

  /**
   * Salva ou atualiza o concurso no banco de dados
   */
  async salvarConcurso(dadosConcurso) {
    try {
      console.log(`💾 Salvando concurso ${dadosConcurso.concurso}...`);

      // Desativar concursos anteriores
      await LotecaModel.updateMany(
        { ativo: true },
        { ativo: false }
      );

      // Verificar se já existe
      const existente = await LotecaModel.findOne({ concurso: dadosConcurso.concurso });

      if (existente) {
        // Atualizar apenas se houver mudanças
        existente.rodada = dadosConcurso.rodada;
        existente.jogos = dadosConcurso.jogos || [];
        existente.semJogosDisponiveis = dadosConcurso.semJogosDisponiveis || false;
        existente.mensagem = dadosConcurso.mensagem || '';
        existente.dataProximoConcurso = dadosConcurso.dataProximoConcurso || '';
        existente.valorEstimado = dadosConcurso.valorEstimado || 0;
        existente.dataAtualizacao = new Date();
        existente.ativo = true;
        await existente.save();
        console.log(`✓ Concurso ${dadosConcurso.concurso} atualizado (${dadosConcurso.semJogosDisponiveis ? 'sem jogos ainda' : `${dadosConcurso.jogos.length} jogos`})`);
        return existente;
      } else {
        // Criar novo
        const novoConcurso = await LotecaModel.create({
          concurso: dadosConcurso.concurso,
          rodada: dadosConcurso.rodada,
          jogos: dadosConcurso.jogos || [],
          semJogosDisponiveis: dadosConcurso.semJogosDisponiveis || false,
          mensagem: dadosConcurso.mensagem || '',
          dataProximoConcurso: dadosConcurso.dataProximoConcurso || '',
          valorEstimado: dadosConcurso.valorEstimado || 0,
          ativo: true
        });
        console.log('✓ Novo concurso criado');
        return novoConcurso;
      }
    } catch (error) {
      console.error('❌ Erro ao salvar concurso:', error);
      throw error;
    }
  }

  /**
   * Sincroniza dados da Caixa com o banco
   */
  async sincronizar() {
    try {
      console.log('🔄 Iniciando sincronização da Loteca...');
      const dados = await this.buscarConcursoAtual();
      const resultado = await this.salvarConcurso(dados);
      console.log('✓ Sincronização concluída');
      return resultado;
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      throw error;
    }
  }

  /**
   * Busca o concurso ativo do banco de dados
   */
  async buscarConcursoAtivo() {
    try {
      const concurso = await LotecaModel.findOne({ ativo: true }).sort({ concurso: -1 });
      
      if (!concurso) {
        console.log('⚠️ Nenhum concurso ativo encontrado, sincronizando...');
        return await this.sincronizar();
      }

      return concurso;
    } catch (error) {
      console.error('❌ Erro ao buscar concurso ativo:', error);
      throw error;
    }
  }
}

module.exports = new ApiLoteca();
