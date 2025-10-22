// Mettre à jour la wilaya de l'utilisateur NK
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function updateUserWilaya() {
  try {
    console.log('🔵 Recherche de l\'utilisateur NK...\n');
    
    const user = await User.findOne({ email: 'nk@nk.com' });
    
    if (!user) {
      console.log('❌ Utilisateur non trouvé');
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
    console.log('   1. Déconnectez-vous du dashboard');
    console.log('   2. Reconnectez-vous avec: nk@nk.com');
    console.log('   3. Testez la création de colis vers wilaya 01 (Adrar)');
    console.log('   4. Les frais devraient être: Bureau 450 DA, Domicile 350 DA\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

mongoose.connection.once('open', () => {
  console.log('✅ MongoDB connecté\n');
  updateUserWilaya();
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Erreur MongoDB:', err);
  process.exit(1);
});
