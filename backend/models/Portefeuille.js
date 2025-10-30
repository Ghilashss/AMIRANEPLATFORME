const mongoose = require('mongoose');

// ===================================================
// MODÈLE PORTEFEUILLE (WALLET)
// ===================================================
// Gère le solde de chaque compte (Admin, Agence, Commerçant)

const portefeuilleSchema = new mongoose.Schema({
  // Identifiant du propriétaire (Admin/Agence/Commerçant)
  proprietaireId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'typeProprietaire'
  },
  
  // Type de compte
  typeProprietaire: {
    type: String,
    required: true,
    enum: ['User', 'Agence', 'Commercant', 'Admin'],
    index: true
  },
  
  // Nom du propriétaire (pour affichage)
  nomProprietaire: {
    type: String,
    required: true
  },
  
  // Solde actuel (mis à jour automatiquement)
  solde: {
    type: Number,
    default: 0,
    get: v => Math.round(v * 100) / 100 // Arrondi à 2 décimales
  },
  
  // Devise (DA par défaut)
  devise: {
    type: String,
    default: 'DA'
  },
  
  // Statut du portefeuille
  statut: {
    type: String,
    enum: ['actif', 'suspendu', 'bloque'],
    default: 'actif'
  },
  
  // Métadonnées
  dateCreation: {
    type: Date,
    default: Date.now
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

// Index composé pour recherche rapide
portefeuilleSchema.index({ typeProprietaire: 1, proprietaireId: 1 }, { unique: true });

// Méthode pour mettre à jour le solde
portefeuilleSchema.methods.mettreAJourSolde = async function() {
  const OperationFinanciere = mongoose.model('OperationFinanciere');
  
  // Calculer crédits (argent reçu)
  const credits = await OperationFinanciere.aggregate([
    { $match: { compteCredit: this._id, statut: 'validee' } },
    { $group: { _id: null, total: { $sum: '$montant' } } }
  ]);
  
  // Calculer débits (argent payé)
  const debits = await OperationFinanciere.aggregate([
    { $match: { compteDebit: this._id, statut: 'validee' } },
    { $group: { _id: null, total: { $sum: '$montant' } } }
  ]);
  
  const totalCredits = credits.length > 0 ? credits[0].total : 0;
  const totalDebits = debits.length > 0 ? debits[0].total : 0;
  
  this.solde = totalCredits - totalDebits;
  this.derniereMiseAJour = new Date();
  
  await this.save();
  return this.solde;
};

// Méthode pour vérifier si le compte peut débiter un montant
portefeuilleSchema.methods.peutDebiter = function(montant) {
  return this.solde >= montant && this.statut === 'actif';
};

// Hook avant sauvegarde
portefeuilleSchema.pre('save', function(next) {
  this.derniereMiseAJour = new Date();
  next();
});

module.exports = mongoose.model('Portefeuille', portefeuilleSchema);
