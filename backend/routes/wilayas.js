const express = require('express');
const router = express.Router();
const {
  createWilaya,
  getWilayas,
  getWilayaByCode,
  updateWilaya,
  updateFraisLivraison,
  deleteWilaya
} = require('../controllers/wilayaController');
const { protect, authorize } = require('../middleware/auth');

// Routes publiques
router.get('/', getWilayas);
router.get('/:code', getWilayaByCode);

// Routes protégées (Admin uniquement)
router.use(protect);
router.use(authorize('admin'));

router.post('/', createWilaya);
router.put('/:code', updateWilaya);
router.put('/:code/frais', updateFraisLivraison);
router.delete('/:code', deleteWilaya);

module.exports = router;
