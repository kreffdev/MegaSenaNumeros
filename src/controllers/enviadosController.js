const LoginModel = require('../models/LoginModel');

exports.index = async (req, res) => {
    try {
        if (!req.session.user) {
            req.flash('errors', ['Você precisa estar logado para ver seu histórico de envios']);
            return res.redirect('/login');
        }

        // Ler envios do documento de usuário (embedded)
        const usuario = await LoginModel.findById(req.session.user.id).populate('jogosEnviados.recebidoEm', 'username').lean();
        const enviados = (usuario && usuario.jogosEnviados) ? usuario.jogosEnviados.slice().sort((a,b) => new Date(b.dataEnvio) - new Date(a.dataEnvio)) : [];

        res.render('meusEnvios', {
            titulo: 'Meus Envios',
            enviados: enviados,
            user: req.session.user
        });
    } catch (erro) {
        console.error('Erro ao carregar histórico de envios:', erro);
        req.flash('errors', ['Erro ao carregar histórico de envios']);
        res.redirect('/');
    }
};

// API: retornar envios em JSON
exports.apiList = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ sucesso: false, mensagem: 'Você precisa estar logado' });
        }

        const usuario = await LoginModel.findById(req.session.user.id).populate('jogosEnviados.recebidoEm', 'username').lean();
        const enviados = (usuario && usuario.jogosEnviados) ? usuario.jogosEnviados.slice().sort((a,b) => new Date(b.dataEnvio) - new Date(a.dataEnvio)) : [];

        res.json({ sucesso: true, enviados: enviados, quantidade: enviados.length });
    } catch (erro) {
        console.error('Erro ao buscar envios (API):', erro);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar envios' });
    }
};
