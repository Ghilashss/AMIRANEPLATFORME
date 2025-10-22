/**
 * Script pour corriger les tokens dans les dashboards admin
 * Remplace localStorage.getItem('token') par localStorage.getItem('admin_token')
 */

const fs = require('fs');
const path = require('path');

const adminJsPath = path.join(__dirname, 'dashboards', 'admin', 'js');

// Liste des fichiers à modifier
const filesToFix = [
    'frais-livraison.js',
    'modal-manager.js',
    'data-store.js',
    'livraisons-manager.js',
    'retours-manager.js',
    'caisse-admin.js',
    'caisse-manager.js',
    'user-form.js'
];

console.log('🔧 Début de la correction des tokens admin...\n');

filesToFix.forEach(filename => {
    const filePath = path.join(adminJsPath, filename);
    
    try {
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  ${filename} - Fichier introuvable`);
            return;
        }

        let content = fs.readFileSync(filePath, 'utf8');
        let modificationsCount = 0;

        // Remplacer localStorage.getItem('token') par localStorage.getItem('admin_token')
        const regex = /localStorage\.getItem\('token'\)/g;
        const newContent = content.replace(regex, (match) => {
            modificationsCount++;
            return "localStorage.getItem('admin_token')";
        });

        // Remplacer aussi le fallback dans caisse-admin.js
        const fallbackRegex = /localStorage\.getItem\('admin_token'\)\s*\|\|\s*localStorage\.getItem\('token'\)/g;
        const finalContent = newContent.replace(fallbackRegex, "localStorage.getItem('admin_token')");

        if (modificationsCount > 0) {
            fs.writeFileSync(filePath, finalContent, 'utf8');
            console.log(`✅ ${filename} - ${modificationsCount} occurrences remplacées`);
        } else {
            console.log(`ℹ️  ${filename} - Aucune modification nécessaire`);
        }

    } catch (error) {
        console.error(`❌ ${filename} - Erreur:`, error.message);
    }
});

console.log('\n✅ Correction terminée !');
console.log('\n📝 Prochaines étapes:');
console.log('   1. Vérifiez les fichiers modifiés');
console.log('   2. Testez la connexion admin');
console.log('   3. Déconnectez/reconnectez-vous pour régénérer le token');
