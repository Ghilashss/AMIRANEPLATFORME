// Importation des modules
import { Utils } from './utils.js';

// Gestionnaire de navigation
export class NavigationManager {
    constructor() {
        this.toggle = document.querySelector(".toggle");
        this.navigation = document.querySelector(".navigation");
        this.main = document.querySelector(".main");
        this.allPages = document.querySelectorAll(".page");
        this.navLinks = document.querySelectorAll(".navigation li a");
    }

    init() {
        this.setupMenuToggle();
        this.setupNavigation();
        this.handleInitialPage();
        this.setupHistoryHandling();
    }

    setupMenuToggle() {
        if (this.toggle && this.navigation && this.main) {
            this.toggle.addEventListener('click', () => {
                this.navigation.classList.toggle("active");
                this.main.classList.toggle("active");
            });
        }
    }

    setupNavigation() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Gérer la déconnexion
                const href = link.getAttribute("href");
                if (href === "../../index.html") {
                    // 🔥 FIX: Nettoyer SEULEMENT les données d'auth (pas le cache!)
                    sessionStorage.clear();
                    // Supprimer seulement les données de session utilisateur
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    localStorage.removeItem('userId');
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('userName');
                    localStorage.removeItem('userEmail');
                    localStorage.removeItem('userWilaya');
                    localStorage.removeItem('userAgence');
                    // GARDER: wilayas, agences, *Cache (pour performance)
                    // Redirection absolue vers la racine
                    window.location.href = new URL("../../index.html", window.location.href).href;
                    return;
                }
                
                // Empêcher le comportement par défaut pour les autres liens
                e.preventDefault();
                
                // Récupérer et afficher la page
                const pageId = link.dataset.page;
                if (pageId) {
                    this.showPage(pageId);
                    // Mettre à jour la classe active
                    this.navLinks.forEach(l => l.parentElement.classList.remove('hovered'));
                    link.parentElement.classList.add('hovered');
                }
            });
        });
    }

    showPage(pageId) {
        // Masquer toutes les pages
        this.allPages.forEach(page => {
            page.classList.remove('active');
        });

        // Afficher la page demandée
        const pageToShow = document.getElementById(pageId);
        if (!pageToShow) {
            console.error(`Page ${pageId} non trouvée`);
            return;
        }

        // Afficher la page
        pageToShow.classList.add('active');

        // Mettre à jour la navigation
        this.navLinks.forEach(link => {
            const li = link.parentElement;
            if (link.dataset.page === pageId) {
                li.classList.add("hovered");
            } else {
                li.classList.remove("hovered");
            }
        });

        // Mettre à jour l'URL sans recharger la page
        history.pushState({ page: pageId }, '', `#${pageId}`);

        // Déclencher un événement pour le chargement des données
        const event = new CustomEvent('pageChanged', { detail: { pageId } });
        document.dispatchEvent(event);
    }

    setupHistoryHandling() {
        window.onpopstate = (event) => {
            if (event.state && event.state.page) {
                this.showPage(event.state.page);
            }
        };
    }

    handleInitialPage() {
        const hash = window.location.hash.slice(1);
        this.showPage(hash || 'dashboard');
    }
}