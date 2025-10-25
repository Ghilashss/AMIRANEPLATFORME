const Compte = require('../models/Compte');
const TransactionFinanciere = require('../models/TransactionFinanciere');
const User = require('../models/User');
const Colis = require('../models/Colis');

/**
 * @desc    Obtenir le solde et les transactions d'un compte
 * @route   GET /api/caisse/compte/:userId
 * @access  Private
 */
exports.getCompte = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Vérifier que l'utilisateur a le droit de voir ce compte
    if (req.user.role !== 'admin' && req.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé'
      });
    }
    
    // Récupérer le compte
    let compte = await Compte.findOne({ user: userId }).populate('user', 'nom prenom email role');
    
    // Créer le compte s'il n'existe pas
    if (!compte) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }
      
      compte = await Compte.create({
        user: userId,
        typeCompte: user.role,
        nom: `${user.nom} ${user.prenom || ''}`.trim(),
        solde: 0
      });
      
      await compte.populate('user', 'nom prenom email role');
    }
    
    // Recalculer le solde
    await compte.recalculerSolde();
    
    // Récupérer les dernières transactions
    const transactions = await TransactionFinanciere.find({
      $or: [
        { debit_id: compte._id },
        { credit_id: compte._id }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('debit_id', 'nom typeCompte')
    .populate('credit_id', 'nom typeCompte')
    .populate('referenceColis', 'tracking status');
    
    res.json({
      success: true,
      data: {
        compte,
        transactions
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur getCompte:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

/**
 * @desc    Obtenir les statistiques de caisse
 * @route   GET /api/caisse/stats/:userId
 * @access  Private
 */
exports.getStatsCaisse = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Vérifier permissions
    if (req.user.role !== 'admin' && req.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé'
      });
    }
    
    const compte = await Compte.findOne({ user: userId });
    if (!compte) {
      return res.status(404).json({
        success: false,
        message: 'Compte non trouvé'
      });
    }
    
    // Statistiques des transactions
    const [
      transactionsEnAttente,
      transactionsValidees,
      transactionsRefusees,
      aRecevoir,
      aPayer
    ] = await Promise.all([
      // Transactions en attente
      TransactionFinanciere.countDocuments({
        $or: [{ debit_id: compte._id }, { credit_id: compte._id }],
        statut: 'en_attente'
      }),
      
      // Transactions validées
      TransactionFinanciere.countDocuments({
        $or: [{ debit_id: compte._id }, { credit_id: compte._id }],
        statut: 'validee'
      }),
      
      // Transactions refusées
      TransactionFinanciere.countDocuments({
        $or: [{ debit_id: compte._id }, { credit_id: compte._id }],
        statut: 'refusee'
      }),
      
      // Montant à recevoir (crédits en attente)
      TransactionFinanciere.aggregate([
        {
          $match: {
            credit_id: compte._id,
            statut: 'en_attente'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$montant' }
          }
        }
      ]),
      
      // Montant à payer (débits en attente)
      TransactionFinanciere.aggregate([
        {
          $match: {
            debit_id: compte._id,
            statut: 'en_attente'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$montant' }
          }
        }
      ])
    ]);
    
    res.json({
      success: true,
      data: {
        soldeActuel: compte.solde,
        totalCredits: compte.totalCredits,
        totalDebits: compte.totalDebits,
        transactionsEnAttente,
        transactionsValidees,
        transactionsRefusees,
        montantARecevoir: aRecevoir[0]?.total || 0,
        montantAPayer: aPayer[0]?.total || 0
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur getStatsCaisse:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

/**
 * @desc    Créer une transaction manuelle (virement)
 * @route   POST /api/caisse/transaction
 * @access  Private (Admin ou propriétaire du compte)
 */
exports.creerTransaction = async (req, res) => {
  try {
    const {
      typeTransaction,
      montant,
      debitUserId,
      creditUserId,
      description,
      methode
    } = req.body;
    
    // Validation
    if (!montant || montant <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Le montant doit être supérieur à 0'
      });
    }
    
    // Trouver les comptes
    const compteDebit = debitUserId ? await Compte.findOne({ user: debitUserId }) : null;
    const compteCredit = creditUserId ? await Compte.findOne({ user: creditUserId }) : null;
    
    if (typeTransaction !== 'recharge_compte' && !compteDebit) {
      return res.status(404).json({
        success: false,
        message: 'Compte débiteur non trouvé'
      });
    }
    
    if (typeTransaction !== 'retrait_compte' && !compteCredit) {
      return res.status(404).json({
        success: false,
        message: 'Compte créditeur non trouvé'
      });
    }
    
    // Vérifier les permissions
    const isAdmin = req.user.role === 'admin';
    const isProprietaire = debitUserId === req.user._id.toString();
    
    if (!isAdmin && !isProprietaire) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'avez pas les droits pour effectuer cette transaction'
      });
    }
    
    // Créer la transaction
    const transaction = await TransactionFinanciere.create({
      typeTransaction: typeTransaction || 'virement_manuel',
      montant,
      debit_id: compteDebit?._id,
      debit_nom: compteDebit?.nom,
      credit_id: compteCredit?._id,
      credit_nom: compteCredit?.nom,
      description: description || `Virement de ${montant} DA`,
      methode: methode || 'manuel',
      statut: isAdmin ? 'validee' : 'en_attente'
    });
    
    await transaction.populate('debit_id', 'nom typeCompte');
    await transaction.populate('credit_id', 'nom typeCompte');
    
    res.status(201).json({
      success: true,
      message: isAdmin ? 'Transaction créée et validée' : 'Transaction créée (en attente de validation)',
      data: transaction
    });
    
  } catch (error) {
    console.error('❌ Erreur creerTransaction:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la transaction',
      error: error.message
    });
  }
};

/**
 * @desc    Valider une transaction
 * @route   PUT /api/caisse/transaction/:id/valider
 * @access  Private (Admin)
 */
exports.validerTransaction = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Seul l\'admin peut valider une transaction'
      });
    }
    
    const transaction = await TransactionFinanciere.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction non trouvée'
      });
    }
    
    if (transaction.statut !== 'en_attente') {
      return res.status(400).json({
        success: false,
        message: 'Cette transaction a déjà été traitée'
      });
    }
    
    transaction.statut = 'validee';
    transaction.validePar = req.user._id;
    transaction.dateValidation = new Date();
    
    await transaction.save();
    
    await transaction.populate('debit_id', 'nom typeCompte');
    await transaction.populate('credit_id', 'nom typeCompte');
    
    res.json({
      success: true,
      message: 'Transaction validée avec succès',
      data: transaction
    });
    
  } catch (error) {
    console.error('❌ Erreur validerTransaction:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la validation',
      error: error.message
    });
  }
};

/**
 * @desc    Refuser une transaction
 * @route   PUT /api/caisse/transaction/:id/refuser
 * @access  Private (Admin)
 */
exports.refuserTransaction = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Seul l\'admin peut refuser une transaction'
      });
    }
    
    const { motifRefus } = req.body;
    const transaction = await TransactionFinanciere.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction non trouvée'
      });
    }
    
    if (transaction.statut !== 'en_attente') {
      return res.status(400).json({
        success: false,
        message: 'Cette transaction a déjà été traitée'
      });
    }
    
    transaction.statut = 'refusee';
    transaction.motifRefus = motifRefus || 'Refusé par l\'administrateur';
    transaction.validePar = req.user._id;
    transaction.dateValidation = new Date();
    
    await transaction.save();
    
    await transaction.populate('debit_id', 'nom typeCompte');
    await transaction.populate('credit_id', 'nom typeCompte');
    
    res.json({
      success: false,
      message: 'Transaction refusée',
      data: transaction
    });
    
  } catch (error) {
    console.error('❌ Erreur refuserTransaction:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du refus',
      error: error.message
    });
  }
};

/**
 * @desc    Obtenir toutes les transactions (Admin)
 * @route   GET /api/caisse/transactions
 * @access  Private (Admin)
 */
exports.getAllTransactions = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé'
      });
    }
    
    const { statut, type, limit = 100, page = 1 } = req.query;
    
    const query = {};
    if (statut) query.statut = statut;
    if (type) query.typeTransaction = type;
    
    const skip = (page - 1) * limit;
    
    const [transactions, total] = await Promise.all([
      TransactionFinanciere.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip)
        .populate('debit_id', 'nom typeCompte')
        .populate('credit_id', 'nom typeCompte')
        .populate('referenceColis', 'tracking status'),
      TransactionFinanciere.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      count: transactions.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: transactions
    });
    
  } catch (error) {
    console.error('❌ Erreur getAllTransactions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

module.exports = exports;
