const express = require('express');
const router = express.Router();
const fraisLivraisonController = require('../controllers/fraisLivraisonController');
const { protect } = require('../middleware/auth');

// Toutes les routes nécessitent l'authentification
router.use(protect);

// POST /api/frais-livraison - Créer ou mettre à jour un frais
router.post('/', fraisLivraisonController.setFraisLivraison);

// GET /api/frais-livraison - Récupérer tous les frais
router.get('/', fraisLivraisonController.getAllFraisLivraison);

// GET /api/frais-livraison/search - Récupérer un frais spécifique
router.get('/search', fraisLivraisonController.getFraisLivraison);

// DELETE /api/frais-livraison/:id - Supprimer un frais
router.delete('/:id', fraisLivraisonController.deleteFraisLivraison);

module.exports = router;
