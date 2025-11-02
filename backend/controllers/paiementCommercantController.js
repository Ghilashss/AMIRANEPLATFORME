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
// AGENT: VERSER MONTANT À UN COMMERÇANT
// ===================================================
// L'agent effectue 2 virements automatiquement :
// 1. PRIX des colis → Commerçant
// 2. FRAIS de livraison → Admin
exports.verserAuCommercant = async (req, res) => {
  try {
    const { colisIds, commercantId, montantTotal } = req.body;
    
    console.log('💰 Demande de versement au commerçant:');
    console.log(`   Commerçant: ${commercantId}`);
    console.log(`   Nombre de colis: ${colisIds?.length || 0}`);
    console.log(`   Montant total demandé: ${montantTotal} DA`);
    
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
    
    // Calculer PRIX (montant des colis) et FRAIS DE LIVRAISON
    let montantPrixColis = 0;
    let montantFraisLivraison = 0;
    
    colis.forEach(c => {
      montantPrixColis += c.montant || 0;
      montantFraisLivraison += c.fraisLivraison || 0;
    });
    
    console.log(`📊 Décomposition:`);
    console.log(`   Prix des colis (vers commerçant): ${montantPrixColis} DA`);
    console.log(`   Frais de livraison (vers admin): ${montantFraisLivraison} DA`);
    console.log(`   Total: ${montantPrixColis + montantFraisLivraison} DA`);
    
    // Vérifier que le montant demandé correspond au prix des colis
    if (Math.abs(montantPrixColis - montantTotal) > 1) {
      return res.status(400).json({
        success: false,
        message: `Montant incorrect: attendu ${montantPrixColis} DA (prix colis), reçu ${montantTotal} DA`
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
      console.log('✅ Portefeuille commerçant créé');
    }
    
    // Trouver portefeuille admin
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Administrateur introuvable'
      });
    }
    
    let portefeuilleAdmin = await Portefeuille.findOne({
      proprietaireId: admin._id,
      typeProprietaire: 'User'
    });
    
    if (!portefeuilleAdmin) {
      portefeuilleAdmin = new Portefeuille({
        proprietaireId: admin._id,
        typeProprietaire: 'User',
        nomProprietaire: 'Admin',
        solde: 0
      });
      await portefeuilleAdmin.save();
      console.log('✅ Portefeuille admin créé');
    }
    
    // ===== OPÉRATION 1: PRIX DES COLIS → COMMERÇANT =====
    const operationPrixColis = new OperationFinanciere({
      typeOperation: 'paiement_livraison',
      montant: montantPrixColis,
      compteDebit: portefeuilleAgent._id,
      compteCredit: portefeuilleCommercant._id,
      description: `Paiement prix ${colis.length} colis livrés (${colis.map(c => c.tracking).join(', ')})`,
      statut: 'validee',
      methodePaiement: 'virement',
      effectuePar: req.user._id,
      notes: `Virement prix colis par agent ${req.user.nom || req.user.email}`
    });
    
    await operationPrixColis.save();
    console.log(`✅ Opération 1: ${montantPrixColis} DA → Commerçant`);
    
    // ===== OPÉRATION 2: FRAIS DE LIVRAISON → ADMIN =====
    let operationFraisLivraison = null;
    if (montantFraisLivraison > 0) {
      operationFraisLivraison = new OperationFinanciere({
        typeOperation: 'paiement_agence',
        montant: montantFraisLivraison,
        compteDebit: portefeuilleAgent._id,
        compteCredit: portefeuilleAdmin._id,
        description: `Frais de livraison ${colis.length} colis (${colis.map(c => c.tracking).join(', ')})`,
        statut: 'validee',
        methodePaiement: 'virement',
        effectuePar: req.user._id,
        notes: `Virement frais livraison par agent ${req.user.nom || req.user.email}`
      });
      
      await operationFraisLivraison.save();
      console.log(`✅ Opération 2: ${montantFraisLivraison} DA → Admin`);
    }
    
    // Mettre à jour les soldes
    portefeuilleAgent.solde -= (montantPrixColis + montantFraisLivraison);
    portefeuilleCommercant.solde += montantPrixColis;
    portefeuilleAdmin.solde += montantFraisLivraison;
    
    await portefeuilleAgent.save();
    await portefeuilleCommercant.save();
    await portefeuilleAdmin.save();
    
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
    
    console.log(`✅ Paiement effectué avec succès:`);
    console.log(`   → ${montantPrixColis} DA versés au commerçant`);
    console.log(`   → ${montantFraisLivraison} DA versés à l'admin`);
    console.log(`   → ${colis.length} colis marqués payés`);
    console.log(`   → Nouveau solde agent: ${portefeuilleAgent.solde} DA`);
    console.log(`   → Nouveau solde commerçant: ${portefeuilleCommercant.solde} DA`);
    console.log(`   → Nouveau solde admin: ${portefeuilleAdmin.solde} DA`);
    
    res.json({
      success: true,
      message: `Paiement effectué avec succès`,
      details: {
        prixColisVerse: montantPrixColis,
        fraisLivraisonVerse: montantFraisLivraison,
        totalDebite: montantPrixColis + montantFraisLivraison,
        nombreColis: colis.length
      },
      operations: {
        prixColis: operationPrixColis._id,
        fraisLivraison: operationFraisLivraison ? operationFraisLivraison._id : null,
        nouveauSoldeAgent: portefeuilleAgent.solde,
        nouveauSoldeCommercant: portefeuilleCommercant.solde,
        nouveauSoldeAdmin: portefeuilleAdmin.solde
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
          montantFraisLivraison: 0,
          colis: []
        };
      }
      
      commercantsMap[comIdStr].nombreColis++;
      commercantsMap[comIdStr].montantTotal += (c.montant || 0);
      commercantsMap[comIdStr].montantFraisLivraison += (c.fraisLivraison || 0);
      commercantsMap[comIdStr].colis.push({
        id: c._id,
        tracking: c.tracking,
        montant: c.montant,
        fraisLivraison: c.fraisLivraison,
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
