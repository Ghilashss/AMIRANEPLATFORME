// ==================== GESTION CAISSE ADMIN ====================

const CaisseAdmin = {
  API_URL: window.API_CONFIG.API_URL,
  transactions: [],
  caisses: [],
  statistiques: {},

  // Initialisation
  async init() {
    console.log('🏦 Initialisation Caisse Admin...');
    
    // Charger les données
    await this.loadStatistiques();
    await this.loadCaissesAgents();
    await this.loadTransactions();
    await this.loadAgentsForFilter();
    
    // Initialiser les événements
    this.initEvents();
    
    // Mettre à jour l'affichage
    this.updateUI();
  },

  // Initialiser les événements
  initEvents() {
    // Bouton actualiser
    const btnActualiser = document.getElementById('btn-actualiser-caisse');
    if (btnActualiser) {
      btnActualiser.addEventListener('click', () => this.refresh());
    }

    // Filtres
    const filtres = [
      'filtre-statut-transactions',
      'filtre-type-transactions',
      'filtre-periode-transactions',
      'filtre-agent-transactions'
    ];

    filtres.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener('change', () => this.filterTransactions());
      }
    });
  },

  // Charger les statistiques
  async loadStatistiques() {
    try {
      const token = this.getAdminToken();
      const response = await fetch(`${this.API_URL}/transactions/statistiques/admin`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Erreur chargement statistiques');

      const data = await response.json();
      this.statistiques = data.data;
      console.log('✅ Statistiques chargées:', this.statistiques);
    } catch (error) {
      console.error('❌ Erreur chargement statistiques:', error);
      this.showNotification('Erreur lors du chargement des statistiques', 'error');
    }
  },

  // Charger les caisses des agents
  async loadCaissesAgents() {
    try {
      const token = this.getAdminToken();
      
      // Récupérer la liste des agents
      const responseUsers = await fetch(`${this.API_URL}/auth/users?role=agent`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!responseUsers.ok) throw new Error('Erreur chargement agents');

      const usersData = await responseUsers.json();
      const agents = usersData.data || [];

      // Charger la caisse de chaque agent
      this.caisses = [];
      for (const agent of agents) {
        try {
          const responseCaisse = await fetch(`${this.API_URL}/transactions/caisse?userId=${agent._id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (responseCaisse.ok) {
            const caisseData = await responseCaisse.json();
            this.caisses.push({
              agent: agent,
              caisse: caisseData.data
            });
          }
        } catch (err) {
          console.warn(`⚠️ Erreur chargement caisse agent ${agent.nom}:`, err);
        }
      }

      console.log('✅ Caisses agents chargées:', this.caisses.length);
    } catch (error) {
      console.error('❌ Erreur chargement caisses:', error);
      this.showNotification('Erreur lors du chargement des caisses', 'error');
    }
  },

  // Charger les transactions
  async loadTransactions() {
    try {
      const token = this.getAdminToken();
      const response = await fetch(`${this.API_URL}/transactions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Erreur chargement transactions');

      const data = await response.json();
      this.transactions = data.data || [];
      console.log('✅ Transactions chargées:', this.transactions.length);
    } catch (error) {
      console.error('❌ Erreur chargement transactions:', error);
      this.showNotification('Erreur lors du chargement des transactions', 'error');
    }
  },

  // Charger les agents pour le filtre
  async loadAgentsForFilter() {
    try {
      const token = this.getAdminToken();
      const response = await fetch(`${this.API_URL}/auth/users?role=agent`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) return;

      const data = await response.json();
      const agents = data.data || [];
      
      const select = document.getElementById('filtre-agent-transactions');
      if (select) {
        select.innerHTML = '<option value="">Tous les agents</option>';
        agents.forEach(agent => {
          const option = document.createElement('option');
          option.value = agent._id;
          option.textContent = `${agent.nom} - ${agent.email}`;
          select.appendChild(option);
        });
      }
    } catch (error) {
      console.error('Erreur chargement agents filtre:', error);
    }
  },

  // Mettre à jour l'interface
  updateUI() {
    this.updateStatistiquesCards();
    this.updateCaissesAgentsTable();
    this.updateTransactionsTable();
  },

  // Mettre à jour les cartes de statistiques
  updateStatistiquesCards() {
    const totalCollecte = this.caisses.reduce((sum, c) => sum + (c.caisse?.totalCollecte || 0), 0);
    const totalVerse = this.transactions.filter(t => t.statut === 'validee').reduce((sum, t) => sum + t.montant, 0);
    const totalEnAttente = this.transactions.filter(t => t.statut === 'en_attente').reduce((sum, t) => sum + t.montant, 0);

    this.setTextContent('totalCollecteAgents', `${totalCollecte.toLocaleString()} DA`);
    this.setTextContent('versementsValides', `${totalVerse.toLocaleString()} DA`);
    this.setTextContent('versementsEnAttente', `${totalEnAttente.toLocaleString()} DA`);
    this.setTextContent('nbTransactions', this.transactions.length);
  },

  // Mettre à jour le tableau des caisses agents
  updateCaissesAgentsTable() {
    const tbody = document.getElementById('caisses-agents-tbody');
    if (!tbody) return;

    if (this.caisses.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="empty-state">
            <i class="fas fa-inbox"></i>
            <h3>Aucun agent trouvé</h3>
            <p>Aucune caisse d'agent disponible</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = '';
    this.caisses.forEach(item => {
      const { agent, caisse } = item;
      const row = document.createElement('tr');
      
      row.innerHTML = `
        <td>
          <strong>${agent.nom || 'N/A'}</strong><br>
          <small style="color: #6c757d;">${agent.email || ''}</small>
        </td>
        <td><strong>${(caisse?.totalCollecte || 0).toLocaleString()} DA</strong></td>
        <td>${(caisse?.fraisLivraisonCollectes || 0).toLocaleString()} DA</td>
        <td>${(caisse?.fraisRetourCollectes || 0).toLocaleString()} DA</td>
        <td style="color: #28a745;"><strong>${(caisse?.totalVerse || 0).toLocaleString()} DA</strong></td>
        <td style="color: #ffc107;"><strong>${(caisse?.totalEnAttente || 0).toLocaleString()} DA</strong></td>
        <td style="color: #007bff; font-weight: 700;">${(caisse?.soldeActuel || 0).toLocaleString()} DA</td>
        <td class="text-center">
          <button class="action-btn view" onclick="CaisseAdmin.voirDetailsCaisseAgent('${agent._id}')" title="Voir détails">
            <i class="fas fa-eye"></i> Détails
          </button>
        </td>
      `;
      
      tbody.appendChild(row);
    });
  },

  // Mettre à jour le tableau des transactions
  updateTransactionsTable() {
    const tbody = document.getElementById('transactions-tbody');
    if (!tbody) return;

    const transactionsFiltrees = this.getFilteredTransactions();

    if (transactionsFiltrees.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="empty-state">
            <i class="fas fa-receipt"></i>
            <h3>Aucune transaction</h3>
            <p>Aucune transaction ne correspond aux filtres sélectionnés</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = '';
    transactionsFiltrees.forEach(transaction => {
      const row = document.createElement('tr');
      
      const typeLabel = this.getTypeLabel(transaction.type);
      const statutClass = this.getStatutClass(transaction.statut);
      const statutLabel = this.getStatutLabel(transaction.statut);
      
      row.innerHTML = `
        <td><strong>${transaction.numeroTransaction || 'N/A'}</strong></td>
        <td>${this.formatDate(transaction.dateTransaction)}</td>
        <td>
          <strong>${transaction.emetteur?.nom || 'N/A'}</strong><br>
          <small style="color: #6c757d;">${transaction.emetteur?.email || ''}</small>
        </td>
        <td><span class="type-badge ${transaction.type}">${typeLabel}</span></td>
        <td style="font-weight: 700; color: #2d3748;">${transaction.montant.toLocaleString()} DA</td>
        <td>${transaction.methodePaiement || 'N/A'}</td>
        <td><span class="status-badge ${statutClass}">${statutLabel}</span></td>
        <td class="text-center">
          <div class="transaction-actions">
            ${transaction.statut === 'en_attente' ? `
              <button class="action-btn validate" onclick="CaisseAdmin.validerTransaction('${transaction._id}')" title="Valider">
                <i class="fas fa-check"></i>
              </button>
              <button class="action-btn reject" onclick="CaisseAdmin.refuserTransaction('${transaction._id}')" title="Refuser">
                <i class="fas fa-times"></i>
              </button>
            ` : ''}
            <button class="action-btn view" onclick="CaisseAdmin.voirDetailsTransaction('${transaction._id}')" title="Détails">
              <i class="fas fa-eye"></i>
            </button>
          </div>
        </td>
      `;
      
      tbody.appendChild(row);
    });
  },

  // Filtrer les transactions
  getFilteredTransactions() {
    let filtered = [...this.transactions];

    const statut = document.getElementById('filtre-statut-transactions')?.value;
    const type = document.getElementById('filtre-type-transactions')?.value;
    const periode = document.getElementById('filtre-periode-transactions')?.value;
    const agentId = document.getElementById('filtre-agent-transactions')?.value;

    if (statut) {
      filtered = filtered.filter(t => t.statut === statut);
    }

    if (type) {
      filtered = filtered.filter(t => t.type === type);
    }

    if (agentId) {
      filtered = filtered.filter(t => t.emetteur?.id === agentId);
    }

    if (periode) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(t => {
        const dateTransaction = new Date(t.dateTransaction || t.date);
        
        switch (periode) {
          case 'today':
            return dateTransaction >= today;
          case 'week':
            const week = new Date(today);
            week.setDate(week.getDate() - 7);
            return dateTransaction >= week;
          case 'month':
            const month = new Date(today);
            month.setMonth(month.getMonth() - 1);
            return dateTransaction >= month;
          default:
            return true;
        }
      });
    }

    return filtered;
  },

  filterTransactions() {
    // La fonction updateTransactionsTable() utilise déjà getFilteredTransactions()
    this.updateTransactionsTable();
  },

  // Valider une transaction
  async validerTransaction(transactionId) {
    if (!confirm('Voulez-vous vraiment valider cette transaction ?')) return;

    try {
      const token = this.getAdminToken();
      const response = await fetch(`${this.API_URL}/transactions/${transactionId}/valider`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ statut: 'validee' })
      });

      if (!response.ok) throw new Error('Erreur validation');

      const data = await response.json();
      this.showNotification('✅ Transaction validée avec succès', 'success');
      
      // Actualiser les données
      await this.refresh();
    } catch (error) {
      console.error('Erreur validation transaction:', error);
      this.showNotification('❌ Erreur lors de la validation', 'error');
    }
  },

  // Refuser une transaction
  async refuserTransaction(transactionId) {
    const motif = prompt('Motif du refus (optionnel):');
    if (motif === null) return; // Annulation

    try {
      const token = this.getAdminToken();
      const response = await fetch(`${this.API_URL}/transactions/${transactionId}/valider`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          statut: 'refusee',
          motifRefus: motif
        })
      });

      if (!response.ok) throw new Error('Erreur refus');

      const data = await response.json();
      this.showNotification('Transaction refusée', 'warning');
      
      // Actualiser les données
      await this.refresh();
    } catch (error) {
      console.error('Erreur refus transaction:', error);
      this.showNotification('Erreur lors du refus', 'error');
    }
  },

  // Voir détails d'une transaction
  voirDetailsTransaction(transactionId) {
    const transaction = this.transactions.find(t => t._id === transactionId);
    if (!transaction) return;

    const content = document.getElementById('transaction-details-content');
    if (!content) return;

    content.innerHTML = `
      <div style="padding: 20px 0;">
        <div style="margin-bottom: 20px;">
          <h3 style="color: #2d3748; margin-bottom: 16px;">Informations générales</h3>
          <div class="collecte-details">
            <div class="collecte-item">
              <div class="collecte-item-label">N° Transaction</div>
              <div class="collecte-item-value">${transaction.numeroTransaction}</div>
            </div>
            <div class="collecte-item">
              <div class="collecte-item-label">Date</div>
              <div class="collecte-item-value">${this.formatDate(transaction.dateTransaction)}</div>
            </div>
            <div class="collecte-item">
              <div class="collecte-item-label">Type</div>
              <div class="collecte-item-value">${this.getTypeLabel(transaction.type)}</div>
            </div>
            <div class="collecte-item success">
              <div class="collecte-item-label">Montant</div>
              <div class="collecte-item-value">${transaction.montant.toLocaleString()} DA</div>
            </div>
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #2d3748; margin-bottom: 16px;">Émetteur & Destinataire</h3>
          <div class="collecte-details">
            <div class="collecte-item">
              <div class="collecte-item-label">Émetteur</div>
              <div class="collecte-item-value">${transaction.emetteur?.nom || 'N/A'}</div>
              <div class="balance-subtitle">${transaction.emetteur?.email || ''}</div>
            </div>
            ${transaction.destinataire ? `
            <div class="collecte-item">
              <div class="collecte-item-label">Destinataire</div>
              <div class="collecte-item-value">${transaction.destinataire?.nom || 'N/A'}</div>
              <div class="balance-subtitle">${transaction.destinataire?.email || ''}</div>
            </div>
            ` : ''}
          </div>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #2d3748; margin-bottom: 16px;">Détails paiement</h3>
          <div class="collecte-details">
            <div class="collecte-item">
              <div class="collecte-item-label">Méthode</div>
              <div class="collecte-item-value">${transaction.methodePaiement || 'N/A'}</div>
            </div>
            ${transaction.referencePaiement ? `
            <div class="collecte-item">
              <div class="collecte-item-label">Référence</div>
              <div class="collecte-item-value">${transaction.referencePaiement}</div>
            </div>
            ` : ''}
            <div class="collecte-item ${this.getStatutClass(transaction.statut)}">
              <div class="collecte-item-label">Statut</div>
              <div class="collecte-item-value">${this.getStatutLabel(transaction.statut)}</div>
            </div>
          </div>
        </div>

        ${transaction.description ? `
        <div style="margin-bottom: 20px;">
          <h3 style="color: #2d3748; margin-bottom: 16px;">Description</h3>
          <p style="background: #f8f9fa; padding: 16px; border-radius: 8px; color: #2d3748;">
            ${transaction.description}
          </p>
        </div>
        ` : ''}

        ${transaction.motifRefus ? `
        <div class="alert alert-danger">
          <i class="fas fa-exclamation-triangle"></i>
          <strong>Motif du refus:</strong> ${transaction.motifRefus}
        </div>
        ` : ''}
      </div>
    `;

    document.getElementById('modal-detail-transaction').style.display = 'flex';
  },

  // Voir détails caisse agent
  voirDetailsCaisseAgent(agentId) {
    const item = this.caisses.find(c => c.agent._id === agentId);
    if (!item) return;

    alert(`Caisse de ${item.agent.nom}\n\nSolde: ${(item.caisse?.soldeActuel || 0).toLocaleString()} DA\nTotal collecté: ${(item.caisse?.totalCollecte || 0).toLocaleString()} DA\nVersé: ${(item.caisse?.totalVerse || 0).toLocaleString()} DA`);
  },

  // Actualiser toutes les données
  async refresh() {
    this.showNotification('Actualisation...', 'info');
    await this.loadStatistiques();
    await this.loadCaissesAgents();
    await this.loadTransactions();
    this.updateUI();
    this.showNotification('✅ Données actualisées', 'success');
  },

  // Helpers
  getAdminToken() {
    // ✅ Lire depuis sessionStorage (nouveau système AuthService)
    let token = sessionStorage.getItem('auth_token');
    
    // Fallback sur localStorage pour compatibilité
    if (!token) {
      token = localStorage.getItem('admin_token');
    }
    
    return token;
  },

  formatDate(date) {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  getTypeLabel(type) {
    const labels = {
      'versement_agent_admin': 'Agent → Admin',
      'versement_commercant_agent': 'Commerçant → Agent',
      'paiement_commercant': 'Paiement Commerçant',
      'retrait': 'Retrait'
    };
    return labels[type] || type;
  },

  getStatutClass(statut) {
    return statut;
  },

  getStatutLabel(statut) {
    const labels = {
      'en_attente': 'En attente',
      'validee': 'Validée',
      'refusee': 'Refusée',
      'annulee': 'Annulée'
    };
    return labels[statut] || statut;
  },

  setTextContent(id, text) {
    const element = document.getElementById(id);
    if (element) element.textContent = text;
  },

  showNotification(message, type = 'info') {
    // Utiliser le système de notification existant si disponible
    if (typeof showNotification === 'function') {
      showNotification(message, type);
    } else {
      console.log(`[${type.toUpperCase()}] ${message}`);
    }
  }
};

// Fonction pour fermer le modal
function closeModalTransaction() {
  document.getElementById('modal-detail-transaction').style.display = 'none';
}

// Export pour utilisation globale
window.CaisseAdmin = CaisseAdmin;
