// Gestion des pages
export const PageManager = {
    currentPage: null,
    dataStore: null,

    setDataStore(store) {
        this.dataStore = store;
    },

    init() {
        console.log('🚀 PageManager.init() - Démarrage de l\'initialisation');
        
        const hash = window.location.hash.slice(1);
        if (hash) {
            console.log(`📍 Hash détecté: "${hash}"`);
            this.showPage(hash);
        } else {
            console.log('📍 Pas de hash, affichage du dashboard par défaut');
            this.showPage('dashboard');
        }

        // Ajouter les écouteurs d'événements pour les liens de navigation
        const navLinks = document.querySelectorAll('.navigation li a');
        console.log(`🔗 Nombre de liens de navigation trouvés: ${navLinks.length}`);
        
        navLinks.forEach((link, index) => {
            const pageId = link.dataset.page;
            console.log(`   Lien ${index + 1}: data-page="${pageId}"`);
            
            link.addEventListener('click', (e) => {
                // Ne pas rediriger vers index.html
                if (link.getAttribute('href') === '../index.html') {
                    console.log('🔙 Lien de déconnexion ignoré');
                    return;
                }
                
                e.preventDefault();
                console.log(`🖱️ Clic sur le lien: "${pageId}"`);
                
                if (pageId) {
                    this.showPage(pageId);
                } else {
                    console.warn('⚠️ Pas de data-page sur ce lien');
                }
            });
        });

        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page) {
                console.log(`⬅️ Retour arrière: "${e.state.page}"`);
                this.showPage(e.state.page);
            }
        });
        
        console.log('✅ PageManager initialisé avec succès');
    },

    showPage(pageId) {
        console.log(`📄 PageManager: Navigation vers "${pageId}"`);
        
        document.querySelectorAll('.page').forEach(p => {
            p.style.display = 'none';
            p.classList.remove('active');
        });
        
        const pageToShow = document.getElementById(pageId);
        if (!pageToShow) {
            // ℹ️ Avertissement au lieu d'erreur (certaines pages ne sont pas encore créées)
            console.warn(`ℹ️ Page "${pageId}" non trouvée - section non encore implémentée`);
            // Retourner au dashboard par défaut
            const dashboard = document.getElementById('dashboard');
            if (dashboard && pageId !== 'dashboard') {
                dashboard.style.display = 'block';
                dashboard.classList.add('active');
                this.currentPage = 'dashboard';
            }
            return;
        }

        console.log(`✅ Page "${pageId}" trouvée, affichage...`);
        
        // ✅ Forcer l'affichage avec styles explicites
        pageToShow.style.display = 'block';
        pageToShow.style.visibility = 'visible';
        pageToShow.style.opacity = '1';
        pageToShow.classList.add('active');
        this.currentPage = pageId;
        
        console.log(`✅ Page "${pageId}" affichée avec succès`);
        
        history.pushState({page: pageId}, '', `#${pageId}`);

        document.querySelectorAll('.navigation li').forEach(li => {
            const link = li.querySelector('a');
            if (link && link.dataset.page === pageId) {
                li.classList.add('hovered');
            } else {
                li.classList.remove('hovered');
            }
        });

        // Initialisation de la caisse agent
        if (pageId === 'caisse-agent') {
            console.log('💰 Initialisation Caisse Agent...');
            if (typeof CaisseAgent !== 'undefined' && CaisseAgent.init) {
                CaisseAgent.init().catch(err => console.error('Erreur init caisse:', err));
            }
        }
    }
};