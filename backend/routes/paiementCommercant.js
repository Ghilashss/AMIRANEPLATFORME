const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const paiementCommercantController = require('../controllers/paiementCommercantController');

// ===================================================
// ROUTES PAIEMENT COMMERÇANT
// ===================================================

// Obtenir montant à recevoir pour un commerçant
router.post('/montant-a-recevoir', auth, paiementCommercantController.getMontantARecevoir);

// Obtenir colis livrés non payés pour un commerçant
router.post('/colis-livres-non-payes', auth, paiementCommercantController.getColisLivresNonPayes);

// Agent: Liste des commerçants avec paiements en attente
router.get('/commercants-paiements', auth, paiementCommercantController.getCommercantsPaiements);

// Agent: Verser montant à un commerçant
router.post('/verser-au-commercant', auth, paiementCommercantController.verserAuCommercant);

module.exports = router;
