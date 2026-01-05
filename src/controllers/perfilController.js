


const LoginModel = require('../models/LoginModel');

exports.exibirPerfil = async (req, res) => {
    // Suporta chamadas a /perfil (próprio perfil) ou /perfil/:slug, onde slug pode ser username ou username-id
    const slug = req.params.slug || req.params.username || null;
    let perfilId = null;
    let perfilUsername = null;

    try {
        if (slug) {
            // Se o slug terminar com -<dígitos>, extrai o id
            const m = String(slug).match(/-(\d+)$/);
            if (m) {
                perfilId = m[1];
                perfilUsername = slug.replace(/-\d+$/, '');
            } else {
                // slug contém apenas o username: buscar usuário para obter o id
                perfilUsername = slug;
                const user = await LoginModel.findOne({ username: perfilUsername }).select('_id username').lean();
                if (user) {
                    perfilId = String(user._id);
                    perfilUsername = user.username;
                } else {
                    // não encontrado: mantém username e id nulo
                    perfilId = null;
                }
            }
        }
    } catch (err) {
        // Em erro no banco, registra e continua com o que houver
        console.error('Erro ao buscar usuário por username:', err);
    }

    // Passa os valores parseados/buscados para a view para que ela possa buscar dados pelo id, se presente
    res.render('perfil', { perfilId, perfilUsername });
}