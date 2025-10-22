/**
 * Script pour corriger les tokens dans les dashboards agent
 * Remplace localStorage.getItem('token') par localStorage.getItem('agent_token')
 */

const fs = require('fs');
const path = require('path');

const agentJsPath = path.join(__dirname, 'dashboards', 'agent', 'js');

// Liste des fichiers à modifier
const filesToFix = [
    'colis-form.js',
    'livraisons-manager.js',
    'retours-manager.js',
    'auth-manager.js',
    'caisse-agent.js',
    'caisse-manager.js',
    'commercants-manager.js'
];

console.log('🔧 Début de la correction des tokens agent...\n');

filesToFix.forEach(filename => {
    const filePath = path.join(agentJsPath, filename);
    
    try {
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  ${filename} - Fichier introuvable`);
            return;
        }

        let content = fs.readFileSync(filePath, 'utf8');
        let modificationsCount = 0;

        // Remplacer localStorage.getItem('token') par localStorage.getItem('agent_token')
        const regex = /localStorage\.getItem\('token'\)/g;
        const newContent = content.replace(regex, (match) => {
            modificationsCount++;
            return "localStorage.getItem('agent_token')";
        });

        if (modificationsCount > 0) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`✅ ${filename} - ${modificationsCount} occurrences remplacées`);
        } else {
            console.log(`ℹ️  ${filename} - Aucune modification nécessaire`);
        }

    } catch (error) {
        console.error(`❌ ${filename} - Erreur:`, error.message);
    }
});

// Corriger aussi modal-manager.js et data-store.js (supprimer le fallback)
const agentRootPath = path.join(__dirname, 'dashboards', 'agent');

['modal-manager.js', 'data-store.js'].forEach(filename => {
    const filePath = path.join(agentRootPath, filename);
    
    try {
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  ${filename} - Fichier introuvable`);
            return;
        }

        let content = fs.readFileSync(filePath, 'utf8');
        
        // Remplacer le fallback par agent_token uniquement
        const fallbackRegex = /localStorage\.getItem\('agent_token'\)\s*\|\|\s*localStorage\.getItem\('token'\)/g;
        const newContent = content.replace(fallbackRegex, "localStorage.getItem('agent_token')");

        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log(`✅ ${filename} - Fallback supprimé`);
        } else {
            console.log(`ℹ️  ${filename} - Aucune modification nécessaire`);
        }

    } catch (error) {
        console.error(`❌ ${filename} - Erreur:`, error.message);
    }
});

console.log('\n✅ Correction terminée !');
console.log('\n📝 Prochaines étapes:');
console.log('   1. Déconnectez-vous de tous les dashboards');
console.log('   2. Videz localStorage : localStorage.clear()');
console.log('   3. Reconnectez-vous avec le compte agent');
console.log('   4. Vérifiez que agent_token existe dans localStorage');
