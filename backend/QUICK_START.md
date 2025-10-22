# 🚀 Guide de Démarrage Rapide - Backend

## Installation et lancement en 5 minutes

### Étape 1: Installer MongoDB

**Windows:**
1. Téléchargez MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Installez avec les options par défaut
3. MongoDB démarre automatiquement en tant que service

**Vérifier MongoDB:**
```powershell
# Ouvrir PowerShell et taper:
mongo --version
```

Si MongoDB n'est pas installé, vous pouvez utiliser **MongoDB Atlas** (cloud gratuit):
1. Créez un compte sur https://www.mongodb.com/cloud/atlas
2. Créez un cluster gratuit
3. Récupérez la connection string et modifiez `.env`

---

### Étape 2: Installer les dépendances

```powershell
cd backend
npm install
```

---

### Étape 3: Initialiser la base de données

```powershell
node seed.js
```

Cela va créer:
- ✅ 58 wilayas avec leurs frais de livraison
- ✅ 3 agences (Alger, Oran, Constantine)
- ✅ Compte Admin (email: `admin@platforme.com`, password: `admin123`)
- ✅ Compte Commerçant (email: `commercant@test.com`, password: `123456`)

---

### Étape 4: Démarrer le serveur

**Mode développement (auto-reload):**
```powershell
npm run dev
```

**Mode production:**
```powershell
npm start
```

Le serveur démarre sur: **http://localhost:5000**

---

## ✅ Vérification rapide

### Test 1: Vérifier que l'API répond
Ouvrez votre navigateur: http://localhost:5000

Vous devriez voir:
```json
{
  "success": true,
  "message": "API Plateforme de Livraison",
  "version": "1.0.0"
}
```

### Test 2: Se connecter
Utilisez Postman, Insomnia ou cURL:

```powershell
# Avec cURL (PowerShell)
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"admin@platforme.com","password":"admin123"}'
```

Vous recevrez un token JWT à utiliser pour les requêtes authentifiées.

### Test 3: Récupérer les wilayas
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/wilayas" -Method GET
```

---

## 📊 Données de test disponibles

### Utilisateurs
| Rôle | Email | Password |
|------|-------|----------|
| Admin | admin@platforme.com | admin123 |
| Commerçant | commercant@test.com | 123456 |

### Agences
- Agence Alger Centre (Wilaya 16)
- Agence Oran (Wilaya 31)
- Agence Constantine (Wilaya 25)

### Wilayas
58 wilayas algériennes avec frais de livraison configurés

---

## 🛠️ Commandes utiles

### Réinitialiser la base de données
```powershell
node seed.js
```

### Voir les logs MongoDB
```powershell
# Si MongoDB est installé localement
Get-Content "C:\Program Files\MongoDB\Server\6.0\log\mongod.log" -Tail 50
```

### Arrêter le serveur
`Ctrl + C` dans le terminal

---

## 🔧 Résolution des problèmes

### Erreur: "Cannot connect to MongoDB"
**Solution 1:** Vérifier que MongoDB est démarré
```powershell
# Vérifier le service
Get-Service -Name MongoDB

# Démarrer MongoDB
Start-Service MongoDB
```

**Solution 2:** Utiliser MongoDB Atlas (cloud)
1. Créez un compte gratuit sur mongodb.com/cloud/atlas
2. Créez un cluster
3. Récupérez la connection string
4. Modifiez `.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/platforme-livraison
```

### Erreur: "Port 5000 already in use"
Changez le port dans `.env`:
```
PORT=3001
```

### Erreur: "Module not found"
Réinstallez les dépendances:
```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

---

## 📝 Prochaines étapes

1. **Tester l'API** avec Postman ou Insomnia
2. **Créer des colis** via l'endpoint `/api/colis`
3. **Connecter le frontend** en modifiant les URLs dans le code frontend
4. **Personnaliser** les frais de livraison par wilaya

---

## 🔗 Ressources

- **API Documentation complète:** Voir README.md
- **MongoDB Documentation:** https://docs.mongodb.com/
- **Postman:** https://www.postman.com/downloads/
- **Node.js:** https://nodejs.org/

---

## 📞 Besoin d'aide?

Si vous rencontrez des problèmes:
1. Vérifiez les logs dans le terminal
2. Consultez le README.md complet
3. Vérifiez que MongoDB est démarré
4. Assurez-vous que le port 5000 est disponible

---

**Bon développement! 🚀**
