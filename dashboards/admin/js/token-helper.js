/**
 * 🔐 HELPER GLOBAL POUR RÉCUPÉRER LE TOKEN ADMIN
 * 
 * Ce fichier doit être chargé AVANT tous les autres scripts admin
 * Il fournit une fonction globale getAdminToken() accessible partout
 */

// ✅ Fonction globale pour récupérer le token admin
window.getAdminToken = function() {
  // 1️⃣ Essayer sessionStorage (nouveau système AuthService)
  let token = sessionStorage.getItem('auth_token');
  
  // 2️⃣ Fallback sur localStorage.admin_token (ancien système)
  if (!token) {
    token = localStorage.getItem('admin_token');
  }
  
  // 3️⃣ Fallback sur localStorage.token (très ancien système)
  if (!token) {
    token = localStorage.getItem('token');
  }
  
  return token;
};

console.log('✅ Helper global getAdminToken() chargé');
