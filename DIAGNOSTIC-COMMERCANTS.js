// 🔍 DIAGNOSTIC : Pourquoi les commerçants ne s'affichent pas dans le tableau

console.log('========================================');
console.log('🔍 DIAGNOSTIC COMMERÇANTS - DÉBUT');
console.log('========================================\n');

// 1. Vérifier sessionStorage
console.log('1️⃣ VÉRIFICATION SESSIONSTORAGE');
console.log('   auth_token:', sessionStorage.getItem('auth_token') ? '✅ Présent' : '❌ Absent');
console.log('   user:', sessionStorage.getItem('user') ? '✅ Présent' : '❌ Absent');
console.log('   role:', sessionStorage.getItem('role') || '❌ Absent');

if (sessionStorage.getItem('user')) {
    try {
        const user = JSON.parse(sessionStorage.getItem('user'));
        console.log('   user.agence:', user.agence ? '✅ ' + user.agence : '❌ Absent');
        console.log('   user.role:', user.role || '❌ Absent');
    } catch (e) {
        console.error('   ❌ Erreur parsing user:', e);
    }
}

// 2. Vérifier localStorage
console.log('\n2️⃣ VÉRIFICATION LOCALSTORAGE');
console.log('   token:', localStorage.getItem('token') ? '✅ Présent' : '❌ Absent');
console.log('   agent_token:', localStorage.getItem('agent_token') ? '✅ Présent' : '❌ Absent');

// 3. Vérifier le tableau HTML
console.log('\n3️⃣ VÉRIFICATION TABLEAU HTML');
const tbody = document.getElementById('commercantsTableBody');
console.log('   tbody trouvé:', tbody ? '✅ OUI' : '❌ NON');
if (tbody) {
    console.log('   tbody.innerHTML length:', tbody.innerHTML.length);
    console.log('   Nombre de <tr>:', tbody.querySelectorAll('tr').length);
}

// 4. Tester l'API manuellement
console.log('\n4️⃣ TEST API /api/auth/users?role=commercant');
const token = sessionStorage.getItem('auth_token') || localStorage.getItem('token');

if (!token) {
    console.error('   ❌ Aucun token disponible - impossible de tester l\'API');
} else {
    console.log('   🔑 Token:', token.substring(0, 20) + '...');
    
    fetch('http://localhost:1000/api/auth/users?role=commercant', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        console.log('   📡 Status:', response.status);
        return response.json();
    })
    .then(result => {
        console.log('   📦 Success:', result.success);
        console.log('   📊 Nombre de commerçants:', result.data ? result.data.length : 0);
        
        if (result.data && result.data.length > 0) {
            console.log('\n   📋 LISTE DES COMMERÇANTS:');
            result.data.forEach((c, index) => {
                console.log(`   ${index + 1}. ${c.nom} ${c.prenom || ''} (${c.email})`);
                console.log(`      - ID: ${c._id}`);
                console.log(`      - Agence: ${c.agence || 'Non définie'}`);
                console.log(`      - Créé le: ${new Date(c.createdAt).toLocaleString('fr-FR')}`);
            });
        } else {
            console.log('   ℹ️ Aucun commerçant dans la base de données');
        }
    })
    .catch(error => {
        console.error('   ❌ Erreur API:', error);
    });
}

// 5. Vérifier si le script commercants-manager.js est chargé
console.log('\n5️⃣ VÉRIFICATION SCRIPTS');
const scripts = Array.from(document.querySelectorAll('script[src*="commercants-manager"]'));
console.log('   commercants-manager.js chargé:', scripts.length > 0 ? '✅ OUI (' + scripts.length + ')' : '❌ NON');

// 6. Vérifier la section Commerçants
console.log('\n6️⃣ VÉRIFICATION SECTION COMMERÇANTS');
const section = document.getElementById('commercants-section');
console.log('   Section trouvée:', section ? '✅ OUI' : '❌ NON');
if (section) {
    console.log('   Section visible:', section.style.display !== 'none' ? '✅ OUI' : '❌ NON');
}

console.log('\n========================================');
console.log('🔍 DIAGNOSTIC COMMERÇANTS - FIN');
console.log('========================================');
console.log('\n💡 INSTRUCTIONS:');
console.log('1. Ouvrez la console (F12)');
console.log('2. Collez ce script et appuyez sur Entrée');
console.log('3. Analysez les résultats ci-dessus');
console.log('4. Cherchez les ❌ pour identifier le problème');
