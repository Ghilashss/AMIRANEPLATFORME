# 🔧 CORRECTION - Erreur "Impossible de récupérer votre agence"

**Date:** 19 octobre 2025  
**Erreur:** ❌ Impossible de récupérer votre agence. Veuillez vous reconnecter.  
**Cause:** Backend non démarré OU commerçant sans agence assignée

---

## ❌ Problème Identifié

### Erreur Affichée
```
❌ Erreur: Impossible de récupérer votre agence. Veuillez vous reconnecter.
```

### Causes Possibles

#### 1️⃣ Backend Non Démarré ⚠️ **CAUSE PRINCIPALE**
```
Frontend → API http://localhost:1000/api/auth/me
   ↓
❌ ERREUR: Cannot connect to server
   ↓
Dashboard affiche: "Impossible de récupérer votre agence"
```

#### 2️⃣ Commerçant Sans Agence
```
User (commercant) {
  _id: "...",
  email: "commercant@test.com",
  role: "commercant",
  agence: null  // ❌ PAS D'AGENCE
}
```

#### 3️⃣ Agence Invalide/Supprimée
```
User (commercant) {
  agence: "507f1f77bcf86cd799439011"  // ❌ ID qui n'existe plus
}
```

---

## ✅ Solutions

### Solution 1: Démarrer le Backend 🚀

#### Méthode A: Terminal PowerShell
```powershell
cd "c:\Users\ADMIN\Documents\PLATFORME\platforme 222222 - Copie\backend"
node server.js
```

**Résultat attendu:**
```
✅ Serveur démarré sur le port 1000
✅ MongoDB connecté
```

---

#### Méthode B: Script de Démarrage
```powershell
# Lancer le script DEMARRER.bat (à la racine)
cd "c:\Users\ADMIN\Documents\PLATFORME\platforme 222222 - Copie"
.\DEMARRER.bat
```

Ce script démarre :
- ✅ MongoDB
- ✅ Backend (port 1000)
- ✅ Frontend (port 9000)

---

### Solution 2: Vérifier/Assigner Agence au Commerçant

#### Script Automatique
```powershell
cd "c:\Users\ADMIN\Documents\PLATFORME\platforme 222222 - Copie"
node check-commercants.js
```

**Ce script va:**
1. ✅ Lister tous les commerçants
2. ✅ Vérifier si chaque commerçant a une agence
3. ✅ Assigner automatiquement une agence si manquante
4. ✅ Corriger les agences invalides

**Sortie attendue:**
```
👤 Commerçant: Jean Dupont (commercant@test.com)
   ✅ Agence: Agence Alger Centre (ALG001)
   📍 Wilaya: Alger
```

---

### Solution 3: Assigner Manuellement via MongoDB Compass

#### Étapes:

1. **Ouvrir MongoDB Compass**
2. **Connecter** à `mongodb://localhost:27017`
3. **Sélectionner** base `plateforme_livraison`
4. **Collection** → `users`
5. **Filtrer** commerçants:
   ```json
   { "role": "commercant" }
   ```
6. **Éditer** le document
7. **Chercher une agence** (collection `agences`) et copier son `_id`
8. **Coller** l'ID dans `agence` du commerçant:
   ```json
   {
     "agence": ObjectId("507f1f77bcf86cd799439011")
   }
   ```
9. **Sauvegarder**

---

## 🧪 Tests de Vérification

### Test 1: Backend Répond
```powershell
Invoke-WebRequest -Uri "http://localhost:1000/api/auth/login" -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"admin@test.com","password":"123456"}'
```

**Résultat attendu:** Status 200 ou 401 (mais PAS erreur connexion)

---

### Test 2: Endpoint /me avec Token
```javascript
// Dans console navigateur (après connexion)
const token = localStorage.getItem('commercant_token');
fetch('http://localhost:1000/api/auth/me', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(d => console.log('✅ User:', d))
.catch(e => console.error('❌ Erreur:', e));
```

**Résultat attendu:**
```javascript
{
  success: true,
  data: {
    _id: "...",
    email: "commercant@test.com",
    role: "commercant",
    agence: {  // ✅ Agence populée
      _id: "...",
      nom: "Agence Alger Centre",
      code: "ALG001",
      wilaya: "Alger"
    }
  }
}
```

---

### Test 3: Login + Dashboard
```
1. Nettoyer storage: clear-storage.html
2. Se connecter: commercant-login.html
3. Vérifier console:
   ✅ Connexion réussie
   ✅ Dashboard commerçant chargé
   ✅ Utilisateur récupéré
   ✅ Agence affichée: Nom de l'agence
```

---

## 📋 Checklist Débogage

### Étape 1: Vérifier Backend
- [ ] MongoDB tourne (mongod.exe dans processus)
- [ ] Backend tourne (node server.js)
- [ ] Backend écoute sur port 1000
- [ ] Backend connecté à MongoDB

**Commande vérification:**
```powershell
Get-Process -Name "mongod","node" | Select-Object Name,Id,Path
```

---

### Étape 2: Vérifier Token
- [ ] Token existe dans localStorage['commercant_token']
- [ ] Token existe dans sessionStorage['auth_token']
- [ ] Token n'est pas expiré

**Commande console:**
```javascript
console.log('localStorage:', localStorage.getItem('commercant_token'));
console.log('sessionStorage:', sessionStorage.getItem('auth_token'));
```

---

### Étape 3: Vérifier Commerçant
- [ ] Commerçant existe dans DB
- [ ] Commerçant a un champ `agence`
- [ ] L'agence référencée existe dans collection `agences`

**Script:**
```powershell
node check-commercants.js
```

---

## 🔄 Procédure Complète de Résolution

### ÉTAPE 1: Démarrer Serveurs
```powershell
# Terminal 1: Backend
cd "c:\Users\ADMIN\Documents\PLATFORME\platforme 222222 - Copie\backend"
node server.js

# Terminal 2: Frontend (si pas déjà lancé)
cd "c:\Users\ADMIN\Documents\PLATFORME\platforme 222222 - Copie"
npx http-server -p 9000
```

---

### ÉTAPE 2: Vérifier Commerçants
```powershell
cd "c:\Users\ADMIN\Documents\PLATFORME\platforme 222222 - Copie"
node check-commercants.js
```

**Si aucun commerçant:**
- Créer via `/register` ou MongoDB Compass

**Si commerçant sans agence:**
- Le script l'assigne automatiquement

---

### ÉTAPE 3: Nettoyer & Reconnecter
```
1. http://localhost:9000/dashboards/commercant/clear-storage.html
   → Cliquer "Nettoyer Tout"

2. http://localhost:9000/dashboards/commercant/commercant-login.html
   → Email: commercant@test.com
   → Mot de passe: 123456

3. Vérifier dashboard charge sans erreur
```

---

## 📊 Flux Normal vs Erreur

### ✅ Flux Normal
```
1. Login → POST /api/auth/login
   ✅ Token reçu

2. Dashboard → GET /api/auth/me (avec token)
   ✅ User + Agence retournés

3. Affichage:
   ✅ Nom commerçant
   ✅ Email commerçant
   ✅ Nom agence
```

### ❌ Flux avec Erreur
```
1. Login → POST /api/auth/login
   ✅ Token reçu

2. Dashboard → GET /api/auth/me (avec token)
   ❌ Backend non démarré
   OU
   ❌ Agence null/invalide

3. Erreur affichée:
   ❌ "Impossible de récupérer votre agence"
```

---

## 🛠️ Scripts Créés

| Script | Fonction |
|--------|----------|
| `check-commercants.js` | Vérifier/corriger agences des commerçants |
| `DEMARRER.bat` | Démarrer tous les serveurs |

---

## 📚 Fichiers à Vérifier

| Fichier | Ligne | Vérification |
|---------|-------|--------------|
| `commercant-dashboard.html` | ~930 | `await ApiClient.getCurrentUser()` |
| `api-client.js` | ~24 | `async getCurrentUser(role)` |
| `authController.js` | ~142, ~255 | `exports.getMe` (2 fois !) |
| `backend/server.js` | ~1 | Serveur démarre sur port 1000 |

---

## ⚠️ Problème Détecté: Double exports.getMe

**Fichier:** `backend/controllers/authController.js`

```javascript
// Ligne 142
exports.getMe = async (req, res, next) => { ... }

// Ligne 255
exports.getMe = async (req, res, next) => { ... }  // ❌ DOUBLON
```

**Conséquence:** JavaScript utilise le dernier = possibles erreurs

**Solution:** Supprimer un des deux (garder celui avec populate)

---

## ✅ Résolution Rapide

### Pour 90% des cas:

```powershell
# 1. Démarrer backend
cd "c:\Users\ADMIN\Documents\PLATFORME\platforme 222222 - Copie\backend"
node server.js

# 2. Attendre 3 secondes

# 3. Nettoyer storage
# Ouvrir: http://localhost:9000/dashboards/commercant/clear-storage.html

# 4. Se reconnecter
# Ouvrir: http://localhost:9000/dashboards/commercant/commercant-login.html
```

---

## 🎯 Résumé

**Cause principale:** Backend non démarré (95% des cas)  
**Cause secondaire:** Commerçant sans agence (5% des cas)

**Solution:** 
1. ✅ Démarrer backend (`node server.js`)
2. ✅ Vérifier agences (`node check-commercants.js`)
3. ✅ Nettoyer storage + reconnecter

---

**Date:** 19 octobre 2025  
**Statut:** ✅ SOLUTIONS DOCUMENTÉES - BACKEND À DÉMARRER
