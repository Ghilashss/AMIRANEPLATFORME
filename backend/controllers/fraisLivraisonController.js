const FraisLivraison = require('../models/FraisLivraison');
const Wilaya = require('../models/Wilaya');

// Créer ou mettre à jour un frais de livraison
exports.setFraisLivraison = async (req, res) => {
    try {
        const { 
            wilayaSource, 
            wilayaDest, 
            fraisStopDesk, 
            fraisDomicile,
            baseBureau,
            parKgBureau,
            baseDomicile,
            parKgDomicile
        } = req.body;

        // Vérifier si un frais existe déjà pour cette combinaison
        let frais = await FraisLivraison.findOne({ wilayaSource, wilayaDest });

        if (frais) {
            // Mise à jour
            frais.fraisStopDesk = fraisStopDesk;
            frais.fraisDomicile = fraisDomicile;
            frais.baseBureau = baseBureau || 0;
            frais.parKgBureau = parKgBureau || 0;
            frais.baseDomicile = baseDomicile || 0;
            frais.parKgDomicile = parKgDomicile || 0;
            frais.updatedAt = Date.now();
            await frais.save();
        } else {
            // Création
            frais = new FraisLivraison({
                wilayaSource,
                wilayaDest,
                fraisStopDesk,
                fraisDomicile,
                baseBureau: baseBureau || 0,
                parKgBureau: parKgBureau || 0,
                baseDomicile: baseDomicile || 0,
                parKgDomicile: parKgDomicile || 0,
                createdBy: req.user.id
            });
            await frais.save();
        }

        res.status(200).json({
            success: true,
            message: 'Frais de livraison enregistré avec succès',
            data: frais
        });
    } catch (error) {
        console.error('Erreur setFraisLivraison:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'enregistrement des frais',
            error: error.message
        });
    }
};

// Récupérer tous les frais de livraison
exports.getAllFraisLivraison = async (req, res) => {
    try {
        const frais = await FraisLivraison.find().sort({ wilayaSource: 1, wilayaDest: 1 });

        // Enrichir avec les noms des wilayas
        const fraisAvecNoms = await Promise.all(frais.map(async (f) => {
            const wilayaSource = await Wilaya.findOne({ code: f.wilayaSource });
            const wilayaDest = await Wilaya.findOne({ code: f.wilayaDest });
            
            return {
                _id: f._id,
                wilayaSource: f.wilayaSource,
                nomWilayaSource: wilayaSource ? wilayaSource.nom : f.wilayaSource,
                wilayaSourceId: wilayaSource ? wilayaSource._id : null,
                wilayaDest: f.wilayaDest,
                nomWilayaDest: wilayaDest ? wilayaDest.nom : f.wilayaDest,
                wilayaDestId: wilayaDest ? wilayaDest._id : null,
                fraisStopDesk: f.fraisStopDesk,
                fraisDomicile: f.fraisDomicile,
                baseBureau: f.baseBureau,
                parKgBureau: f.parKgBureau,
                baseDomicile: f.baseDomicile,
                parKgDomicile: f.parKgDomicile,
                createdBy: f.createdBy,
                createdAt: f.createdAt,
                updatedAt: f.updatedAt
            };
        }));

        res.status(200).json({
            success: true,
            count: fraisAvecNoms.length,
            data: fraisAvecNoms
        });
    } catch (error) {
        console.error('Erreur getAllFraisLivraison:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des frais',
            error: error.message
        });
    }
};

// Récupérer un frais spécifique
exports.getFraisLivraison = async (req, res) => {
    try {
        const { wilayaSource, wilayaDest } = req.query;

        if (!wilayaSource || !wilayaDest) {
            return res.status(400).json({
                success: false,
                message: 'wilayaSource et wilayaDest sont requis'
            });
        }

        const frais = await FraisLivraison.findOne({ wilayaSource, wilayaDest });

        if (!frais) {
            return res.status(404).json({
                success: false,
                message: 'Frais de livraison non configuré pour cette combinaison'
            });
        }

        res.status(200).json({
            success: true,
            data: frais
        });
    } catch (error) {
        console.error('Erreur getFraisLivraison:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du frais',
            error: error.message
        });
    }
};

// Supprimer un frais de livraison
exports.deleteFraisLivraison = async (req, res) => {
    try {
        const { id } = req.params;

        const frais = await FraisLivraison.findByIdAndDelete(id);

        if (!frais) {
            return res.status(404).json({
                success: false,
                message: 'Frais de livraison non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Frais de livraison supprimé avec succès'
        });
    } catch (error) {
        console.error('Erreur deleteFraisLivraison:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la suppression du frais',
            error: error.message
        });
    }
};
