/**
 * ========================================
 * GESTIONNAIRE FORMULAIRE COLIS V2
 * ========================================
 * Fonctionnalités:
 * - Chargement des wilayas depuis frais-livraison
 * - Chargement des bureaux filtrés par wilaya
 * - Auto-remplissage pour Agent/Commerçant
 * - Affichage conditionnel (bureau/domicile)
 * - Calcul automatique des frais par poids
 * - Validation et soumission
 * ========================================
 */

class ColisFormHandler {
  constructor() {
    this.form = document.getElementById('colisForm');
    this.modal = document.getElementById('colisModal');
    this.currentUser = null;
    this.fraisConfig = [];
    this.bureaux = [];
    
    // Éléments du formulaire
    this.elements = {
      // Expéditeur
      wilayaSource: document.getElementById('wilayaSource'),
      bureauSource: document.getElementById('bureauSource'),
      nomExpediteur: document.getElementById('nomExpediteur'),
      telExpediteur: document.getElementById('telExpediteur'),
      
      // Colis
      poidsColis: document.getElementById('poidsColis'),
      prixColis: document.getElementById('prixColis'),
      typeColis: document.getElementById('typeColis'),
      contenuColis: document.getElementById('contenuColis'),
      description: document.getElementById('description'),
      
      // Destinataire
      nomClient: document.getElementById('nomClient'),
      telClient: document.getElementById('telClient'),
      telSecondaire: document.getElementById('telSecondaire'),
      wilayaDest: document.getElementById('wilayaDest'),
      typelivraison: document.getElementById('typelivraison'),
      bureauDest: document.getElementById('bureauDest'),
      adresseLivraison: document.getElementById('adresseLivraison'),
      
      // Affichage conditionnel
      bureauDestRow: document.getElementById('bureauDestRow'),
      adresseDomicileRow: document.getElementById('adresseDomicileRow'),
      
      // Résumé
      resumePrixColis: document.getElementById('resumePrixColis'),
      fraisLivraison: document.getElementById('fraisLivraison'),
      totalAPayer: document.getElementById('totalAPayer')
    };
    
    this.init();
  }
  
  /**
   * Initialisation
   */
  async init() {
    console.log('🚀 Initialisation du gestionnaire de formulaire colis');
    
    try {
      // 1. Récupérer l'utilisateur connecté
      await this.loadCurrentUser();
      
      // 2. Charger les wilayas depuis frais-livraison
      await this.loadWilayas();
      
      // 3. Auto-remplir pour Agent/Commerçant
      this.autoFillUserData();
      
      // 4. Configurer les événements
      this.setupEventListeners();
      
      console.log('✅ Formulaire colis initialisé avec succès');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation:', error);
      this.showError('Erreur lors du chargement du formulaire');
    }
  }
  
  /**
   * Charger l'utilisateur connecté
   */
  async loadCurrentUser() {
    try {
      const token = sessionStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Token non trouvé');
      }
      
      const response = await fetch(`${window.API_CONFIG.API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Erreur lors de la récupération de l\'utilisateur');
      
      const data = await response.json();
      this.currentUser = data.user;
      
      console.log('👤 Utilisateur connecté:', this.currentUser.role, this.currentUser.nom);
    } catch (error) {
      console.error('❌ Erreur loadCurrentUser:', error);
      throw error;
    }
  }
  
  /**
   * Charger les wilayas depuis frais-livraison
   */
  async loadWilayas() {
    try {
      const token = sessionStorage.getItem('auth_token');
      const response = await fetch(`${window.API_CONFIG.API_URL}/frais-livraison`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Erreur lors du chargement des wilayas');
      
      const data = await response.json();
      this.fraisConfig = data.frais || [];
      
      console.log(`📍 ${this.fraisConfig.length} wilayas chargées`);
      
      // Remplir les selects
      this.populateWilayaSelects();
    } catch (error) {
      console.error('❌ Erreur loadWilayas:', error);
      throw error;
    }
  }
  
  /**
   * Remplir les selects de wilayas
   */
  populateWilayaSelects() {
    // Vider les options existantes (garder la première)
    this.elements.wilayaSource.innerHTML = '<option value="">Sélectionner une wilaya</option>';
    this.elements.wilayaDest.innerHTML = '<option value="">Sélectionner une wilaya</option>';
    
    // Ajouter les wilayas
    this.fraisConfig.forEach(frais => {
      const option1 = new Option(`${frais.wilayaCode} - ${frais.wilayaNom}`, frais.wilayaCode);
      const option2 = new Option(`${frais.wilayaCode} - ${frais.wilayaNom}`, frais.wilayaCode);
      
      this.elements.wilayaSource.add(option1);
      this.elements.wilayaDest.add(option2);
    });
  }
  
  /**
   * Charger les bureaux d'une wilaya
   */
  async loadBureauxByWilaya(wilayaCode, targetSelect) {
    try {
      const token = sessionStorage.getItem('auth_token');
      const response = await fetch(`${window.API_CONFIG.API_URL}/agences?wilaya=${wilayaCode}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Erreur lors du chargement des bureaux');
      
      const data = await response.json();
      const bureaux = data.agences || [];
      
      console.log(`🏢 ${bureaux.length} bureaux trouvés pour ${wilayaCode}`);
      
      // Remplir le select
      targetSelect.innerHTML = '<option value="">Sélectionner un bureau</option>';
      bureaux.forEach(bureau => {
        const option = new Option(bureau.nom, bureau._id);
        targetSelect.add(option);
      });
      
      return bureaux;
    } catch (error) {
      console.error('❌ Erreur loadBureauxByWilaya:', error);
      targetSelect.innerHTML = '<option value="">Aucun bureau disponible</option>';
      return [];
    }
  }
  
  /**
   * Auto-remplir les données pour Agent/Commerçant
   */
  autoFillUserData() {
    if (!this.currentUser) return;
    
    const role = this.currentUser.role;
    
    // Pour Agent et Commerçant: auto-remplir wilaya + bureau source
    if (role === 'agent' || role === 'commercant') {
      const agence = this.currentUser.agence;
      
      if (agence && agence.wilaya) {
        // Sélectionner la wilaya
        this.elements.wilayaSource.value = agence.wilaya;
        this.elements.wilayaSource.disabled = true;
        
        // Charger et sélectionner le bureau
        this.loadBureauxByWilaya(agence.wilaya, this.elements.bureauSource).then(() => {
          this.elements.bureauSource.value = agence._id;
          this.elements.bureauSource.disabled = true;
        });
        
        console.log(`🔒 Auto-remplissage pour ${role}:`, agence.nom);
      }
    }
  }
  
  /**
   * Configurer les événements
   */
  setupEventListeners() {
    // Changement wilaya source → charger bureaux
    this.elements.wilayaSource.addEventListener('change', (e) => {
      if (e.target.value && !e.target.disabled) {
        this.loadBureauxByWilaya(e.target.value, this.elements.bureauSource);
      }
    });
    
    // Changement wilaya destination → charger bureaux + recalculer frais
    this.elements.wilayaDest.addEventListener('change', (e) => {
      if (e.target.value) {
        this.loadBureauxByWilaya(e.target.value, this.elements.bureauDest);
        this.calculateFrais();
      }
    });
    
    // Type de livraison → affichage conditionnel
    this.elements.typelivraison.addEventListener('change', (e) => {
      this.toggleDeliveryFields(e.target.value);
      this.calculateFrais();
    });
    
    // Poids → recalculer frais
    this.elements.poidsColis.addEventListener('input', () => {
      this.calculateFrais();
    });
    
    // Prix colis → mettre à jour résumé
    this.elements.prixColis.addEventListener('input', () => {
      this.updatePrixResume();
      this.calculateTotal();
    });
    
    // Soumission du formulaire
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
    
    // Bouton annuler
    const cancelBtn = document.getElementById('cancelColisBtn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.closeModal();
      });
    }
    
    // Bouton fermer (X)
    const closeBtn = this.modal.querySelector('.close-button');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.closeModal();
      });
    }
  }
  
  /**
   * Affichage conditionnel: Bureau ou Domicile
   */
  toggleDeliveryFields(type) {
    if (type === 'bureau') {
      this.elements.bureauDestRow.style.display = 'block';
      this.elements.adresseDomicileRow.style.display = 'none';
      this.elements.bureauDest.required = true;
      this.elements.adresseLivraison.required = false;
    } else if (type === 'domicile') {
      this.elements.bureauDestRow.style.display = 'none';
      this.elements.adresseDomicileRow.style.display = 'block';
      this.elements.bureauDest.required = false;
      this.elements.adresseLivraison.required = true;
    } else {
      this.elements.bureauDestRow.style.display = 'none';
      this.elements.adresseDomicileRow.style.display = 'none';
      this.elements.bureauDest.required = false;
      this.elements.adresseLivraison.required = false;
    }
  }
  
  /**
   * Calculer les frais de livraison
   */
  calculateFrais() {
    const wilayaDest = this.elements.wilayaDest.value;
    const typelivraison = this.elements.typelivraison.value;
    const poids = parseFloat(this.elements.poidsColis.value) || 0;
    
    if (!wilayaDest || !typelivraison || poids <= 0) {
      this.elements.fraisLivraison.textContent = '0 DA';
      this.calculateTotal();
      return;
    }
    
    // Trouver la config de frais pour cette wilaya
    const fraisWilaya = this.fraisConfig.find(f => f.wilayaCode === wilayaDest);
    if (!fraisWilaya) {
      console.warn('⚠️ Pas de configuration de frais pour', wilayaDest);
      this.elements.fraisLivraison.textContent = 'Non configuré';
      return;
    }
    
    // Déterminer le tarif selon le type
    let tarif;
    if (typelivraison === 'domicile') {
      tarif = fraisWilaya.tarifDomicile;
    } else {
      tarif = fraisWilaya.tarifBureau;
    }
    
    if (!tarif) {
      console.warn('⚠️ Tarif non disponible pour', typelivraison);
      this.elements.fraisLivraison.textContent = 'Non disponible';
      return;
    }
    
    // Calculer les frais selon le poids
    let frais = tarif.montant;
    
    // Si poids > poidsMax, ajouter frais par kg
    if (poids > tarif.poidsMax && tarif.tarifParKg) {
      const poidsSupplementaire = poids - tarif.poidsMax;
      frais += poidsSupplementaire * tarif.tarifParKg;
    }
    
    console.log(`💰 Frais calculés: ${frais} DA (${poids}kg vers ${wilayaDest})`);
    
    this.elements.fraisLivraison.textContent = `${frais.toLocaleString()} DA`;
    this.elements.fraisLivraison.dataset.value = frais;
    
    this.calculateTotal();
  }
  
  /**
   * Mettre à jour le prix dans le résumé
   */
  updatePrixResume() {
    const prix = parseFloat(this.elements.prixColis.value) || 0;
    this.elements.resumePrixColis.textContent = `${prix.toLocaleString()} DA`;
    this.elements.resumePrixColis.dataset.value = prix;
  }
  
  /**
   * Calculer le total à payer
   */
  calculateTotal() {
    const prix = parseFloat(this.elements.resumePrixColis.dataset.value) || 0;
    const frais = parseFloat(this.elements.fraisLivraison.dataset.value) || 0;
    const total = prix + frais;
    
    this.elements.totalAPayer.textContent = `${total.toLocaleString()} DA`;
    this.elements.totalAPayer.dataset.value = total;
  }
  
  /**
   * Collecter les données du formulaire
   */
  collectFormData() {
    const typelivraison = this.elements.typelivraison.value;
    
    const data = {
      // Expéditeur
      expediteur: {
        nom: this.elements.nomExpediteur.value,
        telephone: this.elements.telExpediteur.value,
        wilaya: this.elements.wilayaSource.value,
        bureau: this.elements.bureauSource.value
      },
      
      // Destinataire
      destinataire: {
        nom: this.elements.nomClient.value,
        telephone: this.elements.telClient.value,
        telephoneSecondaire: this.elements.telSecondaire.value || null,
        wilaya: this.elements.wilayaDest.value,
        adresse: typelivraison === 'bureau' 
          ? this.elements.bureauDest.value 
          : this.elements.adresseLivraison.value
      },
      
      // Colis
      poids: parseFloat(this.elements.poidsColis.value),
      montant: parseFloat(this.elements.prixColis.value),
      typeColis: this.elements.typeColis.value,
      contenu: this.elements.contenuColis.value,
      description: this.elements.description.value || null,
      typeLivraison: typelivraison,
      
      // Financier
      fraisLivraison: parseFloat(this.elements.fraisLivraison.dataset.value) || 0,
      totalAPayer: parseFloat(this.elements.totalAPayer.dataset.value) || 0,
      
      // Metadata
      bureauSource: this.elements.bureauSource.value
    };
    
    return data;
  }
  
  /**
   * Soumettre le formulaire
   */
  async handleSubmit() {
    try {
      // Validation
      if (!this.form.checkValidity()) {
        this.form.reportValidity();
        return;
      }
      
      // Collecter les données
      const data = this.collectFormData();
      
      console.log('📤 Envoi du colis:', data);
      
      // Désactiver le bouton
      const submitBtn = this.form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.classList.add('loading');
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Création en cours...';
      
      // Envoyer à l'API
      const token = sessionStorage.getItem('auth_token');
      const response = await fetch(`${window.API_CONFIG.API_URL}/colis`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la création du colis');
      }
      
      const result = await response.json();
      console.log('✅ Colis créé:', result);
      
      // Afficher un message de succès
      this.showSuccess('Colis créé avec succès !');
      
      // Réinitialiser le formulaire
      this.form.reset();
      this.elements.resumePrixColis.textContent = '0 DA';
      this.elements.fraisLivraison.textContent = '0 DA';
      this.elements.totalAPayer.textContent = '0 DA';
      
      // Fermer le modal
      setTimeout(() => {
        this.closeModal();
        
        // Recharger la liste des colis si la fonction existe
        if (typeof window.loadColis === 'function') {
          window.loadColis();
        }
      }, 1500);
      
    } catch (error) {
      console.error('❌ Erreur lors de la soumission:', error);
      this.showError(error.message || 'Erreur lors de la création du colis');
    } finally {
      // Réactiver le bouton
      const submitBtn = this.form.querySelector('button[type="submit"]');
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
      submitBtn.innerHTML = '<i class="fas fa-check"></i> Créer le colis';
    }
  }
  
  /**
   * Fermer le modal
   */
  closeModal() {
    this.modal.classList.remove('show');
    this.modal.style.display = 'none';
  }
  
  /**
   * Ouvrir le modal
   */
  openModal() {
    this.modal.classList.add('show');
    this.modal.style.display = 'block';
  }
  
  /**
   * Afficher un message de succès
   */
  showSuccess(message) {
    // Vous pouvez intégrer votre système de notification ici
    alert('✅ ' + message);
  }
  
  /**
   * Afficher un message d'erreur
   */
  showError(message) {
    // Vous pouvez intégrer votre système de notification ici
    alert('❌ ' + message);
  }
}

// Initialiser quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
  window.colisFormHandler = new ColisFormHandler();
});

// Export pour utilisation externe
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ColisFormHandler;
}
