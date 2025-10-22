// Script pour tester et ajouter des frais de livraison de test
// À exécuter dans le backend

const mongoose = require('mongoose');
const FraisLivraison = require('./models/FraisLivraison');
require('dotenv').config();

// Connexion MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Frais de test à ajouter
const fraisDeTest = [
  {
    wilayaSource: '16', // Alger (commerçant de test)
    wilayaDest: '25',   // Constantine
    fraisStopDesk: 400,
    fraisDomicile: 600,
    baseBureau: 300,
    parKgBureau: 50,
    baseDomicile: 500,
    parKgDomicile: 80
  },
  {
    wilayaSource: '16', // Alger
    wilayaDest: '31',   // Oran
    fraisStopDesk: 350,
    fraisDomicile: 500,
    baseBureau: 300,
    parKgBureau: 50,
    baseDomicile: 450,
    parKgDomicile: 70
  },
  {
    wilayaSource: '16', // Alger
    wilayaDest: '11',   // Tamanrasset
    fraisStopDesk: 800,
    fraisDomicile: 1200,
    baseBureau: 600,
    parKgBureau: 100,
    baseDomicile: 1000,
    parKgDomicile: 150
  },
  {
    wilayaSource: '16', // Alger
    wilayaDest: '16',   // Alger (même wilaya)
    fraisStopDesk: 250,
    fraisDomicile: 400,
    baseBureau: 200,
    parKgBureau: 30,
    baseDomicile: 350,
    parKgDomicile: 50
  }
];

async function ajouterFraisDeTest() {
  try {
    console.log('🔵 Suppression des anciennes données de test...');
    await FraisLivraison.deleteMany({ wilayaSource: '16' });
    
    console.log('🔵 Ajout des nouveaux frais de test...');
    for (const frais of fraisDeTest) {
      const nouveau = await FraisLivraison.create(frais);
      console.log(`✅ Ajouté: ${frais.wilayaSource} → ${frais.wilayaDest}`);
      console.log(`   Bureau: ${frais.fraisStopDesk} DA (base: ${frais.baseBureau}, /kg: ${frais.parKgBureau})`);
      console.log(`   Domicile: ${frais.fraisDomicile} DA (base: ${frais.baseDomicile}, /kg: ${frais.parKgDomicile})`);
    }
    
    console.log('\n✅ Frais de test ajoutés avec succès !');
    console.log('\n📋 Résumé:');
    const total = await FraisLivraison.countDocuments({ wilayaSource: '16' });
    console.log(`   Total configurations pour Alger (16): ${total}`);
    
    // Afficher tous les frais
    console.log('\n📦 Configurations créées:');
    const frais = await FraisLivraison.find({ wilayaSource: '16' });
    frais.forEach(f => {
      console.log(`   ${f.wilayaSource} → ${f.wilayaDest}: Bureau ${f.fraisStopDesk} DA, Domicile ${f.fraisDomicile} DA`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

// Attendre la connexion MongoDB
mongoose.connection.once('open', () => {
  console.log('✅ MongoDB connecté');
  ajouterFraisDeTest();
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Erreur MongoDB:', err);
  process.exit(1);
});
