import { DataStore } from './data-store.js';

// Gestion des modales
export const ModalManager = {
    // ✅ Fonction helper pour récupérer le token agent (priorité agent_token)
    getAgentToken() {
        return sessionStorage.getItem('auth_token') || localStorage.getItem('agent_token');
    },
    
    config: [
        // ❌ DÉSACTIVÉ - Géré par colis-form-handler.js (shared) pour éviter les doublons
        // { id: 'colisModal', openBtn: 'addColisBtn', form: 'colisForm', handler: 'handleColisSubmit' },
        { id: 'commercantModal', openBtn: 'addCommercantBtn', form: 'commercantForm', handler: 'handleCommercantSubmit' },
        { id: 'retourModal', openBtn: 'addRetourBtn', form: 'retourForm', handler: 'handleRetourSubmit' },
        { id: 'reclamationModal', openBtn: 'addReclamationBtn', form: 'reclamationForm', handler: 'handleReclamationSubmit' }
    ],

    setupScanInput(modal) {
        const scanInput = modal.querySelector('#colisScan');
        if (scanInput) {
            console.log('Configuration du champ de scan');
            scanInput.focus();
            
            scanInput.addEventListener('input', (e) => {
                const value = e.target.value;
                console.log('Scan détecté:', value);
                
                // Si le code est complet (généralement terminé par un retour chariot)
                if (value.includes('\n') || value.includes('\r')) {
                    const cleanValue = value.replace(/[\n\r]/g, '');
                    console.log('Code complet détecté:', cleanValue);
                    
                    // Remplir automatiquement le champ de référence
                    const refInput = modal.querySelector('#colisRef');
                    if (refInput) {
                        refInput.value = cleanValue;
                    }
                    
                    // Réinitialiser le champ de scan
                    scanInput.value = '';
                    
                    // Maintenir le focus sur le champ de scan
                    scanInput.focus();
                }
            });

            // Maintenir le focus sur le champ de scan quand la modale est ouverte
            modal.addEventListener('click', () => {
                scanInput.focus();
            });
        }
    },

    setupModal(modalConfig) {
        const { id, openBtn, form: formId, handler } = modalConfig;
        const modal = document.getElementById(id);
        const openButton = document.getElementById(openBtn);
        const closeBtn = modal?.querySelector('.close-button');
        const form = document.getElementById(formId);

        // Gestionnaire d'ouverture
        if (openButton && modal) {
            openButton.addEventListener('click', (e) => {
                e.preventDefault();
                modal.style.display = 'flex';
            });
        }

        // Gestionnaire de fermeture
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }

        // Clic en dehors de la modale
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }

        // Gestionnaire de formulaire
        if (form && handler && this[handler]) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this[handler](e, modal);
            });
        }
    },

    init() {
        console.log('Initialisation de ModalManager');
        this.config.forEach(modalConfig => {
            console.log('Configuration de la modale:', modalConfig.id);
            this.setupModal(modalConfig);
        });

        // ✅ Configuration manuelle du modal Colis (ouverture/fermeture seulement, pas de submit)
        this.setupColisModal();
        
        // ✅ Configuration manuelle du modal Nouveau Commerçant
        this.setupCommercantModal();
    },

    setupColisModal() {
        const modal = document.getElementById('colisModal');
        const openButton = document.getElementById('addColisBtn');
        const closeBtn = modal?.querySelector('.close-button');

        // Gestionnaire d'ouverture
        if (openButton && modal) {
            openButton.addEventListener('click', (e) => {
                e.preventDefault();
                modal.style.display = 'flex';
                console.log('✅ Modal colis ouvert (géré par colis-form-handler.js)');
            });
        }

        // Gestionnaire de fermeture
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }

        // Clic en dehors de la modale
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }

        // Configuration du scan
        this.setupScanInput(modal);
    },

    setupCommercantModal() {
        const modal = document.getElementById('modalNouveauCommercant');
        const openButton = document.getElementById('btnNouveauCommercant');
        const form = document.getElementById('formNouveauCommercant');

        if (openButton && modal) {
            openButton.addEventListener('click', async (e) => {
                e.preventDefault();
                modal.style.display = 'flex';
                console.log('Modal commerçant ouvert');
                
                // Charger les wilayas dans le select
                await this.loadWilayasForCommercant();
            });
        }

        if (form && modal) {
            form.addEventListener('submit', (e) => {
                console.log('Formulaire commerçant soumis');
                this.handleCommercantSubmit(e, modal);
            });
        }

        // Fermer le modal en cliquant en dehors
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }
    },

    async loadWilayasForCommercant() {
        const select = document.getElementById('commercantWilaya');
        if (!select) return;

        try {
            const token = this.getAgentToken();
            const response = await fetch(`${window.API_CONFIG.API_URL}/wilayas`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const result = await response.json();
                const wilayas = result.data || result.wilayas || result || [];
                
                // Vider le select et ajouter l'option par défaut
                select.innerHTML = '<option value="">Sélectionner...</option>';
                
                // Ajouter les wilayas
                wilayas.forEach(wilaya => {
                    const option = document.createElement('option');
                    option.value = wilaya.code || wilaya.nom;
                    option.textContent = `${wilaya.code || ''} - ${wilaya.nom || wilaya}`;
                    select.appendChild(option);
                });
                
                console.log(`✅ ${wilayas.length} wilayas chargées dans le select commerçant`);
            }
        } catch (error) {
            console.error('❌ Erreur chargement wilayas:', error);
        }
    },

    // Gestionnaires de soumission de formulaire
    async handleColisSubmit(e, modal) {
        e.preventDefault();
        const form = e.target;
        
        // 🔒 PROTECTION ANTI-DOUBLE-CLIC: Empêcher les soumissions multiples
        if (form.dataset.submitting === 'true') {
            console.warn('⚠️ Soumission déjà en cours, ignorée!');
            return;
        }
        form.dataset.submitting = 'true';
        
        // ✅ DETECTER SI C'EST UNE MODIFICATION OU CREATION
        const isEdit = form.dataset.editId ? true : false;
        const editId = form.dataset.editId;
        
        console.log(isEdit ? `📝 MODE MODIFICATION - ID: ${editId}` : '➕ MODE CRÉATION');
        
        // LECTURE DIRECTE DES VALEURS (sans FormData pour debug)
        const directData = {
            nomExpediteur: document.getElementById('nomExpediteur')?.value || '-',
            telExpediteur: document.getElementById('telExpediteur')?.value || '-',
            bureauSource: document.getElementById('bureauSource')?.value || '-',
            typelivraison: document.getElementById('typelivraison')?.value || '-',
            poidsColis: document.getElementById('poidsColis')?.value || '0',
            prixColis: document.getElementById('prixColis')?.value || '0',
            contenu: document.getElementById('contenu')?.value || '-',
            description: document.getElementById('description')?.value || '-',
            nomClient: document.getElementById('nomClient')?.value || '-',
            telClient: document.getElementById('telClient')?.value || '-',
            telSecondaire: document.getElementById('telSecondaire')?.value || '-',
            wilayaDest: document.getElementById('wilayaDest')?.value || '-',
            bureauDest: document.getElementById('bureauDest')?.value || '-',
            adresseLivraison: document.getElementById('adresseLivraison')?.value || '-'
        };
        
        console.log('🔍 LECTURE DIRECTE DES CHAMPS:', directData);
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        console.log('📦 FormData récupéré:', data);
        
        // Générer une référence au format TRK + 11 chiffres
        const generateTrackingNumber = () => {
            const prefix = 'TRK';
            let randomDigits = '';
            for (let i = 0; i < 11; i++) {
                randomDigits += Math.floor(Math.random() * 10);
            }
            return `${prefix}${randomDigits}`;
        };
        
        // Extraire la wilaya source à partir du bureau source
        const getWilayaFromBureau = (bureauCode) => {
            try {
                const agences = JSON.parse(localStorage.getItem('agences') || '[]');
                const agence = agences.find(a => a.code === bureauCode);
                return agence ? agence.wilaya : null;
            } catch (error) {
                console.error('Erreur extraction wilaya:', error);
                return null;
            }
        };
        
        const wilayaSource = getWilayaFromBureau(directData.bureauSource);
        
        // Déterminer l'adresse selon le type de livraison
        let adresseFinal = '';
        if (directData.typelivraison === 'domicile') {
            adresseFinal = directData.adresseLivraison || '-';
        } else if (directData.typelivraison === 'bureau') {
            adresseFinal = directData.bureauDest || '-';
        } else {
            adresseFinal = directData.bureauDest || directData.adresseLivraison || '-';
        }
        
        // Calculer les frais de livraison (temporaire: 300 DA)
        // TODO: Récupérer les frais réels depuis l'API
        const montantColis = parseFloat(directData.prixColis) || 0;
        const fraisLivraison = 300; // Frais temporaires
        const totalAPayer = montantColis + fraisLivraison;
        
        console.log('💰 Calcul:', { montantColis, fraisLivraison, totalAPayer });
        
        // ✅ SOLUTION SÉCURISÉE: Récupérer l'agence depuis l'API via le token JWT
        let userAgence = null;
        
        try {
            // Récupérer le token agent
            const token = this.getAgentToken();
            if (!token) {
                console.error('❌ Pas de token d\'authentification');
                alert('Erreur: Vous devez être connecté');
                return;
            }

            // Appel API pour récupérer les infos utilisateur
            const response = await fetch(`${window.API_CONFIG.API_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const result = await response.json();
            const userData = result.data;
            
            console.log('✅ Utilisateur récupéré depuis API:', userData);

            // Extraire l'agence
            if (userData.agence) {
                userAgence = typeof userData.agence === 'string' 
                    ? userData.agence 
                    : userData.agence._id || userData.agence.id;
                console.log('✅ Agence récupérée:', userAgence);
            } else {
                console.warn('⚠️ userData.agence non trouvé:', userData);
            }

        } catch (error) {
            console.error('❌ Erreur récupération agence:', error);
            
            // FALLBACK TEMPORAIRE: Essayer localStorage (pour compatibilité)
            console.log('⚠️ Fallback: Tentative lecture localStorage...');
            let userDataStr = localStorage.getItem('user');
            if (!userDataStr) {
                userDataStr = localStorage.getItem('userData');
            }
            
            if (userDataStr) {
                try {
                    const userData = JSON.parse(userDataStr);
                    if (userData.agence) {
                        userAgence = typeof userData.agence === 'string' 
                            ? userData.agence 
                            : userData.agence._id || userData.agence.id;
                        console.log('⚠️ Agence récupérée via fallback localStorage:', userAgence);
                    }
                } catch (e) {
                    console.error('❌ Erreur parsing localStorage:', e);
                }
            }
        }
        
        // Utiliser les valeurs DIRECTES (plus fiable)
        const colisData = {
            reference: generateTrackingNumber(),
            date: new Date().toISOString(),
            statut: 'En cours',
            type: 'Standard',
            
            // ✅ AJOUTER L'AGENCE (critique pour le filtrage backend)
            agence: userAgence,
            
            // Informations expéditeur (format backend)
            nomExpediteur: directData.nomExpediteur,
            commercant: directData.nomExpediteur,
            nomCommercant: directData.nomExpediteur,
            telExpediteur: directData.telExpediteur,
            commercantTel: directData.telExpediteur,
            telCommercant: directData.telExpediteur,
            wilayaSource: wilayaSource,
            wilayaExp: wilayaSource,
            wilayaExpediteur: wilayaSource,
            
            // Informations client (format backend attend clientNom, clientTel)
            clientNom: directData.nomClient,
            client: directData.nomClient,
            clientTel: directData.telClient,
            telephone: directData.telClient,
            telSecondaire: directData.telSecondaire,
            
            // Localisation (backend attend wilaya pour destinataire)
            wilaya: directData.wilayaDest,
            wilayaDest: directData.wilayaDest,
            bureauSource: directData.bureauSource,
            bureauDest: directData.bureauDest,
            adresse: adresseFinal, // Utiliser l'adresse déterminée selon le type
            adresseLivraison: directData.adresseLivraison, // Conserver l'adresse de livraison
            
            // Informations colis
            poids: parseFloat(directData.poidsColis) || 0,        // ✅ Pour MongoDB
            poidsColis: parseFloat(directData.poidsColis) || 0,   // ✅ Pour compatibilité
            montant: montantColis,           // ✅ Montant du colis
            fraisLivraison: fraisLivraison,  // ✅ Frais de livraison
            totalAPayer: totalAPayer,        // ✅ Total à payer
            contenu: directData.contenu,     // ✅ Contenu du colis
            description: directData.description,
            
            // Livraison (MongoDB attend typeLivraison: 'domicile' ou 'stopdesk')
            // Convertir 'bureau' en 'stopdesk'
            typeLivraison: directData.typelivraison === 'bureau' ? 'stopdesk' : directData.typelivraison,
            typelivraison: directData.typelivraison
        };

        console.log('✅ Données du colis FINALES:', colisData);

        // Envoyer à l'API au lieu de stocker dans localStorage
        const token = this.getAgentToken();
        
        if (!token) {
            console.error('❌ Pas de token d\'authentification');
            alert('Erreur: Vous devez être connecté pour créer un colis');
            return;
        }

        // ✅ Utiliser editId déclaré en haut de la fonction
        if (editId) {
            // Mode EDITION - Mise à jour via API
            console.log('📝 Mode édition - Mise à jour du colis:', editId);
            
            fetch(`${window.API_CONFIG.API_URL}/colis/${editId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(colisData)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erreur HTTP: ${response.status}`);
                }
                return response.json();
            })
            .then(result => {
                console.log('✅ Colis mis à jour:', result);
                alert('✅ Colis modifié avec succès !');
                
                form.reset();
                modal.style.display = 'none';
                delete form.dataset.editId;
                
                // 🔓 Débloquer le formulaire après succès
                form.dataset.submitting = 'false';
                
                // Recharger la liste des colis
                document.dispatchEvent(new CustomEvent('colisUpdated'));
            })
            .catch(error => {
                console.error('❌ Erreur lors de la mise à jour:', error);
                alert('❌ Erreur lors de la modification du colis: ' + error.message);
                
                // 🔓 Débloquer le formulaire en cas d'erreur
                form.dataset.submitting = 'false';
            });
            
        } else {
            // Mode CREATION - Ajout via API
            console.log('➕ Mode ajout - Création d\'un nouveau colis via API');
            
            fetch(`${window.API_CONFIG.API_URL}/colis`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(colisData)
            })
            .then(async response => {
                const responseText = await response.text();
                console.log('📥 Réponse brute du serveur:', responseText);
                
                if (!response.ok) {
                    console.error('❌ Erreur HTTP:', response.status, responseText);
                    throw new Error(`Erreur HTTP ${response.status}: ${responseText}`);
                }
                
                try {
                    return JSON.parse(responseText);
                } catch (e) {
                    console.error('❌ Erreur parsing JSON:', e);
                    throw new Error('Réponse invalide du serveur');
                }
            })
            .then(result => {
                console.log('✅ Colis créé via API:', result);
                console.log('✅ Données colis reçues:', result.data);
                console.log('✅ ID du colis créé:', result.data?._id);
                console.log('✅ Tracking du colis créé:', result.data?.tracking);
                
                if (!result.data || !result.data._id) {
                    console.error('⚠️ ATTENTION: Le backend n\'a pas retourné d\'ID pour le colis !');
                    console.error('⚠️ Structure de la réponse:', JSON.stringify(result, null, 2));
                }
                
                alert('✅ Colis créé avec succès !');
                
                form.reset();
                modal.style.display = 'none';
                
                // 🔓 Débloquer le formulaire après succès
                form.dataset.submitting = 'false';
                
                // Attendre 500ms avant de recharger pour laisser MongoDB terminer
                setTimeout(() => {
                    console.log('🔄 Rechargement de la liste des colis...');
                    document.dispatchEvent(new CustomEvent('colisUpdated'));
                    
                    // 💰 Recharger la caisse pour afficher les montants mis à jour
                    console.log('💰 Rechargement de la caisse...');
                    document.dispatchEvent(new CustomEvent('caisseUpdated'));
                }, 500);
            })
            .catch(error => {
                console.error('❌ Erreur lors de la création:', error);
                alert('❌ Erreur lors de la création du colis: ' + error.message);
                
                // 🔓 Débloquer le formulaire en cas d'erreur
                form.dataset.submitting = 'false';
            });
        }
    },

    async handleCommercantSubmit(e, modal) {
        e.preventDefault();
        const form = e.target;
        
        // Récupérer les valeurs directement par ID
        const commercantData = {
            nom: document.getElementById('commercantNom').value.trim(),
            prenom: document.getElementById('commercantPrenom').value.trim(),
            email: document.getElementById('commercantEmail').value.trim(),
            telephone: document.getElementById('commercantTelephone').value.trim(),
            password: document.getElementById('commercantPassword').value,
            wilaya: document.getElementById('commercantWilaya').value,
            adresse: document.getElementById('commercantAdresse').value.trim(),
            role: 'commercant'
        };
        
        console.log('📋 Données commerçant collectées:', commercantData);
        
        // Appeler la fonction addCommercant (qui utilisera l'API)
        const success = await DataStore.addCommercant(commercantData);
        
        if (success) {
            form.reset();
            modal.style.display = 'none';
            document.dispatchEvent(new CustomEvent('commercantUpdated'));
        }
    },

    handleRetourSubmit(e, modal) {
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        DataStore.addRetour({
            ...data,
            dateRetour: new Date().toISOString()
        });

        form.reset();
        modal.style.display = 'none';
        document.dispatchEvent(new CustomEvent('retourUpdated'));
    },

    handleReclamationSubmit(e, modal) {
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        DataStore.addReclamation({
            ...data,
            dateCreation: new Date().toISOString(),
            statut: 'Nouvelle'
        });

        form.reset();
        modal.style.display = 'none';
        document.dispatchEvent(new CustomEvent('reclamationUpdated'));
    }
};