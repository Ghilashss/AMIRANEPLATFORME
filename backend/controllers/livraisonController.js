const Livraison = require('../models/Livraison');
const Colis = require('../models/Colis');

// Créer une nouvelle livraison
exports.createLivraison = async (req, res) => {
    try {
        const {
            colisId,
            reference,
            nomDestinataire,
            wilaya,
            livreurNom,
            signature,
            photo,
            notes,
            montantPaye
        } = req.body;

        // Vérifier que le colis existe
        const colis = await Colis.findById(colisId);
        if (!colis) {
            return res.status(404).json({
                success: false,
                message: 'Colis non trouvé'
            });
        }

        // Créer la livraison
        const livraison = new Livraison({
            colisId,
            reference: reference || colis.reference,
            nomDestinataire: nomDestinataire || colis.nomDestinataire,
            wilaya: wilaya || colis.wilayaDest,
            livrePar: req.user.id,
            livreurNom: livreurNom || req.user.nom,
            signature,
            photo,
            notes,
            montantPaye: montantPaye || colis.prixColis
        });

        await livraison.save();

        // Mettre à jour le statut du colis
        colis.statut = 'livre';
        colis.dateLivraison = livraison.dateLivraison;
        await colis.save();

        res.status(201).json({
            success: true,
            message: 'Livraison enregistrée avec succès',
            data: livraison
        });
    } catch (error) {
        console.error('Erreur createLivraison:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'enregistrement de la livraison',
            error: error.message
        });
    }
};

// Récupérer toutes les livraisons
exports.getAllLivraisons = async (req, res) => {
    try {
        const { startDate, endDate, wilaya } = req.query;
        
        let query = {};
        
        // ✅ FILTRAGE PAR RÔLE
        console.log('🔍 getAllLivraisons - Rôle:', req.user.role, '| Agence:', req.user.agence);
        
        if (req.user.role === 'commercant') {
            // Commercant voit uniquement ses livraisons
            const colisCom = await Colis.find({
                'expediteur.id': req.user._id
            }).select('_id');
            
            const colisIds = colisCom.map(c => c._id);
            query.colisId = { $in: colisIds };
            
            console.log(`   → Commercant: ${colisIds.length} colis trouvés`);
            
        } else if (req.user.role === 'agent' || req.user.role === 'agence') {
            // Agent voit livraisons de son agence
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
            query.dateLivraison = {};
            if (startDate) query.dateLivraison.$gte = new Date(startDate);
            if (endDate) query.dateLivraison.$lte = new Date(endDate);
        }
        
        // Filtrer par wilaya
        if (wilaya) {
            query.wilaya = wilaya;
        }

        const livraisons = await Livraison.find(query)
            .populate('colisId', 'reference prixColis agence tracking')
            .populate('livrePar', 'nom prenom email')
            .sort({ dateLivraison: -1 });

        console.log(`✅ ${livraisons.length} livraisons retournées`);

        res.status(200).json({
            success: true,
            data: livraisons
        });
    } catch (error) {
        console.error('Erreur getAllLivraisons:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des livraisons',
            error: error.message
        });
    }
};

// Récupérer une livraison par ID
exports.getLivraisonById = async (req, res) => {
    try {
        const livraison = await Livraison.findById(req.params.id)
            .populate('colisId')
            .populate('livrePar', 'nom prenom email');

        if (!livraison) {
            return res.status(404).json({
                success: false,
                message: 'Livraison non trouvée'
            });
        }

        res.status(200).json({
            success: true,
            data: livraison
        });
    } catch (error) {
        console.error('Erreur getLivraisonById:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de la livraison',
            error: error.message
        });
    }
};

// Mettre à jour une livraison
exports.updateLivraison = async (req, res) => {
    try {
        const livraison = await Livraison.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!livraison) {
            return res.status(404).json({
                success: false,
                message: 'Livraison non trouvée'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Livraison mise à jour avec succès',
            data: livraison
        });
    } catch (error) {
        console.error('Erreur updateLivraison:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour de la livraison',
            error: error.message
        });
    }
};

// Supprimer une livraison
exports.deleteLivraison = async (req, res) => {
    try {
        const livraison = await Livraison.findByIdAndDelete(req.params.id);

        if (!livraison) {
            return res.status(404).json({
                success: false,
                message: 'Livraison non trouvée'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Livraison supprimée avec succès'
        });
    } catch (error) {
        console.error('Erreur deleteLivraison:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression de la livraison',
            error: error.message
        });
    }
};
