// Utilitaire pour décoder le token JWT et récupérer les infos utilisateur
class AuthManager {
    constructor() {
        this.user = null;
        this.token = null;
    }

    // Décoder le token JWT (partie payload en base64)
    decodeJWT(token) {
        try {
            // Le JWT est composé de 3 parties séparées par des points
            const parts = token.split('.');
            if (parts.length !== 3) {
                throw new Error('Token JWT invalide');
            }

            // Décoder la partie payload (index 1)
            const payload = parts[1];
            const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
            return JSON.parse(decoded);
        } catch (error) {
            console.error('❌ Erreur décodage JWT:', error);
            return null;
        }
    }

    // Récupérer les informations utilisateur depuis le token
    async getUserFromToken() {
        try {
            // 1. Récupérer le token depuis localStorage
            this.token = sessionStorage.getItem('auth_token') || localStorage.getItem('agent_token');
            if (!this.token) {
                console.warn('⚠️ Pas de token trouvé');
                return null;
            }

            // 2. Décoder le token pour récupérer l'ID utilisateur
            const decoded = this.decodeJWT(this.token);
            if (!decoded || !decoded.id) {
                console.error('❌ Token invalide ou pas d\'ID utilisateur');
                return null;
            }

            console.log('🔑 Token décodé:', decoded);

            // 3. Récupérer les infos complètes depuis l'API
            const response = await fetch(`${window.API_CONFIG.API_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const result = await response.json();
            this.user = result.data;
            
            console.log('✅ Utilisateur récupéré depuis API:', this.user);
            return this.user;

        } catch (error) {
            console.error('❌ Erreur récupération utilisateur:', error);
            return null;
        }
    }

    // Récupérer l'agence de l'utilisateur
    getUserAgence() {
        if (!this.user) {
            console.warn('⚠️ Utilisateur non chargé');
            return null;
        }

        // L'agence peut être un objet ou un ID string
        if (this.user.agence) {
            return typeof this.user.agence === 'string' 
                ? this.user.agence 
                : this.user.agence._id || this.user.agence.id;
        }

        return null;
    }

    // Vérifier si l'utilisateur est authentifié
    isAuthenticated() {
        return this.token !== null && this.user !== null;
    }

    // Déconnexion (nettoyer uniquement le token)
    logout() {
        this.user = null;
        this.token = null;
        localStorage.removeItem('token');
        console.log('✅ Déconnexion réussie');
    }
}

// Instance globale
const authManager = new AuthManager();

// Export pour utilisation dans d'autres fichiers
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AuthManager, authManager };
}
