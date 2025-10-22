// Utilitaires
export class Utils {
  static showNotification(message, type = 'info') {
    // Créer une notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  static formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR');
  }

  static formatCurrency(amount) {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD'
    }).format(amount);
  }

  static getStatusClass(status) {
    const statusMap = {
      'enCours': 'enCours',
      'enTransit': 'enTransit',
      'livre': 'livre',
      'retour': 'retour',
      'en_attente': 'en_attente',
      'validee': 'validee',
      'annulee': 'annulee'
    };
    return statusMap[status] || status;
  }

  // ✅ NOUVEAU: Fonction pour le design des statuts de colis
  static getColisStatusBadge(status) {
    if (!status) status = 'en_attente';
    
    const statusConfig = {
      'en_attente': {
        label: '⏳ En attente',
        class: 'status-en-attente',
        color: '#ffa500'
      },
      'accepte': {
        label: '✅ Accepté',
        class: 'status-accepte',
        color: '#28a745'
      },
      'en_preparation': {
        label: '📦 En préparation',
        class: 'status-preparation',
        color: '#17a2b8'
      },
      'pret_a_expedier': {
        label: '🎯 Prêt à expédier',
        class: 'status-pret',
        color: '#007bff'
      },
      'expedie': {
        label: '🚚 Expédié',
        class: 'status-expedie',
        color: '#6f42c1'
      },
      'en_transit': {
        label: '🛣️ En transit',
        class: 'status-transit',
        color: '#fd7e14'
      },
      'arrive_agence': {
        label: '🏢 Arrivé à l\'agence',
        class: 'status-arrive',
        color: '#20c997'
      },
      'en_livraison': {
        label: '🚴 En livraison',
        class: 'status-livraison',
        color: '#0056b3'
      },
      'livre': {
        label: '✔️ Livré',
        class: 'status-livre',
        color: '#155724'
      },
      'echec_livraison': {
        label: '❌ Échec livraison',
        class: 'status-echec',
        color: '#dc3545'
      },
      'en_retour': {
        label: '↩️ En retour',
        class: 'status-retour',
        color: '#e83e8c'
      },
      'retourne': {
        label: '🔙 Retourné',
        class: 'status-retourne',
        color: '#bd2130'
      },
      'annule': {
        label: '🚫 Annulé',
        class: 'status-annule',
        color: '#6c757d'
      }
    };

    const config = statusConfig[status] || {
      label: status,
      class: 'status-default',
      color: '#6c757d'
    };

    return `<span class="colis-status-badge ${config.class}" style="background-color: ${config.color}15; color: ${config.color}; border: 1px solid ${config.color}40;">${config.label}</span>`;
  }

  static getToken() {
    return localStorage.getItem('token');
  }

  static getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  static logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'commercant-login.html';
  }

  static checkAuth() {
    const token = this.getToken();
    const user = this.getUser();
    
    if (!token || !user || user.role !== 'commercant') {
      this.logout();
      return false;
    }
    return true;
  }
}

export default Utils;
