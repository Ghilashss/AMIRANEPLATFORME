const mongoose = require('mongoose');

const caisseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['admin', 'agent', 'commercant'],
    required: true
  },
  soldeActuel: {
    type: Number,
    default: 0
  },
  totalCollecte: {
    type: Number,
    default: 0
  },
  totalVerse: {
    type: Number,
    default: 0
  },
  totalEnAttente: {
    type: Number,
    default: 0
  },
  totalRecuCommercant: {
    type: Number,
    default: 0
  },
  totalRecuAdmin: {
    type: Number,
    default: 0
  },
  fraisLivraisonCollectes: {
    type: Number,
    default: 0
  },
  fraisRetourCollectes: {
    type: Number,
    default: 0
  },
  montantColisCollectes: {
    type: Number,
    default: 0
  },
  derniereMiseAJour: {
    type: Date,
    default: Date.now
  },
  historique: [{
    date: Date,
    action: String,
    montant: Number,
    soldeApres: Number
  }]
}, {
  timestamps: true
});

// Méthode pour mettre à jour le solde
caisseSchema.methods.ajouterTransaction = function(montant, action) {
  this.soldeActuel += montant;
  this.historique.push({
    date: new Date(),
    action: action,
    montant: montant,
    soldeApres: this.soldeActuel
  });
  this.derniereMiseAJour = new Date();
};

module.exports = mongoose.model('Caisse', caisseSchema);
