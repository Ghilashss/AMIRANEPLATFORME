const mongoose = require('mongoose');

const wilayaSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Le code de wilaya est requis'],
    unique: true,
    trim: true
  },
  nom: {
    type: String,
    required: [true, 'Le nom de wilaya est requis'],
    trim: true
  },
  fraisLivraison: {
    domicile: {
      type: Number,
      default: 0
    },
    stopDesk: {
      type: Number,
      default: 0
    }
  },
  delaiLivraison: {
    type: String,
    default: '2-3 jours'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Wilaya', wilayaSchema);
