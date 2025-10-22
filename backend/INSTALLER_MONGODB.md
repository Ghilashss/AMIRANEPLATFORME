# 🔧 Installer MongoDB sur Windows

## Option 1 : MongoDB Atlas (Cloud - Recommandé) ☁️

### Avantages :
- ✅ Gratuit (niveau M0)
- ✅ Pas d'installation
- ✅ Sauvegarde automatique
- ✅ Accessible partout

### Étapes :
1. Allez sur https://www.mongodb.com/cloud/atlas/register
2. Créez un compte
3. Créez un cluster gratuit (M0)
4. Créez un utilisateur de base de données
5. Whitelist votre IP (ou mettez 0.0.0.0/0 pour tout autoriser)
6. Obtenez la chaîne de connexion

### Format de la chaîne :
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/platforme-livraison
```

### Modifier le .env :
```env
MONGODB_URI=mongodb+srv://votre_user:votre_pass@cluster0.xxxxx.mongodb.net/platforme-livraison
```

---

## Option 2 : MongoDB Local 💻

### Téléchargement :
1. Allez sur : https://www.mongodb.com/try/download/community
2. Téléchargez **MongoDB Community Server** (Windows)
3. Version recommandée : 6.0 ou supérieure

### Installation :
1. Lancez l'installateur .msi
2. Choisissez "Complete"
3. **Important** : Cochez "Install MongoDB as a Service"
4. Laissez les options par défaut

### Vérification :
Ouvrez PowerShell et tapez :
```powershell
mongod --version
```

### Démarrer MongoDB :
```powershell
# Si installé comme service (automatique)
net start MongoDB

# Vérifier le statut
Get-Service MongoDB
```

### URL de connexion locale :
```env
MONGODB_URI=mongodb://localhost:27017/platforme-livraison
```

---

## Option 3 : Docker (Si vous avez Docker) 🐳

```powershell
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

---

## ⚡ Démarrage Rapide avec Atlas

### 1. Créer un cluster Atlas :
```
1. Inscrivez-vous sur MongoDB Atlas
2. Créez un cluster M0 (gratuit)
3. Créez un user : admin / password123
4. Whitelist IP : 0.0.0.0/0 (ou votre IP)
```

### 2. Obtenez votre URL :
```
mongodb+srv://admin:password123@cluster0.xxxxx.mongodb.net/platforme-livraison
```

### 3. Modifiez .env :
```env
MONGODB_URI=mongodb+srv://admin:password123@cluster0.xxxxx.mongodb.net/platforme-livraison
```

### 4. Redémarrez le serveur :
```powershell
# Le serveur redémarre automatiquement avec nodemon
# Ou manuellement :
npm run dev
```

### 5. Initialisez les données :
```powershell
node seed.js
```

---

## 🆘 Problèmes courants

### "ECONNREFUSED 127.0.0.1:27017"
➡️ MongoDB n'est pas démarré localement
✅ Solution : Utilisez Atlas ou démarrez MongoDB local

### "Authentication failed"
➡️ Mauvais username/password dans l'URL Atlas
✅ Solution : Vérifiez les identifiants

### "IP not whitelisted"
➡️ Votre IP n'est pas autorisée sur Atlas
✅ Solution : Ajoutez 0.0.0.0/0 dans Network Access

---

## ✅ Recommandation

**Pour le développement : MongoDB Atlas**
- Gratuit
- Rapide à configurer (5 minutes)
- Pas d'installation locale
- Fonctionne partout

**Pour la production : MongoDB Atlas (plan payant)**
- Sauvegardes automatiques
- Scaling automatique
- Support 24/7

---

**Une fois configuré, votre serveur démarrera sans problème ! 🚀**
