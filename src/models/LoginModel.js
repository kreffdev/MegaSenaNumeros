const mongoose = require('mongoose');

// Configurações de validação para cada modalidade
const modalidadesConfig = {
    megasena: { min: 6, max: 15, rangeInicio: 1, rangeFim: 60 },
    lotofacil: { min: 15, max: 20, rangeInicio: 1, rangeFim: 25 },
    quina: { min: 5, max: 15, rangeInicio: 1, rangeFim: 80 },
    lotomania: { min: 50, max: 50, rangeInicio: 0, rangeFim: 99 },
    duplasena: { min: 6, max: 15, rangeInicio: 1, rangeFim: 50 },
    diadesorte: { min: 7, max: 15, rangeInicio: 1, rangeFim: 31 },
    timemania: { min: 10, max: 10, rangeInicio: 1, rangeFim: 80 },
    maismilionaria: { min: 6, max: 12, rangeInicio: 1, rangeFim: 50 },
    supersete: { min: 7, max: 7, rangeInicio: 0, rangeFim: 9 },
    loteca: { min: 14, max: 14, rangeInicio: 1, rangeFim: 3 }
};

// Validador dinâmico de números baseado na modalidade
function validarNumerosPorModalidade(arr, modalidade = 'megasena') {
    const config = modalidadesConfig[modalidade] || modalidadesConfig.megasena;
    
    if (!Array.isArray(arr)) return false;
    if (arr.length < config.min || arr.length > config.max) return false;
    if (!arr.every(n => Number.isInteger(n) && n >= config.rangeInicio && n <= config.rangeFim)) return false;
    
    return true;
}

const JogosSubSchema = new mongoose.Schema({
    numeros: {
        type: [Number],
        required: true
    },
    modalidade: {
        type: String,
        default: 'megasena'
    },
    mesDaSorte: { type: String },
    timeCoracao: { type: String },
    criadoEm: { type: Date, default: Date.now },
    apostaMarcada: { type: Boolean, default: false },
    originalId: { type: mongoose.Schema.Types.ObjectId }
}, { timestamps: false });

const JogosRecebidosSubSchema = new mongoose.Schema({
    numeros: {
        type: [Number],
        required: true
    },
    modalidade: {
        type: String,
        default: 'megasena'
    },
    mesDaSorte: { type: String },
    timeCoracao: { type: String },
    enviadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Login' },
    enviadoPorUsername: { type: String },
    dataEnvio: { type: Date, default: Date.now },
    originalId: { type: mongoose.Schema.Types.ObjectId },
    apostaMarcada: { type: Boolean, default: false }
}, { timestamps: false });

const JogosEnviadosSubSchema = new mongoose.Schema({
    sequencias: [
        {
            numeros: {
                type: [Number],
                required: true
            },
            modalidade: {
                type: String,
                default: 'megasena'
            },
            jogoRecebidoRef: { type: mongoose.Schema.Types.ObjectId }
        }
    ],
    recebidoEm: { type: mongoose.Schema.Types.ObjectId, ref: 'Login' },
    recebidoUsername: { type: String },
    quantidade: { type: Number, default: 0 },
    dataEnvio: { type: Date, default: Date.now },
    originalId: { type: mongoose.Schema.Types.ObjectId }
}, { timestamps: false });

// Schema para jogos realizados (apostas marcadas como feitas)
const JogosRealizadosSubSchema = new mongoose.Schema({
    numeros: {
        type: [Number],
        required: true
    },
    modalidade: {
        type: String,
        default: 'megasena'
    },
    mesDaSorte: { type: String },
    timeCoracao: { type: String },
    origem: { 
        type: String, 
        enum: ['proprio', 'recebido'],
        required: true 
    },
    enviadoPor: { type: mongoose.Schema.Types.ObjectId, ref: 'Login' },
    enviadoPorUsername: { type: String },
    dataAposta: { type: Date, default: Date.now },
    dataCriacao: { type: Date },
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
    jogosEnviados: [JogosEnviadosSubSchema],
    jogosRealizados: [JogosRealizadosSubSchema]
}, { timestamps: true });

const LoginModel = mongoose.model('Login', LoginSchema);
module.exports = LoginModel;