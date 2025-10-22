// Script pour supprimer les frais de test et garder vos configurations
const mongoose = require('mongoose');
const FraisLivraison = require('./models/FraisLivraison');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function afficherFrais() {
  try {
    console.log('📋 Frais de livraison actuellement en base de données:\n');
    
    const frais = await FraisLivraison.find().sort({ wilayaSource: 1, wilayaDest: 1 });
    
    if (frais.length === 0) {
      console.log('⚠️ Aucun frais configuré dans la base de données');
    } else {
      console.log(`Total: ${frais.length} configuration(s)\n`);
      
      frais.forEach((f, index) => {
        console.log(`${index + 1}. Wilaya ${f.wilayaSource} → Wilaya ${f.wilayaDest}`);
        console.log(`   📍 Bureau: ${f.fraisStopDesk} DA`);
        console.log(`      - Base: ${f.baseBureau || 0} DA`);
        console.log(`      - Par kg: ${f.parKgBureau || 0} DA`);
        console.log(`   🏠 Domicile: ${f.fraisDomicile} DA`);
        console.log(`      - Base: ${f.baseDomicile || 0} DA`);
        console.log(`      - Par kg: ${f.parKgDomicile || 0} DA`);
        console.log(`   📅 Créé le: ${f.createdAt.toLocaleDateString()}`);
        console.log('');
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

mongoose.connection.once('open', () => {
  console.log('✅ MongoDB connecté\n');
  afficherFrais();
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Erreur MongoDB:', err);
  process.exit(1);
});
