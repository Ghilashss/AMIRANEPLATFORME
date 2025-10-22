const mongoose = require('mongoose');

const LivraisonSchema = new mongoose.Schema({
    colisId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Colis',
        required: true
    },
    reference: {
        type: String,
        required: true
    },
    nomDestinataire: String,
    wilaya: String,
    dateLivraison: {
        type: Date,
        default: Date.now
    },
    livrePar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    livreurNom: String,
    signature: String, // Base64 ou URL de la signature
    photo: String, // URL de la photo de livraison
    notes: String,
    montantPaye: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

LivraisonSchema.index({ colisId: 1 });
LivraisonSchema.index({ dateLivraison: -1 });

module.exports = mongoose.model('Livraison', LivraisonSchema);
