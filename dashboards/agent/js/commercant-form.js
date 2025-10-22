// Gestion du formulaire commerçant - VERSION SIMPLIFIÉE
console.log('✅ commercant-form.js chargé');

// Charger les wilayas
async function loadWilayas() {
    try {
        const response = await fetch(`${window.API_CONFIG.API_URL}/wilayas`);
        const result = await response.json();
        const select = document.getElementById('commercantWilaya');
        
        if (result.success && result.data && select) {
            select.innerHTML = '<option value="">Sélectionner...</option>';
            result.data.forEach(wilaya => {
                const option = document.createElement('option');
                option.value = wilaya.code;
                option.textContent = `${wilaya.code} - ${wilaya.nom}`;
                select.appendChild(option);
            });
            console.log('✅ Wilayas chargées');
        }
    } catch (error) {
        console.error('❌ Erreur chargement wilayas:', error);
    }
}

// Fonction pour ouvrir le modal
function openCommercantModal() {
    console.log('========================================');
    console.log('🖱️ Fonction openCommercantModal appelée');
    
    const modal = document.getElementById('commercantModal');
    console.log('🔍 Modal trouvé:', modal);
    console.log('🔍 Modal display AVANT:', modal ? modal.style.display : 'NULL');
    
    if (modal) {
        modal.style.display = 'block';
        modal.style.position = 'fixed';
        modal.style.zIndex = '99999';
        modal.style.left = '0';
        modal.style.top = '0';
        modal.style.width = '100vw';
        modal.style.height = '100vh';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        
        console.log('✅ Modal display APRÈS:', modal.style.display);
        console.log('📊 Modal visible:', modal.offsetWidth > 0 ? 'OUI' : 'NON');
        console.log('📊 Modal width:', modal.offsetWidth);
        console.log('📊 Modal z-index:', window.getComputedStyle(modal).zIndex);
        
        // Forcer aussi le style du contenu
        const modalContent = modal.querySelector('div');
        if (modalContent) {
            modalContent.style.position = 'absolute';
            modalContent.style.left = '50%';
            modalContent.style.top = '50%';
            modalContent.style.transform = 'translate(-50%, -50%)';
            modalContent.style.width = '600px';
            modalContent.style.backgroundColor = 'white';
            modalContent.style.borderRadius = '10px';
            modalContent.style.padding = '0';
            modalContent.style.boxShadow = '0 10px 50px rgba(0,0,0,0.5)';
            modalContent.style.zIndex = '999999';
            modalContent.style.minHeight = '400px';
            console.log('✅ Contenu modal forcé - largeur:', modalContent.offsetWidth);
        }
        
        loadWilayas();
    } else {
        console.error('❌ Modal NON TROUVÉ dans le DOM !');
        alert('ERREUR: Le modal commercantModal n\'existe pas dans le HTML');
    }
    console.log('========================================');
}

// Attendre que le DOM soit chargé
setTimeout(function() {
    console.log('🔄 Initialisation commercant-form.js');
    
    // Bouton pour ouvrir le modal
    const addBtn = document.getElementById('addCommercantBtn');
    console.log('🔍 Bouton trouvé:', addBtn ? 'OUI' : 'NON');
    
    if (addBtn) {
        addBtn.addEventListener('click', openCommercantModal);
        console.log('✅ Event listener ajouté au bouton');
    }

    // Charger les wilayas
    async function loadWilayas() {
        try {
            const response = await fetch(`${window.API_CONFIG.API_URL}/wilayas`);
            const result = await response.json();
            const select = document.getElementById('commercantWilaya');
            
            if (result.success && result.data && select) {
                select.innerHTML = '<option value="">Sélectionner...</option>';
                result.data.forEach(wilaya => {
                    const option = document.createElement('option');
                    option.value = wilaya.code;
                    option.textContent = `${wilaya.code} - ${wilaya.nom}`;
                    select.appendChild(option);
                });
                console.log('✅ Wilayas chargées');
            }
        } catch (error) {
            console.error('❌ Erreur chargement wilayas:', error);
        }
    }

    // Soumettre le formulaire
    const form = document.getElementById('commercantForm');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                nom: document.getElementById('commercantNom').value.trim(),
                prenom: document.getElementById('commercantPrenom').value.trim(),
                email: document.getElementById('commercantEmail').value.trim(),
                telephone: document.getElementById('commercantTelephone').value.trim(),
                password: document.getElementById('commercantPassword').value.trim(),
                role: 'commercant',
                wilaya: document.getElementById('commercantWilaya').value,
                adresse: document.getElementById('commercantAdresse').value.trim()
            };

            console.log('📤 Envoi:', formData);

            try {
                const response = await fetch(`${window.API_CONFIG.API_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (response.ok) {
                    alert(`✅ Commerçant créé !\n\nEmail: ${formData.email}\nMot de passe: ${formData.password}`);
                    document.getElementById('commercantModal').style.display = 'none';
                    form.reset();
                } else {
                    alert('❌ Erreur: ' + (result.message || 'Impossible de créer le commerçant'));
                }
            } catch (error) {
                console.error('❌ Erreur:', error);
                alert('❌ Erreur de connexion au serveur');
            }
        });
    }
}, 500);
