const mongoose = require('mongoose');
const Agence = require('./backend/models/Agence');
const Wilaya = require('./backend/models/Wilaya');
const FraisLivraison = require('./backend/models/FraisLivraison');

async function fixAllWilayasToCode() {
    try {
        await mongoose.connect('mongodb://localhost:27017/logistique');
        console.log('✅ Connecté à MongoDB\n');

        // 1. Charger toutes les wilayas avec leurs codes
        const wilayas = await Wilaya.find({});
        console.log(`📋 ${wilayas.length} wilayas chargées\n`);

        // Créer un Map nom → code
        const nomToCode = new Map();
        wilayas.forEach(w => {
            nomToCode.set(w.nom.toLowerCase(), w.code);
            nomToCode.set(w.code, w.code); // Si déjà un code, garder le code
        });

        console.log('🔍 VÉRIFICATION DES AGENCES:\n');
        console.log('─'.repeat(80));

        // 2. Vérifier et corriger les agences
        const agences = await Agence.find({});
        let agencesCorrigees = 0;
        let agencesOK = 0;

        for (const agence of agences) {
            const wilayaActuelle = agence.wilaya;
            const isCode = /^\d{1,2}$/.test(wilayaActuelle);

            if (isCode) {
                console.log(`✅ ${agence.nom}: wilaya="${wilayaActuelle}" (déjà un code)`);
                agencesOK++;
            } else {
                // Trouver le code correspondant
                const code = nomToCode.get(wilayaActuelle.toLowerCase());
                
                if (code) {
                    agence.wilaya = code;
                    agence.wilayaText = wilayaActuelle; // Sauvegarder le nom dans wilayaText
                    await agence.save();
                    console.log(`🔧 ${agence.nom}: "${wilayaActuelle}" → "${code}" (corrigé)`);
                    agencesCorrigees++;
                } else {
                    console.log(`❌ ${agence.nom}: wilaya="${wilayaActuelle}" (code introuvable!)`);
                }
            }
        }

        console.log('─'.repeat(80));
        console.log(`\n📊 RÉSUMÉ AGENCES:`);
        console.log(`   ✅ Déjà correctes: ${agencesOK}`);
        console.log(`   🔧 Corrigées: ${agencesCorrigees}`);

        // 3. Vérifier les frais de livraison
        console.log('\n🔍 VÉRIFICATION DES FRAIS DE LIVRAISON:\n');
        console.log('─'.repeat(80));

        const frais = await FraisLivraison.find({});
        let fraisOK = 0;
        let fraisProbleme = 0;

        frais.forEach(f => {
            const sourceOK = /^\d{1,2}$/.test(f.wilayaSource);
            const destOK = /^\d{1,2}$/.test(f.wilayaDest);

            if (sourceOK && destOK) {
                console.log(`✅ ${f.wilayaSource} → ${f.wilayaDest} (OK)`);
                fraisOK++;
            } else {
                console.log(`❌ ${f.wilayaSource} → ${f.wilayaDest} (format incorrect!)`);
                fraisProbleme++;
            }
        });

        console.log('─'.repeat(80));
        console.log(`\n📊 RÉSUMÉ FRAIS:`);
        console.log(`   ✅ Corrects: ${fraisOK}`);
        console.log(`   ❌ Problèmes: ${fraisProbleme}`);

        // 4. Résumé final
        console.log('\n' + '═'.repeat(80));
        console.log('🎯 RÉSUMÉ FINAL:');
        console.log('═'.repeat(80));
        console.log(`\n✅ Agences corrigées: ${agencesCorrigees}`);
        console.log(`✅ Agences OK: ${agencesOK}`);
        console.log(`✅ Total agences: ${agences.length}`);
        console.log(`\n✅ Frais OK: ${fraisOK}`);
        console.log(`❌ Frais avec problèmes: ${fraisProbleme}`);
        console.log(`✅ Total frais: ${frais.length}`);

        if (agencesCorrigees > 0) {
            console.log('\n🎉 SUCCÈS! Les agences ont été corrigées pour utiliser les codes de wilaya.');
            console.log('📝 Le champ "wilayaText" contient maintenant le nom pour affichage.');
        }

        if (fraisProbleme > 0) {
            console.log('\n⚠️  ATTENTION: Certains frais de livraison utilisent un format incorrect.');
            console.log('   Veuillez les corriger manuellement dans la section "Frais de Livraison".');
        }

        console.log('\n💡 RECOMMANDATION:');
        console.log('   Rechargez la page Admin pour voir les changements.');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

fixAllWilayasToCode();
