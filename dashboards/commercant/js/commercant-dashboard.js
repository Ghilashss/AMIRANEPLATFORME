// Dashboard Commerçant - Script Principal
import { CONFIG } from './config.js';
import { Utils } from './utils.js';
import { NavigationManager } from './nav-manager.js';
import { DataStore } from './data-store.js';

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log('🚀 Initialisation du dashboard commerçant...');

    // Vérifier l'authentification
    if (!Utils.checkAuth()) {
      return;
    }

    // Initialiser les gestionnaires
    const navManager = new NavigationManager();
    navManager.init();
    console.log('✅ Navigation initialisée');

    // Initialiser le DataStore
    await DataStore.init();
    console.log('✅ DataStore initialisé');

    // Mettre à jour les statistiques
    await DataStore.loadStats();
    DataStore.updateDashboardStats();
    console.log('✅ Statistiques chargées');

    // Mettre à jour les tableaux
    DataStore.updateColisTable();
    DataStore.updateTransactionsTable();
    console.log('✅ Tableaux mis à jour');

    // Initialiser les événements
    initEvents();
    console.log('✅ Événements initialisés');

    // Initialiser les graphiques
    initCharts();
    console.log('✅ Graphiques initialisés');

    // Initialiser les modales
    initModals();
    console.log('✅ Modales initialisées');

    console.log('🎉 Dashboard commerçant prêt !');

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    Utils.showNotification('Erreur lors de l\'initialisation', 'error');
  }
});

// Initialiser les événements
function initEvents() {
  // Bouton ajouter colis
  const addColisBtn = document.getElementById('addColisBtn');
  if (addColisBtn) {
    addColisBtn.addEventListener('click', () => {
      openModal('colisModal');
    });
  }

  // Bouton effectuer versement
  const effectuerVersement = document.getElementById('effectuerVersement');
  if (effectuerVersement) {
    effectuerVersement.addEventListener('click', () => {
      openModal('versementModal');
    });
  }

  // Formulaire colis
  const colisForm = document.getElementById('colisForm');
  if (colisForm) {
    colisForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleColisFormSubmit(colisForm);
    });
  }

  // Formulaire versement
  const versementForm = document.getElementById('versementForm');
  if (versementForm) {
    versementForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleVersementFormSubmit(versementForm);
    });
  }

  // Formulaire profil
  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      Utils.showNotification('Profil mis à jour', 'success');
    });
  }

  // Recherche colis
  const searchInput = document.getElementById('colisSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      filterColisTable(e.target.value);
    });
  }

  // Filtres
  const filterStatut = document.getElementById('filterStatut');
  if (filterStatut) {
    filterStatut.addEventListener('change', () => applyFilters());
  }

  const filterDate = document.getElementById('filterDate');
  if (filterDate) {
    filterDate.addEventListener('change', () => applyFilters());
  }

  const filterWilaya = document.getElementById('filterWilaya');
  if (filterWilaya) {
    filterWilaya.addEventListener('change', () => applyFilters());
  }

  // Écouter les changements de page
  document.addEventListener('pageChanged', async (e) => {
    const pageId = e.detail.pageId;
    await handlePageChange(pageId);
  });
}

// Gérer les changements de page
async function handlePageChange(pageId) {
  switch(pageId) {
    case 'dashboard':
      await DataStore.loadStats();
      DataStore.updateDashboardStats();
      initCharts();
      break;
    case 'mes-colis':
      await DataStore.loadColis();
      await DataStore.loadStats();
      DataStore.updateDashboardStats();
      DataStore.updateColisTable();
      break;
  }
}

// Soumettre le formulaire colis
async function handleColisFormSubmit(form) {
  try {
    const formData = new FormData(form);
    const colisData = {
      nomClient: formData.get('nomClient') || document.getElementById('nomClient').value,
      telClient: formData.get('telClient') || document.getElementById('telClient').value,
      wilayaDest: formData.get('wilayaDest') || document.getElementById('wilayaDest').value,
      adresseDest: formData.get('adresseDest') || document.getElementById('adresseDest').value,
      description: formData.get('description') || document.getElementById('description').value,
      poidsColis: formData.get('poidsColis') || document.getElementById('poidsColis').value,
      montantColis: formData.get('montantColis') || document.getElementById('montantColis').value,
      typelivraison: formData.get('typelivraison') || document.getElementById('typelivraison').value
    };

    await DataStore.addColis(colisData);
    
    form.reset();
    closeModal('colisModal');
    
    await DataStore.loadColis();
    await DataStore.loadStats();
    DataStore.updateDashboardStats();
    DataStore.updateColisTable();
    
  } catch (error) {
    console.error('Erreur soumission formulaire:', error);
  }
}

// Soumettre le formulaire versement
async function handleVersementFormSubmit(form) {
  try {
    const formData = new FormData(form);
    const versementData = {
      montant: formData.get('montantVersement') || document.getElementById('montantVersement').value,
      methode: formData.get('methodePaiement') || document.getElementById('methodePaiement').value,
      note: formData.get('noteVersement') || document.getElementById('noteVersement').value,
      statut: 'en_attente',
      date: new Date().toISOString()
    };

    await DataStore.createVersement(versementData);
    
    form.reset();
    closeModal('versementModal');
    
    await DataStore.loadTransactions();
    await DataStore.loadStats();
    DataStore.updateDashboardStats();
    DataStore.updateTransactionsTable();
    
  } catch (error) {
    console.error('Erreur soumission versement:', error);
  }
}

// Filtrer le tableau des colis
function filterColisTable(searchTerm) {
  const tbody = document.getElementById('colisTableBody');
  if (!tbody) return;

  const rows = tbody.querySelectorAll('tr');
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm.toLowerCase()) ? '' : 'none';
  });
}

// Appliquer les filtres
function applyFilters() {
  const statutFilter = document.getElementById('filterStatut')?.value || 'all';
  const dateFilter = document.getElementById('filterDate')?.value || 'all';
  const wilayaFilter = document.getElementById('filterWilaya')?.value || 'all';

  let filtered = [...DataStore.colis];

  if (statutFilter !== 'all') {
    filtered = filtered.filter(c => c.statut === statutFilter);
  }

  if (wilayaFilter !== 'all') {
    filtered = filtered.filter(c => c.wilayaDest === wilayaFilter);
  }

  if (dateFilter !== 'all') {
    const today = new Date();
    filtered = filtered.filter(c => {
      const colisDate = new Date(c.dateCrea);
      switch(dateFilter) {
        case 'today':
          return colisDate.toDateString() === today.toDateString();
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          return colisDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          return colisDate >= monthAgo;
        default:
          return true;
      }
    });
  }

  // Mettre à jour le tableau avec les données filtrées
  const tbody = document.getElementById('colisTableBody');
  if (!tbody) return;

  tbody.innerHTML = '';
  filtered.forEach(colis => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="checkbox" /></td>
      <td>${colis.codeSuivi || 'N/A'}</td>
      <td>${colis.nomClient || 'N/A'}</td>
      <td>${colis.telClient || 'N/A'}</td>
      <td>${colis.wilayaDest || 'N/A'}</td>
      <td>${colis.adresseDest || 'N/A'}</td>
      <td>${Utils.formatDate(colis.dateCrea)}</td>
      <td>${colis.montantColis || 0} DA</td>
      <td>${Utils.getColisStatusBadge(colis.statut || colis.status)}</td>
      <td class="text-center">
        <button class="action-btn view" onclick="window.viewColis('${colis._id}')" title="Voir">
          <i class="fas fa-eye"></i>
        </button>
        <button class="action-btn print" onclick="window.printColis('${colis._id}')" title="Imprimer">
          <i class="fas fa-print"></i>
        </button>
        <button class="action-btn edit" onclick="window.editColis('${colis._id}')" title="Modifier">
          <i class="fas fa-edit"></i>
        </button>
        <button class="action-btn delete" onclick="window.deleteColis('${colis._id}')" title="Supprimer">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Initialiser les graphiques
function initCharts() {
  // Graphique évolution des colis
  const colisChartCanvas = document.getElementById('colisChart');
  if (colisChartCanvas) {
    const ctx = colisChartCanvas.getContext('2d');
    if (window.colisChartInstance) window.colisChartInstance.destroy();
    
    window.colisChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
        datasets: [{
          label: 'Colis créés',
          data: [12, 19, 15, 25, 22, 30],
          borderColor: '#0b2b24',
          backgroundColor: 'rgba(11, 43, 36, 0.1)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

  // Graphique statuts
  const statusChartCanvas = document.getElementById('statusChart');
  if (statusChartCanvas) {
    const ctx = statusChartCanvas.getContext('2d');
    if (window.statusChartInstance) window.statusChartInstance.destroy();
    
    window.statusChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['En cours', 'En transit', 'Livrés', 'Retours'],
        datasets: [{
          data: [
            DataStore.stats.colisAttente || 0,
            DataStore.stats.colisTransit || 0,
            DataStore.stats.colisLivres || 0,
            DataStore.stats.colisRetours || 0
          ],
          backgroundColor: ['#ffc107', '#17a2b8', '#28a745', '#dc3545']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true
      }
    });
  }
}

// Initialiser les modales
function initModals() {
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    const closeBtn = modal.querySelector('.close-button');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
      });
    }

    // Fermer en cliquant à l'extérieur
    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  });
}

// Ouvrir une modale
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'flex';
  }
}

// Fermer une modale
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
  }
}

// Fonctions globales pour les actions
window.viewColis = (id) => {
  const colis = DataStore.colis.find(c => c._id === id);
  if (colis) {
    alert(`Détails du colis:\n${JSON.stringify(colis, null, 2)}`);
  }
};

window.editColis = (id) => {
  Utils.showNotification('Fonction en développement', 'info');
};

window.deleteColis = async (id) => {
  if (confirm('Voulez-vous vraiment supprimer ce colis ?')) {
    try {
      await DataStore.deleteColis(id);
      await DataStore.loadStats();
      DataStore.updateDashboardStats();
      DataStore.updateColisTable();
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  }
};

window.viewTransaction = (id) => {
  const transaction = DataStore.transactions.find(t => t._id === id);
  if (transaction) {
    alert(`Détails de la transaction:\n${JSON.stringify(transaction, null, 2)}`);
  }
};
