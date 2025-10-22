// Fonctions utilitaires
export const Utils = {
    formatMontant: (montant) => {
        return new Intl.NumberFormat('fr-FR', { 
            style: 'currency', 
            currency: 'DZD' 
        }).format(montant).replace('DZD', 'DA');
    },

    formatDate: (dateStr) => {
        return new Date(dateStr).toLocaleDateString('fr-FR');
    },

    formatDateTime: (dateTimeStr) => {
        return new Date(dateTimeStr).toLocaleString('fr-FR');
    },

    getStatusClass: (status) => {
        status = status.toLowerCase();
        if (status.includes('actif') || status.includes('activé')) return 'success';
        if (status.includes('en attente')) return 'warning';
        if (status.includes('suspendu') || status.includes('bloqué')) return 'danger';
        return '';
    },

    getRoleClass: (role) => {
        role = role.toLowerCase();
        if (role.includes('admin')) return 'danger';
        if (role.includes('agence')) return 'warning';
        if (role.includes('agent')) return 'info';
        return '';
    },

    getPerformanceClass: (value, threshold = 75) => {
        if (value >= threshold) return 'success';
        if (value >= threshold - 15) return 'warning';
        return 'danger';
    }
};