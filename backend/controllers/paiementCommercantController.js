const Colis = require('../models/Colis');
const Portefeuille = require('../models/Portefeuille');
const OperationFinanciere = require('../models/OperationFinanciere');
const User = require('../models/User');

// ===================================================
// OBTENIR COLIS LIVR�S NON PAY�S POUR UN COMMER�ANT
// ===================================================
exports.getColisLivresNonPayes = async (req, res) => {
  try {
    const { commercantId } = req.body;
    
    if (!commercantId) {
      return res.status(400).json({
        success: false,
        message: 'ID commer�ant requis'
      });
    }
    
    console.log(`?? Recherche colis livr�s non pay�s pour commer�ant: ${commercantId}`);
    
    // Trouver tous les colis livr�s mais non pay�s
    const colis = await Colis.find({
      'expediteur.id': commercantId,
      status: 'livre',
      paye: false
    }).sort({ dateLivraison: -1 });
    
    console.log(`?? ${colis.length} colis livr�s non pay�s trouv�s`);
    
    // Calculer le montant total � recevoir
    const montantTotal = colis.reduce((sum, c) => sum + (c.montant || 0), 0);
    
    res.json({
      success: true,
      count: colis.length,
      montantTotal: montantTotal,
      colis: colis
    });
    
  } catch (error) {
    console.error('? Erreur getColisLivresNonPayes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// ===================================================
// OBTENIR MONTANT � RECEVOIR POUR UN COMMER�ANT
// ===================================================
exports.getMontantARecevoir = async (req, res) => {
  try {
    const { commercantId } = req.body;
    
    if (!commercantId) {
      return res.status(400).json({
        success: false,
        message: 'ID commer�ant requis'
      });
    }
    
    console.log(`?? Calcul montant � recevoir pour: ${commercantId}`);
    
    // Compter les colis livr�s non pay�s
    const colis = await Colis.find({
      'expediteur.id': commercantId,
      status: 'livre',
      paye: false
    });
    
    const montantTotal = colis.reduce((sum, c) => sum + (c.montant || 0), 0);
    const nombreColis = colis.length;
    
    console.log(`? ${nombreColis} colis, total: ${montantTotal} DA`);
    
    res.json({
      success: true,
      montantARecevoir: montantTotal,
      nombreColis: nombreColis
    });
    
  } catch (error) {
    console.error('? Erreur getMontantARecevoir:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// ===================================================
// AGENT: VERSER MONTANT � UN COMMER�ANT
// ===================================================
exports.verserAuCommercant = async (req, res) => {
  try {
    const { colisIds, commercantId, montantTotal } = req.body;
    
    console.log('?? Demande de versement au commer�ant:');
    console.log(`   Commer�ant: ${commercantId}`);
    console.log(`   Nombre de colis: ${colisIds?.length || 0}`);
    console.log(`   Montant total: ${montantTotal} DA`);
    
    // Validation
    if (!colisIds || colisIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucun colis s�lectionn�'
      });
    }
    
    if (!commercantId) {
      return res.status(400).json({
        success: false,
        message: 'ID commer�ant requis'
      });
    }
    
    if (!montantTotal || montantTotal <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Montant invalide'
      });
    }
    
    // V�rifier que tous les colis existent et sont livr�s non pay�s
    const colis = await Colis.find({
      _id: { $in: colisIds },
      'expediteur.id': commercantId,
      status: 'livre',
      paye: false
    });
    
    if (colis.length !== colisIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Certains colis sont invalides ou d�j� pay�s'
      });
    }
    
    // Calculer le montant r�el
    const montantReel = colis.reduce((sum, c) => sum + (c.montant || 0), 0);
    
    if (Math.abs(montantReel - montantTotal) > 1) {
      return res.status(400).json({
        success: false,
        message: `Montant incorrect: attendu ${montantReel} DA, re�u ${montantTotal} DA`
      });
    }
    
    // Trouver portefeuille agent
    const agenceId = req.user.agence._id || req.user.agence;
    const portefeuilleAgent = await Portefeuille.findOne({
      proprietaireId: agenceId,
      typeProprietaire: 'Agence'
    });
    
    if (!portefeuilleAgent) {
      return res.status(404).json({
        success: false,
        message: 'Portefeuille agent introuvable'
      });
    }
    
    // VÉRIFICATION SOLDE DÉSACTIVÉE - Permet paiement même avec solde insuffisant
    // L'agent peut avoir un solde négatif temporairement
    /*
    if (portefeuilleAgent.solde < montantReel) {
      return res.status(400).json({
        success: false,
        message: `Solde insuffisant: ${portefeuilleAgent.solde} DA < ${montantReel} DA`
      });
    }
    */
    
    // Trouver ou cr�er portefeuille commer�ant
    let portefeuilleCommercant = await Portefeuille.findOne({
      proprietaireId: commercantId,
      typeProprietaire: 'User'
    });
    
    if (!portefeuilleCommercant) {
      const commercant = await User.findById(commercantId);
      if (!commercant) {
        return res.status(404).json({
          success: false,
          message: 'Commer�ant introuvable'
        });
      }
      
      portefeuilleCommercant = new Portefeuille({
        proprietaireId: commercantId,
        typeProprietaire: 'User',
        nomProprietaire: commercant.nom || 'Commer�ant',
        solde: 0
      });
      await portefeuilleCommercant.save();
      console.log('? Portefeuille commer�ant cr��');
    }
    
    // Cr�er l'op�ration financi�re
    const operation = new OperationFinanciere({
      type: 'virement',
      montant: montantReel,
      portefeuilleSource: portefeuilleAgent._id,
      portefeuilleDestination: portefeuilleCommercant._id,
      expediteur: {
        id: agenceId,
        type: 'Agence',
        nom: req.user.agenceNom || req.user.agence?.nom || 'Agence'
      },
      destinataire: {
        id: commercantId,
        type: 'User',
        nom: portefeuilleCommercant.nomProprietaire
      },
      description: `Paiement ${colis.length} colis livr�s (${colis.map(c => c.tracking).join(', ')})`,
      statut: 'validee',
      referenceTransaction: `PAIEMENT-COM-${Date.now()}`
    });
    
    await operation.save();
    
    // Mettre � jour les soldes
    portefeuilleAgent.solde -= montantReel;
    portefeuilleCommercant.solde += montantReel;
    
    await portefeuilleAgent.save();
    await portefeuilleCommercant.save();
    
    // Marquer les colis comme pay�s
    await Colis.updateMany(
      { _id: { $in: colisIds } },
      {
        $set: {
          paye: true,
          datePaiement: new Date()
        }
      }
    );
    
    console.log(`? Paiement effectu�: ${montantReel} DA ? ${portefeuilleCommercant.nomProprietaire}`);
    console.log(`   ${colis.length} colis marqu�s pay�s`);
    console.log(`   Nouveau solde agent: ${portefeuilleAgent.solde} DA`);
    console.log(`   Nouveau solde commer�ant: ${portefeuilleCommercant.solde} DA`);
    
    res.json({
      success: true,
      message: `Paiement de ${montantReel} DA effectu� avec succ�s`,
      operation: {
        id: operation._id,
        montant: montantReel,
        nombreColis: colis.length,
        nouveauSoldeAgent: portefeuilleAgent.solde,
        nouveauSoldeCommercant: portefeuilleCommercant.solde
      }
    });
    
  } catch (error) {
    console.error('? Erreur verserAuCommercant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

// ===================================================
// AGENT: LISTE DES COMMER�ANTS AVEC MONTANTS � PAYER
// ===================================================
exports.getCommercantsPaiements = async (req, res) => {
  try {
    console.log('?? Liste des commer�ants avec paiements en attente...');
    
    // Filtrage par agence si c'est un agent
    let query = {
      status: 'livre',
      paye: false
    };
    
    if (req.user.role === 'agent' || req.user.role === 'agence') {
      const agenceId = req.user.agence._id || req.user.agence;
      query.$or = [
        { agence: agenceId },
        { bureauSource: agenceId }
      ];
    }
    
    const colis = await Colis.find(query).populate('expediteur.id', 'nom email telephone');
    
    // Grouper par commer�ant
    const commercantsMap = {};
    
    colis.forEach(c => {
      const comId = c.expediteur?.id?._id || c.expediteur?.id;
      if (!comId) return;
      
      const comIdStr = comId.toString();
      
      if (!commercantsMap[comIdStr]) {
        commercantsMap[comIdStr] = {
          commercantId: comIdStr,
          commercantNom: c.expediteur?.nom || c.expediteur?.id?.nom || 'Inconnu',
          commercantTel: c.expediteur?.telephone || c.expediteur?.id?.telephone || '',
          nombreColis: 0,
          montantTotal: 0,
          colis: []
        };
      }
      
      commercantsMap[comIdStr].nombreColis++;
      commercantsMap[comIdStr].montantTotal += (c.montant || 0);
      commercantsMap[comIdStr].colis.push({
        id: c._id,
        tracking: c.tracking,
        montant: c.montant,
        dateLivraison: c.dateLivraison
      });
    });
    
    const commercants = Object.values(commercantsMap);
    
    console.log(`? ${commercants.length} commer�ants avec paiements en attente`);
    
    res.json({
      success: true,
      count: commercants.length,
      commercants: commercants
    });
    
  } catch (error) {
    console.error('? Erreur getCommercantsPaiements:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};
