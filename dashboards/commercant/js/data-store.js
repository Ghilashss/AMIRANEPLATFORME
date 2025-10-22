// Gestionnaire de données
import { CONFIG } from './config.js';
import { Utils } from './utils.js';

export class DataStore {
  static colis = [];
  static transactions = [];
  static stats = {};

  static async init() {
    // Vérifier l'authentification
    if (!Utils.checkAuth()) {
      return;
    }

    // Charger les données initiales
    await this.loadColis();
    await this.loadTransactions();
    await this.loadStats();
  }

  // ===== COLIS =====
  static async loadColis() {
    try {
      const response = await fetch(`${CONFIG.API_URL}/colis`, {
        headers: {
          'Authorization': `Bearer ${Utils.getToken()}`
        }
      });

      if (!response.ok) throw new Error('Erreur de chargement');

      const data = await response.json();
      this.colis = data.data || [];
      
      // Filtrer uniquement les colis du commerçant
      const user = Utils.getUser();
      this.colis = this.colis.filter(c => c.createdBy === 'commercant' || c.commercantId === user._id);
      
      return this.colis;
    } catch (error) {
      console.error('Erreur chargement colis:', error);
      Utils.showNotification('Erreur de chargement des colis', 'error');
      return [];
    }
  }

  static async addColis(colisData) {
    try {
      const user = Utils.getUser();
      const newColis = {
        ...colisData,
        createdBy: 'commercant',
        commercantId: user._id,
        statut: 'enCours',
        dateCrea: new Date().toISOString()
      };

      const response = await fetch(`${CONFIG.API_URL}/colis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Utils.getToken()}`
        },
        body: JSON.stringify(newColis)
      });

      if (!response.ok) throw new Error('Erreur de création');

      const data = await response.json();
      this.colis.unshift(data.data);
      
      Utils.showNotification('Colis créé avec succès', 'success');
      return data.data;
    } catch (error) {
      console.error('Erreur création colis:', error);
      Utils.showNotification('Erreur lors de la création du colis', 'error');
      throw error;
    }
  }

  static async updateColis(id, colisData) {
    try {
      const response = await fetch(`${CONFIG.API_URL}/colis/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Utils.getToken()}`
        },
        body: JSON.stringify(colisData)
      });

      if (!response.ok) throw new Error('Erreur de modification');

      const data = await response.json();
      const index = this.colis.findIndex(c => c._id === id);
      if (index !== -1) {
        this.colis[index] = data.data;
      }
      
      Utils.showNotification('Colis modifié avec succès', 'success');
      return data.data;
    } catch (error) {
      console.error('Erreur modification colis:', error);
      Utils.showNotification('Erreur lors de la modification', 'error');
      throw error;
    }
  }

  static async deleteColis(id) {
    try {
      const response = await fetch(`${CONFIG.API_URL}/colis/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${Utils.getToken()}`
        }
      });

      if (!response.ok) throw new Error('Erreur de suppression');

      this.colis = this.colis.filter(c => c._id !== id);
      Utils.showNotification('Colis supprimé avec succès', 'success');
      return true;
    } catch (error) {
      console.error('Erreur suppression colis:', error);
      Utils.showNotification('Erreur lors de la suppression', 'error');
      throw error;
    }
  }

  // ===== STATISTIQUES =====
  static async loadStats() {
    try {
      const totalColis = this.colis.length;
      const colisTransit = this.colis.filter(c => c.statut === 'enTransit').length;
      const colisLivres = this.colis.filter(c => c.statut === 'livre').length;
      const colisAttente = this.colis.filter(c => c.statut === 'enCours').length;
      const colisRetours = this.colis.filter(c => c.statut === 'retour').length;

      const totalCA = this.colis.reduce((sum, c) => sum + (parseFloat(c.montantColis) || 0), 0);
      
      const totalACollecter = this.colis
        .filter(c => c.statut === 'livre')
        .reduce((sum, c) => sum + (parseFloat(c.montantColis) || 0), 0);

      const totalVerse = this.transactions
        .filter(t => t.statut === 'validee')
        .reduce((sum, t) => sum + (parseFloat(t.montant) || 0), 0);

      const enAttente = this.transactions
        .filter(t => t.statut === 'en_attente')
        .reduce((sum, t) => sum + (parseFloat(t.montant) || 0), 0);

      this.stats = {
        totalColis,
        colisTransit,
        colisLivres,
        colisAttente,
        colisRetours,
        chiffreAffaires: totalCA,
        totalACollecter,
        totalVerse,
        enAttente,
        solde: totalACollecter - totalVerse - enAttente
      };

      return this.stats;
    } catch (error) {
      console.error('Erreur calcul stats:', error);
      return {};
    }
  }

  static updateColisTable() {
    const tbody = document.getElementById('colisTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (this.colis.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="10" style="text-align: center; padding: 40px; color: #999;">
            <i class="fas fa-box-open" style="font-size: 48px; margin-bottom: 10px; display: block;"></i>
            Aucun colis trouvé
          </td>
        </tr>
      `;
      return;
    }

    this.colis.forEach((colis, index) => {
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

  static updateDashboardStats() {
    // Mettre à jour les compteurs
    document.getElementById('totalColis').textContent = this.stats.totalColis || 0;
    document.getElementById('colisTransit').textContent = this.stats.colisTransit || 0;
    document.getElementById('colisLivres').textContent = this.stats.colisLivres || 0;
    document.getElementById('chiffreAffaires').textContent = `${this.stats.chiffreAffaires || 0} DA`;

    // Page Mes Colis
    if (document.getElementById('totalColisPage')) {
      document.getElementById('totalColisPage').textContent = this.stats.totalColis || 0;
      document.getElementById('colisTransitPage').textContent = this.stats.colisTransit || 0;
      document.getElementById('colisAttentePage').textContent = this.stats.colisAttente || 0;
      document.getElementById('colisRetoursPage').textContent = this.stats.colisRetours || 0;
    }
  }
}

export default DataStore;
