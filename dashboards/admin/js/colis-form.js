import { DataStore } from './data-store.js';

// Fonction pour ouvrir le modal
function openColisModal() {
    const modal = document.getElementById('colisModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

// Fonction pour fermer le modal
function closeColisModal() {
    const modal = document.getElementById('colisModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Initialisation des gestionnaires d'événements pour le formulaire uniquement
// Export des fonctions pour être utilisées par le gestionnaire de modal
export async function handleColisSubmit(formData) {
    if (DataStore && DataStore.addColis) {
        await DataStore.addColis(formData);
    }
}

// Variable globale pour stocker tous les frais de livraison
let allFraisLivraison = [];

// Fonction pour calculer les frais de livraison selon le poids
function calculateFraisLivraison(frais, typeLivraison, poids) {
    if (!frais) return 0;
    
    const poidsKg = parseFloat(poids) || 0;
    const SEUIL_POIDS = 5; // 5 kg
    
    let tarifBase = 0;
    let tarifParKg = 0;
    
    if (typeLivraison === 'domicile') {
        tarifBase = frais.baseDomicile || frais.fraisDomicile || 0;
        tarifParKg = frais.parKgDomicile || 0;
    } else {
        tarifBase = frais.baseBureau || frais.fraisStopDesk || 0;
        tarifParKg = frais.parKgBureau || 0;
    }
    
    console.log('📊 Calcul frais:', {
        poids: poidsKg,
        tarifBase,
        tarifParKg,
        typeLivraison,
        seuil: SEUIL_POIDS
    });
    
    // Si poids <= 5kg, retourner le tarif de base
    if (poidsKg <= SEUIL_POIDS) {
        console.log(`✅ Poids (${poidsKg}kg) <= ${SEUIL_POIDS}kg → Tarif base: ${tarifBase} DA`);
        return tarifBase;
    }
    
    // Si poids > 5kg, calculer: tarif base + (poids - 5) * tarif par kg
    const poidsSupplementaire = poidsKg - SEUIL_POIDS;
    const fraisSupplementaires = poidsSupplementaire * tarifParKg;
    const tarifTotal = tarifBase + fraisSupplementaires;
    
    console.log(`✅ Poids (${poidsKg}kg) > ${SEUIL_POIDS}kg → Calcul:`);
    console.log(`   Base: ${tarifBase} DA`);
    console.log(`   Poids extra: ${poidsSupplementaire}kg × ${tarifParKg} DA/kg = ${fraisSupplementaires} DA`);
    console.log(`   TOTAL: ${tarifTotal} DA`);
    
    return tarifTotal;
}

// Fonction pour charger les wilayas avec frais de livraison
async function loadWilayasWithFrais() {
    try {
        const token = sessionStorage.getItem('auth_token') || localStorage.getItem('admin_token');
        if (!token) {
            console.warn('⚠️ Token admin non trouvé');
            return;
        }

        console.log('📋 Chargement des wilayas avec frais de livraison...');
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
        console.log('✅ Réponse API frais:', result);

        allFraisLivraison = result.data || result.fraisLivraison || [];
        
        // Extraire TOUTES les wilayas uniques (sources ET destinations)
        const wilayasSet = new Set();
        allFraisLivraison.forEach(frais => {
            if (frais.wilayaSource) wilayasSet.add(frais.wilayaSource);
            if (frais.wilayaDest) wilayasSet.add(frais.wilayaDest);
        });
        
        const wilayas = Array.from(wilayasSet).sort();
        console.log('📍 Wilayas trouvées:', wilayas.length, wilayas);

        // Peupler le select wilayaDest
        const wilayaDestSelect = document.getElementById('wilayaDest');
        if (wilayaDestSelect) {
            wilayaDestSelect.innerHTML = '<option value="">Sélectionner la wilaya...</option>';
            wilayas.forEach(wilaya => {
                const option = document.createElement('option');
                option.value = wilaya;
                option.textContent = wilaya;
                wilayaDestSelect.appendChild(option);
            });
            console.log('✅ Select wilayaDest rempli avec', wilayas.length, 'wilayas');
        }

    } catch (error) {
        console.error('❌ Erreur chargement wilayas avec frais:', error);
    }
}

// Fonction pour vérifier si les tarifs existent pour une combinaison source-dest
function checkTarifsConfiguration(wilayaSource, wilayaDest, typeLivraison, poids = 0) {
    if (!wilayaSource || !wilayaDest) {
        return { exists: false, message: 'Veuillez sélectionner les wilayas source et destination' };
    }

    const frais = allFraisLivraison.find(f => 
        f.wilayaSource === wilayaSource && f.wilayaDest === wilayaDest
    );

    if (!frais) {
        return { 
            exists: false, 
            message: `⚠️ TARIFS NON CONFIGURÉS pour ${wilayaSource} → ${wilayaDest}`,
            details: 'Veuillez configurer les frais de livraison pour cette combinaison dans la section Frais de Livraison.'
        };
    }

    // Calculer le tarif selon le poids
    const tarifCalcule = calculateFraisLivraison(frais, typeLivraison, poids);
    
    if (!tarifCalcule || tarifCalcule === 0) {
        return { 
            exists: false, 
            message: `⚠️ TARIF ${typeLivraison.toUpperCase()} NON CONFIGURÉ pour ${wilayaSource} → ${wilayaDest}`,
            details: `Le tarif ${typeLivraison} est à 0 DA. Veuillez le configurer.`
        };
    }

    const poidsKg = parseFloat(poids) || 0;
    let detailsMessage = `Tarif calculé: ${tarifCalcule} DA`;
    
    if (poidsKg > 5) {
        const tarifBase = typeLivraison === 'domicile' ? 
            (frais.baseDomicile || frais.fraisDomicile) : 
            (frais.baseBureau || frais.fraisStopDesk);
        const tarifParKg = typeLivraison === 'domicile' ? 
            frais.parKgDomicile : frais.parKgBureau;
        
        detailsMessage = `Base (≤5kg): ${tarifBase} DA + ${poidsKg - 5}kg × ${tarifParKg} DA/kg = ${tarifCalcule} DA`;
    }

    return { 
        exists: true, 
        tarif: tarifCalcule,
        frais: frais,
        poids: poidsKg,
        message: `✅ ${detailsMessage}`
    };
}

// Fonction pour charger les agences dans le select
async function loadAgencesIntoSelect() {
    try {
        const token = sessionStorage.getItem('auth_token') || localStorage.getItem('admin_token');
        if (!token) {
            console.warn('⚠️ Token admin non trouvé');
            return;
        }

        console.log('📋 Chargement des agences pour le formulaire...');
        const response = await fetch(`${window.API_CONFIG.API_URL}/agences`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const result = await response.json();
        const agences = result.data || [];
        console.log(`✅ ${agences.length} agences chargées pour le formulaire`);
        console.log('🔍 Première agence:', agences[0]);

        // Remplir le select bureauSource
        const bureauSourceSelect = document.getElementById('bureauSource');
        if (bureauSourceSelect) {
            bureauSourceSelect.innerHTML = '<option value="">Sélectionner le bureau source</option>';
            agences.forEach(agence => {
                const option = document.createElement('option');
                option.value = agence._id; // Utiliser l'ID MongoDB
                option.textContent = `${agence.nom} (${agence.wilaya || agence.wilayaText || 'N/A'})`;
                option.dataset.wilaya = agence.wilaya || '';
                option.dataset.agenceId = agence._id;
                console.log(`   📍 Agence ${agence.nom}: wilaya='${agence.wilaya}'`);
                bureauSourceSelect.appendChild(option);
            });
            console.log('✅ Select bureauSource rempli avec', agences.length, 'agences');
        }

        // Remplir aussi le select bureauDest
        const bureauDestSelect = document.getElementById('bureauDest');
        if (bureauDestSelect) {
            bureauDestSelect.innerHTML = '<option value="">Sélectionner le bureau destination</option>';
            agences.forEach(agence => {
                const option = document.createElement('option');
                option.value = agence._id;
                option.textContent = `${agence.nom} (${agence.wilaya || agence.wilayaText || 'N/A'})`;
                option.dataset.wilaya = agence.wilaya || '';
                option.dataset.agenceId = agence._id;
                bureauDestSelect.appendChild(option);
            });
            console.log('✅ Select bureauDest rempli avec', agences.length, 'agences');
        }

    } catch (error) {
        console.error('❌ Erreur chargement agences:', error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Charger les agences et wilayas au démarrage
    loadAgencesIntoSelect();
    loadWilayasWithFrais();

    // Configuration du bouton pour ouvrir le modal
    const addButton = document.getElementById('addColisBtn');
    if (addButton) {
        addButton.addEventListener('click', function(e) {
            e.preventDefault();
            openColisModal();
            // Recharger les agences et wilayas quand on ouvre le modal
            loadAgencesIntoSelect();
            loadWilayasWithFrais();
        });
    }

    // Configuration du bouton pour fermer le modal
    const closeButton = document.querySelector('#colisModal .close-button');
    if (closeButton) {
        closeButton.addEventListener('click', closeColisModal);
    }

    // Fermer le modal en cliquant en dehors
    const modal = document.getElementById('colisModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeColisModal();
            }
        });
    }

    // Fonction pour extraire la wilaya depuis le select bureau
    function getWilayaFromBureau(bureauSelectId) {
        try {
            const select = document.getElementById(bureauSelectId);
            if (!select || !select.value) return null;
            
            const selectedOption = select.options[select.selectedIndex];
            const wilaya = selectedOption.dataset.wilaya;
            
            console.log(`📍 Wilaya extraite du ${bureauSelectId}:`, wilaya);
            return wilaya || null;
        } catch (error) {
            console.error('Erreur lors de l\'extraction de la wilaya:', error);
            return null;
        }
    }

    // Fonction pour afficher le message de vérification des tarifs
    function displayTarifMessage(message, isError = false) {
        // Chercher ou créer la div de message
        let messageDiv = document.getElementById('tarifMessage');
        if (!messageDiv) {
            messageDiv = document.createElement('div');
            messageDiv.id = 'tarifMessage';
            messageDiv.style.cssText = `
                padding: 10px 15px;
                margin: 10px 0;
                border-radius: 4px;
                font-size: 14px;
                font-weight: bold;
                transition: all 0.3s ease;
            `;
            
            // Insérer après le select wilayaDest
            const wilayaDestSelect = document.getElementById('wilayaDest');
            if (wilayaDestSelect && wilayaDestSelect.parentNode) {
                wilayaDestSelect.parentNode.insertBefore(messageDiv, wilayaDestSelect.nextSibling);
            }
        }

        if (message) {
            messageDiv.textContent = message;
            messageDiv.style.display = 'block';
            
            if (isError) {
                messageDiv.style.backgroundColor = '#ffebee';
                messageDiv.style.color = '#c62828';
                messageDiv.style.border = '2px solid #ef5350';
            } else {
                messageDiv.style.backgroundColor = '#e8f5e9';
                messageDiv.style.color = '#2e7d32';
                messageDiv.style.border = '2px solid #66bb6a';
            }
        } else {
            messageDiv.style.display = 'none';
        }
    }

    // Fonction pour vérifier et afficher les tarifs
    function verifyAndDisplayTarifs() {
        const wilayaSource = getWilayaFromBureau('bureauSource');
        const wilayaDest = document.getElementById('wilayaDest')?.value;
        const typeLivraison = document.getElementById('typelivraison')?.value || 'bureau';
        const poids = document.getElementById('poidsColis')?.value || 0;
        const prixColis = parseFloat(document.getElementById('prixColis')?.value || 0);

        console.log('🔍 DIAGNOSTIC:', {
            wilayaSource,
            wilayaDest,
            typeLivraison,
            poids,
            fraisDisponibles: allFraisLivraison.length,
            fraisTrouve: allFraisLivraison.find(f => 
                f.wilayaSource === wilayaSource && f.wilayaDest === wilayaDest
            )
        });

        if (!wilayaSource || !wilayaDest) {
            displayTarifMessage('');
            updateResumeFrais(prixColis, 0, prixColis, { exists: false });
            return;
        }

        const result = checkTarifsConfiguration(wilayaSource, wilayaDest, typeLivraison, poids);
        
        if (result.exists) {
            displayTarifMessage(result.message, false);
            // Mettre à jour le résumé avec les frais configurés
            updateResumeFrais(prixColis, result.tarif, prixColis + result.tarif, result);
        } else {
            displayTarifMessage(result.message, true);
            // Passer l'objet result même si exists=false pour afficher le message d'erreur
            updateResumeFrais(prixColis, 0, prixColis, result);
        }
        
        console.log('🔍 Vérification tarifs:', result);
    }

    // Fonction pour mettre à jour le résumé des frais
    function updateResumeFrais(prixColis, fraisLivraison, total, tarifsCheck) {
        const resumePrixColisEl = document.getElementById('resumePrixColis');
        const fraisLivraisonEl = document.getElementById('fraisLivraison');
        const totalAPayerEl = document.getElementById('totalAPayer');

        // Mettre à jour le prix du colis
        if (resumePrixColisEl) {
            resumePrixColisEl.textContent = `${prixColis.toFixed(2)} DA`;
        }

        // Mettre à jour les frais de livraison
        if (fraisLivraisonEl) {
            if (!tarifsCheck || !tarifsCheck.exists) {
                // FRAIS NON CONFIGURÉS
                fraisLivraisonEl.innerHTML = `
                    <strong style="color: #d32f2f; font-size: 13px;">⚠️ FRAIS NON CONFIGURÉS</strong>
                    <br>
                    <small style="color: #666; font-size: 10px;">
                        Veuillez configurer les tarifs pour cette combinaison
                    </small>
                `;
                fraisLivraisonEl.style.backgroundColor = '#ffebee';
                fraisLivraisonEl.style.padding = '8px';
                fraisLivraisonEl.style.borderRadius = '4px';
                fraisLivraisonEl.style.border = '2px solid #ef5350';
            } else if (tarifsCheck.poids > 5) {
                // CALCUL AVEC POIDS > 5KG
                const typeLivraison = document.getElementById('typelivraison')?.value || 'bureau';
                const tarifBase = typeLivraison === 'domicile' ? 
                    (tarifsCheck.frais.baseDomicile || tarifsCheck.frais.fraisDomicile) : 
                    (tarifsCheck.frais.baseBureau || tarifsCheck.frais.fraisStopDesk);
                const tarifParKg = typeLivraison === 'domicile' ? 
                    tarifsCheck.frais.parKgDomicile : 
                    tarifsCheck.frais.parKgBureau;
                const poidsExtra = tarifsCheck.poids - 5;
                const fraisExtra = poidsExtra * tarifParKg;
                
                fraisLivraisonEl.innerHTML = `
                    <strong style="color: #2e7d32; font-size: 16px;">${fraisLivraison.toFixed(2)} DA</strong>
                    <br>
                    <small style="color: #666; font-size: 11px; line-height: 1.4;">
                        📦 Base (≤5kg): <strong>${tarifBase} DA</strong><br>
                        ⚖️ Extra: ${poidsExtra.toFixed(2)}kg × ${tarifParKg} DA/kg = <strong>${fraisExtra.toFixed(2)} DA</strong>
                    </small>
                `;
                fraisLivraisonEl.style.backgroundColor = '#e8f5e9';
                fraisLivraisonEl.style.padding = '8px';
                fraisLivraisonEl.style.borderRadius = '4px';
                fraisLivraisonEl.style.border = '2px solid #66bb6a';
            } else {
                // CALCUL NORMAL (≤5KG)
                fraisLivraisonEl.innerHTML = `
                    <strong style="color: #2e7d32; font-size: 16px;">${fraisLivraison.toFixed(2)} DA</strong>
                    <br>
                    <small style="color: #666; font-size: 11px;">
                        Tarif de base (≤5kg)
                    </small>
                `;
                fraisLivraisonEl.style.backgroundColor = '#e8f5e9';
                fraisLivraisonEl.style.padding = '8px';
                fraisLivraisonEl.style.borderRadius = '4px';
                fraisLivraisonEl.style.border = '2px solid #66bb6a';
            }
        }

        // Mettre à jour le total à payer
        if (totalAPayerEl) {
            if (!tarifsCheck || !tarifsCheck.exists) {
                totalAPayerEl.innerHTML = `
                    <strong style="color: #d32f2f;">- DA</strong>
                    <br>
                    <small style="color: #666; font-size: 11px;">En attente des frais</small>
                `;
            } else {
                totalAPayerEl.innerHTML = `
                    <strong style="color: #1976d2; font-size: 18px;">${total.toFixed(2)} DA</strong>
                `;
            }
        }

        console.log('💰 Résumé mis à jour:', { 
            prixColis, 
            fraisLivraison, 
            total,
            tarifsConfigures: tarifsCheck?.exists || false 
        });
    }

    // Écouteurs d'événements pour vérification automatique
    const bureauSourceSelect = document.getElementById('bureauSource');
    const wilayaDestSelect = document.getElementById('wilayaDest');
    const typeLivraisonSelect = document.getElementById('typelivraison');
    const poidsColisInput = document.getElementById('poidsColis');
    const prixColisInput = document.getElementById('prixColis');

    if (bureauSourceSelect) {
        bureauSourceSelect.addEventListener('change', verifyAndDisplayTarifs);
    }
    if (wilayaDestSelect) {
        wilayaDestSelect.addEventListener('change', verifyAndDisplayTarifs);
    }
    if (typeLivraisonSelect) {
        typeLivraisonSelect.addEventListener('change', verifyAndDisplayTarifs);
    }
    if (poidsColisInput) {
        poidsColisInput.addEventListener('input', verifyAndDisplayTarifs);
    }
    if (prixColisInput) {
        prixColisInput.addEventListener('input', verifyAndDisplayTarifs);
    }

    // Gestion du formulaire
    const form = document.getElementById('colisForm');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Extraction de la wilaya source depuis le bureau source
            const bureauSourceValue = document.getElementById('bureauSource')?.value || '';
            const wilayaSource = getWilayaFromBureau('bureauSource');
            const wilayaDest = document.getElementById('wilayaDest')?.value;
            const typeLivraison = document.getElementById('typelivraison')?.value || 'bureau';
            const poids = document.getElementById('poidsColis')?.value || '0';

            // Vérification OBLIGATOIRE avant soumission (avec poids)
            const tarifsCheck = checkTarifsConfiguration(wilayaSource, wilayaDest, typeLivraison, poids);
            
            if (!tarifsCheck.exists) {
                alert('❌ ' + tarifsCheck.message + '\n\n' + (tarifsCheck.details || ''));
                console.error('🚫 Soumission bloquée:', tarifsCheck);
                return false;
            }

            console.log('✅ Tarifs validés:', tarifsCheck);
            console.log('💰 Frais de livraison calculés:', tarifsCheck.tarif, 'DA');
            
            // Récupération des données du formulaire avec les bons IDs
            const formData = {
                // reference sera généré automatiquement par l'API - ne pas l'inclure
                // Informations expéditeur
                commercant: document.getElementById('nomExpediteur')?.value || '',
                nomCommercant: document.getElementById('nomExpediteur')?.value || '',
                commercantTel: document.getElementById('telExpediteur')?.value || '',
                telCommercant: document.getElementById('telExpediteur')?.value || '',
                bureauSource: bureauSourceValue,
                wilayaSource: wilayaSource,
                wilayaExp: wilayaSource,
                wilayaExpediteur: wilayaSource,
                typeLivraison: document.getElementById('typelivraison')?.value || 'bureau',
                poids: document.getElementById('poidsColis')?.value || '0',
                prixColis: document.getElementById('prixColis')?.value || '0',
                description: document.getElementById('description')?.value || '',
                client: document.getElementById('nomClient')?.value || '',
                clientNom: document.getElementById('nomClient')?.value || '',
                telephone: document.getElementById('telClient')?.value || '',
                clientTel: document.getElementById('telClient')?.value || '',
                telSecondaire: document.getElementById('telSecondaire')?.value || '',
                // adresse sera remplie avec bureauDest dans DataStore
                wilaya: document.getElementById('wilayaDest')?.value || '',
                bureauDest: document.getElementById('bureauDest')?.value || '',
                date: new Date().toISOString(),
                type: document.getElementById('typelivraison')?.value === 'domicile' ? 'Domicile' : 'Standard',
                montant: document.getElementById('prixColis')?.value || '0',
                statut: 'en_attente',
                status: 'en_attente',
                fraisLivraison: tarifsCheck.tarif || 0  // Utiliser les frais calculés avec poids
            };

            console.log('Données du formulaire de colis:', formData);
            console.log('💰 Frais de livraison appliqués:', formData.fraisLivraison, 'DA');

            // Ajouter via DataStore (maintenant avec API)
            if (DataStore && DataStore.addColis) {
                await DataStore.addColis(formData);
                console.log('Colis ajouté via API');
            } else {
                console.error('DataStore non disponible');
            }

            // Fermer le modal et réinitialiser le formulaire
            closeColisModal();
            form.reset();
        });
    }
});