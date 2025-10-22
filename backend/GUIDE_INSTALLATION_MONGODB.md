# 🚀 INSTALLATION RAPIDE DE MONGODB

## ✅ Vous avez déjà téléchargé MongoDB !

Le fichier est ici : `C:\Users\ADMIN\Downloads\mongodb-windows-x86_64-8.2.1-signed.msi`

---

## 📋 MÉTHODE 1 : Installation Manuelle (RECOMMANDÉE)

### **Étape 1 : Lancer l'installation**

1. Allez dans `C:\Users\ADMIN\Downloads`
2. **Double-cliquez** sur `mongodb-windows-x86_64-8.2.1-signed.msi`
3. Si Windows demande "Autoriser cette application ?", cliquez **"Oui"**

### **Étape 2 : Suivre l'assistant**

1. **Welcome** → Cliquez sur **"Next"**

2. **License Agreement** → Cochez **"I accept"** → **"Next"**

3. **Choose Setup Type** → Sélectionnez **"Complete"** → **"Next"**

4. **Service Configuration** (IMPORTANT !) :
   - ✅ **COCHEZ** : "Install MongoDB as a Service"
   - ✅ **COCHEZ** : "Run service as Network Service user"
   - Laissez le reste par défaut
   - Cliquez **"Next"**

5. **Install MongoDB Compass** (optionnel) :
   - Vous pouvez décocher si vous ne voulez pas l'interface graphique
   - Cliquez **"Next"**

6. **Ready to Install** → Cliquez **"Install"**

7. **Attendez** 2-5 minutes (une barre de progression va s'afficher)

8. **Finish** → Cliquez sur **"Finish"**

### **Étape 3 : Créer le dossier de données**

Ouvrez **PowerShell en Administrateur** et tapez :

```powershell
New-Item -ItemType Directory -Force -Path "C:\data\db"
```

### **Étape 4 : Démarrer MongoDB**

Dans le même PowerShell :

```powershell
net start MongoDB
```

✅ **Vous devriez voir** : "Le service MongoDB a démarré avec succès"

---

## 📋 MÉTHODE 2 : Installation Automatique

1. **Ouvrez PowerShell EN ADMINISTRATEUR** (clic droit → "Exécuter en tant qu'administrateur")

2. Naviguez vers le dossier backend :
   ```powershell
   cd "c:\Users\ADMIN\Desktop\MA PLAT\platforme 222222 - Copie\backend"
   ```

3. Lancez le script d'installation :
   ```powershell
   .\INSTALLATION_MONGODB.bat
   ```

---

## ✅ VÉRIFICATION

Pour vérifier que MongoDB fonctionne :

```powershell
# Vérifier le service
Get-Service MongoDB

# Vous devriez voir : Status = Running
```

---

## 🚀 APRÈS L'INSTALLATION

Une fois MongoDB installé et démarré :

### 1. Initialiser la base de données

```powershell
cd "c:\Users\ADMIN\Desktop\MA PLAT\platforme 222222 - Copie\backend"
node seed.js
```

Cela va créer :
- ✅ Un compte admin : `admin@example.com` / `admin123`
- ✅ Des wilayas de test
- ✅ Des données de démonstration

### 2. Démarrer le backend

```powershell
node server.js
```

✅ **Vous devriez voir** :
```
✅ MongoDB connecté
🚀 Serveur backend démarré sur le port 5000
```

### 3. Démarrer le frontend

Dans un **nouveau terminal** :

```powershell
cd "c:\Users\ADMIN\Desktop\MA PLAT\platforme 222222 - Copie"
node server-frontend.js
```

✅ **Vous devriez voir** :
```
✅ Serveur frontend démarré sur http://localhost:8080
```

### 4. Tester la connexion

Ouvrez votre navigateur : **http://localhost:8080**

Connectez-vous avec :
- **Email** : `admin@example.com`
- **Mot de passe** : `admin123`

---

## 🐛 DÉPANNAGE

### **Erreur : "MongoDB ne démarre pas"**

```powershell
# Arrêter le service
net stop MongoDB

# Redémarrer le service
net start MongoDB
```

### **Erreur : "Cannot connect to MongoDB"**

Vérifiez que le service tourne :

```powershell
Get-Service MongoDB
```

Si le status est "Stopped", démarrez-le :

```powershell
Start-Service MongoDB
```

### **Erreur : "Access denied" lors de l'installation**

- Faites clic droit sur le fichier `.msi`
- Choisissez **"Exécuter en tant qu'administrateur"**

---

## 📞 COMMANDES UTILES

```powershell
# Démarrer MongoDB
net start MongoDB

# Arrêter MongoDB
net stop MongoDB

# Redémarrer MongoDB
net stop MongoDB ; net start MongoDB

# Vérifier le statut
Get-Service MongoDB

# Voir les logs MongoDB
Get-Content "C:\Program Files\MongoDB\Server\8.0\log\mongod.log" -Tail 50
```

---

## ✅ CHECKLIST

- [ ] MongoDB téléchargé
- [ ] MongoDB installé avec l'option "Install as a Service"
- [ ] Dossier `C:\data\db` créé
- [ ] Service MongoDB démarré
- [ ] Base de données initialisée avec `node seed.js`
- [ ] Backend démarré (`node server.js`)
- [ ] Frontend démarré (`node server-frontend.js`)
- [ ] Connexion réussie sur http://localhost:8080

---

🎉 **Félicitations ! Votre plateforme est prête à l'emploi !**
