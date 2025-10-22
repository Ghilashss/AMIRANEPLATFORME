/**
 * 🎯 Gestionnaire de Formulaire Colis Complet
 * Gère tous les aspects du formulaire : chargement des données, calcul des frais, affichage conditionnel
 */

class ColisFormHandler {
    constructor(userRole) {
        this.userRole = userRole; // 'admin', 'agent', 'commercant'
        this.wilayas = [];
        this.agences = [];
        this.fraisLivraison = [];
        this.currentUser = null;
        
        this.init();
    }

    /**
     * 🔑 Récupère le token selon le rôle
     * Cherche dans sessionStorage puis localStorage avec les bonnes clés
     */
    getToken() {
        console.log('🔍 Recherche token pour role:', this.userRole);
        
        // 1. Essayer sessionStorage (pour tous)
        let token = sessionStorage.getItem('auth_token');
        console.log('   → sessionStorage.auth_token:', token ? '✅ Existe' : '❌ Vide');
        if (token) {
            console.log('🔑 Token trouvé dans sessionStorage');
            return token;
        }

        // 2. Essayer localStorage selon le rôle
        if (this.userRole === 'commercant') {
            token = localStorage.getItem('commercant_token');
            console.log('   → localStorage.commercant_token:', token ? '✅ Existe' : '❌ Vide');
            if (token) {
                console.log('🔑 Token commercant trouvé dans localStorage');
                return token;
            }
        } else if (this.userRole === 'agent') {
            token = localStorage.getItem('agent_token');
            console.log('   → localStorage.agent_token:', token ? '✅ Existe' : '❌ Vide');
            if (token) {
                console.log('🔑 Token agent trouvé dans localStorage');
                return token;
            }
        }

        // 3. Fallback : token générique
        token = localStorage.getItem('token');
        console.log('   → localStorage.token:', token ? '✅ Existe' : '❌ Vide');
        if (token) {
            console.log('🔑 Token générique trouvé dans localStorage');
            return token;
        }

        console.error('❌ Aucun token trouvé !');
        console.error('🔍 Debug storage:');
        console.error('   sessionStorage keys:', Object.keys(sessionStorage));
        console.error('   localStorage keys:', Object.keys(localStorage));
        throw new Error('Session expirée. Veuillez vous reconnecter.');
    }

    async init() {
        try {
            // Récupérer l'utilisateur connecté
            await this.loadCurrentUser();
            
            // Charger les données de base
            await Promise.all([
                this.loadWilayas(),
                this.loadAgences(),
                this.loadFraisLivraison()
            ]);
            
            // Initialiser les sélecteurs
            this.initializeSelectors();
            
            // Configurer les event listeners
            this.setupEventListeners();
            
            // Pré-remplir selon le rôle
            this.prefillFormBasedOnRole();
            
            console.log('✅ ColisFormHandler initialisé avec succès');
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation:', error);
            this.showError('Erreur lors du chargement des données');
        }
    }

    async loadCurrentUser() {
        const token = this.getToken();

        const response = await fetch(`${window.API_CONFIG.API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Impossible de récupérer les informations utilisateur');
        
        const userData = await response.json();
        
        // L'API peut retourner {success: true, data: {...}} ou directement {...}
        this.currentUser = userData.data || userData;
        
        console.log('👤 Utilisateur connecté:', {
            role: this.currentUser.role,
            wilaya: this.currentUser.wilaya,
            agence: this.currentUser.agence,
            nom: this.currentUser.nom
        });
    }

    async loadWilayas() {
        const token = this.getToken();
        const response = await fetch(`${window.API_CONFIG.API_URL}/wilayas`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Impossible de charger les wilayas');
        
        const data = await response.json();
        
        // Vérifier si la réponse est un objet avec une propriété wilayas ou data
        if (Array.isArray(data)) {
            this.wilayas = data;
        } else if (data.wilayas && Array.isArray(data.wilayas)) {
            this.wilayas = data.wilayas;
        } else if (data.data && Array.isArray(data.data)) {
            this.wilayas = data.data;
        } else {
            console.warn('⚠️ Format de réponse wilayas inattendu:', data);
            this.wilayas = [];
        }
        
        console.log(`📍 ${this.wilayas.length} wilayas chargées`);
    }

    async loadAgences() {
        const token = this.getToken();
        const response = await fetch(`${window.API_CONFIG.API_URL}/agences`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Impossible de charger les agences');
        
        const data = await response.json();
        
        // Vérifier si la réponse est un objet avec une propriété agences ou data
        if (Array.isArray(data)) {
            this.agences = data;
        } else if (data.agences && Array.isArray(data.agences)) {
            this.agences = data.agences;
        } else if (data.data && Array.isArray(data.data)) {
            this.agences = data.data;
        } else {
            console.warn('⚠️ Format de réponse agences inattendu:', data);
            this.agences = [];
        }
        
        console.log(`🏢 ${this.agences.length} agences chargées`);
    }

    async loadFraisLivraison() {
        const token = this.getToken();
        const response = await fetch(`${window.API_CONFIG.API_URL}/frais-livraison`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Impossible de charger les frais de livraison');
        
        const data = await response.json();
        
        // Vérifier si la réponse est un objet avec une propriété data ou fraisLivraison
        if (Array.isArray(data)) {
            this.fraisLivraison = data;
        } else if (data.fraisLivraison && Array.isArray(data.fraisLivraison)) {
            this.fraisLivraison = data.fraisLivraison;
        } else if (data.data && Array.isArray(data.data)) {
            this.fraisLivraison = data.data;
        } else {
            console.warn('⚠️ Format de réponse inattendu:', data);
            this.fraisLivraison = [];
        }
        
        console.log(`💰 ${this.fraisLivraison.length} configurations de frais chargées`);
    }

    initializeSelectors() {
        // Remplir Wilaya Expéditeur (seulement pour admin)
        if (this.userRole === 'admin') {
            this.populateWilayaExpediteur();
        }
        
        // Remplir Wilaya Destinataire (pour tous)
        this.populateWilayaDestinataire();
    }

    populateWilayaExpediteur() {
        const select = document.getElementById('wilayaExpediteur');
        if (!select) return;
        
        select.innerHTML = '<option value="">Sélectionner une wilaya</option>';
        
        // 🎯 Utiliser UNIQUEMENT les wilayas disponibles dans les frais de livraison
        const wilayasMap = new Map();
        
        this.fraisLivraison.forEach(frais => {
            if (frais.wilayaSource && frais.nomWilayaSource) {
                const key = frais.wilayaSource;
                if (!wilayasMap.has(key)) {
                    wilayasMap.set(key, {
                        code: frais.wilayaSource,
                        nom: frais.nomWilayaSource,
                        _id: frais.wilayaSourceId || key
                    });
                }
            }
        });
        
        // Trier par code de wilaya
        const wilayasList = Array.from(wilayasMap.values()).sort((a, b) => {
            return parseInt(a.code) - parseInt(b.code);
        });
        
        // Remplir le select
        wilayasList.forEach(wilaya => {
            const option = document.createElement('option');
            option.value = wilaya._id;
            option.textContent = `${wilaya.code} - ${wilaya.nom}`;
            option.dataset.code = wilaya.code;
            select.appendChild(option);
        });
        
        console.log(`📍 ${wilayasList.length} wilayas expéditrices chargées depuis frais de livraison`);
    }

    populateWilayaDestinataire() {
        const select = document.getElementById('wilayaDest');
        if (!select) {
            console.error('❌ Select wilayaDest introuvable dans le DOM');
            return;
        }
        
        console.log(`🔍 populateWilayaDestinataire() - Wilayas disponibles: ${this.wilayas.length}`);
        
        select.innerHTML = '<option value="">Sélectionner une wilaya</option>';
        
        // Récupérer la wilaya source selon le rôle
        let wilayaSourceCode = null;
        
        if (this.userRole === 'admin') {
            // Pour ADMIN : récupérer depuis le bureau source sélectionné
            const bureauSourceSelect = document.getElementById('bureauSource');
            if (bureauSourceSelect && bureauSourceSelect.value) {
                const selectedOption = bureauSourceSelect.options[bureauSourceSelect.selectedIndex];
                wilayaSourceCode = selectedOption.dataset.wilaya;
            }
        } else {
            // Pour AGENT/COMMERCANT : utiliser la wilaya de l'utilisateur connecté
            wilayaSourceCode = this.currentUser?.wilaya;
            console.log(`🔍 Wilaya source (${this.userRole}): ${wilayaSourceCode}`);
            console.log(`🔍 Current user:`, this.currentUser);
        }
        
        console.log(`📋 Chargement de ${this.wilayas.length} wilayas pour la destination (role: ${this.userRole}, source: ${wilayaSourceCode || 'non selectionnee'})`);
        
        // Si aucune wilaya chargée, afficher un message d'erreur
        if (this.wilayas.length === 0) {
            console.error('❌ AUCUNE WILAYA DISPONIBLE!');
            const option = document.createElement('option');
            option.value = '';
            option.textContent = '⚠️ Erreur: Aucune wilaya disponible';
            option.style.color = 'red';
            select.appendChild(option);
            return;
        }
        
        // Créer un Set des wilayas qui ont des frais configurés depuis la source
        const wilayasAvecFrais = new Set();
        if (wilayaSourceCode) {
            this.fraisLivraison.forEach(frais => {
                if (frais.wilayaSource === wilayaSourceCode) {
                    wilayasAvecFrais.add(frais.wilayaDest);
                }
            });
            console.log(`💰 ${wilayasAvecFrais.size} wilayas ont des frais configures depuis ${wilayaSourceCode}`);
        }
        
        // Trier par code de wilaya
        const wilayasList = [...this.wilayas].sort((a, b) => {
            return parseInt(a.code) - parseInt(b.code);
        });
        
        console.log(`📦 ${wilayasList.length} wilayas a afficher`);
        
        // Remplir le select
        wilayasList.forEach(wilaya => {
            const option = document.createElement('option');
            option.value = wilaya.code;
            option.dataset.code = wilaya.code;
            option.dataset.id = wilaya._id;
            
            // Vérifier si cette wilaya a des frais configurés
            const hasFrais = wilayaSourceCode ? wilayasAvecFrais.has(wilaya.code) : true;
            
            if (hasFrais) {
                // Wilaya avec frais configurés - affichage normal
                option.textContent = `${wilaya.code} - ${wilaya.nom}`;
            } else {
                // Wilaya SANS frais configurés - ajouter un avertissement
                option.textContent = `${wilaya.code} - ${wilaya.nom} (Frais non configures)`;
                option.style.color = '#e67e22'; // Orange
                option.style.fontStyle = 'italic';
                option.dataset.noFrais = 'true';
            }
            
            select.appendChild(option);
        });
        
        console.log(`✅ ${wilayasList.length} wilayas destinataires chargees dans le select`);
    }

    populateBureauxExpediteur(wilayaId) {
        const select = document.getElementById('bureauSource');
        if (!select) return;
        
        select.innerHTML = '<option value="">Sélectionner un bureau</option>';
        
        const wilaya = this.wilayas.find(w => w._id === wilayaId);
        if (!wilaya) return;
        
        const bureaux = this.agences.filter(a => a.wilaya === wilaya.code);
        
        bureaux.forEach(bureau => {
            const option = document.createElement('option');
            option.value = bureau._id;
            option.textContent = bureau.nom;
            option.dataset.wilaya = wilaya.code; // ✅ Ajouter le code de wilaya
            console.log(`   📍 Bureau "${bureau.nom}" → wilaya="${wilaya.code}"`);
            select.appendChild(option);
        });
        
        console.log(`📦 ${bureaux.length} bureaux chargés pour ${wilaya.nom} (code: ${wilaya.code})`);
    }

    populateBureauxDestinataire(wilayaCodeOrId) {
        console.log(`🔍 populateBureauxDestinataire() appelé avec: "${wilayaCodeOrId}"`);
        
        const select = document.getElementById('bureauDest');
        if (!select) {
            console.error('❌ Select bureauDest introuvable');
            return;
        }
        
        select.innerHTML = '<option value="">Sélectionner un bureau</option>';
        
        // Chercher la wilaya par CODE (ex: "01", "15") ou par _id MongoDB
        console.log(`🔍 Recherche de wilaya avec code ou _id="${wilayaCodeOrId}"`);
        let wilaya = this.wilayas.find(w => w.code === wilayaCodeOrId);
        
        // Fallback: si pas trouvé par code, chercher par _id
        if (!wilaya) {
            wilaya = this.wilayas.find(w => w._id === wilayaCodeOrId);
            console.log(`🔍 Recherche par _id: ${wilaya ? 'trouvée' : 'non trouvée'}`);
        }
        
        if (!wilaya) {
            console.error(`❌ Aucune wilaya trouvée avec code ou _id="${wilayaCodeOrId}"`);
            console.log('📋 Wilayas disponibles:', this.wilayas.map(w => ({code: w.code, nom: w.nom, _id: w._id})));
            return;
        }
        
        console.log(`✅ Wilaya trouvée:`, wilaya);
        
        const bureaux = this.agences.filter(a => a.wilaya === wilaya.code);
        
        if (bureaux.length === 0) {
            // Aucune agence dans cette wilaya
            const option = document.createElement('option');
            option.value = "";
            option.textContent = `⚠️ Aucune agence dans ${wilaya.nom}`;
            option.disabled = true;
            option.style.color = '#e74c3c';
            option.style.fontStyle = 'italic';
            select.appendChild(option);
            console.log(`⚠️ Aucune agence disponible pour ${wilaya.nom} (code: ${wilaya.code})`);
        } else {
            // Ajouter les bureaux disponibles
            bureaux.forEach(bureau => {
                const option = document.createElement('option');
                option.value = bureau._id;
                option.textContent = bureau.nom;
                select.appendChild(option);
            });
            console.log(`🏢 ${bureaux.length} bureau(x) chargé(s) pour ${wilaya.nom}`);
        }
    }

    setupEventListeners() {
        // Wilaya expéditeur change (Admin uniquement)
        const wilayaExp = document.getElementById('wilayaExpediteur');
        if (wilayaExp) {
            wilayaExp.addEventListener('change', (e) => {
                this.populateBureauxExpediteur(e.target.value);
                this.calculateFrais(); // ✅ Recalculer les frais quand wilaya source change
            });
        }
        
        // Bureau source change (IMPORTANT pour le calcul !)
        const bureauSource = document.getElementById('bureauSource');
        if (bureauSource) {
            bureauSource.addEventListener('change', () => {
                console.log('📍 Bureau source changé, mise à jour des wilayas destination...');
                // Mettre à jour les wilayas de destination avec les indicateurs de frais
                this.populateWilayaDestinataire();
                this.calculateFrais();
            });
        }
        
        // Wilaya destinataire change
        const wilayaDest = document.getElementById('wilayaDest');
        if (wilayaDest) {
            wilayaDest.addEventListener('change', (e) => {
                this.populateBureauxDestinataire(e.target.value);
                this.calculateFrais();
            });
        }
        
        // Type de livraison change
        const typeLivraison = document.getElementById('typelivraison');
        if (typeLivraison) {
            typeLivraison.addEventListener('change', (e) => {
                this.toggleDeliveryFields(e.target.value);
                this.calculateFrais();
            });
        }
        
        // Type de colis change
        const typeColis = document.getElementById('typeColis');
        if (typeColis) {
            typeColis.addEventListener('change', () => {
                this.calculateFrais();
            });
        }
        
        // Poids change
        const poids = document.getElementById('poidsColis');
        if (poids) {
            poids.addEventListener('input', () => {
                this.calculateFrais();
            });
        }
        
        // Prix change
        const prix = document.getElementById('prixColis');
        if (prix) {
            prix.addEventListener('input', () => {
                this.updateResumePrix();
            });
        }
    }

    toggleDeliveryFields(typeLivraison) {
        const bureauDestGroup = document.getElementById('bureauDestGroup');
        const adresseGroup = document.getElementById('adresseGroup');
        const bureauDest = document.getElementById('bureauDest');
        const adresseLivraison = document.getElementById('adresseLivraison');
        
        if (typeLivraison === 'bureau') {
            // Afficher bureau, masquer adresse
            if (bureauDestGroup) bureauDestGroup.style.display = 'block';
            if (adresseGroup) adresseGroup.style.display = 'none';
            if (bureauDest) bureauDest.required = true;
            if (adresseLivraison) adresseLivraison.required = false;
        } else if (typeLivraison === 'domicile') {
            // Afficher adresse, masquer bureau
            if (bureauDestGroup) bureauDestGroup.style.display = 'none';
            if (adresseGroup) adresseGroup.style.display = 'block';
            if (bureauDest) bureauDest.required = false;
            if (adresseLivraison) adresseLivraison.required = true;
        }
    }

    calculateFrais() {
        const wilayaDestSelect = document.getElementById('wilayaDest');
        const typeLivraison = document.getElementById('typelivraison')?.value;
        const typeColis = document.getElementById('typeColis')?.value;
        const poids = parseFloat(document.getElementById('poidsColis')?.value) || 0;
        
        console.log('🔍 DÉBUT CALCUL FRAIS:', {
            wilayaDestSelect: !!wilayaDestSelect,
            wilayaDestValue: wilayaDestSelect?.value,
            typeLivraison,
            poids,
            poidsValide: poids > 0
        });
        
        if (!wilayaDestSelect || !typeLivraison || poids <= 0) {
            console.log('❌ CALCUL ARRÊTÉ - Validation échouée:', {
                pasDeWilayaDest: !wilayaDestSelect,
                pasDeTypeLivraison: !typeLivraison,
                poidsInvalide: poids <= 0
            });
            this.updateFraisDisplay(0);
            return;
        }
        
        const wilayaDestCode = wilayaDestSelect.options[wilayaDestSelect.selectedIndex]?.dataset?.code;
        if (!wilayaDestCode) {
            this.updateFraisDisplay(0);
            return;
        }
        
        // 🔍 Pour Admin : extraire wilaya depuis bureauSource
        let wilayaSourceCode = null;
        if (this.userRole === 'admin') {
            const bureauSourceSelect = document.getElementById('bureauSource');
            if (bureauSourceSelect && bureauSourceSelect.selectedIndex > 0) {
                const selectedOption = bureauSourceSelect.options[bureauSourceSelect.selectedIndex];
                // Extraire le code de wilaya depuis data-wilaya de l'option
                wilayaSourceCode = selectedOption.dataset?.wilaya;
                console.log('🔍 DIAGNOSTIC CALCUL Admin:', {
                    bureauSelectExiste: !!bureauSourceSelect,
                    selectedIndex: bureauSourceSelect.selectedIndex,
                    optionText: selectedOption.textContent,
                    datasetWilaya: selectedOption.dataset?.wilaya,
                    wilayaExtraite: wilayaSourceCode
                });
            } else {
                console.warn('⚠️ Aucun bureau source sélectionné');
            }
        } else {
            // Pour agent/commercant, utiliser leur wilaya
            wilayaSourceCode = this.currentUser?.wilaya;
        }
        
        console.log('🔍 RECHERCHE FRAIS:', {
            wilayaSourceCode,
            wilayaDestCode,
            fraisDisponibles: this.fraisLivraison.length,
            fraisPourSource: this.fraisLivraison.filter(f => f.wilayaSource === wilayaSourceCode).length
        });
        
        if (!wilayaSourceCode) {
            console.warn('⚠️ Wilaya source non définie');
            this.updateFraisDisplay(0);
            return;
        }
        
        // Trouver la configuration de frais
        let fraisConfig = this.fraisLivraison.find(f => 
            f.wilayaSource === wilayaSourceCode && 
            f.wilayaDest === wilayaDestCode
        );
        
        if (!fraisConfig) {
            console.warn(`⚠️ Pas de frais configurés pour ${wilayaSourceCode} → ${wilayaDestCode}`);
            this.updateFraisDisplay(0, true, wilayaSourceCode, wilayaDestCode); // Indiquer frais non configurés
            return;
        }
        
        console.log('✅ Frais trouvés:', fraisConfig);
        
        // � FACTURATION DIFFÉRENCIÉE - Prix différent selon domicile/bureau
        let frais = 0;
        let prixBase = 0;
        let prixParKg = 0;
        
        if (typeLivraison === 'bureau') {
            // Livraison au bureau (Stop Desk)
            prixBase = fraisConfig.baseBureau || fraisConfig.fraisStopDesk || 0;
            prixParKg = fraisConfig.parKgBureau || 0;
            console.log(`🏢 Prix BUREAU: Base=${prixBase} DA, ParKg=${prixParKg} DA/kg`);
        } else if (typeLivraison === 'domicile') {
            // Livraison à domicile
            prixBase = fraisConfig.baseDomicile || fraisConfig.fraisDomicile || 0;
            prixParKg = fraisConfig.parKgDomicile || 0;
            console.log(`🏠 Prix DOMICILE: Base=${prixBase} DA, ParKg=${prixParKg} DA/kg`);
        }
        
        // 🎯 CALCUL : Prix de base inclut jusqu'à 5 kg
        // Au-delà de 5 kg, on facture le surplus au tarif prixParKg
        frais = prixBase;
        
        if (poids > 5 && prixParKg > 0) {
            // Calculer les kg supplémentaires au-delà de 5 kg
            const kgSupplementaires = poids - 5;
            const fraisSupplementaires = kgSupplementaires * prixParKg;
            frais += fraisSupplementaires;
            console.log(`⚖️ Poids > 5 kg: Base (0-5kg) = ${prixBase} DA, Supplémentaire (${kgSupplementaires.toFixed(2)} kg × ${prixParKg} DA/kg) = ${fraisSupplementaires.toFixed(2)} DA`);
        } else {
            console.log(`⚖️ Poids ≤ 5 kg: Prix de base uniquement = ${prixBase} DA`);
        }
        
        // 🚫 SUPPRESSION DU SUPPLÉMENT FRAGILE
        // Plus de facturation supplémentaire pour les colis fragiles
        // Le prix reste le même peu importe le type de colis (standard/fragile/express/volumineux)
        
        console.log(`💰 Frais calculés: ${frais.toFixed(2)} DA (Base: ${prixBase}, Poids: ${poids}kg, ParKg: ${prixParKg} DA/kg, Type: ${typeColis})`);
        
        this.updateFraisDisplay(frais);
    }

    updateFraisDisplay(frais, nonConfigures = false, wilayaSourceCode = null, wilayaDestCode = null) {
        const fraisElement = document.getElementById('fraisLivraison');
        const resumeFraisElement = document.getElementById('resumeFraisLivraison');
        
        if (nonConfigures) {
            // Afficher message d'avertissement pour frais non configurés
            const sourceNom = this.wilayas.find(w => w.code === wilayaSourceCode)?.nom || wilayaSourceCode;
            const destNom = this.wilayas.find(w => w.code === wilayaDestCode)?.nom || wilayaDestCode;
            
            if (fraisElement) {
                fraisElement.innerHTML = `<span style="color: #e74c3c; font-weight: bold;">⚠️ NON CONFIGURÉS</span>`;
            }
            if (resumeFraisElement) {
                resumeFraisElement.innerHTML = `
                    <span style="color: #e74c3c; font-weight: bold;">⚠️ Frais non configurés</span><br>
                    <small style="color: #7f8c8d;">Route: ${sourceNom} → ${destNom}</small><br>
                    <small style="color: #7f8c8d;">Veuillez configurer les frais pour cette route dans la section "Frais de livraison"</small>
                `;
            }
        } else {
            // Afficher les frais normalement
            if (fraisElement) {
                fraisElement.textContent = `${frais.toFixed(2)} DA`;
            }
            if (resumeFraisElement) {
                resumeFraisElement.textContent = `${frais.toFixed(2)} DA`;
            }
        }
        
        this.updateTotalAPayer();
    }

    updateResumePrix() {
        const prix = parseFloat(document.getElementById('prixColis')?.value) || 0;
        const resumeElement = document.getElementById('resumePrixColis');
        
        if (resumeElement) {
            resumeElement.textContent = `${prix.toFixed(2)} DA`;
        }
        
        this.updateTotalAPayer();
    }

    updateTotalAPayer() {
        const prix = parseFloat(document.getElementById('prixColis')?.value) || 0;
        const fraisText = document.getElementById('fraisLivraison')?.textContent || '0 DA';
        const frais = parseFloat(fraisText.replace(' DA', '')) || 0;
        
        const total = prix + frais;
        
        const totalElement = document.getElementById('totalAPayer');
        if (totalElement) {
            totalElement.textContent = `${total.toFixed(2)} DA`;
        }
    }

    prefillFormBasedOnRole() {
        if (this.userRole === 'agent' && this.currentUser.agence) {
            this.prefillAgentFields();
        } else if (this.userRole === 'commercant' && this.currentUser.agence) {
            this.prefillCommercantFields();
        }
    }

    prefillAgentFields() {
        // Récupérer l'agence (peut être un ID ou un objet)
        let agenceId = this.currentUser.agence;
        let agence = null;
        
        // Si c'est un objet, extraire l'ID
        if (typeof agenceId === 'object' && agenceId !== null) {
            agence = agenceId; // L'agence est déjà un objet complet
            agenceId = agence._id;
        } else if (typeof agenceId === 'string') {
            // Si c'est un ID, chercher l'agence dans la liste
            agence = this.agences.find(a => a._id === agenceId);
        }
        
        if (!agence) {
            console.warn('⚠️ Agence de l\'agent non trouvée', {
                agenceData: this.currentUser.agence,
                type: typeof this.currentUser.agence
            });
            return;
        }
        
        // Trouver la wilaya correspondante
        const wilayaCode = agence.wilaya;
        const wilaya = this.wilayas.find(w => w.code === wilayaCode);
        
        if (!wilaya) {
            console.warn('⚠️ Wilaya de l\'agence non trouvée', {
                wilayaCode,
                agence: agence.nom
            });
            return;
        }
        
        // Pré-remplir wilaya expéditeur (si existe)
        const wilayaExpSelect = document.getElementById('wilayaExpediteur');
        if (wilayaExpSelect) {
            wilayaExpSelect.value = wilaya._id;
            wilayaExpSelect.disabled = true;
            this.populateBureauxExpediteur(wilaya._id);
        }
        
        // Pré-remplir bureau source
        const bureauSourceSelect = document.getElementById('bureauSource');
        if (bureauSourceSelect) {
            setTimeout(() => {
                bureauSourceSelect.value = agence._id;
                bureauSourceSelect.disabled = true;
            }, 100);
        }
        
        console.log(`✅ Champs ${this.userRole} pré-remplis: ${wilaya.nom} - ${agence.nom}`);
    }

    prefillCommercantFields() {
        // D'abord appeler la logique de base (wilaya et bureau)
        this.prefillAgentFields();
        
        // 🔥 NOUVEAU: Pré-remplir nom et téléphone expéditeur avec les données du commerçant
        const nomExpInput = document.getElementById('nomExpediteur');
        const telExpInput = document.getElementById('telExpediteur');
        
        if (nomExpInput && this.currentUser.nom) {
            nomExpInput.value = this.currentUser.nom;
            console.log('✅ Nom expéditeur pré-rempli:', this.currentUser.nom);
        }
        
        if (telExpInput && this.currentUser.telephone) {
            telExpInput.value = this.currentUser.telephone;
            console.log('✅ Téléphone expéditeur pré-rempli:', this.currentUser.telephone);
        }
    }

    async submitForm(formData) {
        const token = this.getToken();
        
        // 🔄 Transformer formData en format API
        const typeLivraison = formData.typeLivraison || formData.typelivraison || 'domicile';
        const poids = parseFloat(formData.poidsColis) || 0;
        const montant = parseFloat(formData.prixColis) || 0;
        
        // Calculer les frais de livraison
        const fraisElement = document.getElementById('fraisLivraison');
        const fraisLivraison = parseFloat(fraisElement?.textContent?.replace(/[^\d.]/g, '') || 0);
        
        // Récupérer la wilaya destination
        const wilayaDestSelect = document.getElementById('wilayaDest');
        const wilayaDestValue = wilayaDestSelect?.value;
        
        // ✅ Mapper typeColis (standard/fragile/volumineux) vers typeArticle (vetements/electronique/etc.)
        // Le champ typeColis affecte les frais, mais l'API attend typeArticle
        const typeColis = formData.typeColis || 'standard';
        let typeArticle = 'autre'; // Par défaut
        if (typeColis === 'fragile') {
            typeArticle = 'fragile'; // "fragile" existe dans les deux
        }
        
        // Construire le payload conforme au modèle backend
        const payload = {
            expediteur: {
                id: this.currentUser._id,
                nom: formData.nomExpediteur || this.currentUser.nom || '',
                telephone: formData.telExpediteur || this.currentUser.telephone || '',
                adresse: '',
                wilaya: ''
            },
            // ✅ AJOUT: Champs séparés pour affichage dans le tableau
            nomExpediteur: formData.nomExpediteur || '',
            telExpediteur: formData.telExpediteur || '',
            destinataire: {
                nom: formData.nomClient || '',
                telephone: formData.telClient || '',
                adresse: formData.adresseLivraison || '',
                wilaya: wilayaDestValue || '',
                commune: ''
            },
            typeLivraison: typeLivraison,
            typeArticle: typeArticle, // ✅ Valeur valide: vetements/electronique/alimentaire/fragile/autre
            typeColis: typeColis, // ✅ Type de colis pour le bordereau (standard/fragile/express/volumineux)
            poids: poids,
            montant: montant,
            fraisLivraison: fraisLivraison,
            totalAPayer: montant + fraisLivraison,
            contenu: formData.contenu || '',
            notes: formData.description || '',
            agence: formData.bureauSource || this.currentUser.agence._id || this.currentUser.agence,
            createdBy: this.userRole
        };
        
        // Ajouter bureau destination si livraison en bureau
        if (typeLivraison === 'bureau') {
            payload.bureauDestination = formData.bureauDest || '';
        }
        
        console.log('📤 Payload à envoyer:', payload);
        
        try {
            const response = await fetch(`${window.API_CONFIG.API_URL}/colis`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erreur lors de l\'ajout du colis');
            }
            
            const result = await response.json();
            console.log('✅ Colis créé:', result);
            
            this.showSuccess('Colis ajouté avec succès !');
            return result;
            
        } catch (error) {
            console.error('❌ Erreur:', error);
            this.showError(error.message);
            throw error;
        }
    }

    showSuccess(message) {
        // Créer une notification de succès
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #16a34a;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    showError(message) {
        const notification = document.createElement('div');
        notification.className = 'notification error';
        notification.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ef4444;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    resetForm() {
        document.getElementById('colisForm')?.reset();
        this.updateFraisDisplay(0);
        this.updateResumePrix();
        
        // Ré-appliquer les valeurs pré-remplies
        this.prefillFormBasedOnRole();
    }
}

// Export pour utilisation dans les dashboards
window.ColisFormHandler = ColisFormHandler;
