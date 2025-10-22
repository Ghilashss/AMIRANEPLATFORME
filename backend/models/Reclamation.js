const mongoose = require('mongoose');

const reclamationSchema = new mongoose.Schema({
  numero: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['retard', 'dommage', 'perte', 'erreur_livraison', 'autre'],
    required: true
  },
  colis: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Colis',
    required: true
  },
  utilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  titre: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  priorite: {
    type: String,
    enum: ['basse', 'moyenne', 'haute', 'urgente'],
    default: 'moyenne'
  },
  status: {
    type: String,
    enum: ['ouverte', 'en_cours', 'resolue', 'fermee'],
    default: 'ouverte'
  },
  pieceJointes: [String],
  reponses: [{
    utilisateur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  dateResolution: Date
}, {
  timestamps: true
});

// Générer un numéro de réclamation
reclamationSchema.pre('save', function(next) {
  if (!this.numero) {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.numero = `REC${year}${month}${random}`;
  }
  next();
});

module.exports = mongoose.model('Reclamation', reclamationSchema);
