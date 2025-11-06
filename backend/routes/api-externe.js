/**
 * Routes API externes pour intégration e-commerce
 * Sécurisées par API Key
 */

const express = require('express');
const router = express.Router();
const { apiKeyAuth } = require('../middleware/apiKeyAuth');
const Colis = require('../models/Colis');
const Wilaya = require('../models/Wilaya');
const FraisLivraison = require('../models/FraisLivraison');

/**
 * @route   POST /api/externe/colis
 * @desc    Créer un nouveau colis (pour intégration e-commerce)
 * @access  API Key Required
 */
router.post('/colis', apiKeyAuth, async (req, res) => {
  try {
    const {
      numeroSuivi,
      destinataire,
      telephoneDestinataire,
      adresseDestinataire,
      wilayaDestination,
      communeDestination,
      nature,
      poids,
      montant,
      typeLivraison,
      remarques,
      // Données e-commerce
      orderId,
      orderNumber,
      customerEmail
    } = req.body;

    // Validation des champs requis
    if (!destinataire || !telephoneDestinataire || !adresseDestinataire || !wilayaDestination) {
      return res.status(400).json({
        success: false,
        message: 'Données manquantes: destinataire, téléphone, adresse et wilaya sont requis'
      });
    }

    // Vérifier si la wilaya existe
    const wilaya = await Wilaya.findById(wilayaDestination);
    if (!wilaya) {
      return res.status(400).json({
        success: false,
        message: 'Wilaya de destination invalide'
      });
    }

    // Générer un numéro de suivi automatique si non fourni
    let numeroSuiviGenere = numeroSuivi;
    if (!numeroSuiviGenere) {
      const timestamp = Date.now().toString().slice(-8);
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      numeroSuiviGenere = `AMR${timestamp}${random}`;
    }

    // Calculer les frais de livraison si le commerçant a une agence
    let fraisLivraison = 0;
    if (req.user.agence && wilayaDestination) {
      try {
        const frais = await FraisLivraison.findOne({
          wilayaSource: req.user.agence,
          wilayaDestination: wilayaDestination
        });
        
        if (frais) {
          fraisLivraison = frais.tarifBase || 0;
          
          // Ajouter le coût au kilo si poids > 0
          if (poids && poids > 0 && frais.tarifParKg) {
            fraisLivraison += (poids * frais.tarifParKg);
          }
          
          // Ajouter le supplément à domicile
          if (typeLivraison === 'domicile' && frais.supplementDomicile) {
            fraisLivraison += frais.supplementDomicile;
          }
        }
      } catch (error) {
        console.warn('⚠️ Erreur calcul frais livraison:', error.message);
      }
    }

    // Créer le colis
    const colis = await Colis.create({
      numeroSuivi: numeroSuiviGenere,
      expediteur: req.user._id, // Le commerçant authentifié
      destinataire,
      telephoneDestinataire,
      adresseDestinataire,
      wilayaDestination,
      communeDestination,
      nature: nature || 'Marchandise',
      poids: poids || 0,
      montant: montant || 0,
      fraisLivraison,
      typeLivraison: typeLivraison || 'stopdesk',
      status: 'en_attente',
      remarques,
      // Données e-commerce
      metadata: {
        source: 'api-externe',
        orderId,
        orderNumber,
        customerEmail,
        createdVia: 'api-key'
      }
    });

    // Peupler les relations
    await colis.populate([
      { path: 'expediteur', select: 'nom prenom email telephone' },
      { path: 'wilayaDestination', select: 'nom code' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Colis créé avec succès',
      data: colis
    });

  } catch (error) {
    console.error('❌ Erreur création colis API externe:', error);
    
    // Erreur de duplication de numéro de suivi
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Ce numéro de suivi existe déjà'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du colis',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/externe/colis/:id
 * @desc    Obtenir les détails d'un colis
 * @access  API Key Required
 */
router.get('/colis/:id', apiKeyAuth, async (req, res) => {
  try {
    const colis = await Colis.findById(req.params.id)
      .populate('expediteur', 'nom prenom email telephone')
      .populate('wilayaDestination', 'nom code')
      .populate('agentLivraison', 'nom prenom telephone');

    if (!colis) {
      return res.status(404).json({
        success: false,
        message: 'Colis non trouvé'
      });
    }

    // Vérifier que le colis appartient au commerçant
    if (colis.expediteur._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à ce colis'
      });
    }

    res.status(200).json({
      success: true,
      data: colis
    });

  } catch (error) {
    console.error('❌ Erreur récupération colis:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du colis'
    });
  }
});

/**
 * @route   GET /api/externe/colis/tracking/:numeroSuivi
 * @desc    Suivre un colis par son numéro de suivi
 * @access  API Key Required
 */
router.get('/colis/tracking/:numeroSuivi', apiKeyAuth, async (req, res) => {
  try {
    const colis = await Colis.findOne({ numeroSuivi: req.params.numeroSuivi })
      .populate('expediteur', 'nom prenom email telephone')
      .populate('wilayaDestination', 'nom code')
      .populate('agentLivraison', 'nom prenom telephone');

    if (!colis) {
      return res.status(404).json({
        success: false,
        message: 'Aucun colis trouvé avec ce numéro de suivi'
      });
    }

    // Vérifier que le colis appartient au commerçant
    if (colis.expediteur._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé à ce colis'
      });
    }

    res.status(200).json({
      success: true,
      data: colis
    });

  } catch (error) {
    console.error('❌ Erreur tracking colis:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du suivi du colis'
    });
  }
});

/**
 * @route   GET /api/externe/mes-colis
 * @desc    Obtenir tous les colis du commerçant
 * @access  API Key Required
 */
router.get('/mes-colis', apiKeyAuth, async (req, res) => {
  try {
    const { status, limit = 100, page = 1 } = req.query;

    // Construire le filtre
    const filter = { expediteur: req.user._id };
    if (status) {
      filter.status = status;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Récupérer les colis
    const colis = await Colis.find(filter)
      .populate('wilayaDestination', 'nom code')
      .populate('agentLivraison', 'nom prenom telephone')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Compter le total
    const total = await Colis.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: colis.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: colis
    });

  } catch (error) {
    console.error('❌ Erreur récupération colis:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des colis'
    });
  }
});

/**
 * @route   GET /api/externe/status
 * @desc    Vérifier le statut de l'API et l'authentification
 * @access  API Key Required
 */
router.get('/status', apiKeyAuth, async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API connectée avec succès',
    data: {
      commercant: {
        id: req.user._id,
        nom: req.user.nom,
        prenom: req.user.prenom,
        email: req.user.email
      },
      timestamp: new Date().toISOString()
    }
  });
});

module.exports = router;
