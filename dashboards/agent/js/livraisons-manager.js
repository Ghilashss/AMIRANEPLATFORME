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
            console.log('🔍 Chargement des livraisons depuis l\'API...');
            
            const token = sessionStorage.getItem('auth_token') || localStorage.getItem('agent_token');
            if (!token) {
                console.warn('⚠️ Pas de token, impossible de charger les livraisons');
                this.livraisons = [];
                return;
            }

            const response = await fetch(`${window.API_CONFIG.API_URL}/livraisons`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const result = await response.json();
            this.livraisons = result.data || [];
            console.log(`✅ ${this.livraisons.length} livraisons chargées depuis l'API`);
            
            // Cache localStorage pour fallback
            localStorage.setItem('livraisonsCache', JSON.stringify(this.livraisons));
            
            this.updateStats();
            this.renderTable();
            
        } catch (error) {
            console.error('❌ Erreur chargement livraisons API:', error);
            
            // Fallback: cache localStorage
            const cached = localStorage.getItem('livraisonsCache');
            if (cached) {
                console.log('💡 Utilisation du cache livraisons...');
                this.livraisons = JSON.parse(cached);
                this.updateStats();
                this.renderTable();
            } else {
                this.livraisons = [];
            }
        }
    }

    async saveLivraison(livraisonData) {
        try {
            console.log('💾 Enregistrement de la livraison via API...');
            
            const token = sessionStorage.getItem('auth_token') || localStorage.getItem('agent_token');
            if (!token) {
                throw new Error('Token manquant - reconnectez-vous');
            }

            const response = await fetch(`${window.API_CONFIG.API_URL}/livraisons`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(livraisonData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erreur lors de l\'enregistrement');
            }

            const result = await response.json();
            console.log('✅ Livraison enregistrée via API:', result.data);
            
            // Recharger les livraisons depuis l'API
            await this.loadLivraisons();
            
            return result.data;
        } catch (error) {
            console.error('❌ Erreur enregistrement livraison:', error);
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

        if (colisList.length === 0) {
            alert('⚠️ Aucun colis disponible !\n\nVeuillez d\'abord créer des colis dans la section COLIS.');
            return;
        }

        // Chercher le colis par tracking (MongoDB), reference, ou autres champs
        const colis = colisList.find(c => 
            c.tracking === codeSuivi || 
            c.reference === codeSuivi || 
            c.trackingNumber === codeSuivi ||
            c.codeSuivi === codeSuivi ||
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
        console.log('📋 Livraisons actuelles:', this.livraisons.length);

        // ✅ CORRECTION: Vérifier si déjà en livraison (seulement les livraisons non confirmées)
        const colisId = colis._id || colis.id;
        const tracking = colis.tracking || colis.reference || colis.codeSuivi || codeSuivi;
        
        console.log('🔍 Recherche de doublon pour:', { colisId, tracking, codeSuivi });
        
        const dejaSorti = this.livraisons.find(l => {
            // Vérifier par colisId OU par reference/tracking
            const matchId = l.colisId === colisId;
            const matchReference = l.reference === tracking || 
                                  l.reference === codeSuivi ||
                                  l.codeSuivi === tracking ||
                                  l.codeSuivi === codeSuivi;
            
            // Ignorer les livraisons déjà confirmées (livrées)
            const estEnCours = !l.statut || l.statut !== 'livre';
            
            console.log('  Comparaison avec livraison:', {
                livraisonId: l._id || l.id,
                colisId: l.colisId,
                reference: l.reference,
                statut: l.statut,
                matchId,
                matchReference,
                estEnCours
            });
            
            return (matchId || matchReference) && estEnCours;
        });

        if (dejaSorti) {
            console.warn('⚠️ Doublon détecté:', dejaSorti);
            const dateSortie = dejaSorti.dateLivraison || dejaSorti.dateSortie || dejaSorti.createdAt;
            alert(`⚠️ Ce colis est déjà sorti pour livraison !\n\n` +
                  `Sorti le: ${this.formatDate(dateSortie)}\n` +
                  `Destination: ${dejaSorti.wilaya || '-'}\n\n` +
                  `Vous devez d'abord confirmer ou supprimer cette livraison.`);
            return;
        }

        // Extraire les informations avec MAPPING CORRECT MongoDB
        const code = colis.tracking || colis.codeSuivi || colis.reference || colis.trackingNumber || codeSuivi;
        const expediteurNom = colis.expediteur?.nom || colis.commercant || colis.clientNom || 'Non spécifié';
        const destinataireNom = colis.destinataire?.nom || colis.client || colis.destinataire || 'Non spécifié';
        const destinataireAdresse = colis.destinataire?.adresse || colis.adresse || 'Non spécifiée';
        const destinataireTel = colis.destinataire?.telephone || colis.telephone || colis.tel || '-';
        const wilayaDest = colis.wilayaDestination || colis.wilaya || colis.destinataire?.wilaya || 'Non spécifiée';

        // Demander confirmation
        const confirmer = confirm(
            `🚚 SORTIR CE COLIS POUR LIVRAISON ?\n\n` +
            `Code de suivi: ${code}\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
            `DESTINATAIRE:\n` +
            `• Nom: ${destinataireNom}\n` +
            `• Tél: ${destinataireTel}\n` +
            `• Adresse: ${destinataireAdresse}\n` +
            `• Wilaya: ${wilayaDest}\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
            `Le colis sera marqué comme "EN LIVRAISON" 🚚`
        );

        if (!confirmer) {
            alert('❌ Opération annulée');
            return;
        }

        // Créer l'enregistrement pour l'API
        const livraisonData = {
            colisId: colis._id || colis.id,
            reference: code,
            nomDestinataire: destinataireNom,
            wilaya: wilayaDest,
            livreurNom: localStorage.getItem('userName') || 'Agent',
            notes: `Colis sorti pour livraison - ${wilayaDest}`,
            montantPaye: colis.montant || 0, // Montant du colis
            statut: 'en_livraison' // ✅ Statut EN LIVRAISON
        };

        try {
            // Enregistrer via API
            await this.saveLivraison(livraisonData);

            // Mettre à jour le statut du colis via API: EN LIVRAISON
            await this.updateColisStatus(colis._id || colis.id, 'en_livraison');

            alert(
                `✅ COLIS SORTI POUR LIVRAISON !\n\n` +
                `Code: ${code}\n` +
                `Destinataire: ${destinataireNom}\n` +
                `Wilaya: ${wilayaDest}\n` +
                `Date sortie: ${this.formatDate(new Date().toISOString())}\n\n` +
                `Le statut a été mis à jour : "EN LIVRAISON" 🚚`
            );

            console.log('✅ Livraison confirmée avec succès');
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
                    description: 'Colis marqué comme livré par l\'agent'
                })
            });

            console.log('📡 Réponse API:', response.status, response.statusText);

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Statut du colis mis à jour via API:', result);
                
                // Recharger les colis depuis l'API
                if (window.DataStore && typeof window.DataStore.loadColis === 'function') {
                    await window.DataStore.loadColis();
                    console.log('✅ Liste des colis rechargée');
                }
                
                return true;
            } else {
                const error = await response.json();
                console.error('❌ Erreur API mise à jour statut:', error);
                alert(`❌ Erreur lors de la mise à jour du statut:\n\n${error.message || JSON.stringify(error)}`);
                return false;
            }
        } catch (error) {
            console.error('❌ Erreur mise à jour statut colis:', error);
            alert(`❌ Erreur technique:\n\n${error.message}`);
            return false;
        }
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
            // ✅ MAPPING CORRECT selon modèle MongoDB Livraison
            const livraisonId = livraison._id || livraison.id;
            const codeSuiviDisplay = livraison.reference || livraison.codeSuivi || 'N/A';
            const destinataireNom = livraison.nomDestinataire || livraison.destinataire?.nom || '-';
            const wilayaDisplay = livraison.wilaya || '-';
            const montantDisplay = parseFloat(livraison.montantPaye || livraison.montant || 0).toLocaleString('fr-FR');
            const dateSortie = livraison.dateLivraison || livraison.dateSortie || livraison.createdAt;
            
            return `
                <tr data-id="${livraisonId}" style="animation: fadeIn 0.3s ease-in ${index * 0.05}s both;">
                    <td>
                        <input type="checkbox" class="row-checkbox" data-id="${livraisonId}">
                    </td>
                    <td>
                        <strong style="color: var(--primary);">${codeSuiviDisplay}</strong>
                    </td>
                    <td>${livraison.livreurNom || '-'}</td>
                    <td>
                        <div><strong>${destinataireNom}</strong></div>
                        <div style="font-size: 12px; color: #666;">${wilayaDisplay}</div>
                    </td>
                    <td>${wilayaDisplay}</td>
                    <td>${this.formatDate(dateSortie)}</td>
                    <td><strong>${montantDisplay} DA</strong></td>
                    <td>
                        <span class="badge warning" style="background: #FF9800;">
                            <i class="fas fa-truck"></i> En livraison
                        </span>
                    </td>
                    <td class="actions">
                        <button class="action-btn view" onclick="livraisonsManager.viewLivraison('${livraisonId}')" title="Voir détails">
                            <ion-icon name="eye-outline"></ion-icon>
                        </button>
                        <button class="action-btn edit" onclick="livraisonsManager.confirmerLivraison('${livraisonId}')" title="Confirmer livraison" style="background: #28a745;">
                            <ion-icon name="checkmark-done-outline"></ion-icon>
                        </button>
                        <button class="action-btn delete" onclick="livraisonsManager.deleteLivraison('${livraisonId}')" title="Supprimer">
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

    // ✅ NOUVELLE FONCTION: Confirmer la livraison et marquer le colis comme "livré"
    async confirmerLivraison(id) {
        const livraison = this.livraisons.find(l => (l._id || l.id) === id);
        if (!livraison) {
            console.error('❌ Livraison introuvable avec ID:', id);
            alert('❌ Livraison introuvable');
            return;
        }

        console.log('📦 Confirmation de livraison - ID:', id);
        console.log('📦 Livraison trouvée:', livraison);

        // Demander confirmation
        const confirmer = confirm(
            `✅ CONFIRMER LA LIVRAISON ?\n\n` +
            `Code: ${livraison.reference || livraison.codeSuivi}\n` +
            `Destinataire: ${livraison.nomDestinataire}\n` +
            `Wilaya: ${livraison.wilaya}\n\n` +
            `Le statut du colis sera mis à jour : "Livré"`
        );

        if (!confirmer) {
            return;
        }

        try {
            // Extraire l'ID du colis (peut être un objet ou une string)
            const colisId = typeof livraison.colisId === 'object' 
                ? (livraison.colisId._id || livraison.colisId.id) 
                : livraison.colisId;
            
            console.log('📦 Tentative de mise à jour du colis ID:', colisId);
            
            if (!colisId) {
                alert('❌ Erreur: ID du colis introuvable');
                return;
            }
            
            // Mettre à jour le statut du colis vers "livre"
            const success = await this.updateColisStatus(colisId, 'livre');
            
            if (!success) {
                console.error('❌ updateColisStatus a échoué');
                return;
            }

            console.log('✅ updateColisStatus réussi, mise à jour de la livraison...');

            // Optionnel: Mettre à jour la livraison dans l'API
            const token = sessionStorage.getItem('auth_token') || localStorage.getItem('agent_token');
            const livraisonResponse = await fetch(`${window.API_CONFIG.API_URL}/livraisons/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    statut: 'livre',
                    dateLivraisonEffective: new Date().toISOString()
                })
            });

            if (livraisonResponse.ok) {
                console.log('✅ Livraison mise à jour dans l\'API');
            } else {
                console.warn('⚠️ Erreur mise à jour livraison (non bloquant)');
            }

            // Recharger les livraisons
            await this.loadLivraisons();
            this.updateStats();
            this.renderTable();

            alert(
                `✅ LIVRAISON CONFIRMÉE !\n\n` +
                `Code: ${livraison.reference || livraison.codeSuivi}\n` +
                `Destinataire: ${livraison.nomDestinataire}\n\n` +
                `Le colis a été marqué comme "Livré"`
            );
        } catch (error) {
            console.error('❌ Erreur confirmerLivraison:', error);
            alert(`❌ Erreur lors de la confirmation\n\nDétails: ${error.message}\n\nVoir console (F12) pour plus d'infos`);
        }
    }

    viewLivraison(id) {
        const livraison = this.livraisons.find(l => (l._id || l.id) === id);
        if (!livraison) return;

        const details = `
📦 DÉTAILS DE LA LIVRAISON

� Référence: ${livraison.reference || livraison.codeSuivi}
👤 Destinataire: ${livraison.nomDestinataire || livraison.destinataire?.nom}
📍 Wilaya: ${livraison.wilaya}
✅ Réceptionné par: ${livraison.recepteur || '-'}
💰 Montant payé: ${livraison.montantPaye || 0} DA
📅 Date: ${this.formatDate(livraison.dateLivraison || livraison.createdAt)}
        `;
        alert(details);
    }

    async deleteLivraison(id) {
        const livraison = this.livraisons.find(l => (l._id || l.id) === id);
        if (!livraison) return;

        if (!confirm(`Voulez-vous vraiment supprimer la livraison ${livraison.reference} ?`)) {
            return;
        }

        try {
            const token = sessionStorage.getItem('auth_token') || localStorage.getItem('agent_token');
            const response = await fetch(`${window.API_CONFIG.API_URL}/livraisons/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                console.log('✅ Livraison supprimée de l\'API');
                // ✅ Recharger depuis l'API
                await this.loadLivraisons();
                this.updateStats();
                this.renderTable();
                alert(`✅ Livraison ${livraison.reference} supprimée avec succès`);
            } else {
                const error = await response.json();
                console.error('❌ Erreur API:', error);
                throw new Error(error.message || 'Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('❌ Erreur deleteLivraison:', error);
            alert(`❌ Erreur lors de la suppression de la livraison\n\n${error.message}`);
        }
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
