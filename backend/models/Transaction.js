const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  numeroTransaction: {
    type: String,
    unique: true,
    sparse: true // Permet des valeurs null temporairement
  },
  type: {
    type: String,
    enum: [
      'versement_agent_admin',           // Agent verse à Admin
      'paiement_agent_commercant',       // Agent paie Commerçant (prix colis)
      'paiement_commercant_agent',       // Commerçant paie Agent (frais retour)
      'versement_commercant_agent',      // LEGACY - À garder pour compatibilité
      'paiement_commercant',             // LEGACY - À garder pour compatibilité
      'retrait'                          // LEGACY - À garder pour compatibilité
    ],
    required: true
  },
  sousType: {
    type: String,
    enum: ['frais_livraison', 'frais_retour', 'prix_colis', 'autre'],
    required: false // Optionnel pour rétrocompatibilité
  },
  colis: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Colis'
  }],
  montant: {
    type: Number,
    required: true,
    min: 0
  },
  emetteur: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    nom: String,
    email: String,
    role: String
  },
  destinataire: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    nom: String,
    email: String,
    role: String
  },
  methodePaiement: {
    type: String,
    enum: ['especes', 'virement', 'cheque', 'carte'],
    default: 'especes'
  },
  referencePaiement: String,
  description: String,
  statut: {
    type: String,
    enum: ['en_attente', 'validee', 'refusee', 'annulee'],
    default: 'en_attente'
  },
  dateTransaction: {
    type: Date,
    default: Date.now
  },
  dateValidation: Date,
  validePar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  motifRefus: String,
  pieceJointe: String,
  metadata: {
    reference: String,
    fraisLivraison: Number,
    fraisRetour: Number,
    montantColis: Number,
    nbColis: Number,
    periode: String
  }
}, {
  timestamps: true
});

// Générer un numéro de transaction unique
transactionSchema.pre('save', async function(next) {
  if (!this.numeroTransaction) {
    const count = await this.constructor.countDocuments();
    this.numeroTransaction = `TRX${Date.now()}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
