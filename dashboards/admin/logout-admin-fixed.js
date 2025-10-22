/**
 * Script de déconnexion ADMIN - Version corrigée
 * Utilise UNIQUEMENT admin_token
 */

console.log('🔵 Script de déconnexion ADMIN chargé');

// Fonction de déconnexion sécurisée
function logoutAdmin() {
  console.log('🚪 Déconnexion admin...');
  
  try {
    // Afficher l'état AVANT
    console.log('📦 AVANT:', {
      admin_token: localStorage.getItem('admin_token') ? 'existe' : 'absent',
      admin_user: localStorage.getItem('admin_user') ? 'existe' : 'absent',
      agent_token: localStorage.getItem('agent_token') ? 'existe (préservé)' : 'absent',
      commercant_token: localStorage.getItem('commercant_token') ? 'existe (préservé)' : 'absent'
    });
    
    // ✅ Supprimer UNIQUEMENT admin_token et admin_user
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    
    console.log('✅ Tokens admin supprimés');
    
    // Afficher l'état APRÈS
    console.log('📦 APRÈS:', {
      admin_token: localStorage.getItem('admin_token'),
      admin_user: localStorage.getItem('admin_user'),
      agent_token: localStorage.getItem('agent_token') ? 'préservé ✅' : 'absent',
      commercant_token: localStorage.getItem('commercant_token') ? 'préservé ✅' : 'absent'
    });
    
    // Redirection
    console.log('🔄 Redirection vers login...');
    window.location.href = '../../login.html';
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    alert('Erreur de déconnexion');
  }
}

// Export global
window.logoutAdmin = logoutAdmin;

console.log('✅ Fonction logoutAdmin disponible');
