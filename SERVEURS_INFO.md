# 🚀 INFORMATIONS SERVEURS - PLATEFORME DE LIVRAISON

## ✅ ÉTAT ACTUEL

Les deux serveurs sont **ACTIFS** et configurés sur les nouveaux ports :

### Serveurs en cours d'exécution
- **Frontend** : Port **9000** ✅
- **Backend API** : Port **1000** ✅

---

## 🌐 LIENS D'ACCÈS

### Page de Connexion (Login)
**URL principale** : http://localhost:9000/

Ou accès direct par rôle :
- **Admin** : http://localhost:9000/login.html?role=admin
- **Agent** : http://localhost:9000/login.html?role=agent
- **Agence** : http://localhost:9000/login.html?role=agence
- **Commerçant** : http://localhost:9000/dashboards/commercant/commercant-login.html

### Dashboards (après connexion)
- **Dashboard Admin** : http://localhost:9000/dashboards/admin/admin-dashboard.html
- **Dashboard Agent** : http://localhost:9000/dashboards/agent/agent-dashboard.html
- **Dashboard Agence** : http://localhost:9000/dashboards/agence/agence-dashboard.html
- **Dashboard Commerçant** : http://localhost:9000/dashboards/commercant/commercant-dashboard.html

### API Backend
- **API Racine** : http://localhost:1000/
- **Login** : http://localhost:1000/api/auth/login
- **Wilayas** : http://localhost:1000/api/wilayas
- **Agences** : http://localhost:1000/api/agences
- **Colis** : http://localhost:1000/api/colis
- **Caisse** : http://localhost:1000/api/caisse

---

## 🔧 MODIFICATIONS EFFECTUÉES

### Fichiers Backend
1. ✅ `backend/.env` → PORT=1000
2. ✅ `backend/server.js` → PORT par défaut 1000
3. ✅ `backend/server.js` → CORS accepte localhost:9000

### Fichiers Frontend
4. ✅ `server-frontend.js` → PORT=9000
5. ✅ Tous les fichiers de configuration :
   - `dashboards/agent/config.js`
   - `dashboards/admin/js/config.js`
   - `dashboards/commercant/js/config.js`

### Fichiers JavaScript (8 fichiers)
6. ✅ `dashboards/admin/js/caisse-manager.js`
7. ✅ `dashboards/admin/js/user-form.js`
8. ✅ `dashboards/agent/js/caisse-manager.js`
9. ✅ `dashboards/agent/js/commercant-form.js`
10. ✅ `dashboards/agent/js/commercants-manager.js`
11. ✅ `dashboards/shared/agence-store.js`

### Fichiers HTML (9 fichiers)
12. ✅ `dashboards/agent/agent-dashboard.html`
13. ✅ `dashboards/commercant/commercant-dashboard.html`
14. ✅ `dashboards/commercant/commercant-login.html`
15. ✅ `login.html`
16. ✅ `login-new.html`
17. ✅ `commercant-login.html`
18. ✅ `test-bureaux.html`
19. ✅ `test-connexion.html`
20. ✅ `test-wilayas-agences.html`

---

## 🎯 COMMENT DÉMARRER LES SERVEURS

### Méthode 1 : Avec PowerShell (déjà fait)
Les serveurs sont actuellement lancés dans des fenêtres PowerShell séparées.

### Méthode 2 : Redémarrer manuellement

**Frontend :**
```powershell
cd "C:\Users\ADMIN\Documents\PLATFORME\platforme 222222 - Copie"
node server-frontend.js
```

**Backend :**
```powershell
cd "C:\Users\ADMIN\Documents\PLATFORME\platforme 222222 - Copie\backend"
node server.js
```

### Méthode 3 : Avec les fichiers .bat
- Double-cliquer sur `start-frontend.bat`
- Double-cliquer sur `START-BACKEND.bat`

---

## 🧪 TESTS DE VÉRIFICATION

### Vérifier que les serveurs sont actifs
```powershell
# Vérifier les processus Node
Get-Process -Name node

# Vérifier les ports en écoute
netstat -ano | Select-String "LISTENING" | Select-String ":9000|:1000"
```

### Tester les endpoints
```powershell
# Test Frontend
Invoke-WebRequest -Uri http://localhost:9000/ -UseBasicParsing

# Test Backend
Invoke-RestMethod -Uri http://localhost:1000/

# Test API Wilayas
Invoke-RestMethod -Uri http://localhost:1000/api/wilayas
```

---

## ⚠️ EN CAS DE PROBLÈME

### "Erreur de connexion au serveur"
1. Vérifier que les deux serveurs sont démarrés
2. Vérifier que les ports 9000 et 1000 sont libres
3. Vérifier que MongoDB est démarré (pour le backend)

### "Cannot GET /"
- Le frontend n'est pas démarré → lancer `node server-frontend.js`

### "Failed to fetch" ou erreur CORS
- Le backend n'est pas démarré → lancer `node server.js` dans le dossier backend
- Vérifier que `backend/server.js` accepte les requêtes depuis `localhost:9000`

### Arrêter tous les serveurs
```powershell
Get-Process -Name node | Stop-Process -Force
```

---

## 📝 NOTES IMPORTANTES

- ✅ Tous les fichiers utilisent maintenant **localhost:1000** pour l'API
- ✅ Tous les fichiers utilisent **localhost:9000** pour le frontend
- ✅ CORS est configuré pour accepter les requêtes cross-origin
- ✅ MongoDB doit être actif pour que le backend fonctionne
- ⚠️ Les avertissements MongoDB (useNewUrlParser, useUnifiedTopology) sont normaux et n'affectent pas le fonctionnement

---

**Date de mise à jour** : 16 octobre 2025
**Version** : 1.0.0
**Ports** : Frontend 9000 | Backend 1000
