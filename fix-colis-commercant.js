const mongoose = require('mongoose');

// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/platforme-livraison', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, '❌ Erreur de connexion MongoDB:'));
db.once('open', async function() {
  console.log('✅ Connecté à MongoDB');
  
  try {
    // Récupérer tous les colis créés par des commerçants
    const colis = await db.collection('colis').find({
      createdBy: 'commercant'
    }).toArray();
    
    console.log(`\n📦 ${colis.length} colis créés par des commerçants trouvés\n`);
    
    if (colis.length === 0) {
      console.log('Aucun colis à corriger.');
      process.exit(0);
    }
    
    let corriges = 0;
    
    for (const c of colis) {
      console.log(`\n📦 Colis: ${c.tracking}`);
      console.log(`   Agence actuelle: ${c.agence}`);
      console.log(`   BureauSource actuel: ${c.bureauSource || 'NON DÉFINI'}`);
      
      // Si bureauSource n'est pas défini, le mettre = agence
      if (!c.bureauSource && c.agence) {
        const result = await db.collection('colis').updateOne(
          { _id: c._id },
          { $set: { bureauSource: c.agence } }
        );
        
        if (result.modifiedCount > 0) {
          console.log(`   ✅ BureauSource mis à jour: ${c.agence}`);
          corriges++;
        }
      } else if (c.bureauSource) {
        console.log(`   ℹ️  BureauSource déjà défini, pas de modification`);
      } else {
        console.log(`   ⚠️  Pas d'agence définie, impossible de corriger`);
      }
    }
    
    console.log(`\n✅ ${corriges} colis corrigés`);
    console.log('\n🔍 Vérification finale...\n');
    
    // Afficher les colis mis à jour
    const colisUpdated = await db.collection('colis').find({
      createdBy: 'commercant'
    }).toArray();
    
    colisUpdated.forEach(c => {
      console.log(`${c.tracking} | Agence: ${c.agence} | BureauSource: ${c.bureauSource || 'NON DÉFINI'}`);
    });
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
});
