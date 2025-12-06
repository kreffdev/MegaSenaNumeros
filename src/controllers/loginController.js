
const LoginModel = require('../models/LoginModel');
const bcryptjs = require('bcryptjs');

// Exibir página de login
exports.index = (req, res) => {
    // Extrai o token CSRF do middleware csurf
    res.locals.csrfToken = req.csrfToken();
    res.render('login', { titulo: 'Login' });
};

// Validar credenciais
const validarCredenciais = (username, password) => {
    const errors = [];

    if (username.trim().length < 4) {
        errors.push('Usuário deve ter no mínimo 4 caracteres');
    }

    if (password.length < 4) {
        errors.push('Senha deve ter no mínimo 4 caracteres');
    }

    if (username.trim().length === 0) {
        errors.push('Usuário não pode estar vazio');
    }

    if (password.length === 0) {
        errors.push('Senha não pode estar vazia');
    }

    return errors;
};

// Login/Registro - tratamento unificado
exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validar entrada
        const errors = validarCredenciais(username, password);
        if (errors.length > 0) {
            req.flash('errors', errors);
            return res.redirect('/login');
        }

        // Verificar se usuário já existe
        const usuarioExistente = await LoginModel.findOne({ username: username.trim() });

        if (usuarioExistente) {
            // Verificar senha
            const senhaValida = await bcryptjs.compare(password, usuarioExistente.password);

            if (!senhaValida) {
                req.flash('errors', ['Usuário ou senha incorretos']);
                return res.redirect('/login');
            }

            // Login bem-sucedido - cria session
            req.session.user = {
                id: usuarioExistente._id,
                username: usuarioExistente.username
            };

            // Salvar session explicitamente
            req.session.save((err) => {
                if (err) {
                    console.error('Erro ao salvar sessão:', err);
                    req.flash('errors', ['Erro ao criar sessão']);
                    return res.redirect('/login');
                }
                req.flash('success', `Bem-vindo, ${usuarioExistente.username}!`);
                res.redirect('/');
            });
            return;
        }

        // Criar novo usuário
        const salt = await bcryptjs.genSalt(10);
        const senhaHash = await bcryptjs.hash(password, salt);

        const novoUsuario = new LoginModel({
            username: username.trim(),
            password: senhaHash
        });

        await novoUsuario.save();

        // Login automático após registro - cria session
        req.session.user = {
            id: novoUsuario._id,
            username: novoUsuario.username
        };

        // Salvar session explicitamente
        req.session.save((err) => {
            if (err) {
                console.error('Erro ao salvar sessão:', err);
                req.flash('errors', ['Erro ao criar sessão']);
                return res.redirect('/login');
            }
            req.flash('success', `Conta criada com sucesso! Bem-vindo, ${novoUsuario.username}!`);
            res.redirect('/');
        });

    } catch (e) {
        console.error('Erro ao registrar/fazer login:', e);
        req.flash('errors', ['Erro ao processar sua solicitação']);
        return res.redirect('/login');
    }
};

// Logout
exports.logout = (req, res) => {
    if (req.session) {
        // Adicionar mensagem flash ANTES de destruir a session
        req.flash('success', 'Você foi desconectado com sucesso');
        
        req.session.destroy((err) => {
            if (err) {
                console.error('Erro ao destruir sessão:', err);
            }
            // Limpar cookie da session
            res.clearCookie('connect.sid');
            res.redirect('/');
        });
    } else {
        res.redirect('/');
    }
};

