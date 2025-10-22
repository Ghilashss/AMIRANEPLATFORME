const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  verserSomme,
  getVersements,
  validerVersement,
  refuserVersement,
  getSoldeCaisse,
  getHistoriqueCaisse,
  getVersementsEnAttente,
  getCaisseAgent
} = require('../controllers/caisseController');

// Routes pour les agents
router.post('/verser', protect, authorize('agent'), verserSomme);
router.get('/solde', protect, authorize('agent'), getSoldeCaisse);
router.get('/historique', protect, authorize('agent'), getHistoriqueCaisse);

// Routes pour l'admin
router.get('/versements', protect, authorize('admin'), getVersements);
router.get('/versements/en-attente', protect, authorize('admin'), getVersementsEnAttente);
router.put('/versements/:id/valider', protect, authorize('admin'), validerVersement);
router.put('/versements/:id/refuser', protect, authorize('admin'), refuserVersement);
router.get('/agent/:agentId', protect, authorize('admin'), getCaisseAgent);

module.exports = router;
