const mongoose = require('mongoose');

// Schéma Agence
const agenceSchema = new mongoose.Schema({
    nom: String,
    wilaya: String,
    telephone: String,
    adresse: String
}, { timestamps: true });

const Agence = mongoose.model('Agence', agenceSchema);

async function checkAgences() {
    try {
        await mongoose.connect('mongodb://localhost:27017/logistique');
        console.log('✅ Connecté à MongoDB');
        
        const agences = await Agence.find({}).lean();
        
        console.log('\n📦 AGENCES DANS LA BASE DE DONNÉES:');
        console.log('=====================================\n');
        
        if (agences.length === 0) {
            console.log('⚠️ AUCUNE AGENCE TROUVÉE !');
        } else {
            agences.forEach((agence, index) => {
                console.log(`${index + 1}. ${agence.nom}`);
                console.log(`   Wilaya: ${agence.wilaya}`);
                console.log(`   Téléphone: ${agence.telephone || 'Non renseigné'}`);
                console.log(`   ID: ${agence._id}`);
                console.log('');
            });
            
            console.log(`\n📊 Total: ${agences.length} agences`);
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        process.exit(1);
    }
}

checkAgences();
