const fs = require('fs');
const path = require('path');

// Fonction pour corriger un fichier
function fixTokenInFile(filePath) {
    console.log(`\n📝 Traitement: ${filePath}`);
    
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;
        let replacements = 0;

        // Pattern 1: const token = localStorage.getItem('admin_token');
        // Remplacer par: const token = sessionStorage.getItem('auth_token') || localStorage.getItem('admin_token');
        const pattern1 = /const token = localStorage\.getItem\('admin_token'\);/g;
        if (pattern1.test(content)) {
            content = content.replace(
                pattern1,
                "const token = sessionStorage.getItem('auth_token') || localStorage.getItem('admin_token');"
            );
            replacements += (originalContent.match(pattern1) || []).length;
        }

        // Pattern 2: token = localStorage.getItem('admin_token'); (sans const)
        // Remplacer par: token = sessionStorage.getItem('auth_token') || localStorage.getItem('admin_token');
        const pattern2 = /(\s+)token = localStorage\.getItem\('admin_token'\);/g;
        if (pattern2.test(content)) {
            content = content.replace(
                pattern2,
                "$1token = sessionStorage.getItem('auth_token') || localStorage.getItem('admin_token');"
            );
            replacements += (originalContent.match(pattern2) || []).length;
        }

        // Pattern 3: let token = localStorage.getItem('admin_token');
        const pattern3 = /let token = localStorage\.getItem\('admin_token'\);/g;
        if (pattern3.test(content)) {
            content = content.replace(
                pattern3,
                "let token = sessionStorage.getItem('auth_token') || localStorage.getItem('admin_token');"
            );
            replacements += (originalContent.match(pattern3) || []).length;
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

// Liste des fichiers à corriger (basés sur le grep_search)
const filesToFix = [
    'dashboards/admin/js/frais-livraison.js',
    'dashboards/admin/js/colis-form.js',
    'dashboards/admin/js/user-form.js',
    'dashboards/admin/js/retours-manager.js',
    'dashboards/admin/js/livraisons-manager.js',
    'dashboards/admin/js/modal-manager.js'
];

console.log('🚀 Correction automatique des tokens dans tous les fichiers...\n');
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
console.log(`📝 Les fichiers suivants utilisent maintenant sessionStorage en premier:`);
filesToFix.forEach(f => console.log(`   ✓ ${f}`));
console.log(`\n🔄 Rechargez votre page admin pour appliquer les changements!`);
