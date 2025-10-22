// Test d'initialisation
console.log('Chargement de init.js');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM chargé');
    
    // Test des boutons
    const scanBtn = document.getElementById('scanColisBtn');
    const addBtn = document.getElementById('addColisBtn');
    const colisModal = document.getElementById('colisModal');
    
    console.log('Bouton Scanner trouvé:', !!scanBtn);
    console.log('Bouton Ajouter trouvé:', !!addBtn);
    console.log('Modal trouvée:', !!colisModal);
    
    // ⚠️ DÉSACTIVÉ - Géré maintenant par colis-scanner-manager.js
    // if (scanBtn) {
    //     scanBtn.onclick = function(e) {
    //         console.log('Clic sur Scanner');
    //         const scanZone = document.getElementById('scanColisZone');
    //         if (scanZone) {
    //             scanZone.style.display = 'flex';
    //         }
    //     };
    // }
    
    if (addBtn) {
        addBtn.onclick = function(e) {
            console.log('Clic sur Ajouter');
            if (colisModal) {
                // ✅ Réinitialiser le formulaire pour création
                const form = document.getElementById('colisForm');
                if (form) {
                    form.reset();
                    delete form.dataset.editId; // Supprimer l'ID d'édition
                    
                    // Remettre le titre à "Ajouter"
                    const modalTitle = colisModal.querySelector('h2');
                    if (modalTitle) {
                        modalTitle.textContent = '➕ Ajouter un Colis';
                    }
                    
                    console.log('✅ Formulaire réinitialisé pour création');
                }
                colisModal.style.display = 'flex';
            }
        };
    }
    
    // Gestionnaire de fermeture des modales
    window.onclick = function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
        if (e.target.classList.contains('close-button')) {
            e.target.closest('.modal').style.display = 'none';
        }
    };
});