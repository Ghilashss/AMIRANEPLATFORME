const express = require('express');
const router = express.Router();
const {
  createColis,
  getColis,
  getColisById,
  trackColis,
  updateColisStatus,
  assignColisToAgence,
  assignColisToLivreur,
  getColisStats,
  deleteColis
} = require('../controllers/colisController');
const { protect, authorize } = require('../middleware/auth');

// Routes publiques
router.get('/tracking/:tracking', trackColis);

// Routes protégées
router.use(protect);

router.route('/')
  .get(getColis)
  .post(createColis);

router.get('/stats', getColisStats);

router.route('/:id')
  .get(getColisById)
  .delete(deleteColis);

router.put('/:id/status', authorize('admin', 'agence', 'agent'), updateColisStatus);
router.put('/:id/assign-agence', authorize('admin'), assignColisToAgence);
router.put('/:id/assign-livreur', authorize('agence', 'admin'), assignColisToLivreur);

module.exports = router;
