const mongoose = require('mongoose');

/**
 * Modèle Compte - Wallet pour chaque utilisateur
 * Gère le solde de chaque admin/agence/commerçant
 */
const compteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  typeCompte: {
    type: String,
    enum: ['admin', 'agence', 'commercant'],
    required: true
  },
  nom: {
    type: String,
    required: true
  },
  solde: {
    type: Number,
    default: 0,
    get: v => Math.round(v * 100) / 100 // Arrondi à 2 décimales
  },
  // Statistiques calculées automatiquement
  totalCredits: {
    type: Number,
    default: 0
  },
  totalDebits: {
    type: Number,
    default: 0
  },
  // Compteurs
  nbTransactions: {
    type: Number,
    default: 0
  },
  derniereMiseAJour: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Index pour optimiser les recherches
compteSchema.index({ user: 1 });
compteSchema.index({ typeCompte: 1 });

// Méthode pour recalculer le solde depuis les transactions
compteSchema.methods.recalculerSolde = async function() {
  const Transaction = mongoose.model('TransactionFinanciere');
  
  // Somme des crédits (argent reçu)
  const credits = await Transaction.aggregate([
    { $match: { credit_id: this._id, statut: 'validee' } },
    { $group: { _id: null, total: { $sum: '$montant' } } }
  ]);
  
  // Somme des débits (argent envoyé)
  const debits = await Transaction.aggregate([
    { $match: { debit_id: this._id, statut: 'validee' } },
    { $group: { _id: null, total: { $sum: '$montant' } } }
  ]);
  
  this.totalCredits = credits[0]?.total || 0;
  this.totalDebits = debits[0]?.total || 0;
  this.solde = this.totalCredits - this.totalDebits;
  this.derniereMiseAJour = new Date();
  
  await this.save();
  
  return this.solde;
};

// Middleware pré-save pour arrondir le solde
compteSchema.pre('save', function(next) {
  if (this.isModified('solde')) {
    this.solde = Math.round(this.solde * 100) / 100;
  }
  next();
});

module.exports = mongoose.model('Compte', compteSchema);
