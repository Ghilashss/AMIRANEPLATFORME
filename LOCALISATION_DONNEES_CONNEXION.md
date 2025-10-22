# 🔐 Localisation des Informations de Connexion

## 📍 Où sont stockées les données ?

Les informations de connexion sont stockées dans le **localStorage du navigateur** (pas dans une API).

### 🌐 localStorage = Stockage local du navigateur

- **Emplacement physique** : Dans le navigateur (Chrome, Firefox, Edge, etc.)
- **Accessible via** : JavaScript côté client
- **Persistance** : Les données restent même après fermeture du navigateur
- **Portée** : Limitée au domaine (localhost, chaque port est isolé)

---

## 🔑 Clés utilisées pour chaque rôle

### 1️⃣ **Commerçant** (ce qui vous intéresse)
```javascript
localStorage.getItem('commercant_token')  // Token JWT
localStorage.getItem('commercant_user')   // Objet user complet
```

**Contenu de `commercant_user` :**
```json
{
  "_id": "68f123abc...",
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "jean.dupont@example.com",
  "role": "commercant",
  "telephone": "0612345678",
  "agence": "68fab456def...",  // ← ID de l'agence qui l'a créé
  "wilaya": "16",
  "status": "actif"
}
```

### 2️⃣ **Agent**
```javascript
localStorage.getItem('agent_token')
localStorage.getItem('agent_user')
```

### 3️⃣ **Admin**
```javascript
localStorage.getItem('admin_token')
localStorage.getItem('admin_user')
```

---

## 🔍 Comment voir les données dans votre navigateur ?

### Méthode 1 : Console du navigateur (F12)

1. **Ouvrez votre dashboard commerçant** dans le navigateur
2. **Appuyez sur F12** pour ouvrir les DevTools
3. **Allez dans l'onglet "Console"**
4. **Tapez ces commandes** :

```javascript
// Voir le token
localStorage.getItem('commercant_token')

// Voir les infos utilisateur (format texte)
localStorage.getItem('commercant_user')

// Voir les infos utilisateur (format JSON lisible)
JSON.parse(localStorage.getItem('commercant_user'))

// Voir TOUTES les clés du localStorage
Object.keys(localStorage)

// Voir TOUT le localStorage
console.table(localStorage)
```

### Méthode 2 : Onglet "Application" (Recommandé ✅)

1. **F12** → **Onglet "Application"** (ou "Storage" selon navigateur)
2. **Dans le menu gauche** :
   - Développer **"Local Storage"**
   - Cliquer sur **"http://localhost:..."** (ou votre port)
3. **Vous verrez toutes les clés** :
   ```
   Key                    | Value
   ----------------------|------------------------------------------
   commercant_token      | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   commercant_user       | {"_id":"68f...","nom":"Dupont",...}
   ```

### Méthode 3 : Via le fichier test-commercant-info.html

1. **Ouvrez** `test-commercant-info.html` dans votre navigateur
2. **Cliquez sur** "1️⃣ Tester localStorage"
3. **Voir tous les détails** affichés automatiquement

---

## 📝 Quand et où sont enregistrées ces données ?

### 🔐 Lors de la connexion (login.html)

**Fichier** : `login.html` (lignes ~150-200)

```javascript
// Quand le login réussit :
if (data.success) {
  const role = data.data.role;
  
  // ✅ STOCKAGE selon le rôle
  if (role === 'commercant') {
    localStorage.setItem('commercant_token', data.data.token);
    localStorage.setItem('commercant_user', JSON.stringify(data.data));
    window.location.href = 'dashboards/commercant/commercant-dashboard.html';
  }
  else if (role === 'agent' || role === 'agence') {
    localStorage.setItem('agent_token', data.data.token);
    localStorage.setItem('agent_user', JSON.stringify(data.data));
    window.location.href = 'dashboards/agent/agent-dashboard.html';
  }
  else if (role === 'admin') {
    localStorage.setItem('admin_token', data.data.token);
    localStorage.setItem('admin_user', JSON.stringify(data.data));
    window.location.href = 'dashboards/admin/admin-dashboard.html';
  }
}
```

### 📡 L'API (backend) renvoie quoi ?

**Endpoint** : `POST /api/auth/login`

**Réponse de l'API** :
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "_id": "68f123...",
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@example.com",
    "role": "commercant",
    "telephone": "0612345678",
    "agence": "68fab456...",    // ← ID de l'agence (ObjectId)
    "wilaya": "16",
    "status": "actif",
    "token": "eyJhbGciOiJIUzI1NiIs..."  // ← Token JWT
  }
}
```

**Ce qui est stocké** :
- ✅ `commercant_token` = `data.data.token`
- ✅ `commercant_user` = `JSON.stringify(data.data)` (tout l'objet sauf le token)

---

## 🔄 Utilisation dans le dashboard

### Dans commercant-dashboard.html (ligne 791-805)

```javascript
// Configuration
const CONFIG = {
  API_URL: 'http://localhost:1000/api',
  TOKEN_KEY: 'commercant_token',  // ← Clé du token
  USER_KEY: 'commercant_user'      // ← Clé des données user
};

// Récupération des données
const token = localStorage.getItem(CONFIG.TOKEN_KEY);
const userStr = localStorage.getItem(CONFIG.USER_KEY);
const user = JSON.parse(userStr);

// Utilisation
console.log('Nom:', user.nom);
console.log('Agence ID:', user.agence);
```

### Pour charger l'agence (ligne 803-862)

```javascript
async function loadCommercantInfo() {
  // 1. Récupérer depuis localStorage
  const userStr = localStorage.getItem('commercant_user');
  const token = localStorage.getItem('commercant_token');
  
  const user = JSON.parse(userStr);
  
  // 2. Si user.agence existe, appeler l'API
  if (user.agence && token) {
    const response = await fetch(
      `http://localhost:1000/api/agences/${user.agence}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    
    const result = await response.json();
    // result.data.nom = nom de l'agence
  }
}
```

---

## 🧪 Tester avec la console F12

Ouvrez **dashboards/commercant/commercant-dashboard.html** et dans la console :

```javascript
// 1. Vérifier si connecté
const user = JSON.parse(localStorage.getItem('commercant_user'));
console.log('Connecté en tant que:', user.nom, user.prenom);

// 2. Vérifier l'agence
console.log('Agence ID:', user.agence);

// 3. Si pas d'agence
if (!user.agence) {
  console.error('❌ Cet utilisateur n\'a PAS d\'agence assignée');
}

// 4. Tester l'API manuellement
const token = localStorage.getItem('commercant_token');
fetch(`http://localhost:1000/api/agences/${user.agence}`, {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(d => console.log('Agence:', d));
```

---

## 🔴 Problèmes courants

### ❌ "localStorage is not defined"
- **Cause** : Vous essayez d'utiliser localStorage côté serveur (Node.js)
- **Solution** : localStorage n'existe QUE dans le navigateur

### ❌ user.agence = undefined
- **Cause** : L'utilisateur a été créé AVANT la mise à jour
- **Solution** : Recréer le commerçant via le dashboard agent

### ❌ Token expiré (401 Unauthorized)
- **Cause** : Le JWT a expiré (durée : 24h par défaut)
- **Solution** : Se déconnecter et se reconnecter

### ❌ "Chargement..." ne change pas
- **Cause** : La fonction `loadCommercantInfo()` ne s'exécute pas ou échoue
- **Solution** : Ouvrir F12 → Console et regarder les logs `[INFO]`, `[ERROR]`

---

## 📋 Résumé

| Question | Réponse |
|----------|---------|
| **Où sont les données ?** | Dans le localStorage du navigateur (pas dans l'API) |
| **Clé du token** | `commercant_token` |
| **Clé des données user** | `commercant_user` |
| **Comment voir ?** | F12 → Console → `localStorage.getItem('commercant_user')` |
| **Ou** | F12 → Application → Local Storage → localhost |
| **Quand sont-elles créées ?** | Lors du login (login.html) |
| **D'où viennent-elles ?** | De l'API POST /api/auth/login |
| **Combien de temps ?** | Jusqu'à déconnexion ou expiration token |

---

## 🎯 Action à faire maintenant

1. **Ouvrez F12** dans le dashboard commerçant
2. **Tapez dans la console** :
   ```javascript
   const user = JSON.parse(localStorage.getItem('commercant_user'));
   console.log('👤 User:', user);
   console.log('🏢 Agence:', user.agence);
   ```
3. **Regardez le résultat** :
   - ✅ Si `agence` = un ID (ex: "68f123...") → OK
   - ❌ Si `agence` = undefined → Le commerçant n'a pas d'agence

**Dites-moi ce que vous voyez** ! 👀
