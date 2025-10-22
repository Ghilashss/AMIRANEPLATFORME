// Gestionnaire du scanner QR code
export class ScannerManager {
    constructor() {
        this.html5QrcodeScanner = null;
        this.scanZone = document.getElementById('scanColisZone');
        this.scanButton = document.getElementById('scanColisBtn');
        this.closeButton = document.getElementById('closeScanColis');
    }

    init() {
        console.log('Initialisation de ScannerManager');
        console.log('Bouton scan trouvé:', !!this.scanButton);
        console.log('Bouton fermer trouvé:', !!this.closeButton);
        
        if (this.scanButton) {
            console.log('Ajout du gestionnaire d\'événements pour le bouton scan');
            this.scanButton.addEventListener('click', (e) => {
                console.log('Clic sur le bouton scan');
                e.preventDefault();
                this.startScanner();
            });
        } else {
            console.error('Bouton scan non trouvé dans le DOM');
        }
        
        if (this.closeButton) {
            this.closeButton.addEventListener('click', (e) => {
                console.log('Clic sur le bouton fermer');
                e.preventDefault();
                this.stopScanner();
            });
        }
    }

    startScanner() {
        if (!this.scanZone) return;
        
        this.scanZone.style.display = 'flex';
        
        // Configuration du scanner
        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
        };

        // Créer une nouvelle instance du scanner
        this.html5QrcodeScanner = new Html5QrcodeScanner(
            "qr-reader",
            config
        );

        // Démarrer le scanner avec les callbacks
        this.html5QrcodeScanner.render((decodedText, decodedResult) => {
            // Gérer le scan réussi
            this.handleSuccessfulScan(decodedText, decodedResult);
        }, (error) => {
            // Gérer les erreurs silencieusement
            console.log(`Code scan error = ${error}`);
        });
    }

    stopScanner() {
        if (this.html5QrcodeScanner) {
            this.html5QrcodeScanner.clear()
                .then(() => {
                    this.scanZone.style.display = 'none';
                    this.html5QrcodeScanner = null;
                })
                .catch((err) => console.error("Failed to clear scanner:", err));
        } else {
            this.scanZone.style.display = 'none';
        }
    }

    handleSuccessfulScan(decodedText, decodedResult) {
        // Arrêter le scanner après un scan réussi
        this.stopScanner();

        // Rechercher le colis dans le DataStore
        const colis = window.DataStore.colis.find(c => c.reference === decodedText);
        
        if (colis) {
            // Afficher les détails du colis dans la modale
            const form = document.getElementById('colisForm');
            if (form) {
                // Remplir le formulaire avec les données du colis
                Object.keys(colis).forEach(key => {
                    const input = form.querySelector(`#colis${key.charAt(0).toUpperCase() + key.slice(1)}`);
                    if (input) {
                        input.value = colis[key];
                    }
                });
                
                // Afficher la modale
                const modal = document.getElementById('colisModal');
                if (modal) {
                    modal.style.display = 'flex';
                }
            }
        } else {
            // Afficher un message si le colis n'est pas trouvé
            alert('Colis non trouvé dans la base de données.');
        }
    }
}