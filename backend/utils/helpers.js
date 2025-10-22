const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

/**
 * Générer un QR code pour un colis
 * @param {string} tracking - Numéro de tracking
 * @param {string} outputPath - Chemin de sortie (optionnel)
 * @returns {Promise<string>} - Chemin du fichier ou base64
 */
exports.generateQRCode = async (tracking, outputPath = null) => {
  try {
    const qrData = {
      tracking,
      url: `${process.env.API_URL}/api/colis/tracking/${tracking}`,
      timestamp: Date.now()
    };

    if (outputPath) {
      // Sauvegarder dans un fichier
      await QRCode.toFile(outputPath, JSON.stringify(qrData), {
        width: 300,
        margin: 2
      });
      return outputPath;
    } else {
      // Retourner en base64
      const qrBase64 = await QRCode.toDataURL(JSON.stringify(qrData), {
        width: 300,
        margin: 2
      });
      return qrBase64;
    }
  } catch (error) {
    console.error('Erreur génération QR code:', error);
    throw error;
  }
};

/**
 * Calculer les frais de livraison
 * @param {string} wilayaCode - Code de la wilaya
 * @param {string} typeLivraison - Type de livraison (domicile/stopdesk)
 * @param {number} poids - Poids du colis en kg
 * @returns {number} - Frais de livraison
 */
exports.calculateFraisLivraison = (wilayaCode, typeLivraison, poids = 1) => {
  // Tarifs de base (à ajuster selon vos besoins)
  const tarifsBase = {
    domicile: 500,
    stopdesk: 350
  };

  let frais = tarifsBase[typeLivraison] || tarifsBase.domicile;

  // Ajouter un supplément pour le poids
  if (poids > 2) {
    frais += (poids - 2) * 50; // 50 DA par kg supplémentaire
  }

  return frais;
};

/**
 * Formater une date
 * @param {Date} date - Date à formater
 * @returns {string} - Date formatée
 */
exports.formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Générer un code unique
 * @param {string} prefix - Préfixe du code
 * @param {number} length - Longueur de la partie aléatoire
 * @returns {string} - Code généré
 */
exports.generateCode = (prefix, length = 5) => {
  const date = new Date();
  const year = date.getFullYear().toString().substr(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * Math.pow(10, length))
    .toString()
    .padStart(length, '0');
  
  return `${prefix}${year}${month}${random}`;
};

/**
 * Valider un numéro de téléphone algérien
 * @param {string} phone - Numéro de téléphone
 * @returns {boolean} - Valide ou non
 */
exports.validatePhoneNumber = (phone) => {
  const phoneRegex = /^(0)(5|6|7)[0-9]{8}$/;
  return phoneRegex.test(phone);
};

/**
 * Créer un slug à partir d'une chaîne
 * @param {string} str - Chaîne à convertir
 * @returns {string} - Slug
 */
exports.slugify = (str) => {
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};
