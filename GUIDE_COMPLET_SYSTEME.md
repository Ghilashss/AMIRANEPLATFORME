# 🚀 GUIDE COMPLET - Système de Gestion d'Agences avec Caisse

## 📋 Table des Matières
1. [Vue d'ensemble](#vue-densemble)
2. [Fonctionnalités implémentées](#fonctionnalités-implémentées)
3. [Guide de démarrage](#guide-de-démarrage)
4. [Utilisation du système](#utilisation-du-système)
5. [API Documentation](#api-documentation)
6. [Tests](#tests)

---

## 🎯 Vue d'ensemble

Système complet de gestion d'agences de livraison avec :
- ✅ Authentification sécurisée (JWT)
- ✅ Gestion des rôles (Admin / Agent)
- ✅ Système de caisse intégré
- ✅ Versements agent → admin
- ✅ Restriction d'accès par wilaya

---

## ✨ Fonctionnalités Implémentées

### 1. **Création d'Agence (Admin uniquement)**
Quand l'admin crée une agence :
- ✅ Enregistrement de l'agence dans la base de données
- ✅ Création automatique d'un compte utilisateur avec rôle "agent"
- ✅ Génération d'un code agence unique (ex: AG2510-16-234)
- ✅ Initialisation du solde de caisse à 0
- ✅ L'agent peut se connecter avec email/password

**Champs requis :**
- Nom de l'agence
- Email
- Mot de passe
- Téléphone
- Wilaya
- Adresse (optionnel)

### 2. **Système d'Authentification**

#### **Admin**
- Email: `admin@example.com`
- Mot de passe: `admin123`
- Accès : TOUTES les wilayas et agences
- Peut : créer/modifier/supprimer agences, valider versements

#### **Agent**
- Email: celui défini lors de la création
- Mot de passe: celui défini lors de la création
- Accès : UNIQUEMENT sa wilaya
- Peut : faire des versements, voir son solde

### 3. **Système de Caisse**

#### **Pour l'Agent :**
- 📊 Voir son solde actuel
- 📊 Total à collecter (montant des colis)
- 📊 Total versé à l'admin
- 📊 Montant en attente de validation
- 💰 Faire un versement vers l'admin
- 📜 Historique des versements (en attente/validés/refusés)

#### **Pour l'Admin :**
- 📋 Liste de TOUTES les agences
- 👁️ Solde de chaque agence
- ✅ Valider les versements en attente
- ❌ Refuser les versements (avec motif)
- 📈 Statistiques globales
- 📜 Historique complet des transactions

### 4. **Logique des Versements**

```
Agent fait un versement de 10,000 DA
↓
Status: "en attente"
↓
Admin valide OU refuse
↓
Si validé:
  - Solde agent : -10,000 DA
  - Montant versé agent : +10,000 DA
  - Admin reçoit : +10,000 DA
  - Status: "validé"
  
Si refusé:
  - Rien ne change
  - Status: "refusé"
  - Motif enregistré
```

---

## 🚀 Guide de Démarrage

### Prérequis
- Node.js (v14+)
- MongoDB (v4+)
- Navigateur web moderne

### Installation

#### 1. **Démarrer MongoDB**
```bash
mongod
```

#### 2. **Démarrer le Backend**
```bash
cd backend
npm install
node server.js
```
✅ Backend actif sur : http://localhost:5000

#### 3. **Démarrer le Frontend**
```bash
# À la racine du projet
node server-frontend.js
```
✅ Frontend actif sur : http://localhost:8080

#### 4. **Créer un compte Admin (première fois)**
```bash
# Dans un autre terminal
cd backend
node seed.js
```
Cela créera un compte admin par défaut.

---

## 💻 Utilisation du Système

### 🔐 **Connexion**

1. Ouvrir : http://localhost:8080/login-new.html
2. Entrer les identifiants :
   - **Admin :** admin@example.com / admin123
   - **Agent :** email de l'agence / mot de passe défini

### 👨‍💼 **En tant qu'Admin**

#### **Créer une Agence**
1. Aller dans le dashboard admin
2. Cliquer sur "Agences" dans le menu
3. Cliquer sur "Nouvelle Agence"
4. Remplir le formulaire :
   ```
   Nom: Agence Alger Centre
   Email: agence.alger@example.com
   Mot de passe: password123
   Téléphone: 0555123456
   Wilaya: 16 (Alger)
   ```
5. Cliquer sur "Enregistrer"

✅ **Résultat :**
- Agence créée dans la base de données
- Compte utilisateur créé automatiquement
- Code agence généré (ex: AG2510-16-234)
- L'agent peut maintenant se connecter !

#### **Gérer la Caisse**
1. Cliquer sur "Caisse" dans le menu
2. Voir la liste des agences avec leur solde
3. Section "Versements en attente" :
   - Voir les demandes de versement
   - Cliquer sur ✅ pour valider
   - Cliquer sur ❌ pour refuser (+ motif)

### 👨‍🔧 **En tant qu'Agent**

#### **Faire un Versement**
1. Se connecter avec les identifiants de l'agence
2. Aller dans "Caisse"
3. Voir le tableau de bord :
   ```
   📊 Total à collecter : 50,000 DA
   💰 Total versé : 20,000 DA
   ⏳ En attente : 5,000 DA
   💵 Solde actuel : 25,000 DA
   ```
4. Cliquer sur "Nouveau Versement"
5. Remplir :
   ```
   Montant : 10000
   Méthode : Espèces
   Description : Versement du 14/10/2025
   ```
6. Soumettre

✅ **Résultat :**
- Transaction créée avec status "en attente"
- Visible dans l'historique
- Admin peut valider/refuser

#### **Consulter l'Historique**
1. Dans la page Caisse
2. Voir le tableau avec :
   - Date
   - Montant
   - Méthode de paiement
   - Status (🟡 En attente / ✅ Validé / ❌ Refusé)
   - Description
3. Filtrer par status ou date

---

## 📡 API Documentation

### **Base URL**
```
http://localhost:5000/api
```

### **Authentification**

#### **POST /auth/login**
Connexion utilisateur
```json
Request:
{
  "email": "admin@example.com",
  "password": "admin123"
}

Response:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "nom": "Admin",
    "email": "admin@example.com",
    "role": "admin",
    "wilaya": null,
    "agence": null
  }
}
```

### **Agences**

#### **POST /agences**
Créer une agence (Admin uniquement)
```json
Headers:
{
  "Authorization": "Bearer <token>"
}

Request:
{
  "nom": "Agence Alger Centre",
  "email": "agence.alger@example.com",
  "password": "password123",
  "telephone": "0555123456",
  "wilaya": "16",
  "adresse": "Centre ville, Alger"
}

Response:
{
  "success": true,
  "message": "Agence et compte utilisateur créés avec succès",
  "data": {
    "agence": {
      "_id": "...",
      "code": "AG2510-16-234",
      "nom": "Agence Alger Centre",
      "email": "agence.alger@example.com",
      "wilaya": "16",
      "caisse": {
        "solde": 0,
        "totalCollecte": 0,
        "totalVerse": 0
      },
      "userId": "..."
    },
    "user": {
      "id": "...",
      "nom": "Agence Alger Centre",
      "email": "agence.alger@example.com",
      "role": "agent",
      "wilaya": "16"
    }
  }
}
```

#### **GET /agences**
Obtenir toutes les agences
```json
Headers:
{
  "Authorization": "Bearer <token>"
}

Response:
{
  "success": true,
  "count": 5,
  "data": [...]
}
```

### **Caisse**

#### **POST /caisse/verser** (Agent uniquement)
Faire un versement
```json
Headers:
{
  "Authorization": "Bearer <token>"
}

Request:
{
  "montant": 10000,
  "methodePaiement": "especes",
  "referencePaiement": "REF-2510-001",
  "description": "Versement du 14/10/2025"
}

Response:
{
  "success": true,
  "message": "Versement enregistré avec succès",
  "data": {
    "_id": "...",
    "agent": "...",
    "montant": 10000,
    "status": "en-attente",
    "methodePaiement": "especes",
    "description": "Versement du 14/10/2025"
  }
}
```

#### **GET /caisse/solde** (Agent uniquement)
Obtenir le solde de l'agent
```json
Headers:
{
  "Authorization": "Bearer <token>"
}

Response:
{
  "success": true,
  "data": {
    "totalACollecter": 50000,
    "totalVerse": 20000,
    "totalEnAttente": 5000,
    "soldeActuel": 25000
  }
}
```

#### **PUT /caisse/versements/:id/valider** (Admin uniquement)
Valider un versement
```json
Headers:
{
  "Authorization": "Bearer <token>"
}

Response:
{
  "success": true,
  "message": "Versement validé avec succès",
  "data": {
    "_id": "...",
    "status": "validé",
    "dateValidation": "2025-10-14T10:30:00.000Z"
  }
}
```

---

## 🧪 Tests

### Test de Création d'Agence

1. **Backend actif :** ✅
2. **Connexion admin :** ✅
3. **Créer une agence via l'interface**
4. **Vérifier dans MongoDB :**
   ```javascript
   // Collections à vérifier
   db.agences.find()
   db.users.find({ role: "agent" })
   ```

### Test de Connexion Agent

1. **Utiliser les identifiants de l'agence créée**
2. **Se connecter via login-new.html**
3. **Vérifier la redirection vers agent-dashboard.html**
4. **Vérifier l'accès uniquement à sa wilaya**

### Test de Versement

1. **En tant qu'agent :**
   - Aller dans Caisse
   - Créer un versement de 10,000 DA
   - Vérifier le status "en attente"

2. **En tant qu'admin :**
   - Aller dans Caisse
   - Voir le versement en attente
   - Valider le versement
   - Vérifier la mise à jour des soldes

---

## 🔧 Configuration

### Variables d'Environnement (.env)
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/delivery_platform
JWT_SECRET=votre_secret_jwt_très_sécurisé
JWT_EXPIRE=30d
```

### Ports Utilisés
- Backend: `5000`
- Frontend: `8080`
- MongoDB: `27017`

---

## 📚 Ressources

- **Backend :** Express.js + MongoDB + JWT
- **Frontend :** HTML5 + CSS3 + JavaScript ES6
- **Base de données :** MongoDB avec Mongoose
- **Authentification :** JWT (JSON Web Tokens)

---

## 🐛 Résolution de Problèmes

### Erreur "Cannot connect to MongoDB"
```bash
# Vérifier que MongoDB est démarré
mongod
```

### Erreur 404 sur les routes API
```bash
# Vérifier que le backend est démarré
cd backend
node server.js
```

### Agence créée mais ne peut pas se connecter
```bash
# Vérifier dans MongoDB que l'utilisateur existe
mongo
use delivery_platform
db.users.find({ role: "agent" })
```

---

## ✅ Checklist de Vérification

- [x] Backend démarré (port 5000)
- [x] Frontend démarré (port 8080)
- [x] MongoDB actif (port 27017)
- [x] Compte admin créé
- [x] Page de connexion accessible
- [x] Création d'agence fonctionnelle
- [x] Connexion agent fonctionnelle
- [x] Système de caisse opérationnel
- [x] Versements agent → admin
- [x] Validation admin des versements

---

## 🎉 Félicitations !

Votre plateforme est maintenant complètement opérationnelle avec :
- ✅ Gestion complète des agences
- ✅ Authentification sécurisée
- ✅ Système de caisse intégré
- ✅ Versements et validations
- ✅ Restrictions d'accès par wilaya

**Prochaines étapes suggérées :**
1. Ajouter des statistiques avancées
2. Système de notifications
3. Export Excel des transactions
4. Dashboard avec graphiques
5. Gestion des colis par agence

---

**Besoin d'aide ?** Consultez les logs dans la console du navigateur (F12) et dans le terminal du backend.
