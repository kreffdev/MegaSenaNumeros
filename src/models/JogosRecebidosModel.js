const mongoose = require('mongoose');

const JogosRecebidosSchema = new mongoose.Schema({
    numeros: {
        type: [Number],
        required: true,
        validate: {
            validator: function(arr) {
                return arr.length === 6 && arr.every(n => n >= 1 && n <= 60);
            },
            message: 'Deve conter exatamente 6 números entre 1 e 60'
        }
    },
    enviadoPor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Login',
        required: true
    },
    recebidoEm: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Login',
        required: true
    },
    criadoEm: {
        type: Date,
        default: Date.now
    },
    dataEnvio: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const JogosRecebidosModel = mongoose.model('jogos_recebidos', JogosRecebidosSchema);
module.exports = JogosRecebidosModel;
