import { wilayaManager, wilayasData } from './wilaya-manager.js';
import { agenceStore } from '../../shared/agence-store.js';
import { DataStore } from './data-store.js';

// Fonction pour valider le nom de l'agence
function validateAgenceName(input) {
    const value = input.value.trim();
    const errorElement = document.getElementById('agenceNameError');
    
    if (!value) {
        input.classList.add('invalid');
        input.classList.remove('valid');
        if (errorElement) {
            errorElement.style.display = 'block';
            errorElement.textContent = 'Le nom de l\'agence est requis';
            errorElement.classList.add('error-shake');
            setTimeout(() => errorElement.classList.remove('error-shake'), 500);
        }
        return false;
    } else {
        input.classList.remove('invalid');
        input.classList.add('valid');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
        return true;
    }
}

// 🔥 MIGRÉ VERS API - Fonction pour mettre à jour l'interface utilisateur
async function updateUI() {
    console.log('🔄 updateUI() appelé - Rechargement depuis MongoDB API');
    
    // ✅ Recharger les agences depuis MongoDB API (pas localStorage!)
    try {
        await DataStore.loadAgences();
        console.log('✅ Agences rechargées depuis MongoDB API:', DataStore.agences.length, 'agences');
        
        // Utiliser DataStore pour mettre à jour le tableau
        if (DataStore && DataStore.updateAgencesTable) {
            console.log('🔧 Appel de DataStore.updateAgencesTable()');
            DataStore.updateAgencesTable();
        } else {
            console.error('❌ DataStore ou updateAgencesTable non disponible');
        }
        
        // Mettre à jour le compteur total
        const totalAgences = document.getElementById('totalAgences');
        if (totalAgences) {
            totalAgences.textContent = DataStore.agences.length;
            console.log('✅ Compteur total mis à jour:', DataStore.agences.length);
        } else {
            console.warn('⚠️ Élément totalAgences non trouvé');
        }
    } catch (error) {
        console.error('❌ Erreur lors du rechargement des agences:', error);
    }
}

// Fonction pour remplir le select des wilayas
function updateWilayaSelect(selectedValue = '') {
    const wilayaSelect = document.getElementById('agenceWilayaSelect');
    if (wilayaSelect) {
        // Sauvegarder la sélection actuelle
        const currentSelection = wilayaSelect.value;
        
        wilayaSelect.innerHTML = '<option value="">Sélectionner une wilaya...</option>';
        
        // Récupérer les wilayas sauvegardées dans localStorage
        let wilayasActives = [];
        try {
            const savedWilayas = localStorage.getItem('wilayas');
            wilayasActives = savedWilayas ? JSON.parse(savedWilayas) : [];
            console.log('Wilayas disponibles:', wilayasActives); // Pour le débogage
        } catch (error) {
            console.error('Erreur lors du chargement des wilayas:', error);
        }

        if (wilayasActives && wilayasActives.length > 0) {
            wilayasActives.forEach(wilaya => {
                if (wilaya && wilaya.code && wilaya.nom) {
                    const option = document.createElement('option');
                    option.value = wilaya.code;
                    option.textContent = `${wilaya.code} - ${wilaya.nom}`;
                    if(wilaya.code === (selectedValue || currentSelection)) {
                        option.selected = true;
                    }
                    wilayaSelect.appendChild(option);
                }
            });
        } else {
            console.log('Aucune wilaya trouvée. Veuillez d\'abord ajouter des wilayas.');
            const message = document.createElement('option');
            message.disabled = true;
            message.text = 'Aucune wilaya disponible';
            wilayaSelect.appendChild(message);
        }
        
        // Si aucune wilaya n'est sélectionnée, mettre le focus sur le select
        if (!wilayaSelect.value) {
            wilayaSelect.focus();
        }

        // Ajouter le message d'erreur pour la wilaya s'il n'existe pas déjà
        let errorDiv = document.getElementById('wilayaError');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'wilayaError';
            errorDiv.className = 'error-message';
            wilayaSelect.parentNode.appendChild(errorDiv);
        }

        // Ajouter la validation au changement
        wilayaSelect.addEventListener('change', function() {
            if (!this.value) {
                errorDiv.textContent = 'Veuillez sélectionner une wilaya';
                errorDiv.style.display = 'block';
                this.classList.add('invalid');
                this.classList.remove('valid');
            } else {
                errorDiv.textContent = '';
                errorDiv.style.display = 'none';
                this.classList.remove('invalid');
                this.classList.add('valid');
            }
        });
    }
}

// Fonction pour ouvrir le modal
function openAgenceModal() {
    updateWilayaSelect(); // Mettre à jour la liste des wilayas à chaque ouverture du modal
    const modal = document.getElementById('agenceModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

// Fonction pour fermer le modal
function closeAgenceModal() {
    const modal = document.getElementById('agenceModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Initialisation des gestionnaires d'événements
// La fonction validateAgenceName a été déplacée plus haut dans le fichier

import { setupAgenceFormValidation } from './agence-form-validation.js';

document.addEventListener('DOMContentLoaded', function() {
    // Mettre à jour l'interface au chargement initial
    console.log('Initialisation de la page des agences...');
    updateUI();

    // Initialiser la validation du formulaire
    setupAgenceFormValidation();
    
    // Ajouter la validation en temps réel sur le champ nom
    const nameInput = document.getElementById('agenceName');
    if (nameInput) {
        nameInput.addEventListener('input', function() {
            validateAgenceName(this);
        });
        
        nameInput.addEventListener('blur', function() {
            validateAgenceName(this);
        });
    }

    // Bouton pour ouvrir le modal
    const addButton = document.getElementById('addAgenceBtn');
    if (addButton) {
        addButton.addEventListener('click', function(e) {
            e.preventDefault();
            updateWilayaSelect(); // Reset la sélection
            openAgenceModal();
            
            // Focus sur le champ nom avec un petit délai pour laisser le modal s'ouvrir
            setTimeout(() => {
                const nameInput = document.getElementById('agenceName');
                if (nameInput) {
                    nameInput.focus();
                }
            }, 100);
        });
    }

    // Bouton pour fermer le modal
    const closeButton = document.querySelector('#agenceModal .close-button');
    if (closeButton) {
        closeButton.addEventListener('click', closeAgenceModal);
    }

    // Fermer le modal en cliquant en dehors
    const modal = document.getElementById('agenceModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeAgenceModal();
            }
        });
    }

    // Fonction pour gérer les actions sur une agence
    function handleAgenceAction(e) {
        const button = e.target.closest('.action-btn');
        if (!button) return;
        
        const agenceCode = button.dataset.id;
        if (!agenceCode) {
            console.error('Code de l\'agence non trouvé');
            return;
        }

        const agence = agenceStore.getAgence(agenceCode);
        if (!agence) {
            console.error('Agence non trouvée:', agenceCode);
            return;
        }

        if (button.classList.contains('view')) {
            // Afficher les détails de l'agence
            alert(`Détails de l'agence ${agence.nom}:\nCode: ${agence.code}\nWilaya: ${agence.wilayaText}\nEmail: ${agence.email}\nTéléphone: ${agence.telephone}`);
        } else if (button.classList.contains('edit')) {
            // Remplir le formulaire pour l'édition
            const form = document.getElementById('agenceForm');
            if (form) {
                document.getElementById('agenceName').value = agence.nom || '';
                document.getElementById('agencePhone').value = agence.telephone || '';
                document.getElementById('agenceEmail').value = agence.email || '';
                document.getElementById('agencePassword').value = agence.password || '';
                updateWilayaSelect(agence.wilaya);
                form.dataset.editId = agenceCode;
                openAgenceModal();
            }
        } else if (button.classList.contains('delete')) {
            if (confirm(`Êtes-vous sûr de vouloir supprimer l'agence ${agence.nom} ?`)) {
                try {
                    agenceStore.deleteAgence(agenceCode);
                    updateUI();
                } catch (error) {
                    console.error('Erreur lors de la suppression:', error);
                    alert('Erreur lors de la suppression de l\'agence');
                }
            }
        }
    }

    // Ajouter l'écouteur d'événements pour les actions sur les agences
    const agencesTable = document.getElementById('agencesTable');
    if (agencesTable) {
        agencesTable.addEventListener('click', handleAgenceAction);
    }

    // Gestion du formulaire
    const form = document.getElementById('agenceForm');
    if (form) {
        // Ajouter un gestionnaire d'événements pour la validation en temps réel
        const nameInput = document.getElementById('agenceName');
        if (nameInput) {
            nameInput.addEventListener('input', function(e) {
                const value = e.target.value.trim();
                if (!value) {
                    e.target.setCustomValidity('Le nom de l\'agence est requis');
                    e.target.reportValidity();
                } else {
                    e.target.setCustomValidity('');
                }
            });
        }

        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Récupération et validation du nom
            const nameInput = document.getElementById('agenceName');
            const nom = nameInput ? nameInput.value.trim() : '';
            
            if (!nom) {
                alert('Le nom de l\'agence est requis');
                if (nameInput) {
                    nameInput.focus();
                    nameInput.setCustomValidity('Le nom de l\'agence est requis');
                    nameInput.reportValidity();
                }
                return;
            }

            // Récupération et validation de la wilaya
            const wilayaSelect = document.getElementById('agenceWilayaSelect');
            const wilaya = wilayaSelect ? wilayaSelect.value.trim() : '';
            
            if (!wilaya) {
                alert('Veuillez sélectionner une wilaya');
                if (wilayaSelect) {
                    wilayaSelect.focus();
                }
                return;
            }

            // Validation du numéro de téléphone et email
            const telephone = document.getElementById('agencePhone')?.value.trim() || '';
            const email = document.getElementById('agenceEmail')?.value.trim() || '';
            const password = document.getElementById('agencePassword')?.value.trim() || '';

            // Récupérer le texte de la wilaya sélectionnée
            const selectedOption = wilayaSelect.options[wilayaSelect.selectedIndex];
            const optionText = selectedOption.text.trim();
            
            // Extraire le nom de la wilaya (format: "CODE - NOM")
            let wilayaNom = optionText;
            if (optionText.includes(' - ')) {
                wilayaNom = optionText.split(' - ')[1].trim();
            }
            
            console.log('Wilaya sélectionnée:', { code: wilaya, nom: wilayaNom, texteOption: optionText });
            
            // Construction des données du formulaire
            const formData = {
                nom: nom,
                wilaya: wilaya,
                wilayaText: wilayaNom, // Ajout du nom de la wilaya
                telephone: telephone,
                email: email,
                password: password,
                dateCreation: new Date().toISOString(),
                status: 'active'
            };

            try {
                console.log('Tentative d\'ajout/modification d\'agence avec les données:', formData);
                
                if (form.dataset.editId) {
                    // Mode édition
                    await agenceStore.updateAgence(form.dataset.editId, formData);
                    console.log('Agence mise à jour avec succès');
                } else {
                    // Mode création
                    const newAgence = await agenceStore.addAgence(formData);
                    console.log('Nouvelle agence créée:', newAgence);
                }
                
                // Réinitialiser le formulaire
                form.reset();
                delete form.dataset.editId;
                
                // Fermer le modal immédiatement
                closeAgenceModal();
                
                // ✅ Recharger depuis MongoDB API après ajout/modification
                console.log('🔄 Rechargement depuis MongoDB API après ajout/modification');
                
                // Attendre que le modal soit fermé, puis rafraîchir depuis MongoDB
                setTimeout(async () => {
                    await updateUI();
                }, 150);
                
            } catch (error) {
                console.error('Erreur lors de l\'ajout/modification de l\'agence:', error);
                alert(error.message || 'Une erreur est survenue lors de l\'enregistrement de l\'agence');
                
                // Mettre le focus sur le champ approprié
                if (error.message.includes('nom')) {
                    nameInput?.focus();
                } else if (error.message.includes('wilaya')) {
                    wilayaSelect?.focus();
                }
                return;
            }
        });
    }

    // Fonction pour gérer les clics sur les actions
    function handleActionClick(event) {
        // Trouver l'élément cliqué (bouton ou icône)
        const icon = event.target.closest('i.fas');
        const button = event.target.closest('.action-btn');
        
        // Si ni icône ni bouton n'est trouvé, sortir
        if (!icon && !button) return;
        
        // Obtenir le bouton d'action (que ce soit via l'icône ou directement)
        const actionButton = button || icon.closest('.action-btn');
        if (!actionButton) return;
        
        const id = actionButton.dataset.id;
        if (!id) return;
        
        // Déterminer l'action par l'icône ou la classe du bouton
        const isDelete = actionButton.classList.contains('delete') || 
                        icon?.classList.contains('fa-trash');
        const isEdit = actionButton.classList.contains('edit') || 
                      icon?.classList.contains('fa-edit');
        
        if (isDelete) {
            if (confirm('Êtes-vous sûr de vouloir supprimer cette agence ?')) {
                agenceStore.deleteAgence(id);
                updateUI();
            }
        } else if (isEdit) {
            const agence = agenceStore.getAgence(id);
            if (agence) {
                // Remplir le formulaire
                document.getElementById('agenceName').value = agence.nom || '';
                document.getElementById('agencePhone').value = agence.telephone || '';
                document.getElementById('agenceEmail').value = agence.email || '';
                document.getElementById('agencePassword').value = agence.password || '';
                
                // Mettre à jour le select avec la wilaya
                updateWilayaSelect(agence.wilaya);
                
                // Stocker l'ID pour l'édition
                const form = document.getElementById('agenceForm');
                if (form) {
                    form.dataset.editId = id;
                }
                
                openAgenceModal();
            }
        }
    }


});

// Fonction pour ajouter une agence au tableau
function addAgenceToTable(agence) {
    const tableBody = document.querySelector('#agencesTable tbody');
    if (!tableBody) return;

    // Récupérer les informations de la wilaya depuis localStorage
    let wilayaNom = agence.wilaya;
    try {
        const savedWilayas = localStorage.getItem('wilayas');
        const wilayas = savedWilayas ? JSON.parse(savedWilayas) : [];
        const wilayaInfo = wilayas.find(w => w.code === agence.wilaya);
        if (wilayaInfo) {
            wilayaNom = wilayaInfo.nom;
        }
    } catch (error) {
        console.error('Erreur lors de la récupération du nom de la wilaya:', error);
    }

    const row = document.createElement('tr');
    row.innerHTML = `
        <td>
            <div class="checkbox-wrapper">
                <input type="checkbox" id="agence_${generateAgenceCode(agence.wilaya)}" />
                <label for="agence_${generateAgenceCode(agence.wilaya)}"></label>
            </div>
        </td>
        <td>${generateAgenceCode(agence.wilaya)}</td>
        <td>${agence.nom}</td>
        <td>${wilayaNom}</td>
        <td>${agence.email}</td>
        <td>${agence.telephone}</td>
        <td><span class="status success">Active</span></td>
        <td class="actions">
            <button class="action-btn view" data-id="${generateAgenceCode(agence.wilaya)}" title="Voir les détails">
                <ion-icon name="eye-outline"></ion-icon>
            </button>
            <button class="action-btn edit" data-id="${generateAgenceCode(agence.wilaya)}" title="Modifier">
                <ion-icon name="create-outline"></ion-icon>
            </button>
            <button class="action-btn delete" data-id="${generateAgenceCode(agence.wilaya)}" title="Supprimer">
                <ion-icon name="trash-outline"></ion-icon>
            </button>
        </td>
    `;

    tableBody.appendChild(row);
}

// Fonction pour éditer une agence
function editAgence(agenceId) {
    const agence = agenceStore.getAgence(agenceId);
    if (!agence) {
        console.error('Agence non trouvée');
        return;
    }

    // Remplir le formulaire avec les données de l'agence
    const form = document.getElementById('agenceForm');
    if (form) {
        document.getElementById('agenceName').value = agence.nom;
        document.getElementById('agencePhone').value = agence.telephone || '';
        document.getElementById('agenceEmail').value = agence.email || '';
        document.getElementById('agencePassword').value = agence.password || '';
        
        // Mettre à jour le select avec la wilaya sélectionnée
        updateWilayaSelect(agence.wilaya);
        
        // Stocker l'ID pour l'édition
        form.dataset.editId = agenceId;
        
        // Ouvrir le modal
        openAgenceModal();
    }
}

// Fonction pour supprimer une agence
function deleteAgence(agenceId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette agence ?')) {
        try {
            agenceStore.deleteAgence(agenceId);
            updateUI(); // Mettre à jour l'interface
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            alert('Erreur lors de la suppression de l\'agence');
        }
    }
}

// Fonction pour générer un code d'agence
function generateAgenceCode(wilaya) {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `AG${year}${month}-${wilaya}-${random}`;
}