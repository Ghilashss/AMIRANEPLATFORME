// Importation des modules
import { CONFIG } from './config.js';
import { Utils } from './utils.js';
import { NavigationManager } from './nav-manager.js';
import { PageManager } from './page-manager.js';
import { ModalManager } from './modal-manager.js';
import { DataStore } from './data-store.js';
import { ScannerManager } from './scanner-manager.js';
import { TableManager } from './table-manager.js';

// Gestionnaire d'erreurs global
window.onerror = function(msg, url, line, col, error) {
    console.error('Erreur:', msg);
    console.error('Fichier:', url);
    console.error('Ligne:', line);
    console.error('Colonne:', col);
    console.error('Détails de l\'erreur:', error);
    return false;
};

// Fonction pour initialiser les gestionnaires d'événements
function initializeEventHandlers() {
    console.log('Initialisation des gestionnaires d\'événements...');
    
    // Gestionnaire pour le bouton Scanner
    const scanBtn = document.getElementById('scanColisBtn');
    if (scanBtn) {
        scanBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Clic sur le bouton Scanner');
            const scanZone = document.getElementById('scanColisZone');
            if (scanZone) {
                scanZone.style.display = 'flex';
            }
        });
    }
    
    // Gestionnaire pour le bouton Nouveau Colis
    const addBtn = document.getElementById('addColisBtn');
    if (addBtn) {
        addBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Clic sur le bouton Nouveau Colis');
            const modal = document.getElementById('colisModal');
            if (modal) {
                modal.style.display = 'flex';
            }
        });
    }
    
    // Gestionnaire pour les boutons de fermeture
    const closeButtons = document.querySelectorAll('.close-button');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initialisation de l\'application...');
    
    try {
        // Configuration globale
        window.CONFIG = CONFIG;
        window.Utils = Utils;
        
        console.log('Configuration globale chargée');
        
        // Initialiser le stockage des données en premier (synchrone maintenant)
        DataStore.init();
        window.DataStore = DataStore;
        
        // Passer le DataStore au PageManager
        PageManager.setDataStore(DataStore);
        
        // Initialiser les autres modules
        const navManager = new NavigationManager();
        navManager.init();
        
        PageManager.init();
        ModalManager.init();
        
        const scannerManager = new ScannerManager();
        scannerManager.init();

        // Initialiser le gestionnaire de tableaux
        TableManager.init();
        
        // Initialiser les gestionnaires d'événements
        initializeEventHandlers();

        // Charger les données initiales en fonction de la page active
        const currentPage = document.querySelector('.page.active');
        if (currentPage) {
            console.log('Page active au chargement:', currentPage.id);
            switch(currentPage.id) {
                case 'colis':
                    console.log('Chargement initial des colis...');
                    DataStore.loadColis();
                    break;
                case 'commercant':
                    DataStore.loadCommercants();
                    break;
                case 'retours':
                    DataStore.loadRetours();
                    break;
                case 'reclamation':
                    DataStore.loadReclamations();
                    break;
            }
        }
        
        console.log('Initialisation terminée');
    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
    }

    // Initialiser le scanner
    const scannerManager = new ScannerManager();
    scannerManager.init();

    // Écouter les changements de page
    document.addEventListener('pageChanged', (e) => {
        const pageId = e.detail.pageId;
        console.log('Changement de page vers:', pageId);
        
        // Charger les données spécifiques à la page
        switch(pageId) {
            case 'dashboard':
                console.log('Chargement des statistiques...');
                DataStore.loadDashboardStats();
                break;
            case 'colis':
                console.log('Chargement des colis...');
                DataStore.loadColis();
                // Forcer la mise à jour de la table
                TableManager.updateColisTable();
                break;
            case 'commercant':
                console.log('Chargement des commerçants...');
                DataStore.loadCommercants();
                break;
            case 'retours':
                console.log('Chargement des retours...');
                DataStore.loadRetours();
                break;
            case 'reclamation':
                console.log('Chargement des réclamations...');
                DataStore.loadReclamations();
                break;
        }
    });

    // Initialiser les événements globaux
    initGlobalEvents();
});

function initGlobalEvents() {
    // ❌ LISTENER DÉSACTIVÉ - Déjà géré par data-store.js pour éviter les doublons
    // document.addEventListener('colisUpdated', () => {
    //     console.log('🔄 Événement colisUpdated reçu - Rechargement des colis...');
    //     DataStore.loadColis(); // Recharger depuis l'API
    // });
    
    // ❌ LISTENER DÉSACTIVÉ - Déjà géré par table-manager.js pour éviter les doublons
    // document.addEventListener('commercantUpdated', () => {
    //     console.log('🔄 Événement commercantUpdated reçu - Rechargement des commerçants...');
    //     DataStore.loadCommercants();
    // });
    
    // ❌ LISTENER DÉSACTIVÉ - Déjà géré par table-manager.js pour éviter les doublons
    // document.addEventListener('retourUpdated', () => {
    //     console.log('🔄 Événement retourUpdated reçu - Rechargement des retours...');
    //     DataStore.loadRetours();
    // });
    
    // ✅ LISTENER POUR RAFRAÎCHIR LA TABLE DES RÉCLAMATIONS
    document.addEventListener('reclamationUpdated', () => {
        console.log('🔄 Événement reclamationUpdated reçu - Rechargement des réclamations...');
        DataStore.loadReclamations();
    });
    
    // Gestionnaire de recherche global
    const searchInput = document.querySelector('.search input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            // Implémenter la recherche selon la page active
            const currentPage = document.querySelector('.page.active');
            if (currentPage) {
                const pageId = currentPage.id;
                switch(pageId) {
                    case 'colis':
                        filterTable('#colisTable', searchTerm);
                        break;
                    case 'commercant':
                        filterTable('#commercantTable', searchTerm);
                        break;
                    case 'retours':
                        filterTable('#retoursTable', searchTerm);
                        break;
                    case 'reclamation':
                        filterTable('#reclamationTable', searchTerm);
                        break;
                }
            }
        });
    }

    // Fonction de filtrage des tableaux
    function filterTable(tableId, searchTerm) {
        const table = document.querySelector(tableId);
        if (!table) return;

        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    }

    // Gestionnaire des boutons d'action
    document.addEventListener('click', (e) => {
        const target = e.target;
        
        // Gestion des boutons de suppression
        if (target.classList.contains('btn-delete')) {
            const row = target.closest('tr');
            if (row) {
                const id = row.dataset.id;
                const type = row.closest('table').id.replace('Table', '');
                
                if (confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
                    switch(type) {
                        case 'colis':
                            DataStore.deleteColis(id);
                            break;
                        case 'commercant':
                            DataStore.deleteCommercant(id);
                            break;
                        case 'retours':
                            DataStore.deleteRetour(id);
                            break;
                        case 'reclamation':
                            DataStore.deleteReclamation(id);
                            break;
                    }
                }
            }
        }
        
        // Gestion des boutons d'édition
        if (target.classList.contains('btn-edit')) {
            const row = target.closest('tr');
            if (row) {
                const id = row.dataset.id;
                const type = row.closest('table').id.replace('Table', '');
                
                switch(type) {
                    case 'colis':
                        editColis(id);
                        break;
                    case 'commercant':
                        editCommercant(id);
                        break;
                    case 'retours':
                        editRetour(id);
                        break;
                    case 'reclamation':
                        editReclamation(id);
                        break;
                }
            }
        }
    });
}

// Fonctions d'édition
function editColis(id) {
    const colis = DataStore.getColis(id);
    if (colis) {
        const form = document.getElementById('colisForm');
        for (const [key, value] of Object.entries(colis)) {
            const input = form.querySelector(`#colis${key.charAt(0).toUpperCase() + key.slice(1)}`);
            if (input) input.value = value;
        }
        document.getElementById('colisModal').style.display = 'flex';
    }
}

function editCommercant(id) {
    const commercant = DataStore.getCommercant(id);
    if (commercant) {
        const form = document.getElementById('commercantForm');
        for (const [key, value] of Object.entries(commercant)) {
            const input = form.querySelector(`#commercant${key.charAt(0).toUpperCase() + key.slice(1)}`);
            if (input) input.value = value;
        }
        document.getElementById('commercantModal').style.display = 'flex';
    }
}

function editRetour(id) {
    const retour = DataStore.getRetour(id);
    if (retour) {
        const form = document.getElementById('retourForm');
        for (const [key, value] of Object.entries(retour)) {
            const input = form.querySelector(`#retour${key.charAt(0).toUpperCase() + key.slice(1)}`);
            if (input) input.value = value;
        }
        document.getElementById('retourModal').style.display = 'flex';
    }
}

function editReclamation(id) {
    const reclamation = DataStore.getReclamation(id);
    if (reclamation) {
        const form = document.getElementById('reclamationForm');
        for (const [key, value] of Object.entries(reclamation)) {
            const input = form.querySelector(`#reclamation${key.charAt(0).toUpperCase() + key.slice(1)}`);
            if (input) input.value = value;
        }
        document.getElementById('reclamationModal').style.display = 'flex';
    }
}