/**
 * 🔐 SERVICE D'AUTHENTIFICATION CENTRALISÉ
 * 
 * Remplace COMPLÈTEMENT le localStorage par des appels API.
 * Utilise sessionStorage UNIQUEMENT pour le token (sécurité + session).
 * 
 * Utilisation:
 * - AuthService.login(email, password) : Connexion
 * - AuthService.getCurrentUser() : Récupère l'utilisateur depuis l'API
 * - AuthService.logout() : Déconnexion
 * - AuthService.isAuthenticated() : Vérifie si connecté
 */

// Attendre que window.API_CONFIG soit chargé
const getApiUrl = () => {
    return window.API_CONFIG ? window.API_CONFIG.API_URL : 'http://localhost:1000/api';
};

// ⚠️ PAS d'export - objet global pour compatibilité avec script classique
window.AuthService = {
    /**
     * 🔑 Récupère le token de la session en cours
     */
    getToken() {
        // Utilise sessionStorage pour plus de sécurité (token disparaît à la fermeture du navigateur)
        return sessionStorage.getItem('auth_token');
    },

    /**
     * 💾 Stocke le token dans sessionStorage
     */
    setToken(token) {
        if (token) {
            sessionStorage.setItem('auth_token', token);
            console.log('✅ Token stocké dans sessionStorage');
        }
    },

    /**
     * 🗑️ Supprime le token
     */
    clearToken() {
        sessionStorage.removeItem('auth_token');
        console.log('🗑️ Token supprimé');
    },

    /**
     * ✅ Vérifie si l'utilisateur est authentifié
     */
    isAuthenticated() {
        return !!this.getToken();
    },

    /**
     * 👤 Récupère les informations de l'utilisateur connecté depuis l'API
     * @returns {Promise<Object>} Les données utilisateur
     */
    async getCurrentUser() {
        const token = this.getToken();
        
        if (!token) {
            throw new Error('Non authentifié');
        }

        try {
            const response = await fetch(`${getApiUrl()}/auth/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success && data.data) {
                console.log('👤 Utilisateur récupéré depuis API:', data.data);
                return data.data;
            } else {
                throw new Error(data.message || 'Erreur lors de la récupération de l\'utilisateur');
            }
        } catch (error) {
            console.error('❌ Erreur getCurrentUser:', error);
            // Si le token est invalide, on déconnecte
            this.clearToken();
            throw error;
        }
    },

    /**
     * 🔐 Connexion utilisateur
     * @param {string} email - Email de l'utilisateur
     * @param {string} password - Mot de passe
     * @returns {Promise<Object>} Les données de connexion (token + user)
     */
    async login(email, password) {
        try {
            const response = await fetch(`${getApiUrl()}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success && data.data && data.data.token) {
                // Stocker UNIQUEMENT le token
                this.setToken(data.data.token);
                
                console.log('✅ Connexion réussie');
                console.log('👤 Rôle:', data.data.role);
                console.log('📧 Email:', data.data.email);
                
                return data.data;
            } else {
                throw new Error(data.message || 'Identifiants incorrects');
            }
        } catch (error) {
            console.error('❌ Erreur login:', error);
            throw error;
        }
    },

    /**
     * 🚪 Déconnexion
     */
    logout() {
        this.clearToken();
        console.log('👋 Déconnexion réussie');
    },

    /**
     * 🔄 Redirection selon le rôle
     * @param {string} role - Le rôle de l'utilisateur (admin, agent, commercant)
     */
    redirectToDashboard(role) {
        const redirects = {
            'admin': '/dashboards/admin/admin-dashboard.html',
            'agent': '/dashboards/agent/agent-dashboard.html',
            'agence': '/dashboards/agent/agent-dashboard.html',
            'commercant': '/dashboards/commercant/commercant-dashboard.html'
        };

        const path = redirects[role];
        if (path) {
            window.location.href = path;
        } else {
            console.error('❌ Rôle non reconnu:', role);
            throw new Error('Rôle non reconnu: ' + role);
        }
    },

    /**
     * 🛡️ Vérifie l'authentification et redirige si nécessaire
     * À appeler au chargement de chaque page protégée
     */
    async checkAuth() {
        if (!this.isAuthenticated()) {
            console.warn('⚠️ Non authentifié - Redirection vers login');
            window.location.href = '/login.html';
            return null;
        }

        try {
            const user = await this.getCurrentUser();
            return user;
        } catch (error) {
            console.error('❌ Token invalide - Redirection vers login');
            window.location.href = '/login.html';
            return null;
        }
    },

    /**
     * 📡 Helper pour faire des requêtes authentifiées
     * @param {string} url - L'URL de l'API
     * @param {Object} options - Options fetch
     */
    async fetchWithAuth(url, options = {}) {
        const token = this.getToken();
        
        if (!token) {
            throw new Error('Non authentifié');
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        };

        try {
            const response = await fetch(url, {
                ...options,
                headers
            });

            // Si 401 (non autorisé), déconnecter
            if (response.status === 401) {
                console.warn('⚠️ Token expiré - Déconnexion');
                this.logout();
                window.location.href = '/login.html';
                throw new Error('Session expirée');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ Erreur requête authentifiée:', error);
            throw error;
        }
    }
};

// ⚠️ PAS d'export default - objet déjà disponible via window.AuthService
console.log('✅ AuthService chargé et disponible globalement');
