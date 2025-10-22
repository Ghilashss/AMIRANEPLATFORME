// Données de l'application
export const DataStore = {
    // ✅ Fonction helper pour récupérer le token admin depuis sessionStorage (AuthService)
    getAdminToken() {
        console.log('🔍 getAdminToken() appelé - Recherche du token...');
        
        // Vérifier d'abord sessionStorage (nouveau système AuthService)
        let token = sessionStorage.getItem('auth_token');
        console.log('1️⃣ sessionStorage.auth_token:', token ? `TROUVÉ (${token.substr(0, 20)}...)` : '❌ NON TROUVÉ');
        
        // Fallback sur l'ancien système localStorage pour compatibilité
        if (!token) {
            token = localStorage.getItem('admin_token');
            console.log('2️⃣ localStorage.admin_token:', token ? `TROUVÉ (${token.substr(0, 20)}...)` : '❌ NON TROUVÉ');
        }
        
        // Essayer aussi avec token générique
        if (!token) {
            token = localStorage.getItem('token');
            console.log('3️⃣ localStorage.token:', token ? `TROUVÉ (${token.substr(0, 20)}...)` : '❌ NON TROUVÉ');
        }
        
        if (!token) {
            console.error('❌ AUCUN TOKEN TROUVÉ NULLE PART !');
            console.log('📦 Contenu sessionStorage:', Object.keys(sessionStorage));
            console.log('📦 Contenu localStorage:', Object.keys(localStorage));
            alert('⚠️ Session expirée. Veuillez vous reconnecter en tant qu\'admin.\n\nOuvrez la console (F12) pour voir les détails.');
            window.location.href = '/login.html?role=admin';
            return null;
        }
        
        console.log('✅ Token trouvé et retourné');
        return token;
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
            const token = this.getAdminToken();
            const response = await fetch(`${window.API_CONFIG.API_URL}/auth/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                console.log('📥 Réponse API users:', result);
                
                // L'API retourne { success: true, data: [...] }
                this.users = result.data || result || [];
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
        return this.users;
    },

    async loadAgences() {
        console.log('🔵 loadAgences() appelé - Chargement depuis API MongoDB...');
        
        try {
            const token = this.getAdminToken();
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
    async addUser(userData) {
        // 🔥 MIGRÉ VERS API MONGODB - Création via /api/auth/register
        console.log('📤 Création utilisateur/commerçant via API MongoDB...', userData);
        
        // Validation des champs requis
        if (!userData.nom || !userData.email || !userData.password) {
            alert('❌ Erreur: Le nom, l\'email et le mot de passe sont obligatoires');
            console.error('Données invalides: nom, email et password sont requis');
            return false;
        }

        // Validation de l'email
        const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(userData.email)) {
            alert('❌ Erreur: Format d\'email invalide');
            console.error('Email invalide:', userData.email);
            return false;
        }

        // Validation du mot de passe (minimum 6 caractères)
        if (userData.password.length < 6) {
            alert('❌ Erreur: Le mot de passe doit contenir au moins 6 caractères');
            console.error('Mot de passe trop court');
            return false;
        }

        try {
            const token = this.getAdminToken();
            if (!token) {
                alert('❌ Erreur: Vous devez être connecté pour créer un utilisateur');
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
                    nom: userData.nom.trim(),
                    prenom: userData.prenom?.trim() || '',
                    email: userData.email.trim().toLowerCase(),
                    telephone: userData.telephone?.trim() || '',
                    password: userData.password,
                    role: userData.role || 'commercant',
                    wilaya: userData.wilaya?.trim() || '',
                    adresse: userData.adresse?.trim() || ''
                })
            });

            const result = await response.json();
            console.log('📥 Réponse API register:', result);

            if (!response.ok) {
                throw new Error(result.message || `Erreur HTTP ${response.status}`);
            }

            if (result.success) {
                console.log('✅ Utilisateur créé avec succès dans MongoDB:', result.data);
                alert(`✅ ${userData.role === 'commercant' ? 'Commerçant' : 'Utilisateur'} créé avec succès !\n\nEmail: ${userData.email}\nMot de passe: ${userData.password}\n\nLe ${userData.role} peut maintenant se connecter.`);
                
                // Recharger la liste des utilisateurs
                await this.loadUsers();
                
                // Fermer le modal
                const modal = document.getElementById('userModal');
                if (modal) modal.style.display = 'none';
                
                // Réinitialiser le formulaire
                const form = document.getElementById('userForm');
                if (form) form.reset();
                
                return true;
            } else {
                throw new Error(result.message || 'Échec de création');
            }

        } catch (error) {
            console.error('❌ Erreur lors de la création:', error);
            alert(`❌ Erreur lors de la création de l'utilisateur:\n${error.message}`);
            return false;
        }
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

    async addAgence(agenceData) {
        // 🔥 MIGRÉ VERS API MONGODB
        console.log('📤 Création agence via API MongoDB...', agenceData);
        
        // Vérifier que les champs requis sont présents
        if (!agenceData.nom || !agenceData.wilaya) {
            console.error('Données d\'agence invalides: nom et wilaya sont requis');
            return false;
        }

        try {
            const token = this.getAdminToken();
            if (!token) {
                console.error('❌ Pas de token disponible');
                return false;
            }

            const response = await fetch(`${window.API_CONFIG.API_URL}/agences`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nom: agenceData.nom.trim(),
                    wilaya: agenceData.wilaya.trim(),
                    email: agenceData.email?.trim() || `agence${Date.now()}@example.com`,
                    password: agenceData.password || '123456',
                    telephone: agenceData.telephone?.trim() || '-',
                    adresse: agenceData.adresse?.trim() || '-',
                    status: 'active'
                })
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('❌ Erreur création agence:', error);
                throw new Error(error.message || 'Erreur création agence');
            }

            const result = await response.json();
            console.log('✅ Agence créée avec succès:', result);
            
            // Recharger les agences depuis l'API
            await this.loadAgences();
            
            return true;
            
        } catch (error) {
            console.error('❌ Erreur addAgence API:', error);
            return false;
        }
    },

    async updateAgence(id, data) {
        // 🔥 MIGRÉ VERS API MONGODB
        console.log('📤 Mise à jour agence via API MongoDB...', id, data);
        
        try {
            const token = this.getAdminToken();
            if (!token) {
                console.error('❌ Pas de token disponible');
                return false;
            }

            const response = await fetch(`${window.API_CONFIG.API_URL}/agences/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('❌ Erreur mise à jour agence:', error);
                throw new Error(error.message || 'Erreur mise à jour agence');
            }

            const result = await response.json();
            console.log('✅ Agence mise à jour avec succès:', result);
            
            // Recharger les agences depuis l'API
            await this.loadAgences();
            
            return true;
            
        } catch (error) {
            console.error('❌ Erreur updateAgence API:', error);
            return false;
        }
    },

    async deleteAgence(id) {
        // 🔥 MIGRÉ VERS API MONGODB
        console.log('📤 Suppression agence via API MongoDB...', id);
        
        try {
            const token = this.getAdminToken();
            if (!token) {
                console.error('❌ Pas de token disponible');
                return false;
            }

            const response = await fetch(`${window.API_CONFIG.API_URL}/agences/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const error = await response.json();
                console.error('❌ Erreur suppression agence:', error);
                throw new Error(error.message || 'Erreur suppression agence');
            }

            const result = await response.json();
            console.log('✅ Agence supprimée avec succès:', result);
            
            // Recharger les agences depuis l'API
            await this.loadAgences();
            
            return true;
            
        } catch (error) {
            console.error('❌ Erreur deleteAgence API:', error);
            return false;
        }
    },

    async addColis(colisData) {
        console.log('📦 Création de colis via API...', colisData);
        
        const token = this.getAdminToken();
        if (!token) {
            alert('⚠️ Session expirée. Veuillez vous reconnecter.');
            window.location.href = '../../login.html';
            return null;
        }

        try {
            // Récupérer l'utilisateur admin connecté
            const userToken = this.getAdminToken();
            const userResponse = await fetch(`${window.API_CONFIG.API_URL}/auth/me`, {
                headers: { 'Authorization': `Bearer ${userToken}` }
            });
            const userData = await userResponse.json();
            const adminUser = userData.data;

            // Calculer le total à payer
            const montant = parseFloat(colisData.prixColis || colisData.montant) || 0;
            const fraisLivraison = parseFloat(colisData.fraisLivraison) || 0;
            const totalAPayer = montant + fraisLivraison;

            // Préparer les données pour l'API selon le modèle Colis.js
            const apiData = {
                // Expéditeur (structure complète requise)
                expediteur: {
                    id: adminUser._id, // ID de l'admin qui crée le colis
                    nom: colisData.commercant || colisData.nomCommercant || adminUser.nom || '',
                    telephone: colisData.commercantTel || colisData.telCommercant || adminUser.telephone || '',
                    adresse: colisData.adresseExp || colisData.bureauSource || '',
                    wilaya: colisData.wilayaSource || colisData.wilayaExp || ''
                },
                
                // Destinataire (structure complète requise avec champs obligatoires)
                destinataire: {
                    nom: colisData.client || colisData.clientNom || colisData.nomClient || '',
                    telephone: colisData.telephone || colisData.clientTel || colisData.telClient || '',
                    adresse: colisData.adresse || colisData.adresseDest || colisData.bureauDest || '',
                    wilaya: colisData.wilaya || colisData.wilayaDest || '',
                    commune: colisData.commune || ''
                },
                
                // Détails du colis
                typeLivraison: colisData.typeLivraison || colisData.type || 'stopdesk',
                typeArticle: colisData.typeArticle || 'autre',
                contenu: colisData.description || colisData.contenu || 'Colis',
                poids: parseFloat(colisData.poids) || 0,
                
                // Valeurs financières (REQUIS)
                montant: montant,
                fraisLivraison: fraisLivraison,
                totalAPayer: totalAPayer,
                
                // Agence et bureau
                bureauSource: colisData.bureauSource || colisData.agence || null,  // ✅ Pour le filtrage agent
                agence: colisData.bureauSource || colisData.agence || null,        // ✅ Pour compatibilité
                bureauDestination: colisData.bureauDest || null,
                
                // Statut initial
                status: 'en_attente',
                
                // Créé par admin
                createdBy: 'admin',
                
                // Notes
                notes: colisData.notes || ''
            };

            console.log('📤 Envoi vers API:', apiData);

            const response = await fetch(`${window.API_CONFIG.API_URL}/colis`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(apiData)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
            }

            const result = await response.json();
            console.log('✅ Colis créé avec succès:', result);

            // Recharger les colis depuis l'API pour afficher le nouveau
            await this.loadColis();

            alert('✅ Colis créé avec succès !');
            return result.data || result.colis;

        } catch (error) {
            console.error('❌ Erreur lors de la création du colis:', error);
            alert(`❌ Erreur: ${error.message}`);
            return null;
        }
    },

    async deleteColis(id) {
        console.log('🗑️ Suppression de colis via API:', id);
        
        const token = this.getAdminToken();
        if (!token) {
            alert('⚠️ Session expirée. Veuillez vous reconnecter.');
            window.location.href = '../../login.html';
            return;
        }

        if (!confirm('⚠️ Êtes-vous sûr de vouloir supprimer ce colis ?')) {
            return;
        }

        try {
            const response = await fetch(`${window.API_CONFIG.API_URL}/colis/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Erreur HTTP: ${response.status}`);
            }

            console.log('✅ Colis supprimé avec succès');

            // Recharger les colis depuis l'API
            await this.loadColis();

            alert('✅ Colis supprimé avec succès !');

        } catch (error) {
            console.error('❌ Erreur lors de la suppression du colis:', error);
            alert(`❌ Erreur: ${error.message}`);
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

        // Enlever les anciens écouteurs d'événements
        const table = tableBody.closest('table');
        if (table) {
            const oldClone = table.cloneNode(true);
            table.parentNode.replaceChild(oldClone, table);
        }

        if (!this.users || this.users.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Aucun utilisateur trouvé</td></tr>';
            return;
        }

        tableBody.innerHTML = this.users.map(user => {
            const userId = user._id || user.id;
            const nom = user.nom || '-';
            const prenom = user.prenom || '';
            const email = user.email || '-';
            const role = user.role || 'commercant';
            const agence = user.agence?.nom || user.agence || '-';
            const status = user.status || 'active';
            
            return `
            <tr>
                <td>${nom} ${prenom}</td>
                <td>${email}</td>
                <td>${role}</td>
                <td>${agence}</td>
                <td><span class="status ${this.getStatusClass(status)}">${status}</span></td>
                <td>
                    <button class="action-btn edit" data-user-id="${userId}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" data-user-id="${userId}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
            `;
        }).join('');

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

    // ✅ NOUVEAU: Fonction pour le design des statuts de colis
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
                label: 'Arrivé agence',
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
        
        const token = this.getAdminToken();
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
            // Mapper _id vers id pour compatibilité
            this.colis = (result.data || result.colis || []).map(colis => ({
                ...colis,
                id: colis._id || colis.id // Utiliser _id de MongoDB comme id
            }));
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

    updateColis(id, data) {
        if (!this.colis) return;
        const index = this.colis.findIndex(c => c.id === id);
        if (index !== -1) {
            this.colis[index] = { ...this.colis[index], ...data };
            this.saveToStorage('colis');
            this.updateColisTable();
        }
    },

    generateTrackingNumber() {
        // Générer un numéro de suivi unique
        const prefix = 'TRK';
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${prefix}${timestamp}${random}`;
    },

    updateWilayasTable() {
        // Use WilayaManager for UI updates
        import('./wilaya-manager.js').then(({ wilayaManager }) => {
            wilayaManager.updateUI();
        });
    },

    updateColisTable() {
        const tableBody = document.querySelector('#colisTable tbody');
        if (!tableBody) {
            console.log('Table body des colis non trouvé');
            return;
        }

        // 🔥 MIGRÉ VERS API - Pas de rechargement localStorage
        // Les colis sont déjà dans this.colis depuis loadColis() API
        console.log('✅ Utilisation des colis chargés depuis API MongoDB:', this.colis.length);

        // ADMIN voit TOUS les colis (pas de filtrage par createdBy)
        console.log(`Admin voit TOUS les ${this.colis.length} colis`);

        if (!this.colis || this.colis.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="13" style="text-align: center;">Aucun colis disponible</td></tr>';
            // ✅ MISE À JOUR DES COMPTEURS DE STATISTIQUES
            this.updateStatsCounters();
            return;
        }

        tableBody.innerHTML = this.colis.map(colis => {
            // ✅ MAPPING CORRECT selon le modèle MongoDB Colis
            const reference = colis.tracking || colis.reference || colis.trackingNumber || colis.codeSuivi || '-';
            
            // Priorité: expediteur.nom > nomExpediteur > expediteurNom > commercant
            const expediteur = colis.expediteur?.nom || colis.nomExpediteur || colis.expediteurNom || colis.commercant || colis.nomCommercant || '-';
            const telExpediteur = colis.expediteur?.telephone || colis.telExpediteur || colis.expediteurTel || colis.commercantTel || colis.telCommercant || '-';
            
            // Destinataire
            const client = colis.destinataire?.nom || colis.clientNom || colis.nomClient || colis.client || '-';
            const telephone = colis.destinataire?.telephone || colis.clientTel || colis.telClient || colis.telephone || '-';
            
            // ✅ WILAYA DESTINATION: Extraire le code et convertir en nom
            const wilayaDestCode = colis.destinataire?.wilaya || colis.wilayaDest || colis.wilaya || null;
            const wilayaDestName = this.getWilayaName(wilayaDestCode);
            const wilaya = wilayaDestName && wilayaDestName !== '-' ? wilayaDestName : (wilayaDestCode || '-');
            
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
                adresseAffichage = colis.destinataire?.adresse || colis.adresse || colis.adresseLivraison || '-';
            }
            
            const date = colis.createdAt ? new Date(colis.createdAt).toLocaleDateString('fr-FR') : 
                        colis.date ? new Date(colis.date).toLocaleDateString('fr-FR') : '-';
            
            // ✅ TYPE: Afficher le vrai type de livraison
            const typeAffichage = colis.typeLivraison === 'domicile' ? '🏠 Domicile' : 
                                 colis.typeLivraison === 'stopdesk' ? '🏢 Bureau' :
                                 colis.typeLivraison === 'bureau' ? '🏢 Bureau' : 
                                 colis.typeLivraison || colis.typeColis || colis.type || 'Standard';
            
            // ✅ MONTANT: Afficher totalAPayer (montant + frais)
            const montantAffichage = colis.totalAPayer || colis.montant || colis.prixColis || '0';
            
            // ✅ STATUT: Statut réel du colis
            const statut = colis.status || colis.statut || 'en_attente';
            const colisId = colis._id || colis.id;
            
            return `
            <tr>
                <td>
                    <div class="checkbox-wrapper">
                        <input type="checkbox" id="colis_${colisId}" />
                        <label for="colis_${colisId}"></label>
                    </div>
                </td>
                <td>${reference}</td>
                <td>${expediteur}</td>
                <td>${telExpediteur}</td>
                <td>${client}</td>
                <td>${telephone}</td>
                <td>${wilaya}</td>
                <td>${adresseAffichage}</td>
                <td>${date}</td>
                <td>${typeAffichage}</td>
                <td>${montantAffichage} DA</td>
                <td class="text-center">${this.getColisStatusBadge(statut)}</td>
                <td class="actions">
                    <div class="action-buttons">
                        <button class="btn-action view" onclick="window.handleColisAction('view', '${colisId}')" title="Voir les détails">
                            <ion-icon name="eye-outline"></ion-icon>
                        </button>
                        <button class="btn-action print" onclick="window.handleColisAction('print', '${colisId}')" title="Imprimer le ticket">
                            <ion-icon name="print-outline"></ion-icon>
                        </button>
                        <button class="btn-action edit" onclick="window.handleColisAction('edit', '${colisId}')" title="Modifier">
                            <ion-icon name="create-outline"></ion-icon>
                        </button>
                        <button class="btn-action delete" onclick="window.handleColisAction('delete', '${colisId}')" title="Supprimer">
                            <ion-icon name="trash-outline"></ion-icon>
                        </button>
                    </div>
                </td>
            </tr>
        `;
        }).join('');

        console.log(`Tableau des colis mis à jour avec ${this.colis.length} colis`);
        
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
            
            console.log('📊 Statistiques mises à jour (ADMIN):', { 
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
        window.handleColisAction = (action, id) => {
            // Chercher le colis par id ou _id
            const colis = self.colis.find(c => c.id === id || c._id === id);
            if (!colis) {
                console.error('❌ Colis non trouvé:', id);
                console.log('📋 Colis disponibles:', self.colis.map(c => ({ id: c.id, _id: c._id, tracking: c.tracking })));
                return;
            }

            switch (action) {
                case 'view':
                    // Remplir le modal de détails
                    const wilayaExpCode = colis.wilayaSource || colis.wilayaExp || colis.wilayaExpediteur || colis.bureauSource || '-';
                    const wilayaDestCode = colis.wilaya || colis.wilayaDest || '-';
                    
                    document.getElementById('expName').textContent = colis.commercant || colis.nomCommercant || '-';
                    document.getElementById('expPhone').textContent = colis.commercantTel || colis.telCommercant || '-';
                    document.getElementById('expWilaya').textContent = self.getWilayaName(wilayaExpCode);
                    
                    document.getElementById('destName').textContent = colis.client || colis.clientNom || '-';
                    document.getElementById('destPhone').textContent = colis.telephone || colis.clientTel || '-';
                    document.getElementById('destWilaya').textContent = self.getWilayaName(wilayaDestCode);
                    
                    document.getElementById('colisContent').textContent = colis.description || '-';
                    document.getElementById('colisService').textContent = colis.type || 'Standard';
                    document.getElementById('colisWilayaExp').textContent = self.getWilayaName(wilayaExpCode);
                    document.getElementById('destAddress').textContent = colis.adresse || colis.bureauDest || '-';
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
                    // Ouvrir le modal d'édition
                    const modal = document.getElementById('colisModal');
                    const form = document.getElementById('colisForm');
                    if (form && modal) {
                        // Remplir le formulaire avec les données du colis
                        // TODO: Adapter selon les champs du formulaire
                        form.dataset.editId = id;
                        modal.style.display = 'flex';
                    }
                    break;
                case 'delete':
                    if (confirm(`Êtes-vous sûr de vouloir supprimer le colis "${colis.reference || colis.trackingNumber}" ?`)) {
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

    // Fonction pour obtenir le nom de la wilaya à partir du code
    getWilayaName(wilayaCode) {
        if (!wilayaCode || wilayaCode === '-') return '-';
        
        // Si c'est un code bureau (commence par AG), ne pas le convertir
        if (typeof wilayaCode === 'string' && wilayaCode.startsWith('AG')) {
            return '-';
        }
        
        try {
            const savedWilayas = localStorage.getItem('wilayas');
            if (savedWilayas) {
                const wilayas = JSON.parse(savedWilayas);
                const wilaya = wilayas.find(w => w.code === wilayaCode || w.designation === wilayaCode);
                return wilaya ? wilaya.designation : '-';
            }
        } catch (error) {
            console.error('Erreur lors de la récupération du nom de wilaya:', error);
        }
        return '-';
    },

    printTicket(colis) {
        // Utiliser la fonction globale printTicket du fichier ticket.js
        // Adapter les noms de champs si nécessaire
        const wilayaExpCode = colis.wilayaSource || colis.wilayaExp || colis.wilayaDepart || colis.expediteur?.wilaya || colis.wilayaExpediteur || null;
        const wilayaDestCode = colis.wilayaDest || colis.wilaya || colis.wilayaDestination || colis.destinataire?.wilaya || null;
        
        const colisAdapte = {
            ref: colis.reference || colis.trackingNumber || colis.codeSuivi || colis.id,
            date: colis.date || colis.createdAt || new Date().toISOString(),
            commercant: colis.commercant || colis.nomCommercant || colis.expediteur?.nom || colis.expediteur || '-',
            commercantTel: colis.commercantTel || colis.telCommercant || colis.expediteur?.telephone || colis.expediteurTel || '-',
            commercantAdresse: colis.commercantAdresse || colis.adresseCommercant || colis.expediteur?.adresse || colis.adresseExpediteur || colis.bureauSource || '-',
            wilayaExp: this.getWilayaName(wilayaExpCode) || '-',
            client: colis.client || colis.clientNom || colis.nomClient || colis.destinataire?.nom || colis.destinataire || '-',
            tel: colis.telephone || colis.clientTel || colis.telClient || colis.tel || colis.destinataire?.telephone || '-',
            telSecondaire: colis.telSecondaire || colis.tel2 || '-',
            adresse: colis.adresse || colis.adresseDestinataire || colis.bureauDest || colis.destinataire?.adresse || '-',
            wilayaDest: this.getWilayaName(wilayaDestCode) || '-',
            type: colis.type || colis.typelivraison || 'stop_desk',
            contenu: colis.contenu || colis.description || 'Colis',
            montant: colis.prixColis || colis.montant || 0,
            fraisLivraison: colis.fraisLivraison || 0,
            poids: colis.poids || colis.poidsColis || 2
        };
        
        console.log('🎫 Données du ticket adaptées:', colisAdapte);
        
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

    async init() {
        console.log('🚀 Initialisation du DataStore...');
        
        // Initialiser tous les tableaux s'ils n'existent pas
        if (!this.colis) this.colis = [];
        if (!this.agences) this.agences = [];
        if (!this.users) this.users = [];
        
        // ✅ MIGRATION API : Ne plus charger 'colis' depuis localStorage
        // Charger seulement settings et stats depuis localStorage (cache)
        ['settings', 'stats'].forEach(key => {
            this.loadFromStorage(key);
        });
        
        console.log('📊 Chargement des données depuis l\'API...');
        
        // ✅ Charger les utilisateurs, agences et colis depuis l'API
        await this.loadUsers();
        await this.loadAgences();
        this.loadSettings();
        await this.loadColis();  // ✅ MAINTENANT DEPUIS L'API

        // Initialiser les gestionnaires d'événements
        this.setupAgenceHandlers();
        this.setupColisHandlers();

        // Initialiser les écouteurs des formulaires
        this.initializeFormListeners();
        
        // Écouter les changements du localStorage pour synchroniser les agences
        this.setupStorageListener();
        
        console.log('✅ Initialisation terminée');
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
        
        console.log('✅ Écouteurs de synchronisation configurés');
    }
};
