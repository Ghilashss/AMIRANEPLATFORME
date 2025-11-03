// ===================================================
// CONTROLLER PAIEMENT ADMIN (Agent → Admin - Frais Livraison)
// ===================================================

const Colis = require('../models/Colis');
const OperationFinanciere = require('../models/OperationFinanciere');
const Portefeuille = require('../models/Portefeuille');

// GET /api/paiement-admin/frais-en-attente
// Obtenir la liste des colis livrés dont les frais ne sont pas encore versés à l'admin
exports.getFraisEnAttente = async (req, res) => {
  try {
    const agentId = req.user.id;
    
    console.log(`📋 Agent ${agentId} demande les frais en attente...`);
    
    // Trouver tous les colis livrés par cet agent dont les frais ne sont pas encore payés
    const colis = await Colis.find({
      agentLivraisonId: agentId,
      statut: 'livre',
      fraisLivraisonVerseAdmin: { $ne: true } // Pas encore versé
    })
    .populate('commercantId', 'nom prenom')
    .lean();
    
    console.log(`✅ ${colis.length} colis avec frais en attente trouvés`);
    
    // Calculer le total des frais
    const totalFrais = colis.reduce((sum, c) => sum + (c.fraisLivraison || 0), 0);
    
    // Calculer le total déjà versé (historique)
    const operationsValidees = await OperationFinanciere.find({
      compteDebit: agentId,
      typeOperation: 'paiement_frais_admin',
      statut: 'validee'
    }).lean();
    
    const totalVerse = operationsValidees.reduce((sum, op) => sum + (op.montant || 0), 0);
    
    // Formater les données pour l'affichage
    const colisFormates = colis.map(c => ({
      _id: c._id,
      codeSuivi: c.codeSuivi,
      commercantNom: c.commercantId ? `${c.commercantId.nom} ${c.commercantId.prenom}`.trim() : 'Inconnu',
      wilayaDest: c.wilayaDest,
      montant: c.montant,
      fraisLivraison: c.fraisLivraison,
      dateLivraison: c.dateLivraison
    }));
    
    res.json({
      success: true,
      colis: colisFormates,
      statistiques: {
        totalFrais,
        nombreColis: colis.length,
        totalVerse
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur getFraisEnAttente:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du chargement des frais'
    });
  }
};

// POST /api/paiement-admin/verser
// Créer une opération financière pour le versement des frais à l'admin
exports.verserFraisAdmin = async (req, res) => {
  try {
    const agentId = req.user.id;
    const { montantFrais, nombreColis } = req.body;
    
    console.log(`💸 Agent ${agentId} demande versement de ${montantFrais} DA (${nombreColis} colis)`);
    
    // Vérification
    if (!montantFrais || montantFrais <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Montant invalide'
      });
    }
    
    // Trouver les portefeuilles
    const portefeuilleAgent = await Portefeuille.findOne({
      typeProprietaire: 'Agent',
      proprietaireId: agentId
    });
    
    if (!portefeuilleAgent) {
      return res.status(404).json({
        success: false,
        message: 'Portefeuille agent introuvable'
      });
    }
    
    // Trouver le portefeuille admin (premier user avec role admin)
    const User = require('../models/User');
    const admin = await User.findOne({ role: 'admin' });
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Administrateur introuvable'
      });
    }
    
    const portefeuilleAdmin = await Portefeuille.findOne({
      typeProprietaire: 'User',
      proprietaireId: admin._id
    });
    
    if (!portefeuilleAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Portefeuille admin introuvable'
      });
    }
    
    // Vérifier le solde de l'agent
    if (portefeuilleAgent.solde < montantFrais) {
      return res.status(400).json({
        success: false,
        message: `Solde insuffisant (Disponible: ${portefeuilleAgent.solde} DA)`
      });
    }
    
    // Créer l'opération financière (en attente de validation admin)
    const operation = new OperationFinanciere({
      compteDebit: agentId,
      compteCredit: admin._id,
      montant: montantFrais,
      typeOperation: 'paiement_frais_admin',
      statut: 'en_attente',
      description: `Frais de livraison - ${nombreColis} colis`,
      metadata: {
        nombreColis,
        typeVirement: 'frais_livraison'
      }
    });
    
    await operation.save();
    
    console.log(`✅ Opération créée: ${operation._id} - ${montantFrais} DA en attente de validation`);
    
    res.json({
      success: true,
      message: 'Demande de versement créée',
      operation: {
        id: operation._id,
        montant: montantFrais,
        statut: operation.statut,
        nombreColis
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur verserFraisAdmin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du versement'
    });
  }
};

module.exports = {
  getFraisEnAttente,
  verserFraisAdmin
};
