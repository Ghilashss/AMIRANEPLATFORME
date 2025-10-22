// Gestionnaire des paiements aux commerçants
document.addEventListener('DOMContentLoaded', function() {
    console.log('📦 Module Paiement Commerçant chargé');

    let tousLesPaiements = [];

    // Charger les paiements à effectuer
    async function chargerPaiements() {
        try {
            console.log('🔄 Chargement des paiements...');
            
            // Récupérer tous les colis livrés
            const response = await fetch(`${window.API_CONFIG.API_URL}/colis`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Erreur lors du chargement des colis');
            }

            const result = await response.json();
            const colisLivres = result.data.filter(c => c.statut === 'livré');

            // Grouper par commerçant et calculer les totaux
            const paiementsParCommercant = {};

            colisLivres.forEach(colis => {
                const commercantId = colis.expediteur?._id || colis.expediteur;
                const commercantNom = colis.expediteur?.nom || 'Commerçant inconnu';
                const commercantEmail = colis.expediteur?.email || '';
                const commercantTel = colis.expediteur?.telephone || '';
                const prix = parseFloat(colis.prix) || 0;

                if (!paiementsParCommercant[commercantId]) {
                    paiementsParCommercant[commercantId] = {
                        commercantId,
                        commercantNom,
                        commercantEmail,
                        commercantTel,
                        nombreColis: 0,
                        montantTotal: 0,
                        colis: []
                    };
                }

                paiementsParCommercant[commercantId].nombreColis++;
                paiementsParCommercant[commercantId].montantTotal += prix;
                paiementsParCommercant[commercantId].colis.push({
                    id: colis._id,
                    reference: colis.tracking,
                    prix: prix,
                    dateLivraison: colis.dateLivraison || colis.updatedAt
                });
            });

            tousLesPaiements = Object.values(paiementsParCommercant);
            console.log('✅ Paiements chargés:', tousLesPaiements.length, 'commerçants');

            afficherPaiements(tousLesPaiements);
            mettreAJourStats(tousLesPaiements);

        } catch (error) {
            console.error('❌ Erreur chargement paiements:', error);
            afficherErreur('Erreur lors du chargement des paiements');
        }
    }

    // Afficher les paiements dans le tableau
    function afficherPaiements(paiements) {
        const tbody = document.getElementById('paiementsTableBody');
        if (!tbody) {
            console.error('❌ Element paiementsTableBody introuvable');
            return;
        }

        if (!paiements || paiements.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px;">
                        <ion-icon name="card-outline" style="font-size: 48px; color: #ccc;"></ion-icon>
                        <p style="margin-top: 10px; color: #999;">Aucun paiement en attente</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = paiements.map(p => `
            <tr data-commercant-id="${p.commercantId}">
                <td><strong>${p.commercantNom}</strong></td>
                <td>${p.commercantEmail || '-'}</td>
                <td>${p.commercantTel || '-'}</td>
                <td class="text-center"><span class="colis-badge">${p.nombreColis}</span></td>
                <td class="text-right">
                    <span class="montant-highlight">${p.montantTotal.toLocaleString('fr-FR')} DA</span>
                </td>
                <td class="text-center">
                    <button class="btn-payer" data-commercant-id="${p.commercantId}" title="Effectuer le paiement">
                        <ion-icon name="cash-outline"></ion-icon>
                        Payer
                    </button>
                    <button class="btn-details" data-commercant-id="${p.commercantId}" title="Voir les détails">
                        <ion-icon name="list-outline"></ion-icon>
                    </button>
                </td>
            </tr>
        `).join('');

        console.log('✅ Tableau des paiements mis à jour');
    }

    // Mettre à jour les statistiques
    function mettreAJourStats(paiements) {
        const totalCommercants = paiements.length;
        const totalColis = paiements.reduce((sum, p) => sum + p.nombreColis, 0);
        const montantTotal = paiements.reduce((sum, p) => sum + p.montantTotal, 0);

        document.getElementById('statCommercantsAPayer').textContent = totalCommercants;
        document.getElementById('statColisAReglement').textContent = totalColis;
        document.getElementById('statMontantTotal').textContent = `${montantTotal.toLocaleString('fr-FR')} DA`;
    }

    // Afficher une erreur
    function afficherErreur(message) {
        const tbody = document.getElementById('paiementsTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px; color: #dc3545;">
                        <ion-icon name="alert-circle-outline" style="font-size: 48px;"></ion-icon>
                        <p style="margin-top: 10px;">${message}</p>
                    </td>
                </tr>
            `;
        }
    }

    // Gestionnaire pour le bouton "Payer"
    document.addEventListener('click', function(e) {
        const btnPayer = e.target.closest('.btn-payer');
        if (btnPayer) {
            const commercantId = btnPayer.getAttribute('data-commercant-id');
            const paiement = tousLesPaiements.find(p => p.commercantId === commercantId);
            
            if (paiement) {
                effectuerPaiement(paiement);
            }
        }

        // Bouton détails
        const btnDetails = e.target.closest('.btn-details');
        if (btnDetails) {
            const commercantId = btnDetails.getAttribute('data-commercant-id');
            const paiement = tousLesPaiements.find(p => p.commercantId === commercantId);
            
            if (paiement) {
                afficherDetails(paiement);
            }
        }
    });

    // Effectuer un paiement
    function effectuerPaiement(paiement) {
        const modal = document.getElementById('modalPaiement');
        if (!modal) return;

        // Remplir le modal avec les infos
        document.getElementById('paiementCommercantNom').textContent = paiement.commercantNom;
        document.getElementById('paiementNombreColis').textContent = paiement.nombreColis;
        document.getElementById('paiementMontant').textContent = `${paiement.montantTotal.toLocaleString('fr-FR')} DA`;
        
        // Stocker l'ID du commerçant
        modal.setAttribute('data-commercant-id', paiement.commercantId);
        
        // Afficher le modal
        modal.style.display = 'flex';
    }

    // Afficher les détails des colis
    function afficherDetails(paiement) {
        const details = paiement.colis.map(c => 
            `• ${c.reference} - ${c.prix.toLocaleString('fr-FR')} DA - ${new Date(c.dateLivraison).toLocaleDateString('fr-FR')}`
        ).join('\n');

        alert(`Détails des colis de ${paiement.commercantNom}\n\n` +
              `Nombre de colis: ${paiement.nombreColis}\n` +
              `Montant total: ${paiement.montantTotal.toLocaleString('fr-FR')} DA\n\n` +
              `Liste des colis:\n${details}`);
    }

    // Confirmer le paiement
    window.confirmerPaiement = async function() {
        const modal = document.getElementById('modalPaiement');
        const commercantId = modal.getAttribute('data-commercant-id');
        const paiement = tousLesPaiements.find(p => p.commercantId === commercantId);

        if (!paiement) return;

        try {
            console.log('💰 Enregistrement du paiement...');

            // TODO: Appel API pour enregistrer le paiement dans la base de données
            // Pour l'instant, on simule
            
            alert(`✅ Paiement effectué!\n\n` +
                  `Commerçant: ${paiement.commercantNom}\n` +
                  `Montant: ${paiement.montantTotal.toLocaleString('fr-FR')} DA\n` +
                  `Colis réglés: ${paiement.nombreColis}\n\n` +
                  `Le paiement a été enregistré avec succès.`);

            // Fermer le modal
            modal.style.display = 'none';

            // Recharger les paiements
            setTimeout(() => chargerPaiements(), 500);

        } catch (error) {
            console.error('❌ Erreur lors du paiement:', error);
            alert('Erreur lors de l\'enregistrement du paiement');
        }
    };

    // Fermer le modal
    window.annulerPaiement = function() {
        document.getElementById('modalPaiement').style.display = 'none';
    };

    // Bouton actualiser
    const btnActualiser = document.getElementById('btnActualiserPaiements');
    if (btnActualiser) {
        btnActualiser.addEventListener('click', () => {
            console.log('🔄 Actualisation manuelle...');
            chargerPaiements();
        });
    }

    // Recherche et filtres
    const searchInput = document.getElementById('searchPaiement');
    if (searchInput) {
        searchInput.addEventListener('input', () => filtrerPaiements());
    }

    function filtrerPaiements() {
        const searchTerm = document.getElementById('searchPaiement')?.value.toLowerCase() || '';
        
        let paiementsFiltres = tousLesPaiements;

        // Filtrer par recherche
        if (searchTerm) {
            paiementsFiltres = paiementsFiltres.filter(p =>
                p.commercantNom.toLowerCase().includes(searchTerm) ||
                p.commercantEmail.toLowerCase().includes(searchTerm) ||
                p.commercantTel.includes(searchTerm)
            );
        }

        afficherPaiements(paiementsFiltres);
    }

    // Charger les paiements au chargement de la page
    chargerPaiements();

    // Recharger quand on navigue vers la section
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a[data-page="paiement-commercant"]');
        if (link) {
            console.log('🔄 Navigation vers Paiements - Rechargement...');
            setTimeout(() => chargerPaiements(), 100);
        }
    });
});
