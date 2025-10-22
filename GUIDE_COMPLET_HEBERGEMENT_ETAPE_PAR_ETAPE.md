# 🚀 GUIDE COMPLET : HÉBERGER TON APPLICATION SUR HOSTINGER

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Prérequis et coûts](#prérequis-et-coûts)
3. [Étape 1 : Préparer la base de données](#étape-1--préparer-la-base-de-données)
4. [Étape 2 : Héberger le Backend](#étape-2--héberger-le-backend)
5. [Étape 3 : Configurer le Frontend](#étape-3--configurer-le-frontend)
6. [Étape 4 : Déployer sur Hostinger](#étape-4--déployer-sur-hostinger)
7. [Étape 5 : Tests et vérifications](#étape-5--tests-et-vérifications)
8. [Dépannage](#dépannage)

---

## 📊 VUE D'ENSEMBLE

Ton application a 2 parties :
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  FRONTEND (HTML/CSS/JS)                             │
│  ├── dashboards/                                    │
│  ├── admin/                                         │
│  ├── agent/                                         │
│  └── commercant/                                    │
│                                                     │
│  👉 Va sur Hostinger (Hébergement Web)              │
│                                                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                                                     │
│  BACKEND (Node.js + Express)                        │
│  ├── backend/                                       │
│  ├── server.js                                      │
│  ├── controllers/                                   │
│  └── models/                                        │
│                                                     │
│  👉 Va sur VPS ou Railway.app                       │
│                                                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                                                     │
│  BASE DE DONNÉES (MongoDB)                          │
│  └── Collections (colis, users, agences...)         │
│                                                     │
│  👉 MongoDB Atlas (GRATUIT)                         │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 💰 PRÉREQUIS ET COÛTS

### Ce dont tu as besoin

| Service | Coût | Obligatoire? | Recommandation |
|---------|------|-------------|----------------|
| **Nom de domaine** | 10-15€/an | ✅ Oui | Hostinger, Namecheap |
| **Hébergement Web** (Frontend) | 2-5€/mois | ✅ Oui | Hostinger Premium |
| **VPS** (Backend Node.js) | 0-20€/mois | ✅ Oui | Railway.app (gratuit) ⭐ |
| **MongoDB Atlas** | Gratuit | ✅ Oui | Cluster M0 (gratuit) |
| **SSL Certificate** | Gratuit | ✅ Oui | Let's Encrypt (inclus) |

### 💡 Option recommandée (la moins chère)
```
✅ Hostinger Premium (3€/mois) → Frontend
✅ Railway.app (GRATUIT) → Backend Node.js
✅ MongoDB Atlas (GRATUIT) → Base de données
✅ Domaine (.com) → 10€/an

TOTAL: ~3€/mois + 10€/an = 46€/an (~4€/mois)
```

---

## 🗄️ ÉTAPE 1 : PRÉPARER LA BASE DE DONNÉES

### 1.1 Créer un compte MongoDB Atlas

1. Va sur [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Crée un compte (email + mot de passe)
3. Choisis l'option **GRATUITE** (M0 Sandbox)

### 1.2 Créer un cluster

```
1. Clique sur "Build a Database"
2. Choisis "M0 FREE" (512 MB storage)
3. Provider: AWS
4. Region: eu-west-3 (Paris) ← Plus proche de l'Algérie
5. Cluster Name: "platforme-colis"
6. Clique sur "Create"
```

**⏱️ Attends 3-5 minutes** que le cluster soit créé.

### 1.3 Configurer la sécurité

#### A. Créer un utilisateur de base de données

```
1. Onglet "Database Access" (à gauche)
2. Clique "Add New Database User"
3. Username: admin_platforme
4. Password: [GÉNÈRE UN MOT DE PASSE FORT] ← NOTE-LE !
5. Database User Privileges: "Read and write to any database"
6. Clique "Add User"
```

#### B. Autoriser les connexions

```
1. Onglet "Network Access" (à gauche)
2. Clique "Add IP Address"
3. Clique "ALLOW ACCESS FROM ANYWHERE"
   (Ajoute 0.0.0.0/0)
4. Clique "Confirm"
```

⚠️ **En production**, limite les IPs autorisées pour plus de sécurité.

### 1.4 Obtenir l'URL de connexion

```
1. Retourne à "Database" (onglet à gauche)
2. Clique sur "Connect" (bouton sur ton cluster)
3. Choisis "Connect your application"
4. Driver: Node.js
5. Version: 4.1 or later
6. Copie l'URL de connexion :
```

```
mongodb+srv://admin_platforme:<password>@platforme-colis.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

**🚨 IMPORTANT** : Remplace `<password>` par ton vrai mot de passe !

**Exemple final :**
```
mongodb+srv://admin_platforme:MonMotDePasse123@platforme-colis.abc123.mongodb.net/platforme?retryWrites=true&w=majority
```

**✅ GARDE CETTE URL EN SÉCURITÉ !**

### 1.5 Importer tes données (si tu en as)

Si tu as déjà des données locales :

```powershell
# Exporter depuis MongoDB local
mongodump --db platforme --out ./backup

# Importer vers MongoDB Atlas
mongorestore --uri "mongodb+srv://admin_platforme:password@cluster.mongodb.net/platforme" ./backup/platforme
```

Ou utilise **MongoDB Compass** (interface graphique) :
1. Télécharge [MongoDB Compass](https://www.mongodb.com/try/download/compass)
2. Connecte-toi à ton cluster Atlas
3. Importe tes collections

---

## 🖥️ ÉTAPE 2 : HÉBERGER LE BACKEND

### Option A : Railway.app (GRATUIT - Recommandé) ⭐

#### 2.1 Créer un compte Railway

1. Va sur [https://railway.app](https://railway.app)
2. Clique "Start a New Project"
3. Connecte-toi avec GitHub

#### 2.2 Préparer ton code backend

**A. Créer un fichier `.gitignore` dans le dossier `backend/` :**

```
node_modules/
.env
*.log
.DS_Store
```

**B. Créer un fichier `.env.example` :**

```env
NODE_ENV=production
PORT=1000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/platforme
JWT_SECRET=ton_secret_ultra_securise_change_moi
CORS_ORIGIN=https://ton-domaine.com
```

**C. Vérifier `package.json` :**

```json
{
  "name": "platforme-backend",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.0.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.0.3"
  }
}
```

#### 2.3 Créer un repo GitHub

```powershell
# Dans le dossier backend/
cd backend

# Initialiser Git (si pas déjà fait)
git init

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "Initial backend setup"

# Créer un repo sur GitHub et pousser
git remote add origin https://github.com/TON_USERNAME/platforme-backend.git
git branch -M main
git push -u origin main
```

#### 2.4 Déployer sur Railway

```
1. Sur Railway, clique "New Project"
2. Choisis "Deploy from GitHub repo"
3. Sélectionne ton repo "platforme-backend"
4. Railway détecte automatiquement Node.js
5. Clique "Deploy"
```

#### 2.5 Configurer les variables d'environnement

```
1. Dans ton projet Railway, onglet "Variables"
2. Ajoute ces variables :

   NODE_ENV = production
   PORT = 1000
   MONGODB_URI = mongodb+srv://admin_platforme:password@cluster.mongodb.net/platforme
   JWT_SECRET = [GÉNÈRE UN SECRET FORT - 64 caractères]
   CORS_ORIGIN = https://ton-domaine.com

3. Clique "Save"
4. Le projet redémarre automatiquement
```

**🔐 Générer un JWT_SECRET fort :**

```powershell
# Dans PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | % {[char]$_})
```

#### 2.6 Obtenir l'URL du backend

```
1. Dans ton projet Railway
2. Onglet "Settings"
3. Section "Domains"
4. Clique "Generate Domain"
5. Tu auras une URL comme : https://platforme-backend-production.up.railway.app
```

**✅ GARDE CETTE URL !** C'est ton API_URL pour le frontend.

---

### Option B : Hostinger VPS (20€/mois)

Si tu préfères Hostinger VPS :

#### 2.1 Louer un VPS

```
1. Va sur Hostinger
2. Onglet "VPS"
3. Choisis le plan KVM 1 (20€/mois minimum)
4. Système: Ubuntu 22.04 LTS
5. Finalise l'achat
```

#### 2.2 Connecter au VPS

```powershell
# Utilise PuTTY ou PowerShell SSH
ssh root@ADRESSE_IP_DU_VPS
```

#### 2.3 Installer Node.js

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Vérifier
node --version
npm --version
```

#### 2.4 Installer PM2 (gestionnaire de processus)

```bash
sudo npm install -g pm2
```

#### 2.5 Uploader le backend

```powershell
# Sur ton PC, dans le dossier backend/
# Crée une archive
Compress-Archive -Path .\* -DestinationPath backend.zip
```

Puis upload via FTP ou :

```powershell
# Avec SCP
scp backend.zip root@ADRESSE_IP_VPS:/root/
```

Sur le VPS :

```bash
# Décompresser
cd /root
unzip backend.zip
mkdir backend
mv * backend/
cd backend

# Installer les dépendances
npm install --production

# Créer .env
nano .env
```

Contenu du `.env` :

```env
NODE_ENV=production
PORT=1000
MONGODB_URI=mongodb+srv://admin_platforme:password@cluster.mongodb.net/platforme
JWT_SECRET=ton_secret_64_caracteres
CORS_ORIGIN=https://ton-domaine.com
```

Sauvegarder : `Ctrl+X`, `Y`, `Enter`

#### 2.6 Démarrer avec PM2

```bash
# Démarrer le backend
pm2 start server.js --name platforme-backend

# Enregistrer pour redémarrage auto
pm2 save
pm2 startup

# Voir les logs
pm2 logs platforme-backend
```

#### 2.7 Configurer le pare-feu

```bash
# Autoriser les ports
sudo ufw allow 1000
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 22
sudo ufw enable
```

#### 2.8 Installer Nginx (reverse proxy)

```bash
sudo apt install nginx -y

# Créer la config
sudo nano /etc/nginx/sites-available/platforme
```

Contenu :

```nginx
server {
    listen 80;
    server_name api.ton-domaine.com;

    location / {
        proxy_pass http://localhost:1000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/platforme /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 2.9 Installer SSL (Certbot)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.ton-domaine.com
```

**✅ Ton backend est maintenant sur : `https://api.ton-domaine.com`**

---

## 🎨 ÉTAPE 3 : CONFIGURER LE FRONTEND

### 3.1 Modifier config.js

Ouvre `dashboards/config.js` et modifie :

```javascript
const API_CONFIG = {
  production: {
    // ⬇️ CHANGE ICI avec ton URL backend
    API_URL: 'https://platforme-backend-production.up.railway.app/api',
    // Ou si VPS :
    // API_URL: 'https://api.ton-domaine.com/api',
    
    // ⬇️ CHANGE ICI avec ton domaine frontend
    BASE_URL: 'https://ton-domaine.com',
    FRONTEND_PORT: 443
  },
  
  development: {
    API_URL: 'http://localhost:1000/api',
    BASE_URL: 'http://localhost:9000',
    FRONTEND_PORT: 9000
  }
};
```

**Exemple complet :**

```javascript
const API_CONFIG = {
  production: {
    API_URL: 'https://platforme-backend-production.up.railway.app/api',
    BASE_URL: 'https://maplateforme-colis.com',
    FRONTEND_PORT: 443
  },
  
  development: {
    API_URL: 'http://localhost:1000/api',
    BASE_URL: 'http://localhost:9000',
    FRONTEND_PORT: 9000
  }
};
```

**✅ Sauvegarde le fichier !**

### 3.2 Vérifier que config.js est dans les HTML

Vérifie que **TOUS** tes fichiers HTML ont cette ligne **AVANT** les autres scripts :

```html
<!-- Configuration API (DOIT ÊTRE EN PREMIER) -->
<script src="/dashboards/config.js"></script>
```

Fichiers à vérifier :
- `dashboards/admin/admin-dashboard.html`
- `dashboards/agent/agent-dashboard.html`
- `dashboards/commercant/commercant-dashboard.html`
- `dashboards/commercant/commercant-login.html`
- Tous les autres HTML

### 3.3 Créer un fichier .htaccess (pour Hostinger)

Crée `dashboards/.htaccess` :

```apache
# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Redirections SPA
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /index.html [L]

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>

# Cache
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
</IfModule>
```

---

## 📤 ÉTAPE 4 : DÉPLOYER SUR HOSTINGER

### 4.1 Préparer les fichiers

Sur ton PC, prépare le dossier à uploader :

```
TON_SITE/
├── dashboards/
│   ├── config.js         ✅ Modifié
│   ├── .htaccess         ✅ Créé
│   ├── admin/
│   ├── agent/
│   ├── commercant/
│   └── shared/
├── index.html            ← Page d'accueil (optionnel)
└── README.md
```

**⚠️ NE METS PAS le dossier `backend/` sur Hostinger !**

### 4.2 Upload via File Manager

```
1. Connecte-toi à Hostinger (hPanel)
2. Va dans "File Manager"
3. Navigue vers "public_html/"
4. SUPPRIME tout ce qu'il y a dedans (fichiers par défaut)
5. Upload tout le contenu de ton dossier "dashboards/"
```

**Structure finale dans public_html/ :**

```
public_html/
├── config.js
├── .htaccess
├── admin/
├── agent/
├── commercant/
├── shared/
└── index.html (optionnel)
```

### 4.3 Upload via FTP (Alternative)

Si tu préfères FTP :

**A. Obtenir les identifiants FTP**

```
1. Dans hPanel → "FTP Accounts"
2. Note :
   - Hostname: ftp.ton-domaine.com
   - Username: u123456789
   - Password: [ton mot de passe]
   - Port: 21
```

**B. Utiliser FileZilla**

```
1. Télécharge FileZilla
2. Crée une nouvelle connexion :
   - Hôte: ftp.ton-domaine.com
   - Identifiant: u123456789
   - Mot de passe: [ton password]
   - Port: 21
3. Connecte
4. Upload tout le dossier "dashboards/" vers "public_html/"
```

### 4.4 Configurer le domaine

#### Si c'est un nouveau domaine Hostinger

```
1. hPanel → "Domains"
2. Ton domaine devrait déjà pointer vers public_html/
3. Active SSL :
   - hPanel → "SSL"
   - Clique "Install SSL"
   - Choisis "Let's Encrypt Free SSL"
   - Attendez 5-10 minutes
```

#### Si c'est un domaine externe

```
1. Sur ton registrar (Namecheap, GoDaddy, etc.)
2. Change les DNS :
   - ns1.dns-parking.com
   - ns2.dns-parking.com
   
   Ou les DNS fournis par Hostinger

3. Attends 24-48h pour propagation DNS
```

### 4.5 Forcer HTTPS

```
1. hPanel → "Advanced" → "Force HTTPS"
2. Active le toggle
3. Ton site sera toujours en HTTPS
```

---

## ✅ ÉTAPE 5 : TESTS ET VÉRIFICATIONS

### 5.1 Test du Backend

```powershell
# Test de santé
curl https://platforme-backend-production.up.railway.app/api/health

# Ou visite dans le navigateur
https://platforme-backend-production.up.railway.app/api/health
```

**Réponse attendue :**
```json
{
  "status": "OK",
  "timestamp": "2025-10-21T10:30:00.000Z"
}
```

### 5.2 Test du Frontend

```
1. Visite : https://ton-domaine.com/dashboards/commercant/commercant-login.html
2. Ouvre la console (F12)
3. Tu dois voir :
   
   ╔═══════════════════════════════════╗
   ║  🌍 CONFIGURATION ENVIRONNEMENT  ║
   ╠═══════════════════════════════════╣
   ║  Environnement: production        ║  ✅
   ║  API URL: https://platforme...    ║  ✅
   ╚═══════════════════════════════════╝
```

### 5.3 Test de connexion

```
1. Va sur la page de login commercant
2. Essaie de te connecter
3. Vérifie dans Network (F12) :
   - Requête POST vers ton API
   - Status 200 ou 201
   - Pas d'erreurs CORS
```

### 5.4 Checklist complète

| Test | Vérification | Status |
|------|-------------|--------|
| MongoDB Atlas | Connexion OK | ⬜ |
| Backend Railway | URL accessible | ⬜ |
| Frontend Hostinger | Site accessible en HTTPS | ⬜ |
| Console logs | Environnement = production | ⬜ |
| Login | Connexion fonctionne | ⬜ |
| Ajout colis | Formulaire fonctionne | ⬜ |
| Scanner | Scan barcode OK | ⬜ |
| Livraison | Bouton vert marche | ⬜ |
| Paiement | Section marche | ⬜ |
| CORS | Pas d'erreurs | ⬜ |

---

## 🔧 DÉPANNAGE

### Problème 1 : Erreur CORS

**Symptôme :**
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**Solution :**

Sur Railway (ou VPS), vérifie la variable `CORS_ORIGIN` :

```env
# Railway Variables
CORS_ORIGIN=https://ton-domaine.com,https://www.ton-domaine.com
```

Dans `backend/server.js` :

```javascript
const corsOptions = {
  origin: process.env.CORS_ORIGIN.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
```

Redéploie le backend.

---

### Problème 2 : 404 sur les routes API

**Symptôme :**
```
GET https://ton-domaine.com/api/colis 404 Not Found
```

**Cause :** L'API backend n'est pas au bon endroit.

**Solution :**

Vérifie que `config.js` pointe vers le backend :

```javascript
production: {
  API_URL: 'https://platforme-backend.railway.app/api',
  // ⬆️ PAS ton domaine Hostinger !
}
```

---

### Problème 3 : "Environment: development" en production

**Symptôme :**
```
Console affiche: Environnement: development
Mais tu es sur ton domaine en ligne
```

**Cause :** Le script détecte mal l'environnement.

**Solution :**

Vérifie `config.js` ligne 56 :

```javascript
const isProduction = window.location.hostname !== 'localhost' && 
                     window.location.hostname !== '127.0.0.1' &&
                     window.location.hostname !== '';
```

Force en production si besoin :

```javascript
const isProduction = true; // Force production
```

---

### Problème 4 : MongoDB "Connection refused"

**Symptôme :**
```
MongoNetworkError: failed to connect to server
```

**Solutions :**

1. **Vérifie l'URL MongoDB** dans Railway Variables
2. **Vérifie le mot de passe** (pas de caractères spéciaux non encodés)
3. **Network Access** : 0.0.0.0/0 doit être autorisé
4. **Test la connexion** :

```powershell
# Sur ton PC
npm install -g mongodb
mongosh "mongodb+srv://admin:password@cluster.mongodb.net/platforme"
```

---

### Problème 5 : Backend Railway ne démarre pas

**Symptôme :**
```
Railway Logs: Application failed to start
```

**Solutions :**

1. **Vérifie les logs** : Railway Dashboard → Logs
2. **package.json** doit avoir :
   ```json
   {
     "scripts": {
       "start": "node server.js"
     }
   }
   ```
3. **Variables d'environnement** : Toutes définies?
4. **Redéploie** : Settings → Redeploy

---

### Problème 6 : SSL non activé sur Hostinger

**Symptôme :**
```
Site accessible en http:// mais pas https://
```

**Solution :**

```
1. hPanel → SSL
2. Install SSL Certificate
3. Choose "Let's Encrypt Free"
4. Wait 10-15 minutes
5. Force HTTPS : Advanced → Force HTTPS
```

---

## 📞 SUPPORT ET RESSOURCES

### Documentation officielle

- **MongoDB Atlas** : https://docs.atlas.mongodb.com/
- **Railway** : https://docs.railway.app/
- **Hostinger** : https://support.hostinger.com/
- **Node.js** : https://nodejs.org/docs/

### Communautés

- **Stack Overflow** : https://stackoverflow.com/
- **Dev.to** : https://dev.to/
- **Reddit r/webdev** : https://reddit.com/r/webdev

### Outils utiles

- **MongoDB Compass** : https://www.mongodb.com/products/compass
- **Postman** : https://www.postman.com/ (tester les API)
- **FileZilla** : https://filezilla-project.org/ (FTP)

---

## 🎉 FÉLICITATIONS !

Si tu as suivi toutes ces étapes, ton application est maintenant **EN LIGNE** ! 🚀

### Prochaines étapes (optionnel)

1. **Backup automatique** MongoDB Atlas
2. **Monitoring** avec Railway Metrics
3. **Analytics** avec Google Analytics
4. **CDN** pour accélérer le chargement
5. **CI/CD** avec GitHub Actions

---

## 📝 RÉCAPITULATIF DES URLS

Note bien ces URLs :

```
┌──────────────────────────────────────────────────┐
│ PRODUCTION URLS                                  │
├──────────────────────────────────────────────────┤
│ Frontend:    https://ton-domaine.com             │
│ Backend API: https://platforme-xxx.railway.app   │
│ MongoDB:     mongodb+srv://cluster.mongodb.net   │
│ Admin:       https://ton-domaine.com/admin       │
│ Agent:       https://ton-domaine.com/agent       │
│ Commercant:  https://ton-domaine.com/commercant  │
└──────────────────────────────────────────────────┘
```

---

## ⚠️ SÉCURITÉ - IMPORTANT !

### Choses à NE JAMAIS FAIRE

❌ Ne commit JAMAIS ton fichier `.env` sur GitHub  
❌ Ne partage JAMAIS tes credentials MongoDB  
❌ Ne désactive JAMAIS le SSL/HTTPS  
❌ Ne laisse JAMAIS les ports ouverts inutilement  

### Bonnes pratiques

✅ Change les mots de passe régulièrement  
✅ Active l'authentification 2FA sur tous les services  
✅ Fais des backups réguliers  
✅ Monitore les logs pour détecter les anomalies  
✅ Limite les accès MongoDB aux IPs nécessaires (en prod)  

---

**🎯 TON APPLICATION EST MAINTENANT PRÊTE POUR LE MONDE ENTIER !** 🌍

Besoin d'aide ? Relis ce guide ou contacte le support des services utilisés.

**Bon courage ! 🚀**
