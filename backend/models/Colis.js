const mongoose = require('mongoose');

const colisSchema = new mongoose.Schema({
  tracking: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  
  // Informations expéditeur (commercant)
  expediteur: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    nom: String,
    telephone: String,
    adresse: String,
    wilaya: String
  },
  
  // Champs séparés pour l'expéditeur (affichage dans le tableau)
  nomExpediteur: {
    type: String,
    trim: true
  },
  telExpediteur: {
    type: String,
    trim: true
  },
  
  // Rôle du créateur du colis (admin, agent, agence, commercant, etc.)
  createdBy: {
    type: String,
    enum: ['admin', 'agent', 'agence', 'commercant'],
    default: 'commercant'
  },
  
  // Bureau source (agence de départ) - utilisé quand admin crée un colis
  bureauSource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agence'
  },
  
  // Informations destinataire
  destinataire: {
    nom: {
      type: String,
      required: [true, 'Le nom du destinataire est requis']
    },
    telephone: {
      type: String,
      required: [true, 'Le téléphone du destinataire est requis']
    },
    adresse: {
      type: String,
      required: [true, 'L\'adresse de livraison est requise']
    },
    wilaya: {
      type: String,
      required: [true, 'La wilaya de livraison est requise']
    },
    commune: String
  },
  
  // Informations colis
  typeLivraison: {
    type: String,
    enum: ['domicile', 'stopdesk'],
    default: 'domicile'
  },
  typeArticle: {
    type: String,
    enum: ['vetements', 'electronique', 'alimentaire', 'fragile', 'autre'],
    default: 'autre'
  },
  typeColis: {
    type: String,
    enum: ['standard', 'fragile', 'express', 'volumineux'],
    default: 'standard'
  },
  contenu: {
    type: String,
    trim: true
  },
  poids: {
    type: Number,
    default: 0
  },
  longueur: Number,
  largeur: Number,
  hauteur: Number,
  
  // Valeurs financières
  montant: {
    type: Number,
    required: [true, 'Le montant est requis'],
    min: 0
  },
  fraisLivraison: {
    type: Number,
    required: true,
    default: 0
  },
  totalAPayer: {
    type: Number,
    required: true
  },
  
  // Statut et suivi
  status: {
    type: String,
    enum: [
      'en_attente',
      'accepte',
      'en_preparation',
      'pret_a_expedier',
      'expedie',
      'en_transit',
      'arrive_agence',
      'en_livraison',
      'livre',
      'echec_livraison',
      'en_retour',
      'retourne',
      'annule'
    ],
    default: 'en_attente'
  },
  
  // Affectations
  agence: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agence'
  },
  livreur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Historique
  historique: [{
    status: String,
    description: String,
    utilisateur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Dates importantes
  dateCreation: {
    type: Date,
    default: Date.now
  },
  dateExpedition: Date,
  dateLivraisonPrevue: Date,
  dateLivraison: Date,
  
  // Notes et remarques
  notes: String,
  remarques: String,
  
  // Images et documents
  photos: [String],
  qrCode: String,
  
  // Tentatives de livraison
  tentativesLivraison: {
    type: Number,
    default: 0
  },
  
  // Paiement
  paiementStatus: {
    type: String,
    enum: ['en_attente', 'paye', 'rembourse'],
    default: 'en_attente'
  },
  
  // Options
  options: {
    ouvertureALivraison: {
      type: Boolean,
      default: false
    },
    echange: {
      type: Boolean,
      default: false
    },
    fragile: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Générer un numéro de tracking unique
colisSchema.pre('save', function(next) {
  if (!this.tracking) {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    this.tracking = `COL${year}${month}${day}${random}`;
  }
  next();
});

// Calculer le total à payer
colisSchema.pre('save', function(next) {
  this.totalAPayer = this.montant + this.fraisLivraison;
  next();
});

module.exports = mongoose.model('Colis', colisSchema);
