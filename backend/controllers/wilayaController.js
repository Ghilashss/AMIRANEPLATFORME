const Wilaya = require('../models/Wilaya');

// @desc    Créer une nouvelle wilaya
// @route   POST /api/wilayas
// @access  Private (Admin)
exports.createWilaya = async (req, res, next) => {
  try {
    const wilaya = await Wilaya.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Wilaya créée avec succès',
      data: wilaya
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir toutes les wilayas
// @route   GET /api/wilayas
// @access  Public
exports.getWilayas = async (req, res, next) => {
  try {
    let query = {};

    if (req.query.status) {
      query.status = req.query.status;
    }

    const wilayas = await Wilaya.find(query).sort({ code: 1 });

    res.json({
      success: true,
      count: wilayas.length,
      data: wilayas
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtenir une wilaya par code
// @route   GET /api/wilayas/:code
// @access  Public
exports.getWilayaByCode = async (req, res, next) => {
  try {
    const wilaya = await Wilaya.findOne({ code: req.params.code });

    if (!wilaya) {
      return res.status(404).json({
        success: false,
        message: 'Wilaya non trouvée'
      });
    }

    res.json({
      success: true,
      data: wilaya
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mettre à jour une wilaya
// @route   PUT /api/wilayas/:code
// @access  Private (Admin)
exports.updateWilaya = async (req, res, next) => {
  try {
    const wilaya = await Wilaya.findOneAndUpdate(
      { code: req.params.code },
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!wilaya) {
      return res.status(404).json({
        success: false,
        message: 'Wilaya non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Wilaya mise à jour',
      data: wilaya
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mettre à jour les frais de livraison
// @route   PUT /api/wilayas/:code/frais
// @access  Private (Admin)
exports.updateFraisLivraison = async (req, res, next) => {
  try {
    const { domicile, stopDesk } = req.body;

    const wilaya = await Wilaya.findOne({ code: req.params.code });

    if (!wilaya) {
      return res.status(404).json({
        success: false,
        message: 'Wilaya non trouvée'
      });
    }

    if (domicile !== undefined) {
      wilaya.fraisLivraison.domicile = domicile;
    }

    if (stopDesk !== undefined) {
      wilaya.fraisLivraison.stopDesk = stopDesk;
    }

    await wilaya.save();

    res.json({
      success: true,
      message: 'Frais de livraison mis à jour',
      data: wilaya
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Supprimer une wilaya
// @route   DELETE /api/wilayas/:code
// @access  Private (Admin)
exports.deleteWilaya = async (req, res, next) => {
  try {
    const wilaya = await Wilaya.findOneAndDelete({ code: req.params.code });

    if (!wilaya) {
      return res.status(404).json({
        success: false,
        message: 'Wilaya non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Wilaya supprimée'
    });
  } catch (error) {
    next(error);
  }
};
