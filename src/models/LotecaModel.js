const mongoose = require('mongoose');

const JogoSchema = new mongoose.Schema({
  numeroJogo: {
    type: Number,
    required: true
  },
  timeCasa: {
    type: String,
    required: true
  },
  timeVisitante: {
    type: String,
    required: true
  },
  dataHoraJogo: {
    type: String,
    default: ''
  },
  resultado: {
    type: String,
    default: ''
  },
  placar: {
    type: String,
    default: ''
  }
});

const LotecaSchema = new mongoose.Schema({
  concurso: {
    type: Number,
    required: true,
    unique: true
  },
  rodada: {
    type: String,
    default: ''
  },
  dataAtualizacao: {
    type: Date,
    default: Date.now
  },
  jogos: [JogoSchema],
  ativo: {
    type: Boolean,
    default: true
  },
  semJogosDisponiveis: {
    type: Boolean,
    default: false
  },
  mensagem: {
    type: String,
    default: ''
  },
  dataProximoConcurso: {
    type: String,
    default: ''
  },
  valorEstimado: {
    type: Number,
    default: 0
  }
});

const LotecaModel = mongoose.model('Loteca', LotecaSchema);

module.exports = LotecaModel;
