const LoginModel = require('../models/LoginModel');
const { getInfoModalidade } = require('../config/precos');

exports.index = async (req, res) => {
    try {
        // Verificar se usuário está logado
        if (!req.session.user) {
            req.flash('errors', ['Você precisa estar logado para ver seus números']);
            return res.redirect('/login');
        }

        // Buscar todos os jogos embutidos no documento do usuário
        const usuario = await LoginModel.findById(req.session.user.id).lean();
        const jogos = (usuario && usuario.jogos) ? usuario.jogos.slice().sort((a,b) => new Date(b.criadoEm) - new Date(a.criadoEm)) : [];

        res.render('meusNumeros', {
            titulo: 'Meus Números',
            jogos: jogos,
            user: req.session.user,
            getInfoModalidade: getInfoModalidade
        });
    } catch (erro) {
        console.error('Erro ao buscar meus números:', erro);
        req.flash('errors', ['Erro ao carregar seus números']);
        res.redirect('/');
    }
};