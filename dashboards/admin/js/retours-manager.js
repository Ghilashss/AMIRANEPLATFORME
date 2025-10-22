// ==================== GESTIONNAIRE DE RETOURS ====================

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

    // 🔥 Charger les retours depuis API MongoDB
    async loadRetours() {
        try {
            const token = sessionStorage.getItem('auth_token') || localStorage.getItem('admin_token');
            const response = await fetch(`${window.API_CONFIG.API_URL}/retours`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                this.retours = await response.json();
                console.log('✅ Retours chargés depuis MongoDB:', this.retours.length);
                
                // Cache pour performance
                localStorage.setItem('retoursCache', JSON.stringify(this.retours));
            } else {
                // Fallback cache
                const cached = localStorage.getItem('retoursCache');
                this.retours = cached ? JSON.parse(cached) : [];
                console.warn('⚠️ Utilisation du cache retours');
            }
        } catch (error) {
            console.error('❌ Erreur chargement retours:', error);
            // Fallback cache
            const cached = localStorage.getItem('retoursCache');
            this.retours = cached ? JSON.parse(cached) : [];
        }
    }

    // 🔥 Sauvegarder un retour dans API MongoDB
    async saveRetour(retourData) {
        try {
            const token = sessionStorage.getItem('auth_token') || localStorage.getItem('admin_token');
            const response = await fetch(`${window.API_CONFIG.API_URL}/retours`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(retourData)
            });

            if (!response.ok) {
                throw new Error('Erreur API retours');
            }

            const savedRetour = await response.json();
            console.log('✅ Retour enregistré dans MongoDB');
            return savedRetour;
        } catch (error) {
            console.error('❌ Erreur sauvegarde retour:', error);
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

        // 🔥 Rechercher le colis dans MongoDB via API
        let colis = null;
        try {
            const token = sessionStorage.getItem('auth_token') || localStorage.getItem('admin_token');
            const response = await fetch(`${window.API_CONFIG.API_URL}/colis`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const colisList = await response.json();
                
                // Chercher par codeSuivi, reference, trackingNumber, ou _id
                colis = colisList.find(c => 
                    c.codeSuivi === codeSuivi || 
                    c.reference === codeSuivi || 
                    c.trackingNumber === codeSuivi ||
                    c._id === codeSuivi ||
                    c.id === codeSuivi
                );
            }
        } catch (error) {
            console.error('❌ Erreur recherche colis:', error);
            alert('❌ Erreur lors de la recherche du colis');
            return;
        }

        if (!colis) {
            alert(`❌ Colis ${codeSuivi} introuvable dans la base de données !`);
            return;
        }

        // Vérifier si déjà en retour
        const dejaRetour = this.retours.find(r => 
            r.codeSuivi === codeSuivi || 
            r.codeSuivi === colis.codeSuivi ||
            r.codeSuivi === colis.reference
        );
        if (dejaRetour) {
            alert(`⚠️ Ce colis est déjà marqué en retour !`);
            return;
        }

        // Demander le motif du retour
        const motif = this.selectMotifRetour();
        if (!motif) return;

        // Extraire le code de suivi (peut être codeSuivi, reference ou trackingNumber)
        const code = colis.codeSuivi || colis.reference || colis.trackingNumber || codeSuivi;
        
        // Extraire les informations de l'expéditeur et du destinataire
        const expediteurNom = colis.expediteur?.nom || colis.commercant || colis.clientNom || '-';
        const destinataireNom = colis.destinataire?.nom || colis.client || colis.destinataire || '-';
        const wilayaDest = colis.wilayaDestination || colis.wilaya || colis.destinataire?.wilaya || '-';

        // Créer l'entrée de retour
        const retour = {
            colisId: colis._id || colis.id,
            codeSuivi: code,
            expediteur: {
                nom: expediteurNom,
                telephone: colis.expediteur?.telephone || colis.commercantTel || '-',
                adresse: colis.expediteur?.adresse || colis.adresseExpediteur || '-',
                wilaya: colis.expediteur?.wilaya || colis.wilayaDepart || colis.wilayaSource || '-'
            },
            destinataire: {
                nom: destinataireNom,
                telephone: colis.destinataire?.telephone || colis.telephone || colis.tel || '-',
                adresse: colis.destinataire?.adresse || colis.adresse || '-',
                wilaya: wilayaDest,
                commune: colis.destinataire?.commune || '-'
            },
            wilaya: wilayaDest,
            montant: colis.montant || colis.prixColis || 0,
            motifRetour: motif,
            dateRetour: new Date().toISOString(),
            statut: 'en_attente',
            colisOriginal: { ...colis }
        };

        // 🔥 Sauvegarder dans API MongoDB
        try {
            await this.saveRetour(retour);
            this.retours.unshift(retour);
            console.log('✅ Retour enregistré dans MongoDB');
        } catch (error) {
            alert('❌ Erreur lors de l\'enregistrement du retour');
            return;
        }

        // 🔥 Mettre à jour le statut du colis dans MongoDB
        try {
            const token = sessionStorage.getItem('auth_token') || localStorage.getItem('admin_token');
            const colisId = colis._id || colis.id;
            
            const response = await fetch(`${window.API_CONFIG.API_URL}/colis/${colisId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    statut: 'retour',
                    status: 'retour',
                    dateRetour: new Date().toISOString()
                })
            });

            if (response.ok) {
                console.log('✅ Statut du colis mis à jour dans MongoDB');
            }
        } catch (error) {
            console.error('❌ Erreur mise à jour statut colis:', error);
            // Non bloquant
        }

        // Mettre à jour le statut du colis dans dataStore (si existe)
        if (window.dataStore?.colis) {
            const colisIndex = window.dataStore.colis.findIndex(c => 
                c.codeSuivi === codeSuivi || 
                c.reference === codeSuivi || 
                c.trackingNumber === codeSuivi ||
                c._id === (colis._id || colis.id) ||
                c.id === (colis._id || colis.id)
            );
            if (colisIndex !== -1) {
                window.dataStore.colis[colisIndex].statut = 'retour';
                window.dataStore.colis[colisIndex].status = 'retour';
                if (typeof window.dataStore.saveToStorage === 'function') {
                    window.dataStore.saveToStorage('colis');
                }
                // Mettre à jour le tableau des colis si la fonction existe
                if (typeof window.dataStore.updateColisTable === 'function') {
                    window.dataStore.updateColisTable();
                }
            }
        }

        // Émettre un événement pour rafraîchir le tableau des colis
        document.dispatchEvent(new CustomEvent('colisUpdated'));

        // Rafraîchir l'affichage
        this.updateStats();
        this.renderTable();

        alert(`✅ Colis ${codeSuivi} marqué en retour !\n\nLe statut a été mis à jour dans la section Colis.`);
    }

    // Sélectionner le motif du retour
    selectMotifRetour() {
        const motifs = [
            { value: 'absent', label: 'Client absent' },
            { value: 'refuse', label: 'Refus du colis' },
            { value: 'adresse', label: 'Adresse incorrecte' },
            { value: 'endommagé', label: 'Colis endommagé' },
            { value: 'autre', label: 'Autre motif' }
        ];

        let html = '<select id="motif-select" style="width:100%; padding:10px; font-size:16px; border-radius:5px;">';
        html += '<option value="">-- Sélectionnez un motif --</option>';
        motifs.forEach(m => {
            html += `<option value="${m.value}">${m.label}</option>`;
        });
        html += '</select>';

        const result = prompt(`Pourquoi ce colis est en retour ?\n\n${html}`);
        
        // Pour simplifier, on utilise un select simple
        const motifChoisi = prompt(
            'Motif du retour:\n' +
            '1. Client absent\n' +
            '2. Refus du colis\n' +
            '3. Adresse incorrecte\n' +
            '4. Colis endommagé\n' +
            '5. Autre\n\n' +
            'Entrez le numéro (1-5):'
        );

        const motifMap = {
            '1': 'absent',
            '2': 'refuse',
            '3': 'adresse',
            '4': 'endommagé',
            '5': 'autre'
        };

        return motifMap[motifChoisi] || null;
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
            const montantDisplay = retour.montant ? retour.montant.toLocaleString() : '0';
            const codeSuiviDisplay = retour.codeSuivi || 'N/A';
            const expediteurNom = retour.expediteur?.nom || '-';
            const destinataireNom = retour.destinataire?.nom || '-';
            const wilayaDisplay = retour.wilaya || '-';
            
            return `
            <tr data-id="${retour.id}">
                <td><input type="checkbox" class="row-checkbox" data-id="${retour.id}"></td>
                <td><strong>${codeSuiviDisplay}</strong></td>
                <td>${expediteurNom}</td>
                <td>${destinataireNom}</td>
                <td>${wilayaDisplay}</td>
                <td>${this.getMotifLabel(retour.motifRetour)}</td>
                <td>${this.formatDate(retour.dateRetour)}</td>
                <td>${montantDisplay} DA</td>
                <td>${this.getStatutBadge(retour.statut)}</td>
                <td class="actions">
                    <button class="action-btn view" onclick="retoursManager.viewRetour('${retour.id}')" title="Voir détails">
                        <ion-icon name="eye-outline"></ion-icon>
                    </button>
                    <button class="action-btn edit" onclick="retoursManager.marquerTraite('${retour.id}')" title="Marquer comme traité">
                        <ion-icon name="checkmark-outline"></ion-icon>
                    </button>
                    <button class="action-btn delete" onclick="retoursManager.deleteRetour('${retour.id}')" title="Supprimer">
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
    marquerTraite(id) {
        const retour = this.retours.find(r => r.id === id);
        if (retour) {
            retour.statut = 'traité';
            retour.dateTraitement = new Date().toISOString();
            this.saveRetours();
            this.updateStats();
            this.renderTable();
        }
    }

    // Voir les détails
    viewRetour(id) {
        const retour = this.retours.find(r => r.id === id);
        if (retour) {
            alert(JSON.stringify(retour, null, 2));
        }
    }

    // Supprimer un retour
    deleteRetour(id) {
        if (confirm('Voulez-vous vraiment supprimer ce retour ?')) {
            this.retours = this.retours.filter(r => r.id !== id);
            this.saveRetours();
            this.updateStats();
            this.renderTable();
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
