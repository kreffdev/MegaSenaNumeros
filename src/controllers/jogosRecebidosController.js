const LoginModel = require('../models/LoginModel');

exports.index = async (req, res) => {
    try {
        // Verificar se usuário está logado
        if (!req.session.user) {
            return res.redirect('/login');
        }

        // Obter jogos recebidos a partir do documento de usuário (embedded)
        const usuario = await LoginModel.findById(req.session.user.id).populate('jogosRecebidos.enviadoPor', 'username');
        const jogos = (usuario && usuario.jogosRecebidos) ? usuario.jogosRecebidos.slice().sort((a,b) => new Date(b.dataEnvio) - new Date(a.dataEnvio)) : [];
        
        // Converter para objetos simples mantendo _id
        const jogosLean = jogos.map(jogo => ({
            _id: jogo._id,
            numeros: jogo.numeros,
            enviadoPor: jogo.enviadoPor,
            dataEnvio: jogo.dataEnvio,
            apostaMarcada: jogo.apostaMarcada || false
        }));

        res.render('jogosRecebidos', {
            jogos: jogosLean,
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
