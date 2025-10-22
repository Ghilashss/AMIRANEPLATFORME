/**
 * Module API Client centralisé
 * Gère tous les appels API avec authentification
 * Stocker SEULEMENT les tokens dans localStorage
 */

const ApiClient = {
  baseURL: window.API_CONFIG.API_URL,

  /**
   * Récupérer le token selon le rôle
   * @param {string} role - 'admin', 'agent', ou 'commercant'
   * @returns {string|null} Token JWT
   */
  getToken(role = 'commercant') {
    return localStorage.getItem(`${role}_token`);
  },

  /**
   * Récupérer l'utilisateur connecté depuis l'API
   * @param {string} role - 'admin', 'agent', ou 'commercant'
   * @returns {Promise<Object>} Objet user complet avec agence populée
   */
  async getCurrentUser(role = 'commercant') {
    const token = this.getToken(role);

    if (!token) {
      throw new Error('Non connecté');
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token invalide ou expiré
          localStorage.removeItem(`${role}_token`);
          throw new Error('Session expirée');
        }
        throw new Error(`Erreur serveur: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Erreur récupération utilisateur');
      }

      return data.data; // Retourne l'objet user
    } catch (error) {
      console.error('[ApiClient] Erreur getCurrentUser:', error);
      throw error;
    }
  },

  /**
   * Récupérer une agence par ID
   * @param {string} agenceId - ID de l'agence
   * @param {string} role - 'admin', 'agent', ou 'commercant'
   * @returns {Promise<Object>} Objet agence
   */
  async getAgence(agenceId, role = 'commercant') {
    const token = this.getToken(role);

    if (!token) {
      throw new Error('Non connecté');
    }

    try {
      const response = await fetch(`${this.baseURL}/agences/${agenceId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem(`${role}_token`);
          throw new Error('Session expirée');
        }
        throw new Error(`Erreur serveur: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Erreur récupération agence');
      }

      return data.data;
    } catch (error) {
      console.error('[ApiClient] Erreur getAgence:', error);
      throw error;
    }
  },

  /**
   * Récupérer toutes les wilayas
   * @param {string} role - 'admin', 'agent', ou 'commercant'
   * @returns {Promise<Array>} Liste des wilayas
   */
  async getWilayas(role = 'commercant') {
    try {
      const response = await fetch(`${this.baseURL}/wilayas`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur serveur: ${response.status}`);
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('[ApiClient] Erreur getWilayas:', error);
      throw error;
    }
  },

  /**
   * Récupérer toutes les agences
   * @param {string} role - 'admin', 'agent', ou 'commercant'
   * @returns {Promise<Array>} Liste des agences
   */
  async getAgences(role = 'commercant') {
    const token = this.getToken(role);

    if (!token) {
      throw new Error('Non connecté');
    }

    try {
      const response = await fetch(`${this.baseURL}/agences`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem(`${role}_token`);
          throw new Error('Session expirée');
        }
        throw new Error(`Erreur serveur: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Erreur récupération agences');
      }

      return data.data;
    } catch (error) {
      console.error('[ApiClient] Erreur getAgences:', error);
      throw error;
    }
  },

  /**
   * Effectuer une requête API générique
   * @param {string} endpoint - Chemin de l'endpoint (ex: '/colis')
   * @param {Object} options - Options fetch (method, body, etc.)
   * @param {string} role - 'admin', 'agent', ou 'commercant'
   * @returns {Promise<Object>} Réponse de l'API
   */
  async request(endpoint, options = {}, role = 'commercant') {
    const token = this.getToken(role);

    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };

    const finalOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, finalOptions);

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem(`${role}_token`);
          throw new Error('Session expirée');
        }
        throw new Error(`Erreur serveur: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('[ApiClient] Erreur request:', error);
      throw error;
    }
  }
};

// Export pour utilisation dans les autres modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ApiClient;
}
