export const ScanManager = {
    reader: null,
    scanZone: null,
    closeButton: null,
    scanButton: null,
    manualInput: null,
    submitManualButton: null,

    init() {
        // Initialiser les éléments DOM
        this.scanZone = document.getElementById('scanColisZone');
        this.closeButton = document.getElementById('closeScanColis');
        this.scanButton = document.getElementById('scanColisBtn');
        this.manualInput = document.getElementById('manualColisInput');
        this.submitManualButton = document.getElementById('submitManualColis');

        if (!this.scanZone || !this.closeButton || !this.scanButton) {
            console.error('Les éléments nécessaires ne sont pas trouvés dans le DOM');
            return;
        }

        // Ajouter les gestionnaires d'événements
        this.scanButton.addEventListener('click', () => this.startScanning());
        this.closeButton.addEventListener('click', () => this.stopScanning());
        
        // Gestionnaire pour la saisie manuelle
        if (this.submitManualButton) {
            this.submitManualButton.addEventListener('click', () => this.handleManualInput());
        }
        
        if (this.manualInput) {
            this.manualInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleManualInput();
                }
            });
        }
    },

    handleManualInput() {
        if (!this.manualInput) return;
        
        const codeSuivi = this.manualInput.value.trim();
        if (!codeSuivi) {
            alert('⚠️ Veuillez entrer un code de suivi');
            return;
        }

        // Arrêter le scanner et fermer la zone
        this.stopScanning();

        // Émettre un événement avec le code saisi
        document.dispatchEvent(new CustomEvent('qrCodeScanned', {
            detail: {
                text: codeSuivi,
                result: { decodedText: codeSuivi }
            }
        }));

        // Vider le champ
        this.manualInput.value = '';
    },

    startScanning() {
        // Afficher la zone de scan
        this.scanZone.style.display = 'block';

        // Si un lecteur existe déjà, le nettoyer
        if (this.reader) {
            this.reader.clear();
        }

        // Créer une nouvelle instance de Html5QrcodeScanner
        this.reader = new Html5Qrcode('qr-reader');

        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
        };

        // Démarrer la caméra et le scan
        this.reader.start(
            { facingMode: "environment" }, // Utiliser la caméra arrière si disponible
            config,
            this.onScanSuccess.bind(this),
            this.onScanError.bind(this)
        ).catch(err => {
            console.error('Erreur lors du démarrage de la caméra:', err);
            alert('Impossible d\'accéder à la caméra. Vérifiez que vous avez donné les permissions nécessaires.');
        });
    },

    stopScanning() {
        if (this.reader) {
            this.reader.stop()
                .then(() => {
                    this.scanZone.style.display = 'none';
                    this.reader = null;
                })
                .catch(err => console.error('Erreur lors de l\'arrêt du scanner:', err));
        } else {
            this.scanZone.style.display = 'none';
        }
    },

    onScanSuccess(decodedText, decodedResult) {
        // Arrêter le scanner après une lecture réussie
        this.stopScanning();

        // Émettre un événement avec le résultat du scan
        document.dispatchEvent(new CustomEvent('qrCodeScanned', {
            detail: {
                text: decodedText,
                result: decodedResult
            }
        }));
    },

    onScanError(err) {
        // Gérer les erreurs silencieusement pour ne pas polluer la console
        if (err === 'QR code parse error, error = NotFoundException: No MultiFormat Readers were able to detect the code.') {
            return; // Ignorer cette erreur courante
        }
        console.error('Erreur de scan:', err);
    }
};