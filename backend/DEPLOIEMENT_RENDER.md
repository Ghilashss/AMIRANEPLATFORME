# 🚀 Déploiement Backend - Platforme de Livraison

## 📋 Guide de Déploiement sur Render.com

### Étape 1: Préparer le Repository Git

```bash
cd backend
git init
git add .
git commit -m "Initial commit - Backend avec nouveau système de caisse"
```

### Étape 2: Créer un Repository GitHub

1. Aller sur https://github.com/new
2. Créer un nouveau repository: `platforme-livraison-backend`
3. **NE PAS** initialiser avec README
4. Copier l'URL du repository

```bash
git remote add origin https://github.com/VOTRE_USERNAME/platforme-livraison-backend.git
git branch -M main
git push -u origin main
```

### Étape 3: Configurer MongoDB Atlas (Base de données)

1. Aller sur https://www.mongodb.com/cloud/atlas
2. Créer un compte gratuit (Free Tier)
3. Créer un nouveau cluster (Région: Frankfurt ou Paris)
4. Dans **Database Access**: Créer un utilisateur
   - Username: `platforme_user`
   - Password: Générer un mot de passe fort (noter le!)
5. Dans **Network Access**: Ajouter `0.0.0.0/0` (autoriser toutes les IPs)
6. Cliquer sur **Connect** → **Connect your application**
7. Copier la connection string:
   ```
   mongodb+srv://platforme_user:<password>@cluster0.xxxxx.mongodb.net/platforme-livraison?retryWrites=true&w=majority
   ```
   ⚠️ Remplacer `<password>` par le vrai mot de passe!

### Étape 4: Déployer sur Render.com

1. Aller sur https://render.com
2. Créer un compte avec GitHub
3. Cliquer sur **New +** → **Web Service**
4. Connecter le repository `platforme-livraison-backend`
5. Configuration:
   - **Name**: `platforme-livraison-backend`
   - **Region**: Frankfurt (Europe)
   - **Branch**: `main`
   - **Root Directory**: (laisser vide)
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

6. **Variables d'environnement** (cliquer sur "Advanced"):

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://platforme_user:VOTRE_PASSWORD@cluster0.xxxxx.mongodb.net/platforme-livraison?retryWrites=true&w=majority
JWT_SECRET=GENERER_UN_SECRET_FORT_64_CARACTERES_MINIMUM_ICI_123456789
JWT_EXPIRE=7d
CORS_ORIGIN=https://votre-domaine-hostinger.com
FRONTEND_URL=https://votre-domaine-hostinger.com
API_URL=https://platforme-livraison-backend.onrender.com
```

7. Cliquer sur **Create Web Service**

### Étape 5: Vérifier le Déploiement

Une fois déployé, l'URL sera: `https://platforme-livraison-backend.onrender.com`

Tester:
```bash
curl https://platforme-livraison-backend.onrender.com/api/health
```

Réponse attendue:
```json
{
  "status": "ok",
  "message": "Backend en cours d'exécution",
  "timestamp": "2025-10-25T..."
}
```

---

## 🔧 Configuration Post-Déploiement

### 1. Créer un Utilisateur Admin

Utiliser Postman ou curl:

```bash
POST https://platforme-livraison-backend.onrender.com/api/auth/register
Content-Type: application/json

{
  "nom": "Admin",
  "prenom": "Système",
  "email": "admin@platforme.com",
  "password": "VotreMotDePasseSecurise123!",
  "telephone": "+213555000000",
  "role": "admin"
}
```

### 2. Se Connecter

```bash
POST https://platforme-livraison-backend.onrender.com/api/auth/login
Content-Type: application/json

{
  "email": "admin@platforme.com",
  "password": "VotreMotDePasseSecurise123!"
}
```

Copier le `token` reçu pour l'utiliser dans les prochaines requêtes.

### 3. Initialiser les Wilayas et Agences

```bash
# Créer les wilayas
POST https://platforme-livraison-backend.onrender.com/api/admin/wilayas
Authorization: Bearer VOTRE_TOKEN
Content-Type: application/json

[
  { "numero": "16", "nom": "Alger", "nom_ar": "الجزائر" },
  { "numero": "31", "nom": "Oran", "nom_ar": "وهران" },
  // ... autres wilayas
]
```

---

## 🌐 Mettre à Jour le Frontend (Hostinger)

### 1. Modifier config.js

Mettre à jour `dashboards/config.js`:

```javascript
const config = {
  apiUrl: 'https://platforme-livraison-backend.onrender.com/api',
  // ... autres configs
};
```

### 2. Télécharger sur Hostinger

Via FileZilla ou le File Manager de Hostinger:
1. Uploader tous les fichiers du dossier `dashboards/`
2. S'assurer que `config.js` est bien mis à jour

---

## 📊 Monitoring et Logs

### Voir les Logs sur Render

1. Aller sur https://dashboard.render.com
2. Sélectionner votre service
3. Onglet **Logs** pour voir les logs en temps réel

### Endpoints de Test

- **Health Check**: `GET /api/health`
- **Liste Wilayas**: `GET /api/admin/wilayas`
- **Login**: `POST /api/auth/login`
- **Caisse Stats**: `GET /api/caisse/stats/:userId` (avec token)

---

## ⚠️ Important - Free Tier Render.com

Sur le plan gratuit de Render:
- Le service **s'endort après 15 minutes d'inactivité**
- La **première requête** après endormissement prend 30-60 secondes
- **750 heures/mois gratuites** (suffisant pour un projet)
- Le service redémarre automatiquement chaque mois

**Solution**: Utiliser un service de ping (UptimeRobot) pour garder le service actif.

---

## 🔐 Sécurité

### Générer un JWT Secret Fort

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copier le résultat dans la variable `JWT_SECRET` sur Render.

### Restreindre CORS

Dans les variables d'environnement, mettre votre vrai domaine:
```
CORS_ORIGIN=https://votre-domaine-hostinger.com
```

---

## 📱 Endpoints API Disponibles

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur

### Colis
- `POST /api/colis` - Créer un colis
- `GET /api/colis` - Liste des colis
- `PUT /api/colis/:id` - Modifier un colis
- `PUT /api/colis/:id/status` - Changer le statut

### Caisse (Nouveau Système)
- `GET /api/caisse/compte/:userId` - Compte utilisateur
- `GET /api/caisse/stats/:userId` - Statistiques
- `GET /api/caisse/transactions` - Toutes les transactions (Admin)
- `POST /api/caisse/transaction` - Créer une transaction
- `PUT /api/caisse/transaction/:id/valider` - Valider (Admin)
- `PUT /api/caisse/transaction/:id/refuser` - Refuser (Admin)

### Agences
- `POST /api/admin/agences` - Créer une agence
- `GET /api/admin/agences` - Liste des agences
- `PUT /api/admin/agences/:id` - Modifier une agence

### Wilayas
- `POST /api/admin/wilayas` - Créer des wilayas
- `GET /api/admin/wilayas` - Liste des wilayas

---

## 🐛 Résolution de Problèmes

### Le service ne démarre pas
- Vérifier les logs sur Render
- Vérifier que `MONGODB_URI` est correct
- Vérifier que toutes les variables d'environnement sont définies

### Erreur de connexion MongoDB
- Vérifier que l'IP `0.0.0.0/0` est autorisée dans MongoDB Atlas
- Vérifier le mot de passe dans la connection string
- Vérifier que le cluster MongoDB est actif

### CORS Error depuis le frontend
- Vérifier que `CORS_ORIGIN` contient le bon domaine
- S'assurer qu'il n'y a pas de `/` à la fin de l'URL

### Les transactions ne se créent pas automatiquement
- Vérifier les logs du serveur
- S'assurer que le modèle `Colis.js` a bien les hooks post-save
- Vérifier que les comptes existent pour l'agent et le commerçant

---

## 📞 Support

Pour toute question:
1. Vérifier les logs sur Render
2. Tester les endpoints avec Postman
3. Vérifier la console du navigateur pour les erreurs frontend

---

**Date**: 25 Octobre 2025
**Version**: 1.0.0
**Status**: ✅ Prêt pour le déploiement
