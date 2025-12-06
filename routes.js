const express = require('express');
const route = express.Router();
const csurf = require('csurf');
const homeController = require('./src/controllers/homeController');
const loginController = require('./src/controllers/loginController');
const meusNumerosController = require('./src/controllers/meusNumerosController');
const jogosRecebidosController = require('./src/controllers/jogosRecebidosController');
const jogosController = require('./src/controllers/jogosController');
const enviadosController = require('./src/controllers/enviadosController');

// CSRF protection com cookie ao invés de session
const csrfProtection = csurf({ 
  cookie: true
});

// Rotas da home
route.get('/', homeController.index);

// Rotas de login
route.get('/login', csrfProtection, loginController.index);
route.post('/login', csrfProtection, loginController.register);
route.get('/logout', loginController.logout);

// Rotas de meus números
route.get('/meusjogos', csrfProtection, meusNumerosController.index);

// Rotas de jogos recebidos
route.get('/jogosrecebidos', csrfProtection, jogosRecebidosController.index);
// Rotas de meus envios (histórico)
route.get('/meusenvios', csrfProtection, enviadosController.index);

// API - Rotas de jogos (sequências)
route.post('/api/jogos/salvar', jogosController.salvarSequencia);
route.post('/api/jogos/salvar-multiplas', jogosController.salvarMultiplas);
route.get('/api/jogos/meus', jogosController.obterMeuJogos);
route.delete('/api/jogos/:id', jogosController.deletarSequencia);
route.post('/api/jogos/enviar', jogosController.enviarJogos);
route.get('/api/jogos-enviados', enviadosController.apiList);
route.get('/api/jogos-recebidos', jogosController.obterJogosRecebidos);
route.delete('/api/jogos-recebidos/:id', jogosController.deletarJogoRecebido);


module.exports = route;
