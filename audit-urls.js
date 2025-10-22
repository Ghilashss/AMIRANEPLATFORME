/**
 * ============================================
 * 🔍 AUDIT DES URLs DANS LE PROJET
 * ============================================
 */

const fs = require('fs');
const path = require('path');

const report = {
  localhostURLs: [],
  configURLs: [],
  totalFiles: 0
};

function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);
    
    // Chercher localhost:1000
    const localhostMatches = content.match(/localhost:1000/g);
    if (localhostMatches) {
      report.localhostURLs.push({
        file: relativePath,
        count: localhostMatches.length
      });
    }
    
    // Chercher window.API_CONFIG
    const configMatches = content.match(/window\.API_CONFIG/g);
    if (configMatches) {
      report.configURLs.push({
        file: relativePath,
        count: configMatches.length
      });
    }
    
    report.totalFiles++;
  } catch (error) {
    // Ignorer les erreurs
  }
}

function scanDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    
    if (['node_modules', '.git', 'backend'].includes(file)) {
      return;
    }
    
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      scanDirectory(fullPath);
    } else if (file.endsWith('.js') && !file.includes('.min.')) {
      analyzeFile(fullPath);
    }
  });
}

console.log('\n🔍 ANALYSE DU PROJET...\n');
scanDirectory(path.join(__dirname, 'dashboards'));

console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║                    📊 RAPPORT D\'AUDIT                   ║');
console.log('╠══════════════════════════════════════════════════════════╣');
console.log(`║  Fichiers analysés: ${report.totalFiles}                                  ║`);
console.log(`║  Fichiers avec localhost:1000: ${report.localhostURLs.length}                        ║`);
console.log(`║  Fichiers avec window.API_CONFIG: ${report.configURLs.length}                     ║`);
console.log('╚══════════════════════════════════════════════════════════╝\n');

if (report.localhostURLs.length > 0) {
  console.log('❌ FICHIERS AVEC localhost:1000 (À CORRIGER):\n');
  report.localhostURLs.forEach(item => {
    console.log(`   ${item.file} (${item.count} occurrences)`);
  });
  console.log('');
}

if (report.configURLs.length > 0) {
  console.log('✅ FICHIERS DÉJÀ CONFIGURÉS:\n');
  report.configURLs.forEach(item => {
    console.log(`   ${item.file} (${item.count} occurrences)`);
  });
  console.log('');
}

if (report.localhostURLs.length === 0) {
  console.log('🎉 AUCUNE URL localhost:1000 trouvée !');
  console.log('   → Soit tout est déjà configuré');
  console.log('   → Soit elles utilisent d\'autres ports (3000, 5000, etc.)\n');
}
