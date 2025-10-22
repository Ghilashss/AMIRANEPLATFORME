// Liste des wilayas - Sera chargée depuis l'API
let WILAYAS_ALGERIE = [];

// Fallback: wilayas hardcodées si l'API ne répond pas
const WILAYAS_FALLBACK = [
    { code: "01", nom: "Adrar" },
    { code: "02", nom: "Chlef" },
    { code: "03", nom: "Laghouat" },
    { code: "04", nom: "Oum El Bouaghi" },
    { code: "05", nom: "Batna" },
    { code: "06", nom: "Béjaïa" },
    { code: "07", nom: "Biskra" },
    { code: "08", nom: "Béchar" },
    { code: "09", nom: "Blida" },
    { code: "10", nom: "Bouira" },
    { code: "11", nom: "Tamanrasset" },
    { code: "12", nom: "Tébessa" },
    { code: "13", nom: "Tlemcen" },
    { code: "14", nom: "Tiaret" },
    { code: "15", nom: "Tizi Ouzou" },
    { code: "16", nom: "Alger" },
    { code: "17", nom: "Djelfa" },
    { code: "18", nom: "Jijel" },
    { code: "19", nom: "Sétif" },
    { code: "20", nom: "Saïda" },
    { code: "21", nom: "Skikda" },
    { code: "22", nom: "Sidi Bel Abbès" },
    { code: "23", nom: "Annaba" },
    { code: "24", nom: "Guelma" },
    { code: "25", nom: "Constantine" },
    { code: "26", nom: "Médéa" },
    { code: "27", nom: "Mostaganem" },
    { code: "28", nom: "M'Sila" },
    { code: "29", nom: "Mascara" },
    { code: "30", nom: "Ouargla" },
    { code: "31", nom: "Oran" },
    { code: "32", nom: "El Bayadh" },
    { code: "33", nom: "Illizi" },
    { code: "34", nom: "Bordj Bou Arréridj" },
    { code: "35", nom: "Boumerdès" },
    { code: "36", nom: "El Tarf" },
    { code: "37", nom: "Tindouf" },
    { code: "38", nom: "Tissemsilt" },
    { code: "39", nom: "El Oued" },
    { code: "40", nom: "Khenchela" },
    { code: "41", nom: "Souk Ahras" },
    { code: "42", nom: "Tipaza" },
    { code: "43", nom: "Mila" },
    { code: "44", nom: "Aïn Defla" },
    { code: "45", nom: "Naâma" },
    { code: "46", nom: "Aïn Témouchent" },
    { code: "47", nom: "Ghardaïa" },
    { code: "48", nom: "Relizane" },
    { code: "49", nom: "Timimoun" },
    { code: "50", nom: "Bordj Badji Mokhtar" },
    { code: "51", nom: "Ouled Djellal" },
    { code: "52", nom: "Béni Abbès" },
    { code: "53", nom: "In Salah" },
    { code: "54", nom: "In Guezzam" },
    { code: "55", nom: "Touggourt" },
    { code: "56", nom: "Djanet" },
    { code: "57", nom: "El M'Ghaïer" },
    { code: "58", nom: "El Meniaa" }
];

// Fonction pour charger les wilayas depuis l'API
async function loadWilayasFromAPI() {
    console.log('🔍 Chargement des wilayas depuis l\'API backend...');
    
    try {
        const token = sessionStorage.getItem('auth_token') || localStorage.getItem('admin_token');
        if (!token) {
            console.warn('⚠️ Pas de token, utilisation des wilayas fallback');
            WILAYAS_ALGERIE = WILAYAS_FALLBACK;
            return WILAYAS_ALGERIE;
        }
        
        const response = await fetch(`${window.API_CONFIG.API_URL}/wilayas`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ Réponse API wilayas reçue:', result);
        
        // L'API retourne { success: true, data: [...] }
        const wilayasFromAPI = result.data || result.wilayas || [];
        
        if (wilayasFromAPI.length > 0) {
            WILAYAS_ALGERIE = wilayasFromAPI;
            console.log('✅ ' + WILAYAS_ALGERIE.length + ' wilayas chargées depuis l\'API MongoDB');
        } else {
            console.warn('⚠️ Aucune wilaya retournée par l\'API, utilisation du fallback');
            WILAYAS_ALGERIE = WILAYAS_FALLBACK;
        }
        
        return WILAYAS_ALGERIE;
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement des wilayas depuis l\'API:', error);
        console.log('💡 Utilisation des wilayas fallback...');
        WILAYAS_ALGERIE = WILAYAS_FALLBACK;
        return WILAYAS_ALGERIE;
    }
}

// 🔥 SÉCURITÉ: Protection par mot de passe SUPPRIMÉE
// ❌ Ne JAMAIS stocker de mot de passe dans localStorage!
// ✅ L'authentification se fait via JWT (token)
// Si protection nécessaire, utiliser les rôles utilisateur dans le backend

// Store pour la gestion des frais - VERSION API
class FraisLivraisonStore {
    constructor() {
        this.frais = [];
        this.loadFrais();
    }

    async loadFrais() {
        console.log('🔍 Chargement des frais depuis l\'API MongoDB...');
        try {
            const token = sessionStorage.getItem('auth_token') || localStorage.getItem('admin_token');
            if (!token) {
                console.warn('⚠️ Pas de token, chargement impossible');
                return [];
            }

            const response = await fetch(`${window.API_CONFIG.API_URL}/frais-livraison`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const result = await response.json();
            console.log('✅ Frais chargés depuis l\'API MongoDB:', result);
            
            this.frais = result.data || [];
            
            return this.frais;
        } catch (error) {
            console.error('❌ Erreur chargement frais depuis API:', error);
            this.frais = [];
            return this.frais;
        }
    }

    async addFrais(data) {
        // Validation minimale
        if (!data.wilayaDepart || !data.wilayaArrivee) {
            throw new Error('Wilaya de départ et d\'arrivée sont obligatoires');
        }

        console.log('💾 Enregistrement frais vers API...', data);

        try {
            const token = sessionStorage.getItem('auth_token') || localStorage.getItem('admin_token');
            if (!token) {
                throw new Error('Token manquant - reconnectez-vous');
            }

            // Mapper les champs vers le modèle API
            const apiData = {
                wilayaSource: data.wilayaDepart,
                wilayaDest: data.wilayaArrivee,
                // ✅ fraisStopDesk et fraisDomicile sont UNIQUEMENT pour compatibilité
                // La vraie logique utilise baseBureau/parKgBureau et baseDomicile/parKgDomicile
                fraisStopDesk: data.baseBureau || 0,  // Juste la base, pas d'addition
                fraisDomicile: data.baseDomicile || 0,  // Juste la base, pas d'addition
                // Détails pour le calcul réel
                baseBureau: data.baseBureau || 0,
                parKgBureau: data.parKgBureau || 0,
                baseDomicile: data.baseDomicile || 0,
                parKgDomicile: data.parKgDomicile || 0
            };

            const response = await fetch(`${window.API_CONFIG.API_URL}/frais-livraison`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(apiData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erreur lors de l\'enregistrement');
            }

            const result = await response.json();
            console.log('✅ Frais enregistré via API:', result);

            // Recharger les frais depuis l'API
            await this.loadFrais();

            return result.data;
        } catch (error) {
            console.error('❌ Erreur enregistrement frais:', error);
            throw error;
        }
    }

    async deleteFrais(wilayaDepart, wilayaArrivee) {
        try {
            const token = sessionStorage.getItem('auth_token') || localStorage.getItem('admin_token');
            if (!token) {
                throw new Error('Token manquant');
            }

            // Trouver l'ID du frais
            const frais = this.frais.find(f => 
                f.wilayaSource === wilayaDepart && f.wilayaDest === wilayaArrivee
            );

            if (!frais || !frais._id) {
                throw new Error('Frais non trouvé');
            }

            const response = await fetch(`${window.API_CONFIG.API_URL}/frais-livraison/${frais._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erreur lors de la suppression');
            }

            console.log('✅ Frais supprimé via API');

            // Recharger les frais
            await this.loadFrais();
        } catch (error) {
            console.error('❌ Erreur suppression frais:', error);
            throw error;
        }
    }

    getFrais(wilayaDepart, wilayaArrivee) {
        // Compatibilité: chercher avec wilayaSource/wilayaDest (API) ou wilayaDepart/wilayaArrivee (ancien)
        return this.frais.find(f => 
            (f.wilayaSource === wilayaDepart || f.wilayaDepart === wilayaDepart) && 
            (f.wilayaDest === wilayaArrivee || f.wilayaArrivee === wilayaArrivee)
        );
    }

    getWilayaInfo(code) {
        return WILAYAS_ALGERIE.find(w => w.code === code);
    }
}

// Initialisation du store
const fraisStore = new FraisLivraisonStore();

// Mise à jour du tableau des frais
function updateFraisTable(wilayaDepart) {
    const tableBody = document.getElementById('fraisTableBody');
    if (!tableBody) return;

    // Vider le tableau
    tableBody.innerHTML = '';

    // Si aucune wilaya n'est sélectionnée, afficher toutes les wilayas
    if (!wilayaDepart) {
        WILAYAS_ALGERIE.forEach(wilaya => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${wilaya.code}</td>
                <td>${wilaya.nom}</td>
                <td colspan="2" class="text-center">
                    <button class="btn btn-primary select-wilaya" data-code="${wilaya.code}">
                        Sélectionner cette wilaya
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        return;
    }

    // Mettre à jour le nom de la wilaya de départ
    const wilayaDepartNom = document.getElementById('wilayaDepartNom');
    if (wilayaDepartNom) {
        const wilayaInfo = fraisStore.getWilayaInfo(wilayaDepart);
        wilayaDepartNom.innerHTML = wilayaInfo ? `<span class="badge-wilaya">${wilayaInfo.nom} (${wilayaInfo.code})</span>` : '<span class="text-muted">Sélectionnez une wilaya</span>';
    }

    // Pour chaque wilaya (sauf celle de départ)
    WILAYAS_ALGERIE.filter(w => w.code !== wilayaDepart).forEach(wilaya => {
        // Récupérer les frais existants
        const fraisExistants = fraisStore.getFrais(wilayaDepart, wilaya.code);
        
        // Créer la ligne avec un design simple
        const row = document.createElement('tr');
        row.dataset.wilayaArrivee = wilaya.code;
        row.className = fraisExistants ? 'has-data' : '';
        
        row.innerHTML = `
            <td class="text-center"><strong>${wilaya.code}</strong></td>
            <td><strong>${wilaya.nom}</strong></td>
            <td>
                <input type="number" 
                       class="form-input" 
                       placeholder="Base" 
                       value="${fraisExistants?.baseDomicile || ''}"
                       data-type="baseDomicile">
            </td>
            <td>
                <input type="number" 
                       class="form-input" 
                       placeholder="Par kg" 
                       value="${fraisExistants?.parKgDomicile || ''}"
                       data-type="parKgDomicile">
            </td>
            <td>
                <input type="number" 
                       class="form-input" 
                       placeholder="Base" 
                       value="${fraisExistants?.baseBureau || ''}"
                       data-type="baseBureau">
            </td>
            <td>
                <input type="number" 
                       class="form-input" 
                       placeholder="Par kg" 
                       value="${fraisExistants?.parKgBureau || ''}"
                       data-type="parKgBureau">
            </td>
            <td class="text-center">
                <button class="btn-save-simple save-tarifs" data-wilaya="${wilaya.code}" title="Enregistrer">
                    <i class="fas fa-save"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Fonction pour initialiser les selects de wilayas
function initializeWilayaSelects() {
    console.log('📋 Initialisation des selects de wilayas...');
    
    // Remplir le sélecteur de wilaya de départ
    const wilayaSelect = document.getElementById('wilayaDepart');
    if (wilayaSelect) {
        // Vider d'abord le sélecteur
        wilayaSelect.innerHTML = '';
        
        // Ajouter l'option par défaut
        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.textContent = "Sélectionnez une wilaya de départ...";
        wilayaSelect.appendChild(defaultOption);
        
        // Ajouter toutes les wilayas
        WILAYAS_ALGERIE.forEach(wilaya => {
            const option = document.createElement('option');
            option.value = wilaya.code;
            option.textContent = `${wilaya.code} - ${wilaya.nom}`;
            wilayaSelect.appendChild(option);
        });

        console.log('✅ Select wilayaDepart rempli avec ' + WILAYAS_ALGERIE.length + ' wilayas');

        // Événement de changement de wilaya
        wilayaSelect.addEventListener('change', function() {
            updateFraisTable(this.value);
        });
        
        // Déclencher l'affichage initial
        updateFraisTable("");
    }
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Initialisation du module frais-livraison...');
    
    // Charger les wilayas depuis l'API d'abord
    await loadWilayasFromAPI();
    
    // Charger les frais depuis l'API
    await fraisStore.loadFrais();
    
    // Puis initialiser les selects
    initializeWilayaSelects();

    // Gestion du tableau de frais
    const fraisTable = document.getElementById('fraisMatrix');
    if (fraisTable) {
        fraisTable.addEventListener('click', async function(e) {
            // Gestion du bouton de sélection de wilaya
            const selectButton = e.target.closest('.select-wilaya');
            if (selectButton) {
                const wilayaCode = selectButton.dataset.code;
                const wilayaSelect = document.getElementById('wilayaDepart');
                if (wilayaSelect) {
                    wilayaSelect.value = wilayaCode;
                    wilayaSelect.dispatchEvent(new Event('change'));
                }
                return;
            }

            // 🔥 SÉCURITÉ: checkPassword() supprimé - Auth via JWT uniquement

            // Gestion du bouton d'enregistrement des tarifs
            const saveButton = e.target.closest('.save-tarifs');
            if (saveButton) {
                const row = saveButton.closest('tr');
                const wilayaArrivee = saveButton.dataset.wilaya;
                const wilayaDepart = document.getElementById('wilayaDepart').value;
                
                if (!wilayaDepart) {
                    alert('Veuillez sélectionner une wilaya de départ');
                    return;
                }
                
                // Récupérer les valeurs des inputs (classe .form-input, pas .tarif-input)
                const inputs = row.querySelectorAll('.form-input');
                const tarifs = {};
                inputs.forEach(input => {
                    const type = input.dataset.type;
                    const value = parseInt(input.value) || 0;
                    tarifs[type] = value;
                });

                console.log('Enregistrement des frais:', { wilayaDepart, wilayaArrivee, ...tarifs });

                // Enregistrer les tarifs
                try {
                    await fraisStore.addFrais({
                        wilayaDepart,
                        wilayaArrivee,
                        ...tarifs
                    });
                    
                    console.log('✅ Frais enregistrés via API');
                    
                    alert('✅ Tarifs enregistrés avec succès');
                    row.classList.add('has-data');
                    
                    // Recharger le tableau pour afficher les données à jour
                    updateFraisTable(wilayaDepart);
                } catch (error) {
                    console.error('❌ Erreur:', error);
                    alert('❌ ' + error.message);
                }
            }
        });
    }

    // Gestion de la recherche
    const searchInput = document.getElementById('searchFrais');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchValue = this.value.toLowerCase();
            const rows = document.querySelectorAll('#fraisTableBody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchValue) ? '' : 'none';
            });
        });
    }
});