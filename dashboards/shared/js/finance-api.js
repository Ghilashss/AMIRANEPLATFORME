// ===================================================
// GESTION FINANCE - API JAVASCRIPT
// ===================================================
// Module pour gérer les opérations financières

const GestionFinanceAPI = {
  // Configuration
  baseURL: window.API_CONFIG?.API_URL || 'http://localhost:5000/api',
  
  // ============================================
  // UTILITAIRES
  // ============================================
  
  getToken() {
    return sessionStorage.getItem('auth_token') || 
           localStorage.getItem('auth_token') || 
           localStorage.getItem('agent_token') ||
           localStorage.getItem('commercant_token');
  },
  
  getUserInfo() {
    const userStr = sessionStorage.getItem('user') || 
                    localStorage.getItem('user') ||
                    localStorage.getItem('agent') ||
                    localStorage.getItem('commercant');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    };
    
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur API');
      }
      
      return data;
    } catch (error) {
      console.error('❌ Erreur API:', error);
      throw error;
    }
  },
  
  // ============================================
  // OBTENIR LE PORTEFEUILLE
  // ============================================
  
  async obtenirPortefeuille() {
    const user = this.getUserInfo();
    if (!user || !user._id) {
      throw new Error('Utilisateur non authentifié');
    }
    
    // Déterminer le type de compte
    let userType = 'User'; // Par défaut Admin
    if (user.role === 'agent' || user.role === 'agence') {
      userType = 'Agence';
    } else if (user.role === 'commercant') {
      userType = 'Commercant';
    }
    
    return await this.request('/finance/portefeuille', {
      method: 'POST',
      body: JSON.stringify({
        userId: user._id,
        userType: userType
      })
    });
  },
  
  // ============================================
  // OBTENIR LES STATISTIQUES
  // ============================================
  
  async obtenirStatistiques() {
    const user = this.getUserInfo();
    if (!user || !user._id) {
      throw new Error('Utilisateur non authentifié');
    }
    
    let userType = 'User';
    if (user.role === 'agent' || user.role === 'agence') {
      userType = 'Agence';
    } else if (user.role === 'commercant') {
      userType = 'Commercant';
    }
    
    return await this.request('/finance/statistiques', {
      method: 'POST',
      body: JSON.stringify({
        userId: user._id,
        userType: userType
      })
    });
  },
  
  // ============================================
  // OBTENIR L'HISTORIQUE DES OPÉRATIONS
  // ============================================
  
  async obtenirOperations(limit = 50) {
    const user = this.getUserInfo();
    if (!user || !user._id) {
      throw new Error('Utilisateur non authentifié');
    }
    
    let userType = 'User';
    if (user.role === 'agent' || user.role === 'agence') {
      userType = 'Agence';
    } else if (user.role === 'commercant') {
      userType = 'Commercant';
    }
    
    return await this.request('/finance/operations', {
      method: 'POST',
      body: JSON.stringify({
        userId: user._id,
        userType: userType,
        limit: limit
      })
    });
  },
  
  // ============================================
  // EFFECTUER UN VIREMENT
  // ============================================
  
  async effectuerVirement(data) {
    const user = this.getUserInfo();
    if (!user || !user._id) {
      throw new Error('Utilisateur non authentifié');
    }
    
    return await this.request('/finance/virement', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        effectueParId: user._id
      })
    });
  },
  
  // ============================================
  // MARQUER UN COLIS COMME PAYÉ
  // ============================================
  
  async marquerColisPaye(colisId) {
    const user = this.getUserInfo();
    if (!user || !user._id) {
      throw new Error('Utilisateur non authentifié');
    }
    
    return await this.request('/finance/marquer-paye', {
      method: 'POST',
      body: JSON.stringify({
        colisId: colisId,
        agentId: user._id
      })
    });
  },
  
  // ============================================
  // OBTENIR TOUS LES PORTEFEUILLES (ADMIN)
  // ============================================
  
  async obtenirTousPortefeuilles() {
    return await this.request('/finance/admin/portefeuilles', {
      method: 'GET'
    });
  },
  
  // ============================================
  // OBTENIR TOUTES LES OPÉRATIONS (ADMIN)
  // ============================================
  
  async obtenirToutesOperations(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await this.request(`/finance/admin/operations?${queryString}`, {
      method: 'GET'
    });
  },
  
  // ============================================
  // FORMATTAGE DES DONNÉES
  // ============================================
  
  formatMontant(montant, devise = 'DA') {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(montant) + ' ' + devise;
  },
  
  formatDate(date) {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  },
  
  getTypeOperationLabel(type) {
    const labels = {
      'paiement_livraison': 'Paiement Livraison',
      'frais_livraison': 'Frais Livraison',
      'frais_retour': 'Frais Retour',
      'paiement_agence': 'Paiement Agence',
      'virement_manuel': 'Virement Manuel',
      'rechargement': 'Rechargement',
      'retrait': 'Retrait'
    };
    return labels[type] || type;
  },
  
  getStatutLabel(statut) {
    const labels = {
      'validee': 'Validée',
      'en_attente': 'En Attente',
      'annulee': 'Annulée',
      'echouee': 'Échouée'
    };
    return labels[statut] || statut;
  },
  
  getStatutClass(statut) {
    const classes = {
      'validee': 'validee',
      'en_attente': 'en_attente',
      'annulee': 'annulee',
      'echouee': 'annulee'
    };
    return classes[statut] || 'en_attente';
  },
  
  getTypeClass(type) {
    const classes = {
      'paiement_livraison': 'paiement_livraison',
      'frais_livraison': 'frais_livraison',
      'frais_retour': 'frais_retour',
      'paiement_agence': 'paiement_agence',
      'virement_manuel': 'virement_manuel',
      'rechargement': 'rechargement',
      'retrait': 'retrait'
    };
    return classes[type] || 'virement_manuel';
  }
};

// ===================================================
// MODULE D'AFFICHAGE POUR ADMIN
// ===================================================

const FinanceAdmin = {
  
  async init() {
    console.log('💰 Initialisation Finance Admin...');
    await this.chargerDonnees();
    this.attacherEvenements();
  },
  
  async chargerDonnees() {
    try {
      // Afficher le loading
      this.afficherLoading();
      
      // Charger les portefeuilles
      const portResult = await GestionFinanceAPI.obtenirTousPortefeuilles();
      if (portResult.success) {
        this.afficherPortefeuilles(portResult.portefeuilles);
      }
      
      // Charger les opérations
      const opsResult = await GestionFinanceAPI.obtenirToutesOperations({ limit: 100 });
      if (opsResult.success) {
        this.afficherOperations(opsResult.operations);
      }
      
      // Calculer les statistiques globales
      this.calculerStatistiques(portResult.portefeuilles, opsResult.operations);
      
    } catch (error) {
      console.error('❌ Erreur chargement données:', error);
      this.afficherErreur(error.message);
    }
  },
  
  afficherLoading() {
    const container = document.getElementById('finance-content-admin');
    if (container) {
      container.innerHTML = `
        <div class="finance-loading">
          <div class="finance-spinner"></div>
          <p style="margin-top: 20px; color: #64748b;">Chargement des données financières...</p>
        </div>
      `;
    }
  },
  
  afficherPortefeuilles(portefeuilles) {
    // À implémenter dans le HTML
    console.log('📊 Portefeuilles:', portefeuilles);
  },
  
  afficherOperations(operations) {
    const tbody = document.getElementById('finance-operations-body-admin');
    if (!tbody) return;
    
    if (operations.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="finance-empty-state">
            <ion-icon name="receipt-outline"></ion-icon>
            <p>Aucune opération enregistrée</p>
          </td>
        </tr>
      `;
      return;
    }
    
    tbody.innerHTML = operations.map(op => `
      <tr>
        <td>${GestionFinanceAPI.formatDate(op.date)}</td>
        <td>
          <span class="finance-type-badge ${GestionFinanceAPI.getTypeClass(op.type)}">
            ${GestionFinanceAPI.getTypeOperationLabel(op.type)}
          </span>
        </td>
        <td>${op.debit ? op.debit.nom : '-'}</td>
        <td>${op.credit ? op.credit.nom : '-'}</td>
        <td class="finance-montant">
          ${GestionFinanceAPI.formatMontant(op.montant)}
        </td>
        <td>
          <span class="finance-statut-badge ${GestionFinanceAPI.getStatutClass(op.statut)}">
            ${GestionFinanceAPI.getStatutLabel(op.statut)}
          </span>
        </td>
        <td style="font-size: 12px; color: #64748b;">${op.description}</td>
      </tr>
    `).join('');
  },
  
  calculerStatistiques(portefeuilles, operations) {
    // Calculer totaux
    const totalSoldes = portefeuilles.reduce((sum, p) => sum + p.solde, 0);
    const totalOperations = operations.length;
    const operationsValides = operations.filter(op => op.statut === 'validee').length;
    const operationsAttente = operations.filter(op => op.statut === 'en_attente').length;
    
    // Afficher dans les cartes
    const soldeEl = document.getElementById('finance-total-soldes');
    if (soldeEl) soldeEl.textContent = GestionFinanceAPI.formatMontant(totalSoldes);
    
    const opsEl = document.getElementById('finance-total-operations');
    if (opsEl) opsEl.textContent = totalOperations;
    
    const validEl = document.getElementById('finance-operations-validees');
    if (validEl) validEl.textContent = operationsValides;
    
    const attenteEl = document.getElementById('finance-operations-attente');
    if (attenteEl) attenteEl.textContent = operationsAttente;
  },
  
  attacherEvenements() {
    const btnActualiser = document.getElementById('btnActualiserFinanceAdmin');
    if (btnActualiser) {
      btnActualiser.addEventListener('click', () => this.chargerDonnees());
    }
  },
  
  afficherErreur(message) {
    const container = document.getElementById('finance-content-admin');
    if (container) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #dc2626;">
          <ion-icon name="alert-circle" style="font-size: 64px;"></ion-icon>
          <p style="font-size: 18px; margin-top: 20px;">${message}</p>
        </div>
      `;
    }
  }
};

// ===================================================
// MODULE D'AFFICHAGE POUR AGENT/COMMERCANT
// ===================================================

const FinanceUtilisateur = {
  
  async init() {
    console.log('💰 Initialisation Finance Utilisateur...');
    await this.chargerDonnees();
    this.attacherEvenements();
  },
  
  async chargerDonnees() {
    try {
      this.afficherLoading();
      
      // Charger portefeuille et stats
      const [portResult, statsResult, opsResult] = await Promise.all([
        GestionFinanceAPI.obtenirPortefeuille(),
        GestionFinanceAPI.obtenirStatistiques(),
        GestionFinanceAPI.obtenirOperations(50)
      ]);
      
      if (portResult.success) {
        this.afficherPortefeuille(portResult.portefeuille);
      }
      
      if (statsResult.success) {
        this.afficherStatistiques(statsResult.statistiques);
      }
      
      if (opsResult.success) {
        this.afficherOperations(opsResult.operations);
      }
      
    } catch (error) {
      console.error('❌ Erreur chargement:', error);
      this.afficherErreur(error.message);
    }
  },
  
  afficherLoading() {
    const container = document.getElementById('finance-content-user');
    if (container) {
      container.innerHTML = `
        <div class="finance-loading">
          <div class="finance-spinner"></div>
          <p style="margin-top: 20px; color: #64748b;">Chargement...</p>
        </div>
      `;
    }
  },
  
  afficherPortefeuille(portefeuille) {
    const soldeEl = document.getElementById('finance-solde-actuel');
    if (soldeEl) {
      soldeEl.textContent = GestionFinanceAPI.formatMontant(portefeuille.solde);
    }
  },
  
  afficherStatistiques(stats) {
    const aRecevoirEl = document.getElementById('finance-a-recevoir');
    if (aRecevoirEl) {
      aRecevoirEl.textContent = GestionFinanceAPI.formatMontant(stats.aRecevoir);
    }
    
    const aPayerEl = document.getElementById('finance-a-payer');
    if (aPayerEl) {
      aPayerEl.textContent = GestionFinanceAPI.formatMontant(stats.aPayer);
    }
    
    const totalRecuEl = document.getElementById('finance-total-recu');
    if (totalRecuEl) {
      totalRecuEl.textContent = GestionFinanceAPI.formatMontant(stats.totalRecu);
    }
  },
  
  afficherOperations(operations) {
    const tbody = document.getElementById('finance-operations-body');
    if (!tbody) return;
    
    if (operations.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="finance-empty-state">
            <ion-icon name="receipt-outline"></ion-icon>
            <p>Aucune opération</p>
          </td>
        </tr>
      `;
      return;
    }
    
    tbody.innerHTML = operations.map(op => `
      <tr>
        <td>${GestionFinanceAPI.formatDate(op.date)}</td>
        <td>
          <span class="finance-type-badge ${GestionFinanceAPI.getTypeClass(op.type)}">
            ${GestionFinanceAPI.getTypeOperationLabel(op.type)}
          </span>
        </td>
        <td class="finance-montant ${op.sens}">
          ${op.sens === 'credit' ? '+' : '-'}${GestionFinanceAPI.formatMontant(op.montant)}
        </td>
        <td>${op.methodePaiement}</td>
        <td>
          <span class="finance-statut-badge ${GestionFinanceAPI.getStatutClass(op.statut)}">
            ${GestionFinanceAPI.getStatutLabel(op.statut)}
          </span>
        </td>
        <td style="font-size: 12px; color: #64748b;">
          ${op.codeColis ? `Colis: ${op.codeColis}<br>` : ''}
          ${op.description}
        </td>
      </tr>
    `).join('');
  },
  
  attacherEvenements() {
    const btnActualiser = document.getElementById('btnActualiserFinance');
    if (btnActualiser) {
      btnActualiser.addEventListener('click', () => this.chargerDonnees());
    }
    
    // Bouton virement commerçant vers agent
    const btnVirementAgent = document.getElementById('btnVirementVersAgent');
    if (btnVirementAgent) {
      btnVirementAgent.addEventListener('click', () => this.ouvrirModalVirementAgent());
    }
    
    // Bouton virement agent vers admin
    const btnVirementAdmin = document.getElementById('btnVirementVersAdmin');
    if (btnVirementAdmin) {
      btnVirementAdmin.addEventListener('click', () => this.ouvrirModalVirementAdmin());
    }
    
    // Bouton collecter commerçant
    const btnCollecter = document.getElementById('btnCollecterCommercant');
    if (btnCollecter) {
      btnCollecter.addEventListener('click', () => this.ouvrirModalCollecte());
    }
  },
  
  async ouvrirModalVirementAgent() {
    const montant = prompt('💰 Montant à verser à l\'agent (DA):');
    if (!montant || isNaN(montant) || parseFloat(montant) <= 0) {
      alert('Montant invalide');
      return;
    }
    
    try {
      // Récupérer les infos utilisateur
      const user = this.getUserInfo();
      const commercantId = user?._id;
      
      if (!commercantId) {
        alert('Erreur: Utilisateur non identifié');
        return;
      }
      
      // Récupérer les colis du commerçant pour trouver l'agence
      const colisResponse = await fetch(`${this.baseURL}/colis/commercant/${commercantId}`, {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`
        }
      });
      
      if (!colisResponse.ok) {
        alert('Erreur lors de la récupération des colis');
        return;
      }
      
      const colisData = await colisResponse.json();
      const colis = colisData.colis || colisData.data || colisData;
      
      // Trouver un colis avec une agence assignée
      const colisAvecAgence = colis.find(c => c.agence && c.agence._id);
      
      if (!colisAvecAgence) {
        alert('❌ Aucune agence trouvée. Vous devez d\'abord avoir des colis assignés à une agence.');
        return;
      }
      
      const agenceId = typeof colisAvecAgence.agence === 'object' 
        ? colisAvecAgence.agence._id 
        : colisAvecAgence.agence;
      
      // Effectuer le virement
      const response = await this.request('/finance/virement-commercant-agent', {
        method: 'POST',
        body: JSON.stringify({
          commercantId,
          agenceId,
          montant: parseFloat(montant),
          description: `Paiement frais de livraison et retour - ${montant} DA`
        })
      });
      
      if (response.success) {
        alert('✅ Virement effectué avec succès!');
        // Recharger les données
        if (window.financeUtilisateur) {
          window.financeUtilisateur.chargerDonnees();
        }
      } else {
        alert('❌ ' + (response.message || 'Erreur lors du virement'));
      }
    } catch (error) {
      console.error('Erreur virement:', error);
      alert('❌ Erreur: ' + error.message);
    }
  },
  
  async ouvrirModalVirementAdmin() {
    const montant = prompt('💰 Montant à verser à l\'admin (DA):');
    if (!montant || isNaN(montant) || parseFloat(montant) <= 0) {
      alert('Montant invalide');
      return;
    }
    
    const userData = JSON.parse(localStorage.getItem('userData'));
    const agenceId = userData?.agenceId || userData?._id;
    
    try {
      const response = await GestionFinanceAPI.request('/virement-agent-admin', 'POST', {
        agenceId,
        montant: parseFloat(montant),
        description: `Virement frais livraison - ${montant} DA`,
        typeFrais: 'livraison'
      });
      
      if (response.success) {
        alert('✅ Virement effectué avec succès!');
        this.chargerDonnees();
      } else {
        alert('❌ ' + response.message);
      }
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
  },
  
  async ouvrirModalCollecte() {
    alert('📋 Fonctionnalité de collecte en cours de développement');
  },
  
  afficherErreur(message) {
    console.error('Erreur:', message);
  }
};

// Exporter les modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GestionFinanceAPI, FinanceAdmin, FinanceUtilisateur };
}
