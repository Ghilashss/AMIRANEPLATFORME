const mongoose = require('mongoose');

// ===================================================
// MODÈLE OPÉRATION FINANCIÈRE (TRANSACTION)
// ===================================================
// Enregistre toutes les transactions financières

const operationFinanciereSchema = new mongoose.Schema({
  // Type d'opération
  typeOperation: {
    type: String,
    required: true,
    enum: [
      'paiement_livraison',    // Agent paie le commerçant pour le prix du colis livré
      'frais_livraison',       // Commerçant paie les frais de livraison à l'Agent
      'frais_retour',          // Commerçant paie les frais de retour à l'Agent
      'paiement_agence',       // Agent paie l'Admin pour les frais de livraison collectés
      'virement_manuel',       // Virement manuel entre comptes
      'rechargement',          // Rechargement de compte
      'retrait'                // Retrait d'argent
    ],
    index: true
  },
  
  // Montant de la transaction
  montant: {
    type: Number,
    required: true,
    min: 0,
    get: v => Math.round(v * 100) / 100
  },
  
  // Compte débité (qui paie)
  compteDebit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Portefeuille',
    required: function() {
      return this.typeOperation !== 'rechargement';
    }
  },
  
  // Compte crédité (qui reçoit)
  compteCredit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Portefeuille',
    required: function() {
      return this.typeOperation !== 'retrait';
    }
  },
  
  // Référence du colis (si applicable)
  referenceColis: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Colis'
  },
  
  // Code du colis (pour affichage)
  codeColis: {
    type: String
  },
  
  // Description de l'opération
  description: {
    type: String,
    required: true
  },
  
  // Statut de l'opération
  statut: {
    type: String,
    enum: ['en_attente', 'validee', 'annulee', 'echouee'],
    default: 'validee',
    index: true
  },
  
  // Méthode de paiement
  methodePaiement: {
    type: String,
    enum: ['virement', 'especes', 'cheque', 'automatique'],
    default: 'automatique'
  },
  
  // Agent qui a effectué l'opération (si manuel)
  effectuePar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Notes additionnelles
  notes: {
    type: String
  },
  
  // Métadonnées
  dateOperation: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  dateValidation: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Index composés pour recherches rapides
operationFinanciereSchema.index({ compteDebit: 1, dateOperation: -1 });
operationFinanciereSchema.index({ compteCredit: 1, dateOperation: -1 });
operationFinanciereSchema.index({ referenceColis: 1 });
operationFinanciereSchema.index({ typeOperation: 1, statut: 1 });

// Méthode statique pour créer une transaction
operationFinanciereSchema.statics.creerTransaction = async function(data) {
  const Portefeuille = mongoose.model('Portefeuille');
  
  // Vérifier que le compte débit existe et a assez de fonds
  if (data.compteDebit) {
    const compteDebit = await Portefeuille.findById(data.compteDebit);
    if (!compteDebit) {
      throw new Error('Compte débit introuvable');
    }
    if (!compteDebit.peutDebiter(data.montant)) {
      throw new Error('Solde insuffisant ou compte inactif');
    }
  }
  
  // Vérifier que le compte crédit existe
  if (data.compteCredit) {
    const compteCredit = await Portefeuille.findById(data.compteCredit);
    if (!compteCredit) {
      throw new Error('Compte crédit introuvable');
    }
  }
  
  // Créer la transaction
  const transaction = new this(data);
  await transaction.save();
  
  // Mettre à jour les soldes
  if (data.compteDebit) {
    const compteDebit = await Portefeuille.findById(data.compteDebit);
    await compteDebit.mettreAJourSolde();
  }
  
  if (data.compteCredit) {
    const compteCredit = await Portefeuille.findById(data.compteCredit);
    await compteCredit.mettreAJourSolde();
  }
  
  return transaction;
};

// Méthode pour valider une transaction en attente
operationFinanciereSchema.methods.valider = async function() {
  if (this.statut !== 'en_attente') {
    throw new Error('Seules les transactions en attente peuvent être validées');
  }
  
  this.statut = 'validee';
  this.dateValidation = new Date();
  await this.save();
  
  // Mettre à jour les soldes
  const Portefeuille = mongoose.model('Portefeuille');
  if (this.compteDebit) {
    const compteDebit = await Portefeuille.findById(this.compteDebit);
    await compteDebit.mettreAJourSolde();
  }
  if (this.compteCredit) {
    const compteCredit = await Portefeuille.findById(this.compteCredit);
    await compteCredit.mettreAJourSolde();
  }
  
  return this;
};

// Méthode pour annuler une transaction
operationFinanciereSchema.methods.annuler = async function(raison) {
  if (this.statut === 'annulee') {
    throw new Error('Transaction déjà annulée');
  }
  
  this.statut = 'annulee';
  this.notes = (this.notes || '') + '\nAnnulée: ' + raison;
  await this.save();
  
  // Mettre à jour les soldes
  const Portefeuille = mongoose.model('Portefeuille');
  if (this.compteDebit) {
    const compteDebit = await Portefeuille.findById(this.compteDebit);
    await compteDebit.mettreAJourSolde();
  }
  if (this.compteCredit) {
    const compteCredit = await Portefeuille.findById(this.compteCredit);
    await compteCredit.mettreAJourSolde();
  }
  
  return this;
};

// Hook avant sauvegarde
operationFinanciereSchema.pre('save', function(next) {
  if (this.isModified('statut') && this.statut === 'validee' && !this.dateValidation) {
    this.dateValidation = new Date();
  }
  next();
});

module.exports = mongoose.model('OperationFinanciere', operationFinanciereSchema);
