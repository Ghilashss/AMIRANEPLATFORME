// Mettre à jour la wilaya de l'utilisateur Hessas
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function updateHessasWilaya() {
  try {
    console.log('🔵 Recherche de l\'utilisateur Hessas...\n');
    
    const user = await User.findOne({ nom: 'Hessas', role: 'commercant' });
    
    if (!user) {
      console.log('❌ Utilisateur Hessas (commercant) non trouvé');
      
      // Afficher tous les commercants
      console.log('\n📋 Liste des commercants disponibles:');
      const commercants = await User.find({ role: 'commercant' });
      commercants.forEach((c, i) => {
        console.log(`   ${i + 1}. ${c.nom} (${c.email}) - Wilaya: ${c.wilaya || 'non définie'}`);
      });
      
      process.exit(1);
    }
    
    console.log('✅ Utilisateur trouvé:');
    console.log(`   Nom: ${user.nom}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Wilaya actuelle: ${user.wilaya || 'non définie'}\n`);
    
    // Mettre à jour la wilaya
    user.wilaya = '15'; // Tizi Ouzou
    await user.save();
    
    console.log('✅ Wilaya mise à jour avec succès !');
    console.log(`   Nouvelle wilaya: ${user.wilaya} (Tizi Ouzou)\n`);
    
    console.log('💡 Instructions:');
    console.log('   1. Déconnectez-vous du dashboard commercant');
    console.log(`   2. Reconnectez-vous avec: ${user.email}`);
    console.log('   3. Testez la création de colis vers wilaya 01 (Adrar)');
    console.log('   4. Les frais devraient être:');
    console.log('      - Bureau: 450 DA (fixe pour ≤5kg)');
    console.log('      - Domicile: 350 DA (fixe pour ≤5kg)');
    console.log('      - Bureau 10kg: 400 + (10 × 50) = 900 DA');
    console.log('      - Domicile 10kg: 300 + (10 × 50) = 800 DA\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

mongoose.connection.once('open', () => {
  console.log('✅ MongoDB connecté\n');
  updateHessasWilaya();
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Erreur MongoDB:', err);
  process.exit(1);
});
