// Importation des modules
import { CONFIG } from './config.js';
import { Utils } from './utils.js';
import { NavigationManager } from './nav-manager.js';
import { PageManager } from './page-manager.js';
import { ModalManager } from './modal-manager.js';
import { DataStore } from './data-store.js';
import { ChartManager } from './chart-manager.js';
import { ScanManager } from './scan-manager.js';
import { TableManager } from './table-manager.js';
import { wilayaManager } from './wilaya-manager.js';

// Initialisation au chargement de la page
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
    
    // Modal initialization is now handled by ModalManager
    
    // Gestionnaire pour les boutons de fermeture
    const closeButtons = document.querySelectorAll('.close-button');
    closeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    });

    // Fermeture des modals en cliquant en dehors
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded - Starting initialization');
    
    // Configuration globale
    window.CONFIG = CONFIG;
    window.Utils = Utils;
    window.DataStore = DataStore;
    
    // Initialiser le gestionnaire de wilayas
    console.log('Initializing Wilaya Manager');
    wilayaManager.loadWilayas();

    // Initialiser le gestionnaire de navigation
    console.log('Initializing Navigation Manager');
    const navManager = new NavigationManager();
    navManager.init();

    // Initialiser le gestionnaire de pages
    console.log('Initializing Page Manager');
    PageManager.init();

    // Initialiser le gestionnaire de modales
    console.log('Initializing Modal Manager');
    ModalManager.init();

    // Initialiser le stockage des données
    console.log('Initializing Data Store');
    DataStore.init();
    // Force initial table update
    TableManager.init();
    document.dispatchEvent(new CustomEvent('colisUpdated'));

    // Initialiser les graphiques
    console.log('Initializing Chart Manager');
    ChartManager.init();

    // Initialiser le gestionnaire de scan
    console.log('Initializing Scan Manager');
    ScanManager.init();

    // Initialiser les gestionnaires d'événements
    console.log('Initializing Event Handlers');
    initializeEventHandlers();

    // Écouter les événements de scan
    document.addEventListener('qrCodeScanned', (e) => {
        const { text } = e.detail;
        // Rechercher le colis correspondant au QR code
        const colisFound = DataStore.findColisByQR(text);
        if (colisFound) {
            // Afficher les détails du colis
            editColis(colisFound.id);
        } else {
            alert('Aucun colis trouvé avec ce QR code');
        }
    });

    // Écouter les changements de page
    document.addEventListener('pageChanged', (e) => {
        const pageId = e.detail.pageId;
        // Charger les données spécifiques à la page
        switch(pageId) {
            case 'dashboard':
                DataStore.loadDashboardStats();
                break;
            case 'colis':
                DataStore.loadColis();
                break;
            case 'wilayas':
                wilayaManager.loadWilayas();
                break;
            case 'agences':
                DataStore.loadAgences();
                break;
            case 'bureaux':
                DataStore.loadBureaux();
                break;
            case 'utilisateurs':
                DataStore.loadUsers();
                break;
            case 'parametres':
                DataStore.loadSettings();
                break;
        }
    });

    // Les événements globaux sont maintenant gérés dans initializeEventHandlers
});

function initGlobalEvents() {
    // Modal handling is now done by ModalManager

    // Gestionnaires pour fermer les modales
    document.querySelectorAll('.close-button').forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Fermer les modales en cliquant en dehors
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
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
                    case 'wilayas':
                        filterTable('#wilayasTable', searchTerm);
                        break;
                    case 'agences':
                        filterTable('#agencesTable', searchTerm);
                        break;
                    case 'bureaux':
                        filterTable('#bureauxTable', searchTerm);
                        break;
                    case 'utilisateurs':
                        filterTable('#usersTable', searchTerm);
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

    // Gestionnaire pour les boutons d'action
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
                        case 'agences':
                            DataStore.deleteAgence(id);
                            break;
                        case 'bureaux':
                            DataStore.deleteBureau(id);
                            break;
                        case 'users':
                            DataStore.deleteUser(id);
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
                    case 'agences':
                        editAgence(id);
                        break;
                    case 'bureaux':
                        editBureau(id);
                        break;
                    case 'users':
                        editUser(id);
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
        // Remplir le formulaire avec les données du colis
        const form = document.getElementById('colisForm');
        for (const [key, value] of Object.entries(colis)) {
            const input = form.querySelector(`#${key}Input`);
            if (input) input.value = value;
        }
        // Afficher la modale
        document.getElementById('colisModal').style.display = 'flex';
    }
}

function editAgence(id) {
    const agence = DataStore.getAgence(id);
    if (agence) {
        const form = document.getElementById('agenceForm');
        for (const [key, value] of Object.entries(agence)) {
            const input = form.querySelector(`#agence${key.charAt(0).toUpperCase() + key.slice(1)}`);
            if (input) input.value = value;
        }
        document.getElementById('agenceModal').style.display = 'flex';
    }
}

function editBureau(id) {
    const bureau = DataStore.getBureau(id);
    if (bureau) {
        const form = document.getElementById('bureauForm');
        for (const [key, value] of Object.entries(bureau)) {
            const input = form.querySelector(`#bureau${key.charAt(0).toUpperCase() + key.slice(1)}`);
            if (input) input.value = value;
        }
        document.getElementById('bureauModal').style.display = 'flex';
    }
}

function editUser(id) {
    const user = DataStore.getUser(id);
    if (user) {
        const form = document.getElementById('userForm');
        for (const [key, value] of Object.entries(user)) {
            const input = form.querySelector(`#user${key.charAt(0).toUpperCase() + key.slice(1)}`);
            if (input) input.value = value;
        }
        document.getElementById('userModal').style.display = 'flex';
    }
}