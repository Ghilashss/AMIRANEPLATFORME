# 🚀 DÉPLOIEMENT RAPIDE - RENDER.COM

## ✅ Étape 1: Code poussé sur GitHub
Repository: https://github.com/Ghilashss/AMIRANEPLATFORME

## 📋 Étape 2: Configurer MongoDB Atlas

### 2.1 Créer un compte MongoDB Atlas
1. Aller sur: https://www.mongodb.com/cloud/atlas/register
2. S'inscrire (gratuit)
3. Créer un nouveau projet: "Platforme Livraison"

### 2.2 Créer un Cluster
1. Cliquer sur "Build a Database"
2. Choisir **FREE** (M0 Sandbox)
3. Provider: **AWS**
4. Region: **Frankfurt (eu-central-1)** ou **Paris (eu-west-3)**
5. Cluster Name: `Cluster0`
6. Cliquer sur "Create"

### 2.3 Configurer l'accès
1. **Database Access** (menu gauche):
   - Cliquer sur "Add New Database User"
   - Username: `platforme_user`
   - Password: Cliquer sur "Autogenerate Secure Password" → **COPIER LE MOT DE PASSE!**
   - Database User Privileges: "Atlas admin"
   - Cliquer sur "Add User"

2. **Network Access** (menu gauche):
   - Cliquer sur "Add IP Address"
   - Cliquer sur "Allow Access from Anywhere"
   - IP Address: `0.0.0.0/0` (déjà rempli)
   - Cliquer sur "Confirm"

### 2.4 Obtenir la Connection String
1. Retourner sur "Database"
2. Cliquer sur "Connect" (bouton sur votre cluster)
3. Choisir "Connect your application"
4. Driver: **Node.js**, Version: **5.5 or later**
5. **COPIER la connection string**:
   ```
   mongodb+srv://platforme_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Remplacer `<password>` par le vrai mot de passe**
7. **Ajouter le nom de la base**: `.../platforme-livraison?retryWrites=...`

Connection string finale:
```
mongodb+srv://platforme_user:VOTRE_PASSWORD@cluster0.xxxxx.mongodb.net/platforme-livraison?retryWrites=true&w=majority
```

---

## 🌐 Étape 3: Déployer sur Render.com

### 3.1 Créer un compte Render
1. Aller sur: https://render.com
2. S'inscrire avec GitHub
3. Autoriser Render à accéder à vos repositories

### 3.2 Créer un Web Service
1. Sur le dashboard, cliquer sur **"New +"** → **"Web Service"**
2. **Connect a repository**:
   - Chercher: `AMIRANEPLATFORME`
   - Cliquer sur "Connect"
3. **Configuration du service**:

```
Name: platforme-livraison-backend
Region: Frankfurt (EU Central)
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm start
Instance Type: Free
```

4. **Variables d'environnement** (cliquer sur "Advanced"):

Cliquer sur "Add Environment Variable" pour chaque variable:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `MONGODB_URI` | `mongodb+srv://platforme_user:VOTRE_PASSWORD@cluster0.xxxxx.mongodb.net/platforme-livraison?retryWrites=true&w=majority` |
| `JWT_SECRET` | Générer un secret fort (voir ci-dessous) |
| `JWT_EXPIRE` | `7d` |
| `CORS_ORIGIN` | `*` (ou votre domaine Hostinger) |
| `FRONTEND_URL` | `https://votre-domaine.com` |
| `API_URL` | (laisser vide pour l'instant) |

**Générer JWT_SECRET fort:**
Ouvrir PowerShell et exécuter:
```powershell
$bytes = New-Object byte[] 64
(New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```
Copier le résultat dans `JWT_SECRET`

5. Cliquer sur **"Create Web Service"**

### 3.3 Attendre le déploiement
- Le build prend environ 2-3 minutes
- Les logs s'affichent en temps réel
- Attendre le message: "Your service is live 🎉"

### 3.4 Noter l'URL du backend
L'URL sera quelque chose comme:
```
https://platforme-livraison-backend.onrender.com
```

**COPIER CETTE URL!** Vous en aurez besoin pour le frontend.

---

## 🧪 Étape 4: Tester le Backend

### 4.1 Test Health Check
Ouvrir un navigateur et aller sur:
```
https://platforme-livraison-backend.onrender.com/api/health
```

Vous devriez voir:
```json
{
  "status": "ok",
  "message": "Backend en cours d'exécution",
  "timestamp": "2025-10-25T...",
  "environment": "production"
}
```

### 4.2 Créer un utilisateur Admin (via Postman ou Thunder Client)

**POST** `https://platforme-livraison-backend.onrender.com/api/auth/register`

Headers:
```
Content-Type: application/json
```

Body (JSON):
```json
{
  "nom": "Admin",
  "prenom": "Système",
  "email": "admin@platforme.com",
  "password": "Admin123!Secure",
  "telephone": "+213555000000",
  "role": "admin",
  "agence": null
}
```

Réponse attendue (200 OK):
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "nom": "Admin",
    "email": "admin@platforme.com",
    "role": "admin"
  }
}
```

**COPIER LE TOKEN!**

### 4.3 Tester la connexion

**POST** `https://platforme-livraison-backend.onrender.com/api/auth/login`

Headers:
```
Content-Type: application/json
```

Body:
```json
{
  "email": "admin@platforme.com",
  "password": "Admin123!Secure"
}
```

---

## 🔄 Étape 5: Mettre à jour le Frontend

### 5.1 Modifier config.js

Ouvrir `dashboards/config.js` et mettre à jour:

```javascript
const config = {
  apiUrl: 'https://platforme-livraison-backend.onrender.com/api',
  // ... reste inchangé
};
```

### 5.2 Tester en local

1. Ouvrir `login.html` dans un navigateur
2. Se connecter avec:
   - Email: `admin@platforme.com`
   - Password: `Admin123!Secure`
3. Vérifier que la connexion fonctionne

### 5.3 Uploader sur Hostinger

Via FileZilla ou File Manager:
1. Se connecter à Hostinger
2. Aller dans `public_html/` (ou votre dossier web)
3. Uploader tous les fichiers de `dashboards/`
4. S'assurer que `config.js` est bien mis à jour

---

## ⚠️ IMPORTANT - Free Tier Render.com

### Limitations du plan gratuit:
- ⏰ Le service **s'endort après 15 minutes d'inactivité**
- 🐌 La première requête après endormissement prend **30-60 secondes**
- 🆓 **750 heures/mois** de temps d'exécution (largement suffisant)
- 🔄 Le service redémarre automatiquement chaque mois

### Solution: UptimeRobot (optionnel)

Pour garder le service actif:
1. Créer un compte sur: https://uptimerobot.com
2. Ajouter un nouveau monitor:
   - Monitor Type: **HTTP(s)**
   - Friendly Name: `Platforme Backend`
   - URL: `https://platforme-livraison-backend.onrender.com/api/health`
   - Monitoring Interval: **5 minutes**
3. Sauvegarder

Le service restera actif 24/7!

---

## 📊 Monitoring

### Voir les logs sur Render:
1. Aller sur: https://dashboard.render.com
2. Cliquer sur votre service
3. Onglet **"Logs"** pour voir les logs en temps réel
4. Onglet **"Metrics"** pour voir les statistiques

### Redémarrer le service:
1. Dans le dashboard Render
2. Cliquer sur **"Manual Deploy"** → **"Deploy latest commit"**

---

## 🎉 C'EST TERMINÉ!

Votre backend est maintenant déployé et accessible via:
```
https://platforme-livraison-backend.onrender.com
```

### Endpoints principaux:
- `GET /api/health` - Health check
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription
- `GET /api/caisse/compte/:userId` - Compte caisse
- `GET /api/colis` - Liste des colis
- Et tous les autres endpoints...

### Prochaines étapes:
1. ✅ Créer des wilayas via l'interface admin
2. ✅ Créer des agences
3. ✅ Créer des agents et commerçants
4. ✅ Tester le système de caisse

---

**Date**: 25 Octobre 2025
**Status**: ✅ Backend déployé sur Render.com
**URL Backend**: https://platforme-livraison-backend.onrender.com
