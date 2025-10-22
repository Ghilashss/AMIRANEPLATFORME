const express = require('express');
const router = express.Router();
const {
  createAgence,
  getAgences,
  getAgenceById,
  updateAgence,
  deleteAgence,
  getAgenceStats,
  getAgencesByWilaya
} = require('../controllers/agenceController');
const { protect, authorize } = require('../middleware/auth');

// Routes publiques
router.get('/wilaya/:code', getAgencesByWilaya);

// Routes protégées
router.use(protect);

router.route('/')
  .get(getAgences)
  .post(authorize('admin'), createAgence);

router.route('/:id')
  .get(getAgenceById)
  .put(authorize('admin'), updateAgence)
  .delete(authorize('admin'), deleteAgence);

router.get('/:id/stats', authorize('admin', 'agence'), getAgenceStats);

module.exports = router;
