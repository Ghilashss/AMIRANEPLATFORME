// ==================== GESTIONNAIRE DE LIVRAISONS - VERSION API ====================

class LivraisonsManager {
    constructor() {
        this.livraisons = [];
        this.scanner = null;
        this.isScanning = false;
        this.init();
    }

    init() {
        console.log('🚀 Initialisation du gestionnaire de livraisons...');
        this.loadLivraisons();
        this.initEventListeners();
        this.updateStats();
        this.renderTable();
        this.populateWilayaFilter();
        console.log('✅ Gestionnaire de livraisons prêt');
    }

    async loadLivraisons() {
        try {
            // 🔥 MIGRÉ VERS API MongoDB
            const token = sessionStorage.getItem('auth_token') || localStorage.getItem('admin_token');
            const response = await fetch(`${window.API_CONFIG.API_URL}/livraisons`, {
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
            this.livraisons = result.data || [];
            console.log(`✅ ${this.livraisons.length} livraisons chargées depuis API MongoDB`);
            
            // Cache fallback
            localStorage.setItem('livraisonsCache', JSON.stringify(this.livraisons));
            
        } catch (error) {
            console.error('❌ Erreur chargement API livraisons:', error);
            // Fallback cache
            const cached = localStorage.getItem('livraisonsCache');
            if (cached) {
                this.livraisons = JSON.parse(cached);
                console.log('💡 Utilisation du cache');
            } else {
                this.livraisons = [];
            }
        }
    }

    async saveLivraison(livraisonData) {
        try {
            // 🔥 SAUVEGARDER DANS API MongoDB
            const token = sessionStorage.getItem('auth_token') || localStorage.getItem('admin_token');
            const response = await fetch(`${window.API_CONFIG.API_URL}/livraisons`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(livraisonData)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            console.log('✅ Livraison sauvegardée dans MongoDB');
            return result.data;
            
        } catch (error) {
            console.error('❌ Erreur sauvegarde livraison:', error);
            throw error;
        }
    }

    initEventListeners() {
        const scanBtn = document.getElementById('scanLivraisonBtn');
        if (scanBtn) scanBtn.addEventListener('click', () => this.openScanner());

        const closeBtn = document.getElementById('closeScanLivraison');
        if (closeBtn) closeBtn.addEventListener('click', () => this.closeScanner());

        const submitManualBtn = document.getElementById('submitManualLivraison');
        if (submitManualBtn) submitManualBtn.addEventListener('click', () => this.handleManualInput());

        const manualInput = document.getElementById('manualLivraisonInput');
        if (manualInput) {
            manualInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleManualInput();
                }
            });
        }

        const searchInput = document.getElementById('livraisonsSearchInput');
        if (searchInput) searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));

        const filterDate = document.getElementById('filterDateLivraison');
        const filterWilaya = document.getElementById('filterWilayaLivraison');
        const resetBtn = document.getElementById('resetFiltersLivraison');

        if (filterDate) filterDate.addEventListener('change', () => this.applyFilters());
        if (filterWilaya) filterWilaya.addEventListener('change', () => this.applyFilters());
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetFilters());

        const exportBtn = document.getElementById('exportLivraisonsBtn');
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportLivraisons());

        const selectAll = document.getElementById('selectAllLivraisons');
        if (selectAll) selectAll.addEventListener('change', (e) => this.toggleSelectAll(e.target.checked));
    }

    openScanner() {
        console.log('📱 Ouverture du scanner...');
        const scanZone = document.getElementById('scanLivraisonZone');
        if (!scanZone) {
            console.error('❌ Zone de scan introuvable');
            return;
        }

        scanZone.style.display = 'flex';
        this.isScanning = true;

        const manualInput = document.getElementById('manualLivraisonInput');
        if (manualInput) {
            manualInput.value = '';
            manualInput.focus();
        }

        if (!this.scanner) {
            this.scanner = new Html5Qrcode("qr-reader-livraison");
        }

        const config = { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
        };

        this.scanner.start(
            { facingMode: "environment" },
            config,
            (decodedText) => this.handleScan(decodedText),
            (error) => {
                if (!error.includes('NotFoundException')) {
                    console.log('Scan:', error);
                }
            }
        ).catch((err) => {
            console.warn('⚠️ Caméra non disponible:', err);
            alert('📱 Impossible d\'accéder à la caméra.\n\nUtilisez la saisie manuelle ci-dessous.');
        });
    }

    closeScanner() {
        console.log('🔴 Fermeture du scanner...');
        this.isScanning = false;
        const scanZone = document.getElementById('scanLivraisonZone');
        
        if (this.scanner) {
            this.scanner.stop().then(() => {
                if (scanZone) scanZone.style.display = 'none';
                console.log('✅ Scanner fermé');
            }).catch((err) => {
                console.error('❌ Erreur fermeture:', err);
                if (scanZone) scanZone.style.display = 'none';
            });
        } else {
            if (scanZone) scanZone.style.display = 'none';
        }
    }

    handleManualInput() {
        const input = document.getElementById('manualLivraisonInput');
        if (!input) return;

        const codeSuivi = input.value.trim().toUpperCase();
        if (!codeSuivi) {
            alert('⚠️ Veuillez entrer un code de suivi');
            input.focus();
            return;
        }

        console.log('🔍 Saisie manuelle:', codeSuivi);
        this.handleScan(codeSuivi);
        input.value = '';
        input.focus();
    }

    async handleScan(codeSuivi) {
        if (!this.isScanning) return;

        codeSuivi = codeSuivi.trim().toUpperCase();
        console.log('📦 Scan du colis:', codeSuivi);

        this.closeScanner();

        // 🔥 MIGRÉ VERS API - Charger les colis depuis MongoDB
        let colisList = [];
        
        try {
            const token = sessionStorage.getItem('auth_token') || localStorage.getItem('admin_token');
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

        if (colisList.length === 0) {
            alert('⚠️ Aucun colis disponible !\n\nVeuillez d\'abord créer des colis dans la section COLIS.');
            return;
        }

        // Chercher le colis (multi-champs - compatibilité API)
        const colis = colisList.find(c => 
            c.codeSuivi === codeSuivi || 
            c.reference === codeSuivi || 
            c.trackingNumber === codeSuivi ||
            c.id === codeSuivi ||
            c._id === codeSuivi
        );

        if (!colis) {
            alert(`❌ Colis ${codeSuivi} introuvable !\n\n` +
                  `Nombre de colis disponibles: ${colisList.length}\n\n` +
                  `Vérifiez le code et réessayez.`);
            return;
        }

        console.log('✅ Colis trouvé:', colis);

        // Vérifier si déjà en livraison
        const dejaSorti = this.livraisons.find(l => 
            l.codeSuivi === codeSuivi ||
            l.codeSuivi === colis.codeSuivi ||
            l.codeSuivi === colis.reference
        );

        if (dejaSorti) {
            alert(`⚠️ Ce colis est déjà sorti pour livraison !\n\n` +
                  `Sorti le: ${this.formatDate(dejaSorti.dateSortie)}\n` +
                  `Destination: ${dejaSorti.wilaya}`);
            return;
        }

        // Extraire les informations
        const code = colis.codeSuivi || colis.reference || colis.trackingNumber || codeSuivi;
        const expediteurNom = colis.expediteur?.nom || colis.commercant || colis.clientNom || 'Non spécifié';
        const destinataireNom = colis.destinataire?.nom || colis.client || colis.destinataire || 'Non spécifié';
        const destinataireAdresse = colis.destinataire?.adresse || colis.adresse || 'Non spécifiée';
        const destinataireTel = colis.destinataire?.telephone || colis.telephone || colis.tel || '-';
        const wilayaDest = colis.wilayaDestination || colis.wilaya || colis.destinataire?.wilaya || 'Non spécifiée';

        // Demander confirmation
        const confirmer = confirm(
            `📦 MARQUER CE COLIS COMME SORTI POUR LIVRAISON ?\n\n` +
            `Code de suivi: ${code}\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
            `DESTINATAIRE:\n` +
            `• Nom: ${destinataireNom}\n` +
            `• Tél: ${destinataireTel}\n` +
            `• Adresse: ${destinataireAdresse}\n` +
            `• Wilaya: ${wilayaDest}\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
            `Le colis sera marqué comme "En cours de livraison"`
        );

        if (!confirmer) {
            alert('❌ Opération annulée');
            return;
        }

        // Créer l'enregistrement
        const livraison = {
            id: Date.now().toString(),
            codeSuivi: code,
            expediteur: {
                nom: expediteurNom,
                telephone: colis.expediteur?.telephone || colis.commercantTel || '-',
                adresse: colis.expediteur?.adresse || colis.adresseExpediteur || '-',
                wilaya: colis.expediteur?.wilaya || colis.wilayaDepart || colis.wilayaSource || '-'
            },
            destinataire: {
                nom: destinataireNom,
                telephone: destinataireTel,
                adresse: destinataireAdresse,
                wilaya: wilayaDest,
                commune: colis.destinataire?.commune || '-'
            },
            wilaya: wilayaDest,
            montant: parseFloat(colis.montant || colis.prixColis || 0),
            dateSortie: new Date().toISOString(),
            dateCreation: colis.dateCreation,
            statut: 'enLivraison',
            type: colis.type || 'standard',
            poids: colis.poids || 0,
            colisOriginal: { ...colis }
        };

        // 🔥 Sauvegarder dans API MongoDB
        try {
            await this.saveLivraison(livraison);
            this.livraisons.unshift(livraison);
            console.log('✅ Livraison enregistrée dans MongoDB');
        } catch (error) {
            alert('❌ Erreur lors de l\'enregistrement de la livraison');
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
                    statut: 'enLivraison',
                    status: 'enLivraison',
                    dateSortie: new Date().toISOString()
                })
            });

            if (response.ok) {
                console.log('✅ Statut du colis mis à jour dans MongoDB');
            }
        } catch (error) {
            console.error('❌ Erreur mise à jour statut colis:', error);
            // Non bloquant
        }

        // Mettre à jour le statut dans dataStore
        if (window.dataStore?.colis) {
            const colisIndex = window.dataStore.colis.findIndex(c => 
                c.codeSuivi === codeSuivi || 
                c.reference === codeSuivi || 
                c.trackingNumber === codeSuivi ||
                c.id === codeSuivi
            );
            
            if (colisIndex !== -1) {
                window.dataStore.colis[colisIndex].statut = 'enLivraison';
                window.dataStore.colis[colisIndex].status = 'enLivraison';
                window.dataStore.colis[colisIndex].dateSortie = new Date().toISOString();
                
                if (typeof window.dataStore.saveToStorage === 'function') {
                    window.dataStore.saveToStorage('colis');
                }
                
                if (typeof window.dataStore.updateColisTable === 'function') {
                    window.dataStore.updateColisTable();
                }
                
                console.log('✅ Statut mis à jour dans dataStore');
            }
        }

        document.dispatchEvent(new CustomEvent('colisUpdated', { 
            detail: { codeSuivi: code, statut: 'enLivraison' } 
        }));

        this.updateStats();
        this.renderTable();
        this.populateWilayaFilter();

        alert(
            `✅ COLIS SORTI POUR LIVRAISON !\n\n` +
            `Code: ${code}\n` +
            `Destinataire: ${destinataireNom}\n` +
            `Wilaya: ${wilayaDest}\n` +
            `Date sortie: ${this.formatDate(new Date().toISOString())}\n\n` +
            `Le statut a été mis à jour : "En cours de livraison"`
        );

        console.log('✅ Processus de livraison terminé');
    }

    updateStats() {
        const total = this.livraisons.length;
        
        const today = this.livraisons.filter(l => {
            const livraisonDate = new Date(l.dateLivraison);
            const now = new Date();
            return livraisonDate.toDateString() === now.toDateString();
        }).length;

        const totalMontant = this.livraisons.reduce((sum, l) => sum + (parseFloat(l.montant) || 0), 0);

        const totalEl = document.getElementById('totalLivraisons');
        const todayEl = document.getElementById('livraisonsToday');
        const montantEl = document.getElementById('montantLivraisons');

        if (totalEl) totalEl.textContent = total;
        if (todayEl) todayEl.textContent = today;
        if (montantEl) montantEl.textContent = totalMontant.toLocaleString('fr-FR') + ' DA';
    }

    renderTable(filteredLivraisons = null) {
        const tbody = document.getElementById('livraisonsTableBody');
        if (!tbody) {
            console.error('❌ Tableau introuvable');
            return;
        }

        const livraisons = filteredLivraisons || this.livraisons;

        if (livraisons.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" class="text-center" style="padding: 60px 20px;">
                        <div style="color: #ccc;">
                            <i class="fas fa-box-open" style="font-size: 64px; margin-bottom: 20px; display: block;"></i>
                            <h3 style="margin: 10px 0; color: #999;">Aucune livraison</h3>
                            <p style="color: #bbb;">Scannez un colis pour enregistrer une livraison</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = livraisons.map((livraison, index) => {
            const montantDisplay = parseFloat(livraison.montant || 0).toLocaleString('fr-FR');
            const codeSuiviDisplay = livraison.codeSuivi || 'N/A';
            const expediteurNom = livraison.expediteur?.nom || '-';
            const destinataireNom = livraison.destinataire?.nom || '-';
            const destinataireAdresse = livraison.destinataire?.adresse || '-';
            const wilayaDisplay = livraison.wilaya || '-';
            
            return `
                <tr data-id="${livraison.id}" style="animation: fadeIn 0.3s ease-in ${index * 0.05}s both;">
                    <td>
                        <input type="checkbox" class="row-checkbox" data-id="${livraison.id}">
                    </td>
                    <td>
                        <strong style="color: var(--primary);">${codeSuiviDisplay}</strong>
                    </td>
                    <td>${expediteurNom}</td>
                    <td>
                        <div><strong>${destinataireNom}</strong></div>
                        <div style="font-size: 12px; color: #666;">${destinataireAdresse}</div>
                    </td>
                    <td>${wilayaDisplay}</td>
                    <td>${this.formatDate(livraison.dateSortie)}</td>
                    <td><strong>${montantDisplay} DA</strong></td>
                    <td>
                        <span class="badge warning" style="background: #FF9800;">
                            <i class="fas fa-truck"></i> En livraison
                        </span>
                    </td>
                    <td class="actions">
                        <button class="action-btn view" onclick="livraisonsManager.viewLivraison('${livraison.id}')" title="Voir détails">
                            <ion-icon name="eye-outline"></ion-icon>
                        </button>
                        <button class="action-btn delete" onclick="livraisonsManager.deleteLivraison('${livraison.id}')" title="Supprimer">
                            <ion-icon name="trash-outline"></ion-icon>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

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

    handleSearch(query) {
        query = query.toLowerCase().trim();
        if (!query) {
            this.renderTable();
            return;
        }

        const filtered = this.livraisons.filter(l => 
            l.codeSuivi?.toLowerCase().includes(query) ||
            l.expediteur?.nom?.toLowerCase().includes(query) ||
            l.destinataire?.nom?.toLowerCase().includes(query) ||
            l.recepteur?.toLowerCase().includes(query) ||
            l.wilaya?.toLowerCase().includes(query)
        );

        this.renderTable(filtered);
    }

    applyFilters() {
        const filterDate = document.getElementById('filterDateLivraison')?.value;
        const filterWilaya = document.getElementById('filterWilayaLivraison')?.value;

        let filtered = [...this.livraisons];

        if (filterDate) {
            filtered = filtered.filter(l => {
                const livraisonDate = new Date(l.dateLivraison).toISOString().split('T')[0];
                return livraisonDate === filterDate;
            });
        }

        if (filterWilaya) {
            filtered = filtered.filter(l => l.wilaya === filterWilaya);
        }

        this.renderTable(filtered);
    }

    resetFilters() {
        const filterDate = document.getElementById('filterDateLivraison');
        const filterWilaya = document.getElementById('filterWilayaLivraison');
        const searchInput = document.getElementById('livraisonsSearchInput');
        
        if (filterDate) filterDate.value = '';
        if (filterWilaya) filterWilaya.value = '';
        if (searchInput) searchInput.value = '';
        
        this.renderTable();
    }

    populateWilayaFilter() {
        const select = document.getElementById('filterWilayaLivraison');
        if (!select) return;

        const wilayas = [...new Set(this.livraisons.map(l => l.wilaya))].filter(Boolean).sort();
        
        select.innerHTML = '<option value="">Toutes les wilayas</option>' +
            wilayas.map(w => `<option value="${w}">${w}</option>`).join('');
    }

    toggleSelectAll(checked) {
        const checkboxes = document.querySelectorAll('.row-checkbox');
        checkboxes.forEach(cb => cb.checked = checked);
    }

    viewLivraison(id) {
        const livraison = this.livraisons.find(l => l.id === id);
        if (!livraison) return;

        const details = 
            `╔════════════════════════════════════════╗\n` +
            `║     DÉTAILS DE LA LIVRAISON           ║\n` +
            `╚════════════════════════════════════════╝\n\n` +
            `📦 CODE: ${livraison.codeSuivi}\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
            `EXPÉDITEUR:\n` +
            `• ${livraison.expediteur?.nom || '-'}\n` +
            `• ${livraison.expediteur?.telephone || '-'}\n` +
            `• ${livraison.expediteur?.adresse || '-'}\n` +
            `• ${livraison.expediteur?.wilaya || '-'}\n\n` +
            `DESTINATAIRE:\n` +
            `• ${livraison.destinataire?.nom || '-'}\n` +
            `• ${livraison.destinataire?.telephone || '-'}\n` +
            `• ${livraison.destinataire?.adresse || '-'}\n` +
            `• ${livraison.wilaya || '-'}\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
            `LIVRAISON:\n` +
            `✓ Reçu par: ${livraison.recepteur}\n` +
            `✓ Date: ${this.formatDate(livraison.dateLivraison)}\n` +
            `✓ Montant: ${parseFloat(livraison.montant || 0).toLocaleString('fr-FR')} DA\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

        alert(details);
    }

    deleteLivraison(id) {
        const livraison = this.livraisons.find(l => l.id === id);
        if (!livraison) return;

        if (!confirm(`⚠️ Supprimer cette livraison ?\n\nCode: ${livraison.codeSuivi}\nRéceptionné par: ${livraison.recepteur}`)) {
            return;
        }

        this.livraisons = this.livraisons.filter(l => l.id !== id);
        this.saveLivraisons();
        this.updateStats();
        this.renderTable();
        this.populateWilayaFilter();

        alert('✅ Livraison supprimée avec succès !');
    }

    exportLivraisons() {
        if (this.livraisons.length === 0) {
            alert('⚠️ Aucune livraison à exporter');
            return;
        }

        const headers = [
            'Code de suivi',
            'Expéditeur',
            'Destinataire',
            'Réceptionné par',
            'Wilaya',
            'Date de livraison',
            'Montant (DA)',
            'Téléphone'
        ];

        const rows = this.livraisons.map(l => [
            l.codeSuivi || '',
            l.expediteur?.nom || '',
            l.destinataire?.nom || '',
            l.recepteur || '',
            l.wilaya || '',
            this.formatDate(l.dateLivraison),
            parseFloat(l.montant || 0).toLocaleString('fr-FR'),
            l.destinataire?.telephone || ''
        ]);

        let csv = '\uFEFF';
        csv += headers.join(',') + '\n';
        csv += rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const filename = `livraisons_${new Date().toISOString().split('T')[0]}.csv`;
        
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();

        alert(`✅ Export réussi !\n\nFichier: ${filename}\n${this.livraisons.length} livraisons exportées`);
    }
}

const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

let livraisonsManager;
document.addEventListener('DOMContentLoaded', () => {
    livraisonsManager = new LivraisonsManager();
    window.livraisonsManager = livraisonsManager;
    console.log('✅ Gestionnaire de livraisons prêt');
});
