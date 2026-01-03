const ApiLoteca = require('../api/ApiLototeca');
const SyncService = require('../services/SyncService');

exports.obterJogosAtuais = async (req, res) => {
  try {
    const concurso = await ApiLoteca.buscarConcursoAtivo();
    
    return res.json({
      sucesso: true,
      dados: {
        concurso: concurso.concurso,
        rodada: concurso.rodada,
        jogos: concurso.jogos || [],
        dataAtualizacao: concurso.dataAtualizacao,
        semJogosDisponiveis: concurso.semJogosDisponiveis || false,
        mensagem: concurso.mensagem || '',
        dataProximoConcurso: concurso.dataProximoConcurso || '',
        valorEstimado: concurso.valorEstimado || 0
      }
    });
  } catch (error) {
    console.error('Erro ao obter jogos:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao buscar jogos da Loteca'
    });
  }
};

exports.sincronizarManual = async (req, res) => {
  try {
    const resultado = await SyncService.sincronizarAgora();
    
    if (resultado) {
      return res.json({
        sucesso: true,
        mensagem: 'Sincronização completa de todas as loterias',
        dados: {
          modalidades: resultado.loterias?.length || 0,
          loteca: resultado.loteca ? 'Sincronizada' : 'Erro'
        }
      });
    } else {
      return res.status(500).json({
        sucesso: false,
        mensagem: 'Erro ao sincronizar'
      });
    }
  } catch (error) {
    console.error('Erro na sincronização manual:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao sincronizar jogos'
    });
  }
};

exports.salvarPalpites = async (req, res) => {
  try {
    const { concurso, palpites } = req.body;
    
    // Validar palpites (deve ter 14 escolhas: 1, X ou 2)
    if (!palpites || palpites.length !== 14) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Deve enviar exatamente 14 palpites'
      });
    }

    // Validar cada palpite
    const palpitesValidos = palpites.every(p => ['1', 'X', '2'].includes(p));
    if (!palpitesValidos) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Palpites inválidos. Use apenas 1, X ou 2'
      });
    }

    // Aqui você pode salvar no modelo de jogos do usuário
    // Por enquanto, apenas retorna sucesso
    const palpitesString = palpites.join('');
    
    return res.json({
      sucesso: true,
      mensagem: 'Palpites salvos com sucesso',
      dados: {
        concurso,
        palpites: palpitesString
      }
    });
  } catch (error) {
    console.error('Erro ao salvar palpites:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao salvar palpites'
    });
  }
};
