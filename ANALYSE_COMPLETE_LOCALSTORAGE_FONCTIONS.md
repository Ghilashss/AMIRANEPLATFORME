# 📊 ANALYSE COMPLÈTE : Toutes les fonctions utilisant localStorage

**Date** : 18 octobre 2025  
**Recherche** : `localStorage.(getItem|setItem|removeItem|clear)`  
**Résultats** : 200+ occurrences trouvées

---

## 📁 Fichiers concernés (par ordre d'importance)

### 🔴 FICHIERS CRITIQUES (Données utilisateur)

#### 1. **login.html** - Authentification principale
```javascript
// Ligne 87-88: Nettoyage avant login
localStorage.removeItem('token');
localStorage.removeItem('user');

// Ligne 92-93: Admin
localStorage.setItem('admin_token', data.data.token);
localStorage.setItem('admin_user', JSON.stringify(data.data));

// Ligne 96-97: Agent
localStorage.setItem('agent_token', data.data.token);
localStorage.setItem('agent_user', JSON.stringify(data.data));

// Ligne 100-101: Commerçant
localStorage.setItem('commercant_token', data.data.token);
localStorage.setItem('commercant_user', JSON.stringify(data.data));
```

**❌ Problème** : Stocke TOUT l'objet user (nom, email, agence, wilaya, etc.)

---

#### 2. **commercant-dashboard.html** - Dashboard commerçant
```javascript
// Ligne 810-811: Chargement user
const userStr = localStorage.getItem(CONFIG.USER_KEY);  // commercant_user
const token = localStorage.getItem(CONFIG.TOKEN_KEY);   // commercant_token

// Ligne 1151: Récupération pour formulaire
const user = JSON.parse(localStorage.getItem(CONFIG.USER_KEY));

// Ligne 1252: Calcul frais (wilaya source)
JSON.parse(localStorage.getItem(CONFIG.USER_KEY))?.wilaya

// Ligne 1312: Création colis
const user = JSON.parse(localStorage.getItem(CONFIG.USER_KEY));

// Ligne 1712: Ancienne clé générique (à migrer)
const user = JSON.parse(localStorage.getItem('user') || '{}');

// Ligne 1746-1748: Logout
localStorage.removeItem('commercant_token');
localStorage.removeItem('commercant_user');
localStorage.removeItem('commercant_role');
```

**❌ Problème** : Utilise user complet au lieu d'appeler l'API

---

#### 3. **agent-dashboard.html** - Dashboard agent
```javascript
// Ligne 1612-1615: Logout
localStorage.removeItem('token');
localStorage.removeItem('user');
localStorage.removeItem('agent_token');
localStorage.removeItem('agent_user');

// Ligne 1646: Chargement user
const user = JSON.parse(localStorage.getItem('agent_user') || '{}');

// Ligne 1654: Token pour API
const token = localStorage.getItem('agent_token');
```

**❌ Problème** : Stocke agent_user au lieu de récupérer depuis API

---

#### 4. **admin-dashboard.html** - Dashboard admin
```javascript
// Ligne 2502-2505: Debug localStorage
token: localStorage.getItem('token'),
user: localStorage.getItem('user'),
admin_token: localStorage.getItem('admin_token'),
admin_user: localStorage.getItem('admin_user')

// Ligne 2511: Nettoyage sélectif
localStorage.removeItem(key);

// Ligne 2517-2520: Vérification après logout
token: localStorage.getItem('token'),
user: localStorage.getItem('user'),
admin_token: localStorage.getItem('admin_token'),
admin_user: localStorage.getItem('admin_user')
```

---

### 🟠 FICHIERS JAVASCRIPT (Modules)

#### 5. **dashboards/agent/js/commercants-manager.js**
```javascript
// Ligne 56: Récupération agence de l'agent
const agentUser = JSON.parse(localStorage.getItem('agent_user') || '{}');
const agentAgenceId = agentUser.agence;

// Ligne 106: Token pour création commerçant
const token = localStorage.getItem('agent_token');
```

**🔴 CRITIQUE** : `agentUser.agence` doit venir de l'API !

---

#### 6. **dashboards/admin/js/data-store.js**
```javascript
// Ligne 5: Token pour toutes les requêtes
const token = localStorage.getItem('admin_token');

// Ligne 92-95: Cache users
localStorage.setItem('usersCache', JSON.stringify(this.users));
const cached = localStorage.getItem('usersCache');

// Ligne 146-152: Cache agences
localStorage.setItem('agencesCache', JSON.stringify(this.agences));
const cached = localStorage.getItem('agencesCache');

// Ligne 168: Settings
const settings = localStorage.getItem('settings');

// Ligne 545: Cache wilayas
const savedWilayas = localStorage.getItem('wilayas');

// Ligne 679-686: Sauvegarde/chargement générique
const data = localStorage.getItem(key);
localStorage.setItem(key, JSON.stringify(this[key]));

// Ligne 725: Cache colis
const cachedColis = localStorage.getItem('colis');
```

**⚠️ NOTE** : Cache acceptable, mais doit être invalidé régulièrement

---

#### 7. **dashboards/agent/js/data-store.js**
```javascript
// Ligne 5: Token
return localStorage.getItem('agent_token');

// Ligne 84-94: Cache users
localStorage.setItem('usersCache', JSON.stringify(this.users));
const cached = localStorage.getItem('usersCache');

// Ligne 137-143: Cache agences
localStorage.setItem('agencesCache', JSON.stringify(this.agences));
const cached = localStorage.getItem('agencesCache');

// Ligne 159: Settings
const settings = localStorage.getItem('settings');

// Ligne 500: Cache wilayas
const savedWilayas = localStorage.getItem('wilayas');

// Ligne 692-699: Sauvegarde/chargement
const data = localStorage.getItem(key);
localStorage.setItem(key, JSON.stringify(this[key]));

// Ligne 738: Cache colis
const cachedColis = localStorage.getItem('colis');

// Ligne 876: Agences (formulaire)
const agences = JSON.parse(localStorage.getItem('agences') || '[]');

// Ligne 1089: Wilayas
const savedWilayas = localStorage.getItem('wilayas');

// Ligne 1507-1518: Sauvegarde référentiels
localStorage.setItem('wilayas', JSON.stringify(wilayas));
localStorage.setItem('agences', JSON.stringify(agences));
```

---

#### 8. **dashboards/shared/agence-store.js**
```javascript
// Ligne 8: Cache agences
const savedAgences = localStorage.getItem('agences');

// Ligne 14: Sauvegarder agences
localStorage.setItem('agences', JSON.stringify(this.agences));

// Ligne 54: Token admin
const token = localStorage.getItem('admin_token');

// Ligne 132: Cache wilayas
const savedWilayas = localStorage.getItem('wilayas');
```

---

#### 9. **dashboards/agent/js/colis-form.js**
```javascript
// Ligne 12: Token
const token = localStorage.getItem('agent_token');

// Ligne 35: Cache frais livraison
localStorage.setItem('fraisLivraisonCache', JSON.stringify(FRAIS_LIVRAISON_CACHE));

// Ligne 43: Récupération cache frais
const cached = localStorage.getItem('fraisLivraisonCache');

// Ligne 66: Token pour wilayas
const token = localStorage.getItem('agent_token');

// Ligne 91: Sauvegarder wilayas
localStorage.setItem('wilayas', JSON.stringify(wilayas));

// Ligne 111: Charger wilayas
const wilayasData = localStorage.getItem('wilayas');

// Ligne 138: Token pour agences
const token = localStorage.getItem('agent_token');

// Ligne 165: Sauvegarder agences
localStorage.setItem('agences', JSON.stringify(agences));

// Ligne 199: Charger agences
const agencesData = localStorage.getItem('agences');

// Ligne 238: User pour auto-remplissage
const user = JSON.parse(localStorage.getItem('user') || '{}');

// Ligne 250: Agences pour bureau source
const agencesData = localStorage.getItem('agences');

// Ligne 262: Token
const token = localStorage.getItem('agent_token');

// Ligne 340: Filtrage bureaux par wilaya
const agencesData = localStorage.getItem('agences');
```

**🔴 CRITIQUE** : Ligne 238 utilise 'user' au lieu de 'agent_user' !

---

#### 10. **dashboards/admin/js/frais-livraison.js**
```javascript
// Ligne 71: Token
const token = localStorage.getItem('admin_token');

// Ligne 98: Sauvegarder wilayas
localStorage.setItem('wilayas', JSON.stringify(WILAYAS_ALGERIE));

// Ligne 111: Charger wilayas
const cachedWilayas = localStorage.getItem('wilayas');

// Ligne 139: Token pour recherche
const token = localStorage.getItem('admin_token');

// Ligne 162: Cache frais
localStorage.setItem('fraisLivraisonCache', JSON.stringify(this.frais));

// Ligne 169: Récupération cache
const cached = localStorage.getItem('fraisLivraisonCache');

// Ligne 188: Token pour création
const token = localStorage.getItem('admin_token');

// Ligne 235: Token pour suppression
const token = localStorage.getItem('admin_token');
```

---

#### 11. **dashboards/agent/js/caisse-agent.js**
```javascript
// Ligne 43-44: Chargement caisse
const token = localStorage.getItem('agent_token');
const user = JSON.parse(localStorage.getItem('user'));

// Ligne 72: Token pour transactions
const token = localStorage.getItem('agent_token');

// Ligne 412-413: Création versement
const token = localStorage.getItem('agent_token');
const user = JSON.parse(localStorage.getItem('user'));
```

**🔴 CRITIQUE** : Utilise 'user' au lieu de 'agent_user' !

---

#### 12. **dashboards/admin/js/caisse-admin.js**
```javascript
// Ligne 513: Token (doublon)
return localStorage.getItem('admin_token') || localStorage.getItem('admin_token');
```

**⚠️ BUG** : Code redondant (doublon)

---

#### 13. **dashboards/commercant/js/caisse-commercant.js**
```javascript
// Ligne 36-37: Chargement caisse
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

// Ligne 64: Token pour transactions
const token = localStorage.getItem('token');
```

**🔴 CRITIQUE** : Utilise 'token' et 'user' génériques au lieu de 'commercant_token' et 'commercant_user' !

---

### 🟡 FICHIERS SECONDAIRES

#### 14. **dashboards/agent/modal-manager.js**
```javascript
// Ligne 7: Token
return localStorage.getItem('agent_token');

// Ligne 226: Agences
const agences = JSON.parse(localStorage.getItem('agences') || '[]');

// Ligne 298-300: User avec fallback
let userDataStr = localStorage.getItem('user');
if (!userDataStr) {
    userDataStr = localStorage.getItem('userData');
}
```

---

#### 15. **dashboards/admin/js/modal-manager.js**
```javascript
// Ligne 213: Token
const token = localStorage.getItem('admin_token');
```

---

#### 16. **dashboards/agent/js/livraisons-manager.js**
```javascript
// Ligne 25: Token
const token = localStorage.getItem('agent_token');

// Ligne 48: Cache livraisons
localStorage.setItem('livraisonsCache', JSON.stringify(this.livraisons));

// Ligne 57: Récupération cache
const cached = localStorage.getItem('livraisonsCache');

// Ligne 73: Token
const token = localStorage.getItem('agent_token');

// Ligne 232: Token
const token = localStorage.getItem('agent_token');

// Ligne 327: Nom livreur
livreurNom: localStorage.getItem('userName') || 'Agent',

// Ligne 357: Token
const token = localStorage.getItem('agent_token');

// Ligne 583: Token
const token = localStorage.getItem('agent_token');
```

---

#### 17. **dashboards/agent/js/retours-manager.js**
```javascript
// Ligne 23: Token
const token = localStorage.getItem('agent_token');

// Ligne 46: Cache retours
localStorage.setItem('retoursCache', JSON.stringify(this.retours));

// Ligne 55: Récupération cache
const cached = localStorage.getItem('retoursCache');

// Ligne 72: Token
const token = localStorage.getItem('agent_token');

// Ligne 232: Token
const token = localStorage.getItem('agent_token');

// Ligne 296: Nom livreur
livreurNom: localStorage.getItem('userName') || 'Agent',

// Ligne 317: Token
const token = localStorage.getItem('agent_token');

// Ligne 518: Token
const token = localStorage.getItem('agent_token');

// Ligne 588: Token
const token = localStorage.getItem('agent_token');
```

---

#### 18. **dashboards/admin/js/livraisons-manager.js**
```javascript
// Ligne 24: Token
const token = localStorage.getItem('admin_token');

// Ligne 42: Cache livraisons
localStorage.setItem('livraisonsCache', JSON.stringify(this.livraisons));

// Ligne 47: Récupération cache
const cached = localStorage.getItem('livraisonsCache');

// Ligne 60: Token
const token = localStorage.getItem('admin_token');

// Ligne 211: Token
const token = localStorage.getItem('admin_token');

// Ligne 337: Token
const token = localStorage.getItem('admin_token');
```

---

#### 19. **dashboards/admin/js/retours-manager.js**
```javascript
// Ligne 21: Token
const token = localStorage.getItem('admin_token');

// Ligne 33: Cache retours
localStorage.setItem('retoursCache', JSON.stringify(this.retours));

// Ligne 36: Récupération cache
const cached = localStorage.getItem('retoursCache');

// Ligne 43: Récupération cache
const cached = localStorage.getItem('retoursCache');

// Ligne 51: Token
const token = localStorage.getItem('admin_token');

// Ligne 201: Token
const token = localStorage.getItem('admin_token');

// Ligne 291: Token
const token = localStorage.getItem('admin_token');
```

---

#### 20. **dashboards/agent/nav-manager.js**
```javascript
// Ligne 39-46: Logout sélectif
localStorage.removeItem('token');
localStorage.removeItem('user');
localStorage.removeItem('userId');
localStorage.removeItem('userRole');
localStorage.removeItem('userName');
localStorage.removeItem('userEmail');
localStorage.removeItem('userWilaya');
localStorage.removeItem('userAgence');
```

**✅ CORRECT** : Plus de `localStorage.clear()`

---

#### 21. **dashboards/admin/js/nav-manager.js**
```javascript
// Ligne 41: Debug localStorage
const value = localStorage.getItem(key);

// Ligne 48-49: Logout
localStorage.removeItem('token');
localStorage.removeItem('user');
```

---

#### 22. **dashboards/agent/js/auth-manager.js**
```javascript
// Ligne 31: Vérification token
this.token = localStorage.getItem('agent_token');

// Ligne 95: Logout
localStorage.removeItem('token');
```

---

#### 23. **commercant-login.html**
```javascript
// Ligne 514-515: Vérification connexion
const token = localStorage.getItem('token');
const user = localStorage.getItem('user');

// Ligne 558-560: Stockage après login
localStorage.setItem('commercant_token', data.data.token);
localStorage.setItem('commercant_user', JSON.stringify(data.data));
localStorage.setItem('commercant_role', 'commercant');

// Ligne 563: Remember me
localStorage.setItem('commercant_rememberMe', 'true');
```

---

#### 24. **login-new.html** (ancien fichier)
```javascript
// Ligne 286-287: Vérification
const token = localStorage.getItem('token');
const userRole = localStorage.getItem('userRole');

// Ligne 319-330: Stockage après login
localStorage.setItem('token', data.token);
localStorage.setItem('userId', data.user._id);
localStorage.setItem('userRole', data.user.role);
localStorage.setItem('userName', data.user.nom);
localStorage.setItem('userEmail', data.user.email);
localStorage.setItem('userWilaya', data.user.wilaya);
localStorage.setItem('userAgence', data.user.agence);
```

**❌ OBSOLÈTE** : À supprimer (remplacé par login.html)

---

## 📊 RÉSUMÉ PAR TYPE D'UTILISATION

### 🔴 DONNÉES UTILISATEUR (À MIGRER VERS API)

| Fichier | Clé localStorage | Type | Action |
|---------|-----------------|------|--------|
| login.html | `admin_user` | User complet | Remplacer par API `/api/auth/me` |
| login.html | `agent_user` | User complet | Remplacer par API `/api/auth/me` |
| login.html | `commercant_user` | User complet | Remplacer par API `/api/auth/me` |
| commercant-dashboard.html | `commercant_user` | User complet | Remplacer par API `/api/auth/me` |
| agent-dashboard.html | `agent_user` | User complet | Remplacer par API `/api/auth/me` |
| commercants-manager.js | `agent_user.agence` | ID agence | Remplacer par API `/api/auth/me` |
| colis-form.js | `user` | User complet | Remplacer par `agent_user` puis API |
| caisse-agent.js | `user` | User complet | Remplacer par `agent_user` puis API |
| caisse-commercant.js | `user` | User complet | Remplacer par `commercant_user` puis API |

**Total** : 9 fichiers × 5-10 usages = **~50 occurrences à migrer**

---

### ✅ TOKENS (À CONSERVER)

| Clé | Usage | Fichiers |
|-----|-------|----------|
| `admin_token` | Token JWT admin | 15+ fichiers |
| `agent_token` | Token JWT agent | 20+ fichiers |
| `commercant_token` | Token JWT commerçant | 5+ fichiers |

**Total** : **~80 occurrences** (CORRECT, à garder)

---

### ⚠️ CACHE (ACCEPTABLE, mais à optimiser)

| Clé | Type | Fichiers | Fréquence invalidation |
|-----|------|----------|------------------------|
| `wilayas` | Référentiel | 10+ fichiers | 1/jour (rarement modifié) |
| `agences` | Référentiel | 8+ fichiers | 1/heure (peut changer) |
| `usersCache` | Cache users | 2 fichiers | 5 min |
| `agencesCache` | Cache agences | 2 fichiers | 5 min |
| `colisCache` | Cache colis | 3 fichiers | 1 min |
| `livraisonsCache` | Cache livraisons | 3 fichiers | 1 min |
| `retoursCache` | Cache retours | 3 fichiers | 1 min |
| `fraisLivraisonCache` | Cache frais | 3 fichiers | 1/heure |

**Total** : **~40 occurrences** (ACCEPTABLE avec TTL)

---

### 🔴 CLÉS GÉNÉRIQUES (À MIGRER/SUPPRIMER)

| Clé | Problème | Fichiers | Solution |
|-----|----------|----------|----------|
| `token` | Conflit multi-session | 5+ fichiers | Remplacer par `xxx_token` |
| `user` | Conflit multi-session | 8+ fichiers | Remplacer par `xxx_user` puis API |
| `userId`, `userRole`, etc. | Redondant avec user | login-new.html | Supprimer (dans user) |

**Total** : **~30 occurrences** (URGENT)

---

## 🎯 PLAN D'ACTION

### Phase 1 : Créer endpoint API `/api/auth/me` ✅
- Backend : Ajouter `getCurrentUser()` dans `authController.js`
- Route : `GET /api/auth/me` avec middleware auth
- Populate : Inclure `agence` avec `.populate('agence', 'nom code wilaya')`

### Phase 2 : Créer module API client
- Fichier : `dashboards/shared/js/api-client.js`
- Fonctions :
  - `getToken(role)`
  - `getCurrentUser(role)`
  - `getAgence(agenceId, role)`

### Phase 3 : Modifier login.html
- **AVANT** :
  ```javascript
  localStorage.setItem('commercant_user', JSON.stringify(data.data));
  ```
- **APRÈS** :
  ```javascript
  // Stocker SEULEMENT le token
  localStorage.setItem('commercant_token', data.data.token);
  ```

### Phase 4 : Migrer les dashboards
1. `commercant-dashboard.html` (6 usages)
2. `agent-dashboard.html` (3 usages)
3. `admin-dashboard.html` (2 usages)
4. `commercants-manager.js` (2 usages)
5. `colis-form.js` (4 usages)
6. `caisse-agent.js` (4 usages)
7. `caisse-commercant.js` (4 usages)

### Phase 5 : Nettoyer clés génériques
- Remplacer `localStorage.getItem('token')` → `localStorage.getItem('xxx_token')`
- Remplacer `localStorage.getItem('user')` → API call
- Supprimer `login-new.html` (obsolète)

### Phase 6 : Tests
- Vider localStorage : `localStorage.clear()`
- Login admin → Vérifier API `/api/auth/me`
- Login agent → Vérifier API `/api/auth/me`
- Login commerçant → Vérifier API `/api/auth/me`

---

## 📈 STATISTIQUES FINALES

| Catégorie | Occurrences | Statut |
|-----------|-------------|--------|
| **Tokens** | ~80 | ✅ À garder |
| **User data** | ~50 | 🔴 À migrer vers API |
| **Cache** | ~40 | ⚠️ Acceptable (ajouter TTL) |
| **Clés génériques** | ~30 | 🔴 À remplacer |
| **TOTAL** | **200+** | 55% à modifier |

---

**Voulez-vous que je commence la migration maintenant ?** 🚀
