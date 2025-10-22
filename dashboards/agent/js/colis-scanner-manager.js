// ==========================================
// 📦 GESTIONNAIRE DE SCANNER COLIS - AGENT
// ==========================================
// Ce module gère le scanner pour marquer les colis en traitement

class ColisScannerManager {
    constructor() {
        this.scanner = null;
        this.isScanning = false;
        console.log('📦 ColisScannerManager initialisé');
    }

    init() {
        console.log('🔄 Initialisation du ColisscannerManager...');
        this.initEventListeners();
    }

    initEventListeners() {
        // Bouton ouvrir le scanner
        const scanBtn = document.getElementById('scanColisBtn');
        if (scanBtn) scanBtn.addEventListener('click', () => this.openScanner());

        // Bouton fermer le scanner
        const closeBtn = document.getElementById('closeScanColis');
        if (closeBtn) closeBtn.addEventListener('click', () => this.closeScanner());

        // Bouton validation manuelle
        const submitManualBtn = document.getElementById('submitManualColis');
        if (submitManualBtn) {
            submitManualBtn.addEventListener('click', () => this.handleManualInput());
            console.log('✅ Event listener ajouté sur submitManualColis');
        } else {
            console.error('❌ Bouton submitManualColis introuvable');
        }

        // Entrée avec touche Enter
        const manualInput = document.getElementById('manualColisInput');
        if (manualInput) {
            manualInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.handleManualInput();
                }
            });
        }
    }

    openScanner() {
        console.log('📱 Ouverture du scanner colis...');
        const scanZone = document.getElementById('scanColisZone');
        if (!scanZone) {
            console.error('❌ Zone de scan introuvable');
            return;
        }

        scanZone.style.display = 'flex';
        this.isScanning = true;

        const manualInput = document.getElementById('manualColisInput');
        if (manualInput) {
            manualInput.value = '';
            manualInput.focus();
        }

        if (!this.scanner) {
            this.scanner = new Html5Qrcode("qr-reader");
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
        console.log('🔴 Fermeture du scanner colis...');
        this.isScanning = false;
        const scanZone = document.getElementById('scanColisZone');
        
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
        const input = document.getElementById('manualColisInput');
        if (!input) return;

        const codeSuivi = input.value.trim().toUpperCase();
        if (!codeSuivi) {
            alert('⚠️ Veuillez entrer un code de suivi');
            input.focus();
            return;
        }

        console.log('🔍 Saisie manuelle colis:', codeSuivi);
        this.handleScan(codeSuivi);
        input.value = '';
        input.focus();
    }

    async handleScan(codeSuivi) {
        if (!this.isScanning) return;

        codeSuivi = codeSuivi.trim().toUpperCase();
        console.log('📦 Scan du colis pour traitement:', codeSuivi);

        this.closeScanner();

        // 🔥 Charger les colis depuis MongoDB
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
            alert('⚠️ Aucun colis disponible !');
            return;
        }

        // Chercher le colis
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

        // Vérifier le statut actuel
        const statutActuel = colis.statut || colis.status || 'enCours';
        
        if (statutActuel === 'en_preparation' || statutActuel === 'pret_a_expedier') {
            alert(`⚠️ Ce colis est déjà en traitement !\n\n` +
                  `Code: ${codeSuivi}\n` +
                  `Statut: ${statutActuel}`);
            return;
        }

        if (statutActuel === 'livre') {
            alert(`⚠️ Ce colis a déjà été livré !\n\n` +
                  `Code: ${codeSuivi}\n` +
                  `Il ne peut plus être modifié.`);
            return;
        }

        // Extraire les informations
        const code = colis.tracking || colis.codeSuivi || colis.reference || colis.trackingNumber || codeSuivi;
        const expediteurNom = colis.expediteur?.nom || colis.commercant || colis.clientNom || 'Non spécifié';
        const destinataireNom = colis.destinataire?.nom || colis.client || colis.destinataire || 'Non spécifié';
        const wilayaDest = colis.wilayaDestination || colis.wilaya || colis.destinataire?.wilaya || 'Non spécifiée';

        // Demander confirmation
        const confirmer = confirm(
            `📦 MARQUER CE COLIS COMME EN TRAITEMENT ?\n\n` +
            `Code de suivi: ${code}\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
            `EXPÉDITEUR:\n` +
            `• ${expediteurNom}\n\n` +
            `DESTINATAIRE:\n` +
            `• Nom: ${destinataireNom}\n` +
            `• Wilaya: ${wilayaDest}\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
            `Statut actuel: ${statutActuel}\n` +
            `Nouveau statut: EN TRAITEMENT`
        );

        if (!confirmer) {
            console.log('❌ Opération annulée par l\'utilisateur');
            return;
        }

        // Mettre à jour le statut dans MongoDB
        try {
            const token = sessionStorage.getItem('auth_token') || localStorage.getItem('agent_token');
            const colisId = colis._id || colis.id;

            const response = await fetch(`${window.API_CONFIG.API_URL}/colis/${colisId}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: 'en_preparation',
                    description: 'Colis en cours de traitement par l\'agent'
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            console.log('✅ Colis mis à jour:', result);

            alert(`✅ COLIS MARQUÉ EN TRAITEMENT !\n\n` +
                  `Code: ${code}\n` +
                  `Statut: EN TRAITEMENT\n\n` +
                  `Le tableau des colis va se rafraîchir.`);

            // Recharger les données
            if (window.DataStore && window.DataStore.loadColis) {
                await window.DataStore.loadColis();
            }

            // Rafraîchir le tableau
            if (window.TableManager && window.TableManager.renderTable) {
                window.TableManager.renderTable();
            }

        } catch (error) {
            console.error('❌ Erreur mise à jour colis:', error);
            alert(`❌ ERREUR lors de la mise à jour !\n\n` +
                  `${error.message}\n\n` +
                  `Veuillez réessayer ou contacter le support.`);
        }
    }
}

// Créer l'instance globale
const colisScannerManager = new ColisScannerManager();

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', () => {
    console.log('📦 Initialisation du ColisScannerManager...');
    colisScannerManager.init();
});

// Exporter pour utilisation dans d'autres modules
window.ColisScannerManager = colisScannerManager;
