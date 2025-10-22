// Gestion du formulaire de colis pour l'agence

// Fonction pour charger les wilayas depuis le localStorage (ajoutées par l'admin)
function loadWilayas() {
    const wilayaSelect = document.getElementById('wilayaDest');
    if (!wilayaSelect) return;

    try {
        const savedWilayas = localStorage.getItem('wilayas');
        if (savedWilayas) {
            const wilayas = JSON.parse(savedWilayas);
            console.log('Wilayas chargées:', wilayas);
            
            // Vider le select
            wilayaSelect.innerHTML = '<option value="">Sélectionner une wilaya</option>';
            
            // Ajouter les wilayas actives
            wilayas
                .filter(w => w.status === 'active')
                .forEach(wilaya => {
                    const option = document.createElement('option');
                    option.value = wilaya.code;
                    option.textContent = `${wilaya.code} - ${wilaya.nom}`;
                    option.dataset.zone = wilaya.zone;
                    wilayaSelect.appendChild(option);
                });
        } else {
            console.warn('Aucune wilaya trouvée dans le localStorage');
        }
    } catch (error) {
        console.error('Erreur lors du chargement des wilayas:', error);
    }
}

// Fonction pour charger les bureaux (agences) depuis le localStorage (ajoutées par l'admin)
function loadBureaux(wilayaCode = null) {
    const bureauSourceSelect = document.getElementById('bureauSource');
    const bureauDestSelect = document.getElementById('bureauDest');
    
    try {
        const savedAgences = localStorage.getItem('agences');
        if (savedAgences) {
            const agences = JSON.parse(savedAgences);
            console.log('Agences chargées:', agences);
            
            // Charger les bureaux source (toutes les agences actives)
            if (bureauSourceSelect) {
                bureauSourceSelect.innerHTML = '<option value="">Sélectionner le bureau source</option>';
                agences
                    .filter(a => a.status === 'active')
                    .forEach(agence => {
                        const option = document.createElement('option');
                        option.value = agence.id;
                        option.textContent = `${agence.nom} (${agence.wilayaText || agence.wilaya})`;
                        option.dataset.wilaya = agence.wilaya;
                        bureauSourceSelect.appendChild(option);
                    });
            }
            
            // Charger les bureaux destination (filtrés par wilaya si spécifié)
            if (bureauDestSelect) {
                bureauDestSelect.innerHTML = '<option value="">Sélectionner un bureau</option>';
                
                if (wilayaCode) {
                    const filteredAgences = agences.filter(a => 
                        a.status === 'active' && a.wilaya === wilayaCode
                    );
                    
                    filteredAgences.forEach(agence => {
                        const option = document.createElement('option');
                        option.value = agence.id;
                        option.textContent = agence.nom;
                        option.dataset.adresse = agence.adresse || `${agence.nom}, ${agence.wilayaText || agence.wilaya}`;
                        bureauDestSelect.appendChild(option);
                    });
                    
                    if (filteredAgences.length === 0) {
                        bureauDestSelect.innerHTML = '<option value="">Aucun bureau disponible dans cette wilaya</option>';
                    }
                } else {
                    bureauDestSelect.innerHTML = '<option value="">Sélectionner d\'abord une wilaya</option>';
                }
            }
        } else {
            console.warn('Aucune agence trouvée dans le localStorage');
        }
    } catch (error) {
        console.error('Erreur lors du chargement des bureaux:', error);
    }
}

// Fonction pour calculer les frais de livraison
function calculateFraisLivraison() {
    const typeLivraison = document.getElementById('typelivraison')?.value;
    const poids = parseFloat(document.getElementById('poidsColis')?.value) || 0;
    const wilayaDest = document.getElementById('wilayaDest')?.value;
    const bureauSource = document.getElementById('bureauSource')?.value;
    
    let frais = 0;
    
    // Logique de calcul des frais (à adapter selon vos besoins)
    if (typeLivraison === 'domicile') {
        frais = 500; // Frais de base pour livraison à domicile
    } else {
        frais = 300; // Frais de base pour livraison au bureau
    }
    
    // Ajouter un coût par kg
    if (poids > 1) {
        frais += (poids - 1) * 50;
    }
    
    return frais;
}

// Fonction pour mettre à jour le résumé des frais
function updateFraisResume() {
    const prixColis = parseFloat(document.getElementById('prixColis')?.value) || 0;
    const frais = calculateFraisLivraison();
    const total = prixColis + frais;
    
    // Mettre à jour l'affichage
    const resumePrixColis = document.getElementById('resumePrixColis');
    const fraisLivraison = document.getElementById('fraisLivraison');
    const totalAPayer = document.getElementById('totalAPayer');
    
    if (resumePrixColis) resumePrixColis.textContent = `${prixColis.toFixed(0)} DA`;
    if (fraisLivraison) fraisLivraison.textContent = `${frais.toFixed(0)} DA`;
    if (totalAPayer) totalAPayer.textContent = `${total.toFixed(0)} DA`;
}

// Fonction pour ouvrir le modal
function openColisModal() {
    const modal = document.getElementById('colisModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        loadWilayas();
        loadBureaux();
    }
}

// Fonction pour fermer le modal
function closeColisModal() {
    const modal = document.getElementById('colisModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initialisation du formulaire de colis pour l\'agence');
    
    // Bouton pour ouvrir le modal
    const addButton = document.getElementById('addColisBtn');
    if (addButton) {
        addButton.addEventListener('click', function(e) {
            e.preventDefault();
            openColisModal();
        });
    }
    
    // Bouton pour fermer le modal
    const closeButton = document.querySelector('#colisModal .close-button');
    if (closeButton) {
        closeButton.addEventListener('click', closeColisModal);
    }
    
    // Fermer en cliquant en dehors
    const modal = document.getElementById('colisModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeColisModal();
            }
        });
    }
    
    // Écouteur pour le changement de wilaya destination
    const wilayaDestSelect = document.getElementById('wilayaDest');
    if (wilayaDestSelect) {
        wilayaDestSelect.addEventListener('change', function() {
            const selectedWilaya = this.value;
            loadBureaux(selectedWilaya);
            updateFraisResume();
        });
    }
    
    // Écouteurs pour le calcul des frais
    const prixColisInput = document.getElementById('prixColis');
    const poidsColisInput = document.getElementById('poidsColis');
    const typeLivraisonSelect = document.getElementById('typelivraison');
    
    if (prixColisInput) {
        prixColisInput.addEventListener('input', updateFraisResume);
    }
    
    if (poidsColisInput) {
        poidsColisInput.addEventListener('input', updateFraisResume);
    }
    
    if (typeLivraisonSelect) {
        typeLivraisonSelect.addEventListener('change', updateFraisResume);
    }
    
    // Gestion de la soumission du formulaire
    const form = document.getElementById('colisForm');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Récupération des données
            const prixColis = parseFloat(document.getElementById('prixColis')?.value) || 0;
            const fraisLivraison = calculateFraisLivraison();
            
            const formData = {
                bureauSource: document.getElementById('bureauSource')?.value || '',
                typeLivraison: document.getElementById('typelivraison')?.value || 'bureau',
                poids: parseFloat(document.getElementById('poidsColis')?.value) || 0,
                montant: prixColis, // ✅ Renommé de prixColis → montant (requis par backend)
                description: document.getElementById('description')?.value || '',
                clientNom: document.getElementById('nomClient')?.value || '',
                clientTel: document.getElementById('telClient')?.value || '',
                telSecondaire: document.getElementById('telSecondaire')?.value || '',
                adresse: document.getElementById('adresseClient')?.value || 'Adresse non précisée', // ✅ Ajouté (requis)
                wilaya: document.getElementById('wilayaDest')?.value || '',
                commune: '', // Optionnel
                bureauDest: document.getElementById('bureauDest')?.value || '',
                date: new Date().toISOString(),
                statut: 'en_attente',
                fraisLivraison: fraisLivraison,
                totalAPayer: prixColis + fraisLivraison // ✅ Ajouté (requis)
            };
            
            console.log('Données du colis:', formData);
            
            // Validation
            if (!formData.bureauSource || !formData.clientNom || !formData.clientTel || 
                !formData.wilaya || !formData.bureauDest || !formData.montant) {
                alert('Veuillez remplir tous les champs obligatoires');
                return;
            }
            
            // 🔥 MIGRÉ VERS API - Sauvegarder le colis dans MongoDB
            try {
                const token = localStorage.getItem('token');
                
                // Générer une référence unique
                const reference = `COL${Date.now().toString().substr(-8)}`;
                formData.reference = reference;
                
                // POST vers API
                const response = await fetch(`${window.API_CONFIG.API_URL}/colis`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const result = await response.json();
                console.log('✅ Colis créé dans MongoDB:', result.data);
                
                alert(`✅ Colis créé avec succès!\nRéférence: ${reference}`);
                
                // Fermer le modal et réinitialiser
                closeColisModal();
                form.reset();
                
                // Recharger la liste des colis si elle existe
                if (typeof loadColisTable === 'function') {
                    loadColisTable();
                }
            } catch (error) {
                console.error('❌ Erreur lors de la sauvegarde API:', error);
                alert('❌ Erreur lors de la création du colis.\n\nVeuillez vérifier que le serveur est démarré.');
            }
        });
    }
});

// Export des fonctions pour utilisation externe
window.openColisModal = openColisModal;
window.closeColisModal = closeColisModal;
window.loadWilayas = loadWilayas;
window.loadBureaux = loadBureaux;
