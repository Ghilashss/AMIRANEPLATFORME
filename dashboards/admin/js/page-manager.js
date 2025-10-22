import { DataStore } from './data-store.js';

// Gestion des pages
export const PageManager = {
    currentPage: null,

    init() {
        const hash = window.location.hash.slice(1);
        if (hash) {
            this.showPage(hash);
        } else {
            this.showPage('dashboard');
        }

        // Ajouter les écouteurs d'événements pour les liens de navigation
        document.querySelectorAll('.navigation li a').forEach(link => {
            link.addEventListener('click', (e) => {
                // Ne pas rediriger vers index.html
                if (link.getAttribute('href') === '../../index.html') return;
                
                e.preventDefault();
                const pageId = link.dataset.page;
                if (pageId) {
                    this.showPage(pageId);
                }
            });
        });

        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page) {
                this.showPage(e.state.page);
            }
        });
    },

    showPage(pageId) {
        document.querySelectorAll('.page').forEach(p => {
            p.style.display = 'none';
            p.classList.remove('active');
        });
        
        const pageToShow = document.getElementById(pageId);
        if (!pageToShow) {
            console.error(`Page ${pageId} non trouvée`);
            return;
        }

        pageToShow.style.display = 'block';
        pageToShow.classList.add('active');
        this.currentPage = pageId;
        
        history.pushState({page: pageId}, '', `#${pageId}`);

        document.querySelectorAll('.navigation li').forEach(li => {
            const link = li.querySelector('a');
            if (link && link.dataset.page === pageId) {
                li.classList.add('hovered');
            } else {
                li.classList.remove('hovered');
            }
        });

        // Déclencher le chargement des données spécifiques à la page
        this.loadPageData(pageId);
    },

    loadPageData(pageId) {
        console.log(`📄 loadPageData() appelé pour la page: ${pageId}`);
        
        // Charger les données spécifiques à chaque page
        switch(pageId) {
            case 'dashboard':
                DataStore.loadDashboardStats();
                break;
            case 'users':
                DataStore.loadUsers();
                break;
            case 'agences':
                console.log('🏢 Chargement des données de la page Agences...');
                // Forcer le rechargement depuis localStorage
                const savedAgences = localStorage.getItem('agences');
                console.log(`📦 Agences dans localStorage:`, savedAgences ? JSON.parse(savedAgences).length : 0);
                
                // Attendre un petit délai pour que la page soit complètement visible
                setTimeout(() => {
                    console.log('⏰ Délai écoulé, chargement des agences...');
                    DataStore.loadAgences();
                    console.log('✅ DataStore.loadAgences() terminé');
                }, 100);
                break;
            case 'colis':
                DataStore.loadColis();
                break;
            case 'settings':
                DataStore.loadSettings();
                break;
            case 'caisse':
                // Initialiser le gestionnaire de caisse Admin
                console.log('💰 Initialisation Caisse Admin...');
                if (window.CaisseAdmin && window.CaisseAdmin.init) {
                    window.CaisseAdmin.init().catch(err => console.error('Erreur init caisse:', err));
                }
                break;
        }
    }
};