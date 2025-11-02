const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getMontantARecevoir,
  getColisLivresNonPayes,
  getCommercantsPaiements,
  verserAuCommercant
} = require('../controllers/paiementCommercantController');

// ===================================================
// ROUTES PAIEMENT COMMERÇANT
// ===================================================

// Obtenir montant à recevoir pour un commerçant
router.post('/montant-a-recevoir', protect, getMontantARecevoir);

// Obtenir colis livrés non payés pour un commerçant
router.post('/colis-livres-non-payes', protect, getColisLivresNonPayes);

// Agent: Liste des commerçants avec paiements en attente
router.get('/commercants-paiements', protect, getCommercantsPaiements);

// Agent: Verser montant à un commerçant
router.post('/verser-au-commercant', protect, verserAuCommercant);

module.exports = router;
