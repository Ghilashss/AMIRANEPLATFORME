const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

// Routes protégées
router.use(protect);

// Routes générales
router.post('/', transactionController.createTransaction);
router.get('/', transactionController.getTransactions);
router.get('/caisse', transactionController.getSoldeCaisse);
router.get('/caisse-detaillee', transactionController.getCaisseDetaillee);

// Routes paiements
router.post('/payer-commercant', transactionController.payerCommercant);
router.post('/payer-frais-retour', transactionController.payerFraisRetour);

// Routes admin
router.put('/:id/valider', transactionController.validerTransaction);
router.get('/statistiques/admin', transactionController.getStatistiquesAdmin);

module.exports = router;
