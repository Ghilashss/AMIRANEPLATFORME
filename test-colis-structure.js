const mongoose = require('mongoose');
const Colis = require('./backend/models/Colis');

async function testColisStructure() {
  try {
    // Connexion à MongoDB
    await mongoose.connect('mongodb://localhost:27017/amirane-express', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connecté à MongoDB');

    // Récupérer le premier colis
    const colis = await Colis.findOne().limit(1);
    
    if (!colis) {
      console.log('❌ Aucun colis trouvé dans la base');
      process.exit(0);
    }

    console.log('\n📦 STRUCTURE COMPLÈTE DU COLIS:\n');
    console.log(JSON.stringify(colis, null, 2));

    console.log('\n\n🔍 EXTRACTION DES DONNÉES IMPORTANTES:\n');
    console.log('tracking:', colis.tracking);
    console.log('expediteur:', colis.expediteur);
    console.log('  - nom:', colis.expediteur?.nom);
    console.log('  - telephone:', colis.expediteur?.telephone);
    console.log('  - wilaya:', colis.expediteur?.wilaya);
    console.log('destinataire:', colis.destinataire);
    console.log('  - nom:', colis.destinataire?.nom);
    console.log('  - telephone:', colis.destinataire?.telephone);
    console.log('  - wilaya:', colis.destinataire?.wilaya);
    console.log('  - adresse:', colis.destinataire?.adresse);
    console.log('typeLivraison:', colis.typeLivraison);
    console.log('montant:', colis.montant);
    console.log('fraisLivraison:', colis.fraisLivraison);
    console.log('totalAPayer:', colis.totalAPayer);
    console.log('poids:', colis.poids);
    console.log('contenu:', colis.contenu);
    console.log('status:', colis.status);

    await mongoose.disconnect();
    console.log('\n✅ Déconnecté de MongoDB');

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

testColisStructure();
