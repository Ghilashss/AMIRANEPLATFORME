/**
 * 🔐 AuthService - Service d'authentification centralisé pour Admin
 * 
 * Gère l'authentification via l'API uniquement (pas de localStorage pour les données utilisateur)
 * - Stocke UNIQUEMENT le token dans sessionStorage (temporaire)
 * - Récupère les données utilisateur depuis l'API à chaque chargement
 * - Gère automatiquement les redirections en cas d'expiration
 */

// Fonction pour récupérer l'API URL
const getApiUrl = () => {
    return window.API_CONFIG ? window.API_CONFIG.API_URL : 'http://localhost:1000/api';
};

// ⚠️ PAS d'export - objet global pour compatibilité avec script classique
window.AuthService = {
  /**
   * Récupère le token admin depuis sessionStorage
   */
  getToken() {
    return sessionStorage.getItem('admin_token');
  },

  /**
   * Stocke le token admin dans sessionStorage
   */
  setToken(token) {
    if (token) {
      sessionStorage.setItem('admin_token', token);
      console.log('✅ Token admin stocké dans sessionStorage');
    }
  },

  /**
   * Supprime le token admin
   */
  clearToken() {
    sessionStorage.removeItem('admin_token');
    console.log('🗑️ Token admin supprimé');
  },

  /**
   * Vérifie l'authentification et récupère les données utilisateur depuis l'API
   * @returns {Promise<Object|null>} Les données utilisateur ou null si non connecté
   */
  async checkAuth() {
    const token = this.getToken();
    
    if (!token) {
      console.warn('⚠️ Aucun token trouvé - Redirection vers login');
      this.redirectToLogin();
      return null;
    }

    try {
      console.log('🔍 Vérification de l\'authentification...');
      const response = await fetch(`${getApiUrl()}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('❌ Token invalide ou expiré');
          this.clearToken();
          this.redirectToLogin();
          return null;
        }
        throw new Error(`Erreur HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        console.log('✅ Authentification réussie:', data.data.email, '-', data.data.role);
        
        // Vérifier que c'est bien un admin
        if (data.data.role !== 'admin') {
          console.error('❌ Accès refusé - Rôle non autorisé:', data.data.role);
          alert('Accès refusé. Cette page est réservée aux administrateurs.');
          this.clearToken();
          this.redirectToLogin();
          return null;
        }
        
        return data.data;
      } else {
        console.error('❌ Réponse API invalide:', data);
        this.clearToken();
        this.redirectToLogin();
        return null;
      }
    } catch (error) {
      console.error('❌ Erreur lors de la vérification de l\'authentification:', error);
      
      // Si c'est une erreur réseau, ne pas supprimer le token immédiatement
      if (error.message.includes('Failed to fetch')) {
        alert('Impossible de contacter le serveur. Vérifiez votre connexion.');
        return null;
      }
      
      this.clearToken();
      this.redirectToLogin();
      return null;
    }
  },

  /**
   * Effectue une requête authentifiée vers l'API
   * @param {string} url - URL de l'API
   * @param {Object} options - Options fetch (method, body, etc.)
   * @returns {Promise<Object>} Réponse JSON de l'API
   */
  async fetchWithAuth(url, options = {}) {
    const token = this.getToken();
    
    if (!token) {
      console.warn('⚠️ Aucun token pour la requête - Redirection vers login');
      this.redirectToLogin();
      throw new Error('Non authentifié');
    }

    const defaultOptions = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const finalOptions = { ...options, ...defaultOptions };

    try {
      const response = await fetch(url, finalOptions);

      if (response.status === 401) {
        console.error('❌ Session expirée - Redirection vers login');
        this.clearToken();
        alert('⚠️ Session expirée. Veuillez vous reconnecter en tant qu\'admin.');
        this.redirectToLogin();
        throw new Error('Session expirée');
      }

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Erreur lors de la requête:', error);
      throw error;
    }
  },

  /**
   * Redirige vers la page de connexion admin
   */
  redirectToLogin() {
    console.log('🔄 Redirection vers la page de connexion admin...');
    window.location.href = '/login.html?role=admin';
  },

  /**
   * Déconnexion : supprime le token et redirige
   */
  logout() {
    console.log('🚪 Déconnexion admin...');
    this.clearToken();
    this.redirectToLogin();
  }
};

// ⚠️ AuthService déjà défini sur window.AuthService plus haut
console.log('✅ AuthService Admin chargé et disponible globalement');
