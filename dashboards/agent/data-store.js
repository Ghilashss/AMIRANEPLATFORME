// Données de l'application
export const DataStore = {
    // ✅ Fonction helper pour récupérer le token agent depuis AuthService
    getAgentToken() {
        // Utilise sessionStorage (AuthService)
        return sessionStorage.getItem('auth_token');
    },
    
    stats: {
        dashboard: {
            totalColis: 8750,
            colisLivres: 6800,
            colisRetournes: 950,
            chiffreAffaires: 15000000,
            totalAgences: 25,
            totalAgents: 120,
            tauxLivraison: 85,
            satisfaction: 92
        }
    },
    users: [],
    agences: [],
    settings: {
        tarifLivraison: 500,
        tarifRetour: 250,
        commission: 10
    },

    // Méthodes de chargement des données
    loadDashboardStats() {
        // Simuler le chargement depuis une API
        console.log('Chargement des statistiques du dashboard...');
        
        // Simuler les données pour les KPIs
        document.getElementById('totalColisDash').textContent = '1,234';
        document.getElementById('tauxLivraison').textContent = '85';
        document.getElementById('colisEnAttente').textContent = '45';
        document.getElementById('caTotal').textContent = '350,000';
        
        // Simuler les données des métriques de performance
        document.getElementById('tauxSucces').textContent = '75%';
        document.getElementById('delaiMoyen').textContent = '24h';
        document.getElementById('satisfaction').textContent = '92%';

        // Simuler les données pour les graphiques
        const mockStats = {
            evolution: {
                dates: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
                livraisons: [65, 59, 80, 81, 56, 55, 40],
                retours: [28, 48, 40, 19, 86, 27, 90]
            },
            wilayas: {
                labels: ['Alger', 'Oran', 'Constantine', 'Annaba', 'Blida'],
                data: [120, 90, 70, 60, 50]
            },
            agences: {
                labels: ['Excellent', 'Bon', 'Moyen', 'Faible'],
                data: [35, 25, 22, 18]
            }
        };

        // Émettre un événement personnalisé pour la mise à jour des graphiques
        document.dispatchEvent(new CustomEvent('updateCharts', { detail: mockStats }));

        // Dans une vraie application, on ferait un appel API ici
        this.updateDashboard();
    },

    async loadUsers() {
        console.log('🔵 Chargement des utilisateurs depuis API MongoDB...');
        
        try {
            const token = this.getAgentToken();
            const response = await fetch(`${window.API_CONFIG.API_URL}/auth/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                this.users = await response.json();
                console.log(`✅ ${this.users.length} utilisateurs chargés depuis MongoDB`);
                
                // Cache pour performance
                localStorage.setItem('usersCache', JSON.stringify(this.users));
            } else {
                // Fallback cache
                const cached = localStorage.getItem('usersCache');
                this.users = cached ? JSON.parse(cached) : [];
                console.warn('⚠️ Utilisation du cache utilisateurs');
            }
        } catch (error) {
            console.error('❌ Erreur chargement utilisateurs:', error);
            // Fallback cache
            const cached = localStorage.getItem('usersCache');
            this.users = cached ? JSON.parse(cached) : [];
        }
        
        this.updateUsersTable();
    },

    async loadAgences() {
        console.log('🔵 loadAgences() appelé - Chargement depuis API MongoDB...');
        
        try {
            const token = this.getAgentToken();
            if (!token) {
                console.warn('⚠️ Pas de token, impossible de charger les agences');
                this.agences = [];
                this.updateAgencesTable();
                return;
            }

            const response = await fetch(`${window.API_CONFIG.API_URL}/agences`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const result = await response.json();
            console.log('✅ Réponse API agences:', result);
            
            // L'API retourne { success: true, data: [...] }
            // Mapper _id vers id pour compatibilité avec le code existant
            this.agences = (result.data || []).map(agence => ({
                ...agence,
                id: agence._id || agence.id, // MongoDB utilise _id, on ajoute id
                wilayaText: agence.wilayaText || `Wilaya ${agence.wilaya}`
            }));
            console.log(`✅ ${this.agences.length} agences chargées depuis MongoDB`);
            
            // Cache pour performance
            localStorage.setItem('agencesCache', JSON.stringify(this.agences));
            
        } catch (error) {
            console.error('❌ Erreur chargement agences API:', error);
            
            // Fallback: essayer le cache localStorage
            const cached = localStorage.getItem('agencesCache');
            if (cached) {
                console.log('💡 Utilisation du cache agences...');
                this.agences = JSON.parse(cached);
            } else {
                this.agences = [];
            }
        }
        
        // Mise à jour directe du tableau
        console.log('🔄 Appel de updateAgencesTable()...');
        this.updateAgencesTable();
    },

    loadSettings() {
        console.log('Chargement des paramètres...');
        const settings = localStorage.getItem('settings');
        if (settings) {
            this.settings = JSON.parse(settings);
        }
        this.updateSettingsForm();
    },

    // Méthodes de manipulation des données
    addUser(userData) {
        const newUser = {
            id: Date.now().toString(),
            ...userData,
            status: 'actif',
            createdAt: new Date().toISOString()
        };
        this.users.push(newUser);
        this.saveToStorage('users');
        this.updateUsersTable();
    },

    updateUser(id, data) {
        const index = this.users.findIndex(u => u.id === id);
        if (index !== -1) {
            this.users[index] = { ...this.users[index], ...data };
            this.saveToStorage('users');
            this.updateUsersTable();
        }
    },

    deleteUser(id) {
        this.users = this.users.filter(u => u.id !== id);
        this.saveToStorage('users');
        this.updateUsersTable();
    },

    addAgence(agenceData) {
        // Vérifier que les champs requis sont présents
        if (!agenceData.nom || !agenceData.wilaya) {
            console.error('Données d\'agence invalides: nom et wilaya sont requis');
            return false;
        }

        // Générer un code unique pour l'agence si non fourni
        const code = agenceData.code || this.generateAgenceCode();

        // Créer une nouvelle agence avec des valeurs par défaut pour les champs optionnels
        const newAgence = {
            id: Date.now().toString(),
            code: code,
            nom: agenceData.nom.trim(),
            wilaya: agenceData.wilaya.trim(),
            email: agenceData.email?.trim() || '-',
            telephone: agenceData.telephone?.trim() || '-',
            status: agenceData.status || 'Active',
            createdAt: new Date().toISOString()
        };

        this.agences.push(newAgence);
        this.saveToStorage('agences');
        this.updateAgencesTable();
        return true;
    },

    updateAgence(id, data) {
        const index = this.agences.findIndex(a => a.id === id);
        if (index !== -1) {
            this.agences[index] = { ...this.agences[index], ...data };
            this.saveToStorage('agences');
            this.updateAgencesTable();
        }
    },

    deleteAgence(id) {
        this.agences = this.agences.filter(a => a.id !== id);
        this.saveToStorage('agences');
        this.updateAgencesTable();
    },

    async addColis(colisData) {
        try {
            console.log('📦 Création d\'un colis via API...', colisData);
            
            const token = this.getAgentToken();
            if (!token) {
                alert('❌ Vous devez être connecté pour créer un colis');
                return null;
            }

            // Préparer les données pour l'API
            const apiData = {
                ...colisData,
                // Assurer que les montants sont bien envoyés
                prixColis: parseFloat(colisData.prixColis) || parseFloat(colisData.montant) || 0,
                fraisLivraison: parseFloat(colisData.fraisLivraison) || 0,
                fraisRetour: parseFloat(colisData.fraisRetour) || 0,
                // Autres champs nécessaires
                typeLivraison: colisData.typeLivraison || colisData.typelivraison || 'stop_desk',
                poidsColis: parseFloat(colisData.poidsColis) || parseFloat(colisData.poids) || 1
            };

            console.log('📤 Envoi des données:', apiData);

            const response = await fetch(`${window.API_CONFIG.API_URL}/colis`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(apiData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erreur lors de la création du colis');
            }

            const result = await response.json();
            console.log('✅ Colis créé via API:', result);

            // Recharger les colis depuis l'API
            await this.loadColis();
            
            // Émettre l'événement de mise à jour
            document.dispatchEvent(new CustomEvent('colisUpdated'));
            
            return result.data;
        } catch (error) {
            console.error('❌ Erreur création colis:', error);
            alert(`❌ Erreur: ${error.message}`);
            return null;
        }
    },

    async deleteColis(id) {
        try {
            // ✅ SUPPRIMER VIA API MongoDB
            const token = this.getAgentToken();
            if (!token) {
                alert('❌ Vous devez être connecté pour supprimer un colis');
                return;
            }

            const response = await fetch(`${window.API_CONFIG.API_URL}/colis/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const result = await response.json();
            console.log('✅ Colis supprimé via API:', result);

            // Recharger les colis depuis l'API
            await this.loadColis();
            
            alert('✅ Colis supprimé avec succès !');
            
        } catch (error) {
            console.error('❌ Erreur suppression colis:', error);
            alert(`❌ Erreur lors de la suppression:\n${error.message}`);
        }
    },

    // Fonction pour ajouter un commerçant via l'API
    async addCommercant(commercantData) {
        console.log('📤 Création commerçant via API MongoDB...', commercantData);
        
        // Validation des champs requis
        if (!commercantData.nom || !commercantData.email || !commercantData.password) {
            alert('❌ Erreur: Le nom, l\'email et le mot de passe sont obligatoires');
            console.error('Données invalides: nom, email et password sont requis');
            return false;
        }

        // Validation de l'email
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(commercantData.email)) {
            alert('❌ Erreur: Format d\'email invalide');
            console.error('Email invalide:', commercantData.email);
            return false;
        }

        // Validation du mot de passe (minimum 6 caractères)
        if (commercantData.password.length < 6) {
            alert('❌ Erreur: Le mot de passe doit contenir au moins 6 caractères');
            console.error('Mot de passe trop court');
            return false;
        }

        try {
            const token = this.getAgentToken();
            if (!token) {
                alert('❌ Erreur: Vous devez être connecté pour créer un commerçant');
                console.error('❌ Pas de token disponible');
                return false;
            }

            const response = await fetch(`${window.API_CONFIG.API_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nom: commercantData.nom.trim(),
                    prenom: commercantData.prenom?.trim() || '',
                    email: commercantData.email.trim().toLowerCase(),
                    telephone: commercantData.telephone?.trim() || '',
                    password: commercantData.password,
                    role: 'commercant',
                    wilaya: commercantData.wilaya?.trim() || '',
                    adresse: commercantData.adresse?.trim() || ''
                })
            });

            const result = await response.json();
            console.log('📥 Réponse API register:', result);

            if (!response.ok) {
                throw new Error(result.message || `Erreur HTTP ${response.status}`);
            }

            if (result.success) {
                console.log('✅ Commerçant créé avec succès dans MongoDB:', result.data);
                alert(`✅ Commerçant créé avec succès !\n\n📧 Email: ${commercantData.email}\n🔑 Mot de passe: ${commercantData.password}\n\n✅ Le commerçant peut maintenant se connecter.`);
                
                return true;
            } else {
                throw new Error(result.message || 'Échec de création');
            }

        } catch (error) {
            console.error('❌ Erreur lors de la création du commerçant:', error);
            alert(`❌ Erreur lors de la création du commerçant:\n${error.message}`);
            return false;
        }
    },

    updateSettings(data) {
        this.settings = { ...this.settings, ...data };
        this.saveToStorage('settings');
        this.updateSettingsForm();
    },

    // Méthodes de mise à jour de l'interface
    updateDashboard() {
        // Mise à jour des cartes statistiques
        document.querySelectorAll('.stat-card').forEach(card => {
            const key = card.dataset.stat;
            const value = this.stats.dashboard[key];
            if (value !== undefined) {
                const valueEl = card.querySelector('.stat-content p');
                if (valueEl) {
                    if (key.includes('taux') || key.includes('satisfaction')) {
                        valueEl.textContent = value + '%';
                    } else if (key.includes('chiffre')) {
                        valueEl.textContent = new Intl.NumberFormat('fr-FR').format(value) + ' DA';
                    } else {
                        valueEl.textContent = new Intl.NumberFormat('fr-FR').format(value);
                    }
                }
            }
        });
    },

    updateUsersTable() {
        const tableBody = document.querySelector('#usersTable tbody');
        if (!tableBody) return;

        // ✅ Vérifier que this.users est un tableau
        if (!Array.isArray(this.users)) {
            console.warn('⚠️ this.users n\'est pas un tableau:', this.users);
            this.users = [];
        }

        // Enlever les anciens écouteurs d'événements
        const table = tableBody.closest('table');
        if (table) {
            const oldClone = table.cloneNode(true);
            table.parentNode.replaceChild(oldClone, table);
        }

        tableBody.innerHTML = this.users.map(user => `
            <tr>
                <td>${user.nom} ${user.prenom}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>${user.agence || '-'}</td>
                <td><span class="status ${this.getStatusClass(user.status)}">${user.status}</span></td>
                <td>
                    <button class="action-btn edit" data-user-id="${user.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" data-user-id="${user.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');

        // Ajouter les nouveaux écouteurs d'événements
        const newTable = tableBody.closest('table');
        if (newTable) {
            newTable.addEventListener('click', (e) => {
                const btn = e.target.closest('.action-btn');
                if (!btn) return;
                
                const userId = btn.dataset.userId;
                if (btn.classList.contains('edit')) {
                    this.editUser(userId);
                } else if (btn.classList.contains('delete')) {
                    this.deleteUser(userId);
                }
            });
        }
    },

    updateAgencesTable() {
        console.log('🔄 updateAgencesTable() appelé');
        
        // 🔥 MIGRÉ VERS API - Utilisation des agences depuis this.agences (déjà chargées depuis MongoDB)
        console.log('✅ Utilisation des agences depuis MongoDB API:', this.agences.length, 'agences');
        
        // Vérifier si le tableau existe (on est sur la page Agences)
        const tableBody = document.querySelector('#agencesTable tbody');
        if (!tableBody) {
            console.log('ℹ️ Table body des agences non trouvé (probablement pas sur la page Agences)');
            console.log('📦 Données en mémoire mises à jour, le tableau sera rafraîchi lors de la navigation');
            return;
        }
        
        console.log('✅ Table body trouvé, mise à jour du tableau...');

        // Charger les wilayas pour récupérer les noms
        let wilayas = [];
        try {
            const savedWilayas = localStorage.getItem('wilayas');
            if (savedWilayas) {
                wilayas = JSON.parse(savedWilayas);
                console.log('Wilayas chargées:', wilayas);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des wilayas:', error);
        }

        // Filtrer les agences invalides
        const validAgences = this.agences.filter(agence => 
            agence && 
            agence.id && 
            agence.code && 
            agence.nom && 
            agence.wilaya
        );

        console.log(`📊 Total agences: ${this.agences.length}, Valides: ${validAgences.length}`);
        
        if (validAgences.length === 0) {
            console.warn('⚠️ Aucune agence valide à afficher');
            tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:20px;">Aucune agence trouvée</td></tr>';
            return;
        }
        
        console.log(`🔨 Génération du HTML pour ${validAgences.length} agences...`);

        tableBody.innerHTML = validAgences.map(agence => {
            // Récupérer le nom de la wilaya
            let wilayaNom = agence.wilayaText;
            if (!wilayaNom && agence.wilaya) {
                const wilayaInfo = wilayas.find(w => w.code === agence.wilaya);
                wilayaNom = wilayaInfo ? wilayaInfo.nom : agence.wilaya;
            }
            
            return `
            <tr>
                <td>
                    <div class="checkbox-wrapper">
                        <input type="checkbox" id="agence_${agence.id}" />
                        <label for="agence_${agence.id}"></label>
                    </div>
                </td>
                <td>${agence.code}</td>
                <td>${agence.nom || '-'}</td>
                <td>${wilayaNom || '-'}</td>
                <td>${agence.email || '-'}</td>
                <td>${agence.telephone || '-'}</td>
                <td class="text-center"><span class="status ${agence.status?.toLowerCase() === 'inactive' ? 'danger' : 'success'}">${agence.status || 'Active'}</span></td>
                <td class="actions">
                    <div class="action-buttons">
                        <button class="btn-action view" onclick="window.handleAgenceAction('view', '${agence.id}')" title="Voir les détails">
                            <ion-icon name="eye-outline"></ion-icon>
                        </button>
                        <button class="btn-action edit" onclick="window.handleAgenceAction('edit', '${agence.id}')" title="Modifier">
                            <ion-icon name="create-outline"></ion-icon>
                        </button>
                        <button class="btn-action delete" onclick="window.handleAgenceAction('delete', '${agence.id}')" title="Supprimer">
                            <ion-icon name="trash-outline"></ion-icon>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        }).join('');
        
        console.log('✅ HTML généré, injection dans le tbody...');
        console.log(`📝 Longueur du HTML: ${tableBody.innerHTML.length} caractères`);
        console.log('✅ Tableau des agences mis à jour avec succès!');
    },

    // Gestionnaire global pour les actions d'agence
    setupAgenceHandlers() {
        const self = this;
        window.handleAgenceAction = (action, id) => {
            const agence = self.agences.find(a => a.id === id);
            if (!agence) {
                console.error('Agence non trouvée:', id);
                return;
            }

            switch (action) {
                case 'view':
                    alert(`Détails de l'agence:\n\nCode: ${agence.code}\nNom: ${agence.nom}\nWilaya: ${agence.wilaya}\nEmail: ${agence.email}\nTéléphone: ${agence.telephone}\nStatus: ${agence.status}`);
                    break;
                case 'edit':
                    // Remplir le formulaire pour l'édition
                    const form = document.getElementById('agenceForm');
                    if (form) {
                        document.getElementById('agenceName').value = agence.nom || '';
                        document.getElementById('agencePhone').value = agence.telephone || '';
                        document.getElementById('agenceEmail').value = agence.email || '';
                        document.getElementById('agencePassword').value = agence.password || '';
                        const wilayaSelect = document.getElementById('agenceWilayaSelect');
                        if (wilayaSelect) {
                            wilayaSelect.value = agence.wilaya || '';
                        }
                        form.dataset.editId = id;
                        // Ouvrir le modal
                        const modal = document.getElementById('agenceModal');
                        if (modal) modal.style.display = 'flex';
                    }
                    break;
                case 'delete':
                    if (confirm(`Êtes-vous sûr de vouloir supprimer l'agence "${agence.nom}" ?`)) {
                        self.deleteAgence(id);
                    }
                    break;
            }
        };
    },

    updateSettingsForm() {
        const form = document.getElementById('settingsForm');
        if (!form) return;

        Object.entries(this.settings).forEach(([key, value]) => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                input.value = value;
            }
        });
    },

    getStatusClass(status) {
        // Ancienne fonction pour users/agences
        status = status.toLowerCase();
        if (status === 'actif' || status === 'active') return 'success';
        if (status === 'en attente') return 'warning';
        return 'danger';
    },

    // ✅ MISE À JOUR: Fonction complète pour le design des statuts de colis
    getColisStatusBadge(status) {
        if (!status) status = 'en_attente';
        
        // 🎨 Configuration complète des 13 statuts avec icônes Font Awesome
        const statusConfig = {
            'en_attente': {
                label: 'En attente',
                icon: 'clock',
                class: 'status-en-attente',
                color: '#ffa500'
            },
            'accepte': {
                label: 'Accepté',
                icon: 'check-circle',
                class: 'status-accepte',
                color: '#17a2b8'
            },
            'en_preparation': {
                label: 'En préparation',
                icon: 'boxes',
                class: 'status-preparation',
                color: '#6c757d'
            },
            'pret_a_expedier': {
                label: 'Prêt à expédier',
                icon: 'box-open',
                class: 'status-pret',
                color: '#007bff'
            },
            'expedie': {
                label: 'Expédié',
                icon: 'shipping-fast',
                class: 'status-expedie',
                color: '#0056b3'
            },
            'en_transit': {
                label: 'En transit',
                icon: 'truck',
                class: 'status-transit',
                color: '#5a6268'
            },
            'arrive_agence': {
                label: 'AU CENTRE DE TRI',
                icon: 'building',
                class: 'status-arrive',
                color: '#20c997'
            },
            'en_livraison': {
                label: 'En livraison',
                icon: 'truck-loading',
                class: 'status-livraison',
                color: '#28a745'
            },
            'livre': {
                label: 'Livré',
                icon: 'check-double',
                class: 'status-livre',
                color: '#155724'
            },
            'echec_livraison': {
                label: 'Échec livraison',
                icon: 'exclamation-triangle',
                class: 'status-echec',
                color: '#dc3545'
            },
            'en_retour': {
                label: 'En retour',
                icon: 'undo',
                class: 'status-retour',
                color: '#e83e8c'
            },
            'retourne': {
                label: 'Retourné',
                icon: 'reply',
                class: 'status-retourne',
                color: '#6f42c1'
            },
            'annule': {
                label: 'Annulé',
                icon: 'times-circle',
                class: 'status-annule',
                color: '#721c24'
            }
        };

        const config = statusConfig[status] || {
            label: status,
            icon: 'question-circle',
            class: 'status-default',
            color: '#6c757d'
        };

        return `<span class="colis-status-badge ${config.class}" style="background-color: ${config.color}; color: white; padding: 6px 12px; border-radius: 12px; font-size: 11px; display: inline-flex; align-items: center; gap: 5px; font-weight: 500;">
            <i class="fas fa-${config.icon}"></i>
            ${config.label}
        </span>`;
    },

    getStatusLabel(status) {
        const labels = {
            'en_attente': 'En attente',
            'en_cours': 'En cours',
            'en_livraison': 'En livraison',
            'livre': 'Livré',
            'livré': 'Livré',
            'retour': 'Retourné',
            'retourne': 'Retourné',
            'en_retour': 'En retour',
            'annule': 'Annulé',
            'annulé': 'Annulé',
            'paye': 'Payé',
            'payé': 'Payé',
            'refuse': 'Refusé',
            'refusé': 'Refusé'
        };
        return labels[status] || status;
    },

    getStatusClass(status) {
        const classes = {
            'en_attente': 'pending',
            'en_cours': 'processing',
            'en_livraison': 'delivering',
            'livre': 'delivered',
            'livré': 'delivered',
            'retour': 'returned',
            'retourne': 'returned',
            'en_retour': 'returned',
            'annule': 'cancelled',
            'annulé': 'cancelled'
        };
        return classes[status] || 'pending';
    },

    // Persistance des données
    loadFromStorage(key) {
        const data = localStorage.getItem(key);
        if (data) {
            this[key] = JSON.parse(data);
        }
    },

    saveToStorage(key) {
        localStorage.setItem(key, JSON.stringify(this[key]));
    },

    async loadColis() {
        console.log('📦 Chargement des colis depuis l\'API...');
        
        const token = this.getAgentToken();
        if (!token) {
            console.warn('⚠️ Pas de token, impossible de charger les colis');
            this.colis = [];
            this.updateColisTable();
            return;
        }
        
        try {
            const response = await fetch(`${window.API_CONFIG.API_URL}/colis`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('✅ Réponse API colis:', result);
            
            // L'API retourne { success: true, data: [...] }
            this.colis = result.data || result.colis || [];
            console.log(`✅ ${this.colis.length} colis chargés depuis l'API`);
            
            // Mettre à jour le tableau
            this.updateColisTable();
            
        } catch (error) {
            console.error('❌ Erreur lors du chargement des colis:', error);
            
            // Fallback: essayer de charger depuis localStorage (cache)
            const cachedColis = localStorage.getItem('colis');
            if (cachedColis) {
                console.log('💡 Utilisation du cache localStorage');
                this.colis = JSON.parse(cachedColis);
            } else {
                this.colis = [];
            }
            
            this.updateColisTable();
        }
    },

    editUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (user) {
            // Émettre un événement pour ouvrir le modal d'édition
            document.dispatchEvent(new CustomEvent('openEditUserModal', { detail: user }));
        }
    },

    editAgence(agenceId) {
        const agence = this.agences.find(a => a.id === agenceId);
        if (agence) {
            // Émettre un événement pour ouvrir le modal d'édition
            document.dispatchEvent(new CustomEvent('openEditAgenceModal', { detail: agence }));
        }
    },

    findColisByQR(qrCode) {
        // Pour l'instant, on simule la recherche
        // Dans une vraie application, cette méthode ferait un appel à l'API
        console.log('Recherche du colis avec le QR code:', qrCode);
        return null; // Retourne null si aucun colis n'est trouvé
    },

    addWilaya(wilayaData) {
        // Use WilayaManager for wilaya operations
        import('./wilaya-manager.js').then(({ wilayaManager }) => {
            wilayaManager.addWilaya(wilayaData);
        });
    },

    updateWilaya(id, data) {
        // Use WilayaManager for wilaya operations
        import('./wilaya-manager.js').then(({ wilayaManager }) => {
            wilayaManager.updateWilaya(id, data);
        });
    },

    // addColis() déjà défini plus haut - pas besoin de le redéfinir ici

    // ✅ Mise à jour via API MongoDB
    async updateColis(id, data) {
        try {
            const token = this.getAgentToken();
            const response = await fetch(`${window.API_CONFIG.API_URL}/colis/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `Erreur HTTP: ${response.status}`);
            }

            const result = await response.json();
            console.log('✅ Colis modifié via API:', result);
            
            // Recharger depuis API
            await this.loadColis();
            alert('✅ Colis modifié avec succès !');
        } catch (error) {
            console.error('❌ Erreur modification colis:', error);
            alert(`❌ Erreur lors de la modification:\n${error.message}`);
        }
    },

    generateTrackingNumber() {
        // Générer un numéro de suivi unique au format TRK + 11 chiffres
        const prefix = 'TRK';
        // Générer 11 chiffres aléatoires
        let randomDigits = '';
        for (let i = 0; i < 11; i++) {
            randomDigits += Math.floor(Math.random() * 10);
        }
        return `${prefix}${randomDigits}`;
    },

    updateWilayasTable() {
        // Use WilayaManager for UI updates
        import('./wilaya-manager.js').then(({ wilayaManager }) => {
            wilayaManager.updateUI();
        });
    },

    filterAndSearchColis() {
        // Récupérer les valeurs des filtres
        const searchValue = document.getElementById('colisSearchInput')?.value.toLowerCase() || '';
        const filterDateValue = document.getElementById('filterDate')?.value || 'all';
        const filterStatutValue = document.getElementById('filterStatut')?.value || 'all';
        const filterTypeValue = document.getElementById('filterType')?.value || 'all';
        const filterWilayaValue = document.getElementById('filterWilaya')?.value || 'all';

        // Filtrer les colis
        let filtered = [...this.colis];

        // Filtre par recherche (tracking, client, téléphone, adresse)
        if (searchValue) {
            filtered = filtered.filter(colis => {
                const tracking = (colis.tracking || colis.reference || '').toLowerCase();
                const client = (colis.destinataire?.nom || colis.clientNom || '').toLowerCase();
                const tel = (colis.destinataire?.telephone || colis.clientTel || '').toLowerCase();
                const adresse = (colis.destinataire?.adresse || colis.adresse || '').toLowerCase();
                const expediteur = (colis.nomExpediteur || colis.expediteurNom || colis.commercant || '').toLowerCase();
                
                return tracking.includes(searchValue) ||
                       client.includes(searchValue) ||
                       tel.includes(searchValue) ||
                       adresse.includes(searchValue) ||
                       expediteur.includes(searchValue);
            });
        }

        // Filtre par date
        if (filterDateValue !== 'all') {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            filtered = filtered.filter(colis => {
                const colisDate = new Date(colis.createdAt || colis.date);
                
                switch(filterDateValue) {
                    case 'today':
                        return colisDate >= today;
                    case 'week':
                        const weekAgo = new Date(today);
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        return colisDate >= weekAgo;
                    case 'month':
                        const monthAgo = new Date(today);
                        monthAgo.setMonth(monthAgo.getMonth() - 1);
                        return colisDate >= monthAgo;
                    default:
                        return true;
                }
            });
        }

        // Filtre par statut
        if (filterStatutValue !== 'all') {
            filtered = filtered.filter(colis => {
                const statut = (colis.statut || colis.status || '').toLowerCase();
                return statut.includes(filterStatutValue.toLowerCase());
            });
        }

        // Filtre par type
        if (filterTypeValue !== 'all') {
            filtered = filtered.filter(colis => {
                const type = (colis.typeLivraison || colis.type || '').toLowerCase();
                return type.includes(filterTypeValue.toLowerCase());
            });
        }

        // Filtre par wilaya
        if (filterWilayaValue !== 'all') {
            filtered = filtered.filter(colis => {
                const wilayaDest = colis.destinataire?.wilaya || colis.wilayaDest || '';
                return wilayaDest === filterWilayaValue;
            });
        }

        // Mettre à jour le tableau avec les colis filtrés
        this.updateColisTableWithFiltered(filtered);
    },

    updateColisTable() {
        // Utiliser tous les colis sans filtre
        this.updateColisTableWithFiltered(this.colis);
    },

    updateColisTableWithFiltered(colisFiltres) {
        const tableBody = document.querySelector('#colisTable tbody');
        if (!tableBody) {
            console.log('Table body des colis non trouvé');
            return;
        }

        // 🔥 VIDER LE TABLEAU AVANT DE LE REMPLIR (sinon duplications!)
        tableBody.innerHTML = '';

        // 🔥 MIGRÉ VERS API - Pas de rechargement localStorage
        // Les colis sont déjà dans this.colis depuis loadColis() API
        console.log('✅ Affichage de', colisFiltres.length, 'colis');

        if (!colisFiltres || colisFiltres.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="16" style="text-align: center;">Aucun colis dans cette agence</td></tr>';
            return;
        }

        // 📊 Déclencher la mise à jour des statistiques du dashboard
        if (window.DashboardStats && window.DashboardStats.updateAllStats) {
            window.DashboardStats.updateAllStats();
        } else {
            // Sinon, déclencher un événement personnalisé
            document.dispatchEvent(new Event('colisUpdated'));
        }

        tableBody.innerHTML = colisFiltres.map(colis => {
            // ✅ MAPPING CORRECT selon le modèle MongoDB Colis
            const reference = colis.tracking || colis.reference || '-';
            
            // ✅ PRIORITÉ CORRIGÉE: Afficher le nom saisi dans le formulaire (nomExpediteur)
            // Au lieu du nom de l'agent (expediteur.nom)
            const expediteur = colis.nomExpediteur || colis.expediteurNom || colis.commercant || colis.expediteur?.nom || '-';
            const telExpediteur = colis.telExpediteur || colis.expediteurTel || colis.commercantTel || colis.expediteur?.telephone || '-';
            
            // ✅ AGENCE EXPÉDITEUR: Récupérer le nom de l'agence qui a créé le colis
            let agenceExpediteur = '-';
            const agences = JSON.parse(localStorage.getItem('agences') || '[]');
            const agenceId = colis.agence || colis.bureauSource || colis.agenceSource;
            if (agenceId) {
                // Si agenceId est un objet, extraire l'ID
                const id = typeof agenceId === 'object' ? (agenceId._id || agenceId.id) : agenceId;
                const agenceObj = agences.find(a => 
                    a._id === id || 
                    a.code === id ||
                    a.id === id
                );
                agenceExpediteur = agenceObj ? agenceObj.nom : id;
            }
            
            const client = colis.destinataire?.nom || colis.clientNom || '-';
            const telephone = colis.destinataire?.telephone || colis.clientTel || '-';
            
            // ✅ WILAYA SOURCE: Multiples sources possibles
            let wilayaSourceCode = null;
            
            // Essayer différentes sources
            if (colis.wilayaSource) {
                wilayaSourceCode = colis.wilayaSource;
            } else if (colis.bureauSource?.wilaya) {
                wilayaSourceCode = colis.bureauSource.wilaya;
            } else if (colis.agenceSource?.wilaya) {
                wilayaSourceCode = colis.agenceSource.wilaya;
            } else if (colis.expediteur?.wilaya) {
                wilayaSourceCode = colis.expediteur.wilaya;
            } else if (colis.wilayaExp) {
                wilayaSourceCode = colis.wilayaExp;
            }
            
            // Si on a un code bureau (AGxxx), essayer de trouver la wilaya associée
            if (!wilayaSourceCode && (colis.bureauSource || colis.agenceSource)) {
                const bureauCode = colis.bureauSource || colis.agenceSource;
                const agences = JSON.parse(localStorage.getItem('agences') || '[]');
                const agenceSource = agences.find(a => 
                    a.code === bureauCode || 
                    a._id === bureauCode ||
                    a.id === bureauCode
                );
                if (agenceSource) {
                    wilayaSourceCode = agenceSource.wilaya || agenceSource.codeWilaya;
                }
            }
            
            const wilayaSourceName = this.getWilayaName(wilayaSourceCode);
            const wilayaSource = wilayaSourceName && wilayaSourceName !== '-' ? wilayaSourceName : (wilayaSourceCode || '-');
            
            // ✅ WILAYA DESTINATION: Extraire le code et convertir en nom
            const wilayaDestCode = colis.destinataire?.wilaya || colis.wilayaDest || colis.wilaya || null;
            const wilayaDestName = this.getWilayaName(wilayaDestCode);
            const wilayaDest = wilayaDestName && wilayaDestName !== '-' ? wilayaDestName : (wilayaDestCode || '-');
            
            // ✅ ADRESSE: Si type bureau, afficher le nom de l'agence, sinon l'adresse
            let adresseAffichage = '-';
            if (colis.typeLivraison === 'stopdesk' || colis.typeLivraison === 'bureau') {
                // Récupérer le nom de l'agence depuis les agences en cache
                const agences = JSON.parse(localStorage.getItem('agences') || '[]');
                const agenceDestinataire = agences.find(a => 
                    a._id === colis.agenceDestination || 
                    a.code === colis.bureauDest ||
                    a.id === colis.agenceDestination
                );
                adresseAffichage = agenceDestinataire ? `📍 ${agenceDestinataire.nom}` : colis.bureauDest || 'Bureau';
            } else {
                adresseAffichage = colis.destinataire?.adresse || colis.adresse || '-';
            }
            
            const date = colis.createdAt ? new Date(colis.createdAt).toLocaleDateString('fr-FR') : 
                        colis.date ? new Date(colis.date).toLocaleDateString('fr-FR') : '-';
            
            // ✅ TYPE: Afficher le vrai type de livraison avec ICÔNE
            const typeAffichage = colis.typeLivraison === 'domicile' ? 
                '<span class="type-badge type-domicile"><ion-icon name="home"></ion-icon> Domicile</span>' : 
                (colis.typeLivraison === 'stopdesk' || colis.typeLivraison === 'bureau') ? 
                '<span class="type-badge type-bureau"><ion-icon name="business"></ion-icon> Bureau</span>' :
                `<span class="type-badge">${colis.typeLivraison || 'Standard'}</span>`;
            
            // ✅ CONTENU: Afficher le contenu du colis
            const contenu = colis.contenu || '-';
            
            // ✅ MONTANT: Afficher totalAPayer (montant + frais)
            const montantAffichage = colis.totalAPayer || colis.montant || colis.prixColis || '0';
            
            // ✅ STATUT: Statut réel du colis
            const statut = colis.status || colis.statut || 'en_attente';
            const badgeHTML = this.getColisStatusBadge(statut);
            const colisId = colis._id || colis.id;
            
            return `
            <tr>
                <td>
                    <div class="checkbox-wrapper">
                        <input type="checkbox" id="colis_${colisId}" />
                        <label for="colis_${colisId}"></label>
                    </div>
                </td>
                <td><span class="tracking-number">${reference}</span></td>
                <td><span class="person-name">${expediteur}</span></td>
                <td><span class="phone-number">${telExpediteur}</span></td>
                <td><span class="agency-name">${agenceExpediteur}</span></td>
                <td><span class="person-name">${client}</span></td>
                <td><span class="phone-number">${telephone}</span></td>
                <td><span class="wilaya-tag">${wilayaSource}</span></td>
                <td><span class="wilaya-tag">${wilayaDest}</span></td>
                <td><span class="address-text">${adresseAffichage}</span></td>
                <td><span class="date-text">${date}</span></td>
                <td>${typeAffichage}</td>
                <td><span class="content-text">${contenu}</span></td>
                <td><span class="price-amount">${montantAffichage} DA</span></td>
                <td class="text-center">${badgeHTML}</td>
                <td class="actions">
                    <button class="action-btn view" onclick="window.handleColisAction('view', '${colisId}')" title="Voir les détails">
                        <ion-icon name="eye-outline"></ion-icon>
                    </button>
                    <button class="action-btn print" onclick="window.handleColisAction('print', '${colisId}')" title="Imprimer le ticket">
                        <ion-icon name="print-outline"></ion-icon>
                    </button>
                    <button class="action-btn warning" onclick="window.handleColisAction('marquer-en-livraison', '${colisId}')" title="Ajouter au centre de tri">
                        <ion-icon name="folder-open-outline"></ion-icon>
                    </button>
                    <button class="action-btn edit" onclick="window.handleColisAction('edit', '${colisId}')" title="Modifier">
                        <ion-icon name="create-outline"></ion-icon>
                    </button>
                    <button class="action-btn delete" onclick="window.handleColisAction('delete', '${colisId}')" title="Supprimer">
                        <ion-icon name="trash-outline"></ion-icon>
                    </button>
                </td>
            </tr>
        `;
        }).join('');

        console.log(`Tableau des colis mis à jour avec ${colisFiltres.length} colis (agents uniquement)`);
        
        // ✅ MISE À JOUR DES COMPTEURS DE STATISTIQUES
        this.updateStatsCounters();
    },

    // ✅ NOUVELLE FONCTION: Mise à jour des compteurs de statistiques
    updateStatsCounters() {
        try {
            const total = this.colis.length;
            
            // Compter par statut (gérer tous les formats possibles)
            const livres = this.colis.filter(c => {
                const status = (c.status || c.statut || '').toLowerCase().trim();
                return status === 'livre' || status === 'livré' || status === 'delivered';
            }).length;
            
            const enTransit = this.colis.filter(c => {
                const status = (c.status || c.statut || '').toLowerCase().trim();
                return status === 'en_transit' || status === 'en transit' || status === 'transit' || status === 'en_cours' ||
                       status === 'expedie' || status === 'expédié' || status === 'en_livraison' || status === 'arrive_agence';
            }).length;
            
            const enAttente = this.colis.filter(c => {
                const status = (c.status || c.statut || '').toLowerCase().trim();
                return status === 'en_attente' || status === 'en attente' || status === 'attente' || status === 'pending' ||
                       status === 'accepte' || status === 'accepté' || status === 'en_preparation' || status === 'pret_a_expedier';
            }).length;
            
            const retard = this.colis.filter(c => {
                const status = (c.status || c.statut || '').toLowerCase().trim();
                return status === 'retard' || status === 'retarde' || status === 'delayed' || status === 'en_retard';
            }).length;
            
            // Mettre à jour les éléments DOM
            const totalEl = document.getElementById('totalColis');
            const livresEl = document.getElementById('colisLivres');
            const transitEl = document.getElementById('colisTransit');
            const attenteEl = document.getElementById('colisAttente');
            const retardEl = document.getElementById('colisRetard');
            
            if (totalEl) {
                totalEl.textContent = total;
                totalEl.style.fontWeight = '700';
            }
            if (livresEl) {
                livresEl.textContent = livres;
                livresEl.style.fontWeight = '700';
            }
            if (transitEl) {
                transitEl.textContent = enTransit;
                transitEl.style.fontWeight = '700';
            }
            if (attenteEl) {
                attenteEl.textContent = enAttente;
                attenteEl.style.fontWeight = '700';
            }
            if (retardEl) {
                retardEl.textContent = retard;
                retardEl.style.fontWeight = '700';
            }
            
            console.log('📊 Statistiques mises à jour:', { 
                total, 
                livres,
                enTransit, 
                enAttente, 
                retard,
                statuts: this.colis.map(c => c.status || c.statut)
            });
        } catch (error) {
            console.error('❌ Erreur mise à jour stats:', error);
        }
    },

    // Gestionnaire global pour les actions de colis
    setupColisHandlers() {
        const self = this;
        
        // Gestionnaires pour les filtres et recherche
        const searchInput = document.getElementById('colisSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                self.filterAndSearchColis();
            });
        }
        
        const filterDate = document.getElementById('filterDate');
        if (filterDate) {
            filterDate.addEventListener('change', () => {
                self.filterAndSearchColis();
            });
        }
        
        const filterStatut = document.getElementById('filterStatut');
        if (filterStatut) {
            filterStatut.addEventListener('change', () => {
                self.filterAndSearchColis();
            });
        }
        
        const filterType = document.getElementById('filterType');
        if (filterType) {
            filterType.addEventListener('change', () => {
                self.filterAndSearchColis();
            });
        }
        
        const filterWilaya = document.getElementById('filterWilaya');
        if (filterWilaya) {
            filterWilaya.addEventListener('change', () => {
                self.filterAndSearchColis();
            });
            
            // Peupler le select avec les wilayas
            if (self.wilayas && self.wilayas.length > 0) {
                const wilayasUniques = [...new Set(self.colis.map(c => c.destinataire?.wilaya || c.wilayaDest).filter(Boolean))];
                filterWilaya.innerHTML = '<option value="all">Toutes les wilayas</option>';
                wilayasUniques.forEach(codeWilaya => {
                    const wilayaObj = self.wilayas.find(w => w.code == codeWilaya);
                    if (wilayaObj) {
                        const option = document.createElement('option');
                        option.value = codeWilaya;
                        option.textContent = `${wilayaObj.code} - ${wilayaObj.nom}`;
                        filterWilaya.appendChild(option);
                    }
                });
            }
        }
        
        window.handleColisAction = (action, id) => {
            // ✅ Chercher avec _id (MongoDB) ou id (fallback)
            const colis = self.colis.find(c => c._id === id || c.id === id);
            if (!colis) {
                console.error('❌ Colis non trouvé:', id);
                console.log('📋 Colis disponibles:', self.colis.map(c => ({ id: c._id || c.id, tracking: c.tracking })));
                alert(`Colis introuvable!\nID recherché: ${id}`);
                return;
            }

            console.log('✅ Colis trouvé pour action:', action, colis);

            switch (action) {
                case 'view':
                    // Remplir le modal de détails avec MAPPING CORRECT MongoDB
                    const wilayaExpCode = colis.expediteur?.wilaya || colis.wilayaSource || '-';
                    const wilayaDestCode = colis.destinataire?.wilaya || colis.wilayaDest || '-';
                    
                    document.getElementById('expName').textContent = colis.expediteur?.nom || colis.commercant || '-';
                    document.getElementById('expPhone').textContent = colis.expediteur?.telephone || colis.commercantTel || '-';
                    document.getElementById('expWilaya').textContent = self.getWilayaName(wilayaExpCode);
                    
                    document.getElementById('destName').textContent = colis.destinataire?.nom || colis.clientNom || '-';
                    document.getElementById('destPhone').textContent = colis.destinataire?.telephone || colis.clientTel || '-';
                    document.getElementById('destWilaya').textContent = self.getWilayaName(wilayaDestCode);
                    
                    document.getElementById('colisContent').textContent = colis.description || '-';
                    document.getElementById('colisService').textContent = colis.typeLivraison === 'domicile' ? 'Livraison à domicile' : 'Livraison au bureau';
                    document.getElementById('colisWilayaExp').textContent = self.getWilayaName(wilayaExpCode);
                    document.getElementById('destAddress').textContent = colis.destinataire?.adresse || colis.adresse || '-';
                    document.getElementById('colisAmount').textContent = (colis.montant || colis.prixColis || '0') + ' DA';
                    document.getElementById('colisWeight').textContent = (colis.poids || '0') + ' kg';
                    document.getElementById('orderDate').textContent = colis.date ? new Date(colis.date).toLocaleDateString('fr-FR') : '-';
                    
                    // Afficher le modal
                    const detailsModal = document.getElementById('detailsModal');
                    if (detailsModal) {
                        detailsModal.style.display = 'flex';
                    }
                    break;
                case 'print':
                    self.printTicket(colis);
                    break;
                case 'edit':
                    // ✅ Ouvrir le modal d'édition avec données du colis
                    const modal = document.getElementById('colisModal');
                    const form = document.getElementById('colisForm');
                    if (form && modal) {
                        // Stocker l'ID pour la sauvegarde
                        form.dataset.editId = id;
                        
                        // Remplir le formulaire avec les données du colis
                        if (document.getElementById('commercantNom')) {
                            document.getElementById('commercantNom').value = colis.expediteur?.nom || '';
                        }
                        if (document.getElementById('commercantTel')) {
                            document.getElementById('commercantTel').value = colis.expediteur?.telephone || '';
                        }
                        if (document.getElementById('clientNom')) {
                            document.getElementById('clientNom').value = colis.destinataire?.nom || '';
                        }
                        if (document.getElementById('clientTel')) {
                            document.getElementById('clientTel').value = colis.destinataire?.telephone || '';
                        }
                        if (document.getElementById('wilayaDest')) {
                            document.getElementById('wilayaDest').value = colis.destinataire?.wilaya || '';
                        }
                        if (document.getElementById('adresse')) {
                            document.getElementById('adresse').value = colis.destinataire?.adresse || '';
                        }
                        if (document.getElementById('commune')) {
                            document.getElementById('commune').value = colis.destinataire?.commune || '';
                        }
                        if (document.getElementById('prixColis')) {
                            document.getElementById('prixColis').value = colis.montant || '';
                        }
                        if (document.getElementById('poids')) {
                            document.getElementById('poids').value = colis.poids || '';
                        }
                        if (document.getElementById('description')) {
                            document.getElementById('description').value = colis.description || '';
                        }
                        
                        // Sélectionner le type de livraison
                        const typeLivraison = colis.typeLivraison || 'domicile';
                        const typeDomicile = document.getElementById('typeDomicile');
                        const typeBureau = document.getElementById('typeBureau');
                        if (typeDomicile && typeBureau) {
                            if (typeLivraison === 'domicile') {
                                typeDomicile.checked = true;
                            } else {
                                typeBureau.checked = true;
                            }
                        }
                        
                        // Changer le titre du modal
                        const modalTitle = modal.querySelector('h2');
                        if (modalTitle) {
                            modalTitle.textContent = '✏️ Modifier le colis';
                        }
                        
                        modal.style.display = 'flex';
                        console.log('📝 Formulaire rempli pour modification:', colis);
                    }
                    break;
                
                case 'marquer-en-livraison':
                    // ✅ Ajouter le colis au centre de tri (bouton orange dans tableau COLIS)
                    self.ajouterCentreTri(colis);
                    break;
                
                case 'marquer-livre':
                    // ✅ Sortir le colis pour livraison
                    self.marquerColisEnLivraison(colis);
                    break;
                
                case 'delete':
                    // ✅ Confirmation avec tracking number correct
                    const trackingDisplay = colis.tracking || colis.reference || colis.trackingNumber || id;
                    if (confirm(`🗑️ Êtes-vous sûr de vouloir supprimer le colis "${trackingDisplay}" ?\n\nCette action est IRRÉVERSIBLE !`)) {
                        self.deleteColis(id);
                    }
                    break;
            }
        };
    },

    generateAgenceCode() {
        const date = new Date();
        const year = date.getFullYear().toString().substr(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `AG${year}${month}-${day}-${random}`;
    },

    // ✅ NOUVELLE FONCTION: Ajouter un colis au centre de tri (statut: AU CENTRE DE TRI)
    async ajouterCentreTri(colis) {
        const colisId = colis._id || colis.id;
        const tracking = colis.tracking || colis.reference || colis.codeSuivi || 'N/A';
        const destinataire = colis.destinataire?.nom || colis.clientNom || 'Client';
        const wilayaDest = colis.destinataire?.wilaya || colis.wilayaDest || '-';
        
        console.log('📦 Ajout au centre de tri:', { colisId, tracking, destinataire });

        // Demander confirmation
        const confirmer = confirm(
            `📥 AJOUTER CE COLIS AU CENTRE DE TRI ?\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
            `Code de suivi: ${tracking}\n` +
            `Destinataire: ${destinataire}\n` +
            `Wilaya: ${this.getWilayaName(wilayaDest)}\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
            `Le colis sera marqué comme "AU CENTRE DE TRI" 📥`
        );

        if (!confirmer) {
            console.log('❌ Opération annulée par l\'utilisateur');
            return;
        }

        try {
            const token = sessionStorage.getItem('auth_token') || localStorage.getItem('agent_token');
            if (!token) {
                throw new Error('Token manquant - Veuillez vous reconnecter');
            }

            console.log(`🔄 Mise à jour du statut du colis ${colisId} vers "arrive_agence"`);

            // Appeler l'API pour mettre à jour le statut
            const response = await fetch(`${window.API_CONFIG.API_URL}/colis/${colisId}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: 'arrive_agence',
                    description: 'Colis ajouté au centre de tri'
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `Erreur HTTP ${response.status}`);
            }

            const result = await response.json();
            console.log('✅ Statut mis à jour avec succès:', result);

            // Recharger la liste des colis
            await this.loadColis();
            this.updateColisTable();

            // Afficher un message de succès
            alert(
                `✅ COLIS AJOUTÉ AU CENTRE DE TRI !\n\n` +
                `Code: ${tracking}\n` +
                `Destinataire: ${destinataire}\n` +
                `Wilaya: ${this.getWilayaName(wilayaDest)}\n\n` +
                `Le colis est maintenant "AU CENTRE DE TRI" 📥\n` +
                `Date: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}\n\n` +
                `Le colis est prêt pour la livraison.`
            );

        } catch (error) {
            console.error('❌ Erreur lors de l\'ajout au centre:', error);
            alert(
                `❌ ERREUR LORS DE LA MISE À JOUR\n\n` +
                `Détails: ${error.message}\n\n` +
                `Veuillez vérifier votre connexion et réessayer.\n` +
                `Si le problème persiste, contactez l'administrateur.`
            );
        }
    },

    // ✅ NOUVELLE FONCTION: Sortir un colis pour livraison (statut: EN LIVRAISON)
    async marquerColisEnLivraison(colis) {
        const colisId = colis._id || colis.id;
        const tracking = colis.tracking || colis.reference || colis.codeSuivi || 'N/A';
        const destinataire = colis.destinataire?.nom || colis.clientNom || 'Client';
        const wilayaDest = colis.destinataire?.wilaya || colis.wilayaDest || '-';
        
        console.log('📦 Sortie pour livraison du colis:', { colisId, tracking, destinataire });

        // Demander confirmation
        const confirmer = confirm(
            `🚚 SORTIR CE COLIS POUR LIVRAISON ?\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
            `Code de suivi: ${tracking}\n` +
            `Destinataire: ${destinataire}\n` +
            `Wilaya: ${this.getWilayaName(wilayaDest)}\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
            `Le statut sera mis à jour : "EN LIVRAISON" 🚚`
        );

        if (!confirmer) {
            console.log('❌ Opération annulée par l\'utilisateur');
            return;
        }

        try {
            const token = sessionStorage.getItem('auth_token') || localStorage.getItem('agent_token');
            if (!token) {
                throw new Error('Token manquant - Veuillez vous reconnecter');
            }

            console.log(`🔄 Mise à jour du statut du colis ${colisId} vers "en_livraison"`);

            // Appeler l'API pour mettre à jour le statut
            const response = await fetch(`${window.API_CONFIG.API_URL}/colis/${colisId}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: 'en_livraison',
                    description: 'Colis sorti pour livraison par l\'agent'
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `Erreur HTTP ${response.status}`);
            }

            const result = await response.json();
            console.log('✅ Statut mis à jour avec succès:', result);

            // Recharger la liste des colis
            await this.loadColis();
            this.updateColisTable();

            // Afficher un message de succès
            alert(
                `✅ COLIS SORTI POUR LIVRAISON !\n\n` +
                `Code: ${tracking}\n` +
                `Destinataire: ${destinataire}\n` +
                `Wilaya: ${this.getWilayaName(wilayaDest)}\n\n` +
                `Le colis est maintenant "EN LIVRAISON" 🚚\n` +
                `Date: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}\n\n` +
                `Utilisez le scanner dans la section LIVRAISON\n` +
                `pour confirmer la livraison finale.`
            );

        } catch (error) {
            console.error('❌ Erreur lors de la sortie pour livraison:', error);
            alert(
                `❌ ERREUR LORS DE LA MISE À JOUR\n\n` +
                `Détails: ${error.message}\n\n` +
                `Veuillez vérifier votre connexion et réessayer.\n` +
                `Si le problème persiste, contactez l'administrateur.`
            );
        }
    },

    // ✅ NOUVELLE FONCTION: Marquer un colis comme livré
    async marquerColisLivre(colis) {
        const colisId = colis._id || colis.id;
        const tracking = colis.tracking || colis.reference || colis.codeSuivi || 'N/A';
        const destinataire = colis.destinataire?.nom || colis.clientNom || 'Client';
        const wilayaDest = colis.destinataire?.wilaya || colis.wilayaDest || '-';
        
        console.log('📦 Marquage livraison pour colis:', { colisId, tracking, destinataire });

        // Demander confirmation
        const confirmer = confirm(
            `✅ MARQUER CE COLIS COMME LIVRÉ ?\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
            `Code de suivi: ${tracking}\n` +
            `Destinataire: ${destinataire}\n` +
            `Wilaya: ${this.getWilayaName(wilayaDest)}\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
            `Le statut sera mis à jour : "Livré" ✔️`
        );

        if (!confirmer) {
            console.log('❌ Opération annulée par l\'utilisateur');
            return;
        }

        try {
            const token = sessionStorage.getItem('auth_token') || localStorage.getItem('agent_token');
            if (!token) {
                throw new Error('Token manquant - Veuillez vous reconnecter');
            }

            console.log(`🔄 Mise à jour du statut du colis ${colisId} vers "livre"`);

            // Appeler l'API pour mettre à jour le statut
            const response = await fetch(`${window.API_CONFIG.API_URL}/colis/${colisId}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: 'livre',
                    description: 'Colis marqué comme livré par l\'agent'
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `Erreur HTTP ${response.status}`);
            }

            const result = await response.json();
            console.log('✅ Statut mis à jour avec succès:', result);

            // Recharger la liste des colis
            await this.loadColis();
            this.updateColisTable();

            // Afficher un message de succès
            alert(
                `✅ LIVRAISON CONFIRMÉE !\n\n` +
                `Code: ${tracking}\n` +
                `Destinataire: ${destinataire}\n` +
                `Wilaya: ${this.getWilayaName(wilayaDest)}\n\n` +
                `Le colis a été marqué comme "Livré" ✔️\n` +
                `Date de livraison: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`
            );

        } catch (error) {
            console.error('❌ Erreur lors du marquage livraison:', error);
            alert(
                `❌ ERREUR LORS DU MARQUAGE\n\n` +
                `Détails: ${error.message}\n\n` +
                `Veuillez vérifier votre connexion et réessayer.\n` +
                `Si le problème persiste, contactez l'administrateur.`
            );
        }
    },

    // Fonction pour obtenir le nom de la wilaya à partir du code
    getWilayaName(wilayaCode) {
        // ✅ Gestion robuste des valeurs undefined/null
        if (wilayaCode === undefined || wilayaCode === null || wilayaCode === '-' || wilayaCode === '') {
            return '-';
        }
        
        // Si c'est un code bureau (commence par AG), ne pas le convertir
        if (typeof wilayaCode === 'string' && wilayaCode.startsWith('AG')) {
            return '-';
        }
        
        try {
            const savedWilayas = localStorage.getItem('wilayas');
            if (!savedWilayas) {
                console.warn('⚠️ Aucune wilaya en cache - Retour du code brut:', wilayaCode);
                return String(wilayaCode); // Retourner le code si pas de wilayas en cache
            }
            
            const wilayas = JSON.parse(savedWilayas);
            
            // Chercher par code (String ou Number)
            const wilaya = wilayas.find(w => 
                w.code === wilayaCode || 
                w.code === String(wilayaCode) ||
                String(w.code) === String(wilayaCode) ||
                w.codeWilaya === wilayaCode ||
                w.codeWilaya === String(wilayaCode) ||
                String(w.codeWilaya) === String(wilayaCode) ||
                w.designation === wilayaCode ||
                w.nom === wilayaCode
            );
            
            if (wilaya) {
                return wilaya.designation || wilaya.nom || wilaya.name;
            } else {
                console.warn('⚠️ Wilaya non trouvée pour code:', wilayaCode, 'Type:', typeof wilayaCode);
                console.log('📋 Exemple de wilaya dans le cache:', wilayas[0]);
                console.warn('⚠️ Wilaya non trouvée pour code:', wilayaCode, 'Type:', typeof wilayaCode);
                return String(wilayaCode); // Retourner le code si pas de correspondance
            }
        } catch (error) {
            console.error('❌ Erreur getWilayaName:', error);
            return String(wilayaCode);
        }
    },

    printTicket(colis) {
        // Utiliser la fonction globale printTicket du fichier ticket.js
        // Adapter les noms de champs si nécessaire
        
        // Extraire le code wilaya de l'agence (format: AG2510-15-674 -> 15)
        const agenceSource = colis.bureauSource || colis.agenceSource;
        const agenceDest = colis.bureauDest || colis.agenceDest;
        
        let wilayaExpCode = colis.wilayaSource || colis.wilayaExp || colis.wilayaDepart || colis.expediteur?.wilaya || colis.wilayaExpediteur;
        let wilayaDestCode = colis.wilayaDest || colis.wilaya || colis.wilayaDestination || colis.destinataire?.wilaya;
        
        // Extraire wilaya depuis le code agence si nécessaire
        if (!wilayaExpCode && agenceSource && typeof agenceSource === 'string') {
            const match = agenceSource.match(/AG\d+-(\d+)-/);
            if (match) wilayaExpCode = match[1];
        }
        if (!wilayaDestCode && agenceDest && typeof agenceDest === 'string') {
            const match = agenceDest.match(/AG\d+-(\d+)-/);
            if (match) wilayaDestCode = match[1];
        }
        
        // Formater le type de livraison
        const typeLivraison = colis.typeLivraison || colis.typelivraison || colis.type || 'domicile';
        const typeFormate = typeLivraison === 'domicile' ? '🏠 Domicile' :
                           typeLivraison === 'stopdesk' ? '🏢 Stop Desk' :
                           typeLivraison === 'bureau' ? '🏢 Bureau' : '🏠 Domicile';
        
        const colisAdapte = {
            ref: colis.tracking || colis.reference || colis.trackingNumber || colis.codeSuivi || colis._id,
            date: colis.date || colis.createdAt || new Date().toISOString(),
            commercant: colis.expediteur?.nom || colis.nomExpediteur || colis.expediteurNom || colis.commercant || colis.nomCommercant || '-',
            commercantTel: colis.expediteur?.telephone || colis.telExpediteur || colis.expediteurTel || colis.commercantTel || colis.telCommercant || '-',
            commercantAdresse: colis.commercantAdresse || colis.adresseCommercant || colis.expediteur?.adresse || colis.adresseExpediteur || agenceSource || '-',
            wilayaExp: this.getWilayaName(wilayaExpCode) || 'Non spécifiée',
            client: colis.client || colis.clientNom || colis.nomClient || colis.destinataire?.nom || colis.destinataire || '-',
            tel: colis.telephone || colis.clientTel || colis.telClient || colis.tel || colis.destinataire?.telephone || '-',
            telSecondaire: colis.telSecondaire || colis.tel2 || '-',
            adresse: colis.adresse || colis.adresseDestinataire || agenceDest || colis.destinataire?.adresse || '-',
            wilayaDest: this.getWilayaName(wilayaDestCode) || 'Non spécifiée',
            type: typeFormate,
            typeColis: colis.typeColis || colis.typeArticle || 'standard',
            contenu: colis.contenu || colis.description || 'Colis',
            montant: colis.montant || colis.prixColis || 0,
            fraisLivraison: colis.fraisLivraison || 300,
            totalAPayer: colis.totalAPayer || (colis.montant || 0) + (colis.fraisLivraison || 300),
            prixColis: colis.montant || colis.prixColis || 0,
            poids: colis.poids || colis.poidsColis || 2
        };
        
        // Appeler la fonction printTicket globale
        if (typeof printTicket === 'function') {
            window.printTicket(colisAdapte);
        } else {
            console.error('La fonction printTicket n\'est pas disponible');
        }
        
        return; // Fin de la fonction
        
        // ANCIEN CODE SUPPRIMÉ - Ne pas utiliser
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        
        // Générer le QR Code
        const qrCanvas = document.createElement('canvas');
        if (typeof QRious !== 'undefined') {
            const qr = new QRious({
                element: qrCanvas,
                value: colis.reference || colis.trackingNumber || colis.id,
                size: 150
            });
        }
        const qrDataUrl = qrCanvas.toDataURL();

        // Générer le code-barres
        const barcodeCanvas = document.createElement('canvas');
        if (typeof JsBarcode !== 'undefined') {
            JsBarcode(barcodeCanvas, colis.reference || colis.trackingNumber || colis.id, {
                format: "CODE128",
                width: 2,
                height: 60,
                displayValue: true
            });
        }
        const barcodeDataUrl = barcodeCanvas.toDataURL();

        // Contenu HTML du ticket
        const ticketHTML = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ticket de Livraison - ${colis.reference || colis.trackingNumber}</title>
    <style>
        @page {
            size: A4;
            margin: 0;
        }
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Arial', sans-serif;
            background: white;
            padding: 20mm;
        }
        .ticket {
            width: 100%;
            max-width: 170mm;
            margin: 0 auto;
            border: 2px solid #333;
            padding: 10mm;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
            margin-bottom: 15px;
        }
        .header h1 {
            font-size: 24px;
            color: #1976D2;
            margin-bottom: 5px;
        }
        .header p {
            font-size: 12px;
            color: #666;
        }
        .codes-section {
            display: flex;
            justify-content: space-around;
            align-items: center;
            margin: 20px 0;
            padding: 15px;
            background: #f5f5f5;
            border-radius: 8px;
        }
        .qr-code, .barcode {
            text-align: center;
        }
        .qr-code img {
            width: 150px;
            height: 150px;
        }
        .barcode img {
            width: 300px;
            height: 80px;
        }
        .section {
            margin: 15px 0;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        .section h2 {
            font-size: 16px;
            color: #1976D2;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 1px solid #1976D2;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
        }
        .info-label {
            font-weight: bold;
            color: #333;
        }
        .info-value {
            color: #666;
        }
        .footer {
            margin-top: 20px;
            padding-top: 10px;
            border-top: 2px solid #333;
            text-align: center;
            font-size: 10px;
            color: #999;
        }
        .reference {
            font-size: 20px;
            font-weight: bold;
            color: #1976D2;
            text-align: center;
            margin: 10px 0;
        }
        @media print {
            body {
                padding: 0;
            }
            .ticket {
                border: none;
            }
        }
    </style>
</head>
<body>
    <div class="ticket">
        <div class="header">
            <h1>🚚 TICKET DE LIVRAISON</h1>
            <p>Plateforme de Gestion de Livraison</p>
        </div>

        <div class="reference">
            Référence: ${colis.reference || colis.trackingNumber || 'N/A'}
        </div>

        <div class="codes-section">
            <div class="qr-code">
                <img src="${qrDataUrl}" alt="QR Code">
                <p style="font-size: 10px; margin-top: 5px;">QR Code</p>
            </div>
            <div class="barcode">
                <img src="${barcodeDataUrl}" alt="Code-barres">
            </div>
        </div>

        <div class="section">
            <h2>📦 Informations Colis</h2>
            <div class="info-row">
                <span class="info-label">Date:</span>
                <span class="info-value">${new Date(colis.date || colis.createdAt).toLocaleDateString('fr-FR')}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Type de livraison:</span>
                <span class="info-value">${colis.type || colis.typeLivraison || 'Standard'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Poids:</span>
                <span class="info-value">${colis.poids || '-'} kg</span>
            </div>
            <div class="info-row">
                <span class="info-label">Description:</span>
                <span class="info-value">${colis.description || '-'}</span>
            </div>
        </div>

        <div class="section">
            <h2>👤 Destinataire</h2>
            <div class="info-row">
                <span class="info-label">Nom:</span>
                <span class="info-value">${colis.client || colis.clientNom || 'N/A'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Téléphone:</span>
                <span class="info-value">${colis.telephone || colis.clientTel || 'N/A'}</span>
            </div>
            ${colis.telSecondaire ? `
            <div class="info-row">
                <span class="info-label">Tél. secondaire:</span>
                <span class="info-value">${colis.telSecondaire}</span>
            </div>
            ` : ''}
            <div class="info-row">
                <span class="info-label">Wilaya:</span>
                <span class="info-value">${colis.wilaya || 'N/A'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Adresse:</span>
                <span class="info-value">${colis.adresse || colis.bureauDest || 'N/A'}</span>
            </div>
        </div>

        <div class="section">
            <h2>💰 Informations Financières</h2>
            <div class="info-row">
                <span class="info-label">Prix du colis:</span>
                <span class="info-value">${colis.prixColis || colis.montant || '0'} DA</span>
            </div>
            <div class="info-row">
                <span class="info-label">Frais de livraison:</span>
                <span class="info-value">${colis.fraisLivraison || '0'} DA</span>
            </div>
            <div class="info-row" style="font-weight: bold; font-size: 16px; margin-top: 10px; padding-top: 10px; border-top: 1px solid #ddd;">
                <span class="info-label">Total:</span>
                <span class="info-value">${(parseFloat(colis.prixColis || colis.montant || 0) + parseFloat(colis.fraisLivraison || 0))} DA</span>
            </div>
        </div>

        <div class="section">
            <h2>📍 Informations Expédition</h2>
            <div class="info-row">
                <span class="info-label">Bureau source:</span>
                <span class="info-value">${colis.bureauSource || 'N/A'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Bureau destination:</span>
                <span class="info-value">${colis.bureauDest || 'N/A'}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Statut:</span>
                <span class="info-value" style="color: ${colis.status === 'en_attente' ? '#ff9800' : '#4caf50'};">${colis.statut || colis.status || 'En attente'}</span>
            </div>
        </div>

        <div class="footer">
            <p>Ce ticket a été généré le ${new Date().toLocaleString('fr-FR')}</p>
            <p>Pour toute réclamation, veuillez contacter notre service client</p>
        </div>
    </div>

    <script>
        window.onload = function() {
            window.print();
            setTimeout(() => window.close(), 100);
        };
    </script>
</body>
</html>
        `;

        printWindow.document.write(ticketHTML);
        printWindow.document.close();
    },

    initializeFormListeners() {
        // Formulaire de colis - DÉSACTIVÉ car géré par colis-form.js
        // pour éviter les doublons
        /*
        const colisForm = document.getElementById('colisForm');
        if (colisForm) {
            colisForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addColis({
                    reference: document.getElementById('colisRef').value,
                    client: document.getElementById('colisClient').value,
                    telephone: document.getElementById('colisTel').value,
                    adresse: document.getElementById('colisAdresse').value,
                    wilaya: document.getElementById('colisWilaya').value,
                    commercant: document.getElementById('colisCommercant').value,
                    date: document.getElementById('colisDate').value,
                    type: document.getElementById('colisType').value,
                    montant: document.getElementById('colisMontant').value,
                    statut: document.getElementById('colisStatut').value
                });
                
                // Fermer le modal et réinitialiser le formulaire
                const modal = document.getElementById('colisModal');
                modal.style.display = 'none';
                colisForm.reset();
            });
        }
        */

        // Formulaire d'agence - DÉSACTIVÉ car géré par agence-form.js
        // pour éviter les doublons
        /*
        const agenceForm = document.getElementById('agenceForm');
        if (agenceForm) {
            agenceForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addAgence({
                    nom: document.getElementById('agenceName').value,
                    telephone: document.getElementById('agencePhone').value,
                    wilaya: document.getElementById('agenceWilayaSelect').value,
                    email: document.getElementById('agenceEmail').value,
                });
                
                // Fermer le modal et réinitialiser le formulaire
                const modal = document.getElementById('agenceModal');
                modal.style.display = 'none';
                agenceForm.reset();
            });
        }
        */
    },

    // ✅ Charger wilayas et agences en arrière-plan (non-bloquant)
    async loadWilayasAndAgences() {
        try {
            const token = this.getAgentToken();
            if (!token) {
                console.warn('⚠️ Pas de token, impossible de charger wilayas/agences');
                return;
            }

            // Charger les wilayas
            const wilayasResponse = await fetch(`${window.API_CONFIG.API_URL}/wilayas`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (wilayasResponse.ok) {
                const wilayasData = await wilayasResponse.json();
                const wilayas = wilayasData.data || wilayasData;
                localStorage.setItem('wilayas', JSON.stringify(wilayas));
                console.log('✅ Wilayas chargées:', wilayas.length);
            }
            
            // Charger les agences
            const agencesResponse = await fetch(`${window.API_CONFIG.API_URL}/agences`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (agencesResponse.ok) {
                const agencesData = await agencesResponse.json();
                const agences = agencesData.data || agencesData;
                localStorage.setItem('agences', JSON.stringify(agences));
                console.log('✅ Agences chargées:', agences.length);
            }
        } catch (error) {
            console.error('⚠️ Erreur chargement wilayas/agences:', error);
        }
    },

    init() {
        // Initialiser tous les tableaux s'ils n'existent pas
        if (!this.colis) this.colis = [];
        if (!this.agences) this.agences = [];
        if (!this.users) this.users = [];
        
        // ✅ CHARGER WILAYAS ET AGENCES EN ARRIERE-PLAN (non-bloquant)
        console.log('🔄 Chargement initial wilayas et agences en arrière-plan...');
        this.loadWilayasAndAgences();
        
        // Charger les données depuis le localStorage (fallback)
        ['users', 'agences', 'settings', 'stats', 'colis'].forEach(key => {
            this.loadFromStorage(key);
        });
        if (this.colis.length === 0) {
            this.colis = [
                {
                    id: '1',
                    reference: 'COL001',
                    clientNom: 'Ali Ahmed',
                    clientTel: '0555123456',
                    wilaya: 'Alger',
                    adresse: '123 Rue Didouche Mourad',
                    date: new Date().toISOString(),
                    type: 'Standard',
                    montant: 5000,
                    status: 'En cours'
                },
                {
                    id: '2', 
                    reference: 'COL002',
                    clientNom: 'Karim Benyahia',
                    clientTel: '0555789012',
                    wilaya: 'Oran',
                    adresse: '45 Boulevard des Martyrs',
                    date: new Date().toISOString(),
                    type: 'Express',
                    montant: 8000,
                    status: 'En attente'
                }
            ];
            this.saveToStorage('colis');
        }

        if (this.agences.length === 0) {
            this.agences = [
                {
                    id: '1',
                    code: 'AG2301-001',
                    nom: 'Agence Centrale Alger',
                    wilaya: 'Alger',
                    email: 'alger@example.com',
                    telephone: '021123456',
                    status: 'Active'
                },
                {
                    id: '2',
                    code: 'AG2301-002',
                    nom: 'Agence Oran Centre',
                    wilaya: 'Oran',
                    email: 'oran@example.com',
                    telephone: '041987654',
                    status: 'Active'
                }
            ];
            this.saveToStorage('agences');
        }

        // Mettre à jour l'interface
        this.loadUsers();
        this.loadAgences();
        this.loadSettings();
        this.loadColis();

        // Initialiser les gestionnaires d'événements
        this.setupAgenceHandlers();
        this.setupColisHandlers();

        // Initialiser les écouteurs des formulaires
        this.initializeFormListeners();
        
        // Écouter les changements du localStorage pour synchroniser les agences
        this.setupStorageListener();
    },
    
    // Système de synchronisation via storage events
    setupStorageListener() {
        console.log('🎧 Mise en place des écouteurs de synchronisation');
        
        // Écouter les événements de modification du localStorage
        window.addEventListener('storage', (e) => {
            if (e.key === 'agences') {
                console.log('🔔 Changement détecté dans localStorage pour les agences (storage event)');
                this.loadAgences();
            }
        });
        
        // Écouter aussi un événement personnalisé pour les modifications locales
        document.addEventListener('agencesUpdated', (e) => {
            console.log('🔔 Événement agencesUpdated reçu avec détails:', e.detail);
            this.loadAgences();
        });
        
        // ✅ NOUVEAU: Écouter les mises à jour de colis
        document.addEventListener('colisUpdated', async (e) => {
            console.log('🔔 Événement colisUpdated reçu - Rechargement des colis...');
            await this.loadColis();
            console.log('✅ Colis rechargés et tableau mis à jour');
        });
        
        console.log('✅ Écouteurs de synchronisation configurés');
    }
};