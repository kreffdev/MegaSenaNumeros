const LoginModel = require('../models/LoginModel');
const { getInfoModalidade } = require('../config/precos');

exports.index = async (req, res) => {
    try {
        // Verificar se usuário está logado
        if (!req.session.user) {
            req.flash('errors', ['Você precisa estar logado para ver seus números']);
            return res.redirect('/login');
        }

        // Buscar usuário e fazer migração automática
        const usuario = await LoginModel.findById(req.session.user.id);
        
        if (usuario) {
            let precisaSalvar = false;
            
            // Migrar jogos próprios marcados para jogosRealizados
            const jogosMarcados = usuario.jogos.filter(j => j.apostaMarcada === true);
            if (jogosMarcados.length > 0) {
                usuario.jogosRealizados = usuario.jogosRealizados || [];
                jogosMarcados.forEach(jogo => {
                    usuario.jogosRealizados.push({
                        numeros: jogo.numeros,
                        modalidade: jogo.modalidade || 'megasena',
                        mesDaSorte: jogo.mesDaSorte,
                        timeCoracao: jogo.timeCoracao,
                        origem: 'proprio',
                        dataAposta: jogo.updatedAt || new Date(),
                        dataCriacao: jogo.criadoEm,
                        originalId: jogo._id
                    });
                });
                usuario.jogos = usuario.jogos.filter(j => j.apostaMarcada !== true);
                precisaSalvar = true;
            }
            
            // Migrar jogos recebidos marcados para jogosRealizados
            const jogosRecebidosMarcados = usuario.jogosRecebidos.filter(j => j.apostaMarcada === true);
            if (jogosRecebidosMarcados.length > 0) {
                usuario.jogosRealizados = usuario.jogosRealizados || [];
                jogosRecebidosMarcados.forEach(jogo => {
                    usuario.jogosRealizados.push({
                        numeros: jogo.numeros,
                        modalidade: jogo.modalidade || 'megasena',
                        mesDaSorte: jogo.mesDaSorte,
                        timeCoracao: jogo.timeCoracao,
                        origem: 'recebido',
                        enviadoPor: jogo.enviadoPor,
                        enviadoPorUsername: jogo.enviadoPorUsername,
                        dataAposta: jogo.updatedAt || new Date(),
                        dataCriacao: jogo.dataEnvio,
                        originalId: jogo._id
                    });
                });
                usuario.jogosRecebidos = usuario.jogosRecebidos.filter(j => j.apostaMarcada !== true);
                precisaSalvar = true;
            }
            
            if (precisaSalvar) {
                await usuario.save();
                console.log('✅ Migração concluída:', jogosMarcados.length + jogosRecebidosMarcados.length, 'jogos movidos para jogosRealizados');
            }
        }

        // Buscar jogos não marcados para exibir
        const usuarioLean = await LoginModel.findById(req.session.user.id).lean();
        const jogos = (usuarioLean && usuarioLean.jogos) ? usuarioLean.jogos.filter(j => j.apostaMarcada !== true).slice().sort((a,b) => new Date(b.criadoEm) - new Date(a.criadoEm)) : [];

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