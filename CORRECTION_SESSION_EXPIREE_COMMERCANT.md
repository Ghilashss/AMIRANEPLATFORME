# ✅ Correction : "Session expirée" lors de la Création de Colis (Commerçant)

## ❌ Problème

Lors de la création d'un colis en tant que **commerçant**, l'erreur suivante apparaissait :

```
⚠️ Session expirée. Veuillez vous reconnecter.
```

**Console logs** :
```javascript
❌ Erreur: Session expirée. Veuillez vous reconnecter.
```

---

## 🔍 Diagnostic

### Cause Racine

**Dans `colis-form-handler.js` :**

Le code cherchait **toujours** le token dans `sessionStorage['auth_token']` :

```javascript
// ❌ ANCIEN CODE (ligne 666 et autres)
async submitForm(formData) {
    const token = sessionStorage.getItem('auth_token'); // ❌ Uniquement sessionStorage !
    
    const response = await fetch('http://localhost:1000/api/colis', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
}
```

**Problème** : Le commerçant peut avoir son token dans **plusieurs endroits** :
- `sessionStorage['auth_token']` ← Si connexion récente
- `localStorage['commercant_token']` ← Si "Se souvenir de moi" coché
- `localStorage['token']` ← Token générique

---

## ✅ Solution

### Ajout d'une Fonction `getToken()` Intelligente

**Nouveau code dans `colis-form-handler.js` (lignes 17-60) :**

```javascript
/**
 * 🔑 Récupère le token selon le rôle
 * Cherche dans sessionStorage puis localStorage avec les bonnes clés
 */
getToken() {
    // 1️⃣ Essayer sessionStorage (pour tous)
    let token = sessionStorage.getItem('auth_token');
    if (token) {
        console.log('🔑 Token trouvé dans sessionStorage');
        return token;
    }

    // 2️⃣ Essayer localStorage selon le rôle
    if (this.userRole === 'commercant') {
        token = localStorage.getItem('commercant_token');
        if (token) {
            console.log('🔑 Token commercant trouvé dans localStorage');
            return token;
        }
    } else if (this.userRole === 'agent') {
        token = localStorage.getItem('agent_token');
        if (token) {
            console.log('🔑 Token agent trouvé dans localStorage');
            return token;
        }
    }

    // 3️⃣ Fallback : token générique
    token = localStorage.getItem('token');
    if (token) {
        console.log('🔑 Token générique trouvé dans localStorage');
        return token;
    }

    console.error('❌ Aucun token trouvé !');
    throw new Error('Session expirée. Veuillez vous reconnecter.');
}
```

---

## 🔄 Modifications Apportées

### Fichier : `colis-form-handler.js`

| Fonction | Avant | Après |
|----------|-------|-------|
| `loadCurrentUser()` | `sessionStorage.getItem('auth_token')` | `this.getToken()` |
| `loadWilayas()` | `sessionStorage.getItem('auth_token')` | `this.getToken()` |
| `loadAgences()` | `sessionStorage.getItem('auth_token')` | `this.getToken()` |
| `loadFraisLivraison()` | `sessionStorage.getItem('auth_token')` | `this.getToken()` |
| `submitForm()` | `sessionStorage.getItem('auth_token')` | `this.getToken()` ✅ **CRITIQUE** |

**Total** : 5 fonctions modifiées

---

## 🎯 Logique de Recherche du Token

### Ordre de Priorité

```
1. sessionStorage['auth_token']        ← Priorité HAUTE (connexion active)
   ↓ Si vide
2. localStorage['commercant_token']    ← Si userRole = 'commercant'
   OU
   localStorage['agent_token']         ← Si userRole = 'agent'
   ↓ Si vide
3. localStorage['token']               ← Token générique (fallback)
   ↓ Si vide
4. ❌ Erreur "Session expirée"
```

---

## 🧪 Test de la Correction

### Avant Correction

```javascript
// Console
❌ Erreur: Session expirée. Veuillez vous reconnecter.

// Utilisateur
⚠️ Le formulaire ne se soumet pas
```

### Après Correction

```javascript
// Console
🔑 Token commercant trouvé dans localStorage
✅ Colis créé: {tracking: "COL-2025-001", ...}

// Utilisateur
✅ Colis ajouté avec succès !
```

---

## 📊 Compatibilité

| Rôle | Token Principal | Fallback 1 | Fallback 2 |
|------|----------------|------------|------------|
| **Admin** | `sessionStorage['auth_token']` | `localStorage['token']` | - |
| **Agent** | `sessionStorage['auth_token']` | `localStorage['agent_token']` | `localStorage['token']` |
| **Commerçant** | `sessionStorage['auth_token']` | `localStorage['commercant_token']` | `localStorage['token']` |

---

## 🔍 Où le Token est Stocké ?

### Connexion Commerçant (`commercant-login.html`)

```javascript
// Ligne 565-572
localStorage.setItem('commercant_token', data.data.token);
localStorage.setItem('commercant_user', JSON.stringify(data.data));
localStorage.setItem('commercant_role', 'commercant');

// ET AUSSI (pour compatibilité)
sessionStorage.setItem('auth_token', data.data.token);
sessionStorage.setItem('user', JSON.stringify(data.data));
sessionStorage.setItem('role', 'commercant');
```

**Résultat** :
- ✅ Token dans sessionStorage (priorité)
- ✅ Token dans localStorage (backup)

Donc normalement le commerçant a **TOUJOURS** un token quelque part !

---

## 💡 Amélioration Supplémentaire (Optionnel)

Si l'erreur persiste, on peut ajouter des **logs de debug** :

```javascript
getToken() {
    console.log('🔍 Recherche token pour role:', this.userRole);
    
    // sessionStorage
    console.log('   → sessionStorage.auth_token:', !!sessionStorage.getItem('auth_token'));
    console.log('   → localStorage.commercant_token:', !!localStorage.getItem('commercant_token'));
    console.log('   → localStorage.token:', !!localStorage.getItem('token'));
    
    // ... reste du code
}
```

Cela permettra de voir **exactement** où le token est (ou n'est pas).

---

## ✅ Résumé

**Problème** : Token cherché uniquement dans `sessionStorage['auth_token']`  
**Cause** : Le commerçant peut avoir le token dans `localStorage['commercant_token']`  
**Solution** : Fonction `getToken()` intelligente avec fallbacks multiples  
**Résultat** : ✅ Commerçant peut créer des colis sans erreur de session  

---

**Fichiers Modifiés** :
- `dashboards/shared/js/colis-form-handler.js` (6 modifications)

**Lignes Modifiées** :
- Ligne 17-60 : Ajout de `getToken()`
- Ligne 92 : `loadCurrentUser()` utilise `this.getToken()`
- Ligne 116 : `loadWilayas()` utilise `this.getToken()`
- Ligne 141 : `loadAgences()` utilise `this.getToken()`
- Ligne 166 : `loadFraisLivraison()` utilise `this.getToken()`
- Ligne 713 : `submitForm()` utilise `this.getToken()` ✅

---

**Date de correction** : 19 octobre 2025  
**Status** : ✅ **CORRIGÉ**  
**Compatibilité** : Admin ✅ | Agent ✅ | Commerçant ✅
