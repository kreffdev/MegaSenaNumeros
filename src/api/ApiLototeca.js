const axios = require('axios');
const cheerio = require('cheerio');
const LotecaModel = require('../models/LotecaModel');

class ApiLoteca {
  constructor() {
    this.urlBase = 'https://servicebus2.caixa.gov.br/portaldeloterias/api/loteca';
    
    // Lista de User-Agents para rotacionar
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    ];
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getRandomUserAgent() {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }

  /**
   * Busca o concurso atual da Loteca direto da API da Caixa com retry
   */
  async buscarConcursoAtual() {
    console.log('🔍 Buscando concurso atual da Loteca...');
    
    // Tentar API da Caixa primeiro (apenas 1 tentativa)
    try {
      const response = await axios.get(this.urlBase, {
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': this.getRandomUserAgent(),
          'Origin': 'https://loterias.caixa.gov.br',
          'Referer': 'https://loterias.caixa.gov.br/'
        },
        timeout: 8000,
        validateStatus: (status) => status < 500
      });

      if (response.status === 200 && response.data) {
        console.log(`✅ API Caixa funcionou para Loteca`);
        
        // Verificar se o concurso já foi sorteado
        const dataApuracao = response.data.dataApuracao;
        const jaFoiSorteado = dataApuracao && this.verificarSeJaPassou(dataApuracao);
        
        if (jaFoiSorteado) {
          console.log(`⚠️ Concurso ${response.data.numero} já foi sorteado em ${dataApuracao}`);
          console.log(`📅 Próximo concurso: ${response.data.numeroConcursoProximo} (${response.data.dataProximoConcurso})`);
          
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
      
      if (response.status === 403) {
        console.log(`⚠️ API Caixa bloqueou (403) - tentando scraping...`);
      }
    } catch (error) {
      console.log(`⚠️ Erro na API Caixa: ${error.message}`);
    }

    // Se API Caixa falhou, tentar scraping
    console.log('🔍 Tentando scraping do site da Caixa...');
    return await this.buscarPorScraping();
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

      // Se não encontrou jogos, retornar indicando que não há jogos disponíveis
      if (jogos.length === 0) {
        console.warn('⚠ Nenhum jogo encontrado na API da Caixa');
        return {
          concurso: data.numero || 1,
          rodada: `Concurso ${data.numero || 1}`,
          jogos: [],
          semJogosDisponiveis: true,
          mensagem: 'Jogos ainda não disponíveis para este concurso',
          dataProximoConcurso: data.dataProximoConcurso || '',
          valorEstimado: data.valorEstimadoProximoConcurso || 0
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
        jogos: [],
        semJogosDisponiveis: true,
        mensagem: 'Erro ao buscar jogos. Tente novamente mais tarde.'
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
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Upgrade-Insecure-Requests': '1',
          'Cache-Control': 'max-age=0'
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
        console.log('⚠️ Scraping não encontrou jogos - aguardando disponibilização');
        return {
          concurso: 1,
          rodada: 'Aguardando Divulgação',
          jogos: [],
          semJogosDisponiveis: true,
          mensagem: 'Jogos ainda não foram divulgados pela Caixa. Tente novamente mais tarde.'
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
        rodada: 'Erro ao Carregar',
        jogos: [],
        semJogosDisponiveis: true,
        mensagem: 'Não foi possível carregar os jogos. Verifique sua conexão e tente novamente.'
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
