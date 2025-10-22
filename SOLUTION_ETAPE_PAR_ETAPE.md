# 🚀 GUIDE RAPIDE : Résoudre le Problème des Commerçants

## ⚠️ Votre Diagnostic Montre

Vous avez ouvert la page **DIAGNOSTIC-COMMERCANTS.html** directement, sans être connecté au dashboard agent.

---

## ✅ SOLUTION EN 4 ÉTAPES

### Étape 1 : Vérifier le Backend ✅

Le backend est **déjà démarré** sur le port 1000 ✅

---

### Étape 2 : Se Connecter au Dashboard Agent

1. **Ouvrez dans votre navigateur** :
   ```
   http://localhost:9000/login-new.html
   ```

2. **Connectez-vous avec un compte AGENT** (pas admin, pas commercant)

3. **Après connexion**, vous serez redirigé vers le dashboard agent

---

### Étape 3 : Vérifier le SessionStorage

1. **Appuyez sur F12** (outils de développement)
2. **Allez dans l'onglet Application** (ou Storage)
3. **Session Storage → http://localhost:9000**
4. **Vérifiez que vous avez** :
   - ✅ `auth_token` (token JWT)
   - ✅ `user` (objet JSON avec vos infos)
   - ✅ `role` (doit être "agent")

**Si ces clés sont absentes** → Vous devez vous reconnecter :
```javascript
// Dans la console F12
sessionStorage.clear();
localStorage.clear();
// Puis reconnectez-vous
```

---

### Étape 4 : Aller dans la Section Commerçants

1. **Dans le dashboard agent**, cherchez le menu à gauche
2. **Cliquez sur "Gestion"** (ou icône de gestion)
3. **Cliquez sur "Commerçants"**
4. **Le tableau des commerçants doit s'afficher**

---

## 🧪 Tester la Création d'un Commerçant

Une fois dans la section Commerçants :

1. **Cliquez sur "Ajouter Commerçant"** (bouton en haut à droite)
2. **Remplissez le formulaire** :
   - Nom : TestCommercant
   - Prénom : Demo
   - Email : test@demo.com
   - Téléphone : 0555000000
   - Mot de passe : 123456
   - Wilaya : Alger
   - Adresse : Test

3. **Cliquez sur "Enregistrer"**

4. **Ouvrez la console F12** et cherchez :
   ```
   ✅ Agence agent trouvée: ...
   📤 Création commerçant: {...}
   ✅ Commerçant créé, rechargement de la liste...
   📥 Chargement des commerçants...
   ✅ Nombre de commerçants: X
   ```

5. **Le commerçant doit apparaître dans le tableau**

---

## 🔍 Diagnostic DANS le Dashboard

Si après connexion le commerçant ne s'affiche toujours pas :

1. **Restez sur le dashboard agent**
2. **Ouvrez F12 → Console**
3. **Copiez-collez ce code** :

```javascript
console.clear();
console.log('🔍 DIAGNOSTIC DEPUIS DASHBOARD\n');

// 1. Vérifier token
const token = sessionStorage.getItem('auth_token');
console.log('Token:', token ? '✅ Présent' : '❌ Absent');

// 2. Vérifier user
const user = sessionStorage.getItem('user');
console.log('User:', user ? '✅ Présent' : '❌ Absent');
if (user) {
    const u = JSON.parse(user);
    console.log('  Nom:', u.nom);
    console.log('  Role:', u.role);
    console.log('  Agence:', u.agence || '❌ Absent');
}

// 3. Vérifier tableau
const tbody = document.getElementById('commercantsTableBody');
console.log('\nTableau:', tbody ? '✅ Trouvé' : '❌ Non trouvé');

// 4. Test API
if (token) {
    console.log('\n📡 Appel API...');
    fetch('http://localhost:1000/api/auth/users?role=commercant', {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(d => {
        console.log('✅ API répond');
        console.log('Commerçants:', d.data?.length || 0);
        if (d.data && d.data.length > 0) {
            console.log('\n📋 LISTE:');
            d.data.forEach((c, i) => {
                console.log(`${i+1}. ${c.nom} (${c.email}) - Agence: ${c.agence}`);
            });
        }
    })
    .catch(err => console.error('❌ Erreur API:', err));
}
```

---

## ❌ Problèmes Courants

### Problème 1 : "Aucun token après connexion"

**Cause** : Le fichier `login-new.html` n'a pas été mis à jour avec la correction

**Solution** :
```javascript
// Console F12 après connexion
console.log('Test:', sessionStorage.getItem('auth_token'));
// Si null → Le login n'a pas stocké le token
```

**Vérification du fichier login-new.html** :
- Doit contenir (ligne ~333) :
  ```javascript
  sessionStorage.setItem('user', JSON.stringify(data.user));
  sessionStorage.setItem('auth_token', data.token);
  sessionStorage.setItem('role', data.user.role);
  ```

---

### Problème 2 : "Tableau non trouvé"

**Cause** : Vous n'êtes pas dans la section Commerçants

**Solution** : Cliquez sur le menu "Gestion" → "Commerçants"

---

### Problème 3 : "API retourne 0 commerçants"

**Cause** : Aucun commerçant n'a encore été créé

**Solution** : Créez un commerçant via le bouton "Ajouter Commerçant"

---

## 📊 Ordre des Actions

```
1. ✅ Backend démarré (déjà fait)
   ↓
2. 🔐 Se connecter comme AGENT
   ↓
3. ✅ Vérifier sessionStorage (F12 → Application)
   ↓
4. 📊 Aller dans section "Commerçants"
   ↓
5. ➕ Cliquer "Ajouter Commerçant"
   ↓
6. 📝 Remplir le formulaire
   ↓
7. 💾 Enregistrer
   ↓
8. ✅ Le commerçant apparaît dans le tableau
```

---

## 🎯 Action IMMÉDIATE

**MAINTENANT, faites ceci** :

1. Ouvrez un nouvel onglet : `http://localhost:9000/login-new.html`
2. Connectez-vous avec un compte **agent**
3. Une fois sur le dashboard, appuyez sur **F12**
4. Vérifiez dans **Application → Session Storage** :
   - Voyez-vous `auth_token` ? ✅/❌
   - Voyez-vous `user` ? ✅/❌
   - Voyez-vous `role` = "agent" ? ✅/❌

**Dites-moi ce que vous voyez !**

---

## 📞 Si Ça Ne Marche Toujours Pas

Après vous être connecté et avoir vérifié le sessionStorage, si le problème persiste :

1. **Copiez les logs de la console F12**
2. **Faites une capture d'écran** du tableau vide
3. **Collez le résultat** du diagnostic dans la console

Je pourrai alors identifier le problème exact !

---

**🚀 Commencez par vous connecter au dashboard agent maintenant !**
