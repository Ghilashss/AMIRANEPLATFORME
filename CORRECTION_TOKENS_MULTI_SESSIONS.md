# 🔧 Correction du Système de Tokens - Sessions Multiples

## ✅ Problème résolu

**Avant** : Les tokens étaient stockés dans `localStorage.getItem('token')`, ce qui causait des conflits quand plusieurs rôles étaient connectés en même temps dans différents onglets.

**Après** : Chaque rôle utilise maintenant sa propre clé localStorage :
- **Admin** → `admin_token` + `admin_user`
- **Agent** → `agent_token` + `agent_user`  
- **Commerçant** → `commercant_token` + `commercant_user`

---

## 📝 Modifications effectuées

### 1. **login.html** ✅
- ❌ Suppression de `localStorage.setItem('token', ...)` (clé générique)
- ✅ Utilisation UNIQUEMENT de clés spécifiques : `admin_token`, `agent_token`, `commercant_token`
- ✅ Suppression des clés génériques avant chaque connexion

```javascript
// AVANT (causait conflits)
localStorage.setItem('token', data.data.token);
localStorage.setItem('user', JSON.stringify(data.data));

// APRÈS (isolation par rôle)
if (role === 'admin') {
  localStorage.setItem('admin_token', data.data.token);
  localStorage.setItem('admin_user', JSON.stringify(data.data));
}
```

### 2. **dashboards/admin/js/*.js** ✅
Fichiers modifiés automatiquement par `fix-admin-tokens.js` :
- ✅ `frais-livraison.js` (4 occurrences)
- ✅ `modal-manager.js` (1 occurrence)
- ✅ `data-store.js` (6 occurrences + fonction getAdminToken())
- ✅ `livraisons-manager.js` (4 occurrences)
- ✅ `retours-manager.js` (4 occurrences)
- ✅ `caisse-admin.js` (1 occurrence + suppression fallback)
- ✅ `caisse-manager.js` (5 occurrences)
- ✅ `user-form.js` (1 occurrence)

**Total : 26 occurrences remplacées**

```javascript
// AVANT
const token = localStorage.getItem('token');

// APRÈS
const token = localStorage.getItem('admin_token');
```

### 3. **data-store.js - Fonction helper** ✅
```javascript
// AVANT (avec fallback qui causait conflits)
getAdminToken() {
    return localStorage.getItem('admin_token') || localStorage.getItem('token');
}

// APRÈS (isolation stricte)
getAdminToken() {
    const token = localStorage.getItem('admin_token');
    if (!token) {
        console.warn('⚠️ Pas de token admin');
    }
    return token;
}
```

### 4. **Logout Admin** ✅
- ✅ Supprime UNIQUEMENT `admin_token` et `admin_user`
- ✅ **Préserve** `agent_token`, `commercant_token`, etc.

```javascript
// Nouveau comportement
localStorage.removeItem('admin_token');
localStorage.removeItem('admin_user');
// NE supprime PLUS 'token' et 'user' génériques
```

---

## 🚀 Avantages

### ✅ Sessions multiples possibles
- **Onglet 1** : Admin connecté
- **Onglet 2** : Agent connecté  
- **Onglet 3** : Commerçant connecté
- **Pas de conflit** entre les sessions !

### ✅ Sécurité améliorée
- Chaque rôle a son propre espace isolé
- Pas de token écrasé accidentellement
- Déconnexion ciblée (ne touche pas aux autres sessions)

### ✅ Debugging facilité
```javascript
console.log({
  admin: localStorage.getItem('admin_token'),
  agent: localStorage.getItem('agent_token'),
  commercant: localStorage.getItem('commercant_token')
});
```

---

## 🧪 Tests à effectuer

### Test 1 : Connexion Admin seul
1. Ouvrir `login.html`
2. Se connecter en tant qu'admin
3. ✅ Vérifier : `admin_token` existe dans localStorage
4. ✅ Vérifier : Dashboard admin s'affiche correctement

### Test 2 : Connexion Agent seul
1. Ouvrir `login.html`
2. Se connecter en tant qu'agent
3. ✅ Vérifier : `agent_token` existe dans localStorage
4. ✅ Vérifier : Dashboard agent s'affiche correctement

### Test 3 : Sessions multiples (le vrai test !)
1. **Onglet 1** : Se connecter en admin
2. **Onglet 2** (SANS fermer l'onglet 1) : Se connecter en agent
3. ✅ Vérifier dans la console F12 :
   ```javascript
   localStorage.getItem('admin_token')      // existe
   localStorage.getItem('agent_token')      // existe
   localStorage.getItem('token')            // null (plus utilisé)
   ```
4. ✅ Vérifier : Les deux dashboards fonctionnent en parallèle
5. ✅ Tester la déconnexion admin → l'agent reste connecté
6. ✅ Tester la déconnexion agent → l'admin reste connecté

### Test 4 : Déconnexion sélective
1. Admin + Agent connectés en simultané
2. Cliquer "Déconnexion" dans l'onglet admin
3. ✅ Vérifier : `admin_token` supprimé
4. ✅ Vérifier : `agent_token` **toujours présent**
5. ✅ Vérifier : L'onglet agent fonctionne encore

---

## 🐛 Problèmes connus & Solutions

### Problème : "Token manquant" après la mise à jour
**Cause** : Ancien token générique `'token'` dans localStorage  
**Solution** :
```javascript
// Dans la console F12
localStorage.clear();
// Puis reconnexion
```

### Problème : API retourne 401 Unauthorized
**Cause** : Token expiré ou clé localStorage incorrecte  
**Solution** :
1. Vérifier le token : `localStorage.getItem('admin_token')`
2. Si null → reconnexion nécessaire
3. Si existe → vérifier que l'API utilise le bon header

### Problème : Les deux dashboards se déconnectent ensemble
**Cause** : Ancienne version du code non mise à jour  
**Solution** :
1. Vider le cache du navigateur (Ctrl+Shift+Delete)
2. Recharger la page (Ctrl+F5)
3. Reconnexion

---

## 📂 Fichiers créés

1. **fix-admin-tokens.js** - Script de migration automatique (déjà exécuté ✅)
2. **logout-admin-fixed.js** - Fonction de logout sécurisée
3. **CORRECTION_TOKENS_MULTI_SESSIONS.md** - Ce document

---

## ⚙️ Configuration backend (déjà OK)

Le backend **n'a pas besoin de modification** car il utilise déjà le header `Authorization: Bearer TOKEN`. Peu importe que le token vienne de `admin_token`, `agent_token` ou `commercant_token` - tant que le frontend l'envoie correctement.

---

## 🎯 Prochaines étapes (TODO)

### Pour l'Agent
- [ ] Créer `fix-agent-tokens.js` (même principe)
- [ ] Modifier `dashboards/agent/js/*.js` pour utiliser `agent_token`
- [ ] Tester sessions agent + commercant

### Pour le Commerçant
- [ ] Créer `fix-commercant-tokens.js`
- [ ] Modifier `dashboards/commercant/*.js` pour utiliser `commercant_token`
- [ ] Tester sessions commercant + admin

### Général
- [ ] Créer un système de vérification au chargement :
  ```javascript
  // Au début de chaque dashboard
  function checkAuth(requiredRole) {
    const tokenKey = `${requiredRole}_token`;
    const token = localStorage.getItem(tokenKey);
    if (!token) {
      window.location.href = '../../login.html';
    }
  }
  ```

---

## ✅ Résumé des changements

| Fichier | Avant | Après | Status |
|---------|-------|-------|--------|
| login.html | `token` générique | Clés spécifiques | ✅ |
| data-store.js | Fallback `token` | `admin_token` uniquement | ✅ |
| frais-livraison.js | `token` | `admin_token` | ✅ |
| modal-manager.js | `token` | `admin_token` | ✅ |
| livraisons-manager.js | `token` | `admin_token` | ✅ |
| retours-manager.js | `token` | `admin_token` | ✅ |
| caisse-admin.js | `token` | `admin_token` | ✅ |
| caisse-manager.js | `token` | `admin_token` | ✅ |
| user-form.js | `token` | `admin_token` | ✅ |
| admin-dashboard.html | Logout supprime tout | Logout ciblé | ✅ |

---

## 📞 Support

En cas de problème après les modifications :
1. Ouvrir la console F12
2. Taper : `localStorage`
3. Copier le contenu complet
4. Partager avec le développeur

---

**Date de modification** : 17 octobre 2025  
**Version** : 2.0 - Tokens isolés par rôle  
**Statut** : ✅ DÉPLOYÉ (Admin uniquement)
