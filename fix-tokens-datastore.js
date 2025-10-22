const fs = require('fs');
const path = require('path');

// Fichier à modifier
const filePath = path.join(__dirname, 'dashboards', 'admin', 'js', 'data-store.js');

console.log('🔧 Remplacement des localStorage.getItem dans data-store.js...');

// Lire le fichier
let content = fs.readFileSync(filePath, 'utf8');

// Compter les occurrences avant
const beforeCount = (content.match(/const token = localStorage\.getItem\('admin_token'\)/g) || []).length;
console.log(`📊 Occurrences trouvées: ${beforeCount}`);

// Remplacer
content = content.replace(/const token = localStorage\.getItem\('admin_token'\)/g, "const token = this.getAdminToken()");

// Compter après
const afterCount = (content.match(/const token = this\.getAdminToken\(\)/g) || []).length;

// Sauvegarder
fs.writeFileSync(filePath, content, 'utf8');

console.log(`✅ ${beforeCount} remplacements effectués`);
console.log(`✅ Fichier sauvegardé`);
