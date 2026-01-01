

const LoginModel = require('../models/LoginModel');

exports.jogosRealizados = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        const usuario = await LoginModel.findById(req.session.user.id);
        
        // Buscar todos os jogos marcados como feitos
        const jogosPropriosMarcados = usuario.jogos.filter(j => j.apostaMarcada === true);
        const jogosRecebidosMarcados = usuario.jogosRecebidos
            .filter(j => j.apostaMarcada === true)
            .map(j => ({
                ...j.toObject(),
                enviadoPorUsername: j.enviadoPorUsername || 'Desconhecido',
                tipo: 'recebido'
            }));

        // Marcar jogos próprios com tipo
        const jogosPropriosComTipo = jogosPropriosMarcados.map(j => ({
            ...j.toObject(),
            tipo: 'proprio'
        }));

        // Combinar e ordenar por data mais recente
        const todosJogos = [...jogosPropriosComTipo, ...jogosRecebidosMarcados]
            .sort((a, b) => {
                const dataA = a.criadoEm || a.dataEnvio;
                const dataB = b.criadoEm || b.dataEnvio;
                return new Date(dataB) - new Date(dataA);
            });

        // Calcular estatísticas por usuário remetente
        const estatisticasPorUsuario = {};
        jogosRecebidosMarcados.forEach(jogo => {
            const username = jogo.enviadoPorUsername;
            if (!estatisticasPorUsuario[username]) {
                estatisticasPorUsuario[username] = {
                    nome: username,
                    quantidade: 0,
                    valor: 0
                };
            }
            estatisticasPorUsuario[username].quantidade++;
            estatisticasPorUsuario[username].valor += 6;
        });

        // Converter para array e ordenar por quantidade
        const estatisticasArray = Object.values(estatisticasPorUsuario)
            .sort((a, b) => b.quantidade - a.quantidade);

        res.render('jogosRealizados', {
            titulo: 'Jogos Realizados',
            user: req.session.user,
            jogos: todosJogos,
            totalJogos: todosJogos.length,
            valorTotal: (todosJogos.length * 6).toFixed(2).replace('.', ','),
            estatisticasUsuarios: estatisticasArray
        });
    } catch (e) {
        console.error('Erro ao carregar jogos realizados:', e);
        res.render('jogosRealizados', {
            titulo: 'Jogos Realizados',
            user: req.session.user,
            jogos: [],
            totalJogos: 0,
            valorTotal: '0,00'
        });
    }
}
