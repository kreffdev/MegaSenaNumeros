const ApiLoterias = require('../api/ApiLoterias');
const SyncService = require('../services/SyncService');

exports.obterTodosConcursos = async (req, res) => {
  try {
    const concursos = await ApiLoterias.buscarTodosConcursos();
    
    return res.json({
      sucesso: true,
      dados: concursos
    });
  } catch (error) {
    console.error('Erro ao obter concursos:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao buscar dados dos concursos'
    });
  }
};

exports.obterConcursoPorModalidade = async (req, res) => {
  try {
    const { modalidade } = req.params;
    const concurso = await ApiLoterias.buscarConcursoPorModalidade(modalidade);
    
    if (!concurso) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Concurso não encontrado'
      });
    }
    
    return res.json({
      sucesso: true,
      dados: concurso
    });
  } catch (error) {
    console.error('Erro ao obter concurso:', error);
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao buscar dados do concurso'
    });
  }
};

exports.sincronizarManual = async (req, res) => {
  try {
    const resultado = await SyncService.sincronizarAgora();
    
    if (resultado) {
      return res.json({
        sucesso: true,
        mensagem: 'Sincronização concluída com sucesso',
        dados: {
          totalLoterias: resultado.loterias.length,
          loteca: !!resultado.loteca
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
      mensagem: 'Erro ao sincronizar dados'
    });
  }
};
