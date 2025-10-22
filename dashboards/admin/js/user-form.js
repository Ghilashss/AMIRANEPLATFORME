// Gestion du formulaire utilisateur
console.log('✅ user-form.js chargé');

// Ouvrir le modal utilisateur
function openUserModal() {
    const modal = document.getElementById('userModal');
    if (modal) {
        modal.style.display = 'flex';
        loadWilayasForUser();
    }
}

// Fermer le modal utilisateur
function closeUserModal() {
    const modal = document.getElementById('userModal');
    const form = document.getElementById('userForm');
    if (modal) {
        modal.style.display = 'none';
    }
    if (form) {
        form.reset();
    }
}

// Charger les wilayas dans le select
async function loadWilayasForUser() {
    const select = document.getElementById('userWilaya');
    if (!select) return;

    try {
        const response = await fetch(`${window.API_CONFIG.API_URL}/wilayas`);
        const result = await response.json();

        if (result.success && result.data) {
            select.innerHTML = '<option value="">Sélectionner...</option>';
            result.data.forEach(wilaya => {
                const option = document.createElement('option');
                option.value = wilaya.code;
                option.textContent = `${wilaya.code} - ${wilaya.nom}`;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Erreur chargement wilayas:', error);
    }
}

// Gérer la soumission du formulaire
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('userForm');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        const nom = document.getElementById('userName').value.trim();
        const prenom = document.getElementById('userPrenom').value.trim();
        const email = document.getElementById('userEmail').value.trim();
        const telephone = document.getElementById('userTelephone').value.trim();
        const password = document.getElementById('userPassword').value.trim();
        const role = document.getElementById('userRole').value;
        const wilaya = document.getElementById('userWilaya').value;
        const adresse = document.getElementById('userAdresse').value.trim();

        // Validation
        if (!nom) {
            alert('Le nom est requis');
            return;
        }
        if (!email) {
            alert('L\'email est requis');
            return;
        }
        if (!password) {
            alert('Le mot de passe est requis');
            return;
        }
        if (!role) {
            alert('Le rôle est requis');
            return;
        }

        const formData = {
            nom,
            prenom,
            email,
            telephone,
            password,
            role,
            wilaya,
            adresse
        };

        console.log('📤 Création utilisateur:', formData);

        try {
            const response = await fetch(`${window.API_CONFIG.API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Erreur lors de la création');
            }

            console.log('✅ Utilisateur créé:', result);
            alert(`✅ Utilisateur créé avec succès !\n\nEmail: ${email}\nMot de passe: ${password}\nRôle: ${role}`);
            
            closeUserModal();
            loadUsers(); // Recharger la liste
        } catch (error) {
            console.error('❌ Erreur:', error);
            alert('❌ Erreur: ' + error.message);
        }
    });

    // Fermer le modal en cliquant sur le bouton X
    const closeBtn = document.querySelector('#userModal .close-button');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeUserModal);
    }

    // Fermer le modal en cliquant en dehors
    const modal = document.getElementById('userModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeUserModal();
            }
        });
    }
});

// Charger la liste des utilisateurs
async function loadUsers() {
    console.log('🔄 Chargement des utilisateurs...');
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    const token = sessionStorage.getItem('auth_token') || localStorage.getItem('admin_token');
    if (!token) {
        console.error('Token manquant');
        return;
    }

    try {
        // Pour l'instant, on affiche juste un message
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Chargement...</td></tr>';
        
        // Note: Il faudrait créer un endpoint GET /api/users pour lister les utilisateurs
        // Pour l'instant, on laisse vide après création
        setTimeout(() => {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Créez votre premier utilisateur !</td></tr>';
        }, 500);
    } catch (error) {
        console.error('Erreur chargement utilisateurs:', error);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Erreur de chargement</td></tr>';
    }
}

// Charger au démarrage
document.addEventListener('DOMContentLoaded', loadUsers);
