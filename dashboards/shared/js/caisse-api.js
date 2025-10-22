// ==================== CAISSE API - INTEGRATION API POUR LES 3 ROLES ====================
// Fichier centralisé pour gérer toutes les opérations caisse via l'API backend
// Pas de localStorage - 100% API

const CaisseAPI = {
  baseURL: window.API_CONFIG.API_URL,

  // ==================== HELPERS ====================
  getToken() {
    return localStorage.getItem('token');
  },

  getUserRole() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role;
  },

  getUserId() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user._id || user.id;
  },

  async fetchAPI(endpoint, options = {}) {
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

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur API');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur API:', error);
      throw error;
    }
  },

  // ==================== AGENT - FONCTIONS ====================
  async chargerCaisseAgent() {
    try {
      const userId = this.getUserId();
      const data = await this.fetchAPI(`/transactions/caisse-detaillee?userId=${userId}`);
      
      // Mettre à jour les statistiques
      document.getElementById('soldeCaisse').textContent = 
        this.formatMontant(data.solde || 0);
      
      document.getElementById('totalEntrees').textContent = 
        this.formatMontant(data.totalEntrees || 0);
      
      document.getElementById('totalSorties').textContent = 
        this.formatMontant(data.totalSorties || 0);
      
      document.getElementById('nbTransactions').textContent = 
        data.transactions?.length || 0;

      // Afficher les transactions
      this.afficherTransactionsAgent(data.transactions || []);
      
      return data;
    } catch (error) {
      console.error('Erreur chargement caisse agent:', error);
      this.showError('Impossible de charger la caisse');
      throw error;
    }
  },

  afficherTransactionsAgent(transactions) {
    const tbody = document.getElementById('transactionsCaisseBody');
    if (!tbody) return;

    if (transactions.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 2rem; color: #999;">
            <ion-icon name="receipt-outline" style="font-size: 48px; opacity: 0.3;"></ion-icon>
            <p>Aucune transaction</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = transactions.map(t => `
      <tr>
        <td>${this.formatDate(t.dateTransaction)}</td>
        <td>${this.getTypeLabel(t.type)}</td>
        <td style="font-weight: bold; color: ${t.type.includes('entree') ? '#16a34a' : '#ef4444'}">
          ${t.type.includes('entree') ? '+' : '-'} ${this.formatMontant(t.montant)}
        </td>
        <td>${this.getStatutBadge(t.statut)}</td>
        <td>${t.description || '-'}</td>
      </tr>
    `).join('');
  },

  // ==================== ADMIN - FONCTIONS ====================
  async chargerCaisseAdmin() {
    try {
      // Récupérer toutes les caisses des agents
      const data = await this.fetchAPI('/transactions/caisse-detaillee');
      
      // Calculer les totaux
      let totalCollecte = 0;
      let versementsValides = 0;
      let versementsAttente = 0;
      let nbAgents = 0;

      if (data.caisses) {
        data.caisses.forEach(caisse => {
          totalCollecte += caisse.solde || 0;
          nbAgents++;
        });
      }

      // Mettre à jour les stats
      document.getElementById('totalCollecteAdmin').textContent = 
        this.formatMontant(totalCollecte);
      
      document.getElementById('versementsValidesAdmin').textContent = 
        this.formatMontant(versementsValides);
      
      document.getElementById('versementsAttenteAdmin').textContent = 
        this.formatMontant(versementsAttente);
      
      document.getElementById('nbAgentsActifs').textContent = nbAgents;

      // Afficher les caisses
      this.afficherCaissesAgents(data.caisses || []);
      
      // Afficher les transactions
      this.afficherTransactionsAdmin(data.transactions || []);
      
      return data;
    } catch (error) {
      console.error('Erreur chargement caisse admin:', error);
      this.showError('Impossible de charger la caisse administration');
      throw error;
    }
  },

  afficherCaissesAgents(caisses) {
    const tbody = document.getElementById('caisseAgentsBody');
    if (!tbody) return;

    if (caisses.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 2rem; color: #999;">
            <ion-icon name="people-outline" style="font-size: 48px; opacity: 0.3;"></ion-icon>
            <p>Aucun agent</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = caisses.map(c => `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            <ion-icon name="person-circle" style="font-size: 32px; color: #667eea;"></ion-icon>
            <div>
              <strong>${c.agent?.nom || 'Inconnu'}</strong>
              <br>
              <small style="color: #999;">${c.agent?.email || ''}</small>
            </div>
          </div>
        </td>
        <td style="font-weight: bold; font-size: 1.1em;">
          ${this.formatMontant(c.solde || 0)}
        </td>
        <td style="color: #16a34a;">
          +${this.formatMontant(c.totalEntrees || 0)}
        </td>
        <td style="color: #ef4444;">
          -${this.formatMontant(c.totalSorties || 0)}
        </td>
        <td>
          <button class="btn-action btn-view" onclick="CaisseAPI.voirDetailsAgent('${c.agent?._id}')">
            <ion-icon name="eye"></ion-icon> Détails
          </button>
        </td>
      </tr>
    `).join('');
  },

  afficherTransactionsAdmin(transactions) {
    const tbody = document.getElementById('transactionsAdminBody');
    if (!tbody) return;

    if (transactions.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 2rem; color: #999;">
            <ion-icon name="receipt-outline" style="font-size: 48px; opacity: 0.3;"></ion-icon>
            <p>Aucune transaction</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = transactions.map(t => `
      <tr>
        <td>${this.formatDate(t.dateTransaction)}</td>
        <td>${t.emetteur?.nom || t.utilisateur?.nom || 'Inconnu'}</td>
        <td>${this.getTypeLabel(t.type)}</td>
        <td style="font-weight: bold;">
          ${this.formatMontant(t.montant)}
        </td>
        <td>${this.getStatutBadge(t.statut)}</td>
        <td>
          <button class="btn-action btn-view" onclick="CaisseAPI.voirDetailsTransaction('${t._id}')">
            <ion-icon name="eye"></ion-icon>
          </button>
        </td>
      </tr>
    `).join('');
  },

  // ==================== COMMERCANT - FONCTIONS ====================
  async chargerCaisseCommercant() {
    try {
      const userId = this.getUserId();
      const data = await this.fetchAPI(`/transactions/caisse-detaillee?userId=${userId}`);
      
      // Calculer les montants
      const aRecevoir = data.aRecevoir || 0;
      const totalRecu = data.totalRecu || 0;
      const fraisAPayer = data.fraisAPayer || 0;
      const soldeNet = aRecevoir - fraisAPayer;

      // Mettre à jour les statistiques
      document.getElementById('aRecevoirCommercant').textContent = 
        this.formatMontant(aRecevoir);
      
      document.getElementById('totalRecuCommercant').textContent = 
        this.formatMontant(totalRecu);
      
      document.getElementById('fraisAPayerCommercant').textContent = 
        this.formatMontant(fraisAPayer);
      
      document.getElementById('soldeNetCommercant').textContent = 
        this.formatMontant(soldeNet);

      // Afficher les transactions
      this.afficherTransactionsCommercant(data.transactions || []);
      
      return data;
    } catch (error) {
      console.error('Erreur chargement caisse commerçant:', error);
      this.showError('Impossible de charger la caisse');
      throw error;
    }
  },

  afficherTransactionsCommercant(transactions) {
    const tbody = document.getElementById('transactionsCommercantBody');
    if (!tbody) return;

    if (transactions.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 2rem; color: #999;">
            <ion-icon name="receipt-outline" style="font-size: 48px; opacity: 0.3;"></ion-icon>
            <p>Aucune transaction</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = transactions.map(t => `
      <tr>
        <td>${this.formatDate(t.dateTransaction)}</td>
        <td>${t.emetteur?.nom || t.agent?.nom || 'Agent'}</td>
        <td style="font-weight: bold; color: #16a34a;">
          ${this.formatMontant(t.montant)}
        </td>
        <td>${t.methodePaiement || 'Espèces'}</td>
        <td>${this.getStatutBadge(t.statut)}</td>
        <td>${t.description || 'Versement commerçant'}</td>
      </tr>
    `).join('');
  },

  // ==================== HELPERS - FORMATAGE ====================
  formatMontant(montant) {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(montant || 0) + ' DA';
  },

  formatDate(date) {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  getTypeLabel(type) {
    const labels = {
      'versement_agent_admin': 'Versement → Admin',
      'versement_commercant_agent': 'Versement Commerçant',
      'paiement_agent_commercant': 'Paiement Commerçant',
      'paiement_commercant_agent': 'Frais Retour',
      'entree_frais_livraison': 'Frais Livraison',
      'entree_frais_retour': 'Frais Retour',
      'entree_prix_colis': 'Prix Colis',
      'sortie_versement': 'Versement'
    };
    return labels[type] || type;
  },

  getStatutBadge(statut) {
    const badges = {
      'en_attente': '<span class="status-badge status-warning">⏱️ En attente</span>',
      'validee': '<span class="status-badge status-success">✓ Validée</span>',
      'refusee': '<span class="status-badge status-danger">✗ Refusée</span>',
      'annulee': '<span class="status-badge status-neutral">⊗ Annulée</span>',
      'completee': '<span class="status-badge status-success">✓ Complétée</span>'
    };
    return badges[statut] || `<span class="status-badge">${statut}</span>`;
  },

  // ==================== ACTIONS ====================
  async voirDetailsAgent(agentId) {
    console.log('Voir détails agent:', agentId);
    // TODO: Implémenter modal détails
  },

  async voirDetailsTransaction(transactionId) {
    console.log('Voir détails transaction:', transactionId);
    // TODO: Implémenter modal détails
  },

  showError(message) {
    // Utiliser le système de notification existant ou alert simple
    if (typeof showNotification === 'function') {
      showNotification(message, 'error');
    } else {
      alert(message);
    }
  },

  showSuccess(message) {
    if (typeof showNotification === 'function') {
      showNotification(message, 'success');
    } else {
      alert(message);
    }
  }
};

// ==================== AUTO-INIT AU CHARGEMENT ====================
document.addEventListener('DOMContentLoaded', () => {
  // Détecter le rôle et charger la caisse appropriée
  const role = CaisseAPI.getUserRole();
  
  // Agent
  if (role === 'agent' && document.getElementById('caisse-agent')) {
    CaisseAPI.chargerCaisseAgent();
    
    const btnActualiser = document.getElementById('btnActualiserCaisse');
    if (btnActualiser) {
      btnActualiser.addEventListener('click', () => {
        CaisseAPI.chargerCaisseAgent();
      });
    }
  }
  
  // Admin
  if (role === 'admin' && document.getElementById('caisse')) {
    CaisseAPI.chargerCaisseAdmin();
    
    const btnActualiser = document.getElementById('btnActualiserCaisseAdmin');
    if (btnActualiser) {
      btnActualiser.addEventListener('click', () => {
        CaisseAPI.chargerCaisseAdmin();
      });
    }
  }
  
  // Commerçant
  if (role === 'commercant' && document.getElementById('caisse-commercant')) {
    CaisseAPI.chargerCaisseCommercant();
    
    const btnActualiser = document.getElementById('btnActualiserCaisseCommercant');
    if (btnActualiser) {
      btnActualiser.addEventListener('click', () => {
        CaisseAPI.chargerCaisseCommercant();
      });
    }
  }
});

// Exporter pour usage global
window.CaisseAPI = CaisseAPI;
