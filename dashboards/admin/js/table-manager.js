import { DataStore } from './data-store.js';
import { QRGenerator } from './qr-generator.js';

export const TableManager = {
    init() {
        console.log('Initialisation du TableManager...');
        // Écouter les événements de mise à jour - déléguer à DataStore
        document.addEventListener('colisUpdated', () => {
            console.log('Event colisUpdated reçu - délégation à DataStore');
            if (DataStore && DataStore.updateColisTable) {
                DataStore.updateColisTable();
            }
        });
        document.addEventListener('usersUpdated', () => {
            console.log('Event usersUpdated reçu');
            if (DataStore && DataStore.updateUsersTable) {
                DataStore.updateUsersTable();
            }
        });
        document.addEventListener('agencesUpdated', () => {
            console.log('Event agencesUpdated reçu');
            if (DataStore && DataStore.updateAgencesTable) {
                DataStore.updateAgencesTable();
            }
        });
        document.addEventListener('wilayasUpdated', () => {
            console.log('Event wilayasUpdated reçu');
            // Wilaya Manager gère son propre tableau
        });
        
        // Ne plus appeler updateColisTable ici - DataStore le fait déjà
        console.log('TableManager initialisé - délégation à DataStore pour les mises à jour');
    },

    // Fonction updateColisTable supprimée - DataStore gère maintenant le tableau des colis

    formatDate(date) {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('fr-FR');
    },

    getStatusClass(status) {
        if (!status) return 'warning';
        status = status.toLowerCase();
        if (status.includes('livré') || status.includes('livre') || status.includes('completed')) return 'success';
        if (status.includes('retard') || status.includes('erreur') || status.includes('retour')) return 'danger';
        if (status.includes('cours') || status.includes('attente')) return 'warning';
        return 'warning';
    },

    handleView(id) {
        console.log('Consulter le colis:', id);
        const colis = DataStore.colis.find(c => c.id === id);
        if (colis) {
            // TODO: Implement view logic - could open a modal with detailed information
            alert('Consultation du colis ' + colis.reference);
        }
    },

    handleEdit(id) {
        console.log('Modifier le colis:', id);
        const colis = DataStore.colis.find(c => c.id === id);
        if (colis) {
            // Open the colisModal for editing
            const modal = document.getElementById('colisModal');
            if (modal) {
                // Fill the form with existing data
                const form = modal.querySelector('#colisForm');
                if (form) {
                    // TODO: Fill the form fields with colis data
                    modal.style.display = 'flex';
                }
            }
        }
    },

    handleDelete(id) {
        console.log('Supprimer le colis:', id);
        if (confirm('Êtes-vous sûr de vouloir supprimer ce colis ?')) {
            if (DataStore && DataStore.deleteColis) {
                DataStore.deleteColis(id);
            }
        }
    },

    handlePrint(id) {
        console.log('Imprimer le colis:', id);
        const colis = DataStore.colis.find(c => c.id === id);
        if (colis) {
            // TODO: Implement print logic - could open a print dialog with formatted colis information
            window.print();
        }
    }
};