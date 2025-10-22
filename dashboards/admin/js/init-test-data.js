// ==================== INITIALISER DES DONNÉES DE TEST ====================

function initTestData() {
    console.log('🔧 Initialisation des données de test...');

    // Vérifier si des colis existent déjà
    const existingColis = localStorage.getItem('colis');
    if (existingColis && JSON.parse(existingColis).length > 0) {
        console.log('✅ Des colis existent déjà');
        return;
    }

    // Créer des colis de test
    const testColis = [
        {
            id: '1',
            codeSuivi: 'TRK40977033518',
            dateCreation: new Date().toISOString(),
            statut: 'enCours',
            expediteur: {
                nom: 'Mohamed Benali',
                telephone: '0555123456',
                adresse: 'Rue Didouche Mourad, Alger',
                wilaya: 'Alger'
            },
            destinataire: {
                nom: 'Fatima Zaoui',
                telephone: '0661234567',
                adresse: '15 Avenue de la Liberté',
                wilaya: 'Oran',
                commune: 'Oran Centre'
            },
            wilayaDepart: 'Alger',
            wilayaDestination: 'Oran',
            type: 'standard',
            poids: 2.5,
            montant: 1500,
            description: 'Colis test 1',
            fragile: false,
            assurance: false
        },
        {
            id: '2',
            codeSuivi: 'TRK40977033519',
            dateCreation: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            statut: 'enTransit',
            expediteur: {
                nom: 'Ahmed Kadi',
                telephone: '0770234567',
                adresse: 'Cité Meriem, Constantine',
                wilaya: 'Constantine'
            },
            destinataire: {
                nom: 'Karim Meziane',
                telephone: '0551345678',
                adresse: 'Rue des Frères Bouadou',
                wilaya: 'Bouira',
                commune: 'Bouira Centre'
            },
            wilayaDepart: 'Constantine',
            wilayaDestination: 'Bouira',
            type: 'express',
            poids: 1.2,
            montant: 2000,
            description: 'Documents importants',
            fragile: true,
            assurance: true
        },
        {
            id: '3',
            codeSuivi: 'TRK40977033520',
            dateCreation: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'livre',
            expediteur: {
                nom: 'Nadia Amrani',
                telephone: '0660345678',
                adresse: 'Boulevard Mohamed V, Tizi Ouzou',
                wilaya: 'Tizi Ouzou'
            },
            destinataire: {
                nom: 'Salim Bouzid',
                telephone: '0770456789',
                adresse: 'Cité 1000 Logements',
                wilaya: 'Sétif',
                commune: 'Sétif Ville'
            },
            wilayaDepart: 'Tizi Ouzou',
            wilayaDestination: 'Sétif',
            type: 'standard',
            poids: 3.0,
            montant: 1800,
            description: 'Vêtements',
            fragile: false,
            assurance: false
        },
        {
            id: '4',
            codeSuivi: 'TRK40977033521',
            dateCreation: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            statut: 'enCours',
            expediteur: {
                nom: 'Rachid Mansouri',
                telephone: '0550567890',
                adresse: 'Rue Larbi Ben Mhidi, Blida',
                wilaya: 'Blida'
            },
            destinataire: {
                nom: 'Samia Belaidi',
                telephone: '0661567890',
                adresse: 'Avenue Emir Abdelkader',
                wilaya: 'Annaba',
                commune: 'Annaba Centre'
            },
            wilayaDepart: 'Blida',
            wilayaDestination: 'Annaba',
            type: 'express',
            poids: 0.8,
            montant: 2500,
            description: 'Électronique - Fragile',
            fragile: true,
            assurance: true
        },
        {
            id: '5',
            codeSuivi: 'TRK40977033522',
            dateCreation: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            statut: 'enCours',
            expediteur: {
                nom: 'Yacine Hamdi',
                telephone: '0770678901',
                adresse: 'Cité El Karma, Batna',
                wilaya: 'Batna'
            },
            destinataire: {
                nom: 'Leila Meziani',
                telephone: '0551678901',
                adresse: 'Rue de la République',
                wilaya: 'Béjaïa',
                commune: 'Béjaïa Ville'
            },
            wilayaDepart: 'Batna',
            wilayaDestination: 'Béjaïa',
            type: 'standard',
            poids: 4.5,
            montant: 1200,
            description: 'Livres et magazines',
            fragile: false,
            assurance: false
        }
    ];

    // Sauvegarder dans localStorage
    localStorage.setItem('colis', JSON.stringify(testColis));
    
    console.log('✅ ' + testColis.length + ' colis de test créés !');
    console.log('📦 Codes de suivi disponibles:');
    testColis.forEach(c => {
        console.log('   - ' + c.codeSuivi + ' (' + c.statut + ')');
    });

    // Afficher une notification
    if (typeof showNotification === 'function') {
        showNotification('success', testColis.length + ' colis de test créés !');
    } else {
        alert('✅ ' + testColis.length + ' colis de test créés !\n\nCodes disponibles:\n' + 
              testColis.map(c => c.codeSuivi).join('\n'));
    }

    // Recharger la page pour afficher les colis
    setTimeout(() => {
        window.location.reload();
    }, 1500);
}

// Bouton pour initialiser les données
function createInitButton() {
    const btn = document.createElement('button');
    btn.id = 'initTestDataBtn';
    btn.innerHTML = '<i class="fas fa-database"></i> Créer des colis de test';
    btn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 25px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 600;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.3s;
    `;
    
    btn.addEventListener('mouseover', () => {
        btn.style.transform = 'translateY(-3px)';
        btn.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
    });
    
    btn.addEventListener('mouseout', () => {
        btn.style.transform = 'translateY(0)';
        btn.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
    });
    
    btn.addEventListener('click', initTestData);
    
    document.body.appendChild(btn);
}

// Initialiser au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    // Créer le bouton seulement si aucun colis n'existe
    const existingColis = localStorage.getItem('colis');
    if (!existingColis || JSON.parse(existingColis).length === 0) {
        createInitButton();
    }
});
