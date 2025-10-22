const Transaction = require('../models/Transaction');
const Caisse = require('../models/Caisse');
const User = require('../models/User');
const Colis = require('../models/Colis');

// Créer une transaction
exports.createTransaction = async (req, res) => {
  try {
    console.log('📥 Requête création transaction reçue');
    console.log('Body:', JSON.stringify(req.body, null, 2));
    
    const {
      type,
      montant,
      destinataireId,
      emetteur,
      destinataire,
      methodePaiement,
      referencePaiement,
      description,
      metadata
    } = req.body;

    // Validation
    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'Le type de transaction est requis'
      });
    }

    if (!montant || montant <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Montant invalide'
      });
    }

    // Récupérer les infos de l'émetteur
    let emetteurData;
    if (emetteur && emetteur.id) {
      // Si emetteur est fourni dans le body (depuis le frontend)
      console.log('✅ Émetteur fourni:', emetteur);
      emetteurData = emetteur;
    } else {
      // Sinon utiliser l'utilisateur connecté
      console.log('🔍 Recherche émetteur par ID:', req.user._id);
      const emetteurUser = await User.findById(req.user._id);
      if (!emetteurUser) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur émetteur non trouvé'
        });
      }
      emetteurData = {
        id: emetteurUser._id,
        nom: emetteurUser.nom,
        email: emetteurUser.email,
        role: emetteurUser.role
      };
    }
    
    // Récupérer les infos du destinataire
    let destinataireData = null;
    if (destinataire && destinataire.id) {
      // Si destinataire est fourni dans le body (depuis le frontend)
      console.log('✅ Destinataire fourni:', destinataire);
      destinataireData = destinataire;
    } else if (destinataireId) {
      // Sinon chercher par ID
      console.log('🔍 Recherche destinataire par ID:', destinataireId);
      const destinataireUser = await User.findById(destinataireId);
      if (destinataireUser) {
        destinataireData = {
          id: destinataireUser._id,
          nom: destinataireUser.nom,
          email: destinataireUser.email,
          role: destinataireUser.role
        };
      }
    }

    console.log('📝 Création transaction avec:');
    console.log('  - Type:', type);
    console.log('  - Montant:', montant);
    console.log('  - Émetteur:', emetteurData);
    console.log('  - Destinataire:', destinataireData);

    // Générer un numéro de transaction unique
    const count = await Transaction.countDocuments();
    const numeroTransaction = `TRX${Date.now()}${String(count + 1).padStart(4, '0')}`;
    console.log('🔢 Numéro de transaction généré:', numeroTransaction);

    // Créer la transaction
    const transaction = new Transaction({
      numeroTransaction,
      type,
      montant,
      emetteur: emetteurData,
      destinataire: destinataireData,
      methodePaiement: methodePaiement || 'especes',
      referencePaiement,
      description,
      metadata
    });

    console.log('💾 Sauvegarde de la transaction...');
    await transaction.save();
    console.log('✅ Transaction sauvegardée:', transaction._id);

    // Mettre à jour la caisse de l'émetteur si c'est un versement
    if (type === 'versement_agent_admin' || type === 'versement_commercant_admin') {
      console.log('💰 Mise à jour de la caisse...');
      let caisseEmetteur = await Caisse.findOne({ user: emetteurData.id });
      if (!caisseEmetteur) {
        console.log('⚠️  Caisse non trouvée, création...');
        caisseEmetteur = new Caisse({
          user: emetteurData.id,
          role: emetteurData.role
        });
      }
      
      caisseEmetteur.totalEnAttente += montant;
      await caisseEmetteur.save();
      console.log('✅ Caisse mise à jour');
    }

    res.status(201).json({
      success: true,
      message: 'Transaction créée avec succès',
      data: transaction
    });
  } catch (error) {
    console.error('❌ Erreur création transaction:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la transaction',
      error: error.message,
      details: error.toString()
    });
  }
};

// Obtenir toutes les transactions
exports.getTransactions = async (req, res) => {
  try {
    const { statut, type, dateDebut, dateFin } = req.query;
    const role = req.user.role;
    
    let query = {};

    // Filtrer selon le rôle
    if (role === 'agent') {
      query.$or = [
        { 'emetteur.id': req.user._id },
        { 'destinataire.id': req.user._id }
      ];
    } else if (role === 'commercant') {
      query.$or = [
        { 'emetteur.id': req.user._id },
        { 'destinataire.id': req.user._id }
      ];
    }
    // Admin peut tout voir

    if (statut) query.statut = statut;
    if (type) query.type = type;
    
    if (dateDebut || dateFin) {
      query.dateTransaction = {};
      if (dateDebut) query.dateTransaction.$gte = new Date(dateDebut);
      if (dateFin) query.dateTransaction.$lte = new Date(dateFin);
    }

    const transactions = await Transaction.find(query)
      .sort({ dateTransaction: -1 })
      .limit(500);

    res.json({
      success: true,
      data: transactions,
      count: transactions.length
    });
  } catch (error) {
    console.error('Erreur récupération transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des transactions',
      error: error.message
    });
  }
};

// Valider une transaction (Admin seulement)
exports.validerTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut, motifRefus } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Réservé aux administrateurs.'
      });
    }

    const transaction = await Transaction.findById(id);
    
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

    transaction.statut = statut;
    transaction.dateValidation = new Date();
    transaction.validePar = req.user._id;
    
    if (statut === 'refusee' && motifRefus) {
      transaction.motifRefus = motifRefus;
    }

    await transaction.save();

    // Mettre à jour les caisses si validée
    if (statut === 'validee') {
      // Caisse émetteur
      const caisseEmetteur = await Caisse.findOne({ user: transaction.emetteur.id });
      if (caisseEmetteur) {
        caisseEmetteur.totalEnAttente -= transaction.montant;
        caisseEmetteur.totalVerse += transaction.montant;
        caisseEmetteur.soldeActuel -= transaction.montant;
        caisseEmetteur.ajouterTransaction(
          -transaction.montant,
          `Versement validé - ${transaction.numeroTransaction}`
        );
        await caisseEmetteur.save();
      }

      // Caisse destinataire
      if (transaction.destinataire && transaction.destinataire.id) {
        let caisseDestinataire = await Caisse.findOne({ user: transaction.destinataire.id });
        if (!caisseDestinataire) {
          caisseDestinataire = new Caisse({
            user: transaction.destinataire.id,
            role: transaction.destinataire.role
          });
        }
        caisseDestinataire.soldeActuel += transaction.montant;
        caisseDestinataire.totalRecuAdmin += transaction.montant;
        caisseDestinataire.ajouterTransaction(
          transaction.montant,
          `Réception validée - ${transaction.numeroTransaction}`
        );
        await caisseDestinataire.save();
      }
    } else if (statut === 'refusee') {
      // Remettre le montant en attente à 0
      const caisseEmetteur = await Caisse.findOne({ user: transaction.emetteur.id });
      if (caisseEmetteur) {
        caisseEmetteur.totalEnAttente -= transaction.montant;
        await caisseEmetteur.save();
      }
    }

    res.json({
      success: true,
      message: `Transaction ${statut === 'validee' ? 'validée' : 'refusée'} avec succès`,
      data: transaction
    });
  } catch (error) {
    console.error('Erreur validation transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la validation de la transaction',
      error: error.message
    });
  }
};

// Obtenir le solde de caisse
exports.getSoldeCaisse = async (req, res) => {
  try {
    let userId = req.user._id;
    
    // Admin peut consulter la caisse d'un agent spécifique
    if (req.user.role === 'admin' && req.query.userId) {
      userId = req.query.userId;
    }

    let caisse = await Caisse.findOne({ user: userId }).populate('user', 'nom email role');
    
    if (!caisse) {
      // Créer une nouvelle caisse si elle n'existe pas
      caisse = new Caisse({
        user: userId,
        role: req.user.role
      });
      await caisse.save();
      await caisse.populate('user', 'nom email role');
    }

    // Calculer les statistiques en temps réel depuis les colis
    if (req.user.role === 'agent' || (req.user.role === 'admin' && req.query.userId)) {
      const colis = await Colis.find({
        $or: [
          { agence: req.user.agence },
          { 'expediteur.id': userId }
        ]
      });

      let fraisLivraison = 0;
      let fraisRetour = 0;
      let montantColis = 0;

      colis.forEach(c => {
        if (c.statut === 'livre') {
          fraisLivraison += c.fraisLivraison || 0;
          montantColis += c.montant || 0;
        }
        if (c.statut === 'retour') {
          fraisRetour += c.fraisLivraison || 0;
        }
      });

      caisse.fraisLivraisonCollectes = fraisLivraison;
      caisse.fraisRetourCollectes = fraisRetour;
      caisse.montantColisCollectes = montantColis;
      caisse.totalCollecte = fraisLivraison + fraisRetour + montantColis;
      caisse.soldeActuel = caisse.totalCollecte - caisse.totalVerse;
    }

    if (req.user.role === 'commercant') {
      const colis = await Colis.find({ 'expediteur.id': userId });
      
      let montantTotal = 0;
      let fraisLivraison = 0;
      let fraisRetour = 0;

      colis.forEach(c => {
        if (c.statut === 'livre') {
          montantTotal += c.montant || 0;
          fraisLivraison += c.fraisLivraison || 0;
        }
        if (c.statut === 'retour') {
          fraisRetour += c.fraisLivraison || 0;
        }
      });

      caisse.montantColisCollectes = montantTotal;
      caisse.fraisLivraisonCollectes = fraisLivraison;
      caisse.fraisRetourCollectes = fraisRetour;
      caisse.totalRecuCommercant = montantTotal - fraisLivraison - fraisRetour;
      caisse.soldeActuel = caisse.totalRecuCommercant - caisse.totalVerse;
    }

    res.json({
      success: true,
      data: caisse
    });
  } catch (error) {
    console.error('Erreur récupération caisse:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du solde',
      error: error.message
    });
  }
};

// Obtenir les statistiques pour l'admin
exports.getStatistiquesAdmin = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé'
      });
    }

    const [
      totalTransactions,
      transactionsEnAttente,
      transactionsValidees,
      montantTotal
    ] = await Promise.all([
      Transaction.countDocuments(),
      Transaction.countDocuments({ statut: 'en_attente' }),
      Transaction.countDocuments({ statut: 'validee' }),
      Transaction.aggregate([
        { $match: { statut: 'validee' } },
        { $group: { _id: null, total: { $sum: '$montant' } } }
      ])
    ]);

    // Statistiques par agent
    const agents = await User.find({ role: 'agent' });
    const statistiquesAgents = [];

    for (const agent of agents) {
      const caisse = await Caisse.findOne({ user: agent._id });
      const transactions = await Transaction.countDocuments({
        'emetteur.id': agent._id
      });

      statistiquesAgents.push({
        agent: {
          id: agent._id,
          nom: agent.nom,
          email: agent.email
        },
        caisse: caisse || { soldeActuel: 0, totalCollecte: 0, totalVerse: 0 },
        nbTransactions: transactions
      });
    }

    res.json({
      success: true,
      data: {
        totalTransactions,
        transactionsEnAttente,
        transactionsValidees,
        montantTotal: montantTotal[0]?.total || 0,
        agents: statistiquesAgents
      }
    });
  } catch (error) {
    console.error('Erreur statistiques admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
};

// ==================== NOUVEAUX ENDPOINTS ====================

// @desc    Créer un paiement Agent → Commerçant (prix colis)
// @route   POST /api/transactions/payer-commercant
// @access  Private (Agent)
exports.payerCommercant = async (req, res) => {
  try {
    const { commercantId, montant, colis, methodePaiement, description } = req.body;

    // Validation
    if (!commercantId || !montant || montant <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Commerçant et montant requis'
      });
    }

    // Récupérer l'agent (émetteur)
    const agent = await User.findById(req.user._id);
    if (!agent || agent.role !== 'agent') {
      return res.status(403).json({
        success: false,
        message: 'Accès réservé aux agents'
      });
    }

    // Récupérer le commerçant (destinataire)
    const commercant = await User.findById(commercantId);
    if (!commercant || commercant.role !== 'commercant') {
      return res.status(404).json({
        success: false,
        message: 'Commerçant non trouvé'
      });
    }

    // Créer la transaction
    const transaction = new Transaction({
      type: 'paiement_agent_commercant',
      sousType: 'prix_colis',
      montant,
      emetteur: {
        id: agent._id,
        nom: agent.nom,
        email: agent.email,
        role: agent.role
      },
      destinataire: {
        id: commercant._id,
        nom: commercant.nom,
        email: commercant.email,
        role: commercant.role
      },
      colis: colis || [],
      methodePaiement: methodePaiement || 'especes',
      description: description || `Paiement prix colis - ${colis?.length || 0} colis`,
      statut: 'en_attente',
      metadata: {
        nbColis: colis?.length || 0,
        montantColis: montant
      }
    });

    await transaction.save();

    console.log('✅ Paiement commerçant créé:', transaction.numeroTransaction);

    res.status(201).json({
      success: true,
      message: 'Paiement créé avec succès',
      data: transaction
    });
  } catch (error) {
    console.error('❌ Erreur paiement commerçant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du paiement',
      error: error.message
    });
  }
};

// @desc    Créer un paiement Commerçant → Agent (frais retour)
// @route   POST /api/transactions/payer-frais-retour
// @access  Private (Commerçant)
exports.payerFraisRetour = async (req, res) => {
  try {
    const { agentId, montant, colisId, methodePaiement, description } = req.body;

    // Validation
    if (!agentId || !montant || montant <= 0 || !colisId) {
      return res.status(400).json({
        success: false,
        message: 'Agent, montant et colis requis'
      });
    }

    // Récupérer le commerçant (émetteur)
    const commercant = await User.findById(req.user._id);
    if (!commercant || commercant.role !== 'commercant') {
      return res.status(403).json({
        success: false,
        message: 'Accès réservé aux commerçants'
      });
    }

    // Récupérer l'agent (destinataire)
    const agent = await User.findById(agentId);
    if (!agent || agent.role !== 'agent') {
      return res.status(404).json({
        success: false,
        message: 'Agent non trouvé'
      });
    }

    // Vérifier que le colis existe et appartient au commerçant
    const colis = await Colis.findById(colisId);
    if (!colis) {
      return res.status(404).json({
        success: false,
        message: 'Colis non trouvé'
      });
    }

    if (colis.commercant?.toString() !== commercant._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Ce colis ne vous appartient pas'
      });
    }

    // Créer la transaction
    const transaction = new Transaction({
      type: 'paiement_commercant_agent',
      sousType: 'frais_retour',
      montant,
      emetteur: {
        id: commercant._id,
        nom: commercant.nom,
        email: commercant.email,
        role: commercant.role
      },
      destinataire: {
        id: agent._id,
        nom: agent.nom,
        email: agent.email,
        role: agent.role
      },
      colis: [colisId],
      methodePaiement: methodePaiement || 'especes',
      description: description || `Frais de retour - Colis #${colis.numero || colisId}`,
      statut: 'en_attente',
      metadata: {
        nbColis: 1,
        fraisRetour: montant
      }
    });

    await transaction.save();

    console.log('✅ Paiement frais retour créé:', transaction.numeroTransaction);

    res.status(201).json({
      success: true,
      message: 'Paiement frais de retour créé avec succès',
      data: transaction
    });
  } catch (error) {
    console.error('❌ Erreur paiement frais retour:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du paiement',
      error: error.message
    });
  }
};

// @desc    Obtenir la caisse détaillée (avec ventilation)
// @route   GET /api/transactions/caisse-detaillee
// @access  Private (Agent)
exports.getCaisseDetaillee = async (req, res) => {
  try {
    const userId = req.query.userId || req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    let result = {};

    if (user.role === 'agent') {
      // Récupérer tous les colis livrés de l'agence
      const colisLivres = await Colis.find({
        agence: user.agence,
        status: 'livre'
      });

      // Calculer les totaux
      const fraisLivraison = colisLivres.reduce((sum, c) => sum + (c.fraisLivraison || 0), 0);
      const montantColis = colisLivres.reduce((sum, c) => sum + (c.montant || 0), 0);
      const totalCollecte = fraisLivraison + montantColis;

      // Frais de retour collectés
      const colisRetournes = await Colis.find({
        agence: user.agence,
        status: { $in: ['retourne', 'retour'] }
      });
      const fraisRetour = colisRetournes.reduce((sum, c) => sum + (c.fraisRetour || 0), 0);

      // Versements à l'admin (validés)
      const versementsAdmin = await Transaction.find({
        'emetteur.id': user._id,
        type: 'versement_agent_admin',
        statut: 'validee'
      });
      const totalVerseAdmin = versementsAdmin.reduce((sum, t) => sum + t.montant, 0);

      // Paiements aux commerçants (validés)
      const paiementsCommercants = await Transaction.find({
        'emetteur.id': user._id,
        type: 'paiement_agent_commercant',
        statut: 'validee'
      });
      const totalPayeCommercants = paiementsCommercants.reduce((sum, t) => sum + t.montant, 0);

      // Frais retour reçus des commerçants (validés)
      const fraisRetourRecus = await Transaction.find({
        'destinataire.id': user._id,
        type: 'paiement_commercant_agent',
        sousType: 'frais_retour',
        statut: 'validee'
      });
      const totalFraisRetourRecus = fraisRetourRecus.reduce((sum, t) => sum + t.montant, 0);

      // En attente
      const enAttenteAdmin = await Transaction.find({
        'emetteur.id': user._id,
        type: 'versement_agent_admin',
        statut: 'en_attente'
      });
      const totalAttenteAdmin = enAttenteAdmin.reduce((sum, t) => sum + t.montant, 0);

      const enAttenteCommercants = await Transaction.find({
        'emetteur.id': user._id,
        type: 'paiement_agent_commercant',
        statut: 'en_attente'
      });
      const totalAttenteCommercants = enAttenteCommercants.reduce((sum, t) => sum + t.montant, 0);

      result = {
        role: 'agent',
        totalCollecte,
        ventilation: {
          fraisLivraison,
          fraisRetour,
          montantColis
        },
        versements: {
          admin: {
            valide: totalVerseAdmin,
            enAttente: totalAttenteAdmin,
            reste: (fraisLivraison + fraisRetour) - totalVerseAdmin - totalAttenteAdmin
          },
          commercants: {
            valide: totalPayeCommercants,
            enAttente: totalAttenteCommercants,
            reste: montantColis - totalPayeCommercants - totalAttenteCommercants
          }
        },
        fraisRetourRecus: totalFraisRetourRecus,
        soldeActuel: totalCollecte + totalFraisRetourRecus - totalVerseAdmin - totalPayeCommercants
      };
    } else if (user.role === 'commercant') {
      // Total à recevoir (colis livrés)
      const colisLivres = await Colis.find({
        commercant: user._id,
        status: 'livre'
      });
      const totalARecevoir = colisLivres.reduce((sum, c) => sum + (c.montant || 0), 0);

      // Paiements reçus (validés)
      const paiementsRecus = await Transaction.find({
        'destinataire.id': user._id,
        type: 'paiement_agent_commercant',
        statut: 'validee'
      });
      const totalRecu = paiementsRecus.reduce((sum, t) => sum + t.montant, 0);

      // En attente
      const enAttente = await Transaction.find({
        'destinataire.id': user._id,
        type: 'paiement_agent_commercant',
        statut: 'en_attente'
      });
      const totalEnAttente = enAttente.reduce((sum, t) => sum + t.montant, 0);

      // Frais de retour à payer
      const colisRetournes = await Colis.find({
        commercant: user._id,
        status: { $in: ['retourne', 'retour'] }
      });
      const fraisRetourAPayer = colisRetournes.reduce((sum, c) => sum + (c.fraisRetour || 0), 0);

      // Frais retour déjà payés
      const fraisRetourPayes = await Transaction.find({
        'emetteur.id': user._id,
        type: 'paiement_commercant_agent',
        sousType: 'frais_retour',
        statut: 'validee'
      });
      const totalFraisRetourPayes = fraisRetourPayes.reduce((sum, t) => sum + t.montant, 0);

      result = {
        role: 'commercant',
        totalARecevoir,
        totalRecu,
        totalEnAttente,
        resteARecevoir: totalARecevoir - totalRecu - totalEnAttente,
        fraisRetour: {
          aPayer: fraisRetourAPayer,
          paye: totalFraisRetourPayes,
          reste: fraisRetourAPayer - totalFraisRetourPayes
        },
        soldeActuel: totalRecu - totalFraisRetourPayes
      };
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Erreur caisse détaillée:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la caisse détaillée',
      error: error.message
    });
  }
};

