// Importation des modules
import { NavigationManager } from './agent/js/nav-manager.js';
import { ModalManager } from './agent/js/modal-manager.js';
import { DataStore } from './agent/js/data-store.js';
import { PageManager } from './agent/js/page-manager.js';

// Rendre DataStore accessible globalement pour PageManager
window.DataStore = DataStore;

// Fonctions globales pour la gestion des colis
window.printColis = function(id) {
    const colis = DataStore.colis.find(c => c.id === id);
    if (colis) {
        // Implémenter l'impression
        alert('Impression du colis ' + colis.reference);
    }
};

window.editColis = function(id) {
    const colis = DataStore.colis.find(c => c.id === id);
    if (colis) {
        // Implémenter l'édition
        alert('Édition du colis ' + colis.reference);
    }
};

window.deleteColis = function(id) {
    if (confirm('Voulez-vous vraiment supprimer ce colis ?')) {
        DataStore.deleteColis(id);
        PageManager.loadPageData('colis');
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialiser le gestionnaire de données en premier
        await DataStore.init();
        console.log('DataStore initialisé:', window.DataStore);
        
        // La navigation est maintenant gérée uniquement par PageManager
        console.log('Initialisation de la navigation...');

        // Gestion de la barre latérale
        const toggle = document.querySelector('.toggle');
        const navigation = document.querySelector('.navigation');
        const main = document.querySelector('.main');
        
        if (toggle && navigation && main) {
            toggle.onclick = () => {
                navigation.classList.toggle('active');
                main.classList.toggle('active');
            };
        }

        // Initialiser le gestionnaire de modales
        ModalManager.init();

        // Initialiser le gestionnaire de pages en dernier
        PageManager.init();
        console.log('Initialisation complète');

    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
    }

    // Gestionnaire d'événements pour le chargement des données
    document.addEventListener('pageChanged', (event) => {
        const pageId = event.detail.pageId;
        PageManager.loadPageData(pageId);
    });

    // Gestion du formulaire de colis
    const colisForm = document.getElementById('colisForm');
    if (colisForm) {
        // Écouter les changements du montant pour calculer le total
        const montantInput = document.getElementById('montantInput');
        const fraisInput = document.getElementById('fraisInput');
        const totalInput = document.getElementById('totalInput');
        
        if (montantInput && fraisInput && totalInput) {
            montantInput.addEventListener('input', () => {
                const montant = parseFloat(montantInput.value) || 0;
                const frais = montant >= 5000 ? 600 : 400;
                fraisInput.value = frais;
                totalInput.value = montant + frais;
            });
        }

        // Remplir le select des wilayas
        const wilayaSelect = document.getElementById('wilayaSelect');
        if (wilayaSelect) {
            const wilayas = DataStore.wilayas || [];
            wilayaSelect.innerHTML = '<option value="" disabled selected>Sélectionnez...</option>' +
                wilayas.map(w => `<option value="${w.code}">${w.designation}</option>`).join('');
        }

        colisForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Récupération des données du formulaire
            const formData = {
                reference: `CMD${Date.now()}`,
                client: document.getElementById('clientNom').value,
                telephone: document.getElementById('clientTel').value,
                adresse: `${document.getElementById('adresseInput').value}, ${document.getElementById('communeInput').value}`,
                wilaya: document.getElementById('wilayaSelect').options[document.getElementById('wilayaSelect').selectedIndex].text,
                designation: document.getElementById('designationInput').value,
                montant: parseFloat(document.getElementById('montantInput').value),
                fraisLivraison: parseFloat(document.getElementById('fraisInput').value),
                total: parseFloat(document.getElementById('totalInput').value),
                date: new Date().toISOString(),
                statut: 'En attente'
            };

            try {
                // Stocker les données du colis
                await DataStore.addColis(formData);
                
                // Réinitialiser le formulaire
                colisForm.reset();
                
                // Fermer la modale
                document.getElementById('colisModal').style.display = 'none';
                
                // Actualiser l'affichage
                PageManager.showPage('colis');
                
                // Afficher un message de succès
                alert('Colis créé avec succès !');
                
            } catch (error) {
                console.error('Erreur lors de la création du colis:', error);
                alert('Erreur lors de la création du colis. Veuillez réessayer.');
            }
        });
    }
});