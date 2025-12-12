const mongoose = require('mongoose');

// Sub-schema reused for validating a 6-number sequence
const SequenciaSchema = new mongoose.Schema({
    numeros: {
        type: [Number],
        required: true,
        validate: {
            validator: function(arr) {
                return Array.isArray(arr) && arr.length === 6 && arr.every(n => Number.isInteger(n) && n >= 1 && n <= 60);
            },
            message: 'Deve conter exatamente 6 números entre 1 e 60'
        }
    }
}, { _id: false });

const JogosSubSchema = new mongoose.Schema({
    numeros: SequenciaSchema.path('numeros').options,
    criadoEm: { type: Date, default: Date.now },
    // opcional: manter referência original se veio de coleção antiga
    originalId: { type: mongoose.Schema.Types.ObjectId }
}, { timestamps: false });

const JogosRecebidosSubSchema = new mongoose.Schema({
    numeros: SequenciaSchema.path('numeros').options,
    enviadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Login' },
    enviadoPorUsername: { type: String },
    dataEnvio: { type: Date, default: Date.now },
    originalId: { type: mongoose.Schema.Types.ObjectId }
}, { timestamps: false });

const JogosEnviadosSubSchema = new mongoose.Schema({
    sequencias: [
        {
            numeros: SequenciaSchema.path('numeros').options,
            jogoRecebidoRef: { type: mongoose.Schema.Types.ObjectId }
        }
    ],
    recebidoEm: { type: mongoose.Schema.Types.ObjectId, ref: 'Login' },
    recebidoUsername: { type: String },
    quantidade: { type: Number, default: 0 },
    dataEnvio: { type: Date, default: Date.now },
    originalId: { type: mongoose.Schema.Types.ObjectId }
}, { timestamps: false });

const LoginSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    // Timestamp of last time user checked notifications
    ultimoAcessoNotificacoes: { type: Date, default: new Date(0) },
    // Per-envio read markers to hide individual envio notifications once clicked
    readEnvios: [{
        enviadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Login' },
        dataEnvio: { type: Date }
    }],

    // Embedded arrays to group user-related jogos
    jogos: [JogosSubSchema],
    jogosRecebidos: [JogosRecebidosSubSchema],
    jogosEnviados: [JogosEnviadosSubSchema]
}, { timestamps: true });

const LoginModel = mongoose.model('Login', LoginSchema);
module.exports = LoginModel;