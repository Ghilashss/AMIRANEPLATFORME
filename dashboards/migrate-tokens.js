/**
 * 🔄 Script de Migration des Tokens
 * 
 * Migre automatiquement les tokens de localStorage vers sessionStorage
 * À exécuter UNE SEULE FOIS pour chaque utilisateur
 */

(function() {
  console.log('🔄 MIGRATION DES TOKENS...');
  
  // Vérifier si migration déjà effectuée
  const migrated = sessionStorage.getItem('tokens_migrated');
  if (migrated === 'true') {
    console.log('✅ Migration déjà effectuée');
    return;
  }
  
  let migrationCount = 0;
  
  // Migrer admin_token
  const adminToken = localStorage.getItem('admin_token');
  if (adminToken && !sessionStorage.getItem('auth_token')) {
    sessionStorage.setItem('auth_token', adminToken);
    console.log('✅ admin_token migré vers sessionStorage.auth_token');
    migrationCount++;
  }
  
  // Migrer agent_token
  const agentToken = localStorage.getItem('agent_token');
  if (agentToken && !sessionStorage.getItem('auth_token')) {
    sessionStorage.setItem('auth_token', agentToken);
    console.log('✅ agent_token migré vers sessionStorage.auth_token');
    migrationCount++;
  }
  
  // Migrer commercant_token
  const commercantToken = localStorage.getItem('commercant_token');
  if (commercantToken && !sessionStorage.getItem('auth_token')) {
    sessionStorage.setItem('auth_token', commercantToken);
    console.log('✅ commercant_token migré vers sessionStorage.auth_token');
    migrationCount++;
  }
  
  // Migrer token générique
  const token = localStorage.getItem('token');
  if (token && !sessionStorage.getItem('auth_token')) {
    sessionStorage.setItem('auth_token', token);
    console.log('✅ token migré vers sessionStorage.auth_token');
    migrationCount++;
  }
  
  if (migrationCount > 0) {
    sessionStorage.setItem('tokens_migrated', 'true');
    console.log(`🎉 Migration terminée ! ${migrationCount} token(s) migré(s)`);
    console.log('✅ Le système fonctionne maintenant avec sessionStorage');
  } else {
    console.log('ℹ️ Aucun token à migrer');
  }
})();
