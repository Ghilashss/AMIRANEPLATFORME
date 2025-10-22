const mongoose = require('mongoose');
const Agence = require('./backend/models/Agence');

mongoose.connect('mongodb://localhost:27017/logistique')
  .then(async () => {
    console.log('✅ Connecté à MongoDB\n');
    
    const agences = await Agence.find({});
    console.log(`📊 ${agences.length} agences trouvées\n`);
    
    console.log('📋 Liste des agences avec leurs wilayas:');
    console.log('─'.repeat(80));
    agences.forEach((agence, index) => {
      console.log(`${index + 1}. ${agence.nom}`);
      console.log(`   📍 wilaya: "${agence.wilaya}"`);
      console.log(`   🔢 code: "${agence.code || 'N/A'}"`);
      console.log(`   📄 wilayaText: "${agence.wilayaText || 'N/A'}"`);
      console.log('');
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  });
