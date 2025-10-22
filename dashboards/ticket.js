async function getCurrentAgencyInfo() {
    // 🔥 Récupérer les bureaux depuis MongoDB
    let bureaux = [];
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${window.API_CONFIG.API_URL}/auth/users?role=bureau`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.ok) {
            const data = await response.json();
            bureaux = data.users || data || [];
            console.log('✅ Bureaux chargés depuis MongoDB:', bureaux.length);
        }
    } catch (error) {
        console.error('❌ Erreur chargement bureaux:', error);
    }

    const bureauEmail = sessionStorage.getItem('bureauEmail');
    const bureau = Array.isArray(bureaux) ? bureaux.find(b => b.email === bureauEmail) : null;

    // 🔥 Récupérer les agences depuis MongoDB
    let agenceUsers = [];
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${window.API_CONFIG.API_URL}/auth/users?role=agence`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.ok) {
            const data = await response.json();
            agenceUsers = data.users || data || [];
            console.log('✅ Agences chargées depuis MongoDB:', agenceUsers.length);
        }
    } catch (error) {
        console.error('❌ Erreur chargement agences:', error);
    }

    const agence = Array.isArray(agenceUsers) ? agenceUsers.find(a => a.nom === bureau?.agence) : null;

    return {
        agenceName: agence?.nom || 'AMIRANE EXPRESS',
        agencePhone: agence?.phone || '0550 00 00 00',
        agenceAddress: agence?.address || 'Adresse de l\'agence',
        agenceWilaya: agence?.wilayaName || 'Wilaya',
        bureauName: bureau?.nom || 'Bureau principal'
    };
}

function formatMontant(montant) {
    return new Intl.NumberFormat('fr-DZ', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(montant) + ' DA';
}

function formatDate(dateStr) {
    if (!dateStr) return new Date().toLocaleDateString('fr-FR');
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

async function printTicket(colis) {
    console.log('🎫 Impression ticket pour colis:', colis);
    console.log('📦 colis.ref:', colis.ref);
    console.log('📦 colis.commercant:', colis.commercant);
    console.log('📦 colis.client:', colis.client);
    console.log('📦 colis.wilayaExp:', colis.wilayaExp);
    console.log('📦 colis.wilayaDest:', colis.wilayaDest);
    
    const formatText = (text) => text || 'N/A';
    const agencyInfo = await getCurrentAgencyInfo();

    // Date et heure en haut
    const now = new Date();
    const dateHeader = now.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }) + ' ' + now.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('ticket-ticketDateHeader').textContent = dateHeader + '                                                                             Ticket de Livraison';

    // Information agence dans le texte arabe
    document.getElementById('ticket-agencyNameAr').textContent = agencyInfo.agenceName;
    
    // Wilaya et code destinataire en haut à droite
    document.getElementById('ticket-destWilayaHeader').textContent = formatText(colis.wilayaDest);
    document.getElementById('ticket-destCodeHeader').textContent = formatText(colis.adresse ? colis.adresse.substring(0, 3).toUpperCase() : 'KLH');
    
    // Numéro de tracking
    document.getElementById('ticket-trackingNumber').textContent = colis.ref;
    document.getElementById('ticket-trackingBarcode').textContent = colis.ref;
    
    // Informations expéditeur
    document.getElementById('ticket-expName').textContent = formatText(colis.commercant);
    document.getElementById('ticket-expPhone').textContent = formatText(colis.commercantTel);
    document.getElementById('ticket-expWilaya').textContent = formatText(colis.wilayaExp);
    
    // Informations destinataire
    document.getElementById('ticket-destName').textContent = formatText(colis.client);
    document.getElementById('ticket-destPhone').textContent = formatText(colis.tel);
    document.getElementById('ticket-destWilaya').textContent = formatText(colis.wilayaDest);
    document.getElementById('ticket-destAddress').textContent = formatText(colis.adresse);
    
    // Informations colis
    document.getElementById('ticket-colisService').textContent = formatText(colis.type || 'stop_desk');
    document.getElementById('ticket-colisWilayaExp').textContent = formatText(colis.wilayaExp);
    document.getElementById('ticket-colisPrix').textContent = formatMontant(colis.montant || colis.prixColis || 0);
    document.getElementById('ticket-colisFrais').textContent = formatMontant(colis.fraisLivraison || 300);
    document.getElementById('ticket-colisAmount').textContent = formatMontant(colis.totalAPayer || colis.montant);
    document.getElementById('ticket-colisWeight').textContent = formatText(colis.poids ? colis.poids + ' KG' : '2 KG');
    document.getElementById('ticket-colisContent').textContent = formatText(colis.contenu || 'Colis');
    
    // Type de colis (Standard, Fragile, Express, Volumineux)
    const typeColisMap = {
        'standard': 'Standard',
        'fragile': 'Fragile ⚠️',
        'express': 'Express ⚡',
        'volumineux': 'Volumineux 📦'
    };
    const typeColisValue = colis.typeColis || colis.typeArticle || 'standard';
    document.getElementById('ticket-colisType').textContent = typeColisMap[typeColisValue] || formatText(typeColisValue);
    
    // Date d'expédition
    const expeditionDate = colis.date ? new Date(colis.date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }) : dateHeader.split(' ')[0];
    document.getElementById('ticket-orderDate').textContent = expeditionDate;
    
    // Date de signature
    document.getElementById('ticket-signatureDate').textContent = expeditionDate;

    // Génération du code-barres
    const barcodeValue = colis.ref || colis.reference || colis.trackingNumber || colis.codeSuivi || colis._id;
    
    console.log('🔍 Valeur code-barres:', barcodeValue);
    console.log('🔍 JsBarcode disponible:', typeof JsBarcode !== 'undefined');
    
    try {
        if (typeof JsBarcode !== 'undefined' && barcodeValue) {
            JsBarcode("#ticket-barcode", barcodeValue, {
                format: "CODE128",
                width: 1.8,        // Réduit de 2 pour économiser l'espace
                height: 50,        // Réduit de 60 à 50 pixels
                displayValue: false,
                margin: 3,         // Réduit de 5 à 3
                background: "#ffffff",
                lineColor: "#000000"
            });
            console.log('✅ Code-barres généré avec succès (width: 1.8, height: 50, compact)');
        } else {
            console.error('❌ JsBarcode non disponible ou valeur manquante');
        }
    } catch (error) {
        console.error('❌ Erreur génération code-barres:', error);
    }

    // Afficher le ticket
    const ticketDiv = document.getElementById('ticketColisPrint');
    ticketDiv.style.display = 'flex';

    console.log('🎫 Ticket affiché, impression dans 800ms...');
    
    // Attendre que le code-barres soit généré avant d'imprimer
    setTimeout(() => {
        // 🔥 FORCER LES DIMENSIONS 10x15 CM AVANT L'IMPRESSION
        const ticketWrapper = document.querySelector('.ticket-wrapper');
        if (ticketWrapper) {
            ticketWrapper.style.width = '100mm';
            ticketWrapper.style.height = '150mm';
            ticketWrapper.style.maxWidth = '100mm';
            ticketWrapper.style.maxHeight = '150mm';
            ticketWrapper.style.minWidth = '100mm';
            ticketWrapper.style.minHeight = '150mm';
            ticketWrapper.style.transform = 'scale(1)';
            ticketWrapper.style.margin = '0';
            ticketWrapper.style.padding = '3mm';
            ticketWrapper.style.boxSizing = 'border-box';
            console.log('✅ Dimensions 10x15 cm forcées sur .ticket-wrapper');
        }
        
        // Forcer aussi le conteneur parent
        ticketDiv.style.width = '100mm';
        ticketDiv.style.height = '150mm';
        ticketDiv.style.overflow = 'hidden';
        ticketDiv.style.position = 'relative';
        
        window.print();
    }, 800);
}