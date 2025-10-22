import { wilayaManager } from '/dashboards/admin/js/wilaya-manager.js';
import { agenceStore } from '/dashboards/shared/agence-store.js';

class SelectionManager {
    static async initWilayas() {
        // wilayaManager charge automatiquement les wilayas dans son constructeur
        // Pas besoin d'appeler init()
        const wilayaSelect = document.getElementById('wilayaDest');
        if (wilayaSelect) {
            // Attendre un peu que les wilayas soient chargées
            await new Promise(resolve => setTimeout(resolve, 100));
            
            wilayaSelect.innerHTML = `
                <option value="">Sélectionner une wilaya</option>
                ${wilayaManager.wilayas.map(w => `
                    <option value="${w.code}">${w.code} - ${w.nom}</option>
                `).join('')}
            `;
        }
    }

    static initAgenceSource() {
        const bureauSourceSelect = document.getElementById('bureauSource');
        const agences = agenceStore.getActiveAgences();
        
        if (bureauSourceSelect) {
            bureauSourceSelect.innerHTML = `
                <option value="">Sélectionner le bureau source</option>
                ${agences.map(agence => `
                    <option value="${agence.id}">${agence.code} - ${agence.nom}</option>
                `).join('')}
            `;
        }
    }

    static updateAgenceDest(wilayaCode) {
        const bureauDestSelect = document.getElementById('bureauDest');
        if (!bureauDestSelect) return;

        if (!wilayaCode) {
            bureauDestSelect.innerHTML = '<option value="">Sélectionner un bureau</option>';
            return;
        }

        const agences = agenceStore.getAgencesByWilaya(wilayaCode);
        bureauDestSelect.innerHTML = `
            <option value="">Sélectionner le bureau destination</option>
            ${agences.map(agence => `
                <option value="${agence.id}">${agence.code} - ${agence.nom}</option>
            `).join('')}
        `;
    }

    static init() {
        this.initWilayas().then(() => {
            this.initAgenceSource();
            
            // Handle wilaya selection
            const wilayaSelect = document.getElementById('wilayaDest');
            if (wilayaSelect) {
                wilayaSelect.addEventListener('change', (e) => {
                    this.updateAgenceDest(e.target.value);
                });
            }
        });
    }
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', () => {
    SelectionManager.init();
});

export default SelectionManager;