const JogosRecebidosModel = require('../models/JogosRecebidosModel');
const LoginModel = require('../models/LoginModel');

exports.index = async (req, res) => {
    try {
        // Verificar se usuário está logado
        if (!req.session.user) {
            return res.redirect('/login');
        }

        // Obter jogos recebidos
        const jogos = await JogosRecebidosModel.find({ recebidoEm: req.session.user.id })
            .populate('enviadoPor', 'username')
            .sort({ dataEnvio: -1 });

        res.render('jogosRecebidos', {
            jogos: jogos,
            user: req.session.user,
            csrfToken: req.csrfToken(),
            messages: req.flash()
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
