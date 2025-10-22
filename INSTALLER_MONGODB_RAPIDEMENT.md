# 🚀 Installation Rapide de MongoDB sur Windows

## Méthode 1 : Installation Express (Recommandée)

### 📥 Téléchargement
1. Télécharger MongoDB Community Server :
   https://www.mongodb.com/try/download/community

2. Choisir :
   - Version : 7.0.x (Current)
   - Platform : Windows
   - Package : MSI

### 📦 Installation
1. Double-cliquer sur le fichier `.msi` téléchargé
2. Choisir "Complete" installation
3. **IMPORTANT** : Cocher "Install MongoDB as a Service"
4. Laisser les paramètres par défaut
5. Cliquer sur "Install"

### ✅ Vérification
Ouvrir PowerShell et taper :
```powershell
mongod --version
```

Si ça affiche la version, MongoDB est installé ! 🎉

### 🚀 Démarrage
MongoDB démarre automatiquement comme service Windows.

Pour vérifier :
```powershell
Get-Service -Name MongoDB
```

---

## Méthode 2 : MongoDB dans Docker (Alternative)

Si vous avez Docker installé :

```powershell
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

---

## Méthode 3 : MongoDB Atlas (Cloud - Gratuit)

1. Aller sur : https://www.mongodb.com/cloud/atlas/register
2. Créer un compte gratuit
3. Créer un cluster (Free Tier)
4. Obtenir la chaîne de connexion
5. Modifier `.env` avec la nouvelle URI :

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/platforme-livraison
```

---

## 🔄 Initialiser la Base de Données

Une fois MongoDB installé et démarré :

```powershell
cd "c:\Users\ADMIN\Desktop\MA PLAT\platforme 222222 - Copie\backend"
node seed.js
```

Cela créera :
- ✅ 58 wilayas algériennes
- ✅ 3 agences de test
- ✅ Compte admin : `admin@platforme.com` / `admin123`
- ✅ Compte commerçant : `commercant@test.com` / `123456`

---

## 🚀 Démarrer le Backend

```powershell
cd "c:\Users\ADMIN\Desktop\MA PLAT\platforme 222222 - Copie\backend"
node server.js
```

✅ Backend actif sur : http://localhost:5000

---

## ❌ Dépannage

### Erreur : "mongod n'est pas reconnu"
MongoDB n'est pas dans le PATH. Ajouter à la variable PATH :
```
C:\Program Files\MongoDB\Server\7.0\bin
```

### Erreur : "ECONNREFUSED"
MongoDB n'est pas démarré. Le démarrer :
```powershell
net start MongoDB
```

### Erreur : "Access denied"
Exécuter PowerShell en tant qu'administrateur.

---

## 📋 Checklist Complète

- [ ] MongoDB installé
- [ ] Service MongoDB démarré
- [ ] Base de données initialisée (node seed.js)
- [ ] Backend démarré (node server.js)
- [ ] Frontend démarré (node server-frontend.js)
- [ ] Connexion réussie sur http://localhost:8080

---

## 🎉 Prêt !

Une fois tout configuré, vous pouvez :
1. Ouvrir : http://localhost:8080
2. Se connecter avec : `admin@platforme.com` / `admin123`
3. Créer des agences
4. Gérer le système de caisse

