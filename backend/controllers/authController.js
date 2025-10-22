const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Générer un token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Inscription d'un utilisateur
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { nom, prenom, email, telephone, password, role, wilaya, adresse, agence } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }

    // ✅ Préparer les données utilisateur
    const userData = {
      nom,
      prenom,
      email,
      telephone,
      password,
      role: role || 'commercant',
      wilaya,
      adresse
    };

    // ✅ Ajouter l'agence si fournie (pour les commerçants créés par un agent)
    if (agence) {
      userData.agence = agence;
    }

    // Créer l'utilisateur
    const user = await User.create(userData);

    // Générer le token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      data: {
        _id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        telephone: user.telephone,
        role: user.role,
        agence: user.agence, // ✅ Retourner l'agence
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Connexion d'un utilisateur
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Valider l'email et le mot de passe
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis'
      });
    }

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier le mot de passe
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier le statut du compte
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Votre compte est désactivé'
      });
    }

    // Mettre à jour la dernière connexion
    user.lastLogin = Date.now();
    await user.save();

    // Générer le token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        _id: user._id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        telephone: user.telephone,
        role: user.role,
        agence: user.agence,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir le profil de l'utilisateur connecté
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('agence');

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mettre à jour le profil
// @route   PUT /api/auth/updateprofile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      nom: req.body.nom,
      prenom: req.body.prenom,
      telephone: req.body.telephone,
      adresse: req.body.adresse,
      wilaya: req.body.wilaya
    };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      message: 'Profil mis à jour avec succès',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Changer le mot de passe
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+password');

    // Vérifier l'ancien mot de passe
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe actuel incorrect'
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Mot de passe modifié avec succès',
      data: {
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Récupérer les utilisateurs (avec filtre par rôle)
// @route   GET /api/auth/users
// @access  Private (admin/agent)
exports.getUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const filter = {};

    // ✅ Filtrer par rôle si spécifié
    if (role) {
      filter.role = role;
    }

    // ✅ Si c'est un agent, ne montrer QUE les utilisateurs de son agence
    if (req.user && (req.user.role === 'agent' || req.user.role === 'agence')) {
      filter.agence = req.user.agence;
      console.log(`🔍 Agent ${req.user._id} - Filtrage par agence ${req.user.agence}`);
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });

    console.log(`📊 ${users.length} utilisateurs trouvés (rôle: ${role || 'tous'}, agence: ${filter.agence || 'toutes'})`);

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir l'utilisateur connecté
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    // req.user est déjà défini par le middleware auth.js
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('agence', 'code nom wilaya adresse telephone');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir l'utilisateur connecté
// @route   GET /api/auth/me
// @access  Private
exports.getCurrentUser = async (req, res, next) => {
  try {
    // req.user est injecté par le middleware auth
    const userId = req.user.id;

    const user = await User.findById(userId)
      .select('-password') // Exclure le mot de passe
      .populate('agence', 'nom code wilaya adresse telephone');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Erreur getCurrentUser:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};

