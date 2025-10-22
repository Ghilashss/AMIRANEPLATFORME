// Supprimer uniquement les frais de test (wilaya 16)
const mongoose = require('mongoose');
const FraisLivraison = require('./models/FraisLivraison');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function supprimerFraisTest() {
  try {
    console.log('🔵 Suppression des frais de test (wilaya 16)...\n');
    
    const result = await FraisLivraison.deleteMany({ 
      wilayaSource: '16',
      createdAt: { $gte: new Date('2025-10-17') } // Créés aujourd'hui
    });
    
    console.log(`✅ ${result.deletedCount} configuration(s) supprimée(s)\n`);
    
    console.log('📋 Frais restants:');
    const fraisRestants = await FraisLivraison.find().sort({ wilayaSource: 1, wilayaDest: 1 });
    
    if (fraisRestants.length === 0) {
      console.log('⚠️ Aucun frais en base de données');
    } else {
      fraisRestants.forEach((f, index) => {
        console.log(`${index + 1}. Wilaya ${f.wilayaSource} → ${f.wilayaDest}: Bureau ${f.fraisStopDesk} DA, Domicile ${f.fraisDomicile} DA`);
      });
    }
    
    console.log('\n✅ Nettoyage terminé !');
    console.log('💡 Vous pouvez maintenant configurer vos propres frais dans le dashboard admin');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

mongoose.connection.once('open', () => {
  console.log('✅ MongoDB connecté\n');
  supprimerFraisTest();
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Erreur MongoDB:', err);
  process.exit(1);
});
