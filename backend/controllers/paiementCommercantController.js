const Colis = require('../models/Colis');
const Portefeuille = require('../models/Portefeuille');
const OperationFinanciere = require('../models/OperationFinanciere');
const User = require('../models/User');

// ===================================================
// OBTENIR COLIS LIVRÉS NON PAYÉS POUR UN COMMERÇANT
// ===================================================
exports.getColisLivresNonPayes = async (req, res) => {
  try {
    const { commercantId } = req.body;
    
    if (!commercantId) {
      return res.status(400).json({
        success: false,
        message: 'ID commerçant requis'
      });
    }
    
    console.log(`?? Recherche colis livrés non payés pour commerçant: ${commercantId}`);
    
    // Trouver tous les colis livrés mais non payés
    const colis = await Colis.find({
      'expediteur.id': commercantId,
      status: 'livre',
      paye: false
    }).sort({ dateLivraison: -1 });
    
    console.log(`?? ${colis.length} colis livrés non payés trouvés`);
    
    // Calculer le montant total à recevoir
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
// OBTENIR MONTANT À RECEVOIR POUR UN COMMERÇANT
// ===================================================
exports.getMontantARecevoir = async (req, res) => {
  try {
    const { commercantId } = req.body;
    
    if (!commercantId) {
      return res.status(400).json({
        success: false,
        message: 'ID commerçant requis'
      });
    }
    
    console.log(`?? Calcul montant à recevoir pour: ${commercantId}`);
    
    // Compter les colis livrés non payés
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
// AGENT: VERSER MONTANT À UN COMMERÇANT
// ===================================================
exports.verserAuCommercant = async (req, res) => {
  try {
    const { colisIds, commercantId, montantTotal } = req.body;
    
    console.log('?? Demande de versement au commerçant:');
    console.log(`   Commerçant: ${commercantId}`);
    console.log(`   Nombre de colis: ${colisIds?.length || 0}`);
    console.log(`   Montant total: ${montantTotal} DA`);
    
    // Validation
    if (!colisIds || colisIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucun colis sélectionné'
      });
    }
    
    if (!commercantId) {
      return res.status(400).json({
        success: false,
        message: 'ID commerçant requis'
      });
    }
    
    if (!montantTotal || montantTotal <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Montant invalide'
      });
    }
    
    // Vérifier que tous les colis existent et sont livrés non payés
    const colis = await Colis.find({
      _id: { $in: colisIds },
      'expediteur.id': commercantId,
      status: 'livre',
      paye: false
    });
    
    if (colis.length !== colisIds.length) {
      return res.status(400).json({
        success: false,
        message: 'Certains colis sont invalides ou déjà payés'
      });
    }
    
    // Calculer le montant réel
    const montantReel = colis.reduce((sum, c) => sum + (c.montant || 0), 0);
    
    if (Math.abs(montantReel - montantTotal) > 1) {
      return res.status(400).json({
        success: false,
        message: `Montant incorrect: attendu ${montantReel} DA, reçu ${montantTotal} DA`
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
    
    // Vérifier le solde
    if (portefeuilleAgent.solde < montantReel) {
      return res.status(400).json({
        success: false,
        message: `Solde insuffisant: ${portefeuilleAgent.solde} DA < ${montantReel} DA`
      });
    }
    
    // Trouver ou créer portefeuille commerçant
    let portefeuilleCommercant = await Portefeuille.findOne({
      proprietaireId: commercantId,
      typeProprietaire: 'User'
    });
    
    if (!portefeuilleCommercant) {
      const commercant = await User.findById(commercantId);
      if (!commercant) {
        return res.status(404).json({
          success: false,
          message: 'Commerçant introuvable'
        });
      }
      
      portefeuilleCommercant = new Portefeuille({
        proprietaireId: commercantId,
        typeProprietaire: 'User',
        nomProprietaire: commercant.nom || 'Commerçant',
        solde: 0
      });
      await portefeuilleCommercant.save();
      console.log('? Portefeuille commerçant créé');
    }
    
    // Créer l'opération financière
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
      description: `Paiement ${colis.length} colis livrés (${colis.map(c => c.tracking).join(', ')})`,
      statut: 'validee',
      referenceTransaction: `PAIEMENT-COM-${Date.now()}`
    });
    
    await operation.save();
    
    // Mettre à jour les soldes
    portefeuilleAgent.solde -= montantReel;
    portefeuilleCommercant.solde += montantReel;
    
    await portefeuilleAgent.save();
    await portefeuilleCommercant.save();
    
    // Marquer les colis comme payés
    await Colis.updateMany(
      { _id: { $in: colisIds } },
      {
        $set: {
          paye: true,
          datePaiement: new Date()
        }
      }
    );
    
    console.log(`? Paiement effectué: ${montantReel} DA ? ${portefeuilleCommercant.nomProprietaire}`);
    console.log(`   ${colis.length} colis marqués payés`);
    console.log(`   Nouveau solde agent: ${portefeuilleAgent.solde} DA`);
    console.log(`   Nouveau solde commerçant: ${portefeuilleCommercant.solde} DA`);
    
    res.json({
      success: true,
      message: `Paiement de ${montantReel} DA effectué avec succès`,
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
// AGENT: LISTE DES COMMERÇANTS AVEC MONTANTS À PAYER
// ===================================================
exports.getCommercantsPaiements = async (req, res) => {
  try {
    console.log('?? Liste des commerçants avec paiements en attente...');
    
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
    
    // Grouper par commerçant
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
    
    console.log(`? ${commercants.length} commerçants avec paiements en attente`);
    
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
