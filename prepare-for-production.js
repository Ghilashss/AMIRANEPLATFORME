/**
 * ============================================
 * 🚀 SCRIPT DE PRÉPARATION POUR PRODUCTION
 * ============================================
 * 
 * Ce script remplace automatiquement TOUTES les URLs
 * localhost hardcodées par la configuration dynamique
 * 
 * Exécution: node prepare-for-production.js
 */

const fs = require('fs');
const path = require('path');

// Statistiques
let stats = {
  filesProcessed: 0,
  filesModified: 0,
  replacements: 0,
  errors: 0
};

// Couleurs console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

console.log('\n' + colors.cyan + '╔══════════════════════════════════════════════════════════╗' + colors.reset);
console.log(colors.cyan + '║' + colors.yellow + '          🚀 PRÉPARATION POUR PRODUCTION                 ' + colors.cyan + '║' + colors.reset);
console.log(colors.cyan + '╚══════════════════════════════════════════════════════════╝' + colors.reset + '\n');

/**
 * Remplacer les URLs dans un fichier
 */
function replaceInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let fileReplacements = 0;

    // ==========================================
    // PATTERN 1: fetch('http://localhost:1000/api/...
    // ==========================================
    const pattern1 = /fetch\(\s*['"`]http:\/\/localhost:1000\/api\/([^'"`]+)['"`]/g;
    const matches1 = content.match(pattern1);
    if (matches1) {
      content = content.replace(pattern1, "fetch(`${window.API_CONFIG.API_URL}/$1`");
      fileReplacements += matches1.length;
    }

    // ==========================================
    // PATTERN 2: fetch(`http://localhost:1000/api/...
    // ==========================================
    const pattern2 = /fetch\(\s*`http:\/\/localhost:1000\/api\/([^`]+)`/g;
    const matches2 = content.match(pattern2);
    if (matches2) {
      content = content.replace(pattern2, "fetch(`${window.API_CONFIG.API_URL}/$1`");
      fileReplacements += matches2.length;
    }

    // ==========================================
    // PATTERN 3: const API_URL = 'http://localhost:1000/api'
    // ==========================================
    const pattern3 = /const\s+API_URL\s*=\s*['"`]http:\/\/localhost:1000\/api['"`]/g;
    const matches3 = content.match(pattern3);
    if (matches3) {
      content = content.replace(pattern3, "const API_URL = window.API_CONFIG.API_URL");
      fileReplacements += matches3.length;
    }

    // ==========================================
    // PATTERN 4: API_URL: 'http://localhost:1000/api'
    // ==========================================
    const pattern4 = /API_URL:\s*['"`]http:\/\/localhost:1000\/api['"`]/g;
    const matches4 = content.match(pattern4);
    if (matches4) {
      content = content.replace(pattern4, "API_URL: window.API_CONFIG.API_URL");
      fileReplacements += matches4.length;
    }

    // ==========================================
    // PATTERN 5: apiUrl: 'http://localhost:XXXX/api'
    // ==========================================
    const pattern5 = /apiUrl:\s*['"`]http:\/\/localhost:\d+\/api['"`]/g;
    const matches5 = content.match(pattern5);
    if (matches5) {
      content = content.replace(pattern5, "apiUrl: window.API_CONFIG.API_URL");
      fileReplacements += matches5.length;
    }

    // ==========================================
    // PATTERN 6: baseURL: 'http://localhost:XXXX/api'
    // ==========================================
    const pattern6 = /baseURL:\s*['"`]http:\/\/localhost:\d+\/api['"`]/g;
    const matches6 = content.match(pattern6);
    if (matches6) {
      content = content.replace(pattern6, "baseURL: window.API_CONFIG.API_URL");
      fileReplacements += matches6.length;
    }

    // ==========================================
    // PATTERN 7: 'http://localhost:1000/api' (autres contextes)
    // ==========================================
    const pattern7 = /['"`]http:\/\/localhost:1000\/api['"`]/g;
    const matches7 = content.match(pattern7);
    if (matches7) {
      content = content.replace(pattern7, "window.API_CONFIG.API_URL");
      fileReplacements += matches7.length;
    }

    // Sauvegarder si modifié
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      stats.filesModified++;
      stats.replacements += fileReplacements;
      
      const relativePath = path.relative(process.cwd(), filePath);
      console.log(colors.green + '✅ ' + relativePath + colors.reset + colors.yellow + ` (${fileReplacements} remplacements)` + colors.reset);
    }

    stats.filesProcessed++;
  } catch (error) {
    stats.errors++;
    console.log(colors.red + '❌ Erreur dans ' + filePath + ': ' + error.message + colors.reset);
  }
}

/**
 * Parcourir récursivement un dossier
 */
function processDirectory(dir, excludeDirs = ['node_modules', '.git', 'backend']) {
  try {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const fullPath = path.join(dir, file);
      
      // Ignorer certains dossiers
      if (excludeDirs.includes(file)) {
        console.log(colors.yellow + '⏭️  Ignoré: ' + file + colors.reset);
        return;
      }

      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        processDirectory(fullPath, excludeDirs);
      } else if (file.endsWith('.js') && !file.includes('.min.')) {
        replaceInFile(fullPath);
      }
    });
  } catch (error) {
    console.log(colors.red + '❌ Erreur lecture dossier ' + dir + ': ' + error.message + colors.reset);
  }
}

/**
 * Vérifier que config.js existe
 */
function checkConfigFile() {
  const configPath = path.join(__dirname, 'dashboards', 'config.js');
  if (!fs.existsSync(configPath)) {
    console.log(colors.red + '❌ ERREUR: dashboards/config.js n\'existe pas!' + colors.reset);
    console.log(colors.yellow + '   Exécute d\'abord la création du fichier config.js' + colors.reset);
    process.exit(1);
  }
  console.log(colors.green + '✅ config.js trouvé\n' + colors.reset);
}

/**
 * Créer une sauvegarde
 */
function createBackup() {
  const backupDir = path.join(__dirname, 'backup-avant-production');
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
    console.log(colors.cyan + '📦 Dossier de sauvegarde créé: backup-avant-production/' + colors.reset);
  } else {
    console.log(colors.yellow + '⚠️  Dossier de sauvegarde existe déjà' + colors.reset);
  }
  
  console.log(colors.cyan + '💡 Tu peux copier tes fichiers importants là-dedans avant de continuer\n' + colors.reset);
}

/**
 * Ajouter config.js dans les HTML
 */
function addConfigToHTML() {
  console.log('\n' + colors.cyan + '═══════════════════════════════════════════════════════════' + colors.reset);
  console.log(colors.yellow + '⚠️  IMPORTANT: Ajout de config.js dans les fichiers HTML' + colors.reset);
  console.log(colors.cyan + '═══════════════════════════════════════════════════════════' + colors.reset);
  
  const htmlFiles = [];
  
  function findHTML(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !['node_modules', '.git', 'backend'].includes(file)) {
        findHTML(fullPath);
      } else if (file.endsWith('.html')) {
        htmlFiles.push(fullPath);
      }
    });
  }
  
  findHTML(path.join(__dirname, 'dashboards'));
  
  console.log(colors.yellow + `\n📄 ${htmlFiles.length} fichiers HTML trouvés\n` + colors.reset);
  console.log(colors.cyan + 'Tu dois MANUELLEMENT ajouter cette ligne dans chaque HTML:' + colors.reset);
  console.log(colors.green + '\n<script src="/dashboards/config.js"></script>' + colors.reset);
  console.log(colors.yellow + '\n⚠️  AVANT tous les autres scripts !\n' + colors.reset);
  
  htmlFiles.forEach(file => {
    const relativePath = path.relative(process.cwd(), file);
    console.log(colors.cyan + '  • ' + relativePath + colors.reset);
  });
  
  console.log('');
}

/**
 * Afficher le rapport final
 */
function showReport() {
  console.log('\n' + colors.cyan + '╔══════════════════════════════════════════════════════════╗' + colors.reset);
  console.log(colors.cyan + '║' + colors.green + '                    📊 RAPPORT FINAL                     ' + colors.cyan + '║' + colors.reset);
  console.log(colors.cyan + '╠══════════════════════════════════════════════════════════╣' + colors.reset);
  console.log(colors.cyan + '║                                                          ║' + colors.reset);
  console.log(colors.cyan + '║  ' + colors.white + `Fichiers analysés:        ${String(stats.filesProcessed).padEnd(27)}` + colors.cyan + '║' + colors.reset);
  console.log(colors.cyan + '║  ' + colors.green + `Fichiers modifiés:        ${String(stats.filesModified).padEnd(27)}` + colors.cyan + '║' + colors.reset);
  console.log(colors.cyan + '║  ' + colors.yellow + `Total remplacements:      ${String(stats.replacements).padEnd(27)}` + colors.cyan + '║' + colors.reset);
  console.log(colors.cyan + '║  ' + (stats.errors > 0 ? colors.red : colors.green) + `Erreurs:                  ${String(stats.errors).padEnd(27)}` + colors.cyan + '║' + colors.reset);
  console.log(colors.cyan + '║                                                          ║' + colors.reset);
  console.log(colors.cyan + '╚══════════════════════════════════════════════════════════╝' + colors.reset);
}

/**
 * Instructions finales
 */
function showInstructions() {
  console.log('\n' + colors.cyan + '╔══════════════════════════════════════════════════════════╗' + colors.reset);
  console.log(colors.cyan + '║' + colors.yellow + '                  🎯 PROCHAINES ÉTAPES                   ' + colors.cyan + '║' + colors.reset);
  console.log(colors.cyan + '╠══════════════════════════════════════════════════════════╣' + colors.reset);
  console.log(colors.cyan + '║                                                          ║' + colors.reset);
  console.log(colors.cyan + '║  ' + colors.green + '1. TESTER EN LOCAL:' + colors.reset + '                                  ' + colors.cyan + '║' + colors.reset);
  console.log(colors.cyan + '║     ' + colors.white + 'Rafraîchis ton navigateur (F5)' + colors.reset + '                   ' + colors.cyan + '║' + colors.reset);
  console.log(colors.cyan + '║     ' + colors.white + 'Vérifie que tout fonctionne encore' + colors.reset + '              ' + colors.cyan + '║' + colors.reset);
  console.log(colors.cyan + '║     ' + colors.white + 'Check la console: environnement = development' + colors.reset + '   ' + colors.cyan + '║' + colors.reset);
  console.log(colors.cyan + '║                                                          ║' + colors.reset);
  console.log(colors.cyan + '║  ' + colors.green + '2. MODIFIER config.js POUR PRODUCTION:' + colors.reset + '               ' + colors.cyan + '║' + colors.reset);
  console.log(colors.cyan + '║     ' + colors.yellow + 'Ouvre: dashboards/config.js' + colors.reset + '                      ' + colors.cyan + '║' + colors.reset);
  console.log(colors.cyan + '║     ' + colors.white + 'Remplace "ton-domaine.com" par ta vraie URL' + colors.reset + '      ' + colors.cyan + '║' + colors.reset);
  console.log(colors.cyan + '║                                                          ║' + colors.reset);
  console.log(colors.cyan + '║  ' + colors.green + '3. AJOUTER config.js DANS LES HTML:' + colors.reset + '                  ' + colors.cyan + '║' + colors.reset);
  console.log(colors.cyan + '║     ' + colors.white + 'Dans CHAQUE fichier .html' + colors.reset + '                        ' + colors.cyan + '║' + colors.reset);
  console.log(colors.cyan + '║     ' + colors.green + 'Ajoute: <script src="/dashboards/config.js">' + colors.reset + '    ' + colors.cyan + '║' + colors.reset);
  console.log(colors.cyan + '║     ' + colors.yellow + 'AVANT tous les autres scripts!' + colors.reset + '                   ' + colors.cyan + '║' + colors.reset);
  console.log(colors.cyan + '║                                                          ║' + colors.reset);
  console.log(colors.cyan + '║  ' + colors.green + '4. DÉPLOYER:' + colors.reset + '                                         ' + colors.cyan + '║' + colors.reset);
  console.log(colors.cyan + '║     ' + colors.white + 'Frontend → Hostinger (FTP/File Manager)' + colors.reset + '          ' + colors.cyan + '║' + colors.reset);
  console.log(colors.cyan + '║     ' + colors.white + 'Backend → VPS avec Node.js' + colors.reset + '                       ' + colors.cyan + '║' + colors.reset);
  console.log(colors.cyan + '║                                                          ║' + colors.reset);
  console.log(colors.cyan + '╚══════════════════════════════════════════════════════════╝' + colors.reset);
  console.log('');
}

// ============================================
// EXÉCUTION PRINCIPALE
// ============================================

console.log(colors.cyan + '🔍 Vérification des prérequis...\n' + colors.reset);

// 1. Vérifier config.js
checkConfigFile();

// 2. Créer dossier de sauvegarde
createBackup();

// 3. Traiter les fichiers
console.log(colors.cyan + '🔄 Traitement des fichiers JavaScript...\n' + colors.reset);
processDirectory(path.join(__dirname, 'dashboards'));

// 4. Afficher rapport
showReport();

// 5. Instructions HTML
addConfigToHTML();

// 6. Instructions finales
showInstructions();

// 7. Message de succès
if (stats.errors === 0 && stats.replacements > 0) {
  console.log(colors.green + '✅ SUCCÈS! Ton projet est prêt pour la production!' + colors.reset + '\n');
} else if (stats.replacements === 0) {
  console.log(colors.yellow + '⚠️  ATTENTION: Aucun remplacement effectué!' + colors.reset);
  console.log(colors.yellow + '   Soit les URLs sont déjà remplacées, soit il y a un problème.' + colors.reset + '\n');
} else {
  console.log(colors.red + '⚠️  Terminé avec des erreurs. Vérifie les messages ci-dessus.' + colors.reset + '\n');
}
