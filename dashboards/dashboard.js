// ===== Configuration =====
const CONFIG = {
    DATE_FORMAT: 'fr-FR',
    CURRENCY: 'DZD',
    CURRENCY_DISPLAY: 'DA'
};

// ===== Utilitaires =====
const UTILS = {
    formatMontant: function(montant) {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'DZD' }).format(montant).replace('DZD', 'DA');
    },

    formatDate: function(dateStr) {
        return new Date(dateStr).toLocaleDateString('fr-FR');
    },

    formatDateTime: function(dateTimeStr) {
        return new Date(dateTimeStr).toLocaleString('fr-FR');
    },

    getStatusClass: function(status) {
        status = status.toLowerCase();
        if (status.includes('livr')) return 'success';
        if (status.includes('cours')) return 'info';
        if (status.includes('attente')) return 'warning';
        if (status.includes('retour') || status.includes('annul')) return 'danger';
        return '';
    },

    getPriorityClass: function(priority) {
        priority = priority.toLowerCase();
        if (priority.includes('haute')) return 'danger';
        if (priority.includes('moyenne')) return 'warning';
        if (priority.includes('basse')) return 'success';
        return '';
    }
};

// ===== Données =====
const DATA = {
    demo: {
        colis: {
            total: 1250,
            enCours: 450,
            livres: 680,
            retours: 120,
            transferts: 85,
            enAttente: 145
        },
        finance: {
            encaissements: 2500000,
            aEncaisser: 850000,
            commission: 375000,
            paiementsCommercants: 48
        },
        performance: {
            tauxLivraison: 85,
            delaiMoyen: 2.3,
            tentativesMoyennes: 1.4,
            satisfaction: 92
        }
    },
    commercants: [
        { id: 1, nom: "Store Digital", responsable: "Ahmed Benali", tel: "0555123456", email: "store@email.com", wilaya: "Alger", nbColis: 156, ca: 850000, tauxLivraison: 92, status: "active" },
        { id: 2, nom: "Tech Shop", responsable: "Karim Medjadi", tel: "0555789012", email: "tech@email.com", wilaya: "Oran", nbColis: 89, ca: 420000, tauxLivraison: 88, status: "active" }
    ],
    colis: [],
    retours: [
        { code: "RET123", colisRef: "COL120", date: "2025-09-25", client: "Kamel Hadj", wilaya: "Alger", commercant: "Store Digital", motif: "Client absent", montant: 5600, livreur: "Ali Ahmed", status: "En attente" },
        { code: "RET124", colisRef: "COL118", date: "2025-09-24", client: "Nadia Benali", wilaya: "Alger", commercant: "Tech Shop", motif: "Refus du colis", montant: 7800, livreur: "Mohamed Said", status: "Validé" }
    ],
    reclamations: [
        { numero: "REC123", date: "2025-09-26", colisRef: "COL115", client: "Fatima Zahra", type: "Retard", description: "Colis non livré après 3 jours", priorite: "Haute", assigneA: "Service Client", statut: "En cours", derniereMaj: "2025-09-26 14:30" },
        { numero: "REC124", date: "2025-09-25", colisRef: "COL112", client: "Ahmed Kader", type: "Dommage", description: "Colis reçu endommagé", priorite: "Moyenne", assigneA: "Service Qualité", statut: "Résolu", derniereMaj: "2025-09-26 09:15" }
    ]
};

// ===== Gestionnaire des Pages =====
const PageManager = {
    currentPage: null,

    init() {
        this.initializeNavigation();
        // Gérer la navigation par URL au chargement
        const hash = window.location.hash.slice(1);
        if (hash) {
            this.showPage(hash);
        } else {
            this.showPage('dashboard');
        }

        // Écouter les changements d'URL
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page) {
                this.showPage(e.state.page);
            }
        });
    },

    initializeNavigation() {
        const navLinks = document.querySelectorAll(".navigation li a");
        navLinks.forEach(link => {
            link.onclick = (e) => {
                if (link.getAttribute("href") === "../index.html") return;
                e.preventDefault();
                const pageId = link.dataset.page;
                this.showPage(pageId);
                // Mettre à jour la classe active
                navLinks.forEach(l => l.parentElement.classList.remove("hovered"));
                link.parentElement.classList.add("hovered");
            };
        });
    },

    showPage(pageId) {
        // Cacher toutes les pages
        document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
        
        // Afficher la page demandée
        const pageToShow = document.getElementById(pageId);
        if (!pageToShow) {
            console.error(`Page ${pageId} non trouvée`);
            return;
        }

        // Activer la page
        pageToShow.classList.add("active");
        this.currentPage = pageId;
        
        // Charger les données
        this.loadPageData(pageId);
        
        // Mettre à jour l'URL sans recharger la page
        history.pushState({page: pageId}, '', `#${pageId}`);

        // Mettre à jour la navigation
        document.querySelectorAll(".navigation li").forEach(li => {
            const link = li.querySelector('a');
            if (link && link.dataset.page === pageId) {
                li.classList.add("hovered");
            } else {
                li.classList.remove("hovered");
            }
        });
    },

    loadPageData(pageId) {
        const loader = this.loaders[pageId];
        if (loader) {
            try {
                loader();
            } catch (error) {
                console.error(`Erreur lors du chargement de ${pageId}:`, error);
            }
        }
    },

    // Loaders pour chaque page
    loaders: {
        dashboard() {
            // Stats Colis
            const stats = DATA.demo.colis;
            [
                ['totalColisDash', stats.total],
                ['colisEnCours', stats.enCours],
                ['colisLivres', stats.livres],
                ['colisAttente', stats.enAttente],
                ['colisRetours', stats.retours],
                ['colisTransferts', stats.transferts]
            ].forEach(([id, value]) => {
                const el = document.getElementById(id);
                if (el) el.textContent = value;
            });

            // Stats Finance
            const finance = DATA.demo.finance;
            [
                ['encaissements', finance.encaissements],
                ['aEncaisser', finance.aEncaisser],
                ['commission', finance.commission]
            ].forEach(([id, value]) => {
                const el = document.getElementById(id);
                if (el) el.textContent = UTILS.formatMontant(value);
            });

            const paiementsEl = document.getElementById('paiementCommercants');
            if (paiementsEl) paiementsEl.textContent = finance.paiementsCommercants;

            // Stats Performance
            const perf = DATA.demo.performance;
            [
                ['tauxLivraison', perf.tauxLivraison + '%'],
                ['delaiMoyen', perf.delaiMoyen + 'j'],
                ['tentativesMoyennes', perf.tentativesMoyennes],
                ['satisfaction', perf.satisfaction + '%']
            ].forEach(([id, value]) => {
                const el = document.getElementById(id);
                if (el) el.textContent = value;
            });

            // Barre de progression
            const progressBar = document.querySelector('#tauxLivraison + .progress-bar .progress');
            if (progressBar) progressBar.style.width = perf.tauxLivraison + '%';
        },

        colis() {
            console.log('Chargement de la page colis...');
            const tbody = document.querySelector('#colisTable tbody');
            if (!tbody) {
                console.error('tbody non trouvé');
                return;
            }

            // Charger les colis depuis le localStorage
            const storedColis = JSON.parse(localStorage.getItem('colisData')) || [];
            console.log('Colis stockés:', storedColis);
            DATA.colis = storedColis;

            tbody.innerHTML = '';
            DATA.colis.forEach(c => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><input type="checkbox"></td>
                    <td>${c.ref}</td>
                    <td>${UTILS.formatDate(c.date)}</td>
                    <td>${c.client}</td>
                    <td>${c.tel || ''}</td>
                    <td>${c.adresse || ''}</td>
                    <td>${c.commercant || ''}</td>
                    <td>${UTILS.formatMontant(c.montant)}</td>
                    <td><span class="status-badge ${UTILS.getStatusClass(c.statut)}">${c.statut}</span></td>
                    <td>
                        <div class="actions">
                            <button onclick="viewColis('${c.ref}')" title="Voir">
                                <ion-icon name="eye-outline"></ion-icon>
                            </button>
                            <button onclick="editColis('${c.ref}')" title="Modifier">
                                <ion-icon name="create-outline"></ion-icon>
                            </button>
                            <button onclick="printColis('${c.ref}')" title="Imprimer">
                                <ion-icon name="print-outline"></ion-icon>
                            </button>
                            <button onclick="deleteColis('${c.ref}')" title="Supprimer">
                                <ion-icon name="trash-outline"></ion-icon>
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(row);

                // Générer le QR code
                const qrCanvas = document.createElement('canvas');
                qrCanvas.id = `qr-${c.ref}`;
                qrCanvas.width = 50;
                qrCanvas.height = 50;
                const firstCell = row.querySelector('td');
                firstCell.appendChild(qrCanvas);

                // Créer le QR code
                if (typeof QRious !== 'undefined') {
                    new QRious({
                        element: qrCanvas,
                        value: c.ref,
                        size: 50
                    });
                }
            });

            // Mettre à jour les stats
            this.dashboard();
        },

        commercant() {
            const tbody = document.querySelector('#commercantTable tbody');
            if (!tbody) return;

            tbody.innerHTML = '';
            DATA.commercants.forEach(c => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${c.id}</td>
                    <td>${c.nom}</td>
                    <td>${c.responsable}</td>
                    <td>${c.tel}</td>
                    <td>${c.email}</td>
                    <td>${c.wilaya}</td>
                    <td>${c.nbColis}</td>
                    <td>${UTILS.formatMontant(c.ca)}</td>
                    <td>${c.tauxLivraison}%</td>
                    <td><span class="status-badge ${c.status}">${c.status}</span></td>
                    <td>
                        <div class="actions">
                            <button onclick="viewCommercant(${c.id})" title="Voir">
                                <ion-icon name="eye-outline"></ion-icon>
                            </button>
                            <button onclick="editCommercant(${c.id})" title="Modifier">
                                <ion-icon name="create-outline"></ion-icon>
                            </button>
                            <button onclick="deleteCommercant(${c.id})" title="Supprimer">
                                <ion-icon name="trash-outline"></ion-icon>
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(row);
            });
        },

        retours() {
            const tbody = document.querySelector('#retoursTable tbody');
            if (!tbody) return;

            tbody.innerHTML = '';
            DATA.retours.forEach(r => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${r.code}</td>
                    <td>${r.colisRef}</td>
                    <td>${UTILS.formatDate(r.date)}</td>
                    <td>${r.client}</td>
                    <td>${r.wilaya}</td>
                    <td>${r.commercant}</td>
                    <td>${r.motif}</td>
                    <td>${UTILS.formatMontant(r.montant)}</td>
                    <td>${r.livreur}</td>
                    <td><span class="status-badge ${UTILS.getStatusClass(r.status)}">${r.status}</span></td>
                    <td>
                        <div class="actions">
                            <button onclick="viewRetour('${r.code}')" title="Voir">
                                <ion-icon name="eye-outline"></ion-icon>
                            </button>
                            <button onclick="editRetour('${r.code}')" title="Modifier">
                                <ion-icon name="create-outline"></ion-icon>
                            </button>
                            <button onclick="deleteRetour('${r.code}')" title="Supprimer">
                                <ion-icon name="trash-outline"></ion-icon>
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(row);
            });
        },

        reclamation() {
            const tbody = document.querySelector('#reclamationTable tbody');
            if (!tbody) return;

            tbody.innerHTML = '';
            DATA.reclamations.forEach(r => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${r.numero}</td>
                    <td>${UTILS.formatDate(r.date)}</td>
                    <td>${r.colisRef}</td>
                    <td>${r.client}</td>
                    <td>${r.type}</td>
                    <td>${r.description}</td>
                    <td><span class="priority-badge ${UTILS.getPriorityClass(r.priorite)}">${r.priorite}</span></td>
                    <td>${r.assigneA}</td>
                    <td><span class="status-badge ${UTILS.getStatusClass(r.statut)}">${r.statut}</span></td>
                    <td>${UTILS.formatDateTime(r.derniereMaj)}</td>
                    <td>
                        <div class="actions">
                            <button onclick="viewReclamation('${r.numero}')" title="Voir">
                                <ion-icon name="eye-outline"></ion-icon>
                            </button>
                            <button onclick="editReclamation('${r.numero}')" title="Modifier">
                                <ion-icon name="create-outline"></ion-icon>
                            </button>
                            <button onclick="deleteReclamation('${r.numero}')" title="Supprimer">
                                <ion-icon name="trash-outline"></ion-icon>
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(row);
            });
        }
    }
};

// ===== Gestionnaire des Modales =====
const ModalManager = {
    config: [
        { id: 'colisModal', openBtn: 'addColisBtn', form: 'colisForm' },
        { id: 'commercantModal', openBtn: 'addCommercantBtn', form: 'commercantForm' },
        { id: 'retourModal', openBtn: 'addRetourBtn', form: 'retourForm' },
        { id: 'reclamationModal', openBtn: 'addReclamationBtn', form: 'reclamationForm' }
    ],

    setupModal: function(modalId, openBtnId, formId) {
        const modal = document.getElementById(modalId);
        const openBtn = document.getElementById(openBtnId);
        const closeBtn = modal?.querySelector('.close-button');
        const form = document.getElementById(formId);

        if (openBtn && modal) {
            openBtn.onclick = () => modal.style.display = 'flex';
        }
        if (closeBtn) {
            closeBtn.onclick = () => modal.style.display = 'none';
        }
        if (modal) {
            window.onclick = (e) => {
                if (e.target === modal) modal.style.display = 'none';
            };
        }
        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                
                // Si c'est le formulaire de colis
                if (formId === 'colisForm') {
                    try {
                        // Récupérer les données du formulaire
                        const formFields = {
                            client: form.querySelector('[name="client"]'),
                            tel: form.querySelector('[name="tel"]'),
                            adresse: form.querySelector('[name="adresse"]'),
                            commercant: form.querySelector('[name="commercant"]'),
                            montant: form.querySelector('[name="montant"]')
                        };

                        // Vérifier que tous les champs existent
                        Object.entries(formFields).forEach(([field, element]) => {
                            if (!element) {
                                throw new Error(`Champ ${field} non trouvé dans le formulaire`);
                            }
                        });

                        const colis = {
                            ref: 'COL' + Date.now(),
                            date: new Date().toISOString(),
                            client: formFields.client.value,
                            tel: formFields.tel.value,
                            adresse: formFields.adresse.value,
                            commercant: formFields.commercant.value,
                            montant: parseFloat(formFields.montant.value),
                            statut: 'En attente'
                        };
                        
                        console.log('Nouveau colis à ajouter:', colis);
                        
                        // Récupérer les colis existants
                        let storedColis = [];
                        try {
                            storedColis = JSON.parse(localStorage.getItem('colisData')) || [];
                        } catch (e) {
                            console.error('Erreur lors de la lecture du localStorage:', e);
                        }
                        
                        // Ajouter le nouveau colis
                        storedColis.push(colis);
                        console.log('Liste mise à jour des colis:', storedColis);
                        
                        // Sauvegarder dans localStorage
                        localStorage.setItem('colisData', JSON.stringify(storedColis));
                        
                        // Mettre à jour les données en mémoire
                        DATA.colis = storedColis;
                        
                        // Forcer la mise à jour de la page des colis et rediriger si nécessaire
                        if (PageManager.currentPage === 'colis') {
                            console.log('Rechargement de la page colis...');
                            PageManager.loaders.colis();
                        } else {
                            // Si on n'est pas sur la page colis, y aller
                            console.log('Redirection vers la page colis...');
                            PageManager.showPage('colis');
                        }
                        
                        // Afficher un message de confirmation
                        alert('Colis enregistré avec succès!');
                    } catch (error) {
                        console.error('Erreur lors de l\'enregistrement du colis:', error);
                        alert('Erreur lors de l\'enregistrement du colis: ' + error.message);
                    }
                }
                
                // Fermer la modale et réinitialiser le formulaire
                modal.style.display = 'none';
                form.reset();
            };
        }
    },

    init: function() {
        this.config.forEach(modal => {
            this.setupModal(modal.id, modal.openBtn, modal.form);
        });
    }
};

// ===== Initialisation =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initialisation de l\'application...');
    
    // Effacer les anciens colis du localStorage (à supprimer après les tests)
    // localStorage.removeItem('colisData');
    
    // Gestion de la barre latérale
    const toggle = document.querySelector(".toggle");
    const navigation = document.querySelector(".navigation");
    const main = document.querySelector(".main");
    
    if (toggle && navigation && main) {
        toggle.onclick = () => {
            navigation.classList.toggle("active");
            main.classList.toggle("active");
        };
    }

    // Initialiser les gestionnaires
    ModalManager.init();
    PageManager.init();
});