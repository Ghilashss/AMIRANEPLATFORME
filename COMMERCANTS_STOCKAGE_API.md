# 📋 COMMERÇANTS - STOCKÉS DANS API MONGODB

## ✅ RÉPONSE RAPIDE

**OUI, les commerçants sont 100% stockés dans l'API MongoDB !** 🎉

---

## 📊 ARCHITECTURE COMPLÈTE

### 🗄️ **Base de Données: MongoDB**

**Modèle:** `backend/models/User.js`

```javascript
const userSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String },
  email: { type: String, required: true, unique: true },
  telephone: { type: String, required: true },
  password: { type: String, required: true, minlength: 6 },
  role: {
    type: String,
    enum: ['admin', 'agence', 'agent', 'commercant'],
    default: 'commercant'  // ✅ Par défaut
  },
  agence: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agence'
  },
  wilaya: { type: String },
  adresse: { type: String },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  }
}, {
  timestamps: true  // ✅ createdAt, updatedAt automatiques
});
```

**Collection MongoDB:** `users`

---

## 🔐 CRÉATION DE COMMERÇANTS

### 📍 **Qui peut créer un commerçant ?**

1. ✅ **Admin** (via dashboard admin)
2. ✅ **Agent** (via dashboard agent)
3. ❌ **Commerçant** (ne peut pas s'auto-créer)

---

### 🔵 **Création par AGENT**

**Fichier:** `dashboards/agent/js/commercants-manager.js`

**Workflow:**
```
1. Agent remplit le formulaire
   ↓
2. JavaScript récupère l'agence de l'agent
   ↓
3. POST vers /api/auth/register
   ↓
4. Backend valide et crée dans MongoDB
   ↓
5. Commerçant créé avec:
   - role: 'commercant'
   - agence: ID_AGENCE_AGENT
   - email, password, wilaya, etc.
```

**Code Frontend (lignes 50-95):**
```javascript
// Récupérer l'agence de l'agent connecté
const agentUser = JSON.parse(localStorage.getItem('agent_user') || '{}');
const agentAgenceId = agentUser.agence;

const formData = {
    nom: document.getElementById('commercantNom').value,
    prenom: document.getElementById('commercantPrenom').value,
    email: document.getElementById('commercantEmail').value,
    telephone: document.getElementById('commercantTelephone').value,
    password: document.getElementById('commercantPassword').value,
    role: 'commercant',  // ✅ Rôle fixé
    wilaya: document.getElementById('commercantWilaya').value,
    adresse: document.getElementById('commercantAdresse').value,
    agence: agentAgenceId  // ✅ Agence de l'agent
};

// ✅ Envoi vers API MongoDB
const response = await fetch('http://localhost:1000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
});
```

---

### 🔴 **Création par ADMIN**

**Workflow similaire:**
```
1. Admin remplit le formulaire
   ↓
2. Sélectionne l'agence manuellement
   ↓
3. POST vers /api/auth/register
   ↓
4. Commerçant créé dans MongoDB
```

---

## 📡 API ENDPOINTS

### 1️⃣ **Créer un commerçant**
```
POST /api/auth/register

Body:
{
  "nom": "Hessas",
  "prenom": "Mohamed",
  "email": "hessas@example.com",
  "telephone": "0555123456",
  "password": "123456",
  "role": "commercant",
  "agence": "67123abc456def789",
  "wilaya": "16",
  "adresse": "Alger"
}

Response:
{
  "success": true,
  "token": "jwt_token_here",
  "data": {
    "_id": "671abc...",
    "nom": "Hessas",
    "email": "hessas@example.com",
    "role": "commercant",
    "agence": "67123abc...",
    ...
  }
}
```

---

### 2️⃣ **Lister les commerçants**
```
GET /api/auth/users?role=commercant

Headers:
Authorization: Bearer <token>

Response:
{
  "success": true,
  "count": 15,
  "data": [
    {
      "_id": "671abc...",
      "nom": "Hessas",
      "prenom": "Mohamed",
      "email": "hessas@example.com",
      "telephone": "0555123456",
      "role": "commercant",
      "agence": "67123abc...",
      "wilaya": "16",
      "status": "active",
      "createdAt": "2025-10-19T10:30:00.000Z"
    },
    ...
  ]
}
```

**Fichier Backend:** `backend/controllers/authController.js` (lignes 222-248)

**Filtrage automatique:**
```javascript
exports.getUsers = async (req, res, next) => {
  const { role } = req.query;
  const filter = {};

  // Filtrer par rôle si spécifié
  if (role) {
    filter.role = role;  // ✅ role=commercant
  }

  // ✅ Si c'est un AGENT, ne montrer QUE les commercants de son agence
  if (req.user.role === 'agent' || req.user.role === 'agence') {
    filter.agence = req.user.agence;
    console.log(`🔍 Agent ${req.user._id} - Filtrage par agence ${req.user.agence}`);
  }

  const users = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: users.length,
    data: users
  });
};
```

---

## 🔍 FILTRAGE PAR RÔLE

### **Agent Dashboard**

Quand un **agent** charge la liste des commerçants :

```
Agent Alger (agence: AGC001) → GET /api/auth/users?role=commercant
   ↓
Backend filtre automatiquement:
   filter.role = 'commercant'
   filter.agence = 'AGC001'
   ↓
Résultat: UNIQUEMENT les commerçants d'Alger
```

**Code Frontend (lignes 105-115):**
```javascript
async function chargerCommercants() {
    const token = sessionStorage.getItem('auth_token') || localStorage.getItem('agent_token');
    
    // ✅ Le backend filtre automatiquement par agence
    const response = await fetch('http://localhost:1000/api/auth/users?role=commercant', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const result = await response.json();
    this.commercants = result.data || [];
    afficherCommercants(this.commercants);
}
```

---

### **Admin Dashboard**

Quand un **admin** charge la liste :

```
Admin → GET /api/auth/users?role=commercant
   ↓
Backend ne filtre PAS par agence (admin voit tout)
   ↓
Résultat: TOUS les commerçants de toutes les agences
```

---

## 📊 VISIBILITÉ PAR RÔLE

| Rôle | Voit | Champ filtré |
|------|------|--------------|
| **Agent Alger** | Commerçants d'Alger uniquement | `agence = AGC001` |
| **Agent Oran** | Commerçants d'Oran uniquement | `agence = AGC002` |
| **Admin** | TOUS les commerçants | Aucun filtre |
| **Commercant** | N/A (ne peut pas voir la liste) | - |

---

## 🔐 AUTHENTIFICATION COMMERÇANT

### **Login**

**Endpoint:** `POST /api/auth/login`

```javascript
// Frontend: commercant-login.html
const response = await fetch('http://localhost:1000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        email: 'hessas@example.com',
        password: '123456'
    })
});

// Backend vérifie:
// 1. Email existe ?
// 2. Password correct ?
// 3. Génère JWT token
// 4. Retourne user + token

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "_id": "671abc...",
    "nom": "Hessas",
    "email": "hessas@example.com",
    "role": "commercant",
    "agence": "67123abc..."
  }
}
```

---

## 💾 STOCKAGE

### ❌ **Aucun localStorage pour les commerçants !**

```javascript
// ❌ ANCIEN (avant migration):
localStorage.setItem('commercants', JSON.stringify([...]));

// ✅ ACTUEL (100% API):
await fetch('http://localhost:1000/api/auth/users?role=commercant');
```

### ✅ **Seuls les tokens sont en localStorage:**

```javascript
// Tokens d'authentification (acceptables)
localStorage.setItem('agent_token', token);
sessionStorage.setItem('auth_token', token);

// Infos utilisateur connecté (cache léger)
localStorage.setItem('agent_user', JSON.stringify({
    id: user._id,
    nom: user.nom,
    email: user.email,
    agence: user.agence
}));
```

---

## 🗂️ RELATION AVEC COLIS

### **Lien Commerçant ↔ Colis**

```javascript
// Modèle Colis (backend/models/Colis.js)
const colisSchema = new mongoose.Schema({
  expediteur: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',  // ✅ Référence au commerçant
      required: true
    },
    nom: String,
    telephone: String,
    wilaya: String
  },
  // ...
});
```

**Quand un commerçant crée un colis:**
```javascript
{
  expediteur: {
    id: "671abc...",  // ✅ ID du commerçant dans MongoDB
    nom: "Hessas",
    telephone: "0555123456"
  },
  destinataire: { ... },
  montant: 5000,
  ...
}
```

**Pour charger les colis d'un commerçant:**
```javascript
// Backend: colisController.js
if (req.user.role === 'commercant') {
  query['expediteur.id'] = req.user._id;  // ✅ Filtre par ID commerçant
}

const colis = await Colis.find(query);
```

---

## 📈 STATISTIQUES

### **Compter les commerçants:**

```javascript
// Total commerçants
const total = await User.countDocuments({ role: 'commercant' });

// Commerçants par agence
const totalAgence = await User.countDocuments({
  role: 'commercant',
  agence: agenceId
});

// Commerçants actifs
const actifs = await User.countDocuments({
  role: 'commercant',
  status: 'active'
});
```

---

## 🔄 CYCLE DE VIE COMPLET

```
┌─────────────────────────────────────────────────────────┐
│  CYCLE DE VIE D'UN COMMERÇANT                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. CRÉATION                                           │
│     Agent → Formulaire → POST /api/auth/register       │
│     ↓                                                  │
│     MongoDB → Collection "users"                        │
│     {                                                  │
│       role: 'commercant',                              │
│       agence: 'AGC001',                                │
│       status: 'active'                                 │
│     }                                                  │
│                                                         │
│  2. AUTHENTIFICATION                                   │
│     Commerçant → Login → POST /api/auth/login          │
│     ↓                                                  │
│     Backend → Vérifie email/password                   │
│     ↓                                                  │
│     Génère JWT token                                   │
│     ↓                                                  │
│     Frontend → Stocke token                            │
│                                                         │
│  3. UTILISATION                                        │
│     Commerçant connecté → Dashboard                    │
│     ↓                                                  │
│     Crée des colis (expediteur.id = son ID)           │
│     ↓                                                  │
│     Voit uniquement SES colis                          │
│                                                         │
│  4. GESTION                                            │
│     Agent → Liste commerçants                          │
│     ↓                                                  │
│     GET /api/auth/users?role=commercant                │
│     ↓                                                  │
│     Filtre automatique par agence                      │
│     ↓                                                  │
│     Affiche dans tableau moderne                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ RÉSUMÉ

### **Stockage:**
- ✅ **100% MongoDB** (collection `users`)
- ✅ **Modèle User** avec role='commercant'
- ❌ **Aucun localStorage** pour les données

### **Endpoints:**
- ✅ `POST /api/auth/register` - Créer
- ✅ `GET /api/auth/users?role=commercant` - Lister
- ✅ `POST /api/auth/login` - Se connecter

### **Filtrage:**
- ✅ **Agent** → Voit uniquement commercants de SON agence
- ✅ **Admin** → Voit TOUS les commercants
- ✅ **Filtrage automatique** au niveau backend

### **Sécurité:**
- ✅ **JWT tokens** pour authentification
- ✅ **Passwords hashés** avec bcrypt
- ✅ **Middleware protect** sur toutes les routes
- ✅ **Filtrage par agence** côté backend

---

## 📄 FICHIERS CONCERNÉS

### Backend:
- `backend/models/User.js` - Schéma MongoDB
- `backend/controllers/authController.js` - Logique (création, liste)
- `backend/routes/auth.js` - Routes API

### Frontend Agent:
- `dashboards/agent/js/commercants-manager.js` - Gestion CRUD
- `dashboards/agent/agent-dashboard.html` - Interface

### Frontend Commerçant:
- `commercant-login.html` - Page de connexion
- `dashboards/commercant/` - Dashboard commerçant

---

**Date:** 19 octobre 2025  
**Système:** 100% API MongoDB  
**localStorage:** ❌ Zéro donnée business  
**Sécurité:** ✅ Filtrage backend automatique
