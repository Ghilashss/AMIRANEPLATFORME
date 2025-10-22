const mongoose = require('mongoose');
const User = require('./backend/models/User');
const Agence = require('./backend/models/Agence');

// Connexion MongoDB
mongoose.connect('mongodb://localhost:27017/plateforme_livraison', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function checkCommercantAgences() {
  try {
    console.log('🔍 Vérification des commerçants...\n');

    // Récupérer tous les commerçants
    const commercants = await User.find({ role: 'commercant' });
    
    console.log(`📊 ${commercants.length} commerçant(s) trouvé(s)\n`);

    for (const commercant of commercants) {
      console.log(`\n👤 Commerçant: ${commercant.nom} (${commercant.email})`);
      console.log(`   ID: ${commercant._id}`);
      console.log(`   Agence ID: ${commercant.agence}`);

      if (!commercant.agence) {
        console.log(`   ⚠️ PAS D'AGENCE ASSIGNÉE`);
        
        // Assigner la première agence disponible
        const premiereAgence = await Agence.findOne();
        
        if (premiereAgence) {
          commercant.agence = premiereAgence._id;
          await commercant.save();
          console.log(`   ✅ Agence assignée: ${premiereAgence.nom}`);
        } else {
          console.log(`   ❌ Aucune agence disponible dans la base`);
        }
      } else {
        // Vérifier que l'agence existe
        const agence = await Agence.findById(commercant.agence);
        
        if (agence) {
          console.log(`   ✅ Agence: ${agence.nom} (${agence.code})`);
          console.log(`   📍 Wilaya: ${agence.wilaya}`);
        } else {
          console.log(`   ❌ AGENCE INTROUVABLE (ID invalide)`);
          
          // Assigner la première agence disponible
          const premiereAgence = await Agence.findOne();
          
          if (premiereAgence) {
            commercant.agence = premiereAgence._id;
            await commercant.save();
            console.log(`   ✅ Agence corrigée: ${premiereAgence.nom}`);
          }
        }
      }
    }

    console.log('\n\n📋 RÉSUMÉ:');
    console.log('═══════════════════════════════════════\n');

    // Liste finale
    const commercantsFinal = await User.find({ role: 'commercant' }).populate('agence');
    
    for (const c of commercantsFinal) {
      console.log(`👤 ${c.nom} (${c.email})`);
      if (c.agence) {
        console.log(`   ✅ Agence: ${c.agence.nom} (${c.agence.wilaya})`);
      } else {
        console.log(`   ❌ PAS D'AGENCE`);
      }
      console.log('');
    }

    console.log('✅ Vérification terminée\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

// Lancer la vérification
checkCommercantAgences();
