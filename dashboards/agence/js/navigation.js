// Script de navigation pour le dashboard agence

document.addEventListener('DOMContentLoaded', function() {
    console.log('Initialisation de la navigation agence');
    
    // Gestion de la navigation entre les pages
    const navLinks = document.querySelectorAll('.navigation a[data-page]');
    const pages = document.querySelectorAll('.page, section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const pageId = this.getAttribute('data-page');
            console.log('Navigation vers:', pageId);
            
            // Retirer la classe active de tous les liens
            navLinks.forEach(l => l.parentElement.classList.remove('hovered'));
            
            // Ajouter la classe active au lien cliqué
            this.parentElement.classList.add('hovered');
            
            // Cacher toutes les pages
            pages.forEach(page => {
                page.style.display = 'none';
                page.classList.remove('active');
            });
            
            // Afficher la page sélectionnée
            const selectedPage = document.getElementById(pageId);
            if (selectedPage) {
                selectedPage.style.display = 'block';
                selectedPage.classList.add('active');
                
                // Si c'est la page colis, recharger le tableau
                if (pageId === 'colis' && typeof loadColisTable === 'function') {
                    setTimeout(() => {
                        loadColisTable();
                    }, 100);
                }
            }
        });
    });
    
    // Toggle du menu
    const toggle = document.querySelector('.toggle');
    const navigation = document.querySelector('.navigation');
    const main = document.querySelector('.main');
    
    if (toggle) {
        toggle.addEventListener('click', function() {
            navigation.classList.toggle('active');
            main.classList.toggle('active');
        });
    }
    
    // Afficher la page dashboard par défaut
    const dashboardPage = document.getElementById('dashboard');
    if (dashboardPage) {
        dashboardPage.style.display = 'block';
        dashboardPage.classList.add('active');
    }
});
