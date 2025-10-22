const Colis = require('../models/Colis');
const Agence = require('../models/Agence');
const Wilaya = require('../models/Wilaya');
const Caisse = require('../models/Caisse');

// @desc    Créer un nouveau colis
// @route   POST /api/colis
// @access  Private
exports.createColis = async (req, res, next) => {
  try {
    console.log('📦 Création d\'un nouveau colis...');
    console.log('👤 Utilisateur:', req.user.role, req.user.nom);
    
    // Générer un numéro de tracking au format TRK + 11 chiffres (comme agent)
    const prefix = 'TRK';
    let randomDigits = '';
    for (let i = 0; i < 11; i++) {
      randomDigits += Math.floor(Math.random() * 10);
    }
    const tracking = `${prefix}${randomDigits}`;
    
    // 🔧 Support des deux formats: admin/agent (destinataire objet) ET agence (champs plats)
    const wilayaCode = req.body.destinataire?.wilaya || req.body.wilaya;
    
    // Récupérer les frais de livraison selon la wilaya
    const wilaya = await Wilaya.findOne({ code: wilayaCode });
    
    let fraisLivraison = req.body.fraisLivraison || 0; // Utiliser les frais du frontend si présents
    if (!fraisLivraison && wilaya) {
      fraisLivraison = req.body.typeLivraison === 'domicile' 
        ? wilaya.fraisLivraison.domicile 
        : wilaya.fraisLivraison.stopDesk;
    }

    // Récupérer le montant du colis et les frais de retour
    const montantColis = parseFloat(req.body.prixColis) || parseFloat(req.body.montant) || 0;
    const fraisRetour = parseFloat(req.body.fraisRetour) || 0;

    console.log('💰 Frais de livraison:', fraisLivraison);
    console.log('💰 Montant colis:', montantColis);
    console.log('💰 Frais de retour:', fraisRetour);

    // 🔧 Normaliser les données destinataire (support format agence)
    const destinataire = req.body.destinataire || {
      nom: req.body.clientNom,
      telephone: req.body.clientTel,
      telSecondaire: req.body.telSecondaire,
      wilaya: req.body.wilaya,
      commune: req.body.commune,
      adresse: req.body.adresse
    };

    // 🔧 Déterminer l'agence du colis et le bureau source
    // Si c'est un commercant, utiliser l'agence envoyée dans req.body.agence (bureau source)
    // Si c'est un agent, utiliser son agence
    // Si c'est un admin, le bureau source est l'agence sélectionnée
    let agenceId = req.body.agence; // Par défaut, utiliser celle du frontend
    let bureauSourceId = null;
    
    if (req.user.role === 'commercant' && req.user.agence) {
      // ✅ Pour les commercants: l'agence est le bureau source (où le colis est déposé)
      agenceId = req.user.agence;
      bureauSourceId = req.body.bureauSource || req.body.agence || req.user.agence;
      console.log('👔 Colis commercant: agence =', agenceId, '| bureauSource =', bureauSourceId);
    } else if (req.user.role === 'agent' && req.user.agence) {
      agenceId = req.user.agence; // Les agents créent des colis pour leur propre agence
      bureauSourceId = req.user.agence; // Le bureau source est leur agence
    } else if (req.user.role === 'admin' && req.body.bureauSource) {
      bureauSourceId = req.body.bureauSource; // Admin spécifie le bureau source
    } else if (req.user.role === 'admin' && req.body.agence) {
      bureauSourceId = req.body.agence; // Si pas de bureauSource spécifié, utiliser l'agence
    }

    console.log('🏢 Agence assignée au colis:', agenceId);
    console.log('🏢 Bureau source:', bureauSourceId);

    // Créer le colis
    const colis = await Colis.create({
      ...req.body,
      tracking, // Ajouter le tracking généré au format TRK
      destinataire, // Utiliser le destinataire normalisé
      expediteur: {
        id: req.user._id,
        nom: req.body.commercant || req.body.nomCommercant || req.body.nomExpediteur || req.user.nom,
        telephone: req.body.commercantTel || req.body.telCommercant || req.body.telExpediteur || req.user.telephone,
        adresse: req.body.commercantAdresse || req.body.adresseCommercant || req.user.adresse,
        wilaya: req.body.wilayaSource || req.body.wilayaExp || req.user.wilaya
      },
      agence: agenceId, // ✅ FORCER l'agence déterminée
      bureauSource: bureauSourceId, // ✅ Enregistrer le bureau source
      createdBy: req.body.createdBy || req.user.role, // ✅ Garder 'commercant' si envoyé
      fraisLivraison,
      historique: [{
        status: 'en_attente',
        description: 'Colis créé',
        utilisateur: req.user._id
      }]
    });

    console.log('✅ Colis créé:', colis.tracking);

    // 💰 Mettre à jour la caisse si c'est un agent
    if (req.user.role === 'agent') {
      console.log('💰 Mise à jour de la caisse de l\'agent...');
      
      let caisse = await Caisse.findOne({ user: req.user._id });
      
      if (!caisse) {
        console.log('⚠️  Caisse non trouvée, création...');
        caisse = new Caisse({
          user: req.user._id,
          role: req.user.role
        });
      }

      // Ajouter les montants collectés
      caisse.fraisLivraisonCollectes += fraisLivraison;
      caisse.fraisRetourCollectes += fraisRetour;
      caisse.montantColisCollectes += montantColis;
      
      // Mettre à jour le solde total et la collecte
      const totalCollecte = fraisLivraison + fraisRetour + montantColis;
      caisse.totalCollecte += totalCollecte;
      caisse.soldeActuel += totalCollecte;

      // Ajouter à l'historique
      caisse.ajouterTransaction(
        totalCollecte,
        `Collecte colis ${tracking}`
      );

      await caisse.save();
      console.log('✅ Caisse mise à jour');
      console.log('   - Frais livraison collectés:', caisse.fraisLivraisonCollectes);
      console.log('   - Frais retour collectés:', caisse.fraisRetourCollectes);
      console.log('   - Montant colis collectés:', caisse.montantColisCollectes);
      console.log('   - Solde actuel:', caisse.soldeActuel);
    }

    res.status(201).json({
      success: true,
      message: 'Colis créé avec succès',
      data: colis
    });
  } catch (error) {
    console.error('❌ Erreur création colis:', error);
    next(error);
  }
};

// @desc    Obtenir tous les colis
// @route   GET /api/colis
// @access  Private
exports.getColis = async (req, res, next) => {
  try {
    let query = {};

    console.log('🔍 getColis appelé par:', req.user.role);
    console.log('   User ID:', req.user._id);
    console.log('   User Agence:', req.user.agence);

    // Filtrer selon le rôle
    if (req.user.role === 'commercant') {
      // Les commerçants voient UNIQUEMENT leurs propres colis
      query['expediteur.id'] = req.user._id;
      console.log('   → Filtre commercant: expediteur.id =', req.user._id);
    } else if (req.user.role === 'agent' || req.user.role === 'agence') {
      // Les agents voient:
      // 1. Les colis qu'ils ont créés eux-mêmes (createdBy = leur ID)
      // 2. Les colis créés par admin où leur agence est le bureauSource
      query.$or = [
        { createdBy: req.user._id }, // Colis créés par l'agent
        { bureauSource: req.user.agence } // Colis où leur agence est le bureau source
      ];
      console.log('   → Filtre agent/agence: createdBy =', req.user._id, 'OU bureauSource =', req.user.agence);
    } else {
      console.log('   → Pas de filtre (admin)');
    }
    // ✅ Les admins voient TOUS les colis (pas de filtre)
    
    console.log('🔍 Requête finale MongoDB:', JSON.stringify(query));

    // Filtres supplémentaires
    if (req.query.status) {
      query.status = req.query.status;
    }

    if (req.query.wilaya) {
      query['destinataire.wilaya'] = req.query.wilaya;
    }

    if (req.query.tracking) {
      query.tracking = new RegExp(req.query.tracking, 'i');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const total = await Colis.countDocuments(query);
    const colis = await Colis.find(query)
      .populate('agence', 'nom code')
      .populate('livreur', 'nom prenom telephone')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex);

    console.log(`✅ ${colis.length} colis trouvés sur ${total} total`);
    
    // Debug: afficher les agences des colis trouvés
    if (colis.length > 0) {
      console.log('📦 Aperçu des colis:');
      colis.slice(0, 3).forEach(c => {
        console.log(`   - ${c.tracking} | Agence: ${c.agence?._id || c.agence} | CreatedBy: ${c.createdBy}`);
      });
    }

    res.json({
      success: true,
      count: colis.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: colis
    });
  } catch (error) {
    console.error('❌ Erreur getColis:', error);
    next(error);
  }
};

// @desc    Obtenir un colis par ID
// @route   GET /api/colis/:id
// @access  Private
exports.getColisById = async (req, res, next) => {
  try {
    const colis = await Colis.findById(req.params.id)
      .populate('agence')
      .populate('livreur', 'nom prenom telephone')
      .populate('expediteur.id', 'nom email telephone');

    if (!colis) {
      return res.status(404).json({
        success: false,
        message: 'Colis non trouvé'
      });
    }

    res.json({
      success: true,
      data: colis
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Suivre un colis par numéro de tracking
// @route   GET /api/colis/tracking/:tracking
// @access  Public
exports.trackColis = async (req, res, next) => {
  try {
    const colis = await Colis.findOne({ tracking: req.params.tracking })
      .populate('agence', 'nom telephone')
      .select('-expediteur.id');

    if (!colis) {
      return res.status(404).json({
        success: false,
        message: 'Numéro de tracking invalide'
      });
    }

    res.json({
      success: true,
      data: {
        tracking: colis.tracking,
        status: colis.status,
        destinataire: colis.destinataire,
        dateCreation: colis.dateCreation,
        dateLivraisonPrevue: colis.dateLivraisonPrevue,
        historique: colis.historique,
        agence: colis.agence
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mettre à jour le statut d'un colis
// @route   PUT /api/colis/:id/status
// @access  Private (Agent/Agence/Admin)
exports.updateColisStatus = async (req, res, next) => {
  try {
    const { status, description } = req.body;

    const colis = await Colis.findById(req.params.id);

    if (!colis) {
      return res.status(404).json({
        success: false,
        message: 'Colis non trouvé'
      });
    }

    // Ajouter à l'historique
    colis.historique.push({
      status,
      description,
      utilisateur: req.user._id
    });

    colis.status = status;

    // Mettre à jour les dates selon le statut
    if (status === 'expedie' && !colis.dateExpedition) {
      colis.dateExpedition = Date.now();
    }

    if (status === 'livre') {
      colis.dateLivraison = Date.now();
      colis.paiementStatus = 'paye';
    }

    await colis.save();

    res.json({
      success: true,
      message: 'Statut mis à jour',
      data: colis
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Affecter un colis à une agence
// @route   PUT /api/colis/:id/assign-agence
// @access  Private (Admin)
exports.assignColisToAgence = async (req, res, next) => {
  try {
    const { agenceId } = req.body;

    const colis = await Colis.findById(req.params.id);
    if (!colis) {
      return res.status(404).json({
        success: false,
        message: 'Colis non trouvé'
      });
    }

    const agence = await Agence.findById(agenceId);
    if (!agence) {
      return res.status(404).json({
        success: false,
        message: 'Agence non trouvée'
      });
    }

    colis.agence = agenceId;
    colis.status = 'accepte';
    colis.historique.push({
      status: 'accepte',
      description: `Affecté à l'agence ${agence.nom}`,
      utilisateur: req.user._id
    });

    await colis.save();

    // Mettre à jour les stats de l'agence
    agence.statistiques.totalColis += 1;
    agence.statistiques.colisEnCours += 1;
    await agence.save();

    res.json({
      success: true,
      message: 'Colis affecté à l\'agence',
      data: colis
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Affecter un colis à un livreur
// @route   PUT /api/colis/:id/assign-livreur
// @access  Private (Agence)
exports.assignColisToLivreur = async (req, res, next) => {
  try {
    const { livreurId } = req.body;

    const colis = await Colis.findById(req.params.id);
    if (!colis) {
      return res.status(404).json({
        success: false,
        message: 'Colis non trouvé'
      });
    }

    colis.livreur = livreurId;
    colis.status = 'en_livraison';
    colis.historique.push({
      status: 'en_livraison',
      description: 'Colis en cours de livraison',
      utilisateur: req.user._id
    });

    await colis.save();

    res.json({
      success: true,
      message: 'Colis affecté au livreur',
      data: colis
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir les statistiques des colis
// @route   GET /api/colis/stats
// @access  Private
exports.getColisStats = async (req, res, next) => {
  try {
    let query = {};

    if (req.user.role === 'commercant') {
      query['expediteur.id'] = req.user._id;
    } else if (req.user.role === 'agent' || req.user.role === 'agence') {
      query.agence = req.user.agence;
    }

    const stats = await Colis.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalMontant: { $sum: '$montant' }
        }
      }
    ]);

    const total = await Colis.countDocuments(query);

    res.json({
      success: true,
      data: {
        total,
        parStatus: stats
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Supprimer un colis
// @route   DELETE /api/colis/:id
// @access  Private (Admin, Agent de l'agence, ou propriétaire)
exports.deleteColis = async (req, res, next) => {
  try {
    console.log('🗑️ Tentative de suppression colis:', req.params.id);
    console.log('👤 Utilisateur:', req.user.role, req.user._id);
    
    const colis = await Colis.findById(req.params.id);

    if (!colis) {
      console.log('❌ Colis non trouvé');
      return res.status(404).json({
        success: false,
        message: 'Colis non trouvé'
      });
    }

    console.log('📦 Colis trouvé - Agence:', colis.agence, '| Expéditeur:', colis.expediteur?.id);

    // Vérifier les permissions
    let isAuthorized = false;
    
    // Admin peut tout supprimer
    if (req.user.role === 'admin') {
      isAuthorized = true;
      console.log('✅ Autorisé: Admin');
    }
    // Propriétaire peut supprimer son colis
    else if (colis.expediteur && colis.expediteur.id.toString() === req.user._id.toString()) {
      isAuthorized = true;
      console.log('✅ Autorisé: Propriétaire du colis');
    }
    // Agent peut supprimer les colis de son agence
    else if (req.user.role === 'agent' && req.user.agence && colis.agence) {
      const userAgenceId = req.user.agence.toString();
      const colisAgenceId = colis.agence.toString();
      if (userAgenceId === colisAgenceId) {
        isAuthorized = true;
        console.log('✅ Autorisé: Agent de la même agence');
      } else {
        console.log('❌ Refusé: Agent d\'une autre agence');
        console.log('   - Agence utilisateur:', userAgenceId);
        console.log('   - Agence colis:', colisAgenceId);
      }
    }

    if (!isAuthorized) {
      console.log('❌ Non autorisé à supprimer ce colis');
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à supprimer ce colis'
      });
    }

    await colis.deleteOne();
    console.log('✅ Colis supprimé avec succès');

    res.json({
      success: true,
      message: 'Colis supprimé'
    });
  } catch (error) {
    console.error('❌ Erreur suppression colis:', error);
    next(error);
  }
};
