const express = require('express');
const router = express.Router();
const {
  getCompte,
  getStatsCaisse,
  creerTransaction,
  validerTransaction,
  refuserTransaction,
  getAllTransactions
} = require('../controllers/caisseControllerNew');

const { protect } = require('../middleware/auth');

// Routes protégées
router.use(protect);

// Récupérer le compte et ses transactions
router.get('/compte/:userId', getCompte);

// Statistiques de caisse
router.get('/stats/:userId', getStatsCaisse);

// Créer une transaction manuelle
router.post('/transaction', creerTransaction);

// Valider une transaction (Admin seulement)
router.put('/transaction/:id/valider', validerTransaction);

// Refuser une transaction (Admin seulement)
router.put('/transaction/:id/refuser', refuserTransaction);

// Voir toutes les transactions (Admin seulement)
router.get('/transactions', getAllTransactions);

module.exports = router;
