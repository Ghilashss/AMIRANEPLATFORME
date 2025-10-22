// ============================================
// 🌍 CONFIGURATION API ENVIRONNEMENT
// ============================================
// Ce fichier détecte automatiquement si on est en local ou en production
// et charge les bonnes URLs API

const API_CONFIG = {
  // 🌐 PRODUCTION (Hostinger ou autre hébergement)
  production: {
    API_URL: 'https://amiraneplatforme.onrender.com/api',  // Backend Render.com
    BASE_URL: 'https://amirane.store',                     // ✅ Domaine Hostinger configuré
    FRONTEND_PORT: 443                                      // HTTPS
  },
  
  // 💻 DÉVELOPPEMENT LOCAL
  development: {
    API_URL: 'http://localhost:1000/api',    // Backend local
    BASE_URL: 'http://localhost:9000',       // Frontend local
    FRONTEND_PORT: 9000
  }
};

// ============================================
// 🔍 DÉTECTION AUTOMATIQUE DE L'ENVIRONNEMENT
// ============================================
const isProduction = window.location.hostname !== 'localhost' && 
                     window.location.hostname !== '127.0.0.1' &&
                     window.location.hostname !== '';

const ENV = isProduction ? 'production' : 'development';
const CONFIG = API_CONFIG[ENV];

// ============================================
// 📤 EXPORT GLOBAL
// ============================================
window.API_CONFIG = {
  API_URL: CONFIG.API_URL,
  BASE_URL: CONFIG.BASE_URL,
  FRONTEND_PORT: CONFIG.FRONTEND_PORT,
  ENV: ENV,
  IS_PRODUCTION: isProduction,
  IS_DEVELOPMENT: !isProduction
};

// ============================================
// 🖥️ LOG POUR DEBUG
// ============================================
console.log('%c╔══════════════════════════════════════╗', 'color: #00ff00; font-weight: bold');
console.log('%c║  🌍 CONFIGURATION ENVIRONNEMENT      ║', 'color: #00ff00; font-weight: bold');
console.log('%c╠══════════════════════════════════════╣', 'color: #00ff00; font-weight: bold');
console.log(`%c║  Environnement: ${ENV.padEnd(19)}║`, isProduction ? 'color: #ff9800; font-weight: bold' : 'color: #4caf50; font-weight: bold');
console.log(`%c║  Hostname: ${window.location.hostname.padEnd(24)}║`, 'color: #2196f3');
console.log(`%c║  API URL: ${CONFIG.API_URL.padEnd(25)}║`, 'color: #2196f3');
console.log(`%c║  Base URL: ${CONFIG.BASE_URL.padEnd(24)}║`, 'color: #2196f3');
console.log('%c╚══════════════════════════════════════╝', 'color: #00ff00; font-weight: bold');

// ============================================
// ⚠️ AVERTISSEMENT SI BASE_URL N'EST PAS CONFIGURÉE
// ============================================
if (isProduction && CONFIG.BASE_URL.includes('ton-domaine-hostinger.com')) {
  console.warn('%c╔═══════════════════════════════════════════════════════╗', 'color: #ff9800; font-weight: bold; font-size: 14px');
  console.warn('%c║  ⚠️  BASE_URL Hostinger non configurée              ║', 'color: #ff9800; font-weight: bold; font-size: 14px');
  console.warn('%c╠═══════════════════════════════════════════════════════╣', 'color: #ff9800; font-weight: bold; font-size: 14px');
  console.warn('%c║                                                       ║', 'color: #ff9800');
  console.warn('%c║  Remplace dans dashboards/config.js :                ║', 'color: #ff9800');
  console.warn('%c║  BASE_URL: "https://ton-domaine-hostinger.com"       ║', 'color: #ffeb3b');
  console.warn('%c║                                                       ║', 'color: #ff9800');
  console.warn('%c║  Par ton vrai domaine Hostinger                      ║', 'color: #ff9800');
  console.warn('%c║                                                       ║', 'color: #ff9800');
  console.warn('%c╚═══════════════════════════════════════════════════════╝', 'color: #ff9800; font-weight: bold; font-size: 14px');
}
