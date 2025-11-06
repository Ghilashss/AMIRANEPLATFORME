/**
 * Middleware d'authentification par API Key
 * Pour les intégrations e-commerce externes
 */

const User = require('../models/User');

/**
 * Vérifier l'API Key dans les headers
 */
exports.apiKeyAuth = async (req, res, next) => {
  try {
    // Récupérer l'API Key depuis le header X-API-Key
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API Key manquante. Ajoutez le header X-API-Key avec votre clé API.'
      });
    }

    // Vérifier que l'API Key commence par 'amr_'
    if (!apiKey.startsWith('amr_')) {
      return res.status(401).json({
        success: false,
        message: 'Format d\'API Key invalide'
      });
    }

    // Chercher l'utilisateur avec cette API Key
    const user = await User.findOne({ apiKey }).select('+apiKey');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'API Key invalide ou expirée'
      });
    }

    // Vérifier que c'est bien un commerçant
    if (user.role !== 'commercant') {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé'
      });
    }

    // Vérifier que le compte est actif
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Compte désactivé'
      });
    }

    // Ajouter l'utilisateur à la requête
    req.user = user;
    req.authenticatedVia = 'api-key';

    next();
  } catch (error) {
    console.error('❌ Erreur apiKeyAuth:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur d\'authentification'
    });
  }
};
