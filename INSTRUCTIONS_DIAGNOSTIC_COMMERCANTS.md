# 🚀 INSTRUCTIONS : Diagnostic Commerçants Pas Affichés

## 📋 Problème

Les commerçants créés ne s'affichent pas dans le tableau du dashboard agent.

---

## ✅ Solution en 3 Étapes

### Étape 1 : Ouvrir la Page de Diagnostic

**Ouvrez dans votre navigateur** :
```
http://localhost:9000/DIAGNOSTIC-COMMERCANTS.html
```

**OU double-cliquez sur** :
```
DIAGNOSTIC-COMMERCANTS.html
```

---

### Étape 2 : Lancer le Diagnostic

1. Cliquez sur le bouton **"🔍 Lancer Diagnostic Complet"**
2. Attendez quelques secondes
3. Analysez les résultats :

**Cherchez les ❌ (erreurs) :**
- ❌ Token absent → **Reconnectez-vous**
- ❌ Tableau non trouvé → **Allez dans section Commerçants**
- ❌ Backend hors ligne → **Démarrez le backend**
- ❌ API erreur 401 → **Token invalide, reconnectez-vous**

---

### Étape 3 : Appliquer la Solution

#### Si "❌ Token absent" :
```javascript
// Console F12 sur dashboard agent
sessionStorage.clear();
localStorage.clear();
// Puis reconnectez-vous via login-new.html
```

#### Si "❌ Backend hors ligne" :
```powershell
# Terminal PowerShell
cd backend
node server.js
```

#### Si "⚠️ Aucun commerçant" (mais vous venez d'en créer un) :
```javascript
// Console F12 sur dashboard agent
location.reload();
```

---

## 🔍 Diagnostic Manuel (Alternative)

Si vous préférez utiliser la **Console (F12)** directement :

### 1. Ouvrez le Dashboard Agent

### 2. Appuyez sur F12 → Console

### 3. Copiez-Collez ce Code :

```javascript
console.clear();
console.log('🔍 DIAGNOSTIC RAPIDE\n');

// Token
const token = sessionStorage.getItem('auth_token') || localStorage.getItem('token');
console.log('Token:', token ? '✅ Présent' : '❌ Absent');

// User
const user = sessionStorage.getItem('user');
console.log('User:', user ? '✅ Présent' : '❌ Absent');
if (user) {
    const u = JSON.parse(user);
    console.log('  - Nom:', u.nom);
    console.log('  - Role:', u.role);
    console.log('  - Agence:', u.agence || '❌ Absent');
}

// Tableau
const tbody = document.getElementById('commercantsTableBody');
console.log('\nTableau:', tbody ? '✅ Trouvé' : '❌ Non trouvé');
if (tbody) {
    console.log('  - Lignes:', tbody.querySelectorAll('tr').length);
}

// Test API
if (token) {
    console.log('\n📡 Test API...');
    fetch('http://localhost:1000/api/auth/users?role=commercant', {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(r => {
        console.log('Status:', r.status);
        return r.json();
    })
    .then(d => {
        console.log('Success:', d.success ? '✅' : '❌');
        console.log('Commerçants:', d.data?.length || 0);
        if (d.data && d.data.length > 0) {
            console.log('\n📋 LISTE:');
            d.data.forEach((c, i) => {
                console.log(`${i+1}. ${c.nom} (${c.email})`);
                console.log(`   Agence: ${c.agence}`);
                console.log(`   Créé: ${new Date(c.createdAt).toLocaleString()}`);
            });
        }
    })
    .catch(err => console.error('❌ Erreur:', err));
}
```

---

## 🎯 Checklist de Vérification

Avant de créer un commerçant, vérifiez :

- [ ] ✅ Backend démarré (`netstat -ano | findstr :1000`)
- [ ] ✅ MongoDB démarré
- [ ] ✅ Connecté comme **agent** (pas admin/commercant)
- [ ] ✅ Token présent dans sessionStorage
- [ ] ✅ Dans la section **"Commerçants"** du dashboard
- [ ] ✅ Console F12 ouverte (pour voir les logs)

---

## 📊 Après Création d'un Commerçant

**Dans la console, vous DEVEZ voir** :

```
✅ Agence agent trouvée: 507f1f77...
📤 Création commerçant: {nom: "...", email: "..."}
📩 Réponse backend: {success: true, ...}
✅ Commerçant créé, rechargement de la liste...
🔄 Appel de chargerCommercants()...
📥 Chargement des commerçants...
🔑 Token: Présent
📡 Réponse status: 200
📦 Résultat: {success: true, data: Array(X)}
✅ Nombre de commerçants: X
📊 Affichage de X commerçants
🎯 Tbody trouvé: OUI
✅ Tableau mis à jour avec X lignes
✅ chargerCommercants() terminé
```

**Si vous ne voyez PAS ces logs** → Le script ne fonctionne pas correctement.

---

## 🔧 Solutions Courantes

### Problème 1 : "Le tableau reste vide"

**Solution** :
```javascript
// Console F12
location.reload();
```

---

### Problème 2 : "Token invalide / 401 Unauthorized"

**Solution** :
1. Nettoyer le storage :
   ```javascript
   sessionStorage.clear();
   localStorage.clear();
   ```
2. Reconnecter via `login-new.html`

---

### Problème 3 : "Backend ne répond pas"

**Vérification** :
```powershell
netstat -ano | findstr :1000
```

**Si vide** :
```powershell
cd backend
node server.js
```

---

### Problème 4 : "Commerçant créé mais nombre reste à 0"

**Causes possibles** :
1. Le commerçant a été créé avec un autre rôle
2. Le commerçant est assigné à une autre agence
3. Le filtre API ne retourne pas tous les commerçants

**Vérification** :
```javascript
// Console F12 - Voir TOUS les users
fetch('http://localhost:1000/api/auth/users', {
    headers: { 'Authorization': 'Bearer ' + sessionStorage.getItem('auth_token') }
})
.then(r => r.json())
.then(d => {
    console.log('TOUS les users:', d.data);
    console.log('Commerçants:', d.data.filter(u => u.role === 'commercant'));
});
```

---

## 📞 Support

Si le problème persiste après toutes ces vérifications :

1. **Copiez les logs console complets** (F12 → Console → Tout sélectionner → Copier)
2. **Copiez le résultat du diagnostic** (DIAGNOSTIC-COMMERCANTS.html)
3. **Prenez une capture d'écran** du tableau vide

---

## ✅ Résumé Express

```
1. Ouvrir DIAGNOSTIC-COMMERCANTS.html
2. Cliquer "Lancer Diagnostic Complet"
3. Chercher les ❌
4. Appliquer la solution correspondante
5. Retester la création de commerçant
```

---

**C'est parti ! Ouvrez DIAGNOSTIC-COMMERCANTS.html maintenant ! 🚀**
