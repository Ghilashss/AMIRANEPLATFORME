/**
 * ==========================================
 * 💰 GESTION CAISSE AGENT - VERSION SIMPLE
 * ==========================================
 * Utilise l'API uniquement (pas de localStorage)
 * Code simple et maintenable
 */

const CaisseAgent = {
  // Configuration API
  apiUrl: window.API_CONFIG.API_URL,
  
  /**
   * Initialise la section caisse
   */
  async init() {
    console.log('🚀 Initialisation Caisse Agent...');
    
    // Charger les données
    await this.chargerDonnees();
    
    // Attacher les événements
    this.attacherEvenements();
  },

  /**
   * Charge toutes les données de la caisse via l'API
   */
  async chargerDonnees() {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        console.error('❌ Token manquant');
        return;
      }

      // Récupérer la caisse détaillée
      const response = await fetch(`${this.apiUrl}/transactions/caisse-detaillee`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Erreur lors du chargement de la caisse');
      
      const data = await response.json();
      console.log('✅ Données caisse reçues:', data);

      // Mettre à jour l'affichage
      this.afficherStatistiques(data);
      await this.chargerTransactions();

    } catch (error) {
      console.error('❌ Erreur chargement caisse:', error);
      this.afficherErreur('Impossible de charger les données de la caisse');
    }
  },

  /**
   * Affiche les statistiques dans les cards
   */
  afficherStatistiques(data) {
    const { ventilation, solde } = data;

    // Frais Livraison
    document.getElementById('fraisLivraisonCollectes').textContent = 
      this.formatMontant(ventilation.fraisLivraison || 0);

    // Frais Retour
    document.getElementById('fraisRetourCollectes').textContent = 
      this.formatMontant(ventilation.fraisRetour || 0);

    // Montant Colis
    document.getElementById('montantColisCollectes').textContent = 
      this.formatMontant(ventilation.prixColis || 0);

    // Solde Total
    document.getElementById('soldeAgent').textContent = 
      this.formatMontant(solde || 0);

    // Total Collecté
    const totalCollecte = (ventilation.fraisLivraison || 0) + 
                          (ventilation.fraisRetour || 0) + 
                          (ventilation.prixColis || 0);
    document.getElementById('totalCollecteAgent').textContent = 
      this.formatMontant(totalCollecte);

    // Déjà Versé et En Attente (calculés depuis les transactions)
    this.calculerVersements();
  },

  /**
   * Calcule les versements depuis les transactions
   */
  async calculerVersements() {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${this.apiUrl}/transactions?type=versement_agent_admin`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) return;
      
      const transactions = await response.json();
      
      let totalVerse = 0;
      let enAttente = 0;

      transactions.forEach(t => {
        if (t.statut === 'validee') {
          totalVerse += t.montant;
        } else if (t.statut === 'en_attente') {
          enAttente += t.montant;
        }
      });

      document.getElementById('totalVerseAgent').textContent = this.formatMontant(totalVerse);
      document.getElementById('enAttenteAgent').textContent = this.formatMontant(enAttente);

    } catch (error) {
      console.error('❌ Erreur calcul versements:', error);
    }
  },

  /**
   * Charge et affiche les transactions
   */
  async chargerTransactions() {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${this.apiUrl}/transactions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Erreur chargement transactions');
      
      const transactions = await response.json();
      this.afficherTransactions(transactions);

    } catch (error) {
      console.error('❌ Erreur chargement transactions:', error);
    }
  },

  /**
   * Affiche les transactions dans le tableau
   */
  afficherTransactions(transactions) {
    const tbody = document.getElementById('transactions-agent-tbody');
    
    if (!transactions || transactions.length === 0) {
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

    tbody.innerHTML = transactions.map(t => `
      <tr>
        <td><strong>${t.numeroTransaction || 'N/A'}</strong></td>
        <td>${this.formatDate(t.createdAt)}</td>
        <td>${this.formatMontant(t.montant)}</td>
        <td><span class="badge badge-info">${t.methodePaiement || 'Espèces'}</span></td>
        <td>${this.getBadgeStatut(t.statut)}</td>
        <td>${t.description || '-'}</td>
        <td>
          ${t.statut === 'en_attente' ? 
            `<button class="btn-action btn-sm" onclick="CaisseAgent.annulerTransaction('${t._id}')">
              <ion-icon name="close-circle"></ion-icon> Annuler
            </button>` : 
            `<button class="btn-action btn-sm" onclick="CaisseAgent.voirDetails('${t._id}')">
              <ion-icon name="eye"></ion-icon> Voir
            </button>`
          }
        </td>
      </tr>
    `).join('');
  },

  /**
   * Effectuer un versement vers l'admin
   */
  async effectuerVersement() {
    const montant = document.getElementById('montant-versement')?.value;
    const methode = document.getElementById('methode-versement')?.value;

    if (!montant || montant <= 0) {
      alert('⚠️ Veuillez saisir un montant valide');
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${this.apiUrl}/transactions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'versement_agent_admin',
          montant: parseFloat(montant),
          methodePaiement: methode || 'Espèces',
          description: `Versement vers administration`
        })
      });

      if (!response.ok) throw new Error('Erreur lors du versement');

      alert('✅ Versement effectué avec succès!');
      this.fermerModalVersement();
      await this.chargerDonnees();

    } catch (error) {
      console.error('❌ Erreur versement:', error);
      alert('❌ Erreur lors du versement');
    }
  },

  /**
   * Attache les événements
   */
  attacherEvenements() {
    // Bouton verser
    const btnVerser = document.getElementById('btn-verser-agent');
    if (btnVerser) {
      btnVerser.addEventListener('click', () => this.ouvrirModalVersement());
    }

    // Bouton actualiser
    const btnActualiser = document.getElementById('btn-actualiser-caisse-agent');
    if (btnActualiser) {
      btnActualiser.addEventListener('click', () => this.chargerDonnees());
    }

    // Filtres
    const filtreStatut = document.getElementById('filtre-statut-agent');
    if (filtreStatut) {
      filtreStatut.addEventListener('change', () => this.appliquerFiltres());
    }

    const filtrePeriode = document.getElementById('filtre-periode-agent');
    if (filtrePeriode) {
      filtrePeriode.addEventListener('change', () => this.appliquerFiltres());
    }
  },

  /**
   * Applique les filtres sur les transactions
   */
  async appliquerFiltres() {
    const statut = document.getElementById('filtre-statut-agent')?.value;
    const periode = document.getElementById('filtre-periode-agent')?.value;

    let url = `${this.apiUrl}/transactions`;
    const params = new URLSearchParams();

    if (statut) params.append('statut', statut);
    if (periode && periode !== 'tous') {
      // Calculer les dates selon la période
      const dates = this.calculerPeriode(periode);
      if (dates) {
        params.append('dateDebut', dates.debut);
        params.append('dateFin', dates.fin);
      }
    }

    if (params.toString()) url += `?${params.toString()}`;

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Erreur filtrage');
      
      const transactions = await response.json();
      this.afficherTransactions(transactions);

    } catch (error) {
      console.error('❌ Erreur filtrage:', error);
    }
  },

  /**
   * Calcule les dates de début et fin selon la période
   */
  calculerPeriode(periode) {
    const now = new Date();
    let debut;

    switch(periode) {
      case 'aujourdhui':
        debut = new Date(now.setHours(0, 0, 0, 0));
        break;
      case '7jours':
        debut = new Date(now.setDate(now.getDate() - 7));
        break;
      case '30jours':
        debut = new Date(now.setDate(now.getDate() - 30));
        break;
      case 'mois':
        debut = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        return null;
    }

    return {
      debut: debut.toISOString(),
      fin: new Date().toISOString()
    };
  },

  /**
   * Ouvre le modal de versement
   */
  ouvrirModalVersement() {
    const modal = document.getElementById('modal-versement-agent');
    if (modal) {
      modal.style.display = 'flex';
    }
  },

  /**
   * Ferme le modal de versement
   */
  fermerModalVersement() {
    const modal = document.getElementById('modal-versement-agent');
    if (modal) {
      modal.style.display = 'none';
      // Reset form
      const form = document.getElementById('form-versement-agent');
      if (form) form.reset();
    }
  },

  /**
   * Utilitaires de formatage
   */
  formatMontant(montant) {
    return `${parseFloat(montant || 0).toLocaleString('fr-DZ')} DA`;
  },

  formatDate(date) {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  getBadgeStatut(statut) {
    const badges = {
      'validee': '<span class="badge badge-success">✓ Validée</span>',
      'en_attente': '<span class="badge badge-warning">⏳ En attente</span>',
      'refusee': '<span class="badge badge-danger">✗ Refusée</span>',
      'annulee': '<span class="badge badge-secondary">⊗ Annulée</span>'
    };
    return badges[statut] || '<span class="badge badge-secondary">-</span>';
  },

  afficherErreur(message) {
    console.error('❌', message);
    // Afficher un toast ou notification
  }
};

// Auto-initialisation quand la page caisse est visible
document.addEventListener('DOMContentLoaded', () => {
  // Écouter les changements de page
  const observer = new MutationObserver(() => {
    const caisseSection = document.getElementById('caisse-agent');
    if (caisseSection && caisseSection.classList.contains('active')) {
      CaisseAgent.init();
    }
  });

  // Observer le conteneur principal
  const mainContent = document.querySelector('.main-content');
  if (mainContent) {
    observer.observe(mainContent, { childList: true, subtree: true });
  }
});

// Export global
window.CaisseAgent = CaisseAgent;
