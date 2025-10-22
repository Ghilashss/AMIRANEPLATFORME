# 🌐 Guide de Déploiement en Production

## Options de déploiement

### Option 1: Heroku (Recommandé - Gratuit)
### Option 2: Render (Gratuit)
### Option 3: Railway (Gratuit)
### Option 4: VPS (DigitalOcean, AWS, etc.)

---

## 🚀 Déploiement sur Heroku

### Prérequis
```powershell
# Installer Heroku CLI
# Télécharger depuis: https://devcenter.heroku.com/articles/heroku-cli

# Vérifier l'installation
heroku --version
```

### Étapes

1. **Se connecter à Heroku**
```powershell
heroku login
```

2. **Créer une application**
```powershell
cd backend
heroku create nom-de-votre-app
```

3. **Ajouter MongoDB Atlas**
```powershell
# Créez un compte gratuit sur https://www.mongodb.com/cloud/atlas
# Créez un cluster
# Récupérez la connection string
```

4. **Configurer les variables d'environnement**
```powershell
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=votre_secret_super_complexe
heroku config:set JWT_EXPIRE=7d
heroku config:set MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
heroku config:set FRONTEND_URL=https://votre-frontend.com
```

5. **Créer un Procfile**
```powershell
echo "web: node server.js" > Procfile
```

6. **Déployer**
```powershell
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

7. **Initialiser la base de données**
```powershell
heroku run node seed.js
```

8. **Ouvrir l'application**
```powershell
heroku open
```

---

## 🎨 Déploiement sur Render

1. **Créer un compte** sur https://render.com

2. **Nouveau Web Service**
   - Click "New +" → "Web Service"
   - Connecter votre repository GitHub
   - Sélectionner le dossier `backend`

3. **Configurer**
   ```
   Name: plateforme-livraison-api
   Environment: Node
   Build Command: npm install
   Start Command: node server.js
   ```

4. **Variables d'environnement**
   ```
   NODE_ENV=production
   MONGODB_URI=votre_mongodb_atlas_uri
   JWT_SECRET=votre_secret
   JWT_EXPIRE=7d
   FRONTEND_URL=https://votre-frontend.com
   ```

5. **Déployer** - Render déploie automatiquement

---

## 🚂 Déploiement sur Railway

1. **Créer un compte** sur https://railway.app

2. **Nouveau projet**
   - Click "New Project"
   - "Deploy from GitHub repo"
   - Sélectionner votre repo

3. **Variables d'environnement**
   - Aller dans Settings → Variables
   - Ajouter toutes les variables nécessaires

4. **Railway détecte automatiquement Node.js** et déploie

---

## 💻 Déploiement sur VPS (Ubuntu)

### Prérequis
- Un VPS Ubuntu 20.04+
- Nom de domaine (optionnel)

### Installation

1. **Se connecter au VPS**
```bash
ssh root@votre-ip
```

2. **Installer Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **Installer MongoDB**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

4. **Cloner le projet**
```bash
cd /var/www
git clone votre-repo.git
cd votre-repo/backend
npm install
```

5. **Configurer l'environnement**
```bash
nano .env
# Copier les variables de production
```

6. **Installer PM2 (Process Manager)**
```bash
sudo npm install -g pm2
pm2 start server.js --name "plateforme-api"
pm2 startup
pm2 save
```

7. **Installer Nginx (Reverse Proxy)**
```bash
sudo apt-get install nginx
sudo nano /etc/nginx/sites-available/api
```

Contenu du fichier:
```nginx
server {
    listen 80;
    server_name api.votre-domaine.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

8. **Activer le site**
```bash
sudo ln -s /etc/nginx/sites-available/api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

9. **SSL avec Let's Encrypt**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d api.votre-domaine.com
```

---

## 📊 MongoDB Atlas (Cloud Database)

### Configuration

1. **Créer un compte** sur https://cloud.mongodb.com

2. **Créer un cluster**
   - Choisir "Shared" (Gratuit)
   - Sélectionner la région la plus proche
   - Créer le cluster

3. **Créer un utilisateur**
   - Database Access → Add New User
   - Username/Password
   - Accès: Read and write to any database

4. **Whitelist IP**
   - Network Access → Add IP Address
   - Pour dev: 0.0.0.0/0 (tous les IPs)
   - Pour prod: IP de votre serveur

5. **Connection String**
   - Connect → Connect your application
   - Copier la connection string
   - Remplacer `<password>` et `<dbname>`

```
mongodb+srv://username:<password>@cluster.mongodb.net/platforme-livraison?retryWrites=true&w=majority
```

---

## 🔒 Sécurité en Production

### Variables d'environnement obligatoires

```env
NODE_ENV=production
PORT=5000

# MongoDB
MONGODB_URI=mongodb+srv://...

# JWT - CHANGEZ ABSOLUMENT
JWT_SECRET=generer_un_secret_complexe_unique
JWT_EXPIRE=7d

# URLs
FRONTEND_URL=https://votre-frontend.com
API_URL=https://api.votre-backend.com

# Email (optionnel)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre@email.com
EMAIL_PASSWORD=mot_de_passe_app
```

### Générer un JWT_SECRET sécurisé

```powershell
# Avec Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 📝 Checklist de déploiement

### Avant de déployer
- [ ] Variables d'environnement configurées
- [ ] JWT_SECRET changé et complexe
- [ ] MongoDB Atlas configuré
- [ ] CORS configuré avec bonnes URLs
- [ ] Fichiers sensibles dans .gitignore
- [ ] Dépendances à jour
- [ ] Tests effectués localement

### Après déploiement
- [ ] API accessible
- [ ] Login fonctionne
- [ ] Base de données initialisée (seed.js)
- [ ] Endpoints testés avec Postman
- [ ] Logs vérifiés
- [ ] SSL configuré (HTTPS)
- [ ] Rate limiting actif
- [ ] Monitoring configuré

---

## 🔍 Monitoring et Logs

### Sur Heroku
```powershell
heroku logs --tail
```

### Sur VPS avec PM2
```bash
pm2 logs plateforme-api
pm2 monit
```

### MongoDB Atlas
- Monitoring intégré dans le dashboard
- Alertes configurables

---

## 🔄 Mise à jour en production

### Heroku
```powershell
git add .
git commit -m "Update"
git push heroku main
```

### Render/Railway
- Push sur GitHub
- Déploiement automatique

### VPS
```bash
cd /var/www/votre-repo/backend
git pull
npm install
pm2 restart plateforme-api
```

---

## 🐛 Debugging en production

### Vérifier les logs
```bash
# Heroku
heroku logs --tail

# PM2
pm2 logs

# Nginx
sudo tail -f /var/log/nginx/error.log
```

### Tester la connexion MongoDB
```javascript
// test-db.js
require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connecté'))
  .catch(err => console.error('❌ Erreur:', err));
```

### Tester l'API
```bash
curl https://votre-api.com/api/wilayas
```

---

## 💡 Conseils

1. **Utilisez MongoDB Atlas** - Plus simple que MongoDB local
2. **SSL obligatoire** - Let's Encrypt gratuit
3. **Logs réguliers** - Surveillez les erreurs
4. **Backups MongoDB** - Atlas fait des backups automatiques
5. **Rate limiting** - Déjà configuré dans le code
6. **Environment variables** - Ne jamais commit .env

---

## 📚 Ressources

- **Heroku**: https://devcenter.heroku.com/
- **MongoDB Atlas**: https://docs.atlas.mongodb.com/
- **PM2**: https://pm2.keymetrics.io/docs/
- **Nginx**: https://nginx.org/en/docs/
- **Let's Encrypt**: https://letsencrypt.org/

---

## 🎉 Votre API est maintenant en ligne !

URL d'exemple: `https://votre-app.herokuapp.com/api`

Test rapide:
```bash
curl https://votre-app.herokuapp.com/api/wilayas
```

---

**Bon déploiement ! 🚀**
