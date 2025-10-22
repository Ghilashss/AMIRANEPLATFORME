/**
 * 📊 Dashboard Statistics for Admin
 * Met à jour les compteurs statistiques du tableau de bord administrateur
 */

class AdminDashboardStats {
    constructor() {
        this.updateInterval = null;
        this.token = localStorage.getItem('token');
    }

    /**
     * Initialiser les statistiques du dashboard
     */
    init() {
        console.log('📊 Initialisation des statistiques du dashboard admin...');
        this.updateAllStats();
        
        // Mettre à jour toutes les 30 secondes
        this.updateInterval = setInterval(() => {
            this.updateAllStats();
        }, 30000);
    }

    /**
     * Mettre à jour toutes les statistiques
     */
    async updateAllStats() {
        await Promise.all([
            this.updateColisStats(),
            this.updateUsersStats(),
            this.updateFinancialStats()
        ]);
    }

    /**
     * Mettre à jour les statistiques des colis
     */
    async updateColisStats() {
        try {
            const response = await fetch(`${window.API_CONFIG.API_URL}/colis`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            
            if (!response.ok) throw new Error('Erreur chargement colis');
            
            const colis = await response.json();
            const total = colis.length;
            
            // Colis livrés
            const livres = colis.filter(c => c.status === 'livre').length;
            
            // En attente
            const attente = colis.filter(c => 
                c.status === 'en_attente' || c.status === 'accepte'
            ).length;
            
            // En transit
            const transit = colis.filter(c => 
                c.status === 'en_transit' || 
                c.status === 'expedie' || 
                c.status === 'en_livraison'
            ).length;

            // Mettre à jour l'affichage
            document.getElementById('dashAdminTotalColis').textContent = total;
            document.getElementById('dashAdminColisLivres').textContent = livres;
            document.getElementById('dashAdminColisAttente').textContent = attente;
            document.getElementById('dashAdminColisTransit').textContent = transit;

            console.log('✅ Stats colis admin mis à jour:', { total, livres, attente, transit });
        } catch (error) {
            console.error('❌ Erreur stats colis admin:', error);
        }
    }

    /**
     * Mettre à jour les statistiques des utilisateurs
     */
    async updateUsersStats() {
        try {
            const response = await fetch(`${window.API_CONFIG.API_URL}/auth/users`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            
            if (!response.ok) throw new Error('Erreur chargement utilisateurs');
            
            const data = await response.json();
            const users = data.users || data || [];

            // Compter par rôle
            const commercants = users.filter(u => u.role === 'commercant').length;
            const agences = users.filter(u => u.role === 'agence').length;
            const agents = users.filter(u => u.role === 'agent').length;
            const bureaux = users.filter(u => u.role === 'bureau').length;

            // Mettre à jour l'affichage
            document.getElementById('dashAdminCommercants').textContent = commercants;
            document.getElementById('dashAdminAgences').textContent = agences;
            document.getElementById('dashAdminAgents').textContent = agents;
            document.getElementById('dashAdminBureaux').textContent = bureaux;

            console.log('✅ Stats utilisateurs admin mis à jour:', { commercants, agences, agents, bureaux });
        } catch (error) {
            console.error('❌ Erreur stats utilisateurs admin:', error);
        }
    }

    /**
     * Mettre à jour les statistiques financières
     */
    async updateFinancialStats() {
        try {
            // Transactions
            const txResponse = await fetch(`${window.API_CONFIG.API_URL}/transactions`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            
            let ca = 0;
            let nbTransactions = 0;
            
            if (txResponse.ok) {
                const transactions = await txResponse.json();
                nbTransactions = transactions.length;
                
                // Calculer CA (somme des montants des colis livrés)
                transactions.forEach(t => {
                    if (t.type === 'livraison' || t.type === 'recette') {
                        ca += parseFloat(t.montant || 0);
                    }
                });
            }

            // Réclamations
            const recResponse = await fetch(`${window.API_CONFIG.API_URL}/reclamations`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            
            let nbReclamations = 0;
            if (recResponse.ok) {
                const reclamations = await recResponse.json();
                nbReclamations = reclamations.length;
            }

            // Retours
            const retResponse = await fetch(`${window.API_CONFIG.API_URL}/retours`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            
            let nbRetours = 0;
            if (retResponse.ok) {
                const retours = await retResponse.json();
                nbRetours = retours.length;
            }

            // Mettre à jour l'affichage
            document.getElementById('dashAdminCA').textContent = 
                new Intl.NumberFormat('fr-DZ').format(ca);
            document.getElementById('dashAdminTransactions').textContent = nbTransactions;
            document.getElementById('dashAdminReclamations').textContent = nbReclamations;
            document.getElementById('dashAdminRetours').textContent = nbRetours;

            console.log('✅ Stats financières admin mis à jour:', { ca, nbTransactions, nbReclamations, nbRetours });
        } catch (error) {
            console.error('❌ Erreur stats financières admin:', error);
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
let adminDashboardStatsInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    adminDashboardStatsInstance = new AdminDashboardStats();
    adminDashboardStatsInstance.init();
});

// Exporter pour utilisation externe
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminDashboardStats;
}
