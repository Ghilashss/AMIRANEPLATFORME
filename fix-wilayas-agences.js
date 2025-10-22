const mongoose = require('mongoose');
const Agence = require('./backend/models/Agence');

// Liste complète des wilayas d'Algérie
const WILAYAS = {
  '01': 'Adrar',
  '02': 'Chlef',
  '03': 'Laghouat',
  '04': 'Oum El Bouaghi',
  '05': 'Batna',
  '06': 'Béjaïa',
  '07': 'Biskra',
  '08': 'Béchar',
  '09': 'Blida',
  '10': 'Bouira',
  '11': 'Tamanrasset',
  '12': 'Tébessa',
  '13': 'Tlemcen',
  '14': 'Tiaret',
  '15': 'Tizi Ouzou',
  '16': 'Alger',
  '17': 'Djelfa',
  '18': 'Jijel',
  '19': 'Sétif',
  '20': 'Saïda',
  '21': 'Skikda',
  '22': 'Sidi Bel Abbès',
  '23': 'Annaba',
  '24': 'Guelma',
  '25': 'Constantine',
  '26': 'Médéa',
  '27': 'Mostaganem',
  '28': 'M\'Sila',
  '29': 'Mascara',
  '30': 'Ouargla',
  '31': 'Oran',
  '32': 'El Bayadh',
  '33': 'Illizi',
  '34': 'Bordj Bou Arréridj',
  '35': 'Boumerdès',
  '36': 'El Tarf',
  '37': 'Tindouf',
  '38': 'Tissemsilt',
  '39': 'El Oued',
  '40': 'Khenchela',
  '41': 'Souk Ahras',
  '42': 'Tipaza',
  '43': 'Mila',
  '44': 'Aïn Defla',
  '45': 'Naâma',
  '46': 'Aïn Témouchent',
  '47': 'Ghardaïa',
  '48': 'Relizane',
  '49': 'Timimoun',
  '50': 'Bordj Badji Mokhtar',
  '51': 'Ouled Djellal',
  '52': 'Béni Abbès',
  '53': 'In Salah',
  '54': 'In Guezzam',
  '55': 'Touggourt',
  '56': 'Djanet',
  '57': 'El M\'Ghair',
  '58': 'El Meniaa'
};

async function fixWilayasAgences() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/agence-livraison');
    console.log('✅ Connecté à MongoDB');

    console.log('\n📋 Récupération des agences...');
    const agences = await Agence.find({});
    console.log(`📊 ${agences.length} agences trouvées`);

    let updated = 0;
    let skipped = 0;

    for (const agence of agences) {
      // Si wilayaText est déjà rempli, on passe
      if (agence.wilayaText) {
        console.log(`⏭️  Agence "${agence.nom}" - wilayaText déjà rempli: ${agence.wilayaText}`);
        skipped++;
        continue;
      }

      // Récupérer le nom de la wilaya depuis le code
      const wilayaCode = agence.wilaya;
      const wilayaName = WILAYAS[wilayaCode];

      if (wilayaName) {
        agence.wilayaText = wilayaName;
        await agence.save();
        console.log(`✅ Agence "${agence.nom}" - Wilaya mise à jour: ${wilayaCode} → ${wilayaName}`);
        updated++;
      } else {
        console.log(`⚠️  Agence "${agence.nom}" - Code wilaya inconnu: ${wilayaCode}`);
        skipped++;
      }
    }

    console.log(`\n📊 Résumé:`);
    console.log(`   ✅ ${updated} agences mises à jour`);
    console.log(`   ⏭️  ${skipped} agences ignorées`);

    console.log('\n🎉 Mise à jour terminée !');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

fixWilayasAgences();
