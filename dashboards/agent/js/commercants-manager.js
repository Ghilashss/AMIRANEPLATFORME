// Gestion de la section Commerçants
console.log('✅ commercants-manager.js chargé');

// Ouvrir le modal
document.addEventListener('DOMContentLoaded', function() {
    const btnNouveau = document.getElementById('btnNouveauCommercant');
    const modal = document.getElementById('modalNouveauCommercant');
    const form = document.getElementById('formNouveauCommercant');

    // Ouvrir le modal
    if (btnNouveau && modal) {
        btnNouveau.addEventListener('click', function() {
            modal.style.display = 'flex';
            chargerWilayasCommercant();
            console.log('✅ Modal commercant ouvert');
        });
    }

    // Fermer en cliquant en dehors
    if (modal) {
        window.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    // Charger les wilayas dans le select
    async function chargerWilayasCommercant() {
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
                console.log('✅ Wilayas chargées pour commerçant');
            }
        } catch (error) {
            console.error('❌ Erreur chargement wilayas:', error);
        }
    }

    // Soumettre le formulaire
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            // ✅ Récupérer l'agence de l'agent connecté depuis sessionStorage (pas localStorage)
            let agentUser = null;
            let agentAgenceId = null;

            // Essayer sessionStorage d'abord (système agent actuel)
            const sessionUser = sessionStorage.getItem('user');
            if (sessionUser) {
                try {
                    agentUser = JSON.parse(sessionUser);
                    agentAgenceId = agentUser.agence;
                } catch (e) {
                    console.error('❌ Erreur parsing sessionStorage user:', e);
                }
            }

            // Si pas trouvé, essayer localStorage (ancien système)
            if (!agentAgenceId) {
                const localUser = localStorage.getItem('agent_user');
                if (localUser) {
                    try {
                        agentUser = JSON.parse(localUser);
                        agentAgenceId = agentUser.agence;
                    } catch (e) {
                        console.error('❌ Erreur parsing localStorage agent_user:', e);
                    }
                }
            }

            // Si toujours pas trouvé, récupérer depuis l'API
            if (!agentAgenceId) {
                console.warn('⚠️ Agence non trouvée dans storage, récupération via API...');
                try {
                    const token = sessionStorage.getItem('auth_token') || localStorage.getItem('agent_token');
                    const response = await fetch(`${window.API_CONFIG.API_URL}/auth/me`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    
                    if (response.ok) {
                        const result = await response.json();
                        if (result.success && result.data) {
                            agentUser = result.data;
                            agentAgenceId = result.data.agence?._id || result.data.agence;
                            
                            // Stocker pour usage futur
                            sessionStorage.setItem('user', JSON.stringify(result.data));
                            console.log('✅ Agence récupérée via API:', agentAgenceId);
                        }
                    }
                } catch (error) {
                    console.error('❌ Erreur récupération user via API:', error);
                }
            }

            if (!agentAgenceId) {
                alert('❌ Erreur: Impossible de récupérer votre agence.\n\nVeuillez vous déconnecter puis reconnecter.');
                console.error('❌ Données agent:', { sessionUser, localUser: localStorage.getItem('agent_user') });
                return;
            }

            console.log('✅ Agence agent trouvée:', agentAgenceId);

            const formData = {
                nom: document.getElementById('commercantNom').value.trim(),
                prenom: document.getElementById('commercantPrenom').value.trim(),
                email: document.getElementById('commercantEmail').value.trim(),
                telephone: document.getElementById('commercantTelephone').value.trim(),
                password: document.getElementById('commercantPassword').value.trim(),
                role: 'commercant',
                wilaya: document.getElementById('commercantWilaya').value,
                adresse: document.getElementById('commercantAdresse').value.trim(),
                agence: agentAgenceId // ✅ Associer le commerçant à l'agence de l'agent
            };

            console.log('📤 Création commerçant:', formData);

            try {
                const response = await fetch(`${window.API_CONFIG.API_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();
                console.log('📩 Réponse backend:', result);

                if (response.ok) {
                    console.log('✅ Commerçant créé, rechargement de la liste...');
                    alert(`✅ Commerçant créé avec succès !\n\n📧 Email: ${formData.email}\n🔑 Mot de passe: ${formData.password}\n\nLe commerçant peut maintenant se connecter.`);
                    modal.style.display = 'none';
                    form.reset();
                    console.log('🔄 Appel de chargerCommercants()...');
                    await chargerCommercants(); // Await pour voir les logs dans l'ordre
                    console.log('✅ chargerCommercants() terminé');
                } else {
                    console.error('❌ Erreur création:', result);
                    alert('❌ Erreur: ' + (result.message || 'Impossible de créer le commerçant'));
                }
            } catch (error) {
                console.error('❌ Erreur:', error);
                alert('❌ Erreur de connexion au serveur');
            }
        });
    }

    // Charger la liste des commerçants
    async function chargerCommercants() {
        console.log('📥 Chargement des commerçants...');
        try {
            const token = sessionStorage.getItem('auth_token') || localStorage.getItem('agent_token');
            console.log('🔑 Token:', token ? 'Présent' : 'Absent');
            
            const response = await fetch(`${window.API_CONFIG.API_URL}/auth/users?role=commercant`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('📡 Réponse status:', response.status);
            const result = await response.json();
            console.log('📦 Résultat:', result);

            if (result.success && result.data) {
                console.log('✅ Nombre de commerçants:', result.data.length);
                tousLesCommercants = result.data; // Stocker globalement
                afficherCommercants(result.data);
                mettreAJourStats(result.data);
                
                // Peupler le filtre des wilayas
                const wilayasUniques = [...new Set(result.data.map(c => c.wilaya).filter(Boolean))];
                const wilayaSelect = document.getElementById('filterWilayaCommercant');
                if (wilayaSelect && wilayasUniques.length > 0) {
                    wilayasUniques.forEach(wilaya => {
                        const option = document.createElement('option');
                        option.value = wilaya;
                        option.textContent = wilaya;
                        wilayaSelect.appendChild(option);
                    });
                }
            } else {
                console.warn('⚠️ Pas de données:', result);
            }
        } catch (error) {
            console.error('❌ Erreur chargement commerçants:', error);
        }
    }

    // Afficher les commerçants dans le tableau
    function afficherCommercants(commercants) {
        const tbody = document.getElementById('commercantsTableBody');
        console.log('📊 Affichage de', commercants.length, 'commerçants');
        console.log('🎯 Tbody trouvé:', tbody ? 'OUI' : 'NON');
        
        if (!commercants || commercants.length === 0) {
            tbody.innerHTML = `
                <tr class="empty-state">
                    <td colspan="9">
                        <div class="empty-illustration">
                            <ion-icon name="storefront-outline"></ion-icon>
                            <h3>Aucun commerçant trouvé</h3>
                            <p>Commencez par ajouter votre premier commerçant</p>
                            <button class="btn-modern btn-primary" onclick="document.getElementById('btnNouveauCommercant').click()">
                                <ion-icon name="add-circle"></ion-icon>
                                Ajouter un commerçant
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = commercants.map(c => `
            <tr data-commercant-id="${c._id}">
                <td>#${c._id.slice(-6).toUpperCase()}</td>
                <td>${c.nom} ${c.prenom || ''}</td>
                <td>${c.email}</td>
                <td>${c.telephone || '-'}</td>
                <td>${c.wilaya || '-'}</td>
                <td><span class="colis-count">0</span></td>
                <td><span class="status-badge actif">Actif</span></td>
                <td>${new Date(c.createdAt).toLocaleDateString('fr-FR')}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn-small btn-view" title="Voir les détails">
                            <ion-icon name="eye"></ion-icon>
                        </button>
                        <button class="action-btn-small btn-edit" title="Modifier">
                            <ion-icon name="create"></ion-icon>
                        </button>
                        <button class="action-btn-small btn-delete" title="Supprimer">
                            <ion-icon name="trash"></ion-icon>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        console.log('✅ Tableau mis à jour avec', commercants.length, 'lignes');
    }

    // Mettre à jour les statistiques
    function mettreAJourStats(commercants) {
        document.getElementById('totalCommercants').textContent = commercants.length;
        document.getElementById('commercantsActifs').textContent = commercants.length;
        document.getElementById('totalColisCommercants').textContent = '0';
        document.getElementById('caCommercants').textContent = '0 DA';
    }

    // Variable globale pour stocker tous les commerçants
    let tousLesCommercants = [];

    // Fonction de filtrage
    function filtrerCommercants() {
        const searchValue = document.getElementById('searchCommercant')?.value.toLowerCase() || '';
        const wilayaFilter = document.getElementById('filterWilayaCommercant')?.value || '';
        const statusFilter = document.getElementById('filterStatusCommercant')?.value || '';

        let filtered = [...tousLesCommercants];

        // Filtre par recherche
        if (searchValue) {
            filtered = filtered.filter(c => {
                const nom = `${c.nom} ${c.prenom || ''}`.toLowerCase();
                const email = (c.email || '').toLowerCase();
                const tel = (c.telephone || '').toLowerCase();
                
                return nom.includes(searchValue) ||
                       email.includes(searchValue) ||
                       tel.includes(searchValue);
            });
        }

        // Filtre par wilaya
        if (wilayaFilter) {
            filtered = filtered.filter(c => c.wilaya === wilayaFilter);
        }

        // Filtre par statut
        if (statusFilter) {
            filtered = filtered.filter(c => {
                const statut = c.statut || c.status || 'actif';
                return statut.toLowerCase() === statusFilter.toLowerCase();
            });
        }

        afficherCommercants(filtered);
    }

    // Attacher les événements aux filtres
    const searchInput = document.getElementById('searchCommercant');
    if (searchInput) {
        searchInput.addEventListener('input', filtrerCommercants);
    }

    const wilayaFilter = document.getElementById('filterWilayaCommercant');
    if (wilayaFilter) {
        wilayaFilter.addEventListener('change', filtrerCommercants);
    }

    const statusFilter = document.getElementById('filterStatusCommercant');
    if (statusFilter) {
        statusFilter.addEventListener('change', filtrerCommercants);
    }

    // Charger les commerçants au démarrage
    chargerCommercants();

    // Recharger quand on navigue vers la section Commerçants
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a[data-page="commercants"]');
        if (link) {
            console.log('🔄 Navigation vers Commerçants - Rechargement...');
            setTimeout(() => {
                chargerCommercants();
            }, 100);
        }
    });

    // Gestionnaire des boutons d'action avec délégation d'événements
    const tbody = document.querySelector('#commercantsTableBody');
    if (tbody) {
        tbody.addEventListener('click', function(e) {
            const btn = e.target.closest('.action-btn-small');
            if (!btn) return;

            // Trouver la ligne du commerçant
            const row = btn.closest('tr');
            if (!row) return;

            const commercantId = row.getAttribute('data-commercant-id');
            const commercantNom = row.cells[0]?.textContent || '';

            console.log('Action clicked:', btn.className, 'ID:', commercantId);

            if (btn.classList.contains('btn-view')) {
                // Bouton Voir
                console.log('📄 Voir commerçant:', commercantNom);
                alert(`Détails du commerçant: ${commercantNom}\nID: ${commercantId}`);
                
            } else if (btn.classList.contains('btn-edit')) {
                // Bouton Modifier
                console.log('✏️ Modifier commerçant:', commercantNom);
                alert(`Modifier le commerçant: ${commercantNom}\nID: ${commercantId}`);
                
            } else if (btn.classList.contains('btn-delete')) {
                // Bouton Supprimer
                console.log('🗑️ Supprimer commerçant:', commercantNom);
                if (confirm(`Êtes-vous sûr de vouloir supprimer le commerçant "${commercantNom}" ?`)) {
                    // TODO: Appel API pour supprimer
                    alert(`Suppression de ${commercantNom} - ID: ${commercantId}\n(API à implémenter)`);
                }
            }
        });
        console.log('✅ Gestionnaires d\'actions des commerçants installés');
    }
});
