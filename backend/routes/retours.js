const express = require('express');
const router = express.Router();
const retourController = require('../controllers/retourController');
const { protect } = require('../middleware/auth');

// Toutes les routes nécessitent l'authentification
router.use(protect);

// POST /api/retours - Créer un nouveau retour
router.post('/', retourController.createRetour);

// GET /api/retours - Récupérer tous les retours
router.get('/', retourController.getAllRetours);

// GET /api/retours/stats - Statistiques des retours
router.get('/stats', retourController.getRetoursStats);

// GET /api/retours/:id - Récupérer un retour
router.get('/:id', retourController.getRetourById);

// PUT /api/retours/:id - Mettre à jour un retour
router.put('/:id', retourController.updateRetour);

// DELETE /api/retours/:id - Supprimer un retour
router.delete('/:id', retourController.deleteRetour);

module.exports = router;
