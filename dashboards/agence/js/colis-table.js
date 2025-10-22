// Gestion du tableau des colis pour l'agence

// Fonction pour charger et afficher les colis depuis l'API
async function loadColisTable() {
    try {
        console.log('🔍 Chargement des colis depuis l\'API...');
        
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn('⚠️ Pas de token, impossible de charger les colis');
            displayEmptyState();
            return;
        }

        const response = await fetch(`${window.API_CONFIG.API_URL}/colis`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Colis chargés depuis l\'API:', result.data?.length || 0);
        
        const colis = result.data || [];
        
        // Cache localStorage pour fallback
        localStorage.setItem('colisCache', JSON.stringify(colis));
        
        displayColisTable(colis);
        
    } catch (error) {
        console.error('❌ Erreur chargement colis API:', error);
        
        // Fallback: cache localStorage
        const cached = localStorage.getItem('colisCache');
        if (cached) {
            console.log('💡 Utilisation du cache colis...');
            const colis = JSON.parse(cached);
            displayColisTable(colis);
        } else {
            displayEmptyState();
        }
    }
}

// Fonction pour afficher le tableau des colis
function displayColisTable(colis) {
    const tbody = document.getElementById('colisTableBody');
    
    if (!tbody) {
        console.warn('Table body non trouvé');
        return;
    }
    
    // Mettre à jour les statistiques
    updateColisStats(colis);
    
    // Si aucun colis
    if (colis.length === 0) {
        displayEmptyState();
        return;
    }
    
    // Afficher les colis
    tbody.innerHTML = colis.map(c => `
        <tr>
            <td>
                <div class="checkbox-wrapper">
                    <input type="checkbox" id="colis_${c._id || c.id}" />
                </div>
            </td>
            <td><strong>${c.reference || c._id || c.id}</strong></td>
            <td>${c.nomDestinataire || c.clientNom || 'N/A'}</td>
            <td>${c.telDestinataire || c.clientTel || 'N/A'}</td>
            <td>${getWilayaName(c.wilayaDest || c.wilaya) || c.wilayaDest || c.wilaya || 'N/A'}</td>
            <td>${formatDate(c.createdAt || c.date)}</td>
            <td><strong>${c.prixColis || 0} DA</strong></td>
            <td>${getStatusBadge(c.statut || 'en_attente')}</td>
            <td class="actions text-center">
                <button class="action-btn view" onclick="viewColis('${c._id || c.id}')" title="Voir les détails">
                    <ion-icon name="eye-outline"></ion-icon>
                </button>
                <button class="action-btn edit" onclick="editColis('${c._id || c.id}')" title="Modifier">
                    <ion-icon name="create-outline"></ion-icon>
                </button>
                <button class="action-btn delete" onclick="deleteColis('${c._id || c.id}')" title="Supprimer">
                    <ion-icon name="trash-outline"></ion-icon>
                </button>
            </td>
        </tr>
    `).join('');
}

// Fonction pour afficher l'état vide
function displayEmptyState() {
    const tbody = document.getElementById('colisTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = `
        <tr>
            <td colspan="9" style="text-align: center; padding: 40px;">
                <i class="fas fa-box-open" style="font-size: 48px; color: #ccc; margin-bottom: 10px;"></i>
                <p style="color: #999;">Aucun colis enregistré</p>
            </td>
        </tr>
    `;
}

// Fonction pour mettre à jour les statistiques
function updateColisStats(colis) {
    const totalColis = document.getElementById('totalColis');
    const colisTransit = document.getElementById('colisTransit');
    const colisAttente = document.getElementById('colisAttente');
    const colisRetard = document.getElementById('colisRetard');
    
    if (totalColis) totalColis.textContent = colis.length;
    
    if (colisTransit) {
        const transit = colis.filter(c => c.statut === 'en_transit').length;
        colisTransit.textContent = transit;
    }
    
    if (colisAttente) {
        const attente = colis.filter(c => c.statut === 'en_attente').length;
        colisAttente.textContent = attente;
    }
    
    if (colisRetard) {
        // Logique pour détecter les retards (à adapter selon vos besoins)
        colisRetard.textContent = 0;
    }
}

// Fonction pour obtenir le nom de la wilaya
function getWilayaName(code) {
    try {
        const wilayas = JSON.parse(localStorage.getItem('wilayas') || '[]');
        const wilaya = wilayas.find(w => w.code === code);
        return wilaya ? wilaya.nom : code;
    } catch (error) {
        return code;
    }
}

// Fonction pour formater la date
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (error) {
        return 'N/A';
    }
}

// Fonction pour obtenir le badge de statut
function getStatusBadge(statut) {
    const statusMap = {
        'en_attente': { label: 'En attente', class: 'warning' },
        'en_transit': { label: 'En transit', class: 'info' },
        'livre': { label: 'Livré', class: 'success' },
        'retour': { label: 'Retourné', class: 'danger' }
    };
    
    const status = statusMap[statut] || { label: statut, class: 'warning' };
    return `<span class="status ${status.class}">${status.label}</span>`;
}

// Fonction pour voir les détails d'un colis
window.viewColis = async function(id) {
    try {
        console.log('🔍 Chargement des détails du colis:', id);
        
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Session expirée - Reconnectez-vous');
            return;
        }

        const response = await fetch(`${window.API_CONFIG.API_URL}/colis/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const result = await response.json();
        const colisToView = result.data;
        
        if (colisToView) {
            const details = `
Référence: ${colisToView.reference || colisToView._id}
Client: ${colisToView.nomDestinataire}
Téléphone: ${colisToView.telDestinataire}
Wilaya: ${getWilayaName(colisToView.wilayaDest)}
Type de livraison: ${colisToView.typeLivraison}
Poids: ${colisToView.poids} kg
Prix: ${colisToView.prixColis} DA
Frais de livraison: ${colisToView.fraisLivraison || 0} DA
Statut: ${colisToView.statut || 'en_attente'}
Description: ${colisToView.description || 'N/A'}
            `;
            alert(details);
        }
    } catch (error) {
        console.error('❌ Erreur:', error);
        alert('Erreur lors de l\'affichage des détails');
    }
};

// Fonction pour modifier un colis
window.editColis = function(id) {
    alert('Fonction de modification en cours de développement');
};

// Fonction pour supprimer un colis
window.deleteColis = async function(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce colis ?')) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Session expirée - Reconnectez-vous');
                return;
            }

            const response = await fetch(`${window.API_CONFIG.API_URL}/colis/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            console.log('✅ Colis supprimé via API');
            await loadColisTable(); // Recharger le tableau
            alert('Colis supprimé avec succès');
        } catch (error) {
            console.error('❌ Erreur:', error);
            alert('Erreur lors de la suppression');
        }
    }
};

// Fonction de recherche
function setupColisSearch() {
    const searchInput = document.getElementById('colisSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('#colisTableBody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }
}

// Fonction de filtrage
function setupColisFilters() {
    const filterStatut = document.getElementById('filterStatut');
    const filterWilaya = document.getElementById('filterWilaya');
    
    // Charger les wilayas dans le filtre
    try {
        const wilayas = JSON.parse(localStorage.getItem('wilayas') || '[]');
        if (filterWilaya && wilayas.length > 0) {
            filterWilaya.innerHTML = '<option value="all">Toutes les wilayas</option>' +
                wilayas.map(w => `<option value="${w.code}">${w.nom}</option>`).join('');
        }
    } catch (error) {
        console.error('Erreur lors du chargement des wilayas:', error);
    }
    
    // Appliquer les filtres
    const applyFilters = () => {
        try {
            const colis = JSON.parse(localStorage.getItem('colis') || '[]');
            let filtered = [...colis];
            
            // Filtre par statut
            if (filterStatut && filterStatut.value !== 'all') {
                filtered = filtered.filter(c => c.statut === filterStatut.value);
            }
            
            // Filtre par wilaya
            if (filterWilaya && filterWilaya.value !== 'all') {
                filtered = filtered.filter(c => c.wilaya === filterWilaya.value);
            }
            
            // Mettre à jour le tableau
            const tbody = document.getElementById('colisTableBody');
            if (tbody) {
                if (filtered.length === 0) {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="9" style="text-align: center; padding: 40px;">
                                <p style="color: #999;">Aucun résultat trouvé</p>
                            </td>
                        </tr>
                    `;
                } else {
                    tbody.innerHTML = filtered.map(c => `
                        <tr>
                            <td><div class="checkbox-wrapper"><input type="checkbox" id="colis_${c.id}" /></div></td>
                            <td><strong>${c.reference || c.id}</strong></td>
                            <td>${c.clientNom || 'N/A'}</td>
                            <td>${c.clientTel || 'N/A'}</td>
                            <td>${getWilayaName(c.wilaya) || c.wilaya || 'N/A'}</td>
                            <td>${formatDate(c.date)}</td>
                            <td><strong>${c.prixColis || 0} DA</strong></td>
                            <td>${getStatusBadge(c.statut)}</td>
                            <td class="actions text-center">
                                <button class="action-btn view" onclick="viewColis('${c.id}')" title="Voir les détails">
                                    <ion-icon name="eye-outline"></ion-icon>
                                </button>
                                <button class="action-btn edit" onclick="editColis('${c.id}')" title="Modifier">
                                    <ion-icon name="create-outline"></ion-icon>
                                </button>
                                <button class="action-btn delete" onclick="deleteColis('${c.id}')" title="Supprimer">
                                    <ion-icon name="trash-outline"></ion-icon>
                                </button>
                            </td>
                        </tr>
                    `).join('');
                }
            }
        } catch (error) {
            console.error('Erreur lors du filtrage:', error);
        }
    };
    
    if (filterStatut) filterStatut.addEventListener('change', applyFilters);
    if (filterWilaya) filterWilaya.addEventListener('change', applyFilters);
}

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initialisation du tableau des colis');
    
    // Charger les colis au démarrage
    setTimeout(() => {
        loadColisTable();
        setupColisSearch();
        setupColisFilters();
    }, 500);
    
    // Recharger les colis quand on affiche la page colis
    const colisPageLink = document.querySelector('a[data-page="colis"]');
    if (colisPageLink) {
        colisPageLink.addEventListener('click', function() {
            setTimeout(() => {
                loadColisTable();
            }, 100);
        });
    }
});

// Export des fonctions
window.loadColisTable = loadColisTable;
