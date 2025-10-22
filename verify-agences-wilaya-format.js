// Script pour vérifier le format du champ wilaya dans les agences
const mongoose = require('mongoose');
const Agence = require('./backend/models/Agence');

async function checkAgencesWilayaFormat() {
    try {
        await mongoose.connect('mongodb://localhost:27017/logistique');
        console.log('✅ Connecté à MongoDB\n');

        const agences = await Agence.find({});

        console.log(`✅ ${agences.length} agences trouvées\n`);
        console.log('📋 Format du champ "wilaya":\n');
        console.log('─'.repeat(80));

        agences.forEach((agence, index) => {
            const wilaya = agence.wilaya;
            const isCode = /^\d{1,2}$/.test(wilaya); // Vérifie si c'est un nombre de 1-2 chiffres
            const format = isCode ? '✅ CODE' : '❌ NOM/TEXTE';
            
            console.log(`${index + 1}. ${agence.nom}`);
            console.log(`   wilaya: "${wilaya}" → ${format}`);
            console.log(`   wilayaText: "${agence.wilayaText || 'N/A'}"`);
            console.log('');
        });

        console.log('─'.repeat(80));
        console.log('\n📊 RÉSUMÉ:');
        const withCode = agences.filter(a => /^\d{1,2}$/.test(a.wilaya)).length;
        const withName = agences.length - withCode;
        console.log(`   ✅ Agences avec CODE wilaya: ${withCode}`);
        console.log(`   ❌ Agences avec NOM wilaya: ${withName}`);

        if (withName > 0) {
            console.log('\n⚠️  PROBLÈME DÉTECTÉ:');
            console.log('   Certaines agences ont le NOM au lieu du CODE dans le champ "wilaya".');
            console.log('   Le calcul des frais ne fonctionnera pas car il compare des codes (ex: "15") avec des noms (ex: "Tizi Ouzou").');
            console.log('\n💡 SOLUTION:');
            console.log('   Vous devez corriger les agences pour utiliser les CODES de wilaya.');
        } else {
            console.log('\n✅ Tout est correct ! Les agences utilisent bien les codes de wilaya.');
        }

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        process.exit(1);
    }
}

checkAgencesWilayaFormat();
