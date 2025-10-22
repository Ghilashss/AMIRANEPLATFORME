/**
 * 📊 Dashboard Statistics for Agent
 * Met à jour les compteurs statistiques du tableau de bord
 */

class DashboardStats {
    constructor() {
        this.updateInterval = null;
    }

    /**
     * Initialiser les statistiques du dashboard
     */
    init() {
        console.log('📊 Initialisation des statistiques du dashboard agent...');
        
        // Attendre que DataStore soit disponible
        setTimeout(() => {
            this.updateAllStats();
        }, 1000);
        
        // Mettre à jour toutes les 10 secondes
        this.updateInterval = setInterval(() => {
            this.updateAllStats();
        }, 10000);

        // Écouter les événements de mise à jour
        document.addEventListener('colisUpdated', () => {
            console.log('📊 Événement colisUpdated reçu, mise à jour des stats...');
            setTimeout(() => this.updateAllStats(), 500);
        });
        document.addEventListener('commercantUpdated', () => this.updateCommercants());
        document.addEventListener('retourUpdated', () => this.updateRetours());
        document.addEventListener('caisseUpdated', () => this.updateCaisse());
    }

    /**
     * Mettre à jour toutes les statistiques
     */
    async updateAllStats() {
        console.log('📊 Mise à jour de toutes les stats...');
        await Promise.all([
            this.updateColisStats(),
            this.updateCommercants(),
            this.updateRetours(),
            this.updateCaisse()
        ]);
    }

    /**
     * Mettre à jour les statistiques des colis
     */
    async updateColisStats() {
        try {
            // Utiliser DataStore si disponible
            let colis = [];
            if (window.DataStore && window.DataStore.colis) {
                colis = window.DataStore.colis;
                console.log('📊 Utilisation des colis depuis DataStore:', colis.length);
            } else {
                // Fallback sur localStorage
                colis = JSON.parse(localStorage.getItem('colis') || '[]');
                console.log('📊 Utilisation des colis depuis localStorage:', colis.length);
            }
            
            // Total colis
            const total = colis.length;
            document.getElementById('dashTotalColis').textContent = total;

            // Colis livrés
            const livres = colis.filter(c => c.status === 'livre' || c.statut === 'livre').length;
            document.getElementById('dashColisLivres').textContent = livres;

            // Colis en transit
            const transit = colis.filter(c => 
                c.status === 'en_transit' || 
                c.status === 'expedie' || 
                c.status === 'en_livraison' ||
                c.statut === 'en_transit' || 
                c.statut === 'expedie' || 
                c.statut === 'en_livraison'
            ).length;
            document.getElementById('dashColisTransit').textContent = transit;

            // Colis en attente
            const attente = colis.filter(c => 
                c.status === 'en_attente' || 
                c.status === 'accepte' ||
                c.statut === 'en_attente' || 
                c.statut === 'accepte'
            ).length;
            document.getElementById('dashColisAttente').textContent = attente;

            console.log('✅ Stats colis mis à jour:', { total, livres, transit, attente });
        } catch (error) {
            console.error('❌ Erreur mise à jour stats colis:', error);
        }
    }

    /**
     * Mettre à jour le compteur de commerçants
     */
    async updateCommercants() {
        try {
            const commercants = JSON.parse(localStorage.getItem('commercants') || '[]');
            const total = commercants.length;
            const el = document.getElementById('dashTotalCommercants');
            if (el) el.textContent = total;
            console.log('✅ Stats commerçants mis à jour:', total);
        } catch (error) {
            console.error('❌ Erreur mise à jour stats commerçants:', error);
        }
    }

    /**
     * Mettre à jour le compteur de retours
     */
    async updateRetours() {
        try {
            const retours = JSON.parse(localStorage.getItem('retours') || '[]');
            const total = retours.length;
            const el = document.getElementById('dashTotalRetours');
            if (el) el.textContent = total;
            console.log('✅ Stats retours mis à jour:', total);
        } catch (error) {
            console.error('❌ Erreur mise à jour stats retours:', error);
        }
    }

    /**
     * Mettre à jour les statistiques de caisse
     */
    async updateCaisse() {
        try {
            // Récupérer les transactions
            const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
            
            // Calculer le solde total
            let solde = 0;
            transactions.forEach(t => {
                if (t.type === 'entree' || t.type === 'recette') {
                    solde += parseFloat(t.montant || 0);
                } else if (t.type === 'sortie' || t.type === 'depense') {
                    solde -= parseFloat(t.montant || 0);
                }
            });

            // Calculer les recettes d'aujourd'hui
            const today = new Date().toISOString().split('T')[0];
            let recettesJour = 0;
            transactions.forEach(t => {
                const tDate = t.date ? new Date(t.date).toISOString().split('T')[0] : '';
                if (tDate === today && (t.type === 'entree' || t.type === 'recette')) {
                    recettesJour += parseFloat(t.montant || 0);
                }
            });

            // Mettre à jour l'affichage
            const soldeEl = document.getElementById('dashSoldeCaisse');
            const recettesEl = document.getElementById('dashRecettesJour');
            
            if (soldeEl) {
                soldeEl.textContent = new Intl.NumberFormat('fr-DZ').format(solde) + ' DA';
            }
            if (recettesEl) {
                recettesEl.textContent = new Intl.NumberFormat('fr-DZ').format(recettesJour) + ' DA';
            }

            console.log('✅ Stats caisse mis à jour:', { solde, recettesJour });
        } catch (error) {
            console.error('❌ Erreur mise à jour stats caisse:', error);
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
let dashboardStatsInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log('📊 DOMContentLoaded - Initialisation dashboard stats...');
    dashboardStatsInstance = new DashboardStats();
    dashboardStatsInstance.init();
    
    // 🌍 Exposer globalement pour accès depuis data-store.js
    window.DashboardStats = dashboardStatsInstance;
});

// Exporter pour utilisation externe
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardStats;
}
