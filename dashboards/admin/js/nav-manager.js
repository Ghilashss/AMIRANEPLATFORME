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
            this.toggle.onclick = () => {
                this.navigation.classList.toggle("active");
                this.main.classList.toggle("active");
            };
        }
    }

    setupNavigation() {
        this.navLinks.forEach(link => {
            link.onclick = (e) => {
                // Gérer la déconnexion
                const href = link.getAttribute("href");
                if (href === "../../index.html") {
                    // Nettoyer UNIQUEMENT les données de session (pas les données métier)
                    sessionStorage.clear();
                    
                    // Supprimer uniquement token et user, garder les autres données
                    const dataToKeep = {};
                    const keysToKeep = ['wilayas', 'agences', 'fraisLivraison', 'colis', 'commercants', 'users'];
                    
                    keysToKeep.forEach(key => {
                        const value = localStorage.getItem(key);
                        if (value) {
                            dataToKeep[key] = value;
                        }
                    });
                    
                    // Supprimer les données de session
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    
                    console.log('✅ Déconnexion : token et user supprimés, données métier conservées');
                    
                    window.location.href = new URL("../../index.html", window.location.href).href;
                    e.preventDefault();
                    return;
                }
                
                e.preventDefault();
                
                // Récupérer et afficher la page
                const pageId = link.dataset.page;
                if (pageId) {
                    this.showPage(pageId);
                }
            };
        });
    }

    showPage(pageId) {
        // Masquer toutes les pages
        this.allPages.forEach(page => page.style.display = "none");

        // Afficher la page demandée
        const pageToShow = document.getElementById(pageId);
        if (!pageToShow) {
            console.error(`Page ${pageId} non trouvée`);
            return;
        }

        // Afficher la page
        pageToShow.style.display = "block";

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