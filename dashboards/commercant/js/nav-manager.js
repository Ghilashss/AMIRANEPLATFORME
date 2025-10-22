// Gestionnaire de navigation
export class NavigationManager {
  constructor() {
    this.navigation = document.querySelector('.navigation');
    this.mainContent = document.querySelector('.main');
    this.toggle = document.querySelector('.toggle');
    this.navLinks = document.querySelectorAll('.navigation ul li a[data-page]');
  }

  init() {
    // Toggle sidebar
    this.toggle?.addEventListener('click', () => {
      this.navigation.classList.toggle('active');
      this.mainContent.classList.toggle('active');
    });

    // Navigation entre les pages
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const pageId = link.getAttribute('data-page');
        this.navigateToPage(pageId);
      });
    });
  }

  navigateToPage(pageId) {
    // Masquer toutes les pages
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
    });

    // Afficher la page demandée
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
      targetPage.classList.add('active');
    }

    // Mettre à jour l'état actif dans la navigation
    this.navLinks.forEach(link => {
      link.parentElement.classList.remove('hovered');
    });

    const activeLink = document.querySelector(`[data-page="${pageId}"]`);
    if (activeLink) {
      activeLink.parentElement.classList.add('hovered');
    }

    // Émettre un événement personnalisé
    document.dispatchEvent(new CustomEvent('pageChanged', {
      detail: { pageId }
    }));
  }
}

export default NavigationManager;
