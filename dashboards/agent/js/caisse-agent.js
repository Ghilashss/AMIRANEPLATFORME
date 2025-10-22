/**
 * Gestion de la Caisse Agent
 * Permet aux agents de:
 * - Voir leurs collectes (frais livraison, frais retour, montant colis)
 * - Créer des versements vers Admin
 * - Suivre l'historique des transactions
 */

const CaisseAgent = {
  API_URL: 'http://localhost:1000/api',
  transactions: [],
  caisse: null,

  /**
   * Initialisation de la caisse agent
   */
  async init() {
    console.log('💰 Initialisation Caisse Agent...');
    try {
      await this.loadSoldeCaisse();
      await this.loadTransactions();
      this.initEvents();
      this.updateUI();
      
      // Écouter l'événement de mise à jour de la caisse
      document.addEventListener('caisseUpdated', () => {
        console.log('🔔 Événement caisseUpdated reçu - Rechargement caisse...');
        this.refresh();
      });
      
      console.log('✅ Caisse Agent initialisée');
    } catch (error) {
      console.error('❌ Erreur initialisation caisse agent:', error);
      showErrorMessage('Erreur lors du chargement de la caisse');
    }
  },

  /**
   * Récupération du solde de caisse
   */
  async loadSoldeCaisse() {
    try {
      const token = sessionStorage.getItem('auth_token') || localStorage.getItem('agent_token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      const response = await fetch(`${this.API_URL}/transactions/caisse?userId=${user._id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erreur chargement caisse');
      }

      this.caisse = await response.json();
      console.log('💰 Caisse chargée:', this.caisse);
    } catch (error) {
      console.error('❌ Erreur loadSoldeCaisse:', error);
      throw error;
    }
  },

  /**
   * Récupération des transactions
   */
  async loadTransactions() {
    try {
      console.log('🔍 Début chargement transactions...');
      const token = sessionStorage.getItem('auth_token') || localStorage.getItem('agent_token');
      
      const response = await fetch(`${this.API_URL}/transactions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Réponse API transactions:', response.status);

      if (!response.ok) {
        throw new Error('Erreur chargement transactions');
      }

      const data = await response.json();
      console.log('📦 Données reçues:', data);
      
      // Le backend retourne { success: true, data: [...], count: X }
      this.transactions = data.data || data.transactions || [];
      console.log(`📋 ${this.transactions.length} transactions chargées`);
      console.log('📋 Détails transactions:', this.transactions);
    } catch (error) {
      console.error('❌ Erreur loadTransactions:', error);
      throw error;
    }
  },

  /**
   * Initialisation des événements
   */
  initEvents() {
    // Bouton verser
    const btnVerser = document.getElementById('btn-verser-agent');
    if (btnVerser) {
      btnVerser.onclick = () => this.openModalVersement();
    }

    // Bouton actualiser
    const btnActualiser = document.getElementById('btn-actualiser-caisse-agent');
    if (btnActualiser) {
      btnActualiser.onclick = () => this.refresh();
    }

    // Filtres
    const filtreStatut = document.getElementById('filtre-statut-agent');
    const filtrePeriode = document.getElementById('filtre-periode-agent');
    
    if (filtreStatut) {
      filtreStatut.onchange = () => this.updateTransactionsTable();
    }
    if (filtrePeriode) {
      filtrePeriode.onchange = () => this.updateTransactionsTable();
    }

    // Formulaire de versement
    const formVersement = document.getElementById('form-versement-agent');
    if (formVersement) {
      formVersement.onsubmit = (e) => this.handleVersementSubmit(e);
    }
  },

  /**
   * Rafraîchissement complet
   */
  async refresh() {
    console.log('🔄 Actualisation caisse agent...');
    try {
      await this.loadSoldeCaisse();
      await this.loadTransactions();
      this.updateUI();
      showSuccessMessage('Caisse actualisée');
    } catch (error) {
      console.error('❌ Erreur refresh:', error);
      showErrorMessage('Erreur lors de l\'actualisation');
    }
  },

  /**
   * Mise à jour de l'interface
   */
  updateUI() {
    this.updateBalanceCards();
    this.updateCollecteDetails();
    this.updateTransactionsTable();
  },

  /**
   * Mise à jour des cartes de balance
   */
  updateBalanceCards() {
    if (!this.caisse) return;

    // Frais de livraison
    const fraisLivraisonEl = document.getElementById('fraisLivraisonCollectes');
    if (fraisLivraisonEl) {
      fraisLivraisonEl.textContent = this.formatMontant(this.caisse.fraisLivraisonCollectes || 0);
    }

    // Frais de retour
    const fraisRetourEl = document.getElementById('fraisRetourCollectes');
    if (fraisRetourEl) {
      fraisRetourEl.textContent = this.formatMontant(this.caisse.fraisRetourCollectes || 0);
    }

    // Montant des colis
    const montantColisEl = document.getElementById('montantColisCollectes');
    if (montantColisEl) {
      montantColisEl.textContent = this.formatMontant(this.caisse.montantColisCollectes || 0);
    }

    // Solde total
    const soldeEl = document.getElementById('soldeAgent');
    if (soldeEl) {
      soldeEl.textContent = this.formatMontant(this.caisse.soldeActuel || 0);
    }
  },

  /**
   * Mise à jour des détails de collecte
   */
  updateCollecteDetails() {
    if (!this.caisse) return;

    // Total collecté
    const totalCollecteEl = document.getElementById('totalCollecteAgent');
    if (totalCollecteEl) {
      totalCollecteEl.textContent = this.formatMontant(this.caisse.totalCollecte || 0);
    }

    // Total versé
    const totalVerseEl = document.getElementById('totalVerseAgent');
    if (totalVerseEl) {
      totalVerseEl.textContent = this.formatMontant(this.caisse.totalVerse || 0);
    }

    // En attente
    const enAttenteEl = document.getElementById('enAttenteAgent');
    if (enAttenteEl) {
      enAttenteEl.textContent = this.formatMontant(this.caisse.totalEnAttente || 0);
    }
  },

  /**
   * Mise à jour du tableau des transactions
   */
  updateTransactionsTable() {
    console.log('🔄 Mise à jour du tableau des transactions...');
    const tbody = document.getElementById('transactions-agent-tbody');
    if (!tbody) {
      console.error('❌ Element transactions-agent-tbody non trouvé');
      return;
    }

    console.log('📊 Nombre total de transactions:', this.transactions.length);

    // Récupération des filtres
    const filtreStatut = document.getElementById('filtre-statut-agent')?.value || '';
    const filtrePeriode = document.getElementById('filtre-periode-agent')?.value || 'tous';
    console.log('🔍 Filtres appliqués - Statut:', filtreStatut, '| Période:', filtrePeriode);

    // Filtrage des transactions
    let transactionsFiltrees = this.getFilteredTransactions(filtreStatut, filtrePeriode);
    console.log('📋 Transactions après filtrage:', transactionsFiltrees.length);

    // Tri par date décroissante
    transactionsFiltrees.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Affichage
    if (transactionsFiltrees.length === 0) {
      console.log('⚠️  Aucune transaction à afficher');
      tbody.innerHTML = `
        <tr class="empty-state">
          <td colspan="7">
            <div class="empty-illustration">
              <ion-icon name="receipt-outline"></ion-icon>
              <h3>Aucune transaction trouvée</h3>
              <p>Vos transactions apparaîtront ici</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    console.log('✅ Affichage de', transactionsFiltrees.length, 'transactions dans le tableau');
    tbody.innerHTML = transactionsFiltrees.map(transaction => `
      <tr>
        <td>#${transaction.numeroTransaction || 'N/A'}</td>
        <td>${this.formatDate(transaction.createdAt)}</td>
        <td><strong style="color: #10b981; font-size: 15px;">${this.formatMontant(transaction.montant)}</strong></td>
        <td>${this.getMethodeLabel(transaction.methodePaiement)}</td>
        <td>
          <span class="status-badge ${this.getStatutClass(transaction.statut)}">
            ${this.getStatutLabel(transaction.statut)}
          </span>
        </td>
        <td>${transaction.description || '-'}</td>
        <td>
          <div class="action-buttons">
            <button 
              class="action-btn-small btn-view"
              onclick="CaisseAgent.voirDetailsTransaction('${transaction._id}')"
              title="Voir détails"
            >
              <ion-icon name="eye"></ion-icon>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  },

  /**
   * Filtrage des transactions
   */
  getFilteredTransactions(statutFiltre, periodeFiltre) {
    let filtered = [...this.transactions];

    // Filtre par statut
    if (statutFiltre) {
      filtered = filtered.filter(t => t.statut === statutFiltre);
    }

    // Filtre par période
    if (periodeFiltre && periodeFiltre !== 'tous') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.createdAt);
        
        switch (periodeFiltre) {
          case 'aujourdhui':
            return transactionDate >= today;
          case '7jours':
            const week = new Date(today);
            week.setDate(week.getDate() - 7);
            return transactionDate >= week;
          case '30jours':
            const month = new Date(today);
            month.setDate(month.getDate() - 30);
            return transactionDate >= month;
          case 'mois':
            return transactionDate.getMonth() === now.getMonth() && 
                   transactionDate.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    }

    return filtered;
  },

  /**
   * Ouverture du modal de versement
   */
  openModalVersement() {
    const modal = document.getElementById('modal-versement-agent');
    if (!modal) return;

    // Calcul du montant suggéré (frais livraison + frais retour)
    const montantSuggere = (this.caisse?.fraisLivraisonCollectes || 0) + 
                           (this.caisse?.fraisRetourCollectes || 0);

    // Pré-remplissage du montant
    const montantInput = document.getElementById('montant-versement-agent');
    if (montantInput && montantSuggere > 0) {
      montantInput.value = montantSuggere;
    }

    // Affichage du modal
    modal.style.display = 'flex';
  },

  /**
   * Fermeture du modal de versement
   */
  closeModalVersement() {
    const modal = document.getElementById('modal-versement-agent');
    if (!modal) return;

    modal.style.display = 'none';
    
    // Réinitialisation du formulaire
    const form = document.getElementById('form-versement-agent');
    if (form) {
      form.reset();
    }
  },

  /**
   * Soumission du formulaire de versement
   */
  async handleVersementSubmit(e) {
    e.preventDefault();

    const montant = parseFloat(document.getElementById('montant-versement-agent').value);
    const methodePaiement = document.getElementById('methode-paiement-agent').value;
    const reference = document.getElementById('reference-agent').value;
    const description = document.getElementById('description-agent').value;

    // Validation
    if (!montant || montant <= 0) {
      showErrorMessage('Veuillez saisir un montant valide');
      return;
    }

    if (!methodePaiement) {
      showErrorMessage('Veuillez sélectionner une méthode de paiement');
      return;
    }

    // Confirmation
    if (!confirm(`Confirmer le versement de ${this.formatMontant(montant)} vers l'administration ?`)) {
      return;
    }

    try {
      await this.createVersement({
        montant,
        methodePaiement,
        reference,
        description
      });

      showSuccessMessage('Versement créé avec succès');
      this.closeModalVersement();
      await this.refresh();
    } catch (error) {
      console.error('❌ Erreur création versement:', error);
      showErrorMessage(error.message || 'Erreur lors de la création du versement');
    }
  },

  /**
   * Création d'un versement
   */
  async createVersement(data) {
    try {
      const token = sessionStorage.getItem('auth_token') || localStorage.getItem('agent_token');
      const user = JSON.parse(localStorage.getItem('user'));

      // Récupération des infos admin (premier admin trouvé)
      const adminsResponse = await fetch(`${this.API_URL}/auth/users?role=admin`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!adminsResponse.ok) {
        throw new Error('Impossible de récupérer les informations administrateur');
      }

      const adminsData = await adminsResponse.json();
      const admin = adminsData.data?.[0]; // Correction: data au lieu de users

      if (!admin) {
        throw new Error('Aucun administrateur trouvé');
      }

      // Création de la transaction
      const transactionData = {
        type: 'versement_agent_admin',
        montant: data.montant,
        emetteur: {
          id: user._id,
          nom: user.nom,
          email: user.email,
          role: user.role
        },
        destinataire: {
          id: admin._id,
          nom: admin.nom,
          email: admin.email,
          role: admin.role
        },
        methodePaiement: data.methodePaiement,
        description: data.description || `Versement agent ${user.nom}`,
        metadata: {
          reference: data.reference || '',
          fraisLivraison: this.caisse?.fraisLivraisonCollectes || 0,
          fraisRetour: this.caisse?.fraisRetourCollectes || 0
        }
      };

      console.log('📤 Envoi de la transaction:', transactionData);

      const response = await fetch(`${this.API_URL}/transactions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(transactionData)
      });

      console.log('📡 Réponse serveur:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Détails erreur serveur:', errorData);
        throw new Error(errorData.message || errorData.error || 'Erreur création transaction');
      }

      const result = await response.json();
      console.log('✅ Versement créé:', result);
      console.log('🔄 Ajout de la transaction dans le tableau local...');
      
      // Ajouter la transaction au tableau local immédiatement
      if (result.data) {
        this.transactions.push(result.data);
        console.log('✅ Transaction ajoutée au tableau local. Total:', this.transactions.length);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Erreur createVersement:', error);
      console.error('❌ Message:', error.message);
      throw error;
    }
  },

  /**
   * Affichage des détails d'une transaction
   */
  async voirDetailsTransaction(transactionId) {
    const transaction = this.transactions.find(t => t._id === transactionId);
    if (!transaction) return;

    const details = `
      ═══════════════════════════════════
      📋 DÉTAILS DE LA TRANSACTION
      ═══════════════════════════════════
      
      N° Transaction: ${transaction.numeroTransaction || 'N/A'}
      Date: ${this.formatDateLong(transaction.createdAt)}
      
      Type: ${this.getTypeLabel(transaction.type)}
      Montant: ${this.formatMontant(transaction.montant)}
      Méthode: ${this.getMethodeLabel(transaction.methodePaiement)}
      
      Statut: ${this.getStatutLabel(transaction.statut)}
      ${transaction.statut === 'refusee' && transaction.motifRefus ? 
        `\n⚠️ Motif du refus:\n${transaction.motifRefus}` : ''}
      
      ${transaction.description ? `\nDescription:\n${transaction.description}` : ''}
      
      ${transaction.metadata?.reference ? 
        `\nRéférence: ${transaction.metadata.reference}` : ''}
      
      ${transaction.metadata?.fraisLivraison || transaction.metadata?.fraisRetour ? 
        `\nDétail des frais:
         - Frais de livraison: ${this.formatMontant(transaction.metadata.fraisLivraison || 0)}
         - Frais de retour: ${this.formatMontant(transaction.metadata.fraisRetour || 0)}` : ''}
      
      ═══════════════════════════════════
    `;

    alert(details);
  },

  /**
   * Formatage des montants
   */
  formatMontant(montant) {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(montant || 0);
  },

  /**
   * Formatage des dates
   */
  formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  },

  /**
   * Formatage des dates (long)
   */
  formatDateLong(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  },

  /**
   * Libellé du type de transaction
   */
  getTypeLabel(type) {
    const types = {
      'versement_agent_admin': 'Versement vers Admin',
      'versement_commercant_agent': 'Versement du Commerçant',
      'paiement_commercant': 'Paiement Commerçant',
      'retrait': 'Retrait'
    };
    return types[type] || type;
  },

  /**
   * Libellé du statut
   */
  getStatutLabel(statut) {
    const statuts = {
      'en_attente': 'En attente',
      'validee': 'Validée',
      'refusee': 'Refusée',
      'annulee': 'Annulée'
    };
    return statuts[statut] || statut;
  },

  /**
   * Classe CSS du statut (adapté au nouveau design)
   */
  getStatutClass(statut) {
    const classes = {
      'en_attente': 'inactif',  // Badge orange/rouge
      'validee': 'actif',        // Badge vert
      'refusee': 'inactif',      // Badge rouge
      'annulee': 'inactif'       // Badge rouge
    };
    return classes[statut] || 'inactif';
  },

  /**
   * Libellé de la méthode de paiement
   */
  getMethodeLabel(methode) {
    const methodes = {
      'especes': 'Espèces',
      'virement': 'Virement',
      'cheque': 'Chèque',
      'carte_bancaire': 'Carte bancaire'
    };
    return methodes[methode] || methode;
  }
};

/**
 * Fonctions globales pour les événements inline
 */
function closeModalVersementAgent() {
  CaisseAgent.closeModalVersement();
}

/**
 * Messages de notification
 */
function showSuccessMessage(message) {
  // Implémentation simple avec alert
  // TODO: Utiliser un système de notifications plus élaboré
  console.log('✅', message);
  alert('✅ ' + message);
}

function showErrorMessage(message) {
  // Implémentation simple avec alert
  // TODO: Utiliser un système de notifications plus élaboré
  console.error('❌', message);
  alert('❌ ' + message);
}

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CaisseAgent;
}
