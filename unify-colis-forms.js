const fs = require('fs');
const path = require('path');

console.log('🎨 UNIFICATION DES FORMULAIRES DE COLIS\n');
console.log('════════════════════════════════════════\n');

// Chemins des fichiers
const commercantDashboard = path.join(__dirname, 'dashboards', 'commercant', 'commercant-dashboard.html');
const adminDashboard = path.join(__dirname, 'dashboards', 'admin', 'admin-dashboard.html');
const agentDashboard = path.join(__dirname, 'dashboards', 'agent', 'agent-dashboard.html');

// Lire le fichier commerçant (référence)
console.log('📖 Lecture du formulaire commerçant (référence)...');
const commercantContent = fs.readFileSync(commercantDashboard, 'utf8');

// Extraire le modal colis du commerçant
const startMarker = '<div id="colisModal" class="modal">';
const endMarker = '</div>\n  </div>\n  </div>';

const startIndex = commercantContent.indexOf(startMarker);
if (startIndex === -1) {
  console.error('❌ Impossible de trouver le modal colis dans le fichier commerçant');
  process.exit(1);
}

// Trouver la fin du modal (3 </div> consécutifs qui ferment modal-body, modal-content, modal)
let endIndex = -1;
let closingDivCount = 0;
let searchPos = startIndex + startMarker.length;

while (searchPos < commercantContent.length && closingDivCount < 3) {
  const nextClosing = commercantContent.indexOf('</div>', searchPos);
  if (nextClosing === -1) break;
  
  closingDivCount++;
  searchPos = nextClosing + 6;
  
  if (closingDivCount === 3) {
    endIndex = searchPos;
  }
}

if (endIndex === -1) {
  console.error('❌ Impossible de trouver la fin du modal colis');
  process.exit(1);
}

const colisModalHTML = commercantContent.substring(startIndex, endIndex);
console.log(`✅ Modal extrait (${colisModalHTML.length} caractères)\n`);

// Fonction pour ajouter le lien CSS si absent
function addCSSLink(content, filePath) {
  const cssLink = '<link rel="stylesheet" href="../shared/css/colis-form.css" />';
  
  if (content.includes('colis-form.css')) {
    console.log(`   ℹ️  CSS déjà inclus dans ${path.basename(filePath)}`);
    return content;
  }
  
  // Chercher </head>
  const headEndIndex = content.indexOf('</head>');
  if (headEndIndex === -1) {
    console.error(`   ❌ Balise </head> introuvable dans ${path.basename(filePath)}`);
    return content;
  }
  
  // Insérer avant </head>
  const before = content.substring(0, headEndIndex);
  const after = content.substring(headEndIndex);
  
  console.log(`   ✅ CSS ajouté dans ${path.basename(filePath)}`);
  return before + '  ' + cssLink + '\n  ' + after;
}

// Fonction pour remplacer le modal dans un fichier
function replaceModalInFile(filePath, modalHTML) {
  console.log(`\n📝 Traitement de ${path.basename(filePath)}...`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`   ❌ Fichier introuvable: ${filePath}`);
    return false;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalLength = content.length;
  
  // Ajouter le CSS
  content = addCSSLink(content, filePath);
  
  // Chercher le modal existant
  const modalStart = content.indexOf('<div id="colisModal"');
  if (modalStart === -1) {
    console.log(`   ⚠️  Modal colis non trouvé, ajout en fin de body...`);
    
    const bodyEndIndex = content.lastIndexOf('</body>');
    if (bodyEndIndex === -1) {
      console.error('   ❌ Balise </body> introuvable');
      return false;
    }
    
    const before = content.substring(0, bodyEndIndex);
    const after = content.substring(bodyEndIndex);
    content = before + '\n  ' + modalHTML + '\n\n  ' + after;
    
  } else {
    // Trouver la fin du modal existant
    let searchPos = modalStart;
    let depth = 0;
    let inTag = false;
    let modalEnd = -1;
    
    for (let i = modalStart; i < content.length; i++) {
      const char = content[i];
      
      if (char === '<') {
        inTag = true;
        // Vérifier si c'est une balise ouvrante ou fermante
        if (content.substr(i, 5) === '<div ') {
          depth++;
        } else if (content.substr(i, 6) === '</div>') {
          depth--;
          if (depth === 0) {
            modalEnd = i + 6;
            break;
          }
        }
      } else if (char === '>') {
        inTag = false;
      }
    }
    
    if (modalEnd === -1) {
      console.error('   ❌ Impossible de trouver la fin du modal existant');
      return false;
    }
    
    // Remplacer
    const before = content.substring(0, modalStart);
    const after = content.substring(modalEnd);
    content = before + modalHTML + after;
  }
  
  // Sauvegarder
  fs.writeFileSync(filePath, content, 'utf8');
  const newLength = content.length;
  const diff = newLength - originalLength;
  const diffSign = diff > 0 ? '+' : '';
  
  console.log(`   ✅ Fichier mis à jour (${diffSign}${diff} caractères)`);
  return true;
}

// Appliquer aux dashboards Admin et Agent
console.log('\n🔄 Application du formulaire unifié...\n');

const adminSuccess = replaceModalInFile(adminDashboard, colisModalHTML);
const agentSuccess = replaceModalInFile(agentDashboard, colisModalHTML);

console.log('\n════════════════════════════════════════');
console.log('📊 RÉSUMÉ\n');
console.log(`Admin Dashboard:  ${adminSuccess ? '✅ Succès' : '❌ Échec'}`);
console.log(`Agent Dashboard:  ${agentSuccess ? '✅ Succès' : '❌ Échec'}`);
console.log('\n════════════════════════════════════════');

if (adminSuccess && agentSuccess) {
  console.log('\n🎉 UNIFICATION TERMINÉE AVEC SUCCÈS !\n');
  console.log('📝 Prochaines étapes:');
  console.log('   1. Rechargez les dashboards Admin et Agent');
  console.log('   2. Vérifiez le design des formulaires');
  console.log('   3. Testez l\'ajout de colis dans chaque dashboard');
  console.log('   4. Vérifiez le calcul des frais de livraison\n');
} else {
  console.log('\n⚠️  Certains fichiers n\'ont pas pu être mis à jour\n');
  process.exit(1);
}
