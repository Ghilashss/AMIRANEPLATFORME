// Gestionnaire pour lier les wilayas aux agences
class WilayaAgenceManager {
    constructor() {
        this.wilayas = [];
        this.loadWilayas();
        this.initializeSelectors();
    }

    loadWilayas() {
        try {
            const savedWilayas = localStorage.getItem('wilayas');
            this.wilayas = savedWilayas ? JSON.parse(savedWilayas) : [];
        } catch (error) {
            console.error('Erreur lors du chargement des wilayas:', error);
            this.wilayas = [];
        }
    }

    initializeSelectors() {
        // Initialiser le sélecteur de wilaya dans le formulaire d'agence
        const agenceWilayaSelect = document.getElementById('agenceWilayaSelect');
        if (agenceWilayaSelect) {
            this.updateWilayaSelector(agenceWilayaSelect);
        }

        // Écouter les changements dans le stockage local
        window.addEventListener('storage', (e) => {
            if (e.key === 'wilayas') {
                this.loadWilayas();
                const select = document.getElementById('agenceWilayaSelect');
                if (select) {
                    this.updateWilayaSelector(select);
                }
            }
        });
    }

    updateWilayaSelector(selectElement) {
        // Vider le sélecteur
        selectElement.innerHTML = '';

        // Ajouter l'option par défaut
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Sélectionnez une wilaya...';
        defaultOption.disabled = true;
        defaultOption.selected = true;
        selectElement.appendChild(defaultOption);

        // Ajouter les wilayas
        this.wilayas.forEach(wilaya => {
            if (wilaya && wilaya.code) {
                const option = document.createElement('option');
                option.value = wilaya.code;
                option.textContent = `${wilaya.code} - ${wilaya.nom || wilaya.designation || 'Wilaya ' + wilaya.code}`;
                selectElement.appendChild(option);
            }
        });
    }
}

// Créer et exporter l'instance
export const wilayaAgenceManager = new WilayaAgenceManager();

// Initialiser quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    wilayaAgenceManager.initializeSelectors();
});