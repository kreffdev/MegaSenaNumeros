const LoginModel = require('../models/LoginModel');
const { getInfoModalidade } = require('../config/precos');

exports.corrigirDatas = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ erro: 'Não autenticado' });
        }

        const usuario = await LoginModel.findById(req.session.user.id);
        
        if (!usuario.jogosRealizados || usuario.jogosRealizados.length === 0) {
            return res.json({ mensagem: 'Nenhum jogo realizado para corrigir' });
        }

        console.log(`🔄 Corrigindo datas para usuário: ${usuario.username}`);
        console.log(`   Jogos realizados: ${usuario.jogosRealizados.length}`);
        
        // Mover todos de jogosRealizados de volta para os arrays originais
        usuario.jogosRealizados.forEach(jogo => {
            if (jogo.origem === 'proprio') {
                usuario.jogos.push({
                    numeros: jogo.numeros,
                    modalidade: jogo.modalidade,
                    mesDaSorte: jogo.mesDaSorte,
                    timeCoracao: jogo.timeCoracao,
                    apostaMarcada: true,
                    criadoEm: jogo.dataCriacao
                });
            } else if (jogo.origem === 'recebido') {
                usuario.jogosRecebidos.push({
                    numeros: jogo.numeros,
                    modalidade: jogo.modalidade,
                    mesDaSorte: jogo.mesDaSorte,
                    timeCoracao: jogo.timeCoracao,
                    enviadoPor: jogo.enviadoPor,
                    enviadoPorUsername: jogo.enviadoPorUsername,
                    apostaMarcada: true,
                    dataEnvio: jogo.dataCriacao
                });
            }
        });
        
        const qtd = usuario.jogosRealizados.length;
        usuario.jogosRealizados = [];
        
        await usuario.save();
        
        res.json({ 
            sucesso: true, 
            mensagem: `${qtd} jogos movidos de volta. Agora marque as apostas novamente nas datas corretas.`
        });
    } catch(e) {
        console.error('Erro ao corrigir datas:', e);
        res.status(500).json({ erro: 'Erro ao corrigir' });
    }
};

exports.jogosRealizados = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        const usuario = await LoginModel.findById(req.session.user.id).populate('jogosRealizados.enviadoPor', 'username');
        
        // Buscar todos os jogos do array jogosRealizados
        const jogosRealizados = (usuario.jogosRealizados || []).map(j => {
            const obj = j.toObject ? j.toObject() : j;
            return {
                ...obj,
                tipo: obj.origem || 'proprio',
                enviadoPorUsername: obj.enviadoPorUsername || (obj.enviadoPor && obj.enviadoPor.username) || null,
                criadoEm: obj.dataCriacao || obj.dataAposta,
                // Garantir que dataAposta sempre existe
                dataAposta: obj.dataAposta || obj.dataCriacao || new Date()
            };
        });

        // DEBUG: Mostrar as primeiras 5 apostas com suas datas
        console.log('📊 Primeiros 5 jogos antes da ordenação:');
        jogosRealizados.slice(0, 5).forEach((j, i) => {
            console.log(`  [${i}] dataAposta: ${j.dataAposta}, dataCriacao: ${j.dataCriacao}, origem: ${j.origem}`);
        });

        // Ordenar por data que foi MARCADA como feita (dataAposta) - mais recente primeiro
        const todosJogos = jogosRealizados
            .map((jogo, index) => ({ ...jogo, _index: index }))
            .sort((a, b) => {
                const dataApostaA = new Date(a.dataAposta).getTime();
                const dataApostaB = new Date(b.dataAposta).getTime();
                
                // Ordenar por dataAposta (quando foi marcada) - mais recente primeiro
                if (dataApostaA !== dataApostaB) {
                    return dataApostaB - dataApostaA;
                }
                
                // Se marcadas no mesmo momento, último inserido aparece primeiro
                return b._index - a._index;
            });

        // Calcular estatísticas por origem
        const estatisticasPorUsuario = {};
        
        // Jogos próprios
        const jogosPropriosCount = todosJogos.filter(j => j.origem === 'proprio').length;
        if (jogosPropriosCount > 0) {
            const valorProprios = todosJogos.filter(j => j.origem === 'proprio').reduce((total, jogo) => {
                const info = getInfoModalidade(jogo.modalidade || 'megasena');
                return total + info.precoMinimo;
            }, 0);
            estatisticasPorUsuario['Você'] = {
                nome: 'Você',
                quantidade: jogosPropriosCount,
                valor: valorProprios
            };
        }
        
        // Jogos recebidos por usuário
        todosJogos.filter(j => j.origem === 'recebido').forEach(jogo => {
            const username = jogo.enviadoPorUsername || 'Desconhecido';
            const info = getInfoModalidade(jogo.modalidade || 'megasena');
            if (!estatisticasPorUsuario[username]) {
                estatisticasPorUsuario[username] = {
                    nome: username,
                    quantidade: 0,
                    valor: 0
                };
            }
            estatisticasPorUsuario[username].quantidade++;
            estatisticasPorUsuario[username].valor += info.precoMinimo;
        });

        // Converter para array e ordenar por quantidade
        const estatisticasArray = Object.values(estatisticasPorUsuario)
            .sort((a, b) => b.quantidade - a.quantidade);
        
        // Calcular valor total baseado nas modalidades
        const valorTotalCalculado = todosJogos.reduce((total, jogo) => {
            const info = getInfoModalidade(jogo.modalidade || 'megasena');
            return total + info.precoMinimo;
        }, 0);

        res.render('jogosRealizados', {
            titulo: 'Jogos Realizados',
            user: req.session.user,
            jogos: todosJogos,
            totalJogos: todosJogos.length,
            valorTotal: valorTotalCalculado.toFixed(2).replace('.', ','),
            estatisticasUsuarios: estatisticasArray,
            getInfoModalidade: getInfoModalidade
        });
    } catch (e) {
        console.error('Erro ao carregar jogos realizados:', e);
        res.render('jogosRealizados', {
            titulo: 'Jogos Realizados',
            user: req.session.user,
            jogos: [],
            totalJogos: 0,
            valorTotal: '0,00',
            getInfoModalidade: getInfoModalidade
        });
    }
}
