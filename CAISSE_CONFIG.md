# Configuration de la Section Caisse

## Variables d'Environnement

Créer un fichier `.env` dans le dossier `backend/` avec:

```env
# Base de données
MONGODB_URI=mongodb://localhost:27017/platforme_livraison

# JWT
JWT_SECRET=votre_secret_jwt_tres_securise_ici
JWT_EXPIRE=30d

# Serveur
PORT=5000
NODE_ENV=development

# Frontend URL (pour CORS)
FRONTEND_URL=http://localhost:3000

# Caisse - Configuration
CAISSE_MONTANT_MIN=0
CAISSE_MONTANT_MAX=1000000
CAISSE_DELAI_VALIDATION=24
```

## Configuration MongoDB

### Collections Requises

La section caisse utilise les collections suivantes:

```javascript
// Collection: users
{
  "_id": ObjectId,
  "nom": String,
  "prenom": String,
  "email": String,
  "password": String (hash),
  "role": "agent" | "admin" | "commercant",
  "agence": ObjectId, // Référence à la collection agences
  "telephone": String,
  "createdAt": Date,
  "updatedAt": Date
}

// Collection: transactions
{
  "_id": ObjectId,
  "numero": String, // Auto-généré: TRX2410xxxxx
  "type": "versement" | "retrait" | "frais_livraison" | "remboursement",
  "montant": Number,
  "utilisateur": ObjectId, // Référence à users
  "agence": ObjectId, // Référence à agences
  "colis": ObjectId, // Référence à colis (optionnel)
  "description": String,
  "status": "en_attente" | "validee" | "annulee",
  "methodePaiement": "especes" | "virement" | "carte" | "cheque",
  "referencePaiement": String,
  "createdAt": Date,
  "updatedAt": Date
}

// Collection: colis
{
  "_id": ObjectId,
  "numeroSuivi": String,
  "status": String, // "livre" pour calculer le solde
  "montant": Number, // Montant à collecter
  "fraisLivraison": Number,
  "agence": ObjectId, // Référence à agences
  "destinataire": {
    "nom": String,
    "telephone": String,
    "adresse": String
  },
  // ... autres champs
}

// Collection: agences
{
  "_id": ObjectId,
  "nom": String,
  "ville": String,
  "adresse": String,
  "telephone": String,
  "email": String,
  // ... autres champs
}
```

### Index Recommandés

Pour optimiser les performances:

```javascript
// Dans MongoDB shell ou Compass

// Index sur transactions
db.transactions.createIndex({ "type": 1, "status": 1 });
db.transactions.createIndex({ "utilisateur": 1, "createdAt": -1 });
db.transactions.createIndex({ "agence": 1 });
db.transactions.createIndex({ "numero": 1 }, { unique: true });

// Index sur colis
db.colis.createIndex({ "status": 1, "agence": 1 });
db.colis.createIndex({ "numeroSuivi": 1 }, { unique: true });

// Index sur users
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "role": 1 });
```

## Configuration Frontend

### Agent Dashboard

Dans `dashboards/agent/config.js`:

```javascript
export const CONFIG = {
  API_URL: 'http://localhost:5000/api',
  CAISSE: {
    // Montant minimum pour un versement
    MONTANT_MIN: 0,
    
    // Montant maximum pour un versement
    MONTANT_MAX: 1000000,
    
    // Devises
    CURRENCY: 'DZD',
    CURRENCY_SYMBOL: 'DA',
    
    // Formatage des nombres
    LOCALE: 'fr-DZ',
    
    // Méthodes de paiement disponibles
    PAYMENT_METHODS: [
      { value: 'especes', label: 'Espèces' },
      { value: 'virement', label: 'Virement bancaire' },
      { value: 'carte', label: 'Carte bancaire' },
      { value: 'cheque', label: 'Chèque' }
    ],
    
    // Périodes de filtrage
    FILTER_PERIODS: [
      { value: 'tous', label: 'Toutes les périodes' },
      { value: '7jours', label: '7 derniers jours' },
      { value: '30jours', label: '30 derniers jours' },
      { value: 'mois', label: 'Ce mois' }
    ],
    
    // Statuts
    STATUS: {
      EN_ATTENTE: 'en_attente',
      VALIDEE: 'validee',
      ANNULEE: 'annulee'
    },
    
    // Messages
    MESSAGES: {
      SUCCESS_VERSEMENT: 'Versement enregistré avec succès. En attente de validation.',
      ERROR_MONTANT: 'Veuillez entrer un montant valide',
      ERROR_SOLDE: 'Le montant ne peut pas dépasser le solde disponible',
      ERROR_NETWORK: 'Erreur de connexion au serveur'
    }
  }
};
```

### Admin Dashboard

Dans `dashboards/admin/config.js`:

```javascript
export const CONFIG = {
  API_URL: 'http://localhost:5000/api',
  CAISSE: {
    // Pagination
    ITEMS_PER_PAGE: 50,
    
    // Auto-refresh (en secondes, 0 = désactivé)
    AUTO_REFRESH: 0,
    
    // Filtres par défaut
    DEFAULT_FILTERS: {
      status: '',
      agence: '',
      period: 'tous'
    },
    
    // Confirmation avant validation
    CONFIRM_VALIDATION: true,
    
    // Motif obligatoire pour refus
    REFUS_MOTIF_REQUIRED: false,
    
    // Messages
    MESSAGES: {
      CONFIRM_VALIDATION: 'Confirmer la validation de ce versement ?',
      SUCCESS_VALIDATION: 'Versement validé avec succès',
      SUCCESS_REFUS: 'Versement refusé',
      ERROR_ALREADY_PROCESSED: 'Ce versement a déjà été traité'
    }
  }
};
```

## Permissions et Rôles

### Rôle: Agent

**Permissions:**
- ✅ Créer des versements (`POST /api/caisse/verser`)
- ✅ Voir son propre solde (`GET /api/caisse/solde`)
- ✅ Voir son propre historique (`GET /api/caisse/historique`)
- ❌ Valider/Refuser des versements
- ❌ Voir les versements des autres agents
- ❌ Voir la caisse des autres agents

### Rôle: Admin

**Permissions:**
- ✅ Voir tous les versements (`GET /api/caisse/versements`)
- ✅ Voir les versements en attente (`GET /api/caisse/versements/en-attente`)
- ✅ Valider des versements (`PUT /api/caisse/versements/:id/valider`)
- ✅ Refuser des versements (`PUT /api/caisse/versements/:id/refuser`)
- ✅ Voir la caisse de n'importe quel agent (`GET /api/caisse/agent/:id`)
- ❌ Créer des versements

## Méthodes de Paiement

### Configuration des méthodes

Dans `backend/controllers/caisseController.js`:

```javascript
// Méthodes de paiement acceptées
const PAYMENT_METHODS = [
  'especes',
  'virement',
  'carte',
  'cheque'
];

// Pour ajouter une nouvelle méthode:
// 1. Ajouter dans le modèle Transaction.js
// 2. Ajouter dans PAYMENT_METHODS
// 3. Ajouter dans les interfaces frontend
```

### Validation des références

```javascript
// Champs requis selon la méthode
const PAYMENT_REQUIREMENTS = {
  virement: {
    referencePaiement: true, // Référence obligatoire
    description: false
  },
  cheque: {
    referencePaiement: true, // Numéro de chèque obligatoire
    description: false
  },
  carte: {
    referencePaiement: true, // Référence transaction
    description: false
  },
  especes: {
    referencePaiement: false,
    description: false
  }
};
```

## Calcul du Solde

### Formule

```javascript
// Le solde d'un agent est calculé ainsi:

Solde = TotalACollecter - TotalVerse

Où:
  TotalACollecter = Σ (colis.montant + colis.fraisLivraison)
                    pour tous les colis avec status="livre"
                    et agence = agent.agence

  TotalVerse = Σ (transaction.montant)
               pour toutes les transactions avec:
               - type="versement"
               - status="validee"
               - utilisateur = agent._id
```

### Exemple

```javascript
// Agent a livré 3 colis:
Colis 1: montant=5000, frais=500  → 5500 DA
Colis 2: montant=8000, frais=700  → 8700 DA
Colis 3: montant=3000, frais=400  → 3400 DA

TotalACollecter = 5500 + 8700 + 3400 = 17600 DA

// Agent a fait 2 versements validés:
Versement 1: 10000 DA (validé)
Versement 2: 5000 DA (validé)
Versement 3: 2000 DA (en attente) → ne compte pas

TotalVerse = 10000 + 5000 = 15000 DA

Solde = 17600 - 15000 = 2600 DA
```

## Notifications (Future)

### Configuration Email

Pour activer les notifications par email:

```javascript
// Dans backend/.env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre-email@gmail.com
EMAIL_PASSWORD=votre-mot-de-passe
EMAIL_FROM=noreply@platforme-livraison.com

// Templates d'email
EMAIL_TEMPLATES = {
  VERSEMENT_CREE: 'versement-cree.html',
  VERSEMENT_VALIDE: 'versement-valide.html',
  VERSEMENT_REFUSE: 'versement-refuse.html',
  SOLDE_ELEVE: 'rappel-solde.html'
}
```

## Logs

### Configuration des logs

```javascript
// backend/config/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/caisse-error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/caisse-combined.log' 
    })
  ]
});

// Logs spécifiques caisse
logger.info('Versement créé', { 
  agent: userId, 
  montant: 10000 
});
logger.error('Erreur validation', { 
  error: err.message 
});
```

## Backup

### Backup automatique MongoDB

```bash
#!/bin/bash
# backup-caisse.sh

# Dossier de backup
BACKUP_DIR="/backups/caisse"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup uniquement de la collection transactions
mongodump \
  --db platforme_livraison \
  --collection transactions \
  --out $BACKUP_DIR/transactions_$DATE

# Garder seulement les 30 derniers jours
find $BACKUP_DIR -type d -mtime +30 -exec rm -rf {} \;
```

## Monitoring

### Métriques à surveiller

```javascript
// Exemple avec Prometheus/Grafana
const metrics = {
  // Nombre de versements par statut
  versements_total: Counter,
  versements_en_attente: Gauge,
  
  // Montants
  montant_verse_total: Counter,
  montant_en_attente: Gauge,
  
  // Performance
  api_response_time: Histogram,
  api_error_rate: Counter
};
```

## Déploiement

### Checklist avant déploiement

- [ ] Variables d'environnement configurées
- [ ] MongoDB avec index créés
- [ ] Backup automatique configuré
- [ ] Logs configurés
- [ ] HTTPS activé
- [ ] CORS configuré correctement
- [ ] Rate limiting activé
- [ ] Tests passés
- [ ] Documentation à jour

### Commandes de déploiement

```bash
# 1. Build (si nécessaire)
cd backend
npm run build

# 2. Démarrer avec PM2
pm2 start server.js --name "caisse-api"

# 3. Configurer auto-restart
pm2 startup
pm2 save

# 4. Monitoring
pm2 monit
```

---

**Note:** Cette configuration est un exemple. Adaptez-la selon vos besoins spécifiques.
