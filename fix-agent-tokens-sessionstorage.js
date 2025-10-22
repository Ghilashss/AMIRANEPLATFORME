const fs = require('fs');
const path = require('path');

// Fonction pour corriger un fichier
function fixTokenInFile(filePath) {
    console.log(`\n📝 Traitement: ${filePath}`);
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        let replacements = 0;

        // Pattern 1: const token = localStorage.getItem('agent_token');
        // Remplacer par: const token = sessionStorage.getItem('auth_token') || localStorage.getItem('agent_token');
        const pattern1 = /const token = localStorage\.getItem\('agent_token'\);/g;
        const matches1 = content.match(pattern1);
        if (matches1) {
            content = content.replace(
                pattern1,
                "const token = sessionStorage.getItem('auth_token') || localStorage.getItem('agent_token');"
            );
            replacements += matches1.length;
        }

        // Pattern 2: token = localStorage.getItem('agent_token'); (sans const)
        const pattern2 = /(\s+)token = localStorage\.getItem\('agent_token'\);/g;
        const matches2 = content.match(pattern2);
        if (matches2) {
            content = content.replace(
                pattern2,
                "$1token = sessionStorage.getItem('auth_token') || localStorage.getItem('agent_token');"
            );
            replacements += matches2.length;
        }

        // Pattern 3: let token = localStorage.getItem('agent_token');
        const pattern3 = /let token = localStorage\.getItem\('agent_token'\);/g;
        const matches3 = content.match(pattern3);
        if (matches3) {
            content = content.replace(
                pattern3,
                "let token = sessionStorage.getItem('auth_token') || localStorage.getItem('agent_token');"
            );
            replacements += matches3.length;
        }

        // Pattern 4: this.token = localStorage.getItem('agent_token');
        const pattern4 = /this\.token = localStorage\.getItem\('agent_token'\);/g;
        const matches4 = content.match(pattern4);
        if (matches4) {
            content = content.replace(
                pattern4,
                "this.token = sessionStorage.getItem('auth_token') || localStorage.getItem('agent_token');"
            );
            replacements += matches4.length;
        }

        // Pattern 5: return localStorage.getItem('agent_token');
        const pattern5 = /return localStorage\.getItem\('agent_token'\);/g;
        const matches5 = content.match(pattern5);
        if (matches5) {
            content = content.replace(
                pattern5,
                "return sessionStorage.getItem('auth_token') || localStorage.getItem('agent_token');"
            );
            replacements += matches5.length;
        }

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✅ ${replacements} remplacement(s) effectué(s)`);
            return replacements;
        } else {
            console.log(`ℹ️  Aucun changement nécessaire`);
            return 0;
        }
        
    } catch (error) {
        console.error(`❌ Erreur: ${error.message}`);
        return 0;
    }
}

// Liste des fichiers à corriger
const filesToFix = [
    'dashboards/agent/js/colis-form.js',
    'dashboards/agent/js/retours-manager.js',
    'dashboards/agent/js/livraisons-manager.js',
    'dashboards/agent/js/commercants-manager.js',
    'dashboards/agent/js/caisse-agent.js',
    'dashboards/agent/js/auth-manager.js',
    'dashboards/agent/modal-manager.js'
];

console.log('🚀 Correction automatique des tokens AGENT dans tous les fichiers...\n');
console.log('📋 Fichiers à corriger:');
filesToFix.forEach(f => console.log(`   - ${f}`));

let totalReplacements = 0;

filesToFix.forEach(relPath => {
    const fullPath = path.join(__dirname, relPath);
    if (fs.existsSync(fullPath)) {
        totalReplacements += fixTokenInFile(fullPath);
    } else {
        console.log(`\n⚠️  Fichier non trouvé: ${fullPath}`);
    }
});

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`✅ TERMINÉ: ${totalReplacements} remplacements effectués au total`);
console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
console.log(`📝 Les fichiers AGENT utilisent maintenant sessionStorage.auth_token en premier:`);
filesToFix.forEach(f => console.log(`   ✓ ${f}`));
console.log(`\n🔄 Reconnectez-vous en tant qu'agent pour appliquer les changements!`);
