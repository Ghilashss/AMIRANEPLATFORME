/**
 * Module de gestion de caisse - AGENT/AGENCE
 * Nouveau système basé sur Compte (wallet) et TransactionFinanciere
 */

class CaisseAgentManager {
  constructor() {
    this.apiUrl = window.CONFIG?.API_URL || 'https://amiraneplatforme.onrender.com/api';
    this.compte = null;
    this.stats = null;
    this.transactions = [];
    this.initialized = false;
    // NE PAS appeler init() automatiquement
  }

  async init() {
    // Éviter l'initialisation multiple
    if (this.initialized) {
      console.log('✅ Caisse Agent déjà initialisée');
      return;
    }

    console.log('💰 Initialisation Caisse Agent (nouveau système)...');
    
    try {
      const userId = this.getUserId();
      if (!userId) {
        console.error('❌ User ID non trouvé');
        return;
      }

      await this.chargerDonneesCaisse(userId);
      
      // ✅ CHARGER LES VIREMENTS EN ATTENTE
      if (typeof GestionFinanceAPI !== 'undefined' && GestionFinanceAPI.chargerVirementsEnAttente) {
        await GestionFinanceAPI.chargerVirementsEnAttente();
      }
      
      this.setupEventListeners();
      
      this.initialized = true;
      console.log('✅ Caisse Agent initialisée');
    } catch (error) {
      console.error('❌ Erreur initialisation caisse:', error);
    }
  }

  getUserId() {
    const authData = sessionStorage.getItem('auth_token');
    if (!authData) return null;
    
    try {
      const payload = JSON.parse(atob(authData.split('.')[1]));
      return payload.id || payload.userId;
    } catch (error) {
      console.error('❌ Erreur décodage token:', error);
      return null;
    }
  }

  getAuthToken() {
    return sessionStorage.getItem('auth_token');
  }

  async chargerDonneesCaisse(userId) {
    try {
      console.log('📊 Chargement données caisse agent...');
      
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('Token non trouvé');
      }

      const [compteResponse, statsResponse] = await Promise.all([
        fetch(`${this.apiUrl}/caisse/compte/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${this.apiUrl}/caisse/stats/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (!compteResponse.ok || !statsResponse.ok) {
        throw new Error('Erreur chargement données');
      }

      const compteData = await compteResponse.json();
      const statsData = await statsResponse.json();

      this.compte = compteData.data.compte;
      this.stats = statsData.data;
      this.transactions = compteData.data.transactions || [];

      console.log('✅ Données agent chargées:', {
        solde: this.compte.solde,
        transactions: this.transactions.length
      });

      this.afficherDonnees();

    } catch (error) {
      console.error('❌ Erreur chargement caisse agent:', error);
      this.afficherErreur('Erreur lors du chargement des données de caisse');
    }
  }

  afficherDonnees() {
    this.afficherSolde();
    this.afficherStatistiques();
    this.afficherTransactions();
  }

  afficherSolde() {
    const soldeElement = document.getElementById('caisse-solde-agent');
    if (!soldeElement) return;

    const solde = this.compte?.solde || 0;
    const soldeClass = solde >= 0 ? 'positif' : 'negatif';

    soldeElement.innerHTML = `
      <div class="solde-card ${soldeClass}">
        <div class="solde-icon">💰</div>
        <div class="solde-info">
          <h3>Mon Solde</h3>
          <p class="solde-montant">${this.formatMontant(solde)} DA</p>
          <small>${solde < 0 ? 'Vous devez de l\'argent' : 'Solde positif'}</small>
        </div>
      </div>
    `;
  }

  afficherStatistiques() {
    const statsElement = document.getElementById('caisse-stats-agent');
    if (!statsElement || !this.stats) return;

    statsElement.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card credit">
          <div class="stat-icon">📈</div>
          <div class="stat-info">
            <h4>Total Reçu</h4>
            <p class="stat-value">${this.formatMontant(this.stats.totalCredits)} DA</p>
          </div>
        </div>
        
        <div class="stat-card debit">
          <div class="stat-icon">📉</div>
          <div class="stat-info">
            <h4>Total Payé</h4>
            <p class="stat-value">${this.formatMontant(this.stats.totalDebits)} DA</p>
          </div>
        </div>
        
        <div class="stat-card attente">
          <div class="stat-icon">⏳</div>
          <div class="stat-info">
            <h4>À Verser à l'Admin</h4>
            <p class="stat-value">${this.formatMontant(this.stats.montantAPayer)} DA</p>
            <small>${this.stats.transactionsEnAttente} en attente</small>
          </div>
        </div>
        
        <div class="stat-card validee">
          <div class="stat-icon">✅</div>
          <div class="stat-info">
            <h4>Transactions Validées</h4>
            <p class="stat-value">${this.stats.transactionsValidees}</p>
          </div>
        </div>
      </div>
      
      <div class="actions-rapides">
        <button class="btn-primary" id="btn-verser-admin">
          💸 Verser à l'Admin
        </button>
        <button class="btn-secondary" id="btn-voir-historique">
          📊 Voir l'Historique
        </button>
      </div>
    `;
    
    // Event listeners pour les boutons
    setTimeout(() => {
      const btnVerser = document.getElementById('btn-verser-admin');
      if (btnVerser) {
        btnVerser.addEventListener('click', () => this.ouvrirModalVersement());
      }
      
      const btnHistorique = document.getElementById('btn-voir-historique');
      if (btnHistorique) {
        btnHistorique.addEventListener('click', () => this.afficherHistoriqueComplet());
      }
    }, 100);
  }

  afficherTransactions() {
    const transactionsElement = document.getElementById('caisse-transactions-agent');
    if (!transactionsElement) return;

    if (this.transactions.length === 0) {
      transactionsElement.innerHTML = `
        <div class="no-data">
          <p>Aucune transaction pour le moment</p>
        </div>
      `;
      return;
    }

    // Afficher seulement les 10 dernières transactions
    const recentTransactions = this.transactions.slice(0, 10);

    const html = `
      <div class="transactions-container">
        <div class="transactions-header">
          <h3>Dernières Transactions</h3>
        </div>
        
        <div class="transactions-list">
          ${recentTransactions.map(t => this.getTransactionCard(t)).join('')}
        </div>
      </div>
    `;

    transactionsElement.innerHTML = html;
  }

  getTransactionCard(transaction) {
    const date = new Date(transaction.createdAt).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    
    const type = this.getTypeLabel(transaction.typeTransaction);
    const statut = this.getStatutBadge(transaction.statut);
    const montant = this.formatMontant(transaction.montant);
    
    // Déterminer si c'est un crédit ou débit pour cet agent
    const isCredit = transaction.credit_id === this.compte._id;
    const montantClass = isCredit ? 'credit' : 'debit';
    const montantPrefix = isCredit ? '+' : '-';
    
    const autrePartie = isCredit 
      ? transaction.debit_nom || 'N/A'
      : transaction.credit_nom || 'N/A';

    return `
      <div class="transaction-card ${montantClass}">
        <div class="transaction-icon">
          ${isCredit ? '📥' : '📤'}
        </div>
        <div class="transaction-details">
          <div class="transaction-type">${type}</div>
          <div class="transaction-partie">${isCredit ? 'De' : 'Vers'}: ${autrePartie}</div>
          <div class="transaction-date">${date}</div>
        </div>
        <div class="transaction-montant ${montantClass}">
          <span class="montant">${montantPrefix}${montant} DA</span>
          ${statut}
        </div>
      </div>
    `;
  }

  getTypeLabel(type) {
    const labels = {
      'livraison_commercant': 'Livraison Commerçant',
      'retour_vers_agence': 'Frais de Retour',
      'frais_vers_admin': 'Frais vers Admin',
      'virement_manuel': 'Virement',
      'recharge_compte': 'Recharge',
      'retrait_compte': 'Retrait'
    };
    return labels[type] || type;
  }

  getStatutBadge(statut) {
    const badges = {
      'en_attente': '<span class="badge attente">⏳ En attente</span>',
      'validee': '<span class="badge validee">✓ Validée</span>',
      'refusee': '<span class="badge refusee">✗ Refusée</span>',
      'annulee': '<span class="badge annulee">⊗ Annulée</span>'
    };
    return badges[statut] || statut;
  }

  ouvrirModalVersement() {
    // TODO: Ouvrir modal pour effectuer un versement à l'admin
    const montant = prompt('Montant à verser à l\'admin (en DA):');
    if (!montant || isNaN(montant) || montant <= 0) {
      this.afficherErreur('Montant invalide');
      return;
    }
    
    this.creerVersement(parseFloat(montant));
  }

  async creerVersement(montant) {
    try {
      const token = this.getAuthToken();
      
      // Trouver l'ID de l'admin
      // Pour l'instant, on suppose que l'admin a un ID fixe ou on le récupère via API
      const response = await fetch(`${this.apiUrl}/caisse/transaction`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          typeTransaction: 'frais_vers_admin',
          montant: montant,
          debitUserId: this.getUserId(),
          creditUserId: 'ADMIN_USER_ID', // À remplacer par l'ID réel de l'admin
          description: `Versement de ${montant} DA à l'admin`,
          methode: 'manuel'
        })
      });

      const data = await response.json();

      if (data.success) {
        this.afficherSucces('Versement créé avec succès (en attente de validation)');
        await this.chargerDonneesCaisse(this.getUserId());
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('❌ Erreur création versement:', error);
      this.afficherErreur('Erreur lors de la création du versement');
    }
  }

  afficherHistoriqueComplet() {
    // TODO: Afficher toutes les transactions dans un modal ou une section expandée
    console.log('📊 Affichage historique complet...');
  }

  setupEventListeners() {
    const btnRefresh = document.getElementById('btn-refresh-caisse-agent');
    if (btnRefresh) {
      btnRefresh.addEventListener('click', () => {
        this.chargerDonneesCaisse(this.getUserId());
      });
    }
  }

  formatMontant(montant) {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(montant || 0);
  }

  afficherSucces(message) {
    this.afficherNotification(message, 'success');
  }

  afficherErreur(message) {
    this.afficherNotification(message, 'error');
  }

  afficherNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }
}

// Instance globale
let caisseAgent = null;

// Initialisation
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    caisseAgent = new CaisseAgentManager();
  });
} else {
  caisseAgent = new CaisseAgentManager();
}

window.CaisseAgentManager = CaisseAgentManager;
window.caisseAgent = caisseAgent;
