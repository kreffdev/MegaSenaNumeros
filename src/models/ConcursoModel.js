const mongoose = require('mongoose');

const ConcursoSchema = new mongoose.Schema({
  modalidade: {
    type: String,
    required: true,
    unique: true
  },
  numeroConcurso: {
    type: Number,
    required: true
  },
  dataApuracao: {
    type: String,
    default: ''
  },
  dataSorteio: {
    type: String,
    default: ''
  },
  valorEstimadoProximoConcurso: {
    type: Number,
    default: 0
  },
  numerossorteados: {
    type: [String],
    default: []
  },
  valorArrecadado: {
    type: Number,
    default: 0
  },
  acumulou: {
    type: Boolean,
    default: false
  },
  valorAcumuladoConcurso: {
    type: Number,
    default: 0
  },
  // Campos específicos
  mesSorte: String,  // Dia de Sorte
  nomeTimeCoracao: String,  // Timemania
  trevos: [String],  // +Milionária
  dataAtualizacao: {
    type: Date,
    default: Date.now
  }
});

const ConcursoModel = mongoose.model('Concurso', ConcursoSchema);

module.exports = ConcursoModel;
