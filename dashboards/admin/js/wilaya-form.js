import { wilayasData } from './wilaya-manager.js';

// Gestionnaire de modal
const ModalManager = {
    open(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    },

    close(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    }
};

// Fonction pour ouvrir le modal wilaya
function openWilayaModal() {
    ModalManager.open('wilayaModal');
}

// Fonction pour fermer le modal wilaya
function closeWilayaModal() {
    ModalManager.close('wilayaModal');
}

// Initialisation des gestionnaires d'événements
document.addEventListener('DOMContentLoaded', function() {
    // Bouton pour ouvrir le modal
    const addButton = document.getElementById('addWilayaBtn');
    if (addButton) {
        addButton.addEventListener('click', function(e) {
            e.preventDefault();
            openWilayaModal();
        });
    }

    // Bouton pour fermer le modal
    const closeButton = document.querySelector('#wilayaModal .close-button');
    if (closeButton) {
        closeButton.addEventListener('click', closeWilayaModal);
    }

    // Fermer le modal en cliquant en dehors
    const modal = document.getElementById('wilayaModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeWilayaModal();
            }
        });
    }

    // Initialisation du select des wilayas
    const wilayaSelect = document.getElementById('wilayaSelect');
    if (wilayaSelect) {
        wilayaSelect.innerHTML = '<option value="">Sélectionner une wilaya...</option>';
        wilayasData.forEach(wilaya => {
            const option = document.createElement('option');
            option.value = wilaya.code;
            option.textContent = `${wilaya.code} - ${wilaya.nom}`;
            wilayaSelect.appendChild(option);
        });

        // Gestionnaire d'événement pour le changement de wilaya
        wilayaSelect.addEventListener('change', function(e) {
            autoFillWilayaData(e.target.value);
        });
    }

    // Gestion du formulaire
    const form = document.getElementById('wilayaForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Récupération de la wilaya sélectionnée
            const selectedCode = document.getElementById('wilayaSelect').value;
            const selectedWilaya = wilayasData.find(w => w.code === selectedCode);
            
            if (selectedWilaya) {
                const formData = {
                    ...selectedWilaya,
                    status: document.getElementById('wilayaStatus').value
                };
                
                // Ajouter à la table
                addWilayaToTable(formData);
            }

            // Fermer le modal et réinitialiser le formulaire
            closeWilayaModal();
            form.reset();
        });
    }
});

// On utilise la liste complète des wilayas définie dans wilaya-manager.js

// Fonction pour remplir automatiquement les champs basés sur la wilaya sélectionnée
function autoFillWilayaData(selectedCode) {
    const wilaya = wilayasData.find(w => w.code === selectedCode);
    if (wilaya) {
        document.getElementById('wilayaCode').value = wilaya.code;
        document.getElementById('wilayaNom').value = wilaya.nom;
        document.getElementById('wilayaZone').value = wilaya.zone;
        document.getElementById('wilayaLat').value = wilaya.lat || '';
        document.getElementById('wilayaLon').value = wilaya.lon || '';
        document.getElementById('wilayaStatus').value = 'active';
    }
}

// Fonction pour ajouter une wilaya au tableau
function addWilayaToTable(wilaya) {
    const tableBody = document.querySelector('#wilayasTable tbody');
    if (!tableBody) return;

    // Calculer les frais et délais basés sur la zone
    let fraisLivraison = 0;
    let delaiLivraison = 0;
    
    switch(wilaya.zone.toLowerCase()) {
        case 'nord':
            fraisLivraison = 400;
            delaiLivraison = 1;
            break;
        case 'centre':
            fraisLivraison = 500;
            delaiLivraison = 2;
            break;
        case 'est':
            fraisLivraison = 600;
            delaiLivraison = 2;
            break;
        case 'ouest':
            fraisLivraison = 600;
            delaiLivraison = 2;
            break;
        case 'sud':
            fraisLivraison = 800;
            delaiLivraison = 3;
            break;
    }

    const row = document.createElement('tr');
    row.innerHTML = `
        <td>
            <div class="checkbox-wrapper">
                <input type="checkbox" id="wilaya_${wilaya.code}" />
                <label for="wilaya_${wilaya.code}"></label>
            </div>
        </td>
        <td>${wilaya.code.padStart(2, '0')}</td>
        <td>${wilaya.nom}</td>
        <td>${wilaya.zone.charAt(0).toUpperCase() + wilaya.zone.slice(1)}</td>
        <td>${fraisLivraison.toLocaleString('fr-DZ')} DA</td>
        <td>${delaiLivraison} jour${delaiLivraison > 1 ? 's' : ''}</td>
        <td><span class="status ${wilaya.status === 'active' ? 'success' : 'danger'}">${wilaya.status === 'active' ? 'Active' : 'Inactive'}</span></td>
        <td>
            <button class="action-btn edit" title="Modifier">
                <i class="fas fa-edit"></i>
            </button>
            <button class="action-btn delete" title="Supprimer">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;

    tableBody.appendChild(row);
}