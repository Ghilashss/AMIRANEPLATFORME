const mongoose = require('mongoose');

const FraisLivraisonSchema = new mongoose.Schema({
    wilayaSource: {
        type: String,
        required: true
    },
    wilayaDest: {
        type: String,
        required: true
    },
    fraisStopDesk: {
        type: Number,
        required: true,
        default: 0
    },
    fraisDomicile: {
        type: Number,
        required: true,
        default: 0
    },
    // Détails des frais pour affichage dans le tableau
    baseBureau: {
        type: Number,
        default: 0
    },
    parKgBureau: {
        type: Number,
        default: 0
    },
    baseDomicile: {
        type: Number,
        default: 0
    },
    parKgDomicile: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Index pour recherche rapide
FraisLivraisonSchema.index({ wilayaSource: 1, wilayaDest: 1 });

module.exports = mongoose.model('FraisLivraison', FraisLivraisonSchema);
