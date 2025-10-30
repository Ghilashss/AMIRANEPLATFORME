const mongoose = require('mongoose');

const colisSchema = new mongoose.Schema({
  tracking: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  
  // Informations expéditeur (commercant)
  expediteur: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    nom: String,
    telephone: String,
    adresse: String,
    wilaya: String
  },
  
  // Champs séparés pour l'expéditeur (affichage dans le tableau)
  nomExpediteur: {
    type: String,
    trim: true
  },
  telExpediteur: {
    type: String,
    trim: true
  },
  
  // Rôle du créateur du colis (admin, agent, agence, commercant, etc.)
  createdBy: {
    type: String,
    enum: ['admin', 'agent', 'agence', 'commercant'],
    default: 'commercant'
  },
  
  // Bureau source (agence de départ) - utilisé quand admin crée un colis
  bureauSource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agence'
  },
  
  // Informations destinataire
  destinataire: {
    nom: {
      type: String,
      required: [true, 'Le nom du destinataire est requis']
    },
    telephone: {
      type: String,
      required: [true, 'Le téléphone du destinataire est requis']
    },
    adresse: {
      type: String,
      required: [true, 'L\'adresse de livraison est requise']
    },
    wilaya: {
      type: String,
      required: [true, 'La wilaya de livraison est requise']
    },
    commune: String
  },
  
  // Informations colis
  typeLivraison: {
    type: String,
    enum: ['domicile', 'stopdesk'],
    default: 'domicile'
  },
  typeArticle: {
    type: String,
    enum: ['vetements', 'electronique', 'alimentaire', 'fragile', 'autre'],
    default: 'autre'
  },
  typeColis: {
    type: String,
    enum: ['standard', 'fragile', 'express', 'volumineux'],
    default: 'standard'
  },
  contenu: {
    type: String,
    trim: true
  },
  poids: {
    type: Number,
    default: 0
  },
  longueur: Number,
  largeur: Number,
  hauteur: Number,
  
  // Valeurs financières
  montant: {
    type: Number,
    required: [true, 'Le montant est requis'],
    min: 0
  },
  fraisLivraison: {
    type: Number,
    required: true,
    default: 0
  },
  fraisRetour: {
    type: Number,
    default: 200,
    description: 'Frais de retour fixés à 200 DA'
  },
  totalAPayer: {
    type: Number,
    required: true
  },
  
  // Statut et suivi
  status: {
    type: String,
    enum: [
      'en_attente',
      'accepte',
      'en_preparation',
      'pret_a_expedier',
      'expedie',
      'en_transit',
      'arrive_agence',
      'en_livraison',
      'livre',
      'echec_livraison',
      'en_retour',
      'retourne',
      'annule'
    ],
    default: 'en_attente'
  },
  
  // Affectations
  agence: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agence'
  },
  livreur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Historique
  historique: [{
    status: String,
    description: String,
    utilisateur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Dates importantes
  dateCreation: {
    type: Date,
    default: Date.now
  },
  dateExpedition: Date,
  dateLivraisonPrevue: Date,
  dateLivraison: Date,
  
  // Notes et remarques
  notes: String,
  remarques: String,
  
  // Images et documents
  photos: [String],
  qrCode: String,
  
  // Tentatives de livraison
  tentativesLivraison: {
    type: Number,
    default: 0
  },
  
  // Paiement
  paiementStatus: {
    type: String,
    enum: ['en_attente', 'paye', 'rembourse'],
    default: 'en_attente'
  },
  
  // Suivi des paiements financiers
  paye: {
    type: Boolean,
    default: false,
    description: 'Le prix du colis a été payé au commerçant par l\'agent'
  },
  datePaiement: {
    type: Date,
    description: 'Date du paiement du prix au commerçant'
  },
  fraisLivraisonPayes: {
    type: Boolean,
    default: false,
    description: 'Les frais de livraison ont été payés par le commerçant à l\'agent'
  },
  datePaiementFraisLivraison: {
    type: Date
  },
  fraisRetourPayes: {
    type: Boolean,
    default: false,
    description: 'Les frais de retour (200 DA) ont été payés par le commerçant à l\'agent'
  },
  datePaiementFraisRetour: {
    type: Date
  },
  fraisAgencePayes: {
    type: Boolean,
    default: false,
    description: 'Les frais de livraison ont été payés par l\'agent à l\'admin'
  },
  datePaiementFraisAgence: {
    type: Date
  },
  
  // Options
  options: {
    ouvertureALivraison: {
      type: Boolean,
      default: false
    },
    echange: {
      type: Boolean,
      default: false
    },
    fragile: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Générer un numéro de tracking unique
colisSchema.pre('save', function(next) {
  if (!this.tracking) {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    this.tracking = `COL${year}${month}${day}${random}`;
  }
  next();
});

// Calculer le total à payer
colisSchema.pre('save', function(next) {
  this.totalAPayer = this.montant + this.fraisLivraison;
  next();
});

// ===================================================
// HOOK POST-SAVE: CRÉER TRANSACTIONS AUTOMATIQUES
// ===================================================
// Quand le statut change, créer les transactions financières
colisSchema.post('save', async function(doc) {
  try {
    // Importer les modèles (à l'intérieur pour éviter les dépendances circulaires)
    const Portefeuille = require('./Portefeuille');
    const OperationFinanciere = require('./OperationFinanciere');
    
    // Si le statut est "livré" et pas encore payé
    if (doc.statut === 'livre' && !doc.paye) {
      console.log(`💰 Colis ${doc.codeSuivi} livré - Création transactions automatiques`);
      
      // Obtenir les portefeuilles
      const portefeuilleAgence = await Portefeuille.findOne({
        proprietaireId: doc.agence,
        typeProprietaire: 'Agence'
      });
      
      const portefeuilleCommercant = await Portefeuille.findOne({
        proprietaireId: doc.commercant,
        typeProprietaire: 'Commercant'
      });
      
      // Créer les portefeuilles s'ils n'existent pas
      if (!portefeuilleAgence) {
        const Agence = require('./Agence');
        const agence = await Agence.findById(doc.agence);
        if (agence) {
          await Portefeuille.create({
            proprietaireId: doc.agence,
            typeProprietaire: 'Agence',
            nomProprietaire: agence.nom
          });
        }
      }
      
      if (!portefeuilleCommercant) {
        const Commercant = require('./Commercant');
        const commercant = await Commercant.findById(doc.commercant);
        if (commercant) {
          await Portefeuille.create({
            proprietaireId: doc.commercant,
            typeProprietaire: 'Commercant',
            nomProprietaire: commercant.nom
          });
        }
      }
      
      // Recharger les portefeuilles
      const agenceWallet = await Portefeuille.findOne({
        proprietaireId: doc.agence,
        typeProprietaire: 'Agence'
      });
      
      const commercantWallet = await Portefeuille.findOne({
        proprietaireId: doc.commercant,
        typeProprietaire: 'Commercant'
      });
      
      if (agenceWallet && commercantWallet) {
        // TRANSACTION 1: Commerçant doit payer le PRIX du colis à l'Agent
        // L'agent livre le colis et collecte l'argent du client, puis doit verser au commerçant
        await OperationFinanciere.create({
          typeOperation: 'paiement_livraison',
          montant: doc.montant || 0,
          compteDebit: agenceWallet._id,  // Agent paie
          compteCredit: commercantWallet._id,  // Commerçant reçoit
          referenceColis: doc._id,
          codeColis: doc.codeSuivi,
          description: `Paiement prix colis ${doc.codeSuivi} - ${doc.montant} DA`,
          statut: 'en_attente', // En attente que le commerçant verse à l'agent
          methodePaiement: 'automatique'
        });
        
        // TRANSACTION 2: Commerçant paie les FRAIS DE LIVRAISON à l'Agent
        if (doc.fraisLivraison > 0) {
          await OperationFinanciere.create({
            typeOperation: 'frais_livraison',
            montant: doc.fraisLivraison,
            compteDebit: commercantWallet._id,  // Commerçant paie
            compteCredit: agenceWallet._id,  // Agent reçoit
            referenceColis: doc._id,
            codeColis: doc.codeSuivi,
            description: `Frais livraison colis ${doc.codeSuivi} - ${doc.fraisLivraison} DA`,
            statut: 'en_attente',
            methodePaiement: 'automatique'
          });
        }
        
        console.log(`✅ Transactions créées pour colis ${doc.codeSuivi}`);
      }
    }
    
    // Si le statut est "retourné" et frais de retour pas encore payés
    if (doc.statut === 'retourne' && !doc.fraisRetourPayes) {
      console.log(`📦 Colis ${doc.codeSuivi} retourné - Création transaction frais retour`);
      
      const portefeuilleCommercant = await Portefeuille.findOne({
        proprietaireId: doc.commercant,
        typeProprietaire: 'Commercant'
      });
      
      const portefeuilleAgence = await Portefeuille.findOne({
        proprietaireId: doc.agence,
        typeProprietaire: 'Agence'
      });
      
      if (portefeuilleCommercant && portefeuilleAgence && doc.fraisRetour > 0) {
        // Créer la transaction: Commerçant paie les frais de retour à l'agence
        await OperationFinanciere.create({
          typeOperation: 'frais_retour',
          montant: doc.fraisRetour,
          compteDebit: portefeuilleCommercant._id,
          compteCredit: portefeuilleAgence._id,
          referenceColis: doc._id,
          codeColis: doc.codeSuivi,
          description: `Frais retour colis ${doc.codeSuivi}`,
          statut: 'en_attente',
          methodePaiement: 'automatique'
        });
        
        console.log(`✅ Transaction frais retour créée pour ${doc.codeSuivi}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur création transaction automatique:', error);
    // Ne pas bloquer la sauvegarde du colis si la transaction échoue
  }
});

module.exports = mongoose.model('Colis', colisSchema);

