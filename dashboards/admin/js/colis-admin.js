/**
 * Gestion des colis pour l'admin
 * L'admin voit TOUS les colis de tous les commerçants
 */

class ColisAdmin {
  constructor() {
    this.colis = [];
    this.currentPage = 1;
    this.limit = 20;
    this.total = 0;
    this.init();
  }

  init() {
    console.log('🚀 Initialisation Colis Admin');
    this.loadColis();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Bouton rafraîchir (si existe)
    const btnRefresh = document.getElementById('btnRefreshColis');
    if (btnRefresh) {
      btnRefresh.addEventListener('click', () => this.loadColis());
    }

    // Filtres
    const filterStatus = document.getElementById('filterStatus');
    const filterType = document.getElementById('filterType');
    const filterWilaya = document.getElementById('filterWilaya');

    if (filterStatus) {
      filterStatus.addEventListener('change', () => this.loadColis());
    }
    if (filterType) {
      filterType.addEventListener('change', () => this.loadColis());
    }
    if (filterWilaya) {
      filterWilaya.addEventListener('change', () => this.loadColis());
    }
  }

  async loadColis() {
    try {
      console.log('📦 Chargement des colis admin...');

      const token = sessionStorage.getItem('auth_token') || localStorage.getItem('token');
      if (!token) {
        console.error('❌ Token manquant');
        return;
      }

      // Construire les paramètres de filtrage
      const params = new URLSearchParams({
        page: this.currentPage,
        limit: this.limit
      });

      const filterStatus = document.getElementById('filterStatus');
      if (filterStatus && filterStatus.value !== 'all') {
        params.append('status', filterStatus.value);
      }

      const filterWilaya = document.getElementById('filterWilaya');
      if (filterWilaya && filterWilaya.value !== 'all') {
        params.append('wilaya', filterWilaya.value);
      }

      const response = await fetch(`${window.API_CONFIG.API_URL}/colis?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Colis reçus:', data);

      this.colis = data.data || [];
      this.total = data.total || 0;

      this.displayColis();
    } catch (error) {
      console.error('❌ Erreur chargement colis:', error);
      this.showError('Erreur lors du chargement des colis');
    }
  }

  displayColis() {
    const tbody = document.querySelector('#colisTable tbody');
    if (!tbody) {
      console.warn('⚠️ Table colis non trouvée');
      return;
    }

    if (this.colis.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="13" style="text-align: center; padding: 40px; color: #999;">
            📭 Aucun colis trouvé
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = this.colis.map(colis => `
      <tr>
        <td>
          <div class="checkbox-wrapper">
            <input type="checkbox" data-id="${colis._id}" />
          </div>
        </td>
        <td>
          <strong style="color: #16a34a;">${colis.tracking || 'N/A'}</strong>
        </td>
        <td>${colis.expediteur?.nom || 'N/A'}</td>
        <td>${colis.expediteur?.telephone || 'N/A'}</td>
        <td>${colis.destinataire?.nom || 'N/A'}</td>
        <td>${colis.destinataire?.telephone || 'N/A'}</td>
        <td>${this.getWilayaNom(colis.destinataire?.wilaya)}</td>
        <td>${colis.destinataire?.adresse || 'N/A'}</td>
        <td>${this.formatDate(colis.createdAt)}</td>
        <td>${colis.typeLivraison || 'Standard'}</td>
        <td><strong>${colis.montant || 0} DA</strong></td>
        <td>${this.getStatusBadge(colis.status)}</td>
        <td class="text-center">
          <button class="btn-icon" onclick="colisAdmin.viewColis('${colis._id}')" title="Voir">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn-icon" onclick="colisAdmin.editColis('${colis._id}')" title="Modifier">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon btn-danger" onclick="colisAdmin.deleteColis('${colis._id}')" title="Supprimer">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');

    console.log(`✅ ${this.colis.length} colis affichés`);
  }

  getWilayaNom(code) {
    const wilayas = {
      '15': 'Tizi Ouzou',
      '16': 'Alger',
      '06': 'Béjaïa',
      // Ajoutez d'autres wilayas au besoin
    };
    return wilayas[code] || `Wilaya ${code}`;
  }

  getStatusBadge(status) {
    if (!status) status = 'en_attente';
    
    // 🎨 Configuration complète des 13 statuts avec icônes Font Awesome
    const statusConfig = {
      'en_attente': { label: 'En attente', icon: 'clock', color: '#ffa500' },
      'accepte': { label: 'Accepté', icon: 'check-circle', color: '#17a2b8' },
      'en_preparation': { label: 'En préparation', icon: 'boxes', color: '#6c757d' },
      'pret_a_expedier': { label: 'Prêt à expédier', icon: 'box-open', color: '#007bff' },
      'expedie': { label: 'Expédié', icon: 'shipping-fast', color: '#0056b3' },
      'en_transit': { label: 'En transit', icon: 'truck', color: '#5a6268' },
      'arrive_agence': { label: 'Arrivé agence', icon: 'building', color: '#20c997' },
      'en_livraison': { label: 'En livraison', icon: 'truck-loading', color: '#28a745' },
      'livre': { label: 'Livré', icon: 'check-double', color: '#155724' },
      'echec_livraison': { label: 'Échec livraison', icon: 'exclamation-triangle', color: '#dc3545' },
      'en_retour': { label: 'En retour', icon: 'undo', color: '#e83e8c' },
      'retourne': { label: 'Retourné', icon: 'reply', color: '#6f42c1' },
      'annule': { label: 'Annulé', icon: 'times-circle', color: '#721c24' }
    };

    const config = statusConfig[status] || {
      label: status,
      icon: 'question-circle',
      color: '#6c757d'
    };

    return `<span class="badge" style="background-color: ${config.color}; color: white; padding: 6px 12px; border-radius: 12px; font-size: 11px; display: inline-flex; align-items: center; gap: 5px; font-weight: 500;">
      <i class="fas fa-${config.icon}"></i>
      ${config.label}
    </span>`;
  }

  formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  viewColis(id) {
    console.log('👁️ Voir colis:', id);
    // TODO: Afficher modal détails
  }

  editColis(id) {
    console.log('✏️ Modifier colis:', id);
    // TODO: Afficher modal édition
  }

  async deleteColis(id) {
    if (!confirm('Voulez-vous vraiment supprimer ce colis ?')) {
      return;
    }

    try {
      const token = sessionStorage.getItem('auth_token') || localStorage.getItem('token');
      const response = await fetch(`${window.API_CONFIG.API_URL}/colis/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur suppression');
      }

      console.log('✅ Colis supprimé');
      this.loadColis(); // Recharger la liste
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      alert('Erreur lors de la suppression du colis');
    }
  }

  showError(message) {
    const tbody = document.querySelector('#colisTable tbody');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="13" style="text-align: center; padding: 40px; color: #dc3545;">
            ❌ ${message}
          </td>
        </tr>
      `;
    }
  }
}

// Initialiser au chargement de la page
let colisAdmin;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    colisAdmin = new ColisAdmin();
  });
} else {
  colisAdmin = new ColisAdmin();
}
