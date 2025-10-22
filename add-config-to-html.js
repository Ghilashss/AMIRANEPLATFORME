/**
 * ============================================
 * 📝 AJOUT AUTOMATIQUE DE config.js DANS LES HTML
 * ============================================
 */

const fs = require('fs');
const path = require('path');

const stats = {
  processed: 0,
  modified: 0,
  alreadyHas: 0,
  errors: 0
};

const configScriptTag = '<script src="/dashboards/config.js"></script>';

function addConfigToHTML(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);
    
    // Vérifier si config.js est déjà inclus
    if (content.includes('/dashboards/config.js') || content.includes('dashboards/config.js')) {
      console.log('⏭️  Déjà configuré:', relativePath);
      stats.alreadyHas++;
      stats.processed++;
      return;
    }
    
    // Chercher la première balise <script>
    const scriptRegex = /<script[^>]*src=/i;
    const match = content.match(scriptRegex);
    
    if (match) {
      // Insérer avant le premier script
      const insertPosition = match.index;
      const before = content.substring(0, insertPosition);
      const after = content.substring(insertPosition);
      
      content = before + 
                '    <!-- Configuration API (OBLIGATOIRE EN PREMIER) -->\n' +
                '    ' + configScriptTag + '\n\n' +
                '    ' + after;
      
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('✅ Modifié:', relativePath);
      stats.modified++;
    } else {
      // Pas de script trouvé, chercher </head>
      if (content.includes('</head>')) {
        content = content.replace('</head>', 
          '    <!-- Configuration API (OBLIGATOIRE EN PREMIER) -->\n' +
          '    ' + configScriptTag + '\n' +
          '</head>');
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('✅ Modifié (dans head):', relativePath);
        stats.modified++;
      } else {
        console.log('⚠️  Pas de <script> ni </head> trouvé:', relativePath);
      }
    }
    
    stats.processed++;
  } catch (error) {
    console.log('❌ Erreur:', filePath, '-', error.message);
    stats.errors++;
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    
    if (['node_modules', '.git', 'backend'].includes(file)) {
      return;
    }
    
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.html')) {
      addConfigToHTML(fullPath);
    }
  });
}

console.log('\n╔══════════════════════════════════════════════════════════╗');
console.log('║          📝 AJOUT DE config.js DANS LES HTML           ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

processDirectory(path.join(__dirname, 'dashboards'));

console.log('\n╔══════════════════════════════════════════════════════════╗');
console.log('║                    📊 RAPPORT FINAL                     ║');
console.log('╠══════════════════════════════════════════════════════════╣');
console.log(`║  Fichiers analysés:        ${String(stats.processed).padEnd(27)}║`);
console.log(`║  Fichiers modifiés:        ${String(stats.modified).padEnd(27)}║`);
console.log(`║  Déjà configurés:          ${String(stats.alreadyHas).padEnd(27)}║`);
console.log(`║  Erreurs:                  ${String(stats.errors).padEnd(27)}║`);
console.log('╚══════════════════════════════════════════════════════════╝\n');

if (stats.modified > 0) {
  console.log('✅ SUCCÈS! Les fichiers HTML ont été mis à jour!\n');
  console.log('🎯 PROCHAINES ÉTAPES:\n');
  console.log('  1. Rafraîchis ton navigateur (F5)');
  console.log('  2. Ouvre la console (F12)');
  console.log('  3. Tu devrais voir: "🌍 Environnement: development"');
  console.log('  4. Teste que tout fonctionne\n');
}
