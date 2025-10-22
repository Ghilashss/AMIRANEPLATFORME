# 🚀 Backend API - Plateforme de Livraison

Backend RESTful API pour la plateforme de gestion de livraison avec Node.js, Express et MongoDB.

## 📋 Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Technologies utilisées](#technologies-utilisées)
- [Installation](#installation)
- [Configuration](#configuration)
- [Démarrage](#démarrage)
- [API Documentation](#api-documentation)
- [Structure du projet](#structure-du-projet)
- [Modèles de données](#modèles-de-données)

---

## ✨ Fonctionnalités

- ✅ Authentification JWT avec gestion des rôles (Admin, Agence, Agent, Commerçant)
- ✅ CRUD complet pour les colis, agences, wilayas
- ✅ Tracking de colis en temps réel
- ✅ Système de gestion des statuts de livraison
- ✅ Calcul automatique des frais de livraison
- ✅ Génération de QR codes pour les colis
- ✅ Gestion des réclamations
- ✅ Système de transactions financières
- ✅ Statistiques et rapports
- ✅ Rate limiting et sécurité renforcée

---

## 🛠️ Technologies utilisées

- **Runtime**: Node.js
- **Framework**: Express.js
- **Base de données**: MongoDB avec Mongoose
- **Authentification**: JWT (JSON Web Tokens)
- **Sécurité**: Helmet, bcryptjs, express-rate-limit
- **Validation**: express-validator
- **Upload**: Multer
- **QR Codes**: qrcode
- **Autres**: morgan, cors, dotenv

---

## 📦 Installation

### Prérequis

- Node.js (v14 ou supérieur)
- MongoDB (local ou Atlas)
- npm ou yarn

### Étapes d'installation

1. **Installer MongoDB**
   
   **Option 1 - MongoDB local:**
   - Téléchargez MongoDB: https://www.mongodb.com/try/download/community
   - Installez et démarrez le service MongoDB
   
   **Option 2 - MongoDB Atlas (Cloud):**
   - Créez un compte sur https://www.mongodb.com/cloud/atlas
   - Créez un cluster gratuit
   - Récupérez la connection string

2. **Installer les dépendances**
   ```bash
   cd backend
   npm install
   ```

3. **Configurer les variables d'environnement**
   ```bash
   cp .env.example .env
   ```
   
   Modifiez le fichier `.env` avec vos configurations:
   ```env
   NODE_ENV=development
   PORT=5000
   
   # MongoDB
   MONGODB_URI=mongodb://localhost:27017/platforme-livraison
   # Ou pour Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/platforme-livraison
   
   # JWT
   JWT_SECRET=votre_secret_super_complexe_changez_moi
   JWT_EXPIRE=7d
   
   # URLs
   FRONTEND_URL=http://localhost:3000
   API_URL=http://localhost:5000
   ```

---

## 🚀 Démarrage

### Mode développement (avec auto-reload)
```bash
npm run dev
```

### Mode production
```bash
npm start
```

Le serveur démarre sur `http://localhost:5000`

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentification

Toutes les routes protégées nécessitent un header Authorization:
```
Authorization: Bearer <votre_token_jwt>
```

---

## 🔐 Endpoints - Authentification

### 📝 Inscription
```http
POST /api/auth/register
Content-Type: application/json

{
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "jean.dupont@email.com",
  "telephone": "0555123456",
  "password": "motdepasse123",
  "role": "commercant",
  "wilaya": "16",
  "adresse": "123 Rue Example, Alger"
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Inscription réussie",
  "data": {
    "_id": "...",
    "nom": "Dupont",
    "email": "jean.dupont@email.com",
    "role": "commercant",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  }
}
```

### 🔑 Connexion
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "jean.dupont@email.com",
  "password": "motdepasse123"
}
```

### 👤 Profil utilisateur
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### ✏️ Mise à jour du profil
```http
PUT /api/auth/updateprofile
Authorization: Bearer <token>
Content-Type: application/json

{
  "nom": "Nouveau Nom",
  "telephone": "0666123456"
}
```

### 🔒 Changer le mot de passe
```http
PUT /api/auth/updatepassword
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "ancien_mot_de_passe",
  "newPassword": "nouveau_mot_de_passe"
}
```

---

## 📦 Endpoints - Colis

### ➕ Créer un colis
```http
POST /api/colis
Authorization: Bearer <token>
Content-Type: application/json

{
  "destinataire": {
    "nom": "Martin Paul",
    "telephone": "0777123456",
    "adresse": "456 Avenue Test",
    "wilaya": "16",
    "commune": "Alger Centre"
  },
  "typeLivraison": "domicile",
  "typeArticle": "vetements",
  "montant": 5000,
  "poids": 1.5,
  "notes": "Fragile"
}
```

### 📋 Liste des colis
```http
GET /api/colis?page=1&limit=20&status=en_attente&wilaya=16
Authorization: Bearer <token>
```

### 🔍 Détails d'un colis
```http
GET /api/colis/:id
Authorization: Bearer <token>
```

### 📍 Tracking public d'un colis
```http
GET /api/colis/tracking/:tracking
```

**Exemple:**
```http
GET /api/colis/tracking/COL2501150001
```

### 🔄 Mettre à jour le statut
```http
PUT /api/colis/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "en_livraison",
  "description": "Colis en cours de livraison"
}
```

**Statuts disponibles:**
- `en_attente` - En attente de traitement
- `accepte` - Accepté par l'agence
- `en_preparation` - En préparation
- `pret_a_expedier` - Prêt à expédier
- `expedie` - Expédié
- `en_transit` - En transit
- `arrive_agence` - Arrivé à l'agence
- `en_livraison` - En cours de livraison
- `livre` - Livré
- `echec_livraison` - Échec de livraison
- `en_retour` - En retour
- `retourne` - Retourné
- `annule` - Annulé

### 🏢 Affecter à une agence
```http
PUT /api/colis/:id/assign-agence
Authorization: Bearer <token> (Admin uniquement)
Content-Type: application/json

{
  "agenceId": "64f5a1b2c3d4e5f6g7h8i9j0"
}
```

### 🚚 Affecter à un livreur
```http
PUT /api/colis/:id/assign-livreur
Authorization: Bearer <token> (Agence/Admin)
Content-Type: application/json

{
  "livreurId": "64f5a1b2c3d4e5f6g7h8i9j0"
}
```

### 📊 Statistiques des colis
```http
GET /api/colis/stats
Authorization: Bearer <token>
```

### 🗑️ Supprimer un colis
```http
DELETE /api/colis/:id
Authorization: Bearer <token>
```

---

## 🏢 Endpoints - Agences

### ➕ Créer une agence
```http
POST /api/agences
Authorization: Bearer <token> (Admin uniquement)
Content-Type: application/json

{
  "nom": "Agence Alger Centre",
  "wilaya": "16",
  "wilayaText": "Alger",
  "email": "alger.centre@agence.com",
  "telephone": "021123456",
  "adresse": "123 Rue Didouche Mourad, Alger"
}
```

### 📋 Liste des agences
```http
GET /api/agences?wilaya=16&status=active
Authorization: Bearer <token>
```

### 🔍 Détails d'une agence
```http
GET /api/agences/:id
Authorization: Bearer <token>
```

### ✏️ Mettre à jour une agence
```http
PUT /api/agences/:id
Authorization: Bearer <token> (Admin uniquement)
Content-Type: application/json

{
  "telephone": "021999888",
  "status": "active"
}
```

### 📊 Statistiques d'une agence
```http
GET /api/agences/:id/stats
Authorization: Bearer <token>
```

### 🗺️ Agences par wilaya (Public)
```http
GET /api/agences/wilaya/:code
```

### 🗑️ Supprimer une agence
```http
DELETE /api/agences/:id
Authorization: Bearer <token> (Admin uniquement)
```

---

## 🗺️ Endpoints - Wilayas

### 📋 Liste des wilayas (Public)
```http
GET /api/wilayas
```

### 🔍 Détails d'une wilaya (Public)
```http
GET /api/wilayas/:code
```

### ➕ Créer une wilaya
```http
POST /api/wilayas
Authorization: Bearer <token> (Admin uniquement)
Content-Type: application/json

{
  "code": "16",
  "nom": "Alger",
  "fraisLivraison": {
    "domicile": 500,
    "stopDesk": 350
  },
  "delaiLivraison": "24-48h"
}
```

### ✏️ Mettre à jour une wilaya
```http
PUT /api/wilayas/:code
Authorization: Bearer <token> (Admin uniquement)
Content-Type: application/json

{
  "nom": "Alger Centre",
  "delaiLivraison": "24h"
}
```

### 💰 Mettre à jour les frais de livraison
```http
PUT /api/wilayas/:code/frais
Authorization: Bearer <token> (Admin uniquement)
Content-Type: application/json

{
  "domicile": 600,
  "stopDesk": 400
}
```

### 🗑️ Supprimer une wilaya
```http
DELETE /api/wilayas/:code
Authorization: Bearer <token> (Admin uniquement)
```

---

## 📁 Structure du projet

```
backend/
├── config/
│   └── database.js          # Configuration MongoDB
├── controllers/
│   ├── authController.js    # Logique authentification
│   ├── colisController.js   # Logique colis
│   ├── agenceController.js  # Logique agences
│   └── wilayaController.js  # Logique wilayas
├── middleware/
│   ├── auth.js             # Middleware authentification
│   └── error.js            # Gestionnaire d'erreurs
├── models/
│   ├── User.js             # Modèle utilisateur
│   ├── Colis.js            # Modèle colis
│   ├── Agence.js           # Modèle agence
│   ├── Wilaya.js           # Modèle wilaya
│   ├── Reclamation.js      # Modèle réclamation
│   └── Transaction.js      # Modèle transaction
├── routes/
│   ├── auth.js             # Routes authentification
│   ├── colis.js            # Routes colis
│   ├── agences.js          # Routes agences
│   └── wilayas.js          # Routes wilayas
├── utils/
│   └── helpers.js          # Fonctions utilitaires
├── uploads/                # Fichiers uploadés
├── .env.example           # Variables d'environnement
├── .gitignore
├── package.json
├── server.js              # Point d'entrée
└── README.md
```

---

## 🗄️ Modèles de données

### User
```javascript
{
  nom: String,
  prenom: String,
  email: String (unique),
  telephone: String,
  password: String (hashé),
  role: ['admin', 'agence', 'agent', 'commercant'],
  agence: ObjectId (ref Agence),
  wilaya: String,
  adresse: String,
  photo: String,
  status: ['active', 'inactive', 'suspended'],
  lastLogin: Date,
  timestamps: true
}
```

### Colis
```javascript
{
  tracking: String (unique),
  expediteur: {
    id: ObjectId (ref User),
    nom, telephone, adresse, wilaya
  },
  destinataire: {
    nom, telephone, adresse, wilaya, commune
  },
  typeLivraison: ['domicile', 'stopdesk'],
  typeArticle: String,
  poids: Number,
  montant: Number,
  fraisLivraison: Number,
  totalAPayer: Number,
  status: String,
  agence: ObjectId (ref Agence),
  livreur: ObjectId (ref User),
  historique: Array,
  dateCreation, dateExpedition, dateLivraison: Date,
  qrCode: String,
  timestamps: true
}
```

### Agence
```javascript
{
  code: String (unique),
  nom: String,
  wilaya: String,
  email: String (unique),
  telephone: String,
  adresse: String,
  caisse: {
    solde: Number,
    devise: String
  },
  statistiques: {
    totalColis, colisLivres, colisEnCours, colisRetournes: Number
  },
  status: ['active', 'inactive'],
  timestamps: true
}
```

### Wilaya
```javascript
{
  code: String (unique),
  nom: String,
  fraisLivraison: {
    domicile: Number,
    stopDesk: Number
  },
  delaiLivraison: String,
  status: ['active', 'inactive'],
  timestamps: true
}
```

---

## 🔒 Rôles et permissions

### Admin
- Accès complet à toutes les ressources
- Création/modification des agences et wilayas
- Affectation des colis aux agences
- Visualisation de toutes les statistiques

### Agence
- Gestion des colis affectés à son agence
- Affectation des colis aux livreurs
- Gestion des agents de son agence
- Statistiques de son agence

### Agent (Livreur)
- Visualisation des colis qui lui sont affectés
- Mise à jour du statut de livraison
- Scan des QR codes
- Collecte des paiements

### Commerçant
- Création de nouveaux colis
- Suivi de ses colis
- Historique et statistiques
- Réclamations

---

## 🧪 Tests

Pour tester l'API, vous pouvez utiliser:

### Postman
1. Importez la collection Postman (à créer)
2. Configurez les variables d'environnement

### cURL
```bash
# Test de connexion
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'

# Test tracking public
curl http://localhost:5000/api/colis/tracking/COL2501150001
```

---

## 🚨 Gestion des erreurs

L'API retourne des erreurs structurées:

```json
{
  "success": false,
  "message": "Description de l'erreur",
  "stack": "... (en développement uniquement)"
}
```

**Codes HTTP:**
- `200` - Succès
- `201` - Créé
- `400` - Mauvaise requête
- `401` - Non autorisé
- `403` - Interdit
- `404` - Non trouvé
- `500` - Erreur serveur

---

## 🔐 Sécurité

- Mots de passe hashés avec bcrypt
- JWT pour l'authentification
- Rate limiting pour prévenir les abus
- Helmet.js pour les headers de sécurité
- Validation des entrées
- CORS configuré

---

## 📈 Améliorations futures

- [ ] WebSockets pour les notifications en temps réel
- [ ] Export PDF des tickets de livraison
- [ ] Système d'emails automatiques
- [ ] Backup automatique de la base de données
- [ ] Logs avancés avec Winston
- [ ] Tests unitaires et d'intégration
- [ ] Documentation Swagger/OpenAPI
- [ ] Système de cache avec Redis
- [ ] Paiement en ligne intégré
- [ ] API mobile avec graphQL

---

## 📞 Support

Pour toute question ou problème:
- Créez une issue sur GitHub
- Contactez l'équipe de développement

---

## 📄 Licence

Ce projet est sous licence MIT.

---

**Développé avec ❤️ pour la gestion de livraison**
