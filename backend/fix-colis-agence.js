const mongoose = require('mongoose');
const Colis = require('./models/Colis');

// Connexion MongoDB
mongoose.connect('mongodb://localhost:27017/platforme_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function fixColisAgence() {
  try {
    console.log('🔍 Vérification des colis...\n');
    
    // Compter tous les colis
    const totalColis = await Colis.countDocuments();
    console.log(`📦 Total de colis: ${totalColis}`);
    
    // Compter les colis SANS agence
    const colisSansAgence = await Colis.countDocuments({ agence: null });
    console.log(`⚠️  Colis sans agence: ${colisSansAgence}`);
    
    // Compter les colis AVEC agence
    const colisAvecAgence = await Colis.countDocuments({ agence: { $ne: null } });
    console.log(`✅ Colis avec agence: ${colisAvecAgence}\n`);
    
    if (colisSansAgence > 0) {
      console.log('🔧 Correction en cours...');
      console.log('   Option 1: Assigner à une agence par défaut');
      console.log('   Option 2: Supprimer les colis sans agence');
      console.log('\n❌ SCRIPT ARRÊTÉ - Choisissez une option manuellement\n');
      
      // Afficher quelques exemples
      const exemples = await Colis.find({ agence: null }).limit(3).select('tracking createdBy createdAt');
      console.log('📋 Exemples de colis sans agence:');
      exemples.forEach(c => {
        console.log(`   - ${c.tracking} | Créé par: ${c.createdBy} | Date: ${c.createdAt}`);
      });
    } else {
      console.log('✅ Tous les colis ont une agence assignée!\n');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

fixColisAgence();
