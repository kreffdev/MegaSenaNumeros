const mongoose = require('mongoose');
const LoginSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    // Timestamp of last time user checked notifications
    ultimoAcessoNotificacoes: { type: Date, default: new Date(0) },
    // Per-envio read markers to hide individual envio notifications once clicked
    readEnvios: [{
        enviadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Login' },
        dataEnvio: { type: Date }
    }]
});
const LoginModel = mongoose.model('Login', LoginSchema);
module.exports = LoginModel;