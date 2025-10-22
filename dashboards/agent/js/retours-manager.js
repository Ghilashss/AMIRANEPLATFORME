// ==================== GESTIONNAIRE DE RETOURS - VERSION API ====================

class RetoursManager {
    constructor() {
        this.retours = [];
        this.scanner = null;
        this.init();
    }

    init() {
        this.loadRetours();
        this.initEventListeners();
        this.updateStats();
        this.renderTable();
        this.populateWilayaFilter();
    }

    // Charger les retours depuis l'API
    async loadRetours() {
        try {
            console.log('🔍 Chargement des retours depuis l\'API...');
            
            const token = sessionStorage.getItem('auth_token') || localStorage.getItem('agent_token');
            if (!token) {
                console.warn('⚠️ Pas de token, impossible de charger les retours');
                this.retours = [];
                return;
            }

            const response = await fetch(`${window.API_CONFIG.API_URL}/retours`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const result = await response.json();
            this.retours = result.data || [];
            console.log(`✅ ${this.retours.length} retours chargés depuis l'API`);
            
            // Cache localStorage pour fallback
            localStorage.setItem('retoursCache', JSON.stringify(this.retours));
            
            this.updateStats();
            this.renderTable();
            
        } catch (error) {
            console.error('❌ Erreur chargement retours API:', error);
            
            // Fallback: cache localStorage
            const cached = localStorage.getItem('retoursCache');
            if (cached) {
                console.log('💡 Utilisation du cache retours...');
                this.retours = JSON.parse(cached);
                this.updateStats();
                this.renderTable();
            } else {
                this.retours = [];
            }
        }
    }

    // Sauvegarder un retour via l'API
    async saveRetour(retourData) {
        try {
            console.log('💾 Enregistrement du retour via API...');
            
            const token = sessionStorage.getItem('auth_token') || localStorage.getItem('agent_token');
            if (!token) {
                throw new Error('Token manquant - reconnectez-vous');
            }

            const response = await fetch(`${window.API_CONFIG.API_URL}/retours`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(retourData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erreur lors de l\'enregistrement');
            }

            const result = await response.json();
            console.log('✅ Retour enregistré via API:', result.data);
            
            // Recharger les retours depuis l'API
            await this.loadRetours();
            
            return result.data;
        } catch (error) {
            console.error('❌ Erreur enregistrement retour:', error);
            throw error;
        }
    }

    // Initialiser les événements
    initEventListeners() {
        // Bouton scanner
        const scanBtn = document.getElementById('scanRetourBtn');
        if (scanBtn) {
            scanBtn.addEventListener('click', () => this.openScanner());
        }

        // Bouton fermer scanner
        const closeBtn = document.getElementById('closeScanRetour');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeScanner());
        }

        // Bouton validation manuelle
        const submitManualBtn = document.getElementById('submitManualRetour');
        if (submitManualBtn) {
            submitManualBtn.addEventListener('click', () => this.handleManualInput());
        }

        // Entrée avec touche Enter
        const manualInput = document.getElementById('manualRetourInput');
        if (manualInput) {
            manualInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleManualInput();
                }
            });
        }

        // Recherche
        const searchInput = document.getElementById('retoursSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        // Filtres
        const filterDate = document.getElementById('filterDateRetour');
        const filterMotif = document.getElementById('filterMotifRetour');
        const filterWilaya = document.getElementById('filterWilayaRetour');
        const resetBtn = document.getElementById('resetFiltersRetour');

        if (filterDate) filterDate.addEventListener('change', () => this.applyFilters());
        if (filterMotif) filterMotif.addEventListener('change', () => this.applyFilters());
        if (filterWilaya) filterWilaya.addEventListener('change', () => this.applyFilters());
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetFilters());

        // Export
        const exportBtn = document.getElementById('exportRetoursBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportRetours());
        }

        // Select all
        const selectAll = document.getElementById('selectAllRetours');
        if (selectAll) {
            selectAll.addEventListener('change', (e) => this.toggleSelectAll(e.target.checked));
        }
    }

    // Ouvrir le scanner
    openScanner() {
        const scanZone = document.getElementById('scanRetourZone');
        if (!scanZone) return;

        scanZone.style.display = 'block';

        // Initialiser Html5Qrcode
        if (!this.scanner) {
            this.scanner = new Html5Qrcode("qr-reader-retour");
        }

        this.scanner.start(
            { facingMode: "environment" },
            {
                fps: 10,
                qrbox: { width: 250, height: 250 }
            },
            (decodedText) => {
                this.handleScan(decodedText);
            },
            (errorMessage) => {
                // Ignorer les erreurs de scan
            }
        ).catch(err => {
            console.error('Erreur scanner:', err);
            alert('Impossible de démarrer le scanner. Vérifiez les permissions de la caméra.');
        });
    }

    // Fermer le scanner
    closeScanner() {
        const scanZone = document.getElementById('scanRetourZone');
        if (scanZone) {
            scanZone.style.display = 'none';
        }

        if (this.scanner) {
            this.scanner.stop().catch(err => console.error('Erreur arrêt scanner:', err));
        }
    }

    // Gérer la saisie manuelle
    handleManualInput() {
        const input = document.getElementById('manualRetourInput');
        if (!input) return;

        const codeSuivi = input.value.trim();
        if (!codeSuivi) {
            alert('⚠️ Veuillez entrer un code de suivi');
            return;
        }

        // Traiter le code comme un scan
        this.handleScan(codeSuivi);
        
        // Vider le champ
        input.value = '';
    }

    // Gérer le scan d'un QR code
    async handleScan(codeSuivi) {
        this.closeScanner();

        // 🔥 MIGRÉ VERS API - Charger les colis depuis MongoDB
        let colisList = [];
        
        try {
            const token = sessionStorage.getItem('auth_token') || localStorage.getItem('agent_token');
            const response = await fetch(`${window.API_CONFIG.API_URL}/colis`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            colisList = result.data || [];
            console.log(`✅ ${colisList.length} colis chargés depuis API MongoDB`);
            
        } catch (error) {
            console.error('❌ Erreur chargement API colis:', error);
            alert('⚠️ Erreur de connexion à la base de données.\n\nVeuillez vérifier que le serveur est démarré.');
            return;
        }
        
        // Chercher le colis par tracking (MongoDB), reference, ou codeSuivi
        const colis = colisList.find(c => 
            c.tracking === codeSuivi || 
            c.reference === codeSuivi || 
            c.trackingNumber === codeSuivi ||
            c.codeSuivi === codeSuivi
        );

        if (!colis) {
            alert(`❌ Colis ${codeSuivi} introuvable !\n\nNombre de colis disponibles: ${colisList.length}`);
            return;
        }

        // Vérifier si déjà en retour (avec mapping tracking MongoDB)
        const dejaRetour = this.retours.find(r => 
            r.reference === codeSuivi || 
            r.reference === colis.tracking ||
            r.colisId === (colis._id || colis.id)
        );
        if (dejaRetour) {
            alert(`⚠️ Ce colis est déjà marqué en retour !`);
            return;
        }

        // Demander le motif du retour
        const motif = this.selectMotifRetour();
        if (!motif) return;

        // Extraire le code de suivi avec MAPPING CORRECT MongoDB
        const code = colis.tracking || colis.codeSuivi || colis.reference || colis.trackingNumber || codeSuivi;
        const destinataireNom = colis.destinataire?.nom || colis.nomDestinataire || colis.client || colis.clientNom || '-';
        const wilayaDest = colis.wilayaDestination || colis.wilayaDest || colis.wilaya || colis.destinataire?.wilaya || '-';

        // Créer les données du retour pour l'API
        const retourData = {
            colisId: colis._id || colis.id,
            reference: code,
            nomDestinataire: destinataireNom,
            wilaya: wilayaDest,
            motifRetour: motif.value,
            commentaire: motif.commentaire || '',
            livreurNom: localStorage.getItem('userName') || 'Agent',
            fraisRetour: 0
        };

        try {
            // Enregistrer via API
            await this.saveRetour(retourData);

            // Mettre à jour le statut du colis vers 'en_retour' (enum valide du modèle Colis)
            await this.updateColisStatus(colis._id || colis.id, 'en_retour');

            alert(`✅ Retour enregistré avec succès !\n\nColis: ${code}\nMotif: ${motif.label}`);
            
        } catch (error) {
            alert(`❌ Erreur lors de l'enregistrement:\n${error.message}`);
            console.error('❌ Erreur:', error);
        }
    }

    async updateColisStatus(colisId, newStatus) {
        try {
            const token = sessionStorage.getItem('auth_token') || localStorage.getItem('agent_token');
            if (!token) {
                console.error('❌ Pas de token pour mise à jour statut');
                return;
            }

            console.log(`🔄 Mise à jour statut colis ${colisId} vers "${newStatus}"`);

            // ✅ CORRECTION: Utiliser la route correcte PUT /api/colis/:id/status
            const response = await fetch(`${window.API_CONFIG.API_URL}/colis/${colisId}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    status: newStatus,
                    description: 'Colis marqué en retour par l\'agent'
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Statut du colis mis à jour via API:', result);
                
                // Émettre un événement pour rafraîchir le tableau des colis
                document.dispatchEvent(new CustomEvent('colisUpdated'));
                
                // Recharger les colis depuis l'API
                if (window.DataStore && typeof window.DataStore.loadColis === 'function') {
                    await window.DataStore.loadColis();
                    console.log('✅ Liste des colis rechargée');
                }
                
                // ✅ Rafraîchir l'affichage des retours
                this.updateStats();
                this.renderTable();
            } else {
                const error = await response.json();
                console.error('❌ Erreur API mise à jour statut:', error);
            }
        } catch (error) {
            console.error('❌ Erreur mise à jour statut colis:', error);
        }
    }

    // Sélectionner le motif du retour
    selectMotifRetour() {
        const motifChoisi = prompt(
            'Motif du retour:\n' +
            '1. Client absent\n' +
            '2. Refus du colis\n' +
            '3. Adresse incorrecte\n' +
            '4. Téléphone incorrect\n' +
            '5. Prix trop élevé\n' +
            '6. Colis endommagé\n' +
            '7. Erreur commande\n' +
            '8. Autre\n\n' +
            'Entrez le numéro (1-8):'
        );

        const motifMap = {
            '1': { value: 'client_absent', label: 'Client absent' },
            '2': { value: 'refus_client', label: 'Refus du colis' },
            '3': { value: 'adresse_introuvable', label: 'Adresse incorrecte' },
            '4': { value: 'telephone_incorrect', label: 'Téléphone incorrect' },
            '5': { value: 'prix_trop_eleve', label: 'Prix trop élevé' },
            '6': { value: 'colis_endommage', label: 'Colis endommagé' },
            '7': { value: 'erreur_commande', label: 'Erreur commande' },
            '8': { value: 'autre', label: 'Autre' }
        };

        const motif = motifMap[motifChoisi];
        
        if (motif && motifChoisi === '8') {
            const commentaire = prompt('Veuillez préciser le motif:');
            if (commentaire) {
                motif.commentaire = commentaire;
            }
        }

        return motif || null;
    }

    // Mettre à jour les statistiques
    updateStats() {
        const total = this.retours.length;
        const attente = this.retours.filter(r => r.statut === 'en_attente').length;
        const traites = this.retours.filter(r => r.statut === 'traité').length;
        const today = this.retours.filter(r => {
            const retourDate = new Date(r.dateRetour);
            const now = new Date();
            return retourDate.toDateString() === now.toDateString();
        }).length;

        document.getElementById('totalRetours').textContent = total;
        document.getElementById('retoursAttente').textContent = attente;
        document.getElementById('retoursTraites').textContent = traites;
        document.getElementById('retoursToday').textContent = today;
    }

    // Rendre le tableau
    renderTable(filteredRetours = null) {
        const tbody = document.getElementById('retoursTableBody');
        if (!tbody) return;

        const retours = filteredRetours || this.retours;

        if (retours.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" class="text-center" style="padding: 40px;">
                        <i class="fas fa-inbox" style="font-size: 48px; color: #ccc; display: block; margin-bottom: 10px;"></i>
                        <p style="color: #999;">Aucun retour pour le moment</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = retours.map(retour => {
            // ✅ MAPPING CORRECT selon modèle MongoDB Retour
            const retourId = retour._id || retour.id;
            const codeSuiviDisplay = retour.reference || retour.codeSuivi || 'N/A';
            const destinataireNom = retour.nomDestinataire || retour.destinataire?.nom || '-';
            const wilayaDisplay = retour.wilaya || '-';
            const montantDisplay = retour.fraisRetour ? retour.fraisRetour.toLocaleString() : '0';
            const dateRetour = retour.dateRetour || retour.createdAt;
            const statutDisplay = retour.statut || 'en_attente'; // ✅ Utiliser le statut du retour
            
            return `
            <tr data-id="${retourId}">
                <td><input type="checkbox" class="row-checkbox" data-id="${retourId}"></td>
                <td><strong>${codeSuiviDisplay}</strong></td>
                <td>${retour.livreurNom || '-'}</td>
                <td>${destinataireNom}</td>
                <td>${wilayaDisplay}</td>
                <td>${this.getMotifLabel(retour.motifRetour)}</td>
                <td>${this.formatDate(dateRetour)}</td>
                <td>${montantDisplay} DA</td>
                <td>${this.getStatutBadge(statutDisplay)}</td>
                <td class="actions">
                    <button class="action-btn view" onclick="retoursManager.viewRetour('${retourId}')" title="Voir détails">
                        <ion-icon name="eye-outline"></ion-icon>
                    </button>
                    <button class="action-btn edit" onclick="retoursManager.marquerTraite('${retourId}')" title="Marquer comme traité">
                        <ion-icon name="checkmark-outline"></ion-icon>
                    </button>
                    <button class="action-btn delete" onclick="retoursManager.deleteRetour('${retourId}')" title="Supprimer">
                        <ion-icon name="trash-outline"></ion-icon>
                    </button>
                </td>
            </tr>
        `;
        }).join('');
    }

    // Obtenir le label du motif
    getMotifLabel(motif) {
        const labels = {
            'absent': 'Client absent',
            'refuse': 'Refus du colis',
            'adresse': 'Adresse incorrecte',
            'endommagé': 'Colis endommagé',
            'autre': 'Autre'
        };
        return labels[motif] || motif;
    }

    // Obtenir le badge de statut
    getStatutBadge(statut) {
        const badges = {
            'en_attente': '<span class="badge warning">En attente</span>',
            'traité': '<span class="badge success">Traité</span>'
        };
        return badges[statut] || statut;
    }

    // Formater la date
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Marquer comme traité
    async marquerTraite(id) {
        const retour = this.retours.find(r => (r._id || r.id) === id);
        if (!retour) {
            console.error('❌ Retour introuvable avec ID:', id);
            alert('❌ Retour introuvable');
            return;
        }

        console.log('🔄 Marquage traité - ID:', id);
        console.log('📦 Retour trouvé:', retour);

        try {
            const token = sessionStorage.getItem('auth_token') || localStorage.getItem('agent_token');
            const url = `/api/retours/${id}`;
            const body = {
                statut: 'traité',
                dateTraitement: new Date().toISOString()
            };

            console.log('🌐 URL:', url);
            console.log('📤 Body:', body);

            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            console.log('📥 Response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Réponse API:', data);
                
                // ✅ Recharger depuis l'API
                await this.loadRetours();
                this.updateStats();
                this.renderTable();
                alert(`✅ Retour ${retour.reference} marqué comme traité`);
            } else {
                const errorData = await response.text();
                console.error('❌ Erreur API:', response.status, errorData);
                throw new Error(`Erreur ${response.status}: ${errorData}`);
            }
        } catch (error) {
            console.error('❌ Erreur marquerTraite:', error);
            alert(`❌ Erreur lors de la mise à jour du retour\n\nDétails: ${error.message}\n\nVoir console (F12) pour plus d'infos`);
        }
    }

    // Voir les détails
    viewRetour(id) {
        const retour = this.retours.find(r => (r._id || r.id) === id);
        if (retour) {
            const details = `
📦 DÉTAILS DU RETOUR

📋 Référence: ${retour.reference || retour.codeSuivi}
👤 Destinataire: ${retour.nomDestinataire || retour.destinataire?.nom}
📍 Wilaya: ${retour.wilaya}
🚚 Livreur: ${retour.livreurNom || '-'}
❌ Motif: ${this.getMotifLabel(retour.motifRetour)}
💰 Frais: ${retour.fraisRetour || 0} DA
📅 Date: ${this.formatDate(retour.dateRetour || retour.createdAt)}
            `;
            alert(details);
        }
    }

    // Supprimer un retour
    async deleteRetour(id) {
        const retour = this.retours.find(r => (r._id || r.id) === id);
        if (!retour) return;

        if (!confirm(`Voulez-vous vraiment supprimer le retour ${retour.reference} ?`)) {
            return;
        }

        try {
            const token = sessionStorage.getItem('auth_token') || localStorage.getItem('agent_token');
            const response = await fetch(`/api/retours/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                // ✅ Recharger depuis l'API
                await this.loadRetours();
                this.updateStats();
                this.renderTable();
                alert(`✅ Retour ${retour.reference} supprimé`);
            } else {
                throw new Error('Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('❌ Erreur deleteRetour:', error);
            alert('❌ Erreur lors de la suppression du retour');
        }
    }

    // Recherche
    handleSearch(query) {
        const filtered = this.retours.filter(r => {
            return r.codeSuivi.toLowerCase().includes(query.toLowerCase()) ||
                   r.expediteur?.nom?.toLowerCase().includes(query.toLowerCase()) ||
                   r.destinataire?.nom?.toLowerCase().includes(query.toLowerCase());
        });
        this.renderTable(filtered);
    }

    // Appliquer les filtres
    applyFilters() {
        const dateFilter = document.getElementById('filterDateRetour')?.value;
        const motifFilter = document.getElementById('filterMotifRetour')?.value;
        const wilayaFilter = document.getElementById('filterWilayaRetour')?.value;

        let filtered = [...this.retours];

        // Filtre par date
        if (dateFilter && dateFilter !== 'all') {
            const now = new Date();
            filtered = filtered.filter(r => {
                const retourDate = new Date(r.dateRetour);
                if (dateFilter === 'today') {
                    return retourDate.toDateString() === now.toDateString();
                } else if (dateFilter === 'week') {
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    return retourDate >= weekAgo;
                } else if (dateFilter === 'month') {
                    return retourDate.getMonth() === now.getMonth() && 
                           retourDate.getFullYear() === now.getFullYear();
                }
                return true;
            });
        }

        // Filtre par motif
        if (motifFilter && motifFilter !== 'all') {
            filtered = filtered.filter(r => r.motifRetour === motifFilter);
        }

        // Filtre par wilaya
        if (wilayaFilter && wilayaFilter !== 'all') {
            filtered = filtered.filter(r => r.wilaya === wilayaFilter);
        }

        this.renderTable(filtered);
    }

    // Réinitialiser les filtres
    resetFilters() {
        document.getElementById('filterDateRetour').value = 'all';
        document.getElementById('filterMotifRetour').value = 'all';
        document.getElementById('filterWilayaRetour').value = 'all';
        this.renderTable();
    }

    // Peupler le filtre wilaya
    populateWilayaFilter() {
        const select = document.getElementById('filterWilayaRetour');
        if (!select) return;

        const wilayas = [...new Set(this.retours.map(r => r.wilaya).filter(Boolean))];
        wilayas.sort();

        wilayas.forEach(wilaya => {
            const option = document.createElement('option');
            option.value = wilaya;
            option.textContent = wilaya;
            select.appendChild(option);
        });
    }

    // Toggle select all
    toggleSelectAll(checked) {
        const checkboxes = document.querySelectorAll('.row-checkbox');
        checkboxes.forEach(cb => cb.checked = checked);
    }

    // Exporter les retours
    exportRetours() {
        const csv = this.convertToCSV();
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `retours_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    }

    // Convertir en CSV
    convertToCSV() {
        const headers = ['Code Suivi', 'Expéditeur', 'Destinataire', 'Wilaya', 'Motif', 'Date Retour', 'Montant', 'Statut'];
        const rows = this.retours.map(r => [
            r.codeSuivi,
            r.expediteur?.nom || '',
            r.destinataire?.nom || '',
            r.wilaya || '',
            this.getMotifLabel(r.motifRetour),
            this.formatDate(r.dateRetour),
            r.montant,
            r.statut
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
}

// Initialiser au chargement de la page
let retoursManager;
document.addEventListener('DOMContentLoaded', () => {
    retoursManager = new RetoursManager();
});
