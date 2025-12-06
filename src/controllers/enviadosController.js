const JogosEnviadosModel = require('../models/JogosEnviadosModel');
const LoginModel = require('../models/LoginModel');

exports.index = async (req, res) => {
    try {
        if (!req.session.user) {
            req.flash('errors', ['Você precisa estar logado para ver seu histórico de envios']);
            return res.redirect('/login');
        }

        const enviados = await JogosEnviadosModel.find({ enviadoPor: req.session.user.id })
            .populate('recebidoEm', 'username')
            .sort({ dataEnvio: -1 });

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

        const enviados = await JogosEnviadosModel.find({ enviadoPor: req.session.user.id })
            .populate('recebidoEm', 'username')
            .sort({ dataEnvio: -1 });

        res.json({ sucesso: true, enviados: enviados, quantidade: enviados.length });
    } catch (erro) {
        console.error('Erro ao buscar envios (API):', erro);
        res.status(500).json({ sucesso: false, mensagem: 'Erro ao buscar envios' });
    }
};
