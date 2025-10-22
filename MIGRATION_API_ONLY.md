# 🔄 Migration : Données dans API (pas localStorage)

## 🎯 Objectif

**AVANT** : Token + User complet dans localStorage
**APRÈS** : Token SEULEMENT dans localStorage, données récupérées depuis l'API

---

## ✅ Avantages de cette approche

1. **Sécurité** : Moins de données sensibles côté client
2. **Fraîcheur** : Données toujours à jour (pas de cache obsolète)
3. **Contrôle** : Si on modifie un user côté admin, changements visibles immédiatement
4. **Conformité** : Moins de données personnelles stockées localement

---

## 🔧 Modifications à faire

### 1️⃣ Backend : Ajouter endpoint "GET /api/auth/me"

**Fichier** : `backend/controllers/authController.js`

**Nouveau endpoint** pour récupérer l'utilisateur connecté :

```javascript
// GET /api/auth/me - Récupérer l'utilisateur connecté
exports.getCurrentUser = async (req, res) => {
  try {
    // req.user est déjà injecté par le middleware auth
    const userId = req.user.id;
    
    const user = await User.findById(userId)
      .select('-password') // Exclure le mot de passe
      .populate('agence', 'nom code wilaya telephone'); // Inclure l'agence directement
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Erreur getCurrentUser:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
};
```

**Ajouter la route** dans `backend/routes/auth.js` :

```javascript
router.get('/me', auth, authController.getCurrentUser);
```

---

### 2️⃣ Frontend : Modifier login.html

**Stocker UNIQUEMENT le token** :

```javascript
// AVANT (à supprimer)
localStorage.setItem('commercant_user', JSON.stringify(data.data));

// APRÈS (garder seulement ça)
localStorage.setItem('commercant_token', data.data.token);
```

---

### 3️⃣ Frontend : Créer un module API centralisé

**Nouveau fichier** : `dashboards/shared/js/api-client.js`

```javascript
// Module centralisé pour les appels API
const ApiClient = {
  baseURL: 'http://localhost:1000/api',
  
  // Récupérer le token selon le rôle
  getToken(role = 'commercant') {
    return localStorage.getItem(`${role}_token`);
  },
  
  // Récupérer l'utilisateur connecté depuis l'API
  async getCurrentUser(role = 'commercant') {
    const token = this.getToken(role);
    
    if (!token) {
      throw new Error('Non connecté');
    }
    
    const response = await fetch(`${this.baseURL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        // Token invalide ou expiré
        localStorage.removeItem(`${role}_token`);
        throw new Error('Session expirée');
      }
      throw new Error('Erreur serveur');
    }
    
    const data = await response.json();
    return data.data; // Retourne directement l'objet user
  },
  
  // Récupérer une agence par ID
  async getAgence(agenceId, role = 'commercant') {
    const token = this.getToken(role);
    
    const response = await fetch(`${this.baseURL}/agences/${agenceId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Erreur chargement agence');
    }
    
    const data = await response.json();
    return data.data;
  }
};
```

---

### 4️⃣ Frontend : Modifier commercant-dashboard.html

**Remplacer la fonction loadCommercantInfo()** :

```javascript
async function loadCommercantInfo() {
  try {
    // ✅ NOUVELLE APPROCHE : Récupérer depuis l'API
    const user = await ApiClient.getCurrentUser('commercant');
    
    console.log('[INFO] Utilisateur depuis API:', user);
    
    // Afficher nom et email
    document.getElementById('commercantNom').textContent = 
      user.nom + (user.prenom ? ' ' + user.prenom : '');
    document.getElementById('commercantEmail').textContent = user.email || '';
    
    // Si l'utilisateur a une agence
    if (user.agence) {
      // Option 1 : Si populate dans l'API (agence est un objet)
      if (typeof user.agence === 'object' && user.agence.nom) {
        document.getElementById('agenceNom').textContent = user.agence.nom;
        console.log('[SUCCESS] Agence:', user.agence.nom);
      }
      // Option 2 : Si agence est juste un ID (faire un 2e appel)
      else if (typeof user.agence === 'string') {
        const agence = await ApiClient.getAgence(user.agence, 'commercant');
        document.getElementById('agenceNom').textContent = 
          agence.nom || `Agence ${agence.wilaya}`;
        console.log('[SUCCESS] Agence:', agence.nom);
      }
    } else {
      document.getElementById('agenceNom').textContent = 'Aucune agence';
      console.log('[WARN] Pas d\'agence assignee');
    }
    
  } catch (error) {
    console.error('[ERROR] Erreur chargement:', error.message);
    
    if (error.message === 'Session expirée' || error.message === 'Non connecté') {
      alert('⚠️ Session expirée. Reconnexion...');
      window.location.href = '../../login.html';
    } else {
      document.getElementById('agenceNom').textContent = 'Erreur';
    }
  }
}
```

---

## 📋 Plan de migration complet

### Étape 1 : Backend
- [ ] Ajouter `getCurrentUser()` dans `authController.js`
- [ ] Ajouter route `GET /api/auth/me` dans `routes/auth.js`
- [ ] Redémarrer le backend

### Étape 2 : Module API
- [ ] Créer `dashboards/shared/js/api-client.js`
- [ ] Inclure dans tous les dashboards

### Étape 3 : Login
- [ ] Modifier `login.html` pour stocker SEULEMENT le token
- [ ] Supprimer `localStorage.setItem('xxx_user', ...)`

### Étape 4 : Dashboards
- [ ] Modifier `commercant-dashboard.html`
- [ ] Modifier `agent-dashboard.html`
- [ ] Modifier `admin-dashboard.html`

### Étape 5 : Migration utilisateurs existants
- [ ] Créer script pour vider les anciennes clés `xxx_user`
- [ ] Tester avec tous les rôles

---

## 🧪 Test après migration

```javascript
// Console F12 - Vérifier localStorage
console.log('Token:', localStorage.getItem('commercant_token')); // ✅ Doit exister
console.log('User:', localStorage.getItem('commercant_user')); // ❌ Doit être null

// Tester l'API
const token = localStorage.getItem('commercant_token');
fetch('http://localhost:1000/api/auth/me', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(d => console.log('User depuis API:', d));
```

---

## 📊 Comparaison

| Aspect | AVANT (localStorage) | APRÈS (API) |
|--------|---------------------|-------------|
| **Token** | ✅ localStorage | ✅ localStorage |
| **Nom, Email** | ❌ localStorage | ✅ API |
| **Agence** | ❌ localStorage | ✅ API |
| **Wilaya** | ❌ localStorage | ✅ API |
| **Sécurité** | ⚠️ Moyenne | ✅ Élevée |
| **Fraîcheur données** | ⚠️ Cache obsolète | ✅ Toujours à jour |
| **Appels réseau** | 1 (login) | 1 (login) + 1 (chargement page) |

---

**Voulez-vous que je commence la migration maintenant ?** 🚀

Je vais :
1. Créer l'endpoint `/api/auth/me` dans le backend
2. Créer le module `api-client.js`
3. Modifier `login.html` pour ne stocker que le token
4. Modifier `commercant-dashboard.html` pour utiliser l'API

**Confirmez et je lance la migration !** 👍
