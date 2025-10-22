const express = require('express');
const router = express.Router();
const livraisonController = require('../controllers/livraisonController');
const { protect } = require('../middleware/auth');

// Toutes les routes nécessitent l'authentification
router.use(protect);

// POST /api/livraisons - Créer une nouvelle livraison
router.post('/', livraisonController.createLivraison);

// GET /api/livraisons - Récupérer toutes les livraisons
router.get('/', livraisonController.getAllLivraisons);

// GET /api/livraisons/:id - Récupérer une livraison
router.get('/:id', livraisonController.getLivraisonById);

// PUT /api/livraisons/:id - Mettre à jour une livraison
router.put('/:id', livraisonController.updateLivraison);

// DELETE /api/livraisons/:id - Supprimer une livraison
router.delete('/:id', livraisonController.deleteLivraison);

module.exports = router;
