const Retour = require('../models/Retour');
const Colis = require('../models/Colis');

// Créer un nouveau retour
exports.createRetour = async (req, res) => {
    try {
        const {
            colisId,
            reference,
            nomDestinataire,
            wilaya,
            motifRetour,
            commentaire,
            livreurNom,
            photo,
            fraisRetour
        } = req.body;

        // Vérifier que le colis existe
        const colis = await Colis.findById(colisId);
        if (!colis) {
            return res.status(404).json({
                success: false,
                message: 'Colis non trouvé'
            });
        }

        // Créer le retour
        const retour = new Retour({
            colisId,
            reference: reference || colis.reference,
            nomDestinataire: nomDestinataire || colis.nomDestinataire,
            wilaya: wilaya || colis.wilayaDest,
            motifRetour,
            commentaire,
            retournePar: req.user.id,
            livreurNom: livreurNom || req.user.nom,
            photo,
            fraisRetour: fraisRetour || 0
        });

        await retour.save();

        // Mettre à jour le statut du colis
        colis.statut = 'retour';
        colis.dateRetour = retour.dateRetour;
        colis.motifRetour = motifRetour;
        await colis.save();

        res.status(201).json({
            success: true,
            message: 'Retour enregistré avec succès',
            data: retour
        });
    } catch (error) {
        console.error('Erreur createRetour:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'enregistrement du retour',
            error: error.message
        });
    }
};

// Récupérer tous les retours
exports.getAllRetours = async (req, res) => {
    try {
        const { startDate, endDate, wilaya, motif } = req.query;
        
        let query = {};
        
        // ✅ FILTRAGE PAR RÔLE
        console.log('🔍 getAllRetours - Rôle:', req.user.role, '| Agence:', req.user.agence);
        
        if (req.user.role === 'commercant') {
            // Commercant voit uniquement ses retours
            const colisCom = await Colis.find({
                'expediteur.id': req.user._id
            }).select('_id');
            
            const colisIds = colisCom.map(c => c._id);
            query.colisId = { $in: colisIds };
            
            console.log(`   → Commercant: ${colisIds.length} colis trouvés`);
            
        } else if (req.user.role === 'agent' || req.user.role === 'agence') {
            // Agent voit retours de son agence
            const colisAgence = await Colis.find({
                $or: [
                    { agence: req.user.agence },
                    { bureauSource: req.user.agence }
                ]
            }).select('_id');
            
            const colisIds = colisAgence.map(c => c._id);
            query.colisId = { $in: colisIds };
            
            console.log(`   → Agent/Agence: ${colisIds.length} colis trouvés pour agence ${req.user.agence}`);
        }
        // Admin: pas de filtre (voit tout)
        
        // Filtrer par date
        if (startDate || endDate) {
            query.dateRetour = {};
            if (startDate) query.dateRetour.$gte = new Date(startDate);
            if (endDate) query.dateRetour.$lte = new Date(endDate);
        }
        
        // Filtrer par wilaya
        if (wilaya) {
            query.wilaya = wilaya;
        }
        
        // Filtrer par motif
        if (motif) {
            query.motifRetour = motif;
        }

        const retours = await Retour.find(query)
            .populate('colisId', 'reference prixColis agence tracking')
            .populate('retournePar', 'nom prenom email')
            .sort({ dateRetour: -1 });

        console.log(`✅ ${retours.length} retours retournés`);

        res.status(200).json({
            success: true,
            data: retours
        });
    } catch (error) {
        console.error('Erreur getAllRetours:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des retours',
            error: error.message
        });
    }
};

// Récupérer un retour par ID
exports.getRetourById = async (req, res) => {
    try {
        const retour = await Retour.findById(req.params.id)
            .populate('colisId')
            .populate('retournePar', 'nom prenom email');

        if (!retour) {
            return res.status(404).json({
                success: false,
                message: 'Retour non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            data: retour
        });
    } catch (error) {
        console.error('Erreur getRetourById:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du retour',
            error: error.message
        });
    }
};

// Mettre à jour un retour
exports.updateRetour = async (req, res) => {
    try {
        const retour = await Retour.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!retour) {
            return res.status(404).json({
                success: false,
                message: 'Retour non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Retour mis à jour avec succès',
            data: retour
        });
    } catch (error) {
        console.error('Erreur updateRetour:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour du retour',
            error: error.message
        });
    }
};

// Supprimer un retour
exports.deleteRetour = async (req, res) => {
    try {
        const retour = await Retour.findByIdAndDelete(req.params.id);

        if (!retour) {
            return res.status(404).json({
                success: false,
                message: 'Retour non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Retour supprimé avec succès'
        });
    } catch (error) {
        console.error('Erreur deleteRetour:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression du retour',
            error: error.message
        });
    }
};

// Statistiques des retours par motif
exports.getRetoursStats = async (req, res) => {
    try {
        const stats = await Retour.aggregate([
            {
                $group: {
                    _id: '$motifRetour',
                    count: { $sum: 1 },
                    totalFrais: { $sum: '$fraisRetour' }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Erreur getRetoursStats:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du calcul des statistiques',
            error: error.message
        });
    }
};
