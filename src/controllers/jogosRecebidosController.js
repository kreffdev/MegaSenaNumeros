const LoginModel = require('../models/LoginModel');
const { getInfoModalidade } = require('../config/precos');

exports.index = async (req, res) => {
    try {
        // Verificar se usuário está logado
        if (!req.session.user) {
            return res.redirect('/login');
        }

        // Obter jogos recebidos a partir do documento de usuário (embedded)
        const usuario = await LoginModel.findById(req.session.user.id).populate('jogosRecebidos.enviadoPor', 'username');
        
        // Filtrar apenas jogos NÃO marcados como feitos
        const jogosNaoMarcados = (usuario && usuario.jogosRecebidos) ? usuario.jogosRecebidos.filter(j => j.apostaMarcada !== true) : [];
        const jogos = jogosNaoMarcados.slice().sort((a,b) => new Date(b.dataEnvio) - new Date(a.dataEnvio));
        
        // Converter para objetos simples mantendo TODAS as propriedades
        const jogosLean = jogos.map(jogo => {
            const obj = jogo.toObject ? jogo.toObject() : jogo;
            return {
                _id: obj._id,
                numeros: obj.numeros || [],
                modalidade: obj.modalidade || 'megasena',
                mesDaSorte: obj.mesDaSorte,
                timeCoracao: obj.timeCoracao,
                enviadoPor: obj.enviadoPor,
                enviadoPorUsername: obj.enviadoPorUsername,
                dataEnvio: obj.dataEnvio || obj.criadoEm,
                apostaMarcada: obj.apostaMarcada || false
            };
        });

        res.render('jogosRecebidos', {
            jogos: jogosLean,
            user: req.session.user,
            csrfToken: req.csrfToken(),
            messages: req.flash(),
            getInfoModalidade: getInfoModalidade
        });

    } catch (erro) {
        console.error('Erro ao carregar jogos recebidos:', erro);
        return res.status(500).render('404', {
            mensagem: 'Erro ao carregar a página',
            user: req.session.user,
            csrfToken: req.csrfToken()
        });
    }
};
