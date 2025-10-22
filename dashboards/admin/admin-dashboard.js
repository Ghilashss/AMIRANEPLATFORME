// Import des modules
import { CONFIG } from './js/config.js';
import { Utils } from './js/utils.js';
import { NavigationManager } from './js/nav-manager.js';
import { PageManager } from './js/page-manager.js';
import { ModalManager } from './js/modal-manager.js';
import { DataStore } from './js/data-store.js';
import { ChartManager } from './js/chart-manager.js';

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialisation des variables globales
        window.CONFIG = CONFIG;
        window.Utils = Utils;
        window.DataStore = DataStore;

        console.log('Initialisation du tableau de bord admin...');

        // Initialiser le gestionnaire de données en premier
        await DataStore.init();
        console.log('DataStore initialisé');

        // Initialiser le gestionnaire de navigation
        const navManager = new NavigationManager();
        navManager.init();
        console.log('Navigation initialisée');

        // Initialiser le gestionnaire de pages
        PageManager.init();
        console.log('PageManager initialisé');

        // Initialiser le gestionnaire de modales
        ModalManager.init();
        console.log('ModalManager initialisé');

        // Initialiser les graphiques
        ChartManager.init();
        console.log('ChartManager initialisé');

        // Initialiser les événements globaux
        initGlobalEvents();
        console.log('Événements globaux initialisés');

        // Charger la page initiale
        const initialPage = window.location.hash.slice(1) || 'dashboard';
        await handlePageChange(initialPage);
        console.log('Page initiale chargée:', initialPage);

    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
        Utils.showNotification('Erreur d\'initialisation', 'error');
    }
});

// Gestionnaire des événements globaux
function initGlobalEvents() {
    // Écouter les changements de page
    document.addEventListener('pageChanged', async (e) => {
        const pageId = e.detail.pageId;
        await handlePageChange(pageId);
    });

    // Gestion de la recherche globale
    const searchInput = document.querySelector('.search input');
    if (searchInput) {
        let debounceTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                const searchTerm = e.target.value.toLowerCase();
                handleSearch(searchTerm);
            }, 300);
        });
    }

    // Gestion des formulaires
    initializeFormHandlers();
}

// Gestionnaire de changement de page
async function handlePageChange(pageId) {
    try {
        // Nettoyer l'intervalle de rafraîchissement quand on change de page
        if (window.colisRefreshInterval) {
            clearInterval(window.colisRefreshInterval);
            window.colisRefreshInterval = null;
        }
        
        switch(pageId) {
            case 'dashboard':
                const stats = await DataStore.loadDashboardStats();
                ChartManager.updateCharts(stats);
                updateDashboardCounters(stats);
                break;
                
            case 'colis':
                const colis = await DataStore.loadColis();
                updateColisTable(colis);
                
                // Auto-refresh des colis toutes les 10 secondes quand on est sur la page colis
                if (window.colisRefreshInterval) {
                    clearInterval(window.colisRefreshInterval);
                }
                window.colisRefreshInterval = setInterval(async () => {
                    console.log('🔄 Rechargement automatique des colis...');
                    const updatedColis = await DataStore.loadColis();
                    updateColisTable(updatedColis);
                }, 10000); // 10 secondes
                break;
                
            case 'wilayas':
                const wilayas = await DataStore.loadWilayas();
                updateWilayasTable(wilayas);
                break;
                
            case 'agences':
                const agences = await DataStore.loadAgences();
                updateAgencesTable(agences);
                break;
                
            case 'bureaux':
                const bureaux = await DataStore.loadBureaux();
                updateBureauxTable(bureaux);
                break;
                
            case 'utilisateurs':
                const users = await DataStore.loadUsers();
                updateUsersTable(users);
                break;
                
            case 'parametres':
                const settings = await DataStore.loadSettings();
                updateSettingsForm(settings);
                break;
        }
    } catch (error) {
        console.error('Erreur lors du chargement de la page:', error);
        Utils.showNotification('Erreur de chargement', 'error');
    }
}

// Mise à jour des compteurs du tableau de bord
function updateDashboardCounters(stats) {
    const counters = {
        totalColis: stats.totalColis || 0,
        colisEnCours: stats.colisEnCours || 0,
        colisLivres: stats.colisLivres || 0,
        totalRevenu: stats.totalRevenu || 0
    };

    for (const [id, value] of Object.entries(counters)) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = id.includes('Revenu') 
                ? value.toLocaleString('fr-DZ', { style: 'currency', currency: 'DZD' })
                : value.toLocaleString();
        }
    }
}

// Gestionnaire de recherche
function handleSearch(searchTerm) {
    const currentPage = document.querySelector('.page.active');
    if (!currentPage) return;

    const tableId = `${currentPage.id}Table`;
    const table = document.getElementById(tableId);
    if (!table) return;

    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Initialisation des gestionnaires de formulaires
function initializeFormHandlers() {
    // Formulaire d'utilisateur
    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleUserFormSubmit(userForm);
        });
    }

    // Formulaire d'agence
    const agenceForm = document.getElementById('agenceForm');
    if (agenceForm) {
        agenceForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleAgenceFormSubmit(agenceForm);
        });
    }

    // Formulaire de paramètres
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleSettingsFormSubmit(settingsForm);
        });
    }
}

// Gestionnaires de soumission de formulaires
async function handleUserFormSubmit(form) {
    try {
        const formData = new FormData(form);
        const userData = Object.fromEntries(formData.entries());
        
        if (userData.id) {
            await DataStore.updateUser(userData);
            Utils.showNotification('Utilisateur mis à jour', 'success');
        } else {
            await DataStore.addUser(userData);
            Utils.showNotification('Utilisateur créé', 'success');
        }
        
        form.reset();
        document.getElementById('userModal').style.display = 'none';
        await handlePageChange('utilisateurs');
        
    } catch (error) {
        console.error('Erreur lors de la soumission:', error);
        Utils.showNotification('Erreur lors de la soumission', 'error');
    }
}

async function handleAgenceFormSubmit(form) {
    try {
        const formData = new FormData(form);
        const agenceData = Object.fromEntries(formData.entries());
        
        if (agenceData.id) {
            await DataStore.updateAgence(agenceData);
            Utils.showNotification('Agence mise à jour', 'success');
        } else {
            await DataStore.addAgence(agenceData);
            Utils.showNotification('Agence créée', 'success');
        }
        
        form.reset();
        document.getElementById('agenceModal').style.display = 'none';
        await handlePageChange('agences');
        
    } catch (error) {
        console.error('Erreur lors de la soumission:', error);
        Utils.showNotification('Erreur lors de la soumission', 'error');
    }
}

async function handleSettingsFormSubmit(form) {
    try {
        const formData = new FormData(form);
        const settingsData = Object.fromEntries(formData.entries());
        
        await DataStore.updateSettings(settingsData);
        Utils.showNotification('Paramètres mis à jour', 'success');
        
    } catch (error) {
        console.error('Erreur lors de la soumission:', error);
        Utils.showNotification('Erreur lors de la mise à jour', 'error');
    }
}

// Fonctions de mise à jour des tableaux
function updateColisTable(colis) {
    const table = document.getElementById('colisTable');
    if (!table) return;

    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';

    colis.forEach(item => {
        const row = document.createElement('tr');
        
        // ✅ MAPPING CORRECT selon le modèle MongoDB Colis
        const colisId = item._id || item.id;
        const reference = item.tracking || item.reference || '-';
        
        // Expediteur: priorité expediteur.nom > nomExpediteur > commercant
        const expediteur = item.expediteur?.nom || item.nomExpediteur || item.expediteurNom || item.commercant || '-';
        const telExpediteur = item.expediteur?.telephone || item.telExpediteur || item.expediteurTel || item.commercantTel || '-';
        
        // Destinataire: priorité destinataire.nom > clientNom
        const destinataire = item.destinataire?.nom || item.clientNom || item.client || '-';
        const telDestinataire = item.destinataire?.telephone || item.clientTel || item.telephone || '-';
        
        // Wilaya
        const wilaya = item.destinataire?.wilaya || item.wilayaDest || item.wilaya || '-';
        
        // Adresse: Si type bureau, afficher le bureau, sinon l'adresse
        let adresse = '-';
        if (item.typeLivraison === 'stopdesk' || item.typeLivraison === 'bureau') {
            adresse = item.bureauDest || '🏢 Bureau';
        } else {
            adresse = item.destinataire?.adresse || item.adresse || item.adresseLivraison || '-';
        }
        
        // Type de livraison
        const typeLivraison = item.typeLivraison === 'domicile' ? '🏠 Domicile' : 
                             item.typeLivraison === 'stopdesk' ? '🏢 Bureau' :
                             item.typeLivraison === 'bureau' ? '🏢 Bureau' : 
                             item.typeLivraison || '-';
        
        // Contenu
        const contenu = item.contenu || '-';
        
        // Poids
        const poids = item.poids || item.poidsColis || '-';
        
        // Montant
        const montant = item.totalAPayer || item.montant || item.prixColis || '0';
        
        // Statut
        const statut = item.status || item.statut || 'en_attente';
        
        // Date
        const date = item.createdAt ? new Date(item.createdAt).toLocaleDateString('fr-FR') : 
                    item.date ? new Date(item.date).toLocaleDateString('fr-FR') : '-';
        
        row.dataset.id = colisId;
        row.innerHTML = `
            <td>${reference}</td>
            <td>${expediteur}</td>
            <td>${telExpediteur}</td>
            <td>${destinataire}</td>
            <td>${telDestinataire}</td>
            <td>${wilaya}</td>
            <td>${adresse}</td>
            <td>${typeLivraison}</td>
            <td>${contenu}</td>
            <td>${poids}</td>
            <td>${montant} DA</td>
            <td>${date}</td>
            <td><span class="status ${Utils.getStatusClass(statut)}">${statut}</span></td>
            <td>
                <button class="btn-view" onclick="viewColis('${colisId}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-edit" onclick="editColis('${colisId}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" onclick="deleteColis('${colisId}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateWilayasTable(wilayas) {
    const table = document.getElementById('wilayasTable');
    if (!table) return;

    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';

    wilayas.forEach(wilaya => {
        const row = document.createElement('tr');
        row.dataset.id = wilaya.id;
        row.innerHTML = `
            <td>${wilaya.code}</td>
            <td>${wilaya.nom}</td>
            <td>${wilaya.communes.length}</td>
            <td><span class="status ${Utils.getStatusClass(wilaya.status)}">${wilaya.status}</span></td>
            <td>
                <button class="btn-edit" onclick="editWilaya('${wilaya.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" onclick="deleteWilaya('${wilaya.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateAgencesTable(agences) {
    const table = document.getElementById('agencesTable');
    if (!table) return;

    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';

    agences.forEach(agence => {
        const row = document.createElement('tr');
        row.dataset.id = agence.id;
        row.innerHTML = `
            <td>${agence.nom}</td>
            <td>${agence.wilaya}</td>
            <td>${agence.adresse}</td>
            <td>${agence.telephone}</td>
            <td><span class="status ${Utils.getStatusClass(agence.status)}">${agence.status}</span></td>
            <td>
                <button class="btn-edit" onclick="editAgence('${agence.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" onclick="deleteAgence('${agence.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateUsersTable(users) {
    const table = document.getElementById('usersTable');
    if (!table) return;

    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';

    users.forEach(user => {
        const row = document.createElement('tr');
        row.dataset.id = user.id;
        row.innerHTML = `
            <td>${user.nom} ${user.prenom}</td>
            <td>${user.email}</td>
            <td><span class="role ${Utils.getRoleClass(user.role)}">${user.role}</span></td>
            <td>${user.agence || 'N/A'}</td>
            <td><span class="status ${Utils.getStatusClass(user.status)}">${user.status}</span></td>
            <td>
                <button class="btn-edit" onclick="editUser('${user.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" onclick="deleteUser('${user.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateSettingsForm(settings) {
    if (!settings) return;

    for (const [key, value] of Object.entries(settings)) {
        const input = document.getElementById(`setting_${key}`);
        if (input) {
            input.value = value;
        }
    }
}