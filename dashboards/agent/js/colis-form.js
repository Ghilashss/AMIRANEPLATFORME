// GESTION DU FORMULAIRE DE COLIS - AGENT
// import { DataStore } from '../data-store.js'; // Commenté temporairement pour test

// Cache des frais de livraison
let FRAIS_LIVRAISON_CACHE = [];

// Fonction pour charger les frais de livraison depuis l'API
async function loadFraisLivraison() {
    console.log('🔍 Chargement des frais de livraison depuis l\'API...');
    
    try {
        const token = sessionStorage.getItem('auth_token') || localStorage.getItem('agent_token');
        if (!token) {
            console.warn('⚠️ Pas de token, impossible de charger les frais');
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
        console.log('✅ Frais de livraison chargés depuis l\'API:', result.data?.length || 0);
        
        FRAIS_LIVRAISON_CACHE = result.data || [];
        
        // Garder aussi en localStorage pour cache
        localStorage.setItem('fraisLivraisonCache', JSON.stringify(FRAIS_LIVRAISON_CACHE));
        
        return FRAIS_LIVRAISON_CACHE;
        
    } catch (error) {
        console.error('❌ Erreur chargement frais API:', error);
        
        // Fallback: cache localStorage
        const cached = localStorage.getItem('fraisLivraisonCache');
        if (cached) {
            console.log('💡 Utilisation du cache frais...');
            FRAIS_LIVRAISON_CACHE = JSON.parse(cached);
        }
        
        return FRAIS_LIVRAISON_CACHE;
    }
}

// Fonction pour charger les wilayas depuis l'API
async function loadWilayas() {
    console.log('🔍 Chargement des wilayas depuis l\'API...');
    const wilayaSelect = document.getElementById('wilayaDest');
    
    if (!wilayaSelect) {
        console.error('❌ Element wilayaDest NON TROUVÉ !');
        return;
    }
    
    console.log('✅ Element wilayaDest trouvé');
    
    try {
        const token = sessionStorage.getItem('auth_token') || localStorage.getItem('agent_token');
        const response = await fetch(`${window.API_CONFIG.API_URL}/wilayas`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ Réponse API reçue:', result);
        
        // L'API retourne { success: true, data: [...] }
        const wilayas = result.data || result.wilayas || [];
        console.log('✅ Wilayas trouvées:', wilayas.length);
        
        if (wilayas.length === 0) {
            console.error('❌ Aucune wilaya trouvée dans la réponse API');
            wilayaSelect.innerHTML = '<option value="">Aucune wilaya disponible</option>';
            return;
        }
        
        // Sauvegarder dans localStorage pour utilisation ultérieure
        localStorage.setItem('wilayas', JSON.stringify(wilayas));
        
        // Remplir le select
        wilayaSelect.innerHTML = '<option value="">Sélectionner une wilaya</option>';
        
        wilayas.forEach(wilaya => {
            const option = document.createElement('option');
            option.value = wilaya.code;
            option.textContent = `${wilaya.code} - ${wilaya.nom}`;
            wilayaSelect.appendChild(option);
        });
        
        console.log('✅ ' + wilayas.length + ' wilayas ajoutées au select');
        console.log('📊 Nombre d\'options dans le select:', wilayaSelect.options.length);
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement des wilayas:', error);
        wilayaSelect.innerHTML = '<option value="">Erreur de chargement</option>';
        
        // Fallback: essayer de charger depuis localStorage
        const wilayasData = localStorage.getItem('wilayas');
        if (wilayasData) {
            console.log('💡 Utilisation des wilayas en cache...');
            const wilayas = JSON.parse(wilayasData);
            wilayaSelect.innerHTML = '<option value="">Sélectionner une wilaya</option>';
            wilayas.forEach(wilaya => {
                const option = document.createElement('option');
                option.value = wilaya.code;
                option.textContent = `${wilaya.code} - ${wilaya.nom}`;
                wilayaSelect.appendChild(option);
            });
        }
    }
}

// Fonction pour charger les agences depuis l'API
async function loadAgences() {
    console.log('🏢 Chargement des agences depuis l\'API...');
    const bureauSourceSelect = document.getElementById('bureauSource');
    const bureauDestSelect = document.getElementById('bureauDest');
    
    if (!bureauSourceSelect) {
        console.warn('⚠️ bureauSourceSelect non trouvé');
        return;
    }
    
    try {
        const token = sessionStorage.getItem('auth_token') || localStorage.getItem('agent_token');
        const response = await fetch(`${window.API_CONFIG.API_URL}/agences`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ Réponse API agences reçue:', result);
        
        const agences = result.data || result.agences || [];
        console.log('✅ Agences trouvées:', agences.length);
        
        if (agences.length === 0) {
            console.warn('⚠️ Aucune agence trouvée');
            bureauSourceSelect.innerHTML = '<option value="">Aucune agence disponible</option>';
            if (bureauDestSelect) {
                bureauDestSelect.innerHTML = '<option value="">Aucune agence disponible</option>';
            }
            return;
        }
        
        // Sauvegarder dans localStorage pour utilisation ultérieure
        localStorage.setItem('agences', JSON.stringify(agences));
        
        // Remplir Bureau Source
        bureauSourceSelect.innerHTML = '<option value="">Sélectionner le bureau source</option>';
        agences.forEach(agence => {
            const option = document.createElement('option');
            option.value = agence.code || agence._id;
            option.textContent = `${agence.code || agence._id} - ${agence.nom}`;
            bureauSourceSelect.appendChild(option);
        });
        console.log('✅ Agences chargées dans bureauSource');
        
        // Remplir Bureau Destination (toutes les agences au début)
        if (bureauDestSelect) {
            bureauDestSelect.innerHTML = '<option value="">Sélectionner le bureau de destination</option>';
            agences.forEach(agence => {
                const option = document.createElement('option');
                option.value = agence.code || agence._id;
                option.textContent = `${agence.code || agence._id} - ${agence.nom} (${agence.wilaya})`;
                bureauDestSelect.appendChild(option);
            });
            console.log('✅ Agences chargées dans bureauDest');
        }
        
        // Pré-remplir automatiquement avec l'agence de l'agent connecté
        // On attend un court délai pour s'assurer que le DOM est mis à jour
        setTimeout(() => {
            autoFillAgentAgence();
        }, 50);
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement des agences:', error);
        
        // Fallback: essayer de charger depuis localStorage
        const agencesData = localStorage.getItem('agences');
        if (agencesData) {
            console.log('💡 Utilisation des agences en cache...');
            const agences = JSON.parse(agencesData);
            
            bureauSourceSelect.innerHTML = '<option value="">Sélectionner le bureau source</option>';
            agences.forEach(agence => {
                const option = document.createElement('option');
                option.value = agence.code || agence._id;
                option.textContent = `${agence.code || agence._id} - ${agence.nom}`;
                bureauSourceSelect.appendChild(option);
            });
            
            if (bureauDestSelect) {
                bureauDestSelect.innerHTML = '<option value="">Sélectionner le bureau de destination</option>';
                agences.forEach(agence => {
                    const option = document.createElement('option');
                    option.value = agence.code || agence._id;
                    option.textContent = `${agence.code || agence._id} - ${agence.nom} (${agence.wilaya})`;
                    bureauDestSelect.appendChild(option);
                });
            }
            
            // Pré-remplir même avec le cache
            await autoFillAgentAgence();
        } else {
            bureauSourceSelect.innerHTML = '<option value="">Erreur de chargement</option>';
            if (bureauDestSelect) {
                bureauDestSelect.innerHTML = '<option value="">Erreur de chargement</option>';
            }
        }
    }
}

// Fonction pour pré-remplir automatiquement la wilaya et le bureau source de l'agent
async function autoFillAgentAgence() {
    console.log('🔍 Pré-remplissage automatique de l\'agence de l\'agent...');
    
    try {
        // ✅ Utiliser window.currentUser défini par agent-dashboard.html
        const user = window.currentUser || JSON.parse(localStorage.getItem('user') || '{}');
        console.log('👤 Utilisateur connecté:', user);
        
        if (!user || !user.agence) {
            console.warn('⚠️ Pas d\'agence associée à l\'utilisateur');
            return;
        }
        
        const agenceId = user.agence;
        console.log('🏢 ID Agence de l\'agent:', agenceId);
        
        // D'abord essayer de trouver l'agence dans le cache localStorage
        const agencesData = localStorage.getItem('agences');
        let agence = null;
        
        if (agencesData) {
            const agences = JSON.parse(agencesData);
            agence = agences.find(a => a._id === agenceId || a.code === agenceId);
            console.log('🔍 Recherche dans cache:', agence ? 'Trouvée' : 'Non trouvée');
        }
        
        // Si pas trouvée dans le cache, charger depuis l'API
        if (!agence) {
            console.log('📡 Chargement depuis l\'API...');
            const token = sessionStorage.getItem('auth_token') || localStorage.getItem('agent_token');
            const response = await fetch(`${window.API_CONFIG.API_URL}/agences/${agenceId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('✅ Détails agence reçus:', result);
            
            agence = result.data || result.agence;
        }
        
        if (!agence) {
            console.warn('⚠️ Aucun détail d\'agence trouvé');
            return;
        }
        
        console.log('🏢 Agence de l\'agent:', agence);
        console.log('   Code:', agence.code);
        console.log('   Nom:', agence.nom);
        console.log('   Wilaya:', agence.wilaya);
        
        // Pré-remplir le bureau source
        const bureauSourceSelect = document.getElementById('bureauSource');
        if (bureauSourceSelect) {
            const codeAgence = agence.code || agence._id;
            console.log('🔍 Tentative de sélection du code:', codeAgence);
            
            // Vérifier que l'option existe avant de la sélectionner
            const optionExists = Array.from(bureauSourceSelect.options).some(opt => opt.value === codeAgence);
            
            if (optionExists) {
                bureauSourceSelect.value = codeAgence;
                bureauSourceSelect.disabled = true;
                
                // Ajouter un style visuel
                bureauSourceSelect.style.backgroundColor = '#e8f5e9';
                bureauSourceSelect.style.borderColor = '#28a745';
                
                console.log('✅ Bureau source pré-rempli et verrouillé:', codeAgence);
            } else {
                console.warn('⚠️ Option non trouvée dans le select pour:', codeAgence);
            }
        } else {
            console.warn('⚠️ Element bureauSource non trouvé');
        }
        
        // Afficher un message visuel pour l'utilisateur
        const bureauSourceLabel = document.querySelector('label[for="bureauSource"]');
        if (bureauSourceLabel) {
            bureauSourceLabel.innerHTML = `<i class="fas fa-building"></i> Bureau source <span style="color: #28a745; font-weight: bold; font-size: 0.9em;">(Votre bureau: ${agence.nom})</span>`;
        }
        
        console.log('✅ Informations de l\'agent pré-remplies automatiquement');
        
    } catch (error) {
        console.error('❌ Erreur lors du pré-remplissage:', error);
    }
}

// Fonction pour filtrer les bureaux par wilaya
function filterBureauxByWilaya(wilayaCode) {
    console.log('🔍 Filtrage des bureaux pour wilaya code:', wilayaCode);
    
    const bureauDestSelect = document.getElementById('bureauDest');
    if (!bureauDestSelect || !wilayaCode) {
        console.warn('⚠️ bureauDestSelect ou wilayaCode manquant');
        return;
    }
    
    console.log('✅ Code wilaya à filtrer:', wilayaCode);
    
    // Filtrer les agences PAR CODE (pas par nom !)
    const agencesData = localStorage.getItem('agences');
    if (!agencesData) {
        console.error('❌ Aucune agence dans localStorage');
        return;
    }
    
    const agences = JSON.parse(agencesData);
    console.log('📋 Toutes les agences:', agences);
    console.log('📋 Agence[0].wilaya:', agences[0]?.wilaya);
    
    // FILTRAGE PAR CODE DE WILAYA
    const agencesFiltrees = agences.filter(a => {
        console.log(`🔍 Comparaison: "${a.wilaya}" === "${wilayaCode}" ?`, a.wilaya === wilayaCode);
        return a.wilaya === wilayaCode;
    });
    
    console.log('✅ Agences filtrées:', agencesFiltrees.length);
    
    // Remplir le select
    bureauDestSelect.innerHTML = '<option value="">Sélectionner le bureau de destination</option>';
    agencesFiltrees.forEach(agence => {
        const option = document.createElement('option');
        option.value = agence.code;
        option.textContent = agence.code + ' - ' + agence.nom;
        bureauDestSelect.appendChild(option);
        console.log('➕ Bureau ajouté:', agence.code, '-', agence.nom);
    });
    
    if (agencesFiltrees.length === 0) {
        console.warn('⚠️ AUCUNE AGENCE TROUVÉE pour le code wilaya:', wilayaCode);
        console.log('💡 Vérifiez que l\'agence a bien wilaya =', wilayaCode);
    }
}

// Fonction pour calculer les frais de livraison
function calculateFrais() {
    console.log('💰 Calcul des frais...');
    
    const prixColisInput = document.getElementById('prixColis');
    const poidsColisInput = document.getElementById('poidsColis');
    const wilayaDestSelect = document.getElementById('wilayaDest');
    const typelivraisonSelect = document.getElementById('typelivraison');
    
    const resumePrixColis = document.getElementById('resumePrixColis');
    const fraisLivraisonEl = document.getElementById('fraisLivraison');
    const totalAPayerEl = document.getElementById('totalAPayer');
    
    if (!prixColisInput || !resumePrixColis) {
        console.warn('⚠️ Éléments de résumé non trouvés');
        return;
    }
    
    const prixColis = parseFloat(prixColisInput.value) || 0;
    const poidsColis = parseFloat(poidsColisInput?.value) || 1;
    const wilayaCode = wilayaDestSelect?.value || '';
    const typeLivraison = typelivraisonSelect?.value || 'domicile';
    
    console.log('📦 Prix colis:', prixColis);
    console.log('⚖️ Poids colis:', poidsColis);
    console.log('📍 Wilaya:', wilayaCode);
    console.log('🚚 Type livraison:', typeLivraison);
    
    let frais = 0;
    
    // Récupérer les frais depuis le cache API
    if (wilayaCode && FRAIS_LIVRAISON_CACHE.length > 0) {
        // Trouver les frais pour cette wilaya (avec wilayaDest ou wilayaArrivee pour compatibilité)
        const fraisTrouve = FRAIS_LIVRAISON_CACHE.find(f => 
            f.wilayaDest === wilayaCode || f.wilayaArrivee === wilayaCode
        );
        
        if (fraisTrouve) {
            if (typeLivraison === 'domicile') {
                frais = fraisTrouve.baseDomicile || fraisTrouve.fraisDomicile || 0;
                // Ajouter tarif par kg SEULEMENT si poids > 5 kg
                if (poidsColis > 5) {
                    const kgSupplementaire = poidsColis - 5;
                    const tarifParKg = fraisTrouve.parKgDomicile || 0;
                    frais += kgSupplementaire * tarifParKg;
                    console.log(`📦 Poids > 5kg: Base ${fraisTrouve.baseDomicile || fraisTrouve.fraisDomicile} DA + ${kgSupplementaire} kg × ${tarifParKg} DA/kg = ${frais} DA`);
                } else {
                    console.log(`📦 Poids ≤ 5kg: Tarif de base uniquement = ${frais} DA`);
                }
            } else {
                frais = fraisTrouve.baseBureau || fraisTrouve.fraisStopDesk || 0;
                // Ajouter tarif par kg SEULEMENT si poids > 5 kg
                if (poidsColis > 5) {
                    const kgSupplementaire = poidsColis - 5;
                    const tarifParKg = fraisTrouve.parKgBureau || 0;
                    frais += kgSupplementaire * tarifParKg;
                    console.log(`📦 Poids > 5kg: Base ${fraisTrouve.baseBureau || fraisTrouve.fraisStopDesk} DA + ${kgSupplementaire} kg × ${tarifParKg} DA/kg = ${frais} DA`);
                } else {
                    console.log(`📦 Poids ≤ 5kg: Tarif de base uniquement = ${frais} DA`);
                }
            }
            console.log('✅ Frais calculés depuis API:', frais, 'DA');
            
            // Mettre à jour le résumé normalement
            resumePrixColis.textContent = prixColis + ' DA';
            if (fraisLivraisonEl) {
                fraisLivraisonEl.textContent = frais + ' DA';
                fraisLivraisonEl.style.color = '';
                fraisLivraisonEl.style.fontSize = '';
            }
            if (totalAPayerEl) totalAPayerEl.textContent = (prixColis + frais) + ' DA';
            
        } else {
            // Frais non trouvés - Afficher message d'avertissement
            console.warn('⚠️ Frais non configurés pour cette wilaya');
            
            resumePrixColis.textContent = prixColis + ' DA';
            if (fraisLivraisonEl) {
                fraisLivraisonEl.innerHTML = '<span style="color: #ff6b6b; font-size: 0.9em;">⚠️ Frais non configurés</span>';
                fraisLivraisonEl.style.color = '#ff6b6b';
            }
            if (totalAPayerEl) {
                totalAPayerEl.innerHTML = '<span style="color: #ff6b6b; font-size: 0.9em;">-</span>';
            }
            
            console.log('⚠️ Les frais de livraison ne sont pas encore ajoutés pour cette wilaya');
            return; // Arrêter le calcul ici
        }
    } else if (!wilayaCode) {
        // Pas de wilaya sélectionnée
        console.log('⚠️ Veuillez sélectionner une wilaya de destination');
        resumePrixColis.textContent = prixColis + ' DA';
        if (fraisLivraisonEl) {
            fraisLivraisonEl.textContent = '-';
            fraisLivraisonEl.style.color = '';
        }
        if (totalAPayerEl) totalAPayerEl.textContent = '-';
    } else {
        // Cache pas encore chargé
        console.warn('⚠️ Frais de livraison en cours de chargement...');
        
        resumePrixColis.textContent = prixColis + ' DA';
        if (fraisLivraisonEl) {
            fraisLivraisonEl.innerHTML = '<span style="color: #ff9f1c;">⏳ Chargement...</span>';
        }
        if (totalAPayerEl) {
            totalAPayerEl.innerHTML = '<span style="color: #ff9f1c;">-</span>';
        }
    }
    
    console.log('✅ Résumé mis à jour');
}

// Fonction pour gérer l'affichage conditionnel selon le type de livraison
function handleTypeLivraisonChange() {
    const typelivraisonSelect = document.getElementById('typelivraison');
    const bureauDestGroup = document.getElementById('bureauDestGroup');
    const adresseLivraisonGroup = document.getElementById('adresseLivraisonGroup');
    const bureauDestSelect = document.getElementById('bureauDest');
    const adresseLivraisonInput = document.getElementById('adresseLivraison');
    
    if (!typelivraisonSelect || !bureauDestGroup || !adresseLivraisonGroup) {
        console.warn('⚠️ Éléments du formulaire non trouvés');
        return;
    }
    
    const typeLivraison = typelivraisonSelect.value;
    console.log('🚚 Type de livraison changé:', typeLivraison);
    
    if (typeLivraison === 'bureau') {
        // Afficher bureau destinataire, masquer adresse
        bureauDestGroup.style.display = '';
        adresseLivraisonGroup.style.display = 'none';
        
        // Bureau devient requis, adresse non requis
        if (bureauDestSelect) {
            bureauDestSelect.required = true;
            bureauDestSelect.value = ''; // Réinitialiser
        }
        if (adresseLivraisonInput) {
            adresseLivraisonInput.required = false;
            adresseLivraisonInput.value = ''; // Réinitialiser
        }
        
        console.log('✅ Mode Bureau: Bureau destinataire affiché, Adresse masquée');
        
    } else if (typeLivraison === 'domicile') {
        // Masquer bureau destinataire, afficher adresse
        bureauDestGroup.style.display = 'none';
        adresseLivraisonGroup.style.display = '';
        
        // Adresse devient requis, bureau non requis
        if (bureauDestSelect) {
            bureauDestSelect.required = false;
            bureauDestSelect.value = ''; // Réinitialiser
        }
        if (adresseLivraisonInput) {
            adresseLivraisonInput.required = true;
            adresseLivraisonInput.value = ''; // Réinitialiser
        }
        
        console.log('✅ Mode Domicile: Adresse affichée, Bureau destinataire masqué');
        
    } else {
        // Aucun type sélectionné - afficher bureau par défaut, masquer adresse
        bureauDestGroup.style.display = '';
        adresseLivraisonGroup.style.display = 'none';
        
        if (bureauDestSelect) bureauDestSelect.required = false;
        if (adresseLivraisonInput) adresseLivraisonInput.required = false;
        
        console.log('⚠️ Aucun type sélectionné');
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Initialisation colis-form.js');
    
    // Charger au démarrage
    await loadFraisLivraison(); // Charger les frais de livraison AVANT tout
    loadWilayas();
    loadAgences();
    
    // Event listener pour le changement de wilaya
    const wilayaSelect = document.getElementById('wilayaDest');
    if (wilayaSelect) {
        wilayaSelect.addEventListener('change', function() {
            const wilayaCode = this.value;
            console.log('Wilaya sélectionnée:', wilayaCode);
            if (wilayaCode) {
                filterBureauxByWilaya(wilayaCode);
            }
            calculateFrais(); // Calculer les frais
        });
    }
    
    // Event listeners pour le poids et le prix
    const prixColisInput = document.getElementById('prixColis');
    if (prixColisInput) {
        prixColisInput.addEventListener('input', calculateFrais);
        console.log('✅ Event listener ajouté sur prixColis');
    }
    
    const poidsColisInput = document.getElementById('poidsColis');
    if (poidsColisInput) {
        poidsColisInput.addEventListener('input', calculateFrais);
        console.log('✅ Event listener ajouté sur poidsColis');
    }
    
    const typelivraisonSelect = document.getElementById('typelivraison');
    if (typelivraisonSelect) {
        typelivraisonSelect.addEventListener('change', function() {
            handleTypeLivraisonChange();
            calculateFrais();
        });
        console.log('✅ Event listener ajouté sur typelivraison');
    }
    
    // Bouton "Nouveau Colis" - Recharger les données à l'ouverture du modal
    const addColisBtn = document.getElementById('addColisBtn');
    if (addColisBtn) {
        addColisBtn.addEventListener('click', async function() {
            console.log('Ouverture du modal Colis - Rechargement des données');
            setTimeout(async () => {
                await loadFraisLivraison(); // Recharger les frais
                loadWilayas();
                loadAgences();
                calculateFrais(); // Calculer les frais initiaux
            }, 100);
        });
    }
});
