// Gestionnaire des tableaux de données
export const TableManager = {
    init() {
        console.log('Initialisation du TableManager...');
        // Écouter les événements de mise à jour
        // DÉSACTIVÉ: data-store.js gère déjà updateColisTable
        // document.addEventListener('colisUpdated', () => this.updateColisTable());
        document.addEventListener('commercantUpdated', () => this.updateCommercantTable());
        document.addEventListener('retourUpdated', () => this.updateRetoursTable());
        document.addEventListener('reclamationUpdated', () => this.updateReclamationsTable());

        // Initialiser les gestionnaires des boutons d'action
        this.initActionButtons();
        console.log('TableManager initialisé - délégation à DataStore pour les mises à jour');
    },

    initActionButtons() {
        // Délégation d'événements pour les boutons d'action
        document.addEventListener('click', (e) => {
            const button = e.target.closest('.action-btn');
            if (!button) return;

            const id = button.dataset.id;
            if (!id) return;

            // Trouver la table parent
            const table = button.closest('table');
            if (!table) return;

            // Gérer les différents types d'actions
            if (button.classList.contains('edit')) {
                this.handleEdit(id, table.id);
            } else if (button.classList.contains('delete')) {
                this.handleDelete(id, table.id);
            }
        });
    },

    handleEdit(id, tableId) {
        console.log('Modification de l\'entrée:', id, 'dans la table:', tableId);
        switch (tableId) {
            case 'colisTable':
                const colis = window.DataStore.colis.find(c => c.id === id);
                if (!colis) {
                    console.error('Colis non trouvé:', id);
                    return;
                }

                // Ouvrir la modale de modification
                const modal = document.getElementById('colisModal');
                if (modal) {
                    const form = modal.querySelector('#colisForm');
                    if (form) {
                        // Remplir le formulaire avec les données existantes
                        form.querySelector('#colisRef').value = colis.reference || '';
                        form.querySelector('#colisClient').value = colis.clientNom || '';
                        form.querySelector('#colisTel').value = colis.clientTel || '';
                        form.querySelector('#colisAdresse').value = colis.adresse || '';
                        form.querySelector('#colisCommercant').value = colis.commercant || '';
                        form.querySelector('#colisDate').value = colis.date ? colis.date.split('T')[0] : '';
                        form.querySelector('#colisType').value = colis.type || 'Standard';
                        form.querySelector('#colisMontant').value = colis.montant || '';
                        form.querySelector('#colisStatut').value = colis.statut || 'En cours';

                        // Marquer le formulaire comme mode édition
                        form.dataset.editId = id;
                    }
                    modal.style.display = 'flex';
                }
                break;
        }
    },

    handleDelete(id, tableId) {
        if (!confirm('Voulez-vous vraiment supprimer cet élément ?')) return;

        console.log('Suppression de l\'entrée:', id, 'dans la table:', tableId);
        switch (tableId) {
            case 'colisTable':
                window.DataStore.deleteColis(id);
                document.dispatchEvent(new CustomEvent('colisUpdated'));
                break;
        }
    },

    // DÉSACTIVÉ: data-store.js gère déjà updateColisTable()
    /*
    updateColisTable() {
        const tableBody = document.querySelector('#colisTable tbody');
        if (!tableBody) {
            console.error('Table body des colis non trouvé');
            return;
        }

        console.log('Mise à jour de la table des colis...');

        // Vider le tableau
        tableBody.innerHTML = '';

        // Récupérer les données des colis depuis le DataStore
        const colis = window.DataStore.colis;
        console.log('Nombre de colis récupérés:', colis.length);

        // Ajouter chaque colis au tableau
        colis.forEach(colis => {
            const row = document.createElement('tr');
            row.dataset.id = colis.id;
            
            row.innerHTML = `
                <td><input type="checkbox" data-id="${colis.id}"/></td>
                <td><img src="data:image/png;base64,${this.generateQRCode(colis.reference)}" alt="QR Code" class="qr-code"/></td>
                <td>${colis.reference || '-'}</td>
                <td>${colis.clientNom || '-'}</td>
                <td>${colis.clientTel || '-'}</td>
                <td>${colis.adresse || '-'}</td>
                <td>${colis.commercant || '-'}</td>
                <td>${new Date(colis.date).toLocaleDateString()}</td>
                <td>${colis.type || 'Standard'}</td>
                <td><span class="status ${this.getStatusClass(colis.statut)}">${colis.statut || 'En cours'}</span></td>
                <td>${colis.montant ? colis.montant + ' DA' : '-'}</td>
                <td>
                    <button class="action-btn edit" data-id="${colis.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" data-id="${colis.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            tableBody.appendChild(row);
        });

        // Générer les QR codes
        document.querySelectorAll('.qr-code').forEach(img => {
            if (window.QRious) {
                new QRious({
                    element: img,
                    value: img.alt,
                    size: 50
                });
            }
        });
    },
    */

    updateCommercantTable() {
        // Implementation similaire pour la table des commerçants
    },

    updateRetoursTable() {
        // Implementation similaire pour la table des retours
    },

    updateReclamationsTable() {
        // Implementation similaire pour la table des réclamations
    },

    getStatusClass(status) {
        if (!status) return '';
        status = status.toLowerCase();
        switch(status) {
            case 'en cours': return 'pending';
            case 'livré': return 'success';
            case 'retourné': return 'danger';
            case 'en attente': return 'warning';
            default: return '';
        }
    },

    generateQRCode(value) {
        // Cette fonction sera utilisée si nécessaire pour générer un QR code
        return '';
    }
};