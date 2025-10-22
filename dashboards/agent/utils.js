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
        if (status.includes('livr')) return 'success';
        if (status.includes('cours')) return 'info';
        if (status.includes('attente')) return 'warning';
        if (status.includes('retour') || status.includes('annul')) return 'danger';
        return '';
    },

    getPriorityClass: (priority) => {
        priority = priority.toLowerCase();
        if (priority.includes('haute')) return 'danger';
        if (priority.includes('moyenne')) return 'warning';
        if (priority.includes('basse')) return 'success';
        return '';
    }
};