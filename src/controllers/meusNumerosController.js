const JogosModel = require('../models/JogosModel');

exports.index = async (req, res) => {
    try {
        // Verificar se usuário está logado
        if (!req.session.user) {
            req.flash('errors', ['Você precisa estar logado para ver seus números']);
            return res.redirect('/login');
        }

        // Buscar todos os jogos do usuário
        const jogos = await JogosModel.find({ criadoPor: req.session.user.id })
            .sort({ criadoEm: 1 });

        res.render('meusNumeros', {
            titulo: 'Meus Números',
            jogos: jogos,
            user: req.session.user
        });
    } catch (erro) {
        console.error('Erro ao buscar meus números:', erro);
        req.flash('errors', ['Erro ao carregar seus números']);
        res.redirect('/');
    }
};