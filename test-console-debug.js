// 🧪 SCRIPT DE TEST - Copier dans la console (F12)

console.log('🧪 TEST DE SUPPRESSION DE COLIS');
console.log('═'.repeat(60));

// 1. Vérifier le DataStore
if (typeof DataStore === 'undefined') {
    console.error('❌ DataStore non chargé !');
} else {
    console.log('✅ DataStore chargé');
    
    // 2. Vérifier les colis
    console.log('\n📦 COLIS DISPONIBLES:');
    console.log('   Total:', DataStore.colis ? DataStore.colis.length : 0);
    
    if (DataStore.colis && DataStore.colis.length > 0) {
        console.log('\n📋 Liste des colis:');
        DataStore.colis.forEach((c, i) => {
            console.log(`   ${i + 1}. ID: ${c.id || c._id}`);
            console.log(`      _id: ${c._id}`);
            console.log(`      id: ${c.id}`);
            console.log(`      Tracking: ${c.tracking || c.trackingNumber}`);
            console.log(`      Expéditeur: ${c.expediteur?.nom || 'N/A'}`);
            console.log('');
        });
        
        // 3. Test de suppression du premier colis
        const premierColis = DataStore.colis[0];
        const colisId = premierColis.id || premierColis._id;
        
        console.log('🎯 COLIS À TESTER:');
        console.log('   ID:', colisId);
        console.log('   _id:', premierColis._id);
        console.log('   Tracking:', premierColis.tracking || premierColis.trackingNumber);
        
        console.log('\n💡 POUR SUPPRIMER CE COLIS:');
        console.log(`   window.handleColisAction('delete', '${colisId}')`);
        
        console.log('\n📝 OU TESTEZ DIRECTEMENT:');
        console.log(`   DataStore.deleteColis('${colisId}')`);
        
    } else {
        console.warn('⚠️ Aucun colis trouvé');
        console.log('💡 Créez d\'abord un colis pour tester la suppression');
    }
}

console.log('\n═'.repeat(60));
console.log('✅ Test terminé');
