/**
 * 📊 Dashboard Statistics for Commerçant
 * Met à jour les compteurs statistiques du tableau de bord commerçant
 */

class CommercantDashboardStats {
    constructor() {
        this.updateInterval = null;
        this.token = localStorage.getItem('token');
        this.currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    }

    /**
     * Initialiser les statistiques du dashboard
     */
    init() {
        console.log('📊 Initialisation des statistiques du dashboard commerçant...');
        
        // Première mise à jour après un délai
        setTimeout(() => {
            this.updateAllStats();
        }, 1000);
        
        // Mettre à jour toutes les 10 secondes
        this.updateInterval = setInterval(() => {
            this.updateAllStats();
        }, 10000);

        // Écouter les événements de mise à jour
        document.addEventListener('colisUpdated', () => {
            console.log('📊 Événement colisUpdated reçu');
            setTimeout(() => this.updateAllStats(), 500);
        });
    }

    /**
     * Mettre à jour toutes les statistiques
     */
    async updateAllStats() {
        console.log('📊 Mise à jour des stats commerçant...');
        await this.updateColisStats();
    }

    /**
     * Mettre à jour les statistiques des colis
     */
    async updateColisStats() {
        try {
            // Essayer d'abord avec l'API
            let colis = [];
            let useAPI = false;
            
            if (this.token && this.currentUser._id) {
                try {
                    const response = await fetch(`${window.API_CONFIG.API_URL}/colis?commercant=${this.currentUser._id}`, {
                        headers: { 'Authorization': `Bearer ${this.token}` }
                    });
                    
                    if (response.ok) {
                        colis = await response.json();
                        useAPI = true;
                        console.log('📊 Données chargées depuis API:', colis.length);
                    }
                } catch (apiError) {
                    console.warn('⚠️ API non disponible, utilisation localStorage');
                }
            }
            
            // Fallback sur localStorage
            if (!useAPI) {
                const allColis = JSON.parse(localStorage.getItem('colis') || '[]');
                colis = allColis.filter(c => 
                    c.expediteur?.id === this.currentUser._id || 
                    c.commercant === this.currentUser._id ||
                    c.expediteur?._id === this.currentUser._id
                );
                console.log('📊 Données chargées depuis localStorage:', colis.length);
            }
            
            const total = colis.length;

            // Colis livrés
            const livres = colis.filter(c => c.status === 'livre').length;

            // Colis en transit
            const transit = colis.filter(c => 
                c.status === 'en_transit' || 
                c.status === 'expedie' || 
                c.status === 'en_livraison'
            ).length;

            // Colis en attente
            const attente = colis.filter(c => 
                c.status === 'en_attente' || 
                c.status === 'accepte'
            ).length;

            // Échecs de livraison
            const echecs = colis.filter(c => c.status === 'echec_livraison').length;

            // Retours
            const retours = colis.filter(c => 
                c.status === 'en_retour' || 
                c.status === 'retourne'
            ).length;

            // Chiffre d'affaires (somme des montants des colis livrés)
            let ca = 0;
            colis.filter(c => c.status === 'livre').forEach(c => {
                ca += parseFloat(c.montant || 0);
            });

            // Nombre de bordereaux (à implémenter selon votre système)
            const bordereaux = 0; // TODO: implémenter le comptage des bordereaux

            // Mettre à jour l'affichage
            const totalEl = document.getElementById('dashCommTotalColis');
            const livresEl = document.getElementById('dashCommColisLivres');
            const transitEl = document.getElementById('dashCommColisTransit');
            const attenteEl = document.getElementById('dashCommColisAttente');
            const echecsEl = document.getElementById('dashCommEchecs');
            const retoursEl = document.getElementById('dashCommRetours');
            const caEl = document.getElementById('dashCommChiffreAffaires');
            const bordereauxEl = document.getElementById('dashCommBordereaux');
            
            if (totalEl) totalEl.textContent = total;
            if (livresEl) livresEl.textContent = livres;
            if (transitEl) transitEl.textContent = transit;
            if (attenteEl) attenteEl.textContent = attente;
            if (echecsEl) echecsEl.textContent = echecs;
            if (retoursEl) retoursEl.textContent = retours;
            if (caEl) caEl.textContent = new Intl.NumberFormat('fr-DZ').format(ca) + ' DA';
            if (bordereauxEl) bordereauxEl.textContent = bordereaux;

            console.log('✅ Stats commerçant mis à jour:', { 
                total, livres, transit, attente, echecs, retours, ca, bordereaux 
            });
        } catch (error) {
            console.error('❌ Erreur mise à jour stats commerçant:', error);
        }
    }

    /**
     * Détruire l'instance
     */
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

// Initialiser au chargement de la page
let commercantDashboardStatsInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log('📊 DOMContentLoaded - Initialisation dashboard stats commerçant...');
    commercantDashboardStatsInstance = new CommercantDashboardStats();
    commercantDashboardStatsInstance.init();
});

// Exporter pour utilisation externe
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CommercantDashboardStats;
}
