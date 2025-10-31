const express = require('express');
const router = express.Router();
const gestionFinanceController = require('../controllers/gestionFinanceController');

// ===================================================
// ROUTES GESTION FINANCE
// ===================================================

// Route: GET /api/finance/portefeuille
// Obtenir le portefeuille d'un utilisateur
router.post('/portefeuille', gestionFinanceController.obtenirPortefeuille);

// Route: GET /api/finance/statistiques
// Obtenir les statistiques financières
router.post('/statistiques', gestionFinanceController.obtenirStatistiques);

// Route: GET /api/finance/operations
// Obtenir l'historique des opérations
router.post('/operations', gestionFinanceController.obtenirOperations);

// Route: POST /api/finance/virement
// Effectuer un virement manuel
router.post('/virement', gestionFinanceController.effectuerVirement);

// Route: POST /api/finance/marquer-paye
// Marquer un colis comme payé
router.post('/marquer-paye', gestionFinanceController.marquerColisPaye);

// Route: POST /api/finance/virement-commercant-agent
// Virement du commerçant vers l'agent
router.post('/virement-commercant-agent', gestionFinanceController.virementCommercantVersAgent);

// Route: POST /api/finance/virements-en-attente
// Obtenir les virements en attente pour l'agent
router.post('/virements-en-attente', gestionFinanceController.obtenirVirementsEnAttente);

// Route: POST /api/finance/valider-virement-commercant
// Valider un virement du commerçant (Agent uniquement)
router.post('/valider-virement-commercant', gestionFinanceController.validerVirementCommercant);

// Route: POST /api/finance/refuser-virement-commercant
// Refuser un virement du commerçant (Agent uniquement)
router.post('/refuser-virement-commercant', gestionFinanceController.refuserVirementCommercant);

// Route: POST /api/finance/virement-agent-admin
// Virement de l'agent vers l'admin
router.post('/virement-agent-admin', gestionFinanceController.virementAgentVersAdmin);

// ===== ROUTES ADMIN =====

// Route: GET /api/finance/admin/portefeuilles
// Obtenir tous les portefeuilles (Admin uniquement)
router.get('/admin/portefeuilles', gestionFinanceController.obtenirTousPortefeuilles);

// Route: GET /api/finance/admin/operations
// Obtenir toutes les opérations (Admin uniquement)
router.get('/admin/operations', gestionFinanceController.obtenirToutesOperations);

module.exports = router;
