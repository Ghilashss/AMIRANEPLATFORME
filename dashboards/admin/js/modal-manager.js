// Gestion des modales
import { DataStore } from './data-store.js';

export const ModalManager = {
    config: [
        { id: 'userModal', openBtn: 'addUserBtn', form: 'userForm' },
        { id: 'agenceModal', openBtn: 'addAgenceBtn', form: 'agenceForm' },
        { id: 'settingsModal', openBtn: 'editSettingsBtn', form: 'settingsForm' },
        { id: 'wilayaModal', openBtn: 'addWilayaBtn', form: 'wilayaForm' },
        { id: 'colisModal', openBtn: 'addColisBtn', form: 'colisForm' }
    ],

    // État pour suivre l'élément en cours d'édition
    currentEditId: null,

    setupModal(modalId, openBtnId, formId) {
        const modal = document.getElementById(modalId);
        const openBtn = document.getElementById(openBtnId);
        const closeBtn = modal?.querySelector('.close-button');
        const form = document.getElementById(formId);

        if (openBtn && modal) {
            openBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`Opening modal: ${modalId}`);
                this.currentEditId = null;
                if (form) {
                    form.reset();
                    // Initialisation des calculs pour le modal colis
                    if (modalId === 'colisModal') {
                        this.initializeColisCalculations(form);
                        this.populateWilayasAndBureaux(form);
                    }
                }
                modal.style.display = 'flex';
                modal.classList.add('show');
                document.body.style.overflow = 'hidden';
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`Closing modal: ${modalId}`);
                this.currentEditId = null;
                if (form) form.reset();
                modal.style.display = 'none';
                modal.classList.remove('show');
                document.body.style.overflow = 'auto';
            });
        }

        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.currentEditId = null;
                    if (form) form.reset();
                    modal.style.display = 'none';
                    modal.classList.remove('active');
                    document.body.style.overflow = 'auto';
                }
            });
        }
        // La gestion des formulaires est maintenant déléguée aux gestionnaires spécifiques
        // Exclusion: agenceForm (géré par agence-form.js) et colisForm (géré par colis-form.js)
        if (form && formId !== 'agenceForm' && formId !== 'colisForm') {
            form.onsubmit = (e) => {
                e.preventDefault();
                // Traitement du formulaire selon le type
                switch(formId) {
                    case 'userForm':
                        this.handleUserForm(form);
                        break;
                    case 'settingsForm':
                        this.handleSettingsForm(form);
                        break;
                    case 'wilayaForm':
                        this.handleWilayaForm(form);
                        break;
                    // case 'colisForm': DÉSACTIVÉ - géré par colis-form.js
                    //     this.handleColisForm(form);
                    //     break;
                }
                modal.style.display = 'none';
                form.reset();
            };
        }
    },

    handleUserForm(form) {
        const formData = new FormData(form);
        
        // Récupérer les valeurs des champs par leurs IDs
        const userData = {
            nom: document.getElementById('userName').value.trim(),
            prenom: document.getElementById('userPrenom').value.trim(),
            email: document.getElementById('userEmail').value.trim(),
            telephone: document.getElementById('userTelephone').value.trim(),
            password: document.getElementById('userPassword').value,
            role: document.getElementById('userRole').value,
            wilaya: document.getElementById('userWilaya').value,
            adresse: document.getElementById('userAdresse').value.trim()
        };
        
        console.log('📋 Données utilisateur collectées:', userData);
        
        if (this.currentEditId) {
            DataStore.updateUser(this.currentEditId, userData);
            this.currentEditId = null;
        } else {
            DataStore.addUser(userData);
        }
    },

    handleAgenceForm(form) {
        const formData = new FormData(form);
        const agenceData = {
            nom: formData.get('nom'),
            wilaya: formData.get('wilaya'),
            adresse: formData.get('adresse'),
            telephone: formData.get('telephone')
        };

        if (this.currentEditId) {
            DataStore.updateAgence(this.currentEditId, agenceData);
            this.currentEditId = null;
        } else {
            DataStore.addAgence(agenceData);
        }
    },

    handleSettingsForm(form) {
        const formData = new FormData(form);
        const settingsData = {
            tarifLivraison: formData.get('tarifLivraison'),
            tarifRetour: formData.get('tarifRetour'),
            commission: formData.get('commission')
        };
        DataStore.updateSettings(settingsData);
    },

    handleWilayaForm(form) {
        const formData = new FormData(form);
        const wilayaData = {
            code: formData.get('wilayaCode'),
            nom: formData.get('wilayaSelect'),
            latitude: formData.get('wilayaLat'),
            longitude: formData.get('wilayaLon')
        };

        if (this.currentEditId) {
            DataStore.updateWilaya(this.currentEditId, wilayaData);
            this.currentEditId = null;
        } else {
            DataStore.addWilaya(wilayaData);
        }
    },

    handleColisForm(form) {
        const formData = new FormData(form);
        
        const typelivraison = formData.get('typelivraison');
        const montantColis = parseFloat(formData.get('prixColis')) || 0;
        const fraisLivraison = parseFloat(document.getElementById('fraisLivraison')?.textContent) || 300;
        
        const colisData = {
            reference: this.generateTrackingNumber(),
            date: new Date().toISOString(),
            statut: 'En cours',
            type: 'Standard',
            
            // Informations expéditeur (format backend)
            nomExpediteur: formData.get('nomExpediteur'),
            commercant: formData.get('nomExpediteur'),
            nomCommercant: formData.get('nomExpediteur'),
            telExpediteur: formData.get('telExpediteur'),
            commercantTel: formData.get('telExpediteur'),
            telCommercant: formData.get('telExpediteur'),
            bureauSource: formData.get('bureauSource'),
            
            // Informations client (format backend attend clientNom, clientTel)
            clientNom: formData.get('nomClient'),
            client: formData.get('nomClient'),
            clientTel: formData.get('telClient'),
            telephone: formData.get('telClient'),
            telSecondaire: formData.get('telSecondaire'),
            
            // Localisation (backend attend wilaya pour destinataire)
            wilaya: formData.get('wilayaDest'),
            wilayaDest: formData.get('wilayaDest'),
            bureauDest: formData.get('bureauDest'),
            adresse: formData.get('adresseLivraison') || formData.get('bureauDest'),
            adresseLivraison: formData.get('adresseLivraison'),
            
            // Informations colis
            poids: parseFloat(formData.get('poidsColis')) || 0,
            poidsColis: parseFloat(formData.get('poidsColis')) || 0,
            montant: montantColis,
            fraisLivraison: fraisLivraison,
            totalAPayer: montantColis + fraisLivraison,
            contenu: formData.get('contenu'),
            description: formData.get('description'),
            
            // Livraison (MongoDB attend typeLivraison: 'domicile' ou 'stopdesk')
            // Convertir 'bureau' en 'stopdesk'
            typeLivraison: typelivraison === 'bureau' ? 'stopdesk' : typelivraison,
            typelivraison: typelivraison
        };

        // Envoyer à l'API au lieu de stocker dans localStorage
        const token = sessionStorage.getItem('auth_token') || localStorage.getItem('admin_token');
        
        if (!token) {
            console.error('❌ Pas de token d\'authentification');
            alert('Erreur: Vous devez être connecté pour créer un colis');
            return;
        }

        if (this.currentEditId) {
            // Mode EDITION
            fetch(`${window.API_CONFIG.API_URL}/colis/${this.currentEditId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(colisData)
            })
            .then(response => response.json())
            .then(result => {
                console.log('✅ Colis mis à jour:', result);
                alert('✅ Colis modifié avec succès !');
                this.currentEditId = null;
                document.dispatchEvent(new CustomEvent('colisUpdated'));
            })
            .catch(error => {
                console.error('❌ Erreur:', error);
                alert('❌ Erreur lors de la modification: ' + error.message);
            });
        } else {
            // Mode CREATION
            fetch(`${window.API_CONFIG.API_URL}/colis`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(colisData)
            })
            .then(response => response.json())
            .then(result => {
                console.log('✅ Colis créé:', result);
                alert('✅ Colis créé avec succès !');
                document.dispatchEvent(new CustomEvent('colisUpdated'));
            })
            .catch(error => {
                console.error('❌ Erreur:', error);
                alert('❌ Erreur lors de la création: ' + error.message);
            });
        }
    },

    initializeColisCalculations(form) {
        // Écouter les changements de poids et prix
        const poidsInput = form.querySelector('#poidsColis');
        const prixInput = form.querySelector('#prixColis');
        const wilayaSelect = form.querySelector('#wilayaDest');
        const typeLivraisonSelect = form.querySelector('#typelivraison');

        // ⚠️ DÉSACTIVÉ - Le calcul des frais est maintenant géré par colis-form.js avec l'API
        // Cette fonction utilisait un calcul hardcodé qui n'était pas synchronisé avec la base de données
        /*
        const calculateTotal = () => {
            const poids = parseFloat(poidsInput.value) || 0;
            const prix = parseFloat(prixInput.value) || 0;
            const wilaya = wilayaSelect.value;
            const typeLivraison = typeLivraisonSelect.value;

            // Calcul des frais de livraison selon les règles
            let fraisLivraison = Math.min(Math.max(400 + (poids * 50), 400), 900); // Entre 400 et 900 DA
            
            if (typeLivraison === 'domicile') {
                fraisLivraison += 100; // Supplément pour livraison à domicile
            }

            // Mise à jour des affichages
            // Mise à jour de l'affichage avec formatage des nombres
            document.getElementById('resumePrixColis').textContent = prix.toLocaleString('fr-DZ', { style: 'currency', currency: 'DZD' });
            document.getElementById('fraisLivraison').textContent = fraisLivraison.toLocaleString('fr-DZ', { style: 'currency', currency: 'DZD' });
            document.getElementById('totalAPayer').textContent = (prix + fraisLivraison).toLocaleString('fr-DZ', { style: 'currency', currency: 'DZD' });
        };

        // Écouter les changements
        poidsInput.addEventListener('input', calculateTotal);
        prixInput.addEventListener('input', calculateTotal);
        wilayaSelect.addEventListener('change', calculateTotal);
        typeLivraisonSelect.addEventListener('change', calculateTotal);

        // Calcul initial
        calculateTotal();
        */
        
        // NOTE: Le calcul des frais de livraison est maintenant géré par:
        // - dashboards/admin/js/colis-form.js
        // - Fonction: verifyAndDisplayTarifs()
        // - Source: API /api/frais-livraison (MongoDB)
        console.log('✅ Calcul des frais délégué à colis-form.js (API)');
    },

    generateTrackingNumber() {
        const prefix = 'COL';
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${prefix}${timestamp}${random}`;
    },

    populateWilayasAndBureaux(form) {
        // ❌ FONCTION DÉSACTIVÉE - Tout est géré par colis-form-handler.js maintenant
        // Cette fonction chargeait TOUTES les wilayas d'Algérie avec les NOMS comme value
        // Problème: colis-form-handler.js remplit wilayaDest avec seulement les wilayas qui ont des frais configurés
        // et utilise les CODES comme value pour la compatibilité MongoDB
        // 
        // Si on laisse cette fonction active, elle ÉCRASE le contenu de wilayaDest et met les 48 wilayas
        // avec les noms au lieu des codes, ce qui casse populateBureauxDestinataire()
        //
        // Solution: Ne rien faire ici, laisser colis-form-handler.js gérer les selects
        console.log('⚠️ populateWilayasAndBureaux() désactivée - colis-form-handler.js gère les wilayas/bureaux');
        return;
        
        /* ANCIEN CODE DÉSACTIVÉ
        // Populate wilayas
        const wilayaSelect = form.querySelector('#wilayaDest');
        if (wilayaSelect) {
            wilayaSelect.innerHTML = '<option value="">Sélectionner une wilaya</option>';
            const wilayas = [
                "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra",
                "Béchar", "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret",
                "Tizi Ouzou", "Alger", "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda", "Sidi Bel Abbès",
                "Annaba", "Guelma", "Constantine", "Médéa", "Mostaganem", "M'Sila", "Mascara",
                "Ouargla", "Oran", "El Bayadh", "Illizi", "Bordj Bou Arreridj", "Boumerdès",
                "El Tarf", "Tindouf", "Tissemsilt", "El Oued", "Khenchela", "Souk Ahras",
                "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent", "Ghardaïa", "Relizane"
            ];
            wilayas.forEach((wilaya, index) => {
                const option = document.createElement('option');
                option.value = wilaya;
                option.textContent = `${(index + 1).toString().padStart(2, '0')} - ${wilaya}`;
                wilayaSelect.appendChild(option);
            });
        }
        */

        // ❌ ANCIEN CODE DÉSACTIVÉ - Remplacé par colis-form-handler.js
        // Cet ancien code générait des bureaux fictifs au lieu d'utiliser les vraies agences MongoDB
        // Handle wilaya selection to update bureaux
        /* DÉSACTIVÉ - colis-form-handler.js gère maintenant les bureaux depuis MongoDB
        wilayaSelect.addEventListener('change', () => {
            const bureauDest = form.querySelector('#bureauDest');
            const selectedWilaya = wilayaSelect.value;
            if (bureauDest && selectedWilaya) {
                bureauDest.innerHTML = '<option value="">Sélectionner un bureau</option>';
                // Simuler des bureaux pour la wilaya sélectionnée
                const bureaux = [
                    `Bureau principal ${selectedWilaya}`,
                    `${selectedWilaya} Centre`,
                    `${selectedWilaya} Est`,
                    `${selectedWilaya} Ouest`
                ];
                bureaux.forEach(bureau => {
                    const option = document.createElement('option');
                    option.value = bureau;
                    option.textContent = bureau;
                    bureauDest.appendChild(option);
                });
            }
        });
        */

        // Populate source bureaux
        const bureauSource = form.querySelector('#bureauSource');
        if (bureauSource) {
            bureauSource.innerHTML = '<option value="">Sélectionner le bureau source</option>';
            const currentBureau = 'Bureau Principal'; // This should come from user session
            const option = document.createElement('option');
            option.value = currentBureau;
            option.textContent = currentBureau;
            option.selected = true;
            bureauSource.appendChild(option);
        }
    },

    init() {
        this.config.forEach(modal => {
            this.setupModal(modal.id, modal.openBtn, modal.form);
        });

        // Écouter les événements d'édition
        document.addEventListener('openEditUserModal', (e) => {
            const user = e.detail;
            this.currentEditId = user.id;
            const modal = document.getElementById('userModal');
            const form = document.getElementById('userForm');
            
            if (modal && form) {
                // Pré-remplir le formulaire
                form.elements.nom.value = user.nom;
                form.elements.prenom.value = user.prenom;
                form.elements.email.value = user.email;
                form.elements.role.value = user.role;
                form.elements.agence.value = user.agence || '';
                
                modal.style.display = 'flex';
            }
        });

        document.addEventListener('openEditAgenceModal', (e) => {
            const agence = e.detail;
            this.currentEditId = agence.id;
            const modal = document.getElementById('agenceModal');
            const form = document.getElementById('agenceForm');
            
            if (modal && form) {
                // Pré-remplir le formulaire
                form.elements.nom.value = agence.nom;
                form.elements.wilaya.value = agence.wilaya;
                form.elements.adresse.value = agence.adresse;
                form.elements.telephone.value = agence.telephone;
                
                modal.style.display = 'flex';
            }
        });
    }
};