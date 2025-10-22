const mongoose = require('mongoose');

const agenceSchema = new mongoose.Schema({
  code: {
    type: String,
    required: false,  // Changé à false car généré automatiquement
    unique: true,
    trim: true
  },
  nom: {
    type: String,
    required: [true, 'Le nom de l\'agence est requis'],
    trim: true
  },
  wilaya: {
    type: String,
    required: [true, 'La wilaya est requise'],
    trim: true
  },
  wilayaText: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    trim: true
  },
  telephone: {
    type: String,
    required: [true, 'Le téléphone est requis'],
    trim: true
  },
  adresse: {
    type: String,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  responsable: {
    nom: String,
    telephone: String,
    email: String
  },
  caisse: {
    totalCollecte: {
      type: Number,
      default: 0
    },
    totalVerse: {
      type: Number,
      default: 0
    },
    solde: {
      type: Number,
      default: 0
    },
    devise: {
      type: String,
      default: 'DA'
    }
  },
  statistiques: {
    totalColis: {
      type: Number,
      default: 0
    },
    colisLivres: {
      type: Number,
      default: 0
    },
    colisEnCours: {
      type: Number,
      default: 0
    },
    colisRetournes: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  dateCreation: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Générer un code d'agence automatiquement
agenceSchema.pre('save', function(next) {
  if (!this.code) {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.code = `AG${year}${month}-${this.wilaya}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Agence', agenceSchema);
