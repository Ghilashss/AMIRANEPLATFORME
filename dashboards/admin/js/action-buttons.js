// Action buttons functionality
export const ActionButtons = {
    createActionButtons(id, type) {
        return `
            <div class="action-buttons">
                <button class="btn-action view" data-id="${id}" onclick="ActionButtons.handleView('${id}', '${type}')">
                    <ion-icon name="eye-outline"></ion-icon>
                </button>
                <button class="btn-action edit" data-id="${id}" onclick="ActionButtons.handleEdit('${id}', '${type}')">
                    <ion-icon name="create-outline"></ion-icon>
                </button>
                <button class="btn-action delete" data-id="${id}" onclick="ActionButtons.handleDelete('${id}', '${type}')">
                    <ion-icon name="trash-outline"></ion-icon>
                </button>
            </div>
        `;
    },

    handleView(id, type) {
        console.log(`Viewing ${type} with id: ${id}`);
        // Implement view logic
    },

    handleEdit(id, type) {
        console.log(`Editing ${type} with id: ${id}`);
        const modal = document.getElementById(`${type}Modal`);
        if (modal) {
            modal.style.display = 'flex';
        }
    },

    handleDelete(id, type) {
        console.log(`Deleting ${type} with id: ${id}`);
        if (confirm(`Êtes-vous sûr de vouloir supprimer cet élément ?`)) {
            // Implement delete logic
        }
    }
};