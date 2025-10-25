const mongoose = require('mongoose');

/**
 * Modèle TransactionFinanciere - Mouvements entre comptes
 * Type de transactions possibles:
 * - livraison_commercant: Commerçant reçoit le prix du colis livré
 * - retour_vers_agence: Commerçant paie les frais de retour à l'agence
 * - frais_vers_admin: Agence verse les frais de livraison à l'admin
 * - virement_manuel: Virement manuel entre comptes
 */
const transactionFinanciereSchema = new mongoose.Schema({
  numeroTransaction: {
    type: String,
    unique: true,
    required: true
  },
  typeTransaction: {
    type: String,
    enum: [
      'livraison_commercant',      // Colis livré → crédit commerçant
      'retour_vers_agence',         // Colis retourné → débit commerçant, crédit agence
      'frais_vers_admin',           // Agence verse frais → débit agence, crédit admin
      'virement_manuel',            // Virement manuel entre comptes
      'recharge_compte',            // Recharge de compte
      'retrait_compte'              // Retrait de compte
    ],
    required: true
  },
  montant: {
    type: Number,
    required: true,
    min: 0,
    get: v => Math.round(v * 100) / 100
  },
  // Compte débité (qui paie)
  debit_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Compte',
    required: function() {
      return this.typeTransaction !== 'recharge_compte';
    }
  },
  debit_nom: String,
  
  // Compte crédité (qui reçoit)
  credit_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Compte',
    required: function() {
      return this.typeTransaction !== 'retrait_compte';
    }
  },
  credit_nom: String,
  
  // Référence au colis (si applicable)
  referenceColis: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Colis'
  },
  codeColis: String,
  
  // Statut de la transaction
  statut: {
    type: String,
    enum: ['en_attente', 'validee', 'refusee', 'annulee'],
    default: 'en_attente'
  },
  
  // Détails
  description: {
    type: String,
    required: true
  },
  methode: {
    type: String,
    enum: ['automatique', 'manuel', 'especes', 'virement', 'cheque'],
    default: 'automatique'
  },
  
  // Validation
  validePar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  dateValidation: Date,
  motifRefus: String,
  
  // Metadata
  metadata: {
    prixColis: Number,
    fraisLivraison: Number,
    fraisRetour: Number,
    wilayaSource: String,
    wilayaDestination: String
  }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Index
transactionFinanciereSchema.index({ numeroTransaction: 1 });
transactionFinanciereSchema.index({ debit_id: 1, statut: 1 });
transactionFinanciereSchema.index({ credit_id: 1, statut: 1 });
transactionFinanciereSchema.index({ referenceColis: 1 });
transactionFinanciereSchema.index({ createdAt: -1 });

// Générer numéro de transaction automatique
transactionFinanciereSchema.pre('save', async function(next) {
  if (!this.numeroTransaction) {
    const count = await this.constructor.countDocuments();
    const timestamp = Date.now();
    this.numeroTransaction = `TRX${timestamp}${String(count + 1).padStart(4, '0')}`;
  }
  
  // Arrondir le montant
  if (this.isModified('montant')) {
    this.montant = Math.round(this.montant * 100) / 100;
  }
  
  next();
});

// Middleware post-save: Mettre à jour les soldes des comptes
transactionFinanciereSchema.post('save', async function(doc) {
  if (doc.statut === 'validee') {
    const Compte = mongoose.model('Compte');
    
    // Recalculer le solde du compte débité
    if (doc.debit_id) {
      const compteDebit = await Compte.findById(doc.debit_id);
      if (compteDebit) {
        await compteDebit.recalculerSolde();
      }
    }
    
    // Recalculer le solde du compte crédité
    if (doc.credit_id) {
      const compteCredit = await Compte.findById(doc.credit_id);
      if (compteCredit) {
        await compteCredit.recalculerSolde();
      }
    }
  }
});

module.exports = mongoose.model('TransactionFinanciere', transactionFinanciereSchema);
