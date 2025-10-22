const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Colis = require('../models/Colis');

// @desc    Verser une somme (Agent)
// @route   POST /api/caisse/verser
// @access  Private (Agent)
exports.verserSomme = async (req, res) => {
  try {
    const { montant, methodePaiement, referencePaiement, description } = req.body;

    // Validation
    if (!montant || montant <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Le montant doit être supérieur à 0'
      });
    }

    // Créer la transaction de versement
    const transaction = await Transaction.create({
      type: 'versement',
      montant,
      utilisateur: req.user.id,
      agence: req.user.agence,
      methodePaiement: methodePaiement || 'especes',
      referencePaiement,
      description: description || `Versement de ${montant} DA`,
      status: 'en_attente'
    });

    // Peupler les données
    await transaction.populate('utilisateur', 'nom prenom email');
    await transaction.populate('agence', 'nom ville');

    res.status(201).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    console.error('Erreur lors du versement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du versement',
      error: error.message
    });
  }
};

// @desc    Obtenir tous les versements (Admin)
// @route   GET /api/caisse/versements
// @access  Private (Admin)
exports.getVersements = async (req, res) => {
  try {
    const { status, agence, dateDebut, dateFin } = req.query;

    let query = { type: 'versement' };

    if (status) {
      query.status = status;
    }

    if (agence) {
      query.agence = agence;
    }

    if (dateDebut && dateFin) {
      query.createdAt = {
        $gte: new Date(dateDebut),
        $lte: new Date(dateFin)
      };
    }

    const versements = await Transaction.find(query)
      .populate('utilisateur', 'nom prenom email role')
      .populate('agence', 'nom ville adresse')
      .sort({ createdAt: -1 });

    // Calculer les statistiques
    const stats = {
      total: versements.length,
      enAttente: versements.filter(v => v.status === 'en_attente').length,
      valides: versements.filter(v => v.status === 'validee').length,
      refuses: versements.filter(v => v.status === 'annulee').length,
      montantTotal: versements
        .filter(v => v.status === 'validee')
        .reduce((sum, v) => sum + v.montant, 0),
      montantEnAttente: versements
        .filter(v => v.status === 'en_attente')
        .reduce((sum, v) => sum + v.montant, 0)
    };

    res.json({
      success: true,
      count: versements.length,
      stats,
      data: versements
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des versements:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des versements',
      error: error.message
    });
  }
};

// @desc    Obtenir les versements en attente (Admin)
// @route   GET /api/caisse/versements/en-attente
// @access  Private (Admin)
exports.getVersementsEnAttente = async (req, res) => {
  try {
    const versements = await Transaction.find({
      type: 'versement',
      status: 'en_attente'
    })
      .populate('utilisateur', 'nom prenom email role')
      .populate('agence', 'nom ville')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: versements.length,
      data: versements
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des versements en attente',
      error: error.message
    });
  }
};

// @desc    Valider un versement (Admin)
// @route   PUT /api/caisse/versements/:id/valider
// @access  Private (Admin)
exports.validerVersement = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Versement non trouvé'
      });
    }

    if (transaction.type !== 'versement') {
      return res.status(400).json({
        success: false,
        message: 'Cette transaction n\'est pas un versement'
      });
    }

    if (transaction.status !== 'en_attente') {
      return res.status(400).json({
        success: false,
        message: 'Ce versement a déjà été traité'
      });
    }

    transaction.status = 'validee';
    await transaction.save();

    await transaction.populate('utilisateur', 'nom prenom email');
    await transaction.populate('agence', 'nom ville');

    res.json({
      success: true,
      message: 'Versement validé avec succès',
      data: transaction
    });
  } catch (error) {
    console.error('Erreur lors de la validation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la validation du versement',
      error: error.message
    });
  }
};

// @desc    Refuser un versement (Admin)
// @route   PUT /api/caisse/versements/:id/refuser
// @access  Private (Admin)
exports.refuserVersement = async (req, res) => {
  try {
    const { motif } = req.body;
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Versement non trouvé'
      });
    }

    if (transaction.type !== 'versement') {
      return res.status(400).json({
        success: false,
        message: 'Cette transaction n\'est pas un versement'
      });
    }

    if (transaction.status !== 'en_attente') {
      return res.status(400).json({
        success: false,
        message: 'Ce versement a déjà été traité'
      });
    }

    transaction.status = 'annulee';
    if (motif) {
      transaction.description = `${transaction.description} - Refusé: ${motif}`;
    }
    await transaction.save();

    await transaction.populate('utilisateur', 'nom prenom email');
    await transaction.populate('agence', 'nom ville');

    res.json({
      success: true,
      message: 'Versement refusé',
      data: transaction
    });
  } catch (error) {
    console.error('Erreur lors du refus:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du refus du versement',
      error: error.message
    });
  }
};

// @desc    Obtenir le solde de caisse (Agent)
// @route   GET /api/caisse/solde
// @access  Private (Agent)
exports.getSoldeCaisse = async (req, res) => {
  try {
    // Récupérer tous les colis livrés de l'agent
    const colisLivres = await Colis.find({
      agence: req.user.agence,
      status: 'livre'
    });

    // Calculer le total à collecter
    const totalACollecter = colisLivres.reduce((sum, colis) => {
      return sum + (colis.montant || 0) + (colis.fraisLivraison || 0);
    }, 0);

    // Récupérer tous les versements validés
    const versementsValides = await Transaction.find({
      utilisateur: req.user.id,
      type: 'versement',
      status: 'validee'
    });

    const totalVerse = versementsValides.reduce((sum, v) => sum + v.montant, 0);

    // Versements en attente
    const versementsEnAttente = await Transaction.find({
      utilisateur: req.user.id,
      type: 'versement',
      status: 'en_attente'
    });

    const totalEnAttente = versementsEnAttente.reduce((sum, v) => sum + v.montant, 0);

    // Calculer le solde
    const solde = totalACollecter - totalVerse;

    res.json({
      success: true,
      data: {
        totalACollecter,
        totalVerse,
        totalEnAttente,
        solde,
        colisLivresCount: colisLivres.length
      }
    });
  } catch (error) {
    console.error('Erreur lors du calcul du solde:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du calcul du solde',
      error: error.message
    });
  }
};

// @desc    Obtenir l'historique de caisse (Agent)
// @route   GET /api/caisse/historique
// @access  Private (Agent)
exports.getHistoriqueCaisse = async (req, res) => {
  try {
    const { dateDebut, dateFin, status } = req.query;

    let query = {
      utilisateur: req.user.id,
      type: 'versement'
    };

    if (status) {
      query.status = status;
    }

    if (dateDebut && dateFin) {
      query.createdAt = {
        $gte: new Date(dateDebut),
        $lte: new Date(dateFin)
      };
    }

    const transactions = await Transaction.find(query)
      .populate('agence', 'nom ville')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'historique',
      error: error.message
    });
  }
};

// @desc    Obtenir la caisse d'un agent (Admin)
// @route   GET /api/caisse/agent/:agentId
// @access  Private (Admin)
exports.getCaisseAgent = async (req, res) => {
  try {
    const agent = await User.findById(req.params.agentId);

    if (!agent) {
      return res.status(404).json({
        success: false,
        message: 'Agent non trouvé'
      });
    }

    // Récupérer tous les colis livrés de l'agent
    const colisLivres = await Colis.find({
      agence: agent.agence,
      status: 'livre'
    });

    const totalACollecter = colisLivres.reduce((sum, colis) => {
      return sum + (colis.montant || 0) + (colis.fraisLivraison || 0);
    }, 0);

    // Versements
    const versementsValides = await Transaction.find({
      utilisateur: agent._id,
      type: 'versement',
      status: 'validee'
    });

    const versementsEnAttente = await Transaction.find({
      utilisateur: agent._id,
      type: 'versement',
      status: 'en_attente'
    });

    const totalVerse = versementsValides.reduce((sum, v) => sum + v.montant, 0);
    const totalEnAttente = versementsEnAttente.reduce((sum, v) => sum + v.montant, 0);

    const solde = totalACollecter - totalVerse;

    res.json({
      success: true,
      data: {
        agent: {
          id: agent._id,
          nom: agent.nom,
          prenom: agent.prenom,
          email: agent.email
        },
        totalACollecter,
        totalVerse,
        totalEnAttente,
        solde,
        colisLivresCount: colisLivres.length,
        versements: [...versementsValides, ...versementsEnAttente].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        )
      }
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la caisse de l\'agent',
      error: error.message
    });
  }
};
