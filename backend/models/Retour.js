const mongoose = require('mongoose');

const RetourSchema = new mongoose.Schema({
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
    dateRetour: {
        type: Date,
        default: Date.now
    },
    motifRetour: {
        type: String,
        required: true,
        enum: [
            'client_absent',
            'refus_client',
            'adresse_introuvable',
            'telephone_incorrect',
            'prix_trop_eleve',
            'colis_endommage',
            'erreur_commande',
            'autre'
        ]
    },
    commentaire: String,
    retournePar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    livreurNom: String,
    photo: String, // Photo du retour
    fraisRetour: {
        type: Number,
        default: 0
    },
    statut: {
        type: String,
        enum: ['en_attente', 'traité'],
        default: 'en_attente'
    },
    dateTraitement: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

RetourSchema.index({ colisId: 1 });
RetourSchema.index({ dateRetour: -1 });
RetourSchema.index({ motifRetour: 1 });

module.exports = mongoose.model('Retour', RetourSchema);
