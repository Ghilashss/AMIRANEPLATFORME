const Agence = require('../models/Agence');
const User = require('../models/User');

// @desc    Créer une nouvelle agence
// @route   POST /api/agences
// @access  Private (Admin)
exports.createAgence = async (req, res, next) => {
  try {
    const { nom, email, password, telephone, wilaya, adresse } = req.body;

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }

    // Créer l'agence
    const agence = await Agence.create({
      nom,
      email,
      telephone,
      wilaya,
      adresse,
      code: generateAgenceCode(wilaya),
      status: 'active',
      caisse: {
        solde: 0,
        totalCollecte: 0,
        totalVerse: 0
      }
    });

    // Créer l'utilisateur associé à l'agence avec le rôle "agent"
    const user = await User.create({
      nom: nom,
      email: email,
      password: password,
      role: 'agent',
      wilaya: wilaya,
      agence: agence._id,
      telephone: telephone,
      status: 'active'
    });

    // Mettre à jour l'agence avec l'ID de l'utilisateur
    agence.userId = user._id;
    await agence.save();

    res.status(201).json({
      success: true,
      message: 'Agence et compte utilisateur créés avec succès',
      data: {
        agence,
        user: {
          id: user._id,
          nom: user.nom,
          email: user.email,
          role: user.role,
          wilaya: user.wilaya
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Fonction helper pour générer le code d'agence
function generateAgenceCode(wilaya) {
  const date = new Date();
  const year = date.getFullYear().toString().substr(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `AG${year}${month}-${wilaya}-${random}`;
}

// @desc    Obtenir toutes les agences
// @route   GET /api/agences
// @access  Private
exports.getAgences = async (req, res, next) => {
  try {
    let query = {};

    // Filtres
    if (req.query.wilaya) {
      query.wilaya = req.query.wilaya;
    }

    if (req.query.status) {
      query.status = req.query.status;
    }

    const agences = await Agence.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: agences.length,
      data: agences
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir une agence par ID
// @route   GET /api/agences/:id
// @access  Private
exports.getAgenceById = async (req, res, next) => {
  try {
    const agence = await Agence.findById(req.params.id);

    if (!agence) {
      return res.status(404).json({
        success: false,
        message: 'Agence non trouvée'
      });
    }

    res.json({
      success: true,
      data: agence
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mettre à jour une agence
// @route   PUT /api/agences/:id
// @access  Private (Admin)
exports.updateAgence = async (req, res, next) => {
  try {
    const agence = await Agence.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!agence) {
      return res.status(404).json({
        success: false,
        message: 'Agence non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Agence mise à jour',
      data: agence
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Supprimer une agence
// @route   DELETE /api/agences/:id
// @access  Private (Admin)
exports.deleteAgence = async (req, res, next) => {
  try {
    const agence = await Agence.findById(req.params.id);

    if (!agence) {
      return res.status(404).json({
        success: false,
        message: 'Agence non trouvée'
      });
    }

    await agence.deleteOne();

    res.json({
      success: true,
      message: 'Agence supprimée'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir les statistiques d'une agence
// @route   GET /api/agences/:id/stats
// @access  Private (Admin/Agence)
exports.getAgenceStats = async (req, res, next) => {
  try {
    const agence = await Agence.findById(req.params.id);

    if (!agence) {
      return res.status(404).json({
        success: false,
        message: 'Agence non trouvée'
      });
    }

    // Compter les employés de l'agence
    const employesCount = await User.countDocuments({ 
      agence: req.params.id,
      status: 'active'
    });

    res.json({
      success: true,
      data: {
        ...agence.statistiques,
        totalEmployes: employesCount,
        caisse: agence.caisse
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir les agences par wilaya
// @route   GET /api/agences/wilaya/:code
// @access  Public
exports.getAgencesByWilaya = async (req, res, next) => {
  try {
    const agences = await Agence.find({ 
      wilaya: req.params.code,
      status: 'active'
    }).select('code nom telephone adresse');

    res.json({
      success: true,
      count: agences.length,
      data: agences
    });
  } catch (error) {
    next(error);
  }
};
