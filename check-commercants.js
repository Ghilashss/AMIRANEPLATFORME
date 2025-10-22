const mongoose = require('mongoose');

// Connexion MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/plateforme_livraison');
    console.log('✅ MongoDB connecté\n');
  } catch (error) {
    console.error('❌ Erreur connexion MongoDB:', error.message);
    process.exit(1);
  }
};

const User = require('./backend/models/User');
const Agence = require('./backend/models/Agence');

async function checkCommercantAgences() {
  await connectDB();

  try {
    console.log('🔍 Vérification des commerçants...\n');

    // Récupérer tous les commerçants
    const commercants = await User.find({ role: 'commercant' });
    
    console.log(`📊 ${commercants.length} commerçant(s) trouvé(s)\n`);

    if (commercants.length === 0) {
      console.log('⚠️ Aucun commerçant dans la base de données');
      console.log('\nVoulez-vous créer un commerçant de test ?');
      console.log('Email: commercant@test.com');
      console.log('Mot de passe: 123456\n');
      process.exit(0);
    }

    for (const commercant of commercants) {
      console.log(`\n👤 Commerçant: ${commercant.nom || 'Sans nom'} (${commercant.email})`);
      console.log(`   ID: ${commercant._id}`);
      console.log(`   Agence ID: ${commercant.agence || 'AUCUNE'}`);

      if (!commercant.agence) {
        console.log(`   ⚠️ PAS D'AGENCE ASSIGNÉE`);
        
        // Assigner la première agence disponible
        const premiereAgence = await Agence.findOne();
        
        if (premiereAgence) {
          commercant.agence = premiereAgence._id;
          await commercant.save();
          console.log(`   ✅ Agence assignée automatiquement: ${premiereAgence.nom}`);
        } else {
          console.log(`   ❌ Aucune agence disponible dans la base`);
          console.log(`   💡 Créez d'abord des agences !`);
        }
      } else {
        // Vérifier que l'agence existe
        const agence = await Agence.findById(commercant.agence);
        
        if (agence) {
          console.log(`   ✅ Agence: ${agence.nom} (${agence.code})`);
          console.log(`   📍 Wilaya: ${agence.wilaya}`);
        } else {
          console.log(`   ❌ AGENCE INTROUVABLE (ID invalide: ${commercant.agence})`);
          
          // Assigner la première agence disponible
          const premiereAgence = await Agence.findOne();
          
          if (premiereAgence) {
            commercant.agence = premiereAgence._id;
            await commercant.save();
            console.log(`   ✅ Agence corrigée: ${premiereAgence.nom}`);
          } else {
            console.log(`   ❌ Aucune agence disponible pour correction`);
          }
        }
      }
    }

    console.log('\n\n═══════════════════════════════════════');
    console.log('📋 RÉSUMÉ FINAL');
    console.log('═══════════════════════════════════════\n');

    // Liste finale avec populate
    const commercantsFinal = await User.find({ role: 'commercant' }).populate('agence');
    
    for (const c of commercantsFinal) {
      console.log(`👤 ${c.nom || 'Sans nom'} (${c.email})`);
      if (c.agence) {
        console.log(`   ✅ Agence: ${c.agence.nom} - ${c.agence.wilaya}`);
        console.log(`   📍 Code: ${c.agence.code}`);
      } else {
        console.log(`   ❌ PAS D'AGENCE ASSIGNÉE`);
      }
      console.log('');
    }

    console.log('═══════════════════════════════════════');
    console.log('✅ Vérification terminée\n');
    
    mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    console.error(error);
    mongoose.connection.close();
    process.exit(1);
  }
}

// Lancer la vérification
checkCommercantAgences();
