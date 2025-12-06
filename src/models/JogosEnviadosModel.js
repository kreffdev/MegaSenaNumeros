const mongoose = require('mongoose');

const JogosEnviadosSchema = new mongoose.Schema({
    sequencias: [
        {
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
            jogoRecebidoRef: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'jogos_recebidos'
            }
        }
    ],
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
    recebidoUsername: {
        type: String
    },
    quantidade: {
        type: Number,
        default: 0
    },
    dataEnvio: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const JogosEnviadosModel = mongoose.model('jogos_enviados', JogosEnviadosSchema);
module.exports = JogosEnviadosModel;
