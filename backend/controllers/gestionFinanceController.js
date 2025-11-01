const Portefeuille = require('../models/Portefeuille');
const OperationFinanciere = require('../models/OperationFinanciere');
const User = require('../models/User');
const Agence = require('../models/Agence');
const Colis = require('../models/Colis');

// ===================================================
// CONTRÔLEUR GESTION FINANCE
// ===================================================

// ============================================
// 1. OBTENIR LE PORTEFEUILLE D'UN UTILISATEUR
// ============================================
exports.obtenirPortefeuille = async (req, res) => {
  try {
    const { userId, userType } = req.body;
    
    if (!userId || !userType) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID utilisateur et type requis' 
      });
    }
    
    // Rechercher le portefeuille
    let portefeuille = await Portefeuille.findOne({
      proprietaireId: userId,
      typeProprietaire: userType
    });
    
    // Si n'existe pas, créer
    if (!portefeuille) {
      // Obtenir le nom du propriétaire
      let nomProprietaire = '';
      if (userType === 'User') {
        const user = await User.findById(userId);
        nomProprietaire = user ? user.nom : 'Admin';
      } else if (userType === 'Agence') {
        const agence = await Agence.findById(userId);
        nomProprietaire = agence ? agence.nom : 'Agence';
      } else if (userType === 'Commercant') {
        const commercant = await User.findById(userId);
        nomProprietaire = commercant ? commercant.nom : 'Commerçant';
      }
      
      portefeuille = new Portefeuille({
        proprietaireId: userId,
        typeProprietaire: userType,
        nomProprietaire: nomProprietaire,
        solde: 0
      });
      
      await portefeuille.save();
    }
    
    // Mettre à jour le solde
    console.log('📊 obtenirPortefeuille - Avant mise à jour:', {
      userId,
      userType,
      portefeuilleId: portefeuille._id,
      soldeAvant: portefeuille.solde
    });
    
    await portefeuille.mettreAJourSolde();
    
    console.log('✅ obtenirPortefeuille - Après mise à jour:', {
      soldeApres: portefeuille.solde,
      derniereMiseAJour: portefeuille.derniereMiseAJour
    });
    
    res.json({
      success: true,
      portefeuille: {
        id: portefeuille._id,
        nom: portefeuille.nomProprietaire,
        solde: portefeuille.solde,
        devise: portefeuille.devise,
        statut: portefeuille.statut,
        derniereMiseAJour: portefeuille.derniereMiseAJour
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur obtenirPortefeuille:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur', 
      error: error.message 
    });
  }
};

// ============================================
// 2. OBTENIR LES STATISTIQUES FINANCIÈRES
// ============================================
exports.obtenirStatistiques = async (req, res) => {
  try {
    const { userId, userType } = req.body;
    
    // Obtenir le portefeuille
    const portefeuille = await Portefeuille.findOne({
      proprietaireId: userId,
      typeProprietaire: userType
    });
    
    if (!portefeuille) {
      return res.status(404).json({ 
        success: false, 
        message: 'Portefeuille introuvable' 
      });
    }
    
    // Calculer les statistiques selon le type de compte
    let stats = {
      soldeActuel: portefeuille.solde,
      aRecevoir: 0,
      aPayer: 0,
      totalRecu: 0,
      totalPaye: 0
    };
    
    if (userType === 'Commercant') {
      // COMMERÇANT
      // À RECEVOIR = Prix des colis livrés (non encore payés par agent)
      const colisLivres = await Colis.find({
        'expediteur.id': userId,
        status: 'livre',
        paye: { $ne: true }
      });
      stats.aRecevoir = colisLivres.reduce((sum, colis) => sum + (colis.montant || 0), 0);
      
      // À PAYER = Frais de livraison (colis livrés) + Frais de retour (colis retournés)
      // Frais de livraison des colis livrés
      const colisLivresFrais = await Colis.find({
        'expediteur.id': userId,
        status: 'livre',
        fraisLivraisonPayes: { $ne: true }
      });
      const fraisLivraison = colisLivresFrais.reduce((sum, colis) => sum + (colis.fraisLivraison || 0), 0);
      
      // Frais de retour (200 DA par colis retourné)
      const colisRetournes = await Colis.find({
        'expediteur.id': userId,
        status: { $in: ['retourne', 'en_retour'] },
        fraisRetourPayes: { $ne: true }
      });
      const fraisRetour = colisRetournes.reduce((sum, colis) => sum + (colis.fraisRetour || 200), 0);
      
      stats.aPayer = fraisLivraison + fraisRetour;
      
    } else if (userType === 'Agence') {
      // AGENT/AGENCE
      // À RECEVOIR = Frais de livraison + Frais de retour que commerçants doivent payer
      const colisAgenceLivres = await Colis.find({
        agence: userId,
        status: 'livre',
        fraisLivraisonPayes: { $ne: true }
      });
      const fraisLivraison = colisAgenceLivres.reduce((sum, colis) => sum + (colis.fraisLivraison || 0), 0);
      
      const colisAgenceRetournes = await Colis.find({
        agence: userId,
        status: { $in: ['retourne', 'en_retour'] },
        fraisRetourPayes: { $ne: true }
      });
      const fraisRetour = colisAgenceRetournes.reduce((sum, colis) => sum + (colis.fraisRetour || 200), 0);
      
      stats.aRecevoir = fraisLivraison + fraisRetour;
      
      // À PAYER = Frais de livraison à payer à l'admin + Prix des colis à payer aux commerçants
      const colisAPayer = await Colis.find({
        agence: userId,
        status: 'livre',
        fraisAgencePayes: { $ne: true }
      });
      const fraisAdmin = colisAPayer.reduce((sum, colis) => sum + (colis.fraisLivraison || 0), 0);
      
      const colisPrixAPayer = await Colis.find({
        agence: userId,
        status: 'livre',
        paye: { $ne: true }
      });
      const prixColis = colisPrixAPayer.reduce((sum, colis) => sum + (colis.montant || 0), 0);
      
      stats.aPayer = fraisAdmin + prixColis;
      
    } else if (userType === 'User' || userType === 'Admin') {
      // ADMIN
      // À RECEVOIR = Frais de livraison de tous les agents
      const tousColisLivres = await Colis.find({
        status: 'livre',
        fraisAgencePayes: { $ne: true }
      });
      stats.aRecevoir = tousColisLivres.reduce((sum, colis) => sum + (colis.fraisLivraison || 0), 0);
    }
    
    // Calculer total reçu et payé depuis les transactions validées
    const operations = await OperationFinanciere.find({
      $or: [
        { compteDebit: portefeuille._id },
        { compteCredit: portefeuille._id }
      ],
      statut: 'validee'
    });
    
    console.log('📊 Calcul statistiques pour:', {
      userId,
      userType,
      portefeuilleId: portefeuille._id,
      nombreOperationsValidees: operations.length
    });
    
    operations.forEach(op => {
      if (op.compteCredit && op.compteCredit.toString() === portefeuille._id.toString()) {
        stats.totalRecu += op.montant;
        console.log('  ➕ Crédit:', op.montant, 'DA');
      }
      if (op.compteDebit && op.compteDebit.toString() === portefeuille._id.toString()) {
        stats.totalPaye += op.montant;
        console.log('  ➖ Débit:', op.montant, 'DA');
      }
    });
    
    console.log('✅ Stats finales:', stats);
    
    res.json({
      success: true,
      statistiques: stats
    });
    
  } catch (error) {
    console.error('❌ Erreur obtenirStatistiques:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur', 
      error: error.message 
    });
  }
};

// ============================================
// 3. OBTENIR L'HISTORIQUE DES OPÉRATIONS
// ============================================
exports.obtenirOperations = async (req, res) => {
  try {
    const { userId, userType, limit = 50 } = req.body;
    
    // Obtenir le portefeuille
    const portefeuille = await Portefeuille.findOne({
      proprietaireId: userId,
      typeProprietaire: userType
    });
    
    if (!portefeuille) {
      return res.status(404).json({ 
        success: false, 
        message: 'Portefeuille introuvable' 
      });
    }
    
    // Rechercher les opérations
    const operations = await OperationFinanciere.find({
      $or: [
        { compteDebit: portefeuille._id },
        { compteCredit: portefeuille._id }
      ]
    })
    .populate('compteDebit', 'nomProprietaire')
    .populate('compteCredit', 'nomProprietaire')
    .populate('effectuePar', 'nom')
    .sort({ dateOperation: -1 })
    .limit(parseInt(limit));
    
    // Formater les données
    const operationsFormatees = operations.map(op => {
      const estCredit = op.compteCredit && op.compteCredit._id.toString() === portefeuille._id.toString();
      
      return {
        id: op._id,
        type: op.typeOperation,
        montant: op.montant,
        sens: estCredit ? 'credit' : 'debit',
        description: op.description,
        codeColis: op.codeColis,
        methodePaiement: op.methodePaiement,
        statut: op.statut,
        date: op.dateOperation,
        effectuePar: op.effectuePar ? op.effectuePar.nom : 'Automatique',
        notes: op.notes
      };
    });
    
    res.json({
      success: true,
      operations: operationsFormatees
    });
    
  } catch (error) {
    console.error('❌ Erreur obtenirOperations:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur', 
      error: error.message 
    });
  }
};

// ============================================
// 4. EFFECTUER UN VIREMENT MANUEL
// ============================================
exports.effectuerVirement = async (req, res) => {
  try {
    const { 
      compteDebitId, 
      compteCreditId, 
      montant, 
      description, 
      methodePaiement,
      effectueParId 
    } = req.body;
    
    if (!compteDebitId || !compteCreditId || !montant) {
      return res.status(400).json({ 
        success: false, 
        message: 'Données incomplètes' 
      });
    }
    
    // Créer la transaction
    const transaction = await OperationFinanciere.creerTransaction({
      typeOperation: 'virement_manuel',
      montant: parseFloat(montant),
      compteDebit: compteDebitId,
      compteCredit: compteCreditId,
      description: description || 'Virement manuel',
      methodePaiement: methodePaiement || 'virement',
      effectuePar: effectueParId,
      statut: 'validee'
    });
    
    res.json({
      success: true,
      message: 'Virement effectué avec succès',
      transaction: {
        id: transaction._id,
        montant: transaction.montant,
        description: transaction.description,
        date: transaction.dateOperation
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur effectuerVirement:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Erreur lors du virement'
    });
  }
};

// ============================================
// 5. MARQUER UN COLIS COMME PAYÉ
// ============================================
exports.marquerColisPaye = async (req, res) => {
  try {
    const { colisId, agentId } = req.body;
    
    const colis = await Colis.findById(colisId)
      .populate('expediteur.id')
      .populate('agence');
    
    if (!colis) {
      return res.status(404).json({ 
        success: false, 
        message: 'Colis introuvable' 
      });
    }
    
    if (colis.status !== 'livre') {
      return res.status(400).json({ 
        success: false, 
        message: 'Seuls les colis livrés peuvent être payés' 
      });
    }
    
    if (colis.paye) {
      return res.status(400).json({ 
        success: false, 
        message: 'Colis déjà payé' 
      });
    }
    
    // Obtenir les portefeuilles
    const portefeuilleAgence = await Portefeuille.findOne({
      proprietaireId: colis.agence._id,
      typeProprietaire: 'Agence'
    });
    
    const portefeuilleCommercant = await Portefeuille.findOne({
      proprietaireId: colis.expediteur.id._id,
      typeProprietaire: 'Commercant'
    });
    
    if (!portefeuilleAgence || !portefeuilleCommercant) {
      return res.status(404).json({ 
        success: false, 
        message: 'Portefeuilles introuvables' 
      });
    }
    
    // Créer la transaction
    const transaction = await OperationFinanciere.creerTransaction({
      typeOperation: 'paiement_livraison',
      montant: colis.prix,
      compteDebit: portefeuilleAgence._id,
      compteCredit: portefeuilleCommercant._id,
      referenceColis: colis._id,
      codeColis: colis.codeSuivi,
      description: `Paiement livraison colis ${colis.codeSuivi}`,
      effectuePar: agentId,
      statut: 'validee'
    });
    
    // Marquer le colis comme payé
    colis.paye = true;
    colis.datePaiement = new Date();
    await colis.save();
    
    res.json({
      success: true,
      message: 'Colis marqué comme payé',
      transaction: {
        id: transaction._id,
        montant: transaction.montant
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur marquerColisPaye:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur', 
      error: error.message 
    });
  }
};

// ============================================
// 6. OBTENIR TOUS LES PORTEFEUILLES (ADMIN)
// ============================================
exports.obtenirTousPortefeuilles = async (req, res) => {
  try {
    const portefeuilles = await Portefeuille.find()
      .sort({ solde: -1 });
    
    // Mettre à jour tous les soldes
    for (const p of portefeuilles) {
      await p.mettreAJourSolde();
    }
    
    res.json({
      success: true,
      portefeuilles: portefeuilles.map(p => ({
        id: p._id,
        nom: p.nomProprietaire,
        type: p.typeProprietaire,
        solde: p.solde,
        devise: p.devise,
        statut: p.statut,
        derniereMiseAJour: p.derniereMiseAJour
      }))
    });
    
  } catch (error) {
    console.error('❌ Erreur obtenirTousPortefeuilles:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur', 
      error: error.message 
    });
  }
};

// ============================================
// 7. OBTENIR TOUTES LES OPÉRATIONS (ADMIN)
// ============================================
exports.obtenirToutesOperations = async (req, res) => {
  try {
    const { limit = 100, statut, type } = req.query;
    
    const filter = {};
    if (statut) filter.statut = statut;
    if (type) filter.typeOperation = type;
    
    const operations = await OperationFinanciere.find(filter)
      .populate('compteDebit', 'nomProprietaire typeProprietaire')
      .populate('compteCredit', 'nomProprietaire typeProprietaire')
      .populate('effectuePar', 'nom')
      .sort({ dateOperation: -1 })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      operations: operations.map(op => ({
        id: op._id,
        type: op.typeOperation,
        montant: op.montant,
        debit: op.compteDebit ? {
          nom: op.compteDebit.nomProprietaire,
          type: op.compteDebit.typeProprietaire
        } : null,
        credit: op.compteCredit ? {
          nom: op.compteCredit.nomProprietaire,
          type: op.compteCredit.typeProprietaire
        } : null,
        description: op.description,
        statut: op.statut,
        date: op.dateOperation,
        effectuePar: op.effectuePar ? op.effectuePar.nom : 'Automatique'
      }))
    });
    
  } catch (error) {
    console.error('❌ Erreur obtenirToutesOperations:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur', 
      error: error.message 
    });
  }
};

// ============================================
// 8. VIREMENT COMMERÇANT → AGENT
// ============================================
exports.virementCommercantVersAgent = async (req, res) => {
  try {
    const { commercantId, agenceId, montant, description, colisIds } = req.body;
    
    if (!commercantId || !agenceId || !montant) {
      return res.status(400).json({ 
        success: false, 
        message: 'Données incomplètes' 
      });
    }
    
    // Obtenir ou créer le portefeuille du commerçant
    let portefeuilleCommercant = await Portefeuille.findOne({
      proprietaireId: commercantId,
      typeProprietaire: 'Commercant'
    });
    
    if (!portefeuilleCommercant) {
      const commercant = await User.findById(commercantId);
      portefeuilleCommercant = new Portefeuille({
        proprietaireId: commercantId,
        typeProprietaire: 'Commercant',
        nomProprietaire: commercant ? commercant.nom : 'Commerçant',
        solde: 0
      });
      await portefeuilleCommercant.save();
    }
    
    // Obtenir ou créer le portefeuille de l'agence
    let portefeuilleAgence = await Portefeuille.findOne({
      proprietaireId: agenceId,
      typeProprietaire: 'Agence'
    });
    
    if (!portefeuilleAgence) {
      const agence = await Agence.findById(agenceId);
      portefeuilleAgence = new Portefeuille({
        proprietaireId: agenceId,
        typeProprietaire: 'Agence',
        nomProprietaire: agence ? agence.nom : 'Agence',
        solde: 0
      });
      await portefeuilleAgence.save();
    }
    
    // Créer la transaction EN ATTENTE (nécessite validation de l'agent)
    const transaction = new OperationFinanciere({
      typeOperation: 'virement_manuel',
      montant: parseFloat(montant),
      compteDebit: portefeuilleCommercant._id,
      compteCredit: portefeuilleAgence._id,
      description: description || `Paiement frais de livraison et retour - ${montant} DA`,
      methodePaiement: 'virement',
      effectuePar: req.user?._id,
      statut: 'en_attente', // EN ATTENTE de validation par l'agent
      notes: colisIds ? `Colis concernés: ${colisIds.join(', ')}` : undefined
    });
    await transaction.save();
    
    res.json({
      success: true,
      message: 'Demande de virement envoyée. En attente de validation par l\'agent.',
      transaction: {
        id: transaction._id,
        montant: transaction.montant,
        description: transaction.description,
        date: transaction.dateOperation,
        statut: transaction.statut
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur virementCommercantVersAgent:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Erreur lors du virement'
    });
  }
};

// ============================================
// 9. VIREMENT AGENT → ADMIN
// ============================================
exports.virementAgentVersAdmin = async (req, res) => {
  try {
    const { agenceId, adminId, montant, description, typeFrais } = req.body;
    
    if (!agenceId || !montant) {
      return res.status(400).json({ 
        success: false, 
        message: 'Données incomplètes' 
      });
    }
    
    // Obtenir ou créer le portefeuille de l'agence
    let portefeuilleAgence = await Portefeuille.findOne({
      proprietaireId: agenceId,
      typeProprietaire: 'Agence'
    });
    
    if (!portefeuilleAgence) {
      const agence = await Agence.findById(agenceId);
      portefeuilleAgence = new Portefeuille({
        proprietaireId: agenceId,
        typeProprietaire: 'Agence',
        nomProprietaire: agence ? agence.nom : 'Agence',
        solde: 0
      });
      await portefeuilleAgence.save();
    }
    
    // Trouver ou créer le portefeuille Admin
    let portefeuilleAdmin = await Portefeuille.findOne({
      typeProprietaire: 'Admin'
    });
    
    if (!portefeuilleAdmin) {
      // Trouver un utilisateur admin existant
      let adminUser = await User.findOne({ role: 'admin' });
      
      // Si aucun admin n'existe, créer un ID générique pour l'admin
      if (!adminUser) {
        // Créer un ObjectId générique pour le portefeuille admin
        const mongoose = require('mongoose');
        adminUser = { _id: new mongoose.Types.ObjectId() };
      }
      
      // Créer le portefeuille admin
      portefeuilleAdmin = await Portefeuille.create({
        proprietaireId: adminUser._id,
        typeProprietaire: 'Admin',
        nomProprietaire: 'Administrateur Général',
        solde: 0,
        devise: 'DA'
      });
      
      console.log('✅ Portefeuille Admin créé:', {
        id: portefeuilleAdmin._id,
        proprietaireId: adminUser._id
      });
    }
    
    // Créer la transaction directement (sans vérification de solde)
    const transaction = new OperationFinanciere({
      typeOperation: typeFrais === 'livraison' ? 'paiement_agence' : 'virement_manuel',
      montant: parseFloat(montant),
      compteDebit: portefeuilleAgence._id,
      compteCredit: portefeuilleAdmin._id,
      description: description || `Virement frais de livraison - ${montant} DA`,
      methodePaiement: 'virement',
      effectuePar: req.user?._id,
      statut: 'validee',
      dateValidation: new Date()
    });
    await transaction.save();
    
    // Mettre à jour les soldes
    await portefeuilleAgence.mettreAJourSolde();
    await portefeuilleAdmin.mettreAJourSolde();
    
    res.json({
      success: true,
      message: 'Virement effectué avec succès',
      transaction: {
        id: transaction._id,
        montant: transaction.montant,
        description: transaction.description,
        date: transaction.dateOperation
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur virementAgentVersAdmin:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Erreur lors du virement'
    });
  }
};

// ===================================================
// OBTENIR LES VIREMENTS EN ATTENTE (AGENT)
// ===================================================
exports.obtenirVirementsEnAttente = async (req, res) => {
  try {
    const { agenceId } = req.body;
    
    if (!agenceId) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID agence manquant' 
      });
    }
    
    // Récupérer le portefeuille de l'agence
    const portefeuilleAgence = await Portefeuille.findOne({
      proprietaireId: agenceId,
      typeProprietaire: 'Agence'
    });
    
    if (!portefeuilleAgence) {
      return res.json({
        success: true,
        virements: []
      });
    }
    
    // Récupérer les virements en attente vers cette agence
    const virements = await OperationFinanciere.find({
      compteCredit: portefeuilleAgence._id,
      statut: 'en_attente',
      typeOperation: 'virement_manuel'
    })
    .populate('compteDebit', 'nomProprietaire proprietaireId')
    .sort({ dateOperation: -1 });
    
    // Enrichir avec les infos du commerçant
    const virementsEnrichis = await Promise.all(
      virements.map(async (virement) => {
        const commercant = await User.findById(virement.compteDebit.proprietaireId);
        return {
          id: virement._id,
          montant: virement.montant,
          description: virement.description,
          date: virement.dateOperation,
          commercant: {
            id: commercant?._id,
            nom: commercant?.nom || virement.compteDebit.nomProprietaire,
            telephone: commercant?.telephone
          }
        };
      })
    );
    
    res.json({
      success: true,
      virements: virementsEnrichis
    });
    
  } catch (error) {
    console.error('❌ Erreur obtenirVirementsEnAttente:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Erreur lors de la récupération'
    });
  }
};

// ===================================================
// VALIDER UN VIREMENT COMMERCANT → AGENT
// ===================================================
exports.validerVirementCommercant = async (req, res) => {
  try {
    const { transactionId } = req.body;
    
    if (!transactionId) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID de transaction manquant' 
      });
    }
    
    // Récupérer la transaction
    const transaction = await OperationFinanciere.findById(transactionId)
      .populate('compteDebit')
      .populate('compteCredit');
    
    if (!transaction) {
      return res.status(404).json({ 
        success: false, 
        message: 'Transaction introuvable' 
      });
    }
    
    if (transaction.statut !== 'en_attente') {
      return res.status(400).json({ 
        success: false, 
        message: `Transaction déjà ${transaction.statut}` 
      });
    }
    
    // Valider la transaction (met à jour les soldes automatiquement)
    console.log('🔄 Avant validation - Transaction:', {
      id: transaction._id,
      statut: transaction.statut,
      montant: transaction.montant,
      compteDebitId: transaction.compteDebit?._id,
      compteCreditId: transaction.compteCredit?._id
    });
    
    await transaction.valider();
    
    console.log('✅ Après validation - Transaction:', {
      id: transaction._id,
      statut: transaction.statut,
      dateValidation: transaction.dateValidation
    });
    
    // Vérifier les soldes mis à jour
    const Portefeuille = require('../models/Portefeuille');
    const compteDebitApres = await Portefeuille.findById(transaction.compteDebit);
    const compteCreditApres = await Portefeuille.findById(transaction.compteCredit);
    
    console.log('💰 Soldes après validation:', {
      compteDebit: { id: compteDebitApres._id, solde: compteDebitApres.solde },
      compteCredit: { id: compteCreditApres._id, solde: compteCreditApres.solde }
    });
    
    // Extraire le commercantId depuis le compte débit
    const commercantId = transaction.compteDebit.proprietaireId;
    
    // IMPORTANT: Marquer automatiquement les colis retournés comme payés
    const colisRetourNonPayes = await Colis.find({
      'expediteur.id': commercantId,
      status: { $in: ['retourne', 'en_retour'] },
      fraisRetourPayes: { $ne: true }
    }).sort({ createdAt: 1 }); // Les plus anciens en premier
    
    let montantRestant = parseFloat(transaction.montant);
    const colisAMarquer = [];
    
    // Marquer les colis jusqu'à épuiser le montant payé
    for (const colis of colisRetourNonPayes) {
      if (montantRestant <= 0) break;
      
      const fraisRetour = colis.fraisRetour || 200;
      if (montantRestant >= fraisRetour) {
        colisAMarquer.push(colis._id);
        montantRestant -= fraisRetour;
      }
    }
    
    // Marquer les colis sélectionnés comme payés
    if (colisAMarquer.length > 0) {
      await Colis.updateMany(
        { _id: { $in: colisAMarquer } },
        { 
          $set: { 
            fraisRetourPayes: true, 
            datePaiementFraisRetour: new Date() 
          } 
        }
      );
    }
    
    res.json({
      success: true,
      message: `Virement validé avec succès. ${colisAMarquer.length} colis marqués comme payés.`,
      transaction: {
        id: transaction._id,
        montant: transaction.montant,
        description: transaction.description,
        date: transaction.dateOperation,
        statut: transaction.statut
      },
      colisPayes: colisAMarquer.length,
      montantRestant: montantRestant
    });
    
  } catch (error) {
    console.error('❌ Erreur validerVirementCommercant:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Erreur lors de la validation'
    });
  }
};

// ===================================================
// REFUSER UN VIREMENT COMMERCANT → AGENT
// ===================================================
exports.refuserVirementCommercant = async (req, res) => {
  try {
    const { transactionId, raison } = req.body;
    
    if (!transactionId) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID de transaction manquant' 
      });
    }
    
    // Récupérer la transaction
    const transaction = await OperationFinanciere.findById(transactionId);
    
    if (!transaction) {
      return res.status(404).json({ 
        success: false, 
        message: 'Transaction introuvable' 
      });
    }
    
    if (transaction.statut !== 'en_attente') {
      return res.status(400).json({ 
        success: false, 
        message: `Transaction déjà ${transaction.statut}` 
      });
    }
    
    // Annuler la transaction
    await transaction.annuler(raison || 'Refusé par l\'agent');
    
    res.json({
      success: true,
      message: 'Virement refusé',
      transaction: {
        id: transaction._id,
        statut: transaction.statut
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur refuserVirementCommercant:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Erreur lors du refus'
    });
  }
};

module.exports = exports;
