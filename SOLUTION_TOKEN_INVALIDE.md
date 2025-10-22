# 🔐 SOLUTION - TOKEN INVALIDE

## ❌ ERREUR RENCONTRÉE
```
❌ Erreur lors du chargement des agences: 
{"success":false,"message":"Non autorisé - Token invalide"}
```

## 🎯 CAUSE DU PROBLÈME

Le **token JWT** a expiré. Les tokens ont une durée de validité limitée (généralement 7 jours).

**Raisons possibles :**
1. Vous êtes resté connecté trop longtemps
2. Le token a été généré il y a plus de 7 jours
3. Le serveur a été redémarré et les tokens ont changé
4. Vous avez relancé le seed qui a recréé les utilisateurs

## ✅ SOLUTION IMMÉDIATE

### **Étape 1 : Se déconnecter proprement**
Dans la console du navigateur (F12), taper :
```javascript
localStorage.removeItem('token');
localStorage.removeItem('user');
location.reload();
```

### **Étape 2 : Se reconnecter**
1. Aller sur : `http://localhost:8080/dashboards/commercant/commercant-login.html`
2. Email : `commercant@test.com`
3. Password : `123456`
4. Cliquer sur "Se connecter"

### **Étape 3 : Tester à nouveau**
1. Aller sur "Mes Colis"
2. Cliquer sur "+ Ajouter un Colis"
3. Les listes doivent se remplir maintenant ! ✅

---

## 🔧 CORRECTIONS APPLIQUÉES

### **1. Détection automatique du token invalide**
```javascript
if (response.status === 401) {
  // Token expiré
  alert('⚠️ Votre session a expiré. Veuillez vous reconnecter.');
  // Nettoyage automatique
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // Redirection vers login
  window.location.href = 'commercant-login.html';
}
```

### **2. Vérification avant ouverture du modal**
Le système vérifie maintenant si vous êtes connecté AVANT d'ouvrir le formulaire.

### **3. Messages d'erreur clairs**
- Token invalide → Redirection automatique vers login
- Pas de token → Message d'alerte
- Erreur réseau → Message avec détails

---

## 🧪 TEST COMPLET

### **Méthode 1 : Reconnexion manuelle (RECOMMANDÉ)**

**Dans le navigateur :**
1. Appuyer sur **F12** (console)
2. Taper :
   ```javascript
   localStorage.clear();
   ```
3. Appuyer sur **Entrée**
4. Fermer la console
5. Aller sur : `http://localhost:8080/dashboards/commercant/commercant-login.html`
6. Se connecter avec :
   - Email : `commercant@test.com`
   - Password : `123456`
7. Une fois connecté, cliquer sur "Mes Colis"
8. Cliquer sur "+ Ajouter un Colis"
9. ✅ Les listes doivent se remplir !

---

### **Méthode 2 : Navigation privée (ALTERNATIVE)**

1. Ouvrir une **fenêtre privée/incognito** :
   - Chrome/Edge : `Ctrl + Shift + N`
   - Firefox : `Ctrl + Shift + P`

2. Aller sur : `http://localhost:8080/dashboards/commercant/commercant-login.html`

3. Se connecter : `commercant@test.com` / `123456`

4. Tester le formulaire

**Avantage :** Pas de vieux tokens en cache

---

## 🔍 VÉRIFICATION DU TOKEN

### **Voir le token actuel**
Dans la console (F12) :
```javascript
const token = localStorage.getItem('token');
console.log('Token:', token);

// Décoder le token (partie payload)
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('Payload:', payload);
  console.log('Expire le:', new Date(payload.exp * 1000));
  console.log('Expiré ?', Date.now() > payload.exp * 1000);
}
```

**Si "Expiré ?" renvoie `true`** → Le token est périmé, reconnectez-vous !

---

## 📊 DIAGNOSTIC COMPLET

### **1. Vérifier le backend**
```bash
netstat -ano | Select-String "5000"
```
✅ Doit afficher : `LISTENING       XXXXX`

### **2. Tester la connexion directement**
Dans la console (F12) :
```javascript
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    email: 'commercant@test.com',
    password: '123456'
  })
})
.then(r => r.json())
.then(d => {
  console.log('Connexion:', d);
  if (d.success) {
    localStorage.setItem('token', d.data.token);
    localStorage.setItem('user', JSON.stringify(d.data));
    alert('✅ Reconnecté ! Rafraîchissez la page.');
  }
});
```

### **3. Tester l'API agences avec le nouveau token**
```javascript
const token = localStorage.getItem('token');
fetch('http://localhost:5000/api/agences', {
  headers: {'Authorization': 'Bearer ' + token}
})
.then(r => r.json())
.then(d => console.log('Agences:', d));
```

---

## 💡 POURQUOI CE PROBLÈME ?

### **Tokens JWT expirés**
Les tokens JWT ont une **date d'expiration** codée dedans :
```javascript
{
  "id": "68efab6c640cf90785bcfe57",
  "iat": 1760539580,     // Créé le
  "exp": 1761144380      // Expire le (7 jours après)
}
```

Après la date `exp`, le token n'est plus valide.

### **Quand ça arrive ?**
- Après 7 jours sans se reconnecter
- Quand vous relancez `node seed.js` (recrée les users)
- Si le SECRET JWT change dans le backend

---

## ✨ NOUVELLE FONCTIONNALITÉ AJOUTÉE

### **Redirection automatique**
Maintenant, si votre session expire :
1. ❌ Le système détecte le token invalide (401)
2. 🗑️ Nettoie automatiquement le localStorage
3. ⏰ Attend 2 secondes
4. ↩️ Vous redirige vers la page de login
5. ✅ Vous vous reconnectez
6. 🎉 Tout remarche !

**Plus besoin de vider manuellement le cache !**

---

## 🎯 SOLUTION EN 3 ÉTAPES

### **ÉTAPE 1 : NETTOYER**
```javascript
// Dans la console (F12)
localStorage.clear();
```

### **ÉTAPE 2 : RECONNECTER**
```
http://localhost:8080/dashboards/commercant/commercant-login.html
commercant@test.com / 123456
```

### **ÉTAPE 3 : TESTER**
```
Mes Colis → + Ajouter un Colis → ✅ Listes remplies !
```

---

## 📝 RÉSUMÉ

**Problème :** Token JWT expiré (erreur 401)  
**Cause :** Session trop ancienne ou seed relancé  
**Solution :** Se reconnecter pour obtenir un nouveau token  
**Correction :** Détection automatique + redirection vers login  

**➡️ Reconnectez-vous maintenant et tout fonctionnera ! 🚀**
