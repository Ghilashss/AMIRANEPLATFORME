// ===================================================
// ROUTES PAIEMENT ADMIN (Agent → Admin - Frais Livraison)
// ===================================================

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const paiementAdminController = require('../controllers/paiementAdminController');

// GET /api/paiement-admin/frais-en-attente
// Obtenir les frais de livraison en attente pour l'agent connecté
router.get('/frais-en-attente', protect, paiementAdminController.getFraisEnAttente);

// POST /api/paiement-admin/verser
// Créer une demande de versement des frais à l'admin
router.post('/verser', protect, paiementAdminController.verserFraisAdmin);

module.exports = router;
