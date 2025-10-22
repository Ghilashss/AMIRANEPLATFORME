# 🔧 GUIDE DE DÉPANNAGE - ERREUR DE CONNEXION

## ❌ Erreur: "Erreur de connexion au serveur. Veuillez réessayer."

### ✅ Vérifications effectuées :
- [x] Backend actif sur port 5000 ✅
- [x] Frontend actif sur port 8080 ✅
- [x] API répond correctement ✅
- [x] CORS configuré ✅

---

## 🔍 DIAGNOSTIC

L'erreur vient probablement de l'une de ces causes :

### 1. **Problème de module JavaScript (le plus probable)**
Le fichier `commercant-dashboard.js` utilise des **modules ES6** mais le navigateur ne les charge pas correctement.

### 2. **Console du navigateur**
Ouvrez la console (F12) et cherchez les erreurs comme :
- `Failed to load module`
- `CORS error`
- `404 Not Found`
- `Network Error`

---

## 🛠️ SOLUTIONS

### Solution 1 : Vérifier la Console du Navigateur

1. Appuyez sur **F12** pour ouvrir les DevTools
2. Allez dans l'onglet **Console**
3. Rechargez la page (F5)
4. Regardez les erreurs en rouge

**Erreurs courantes :**
```
Failed to load module script: Expected a JavaScript module script
```
→ Problème de type module

```
Access to fetch at 'http://localhost:5000/api/...' has been blocked by CORS
```
→ Problème CORS (déjà résolu normalement)

```
GET http://localhost:8080/dashboards/commercant/js/config.js net::ERR_ABORTED 404
```
→ Fichier JavaScript manquant

---

### Solution 2 : Tester avec le Login Simple (TEMPORAIRE)

En attendant, vous pouvez tester avec la **page de login générale** :

**URL :** http://localhost:8080/login.html

**Identifiants :**
- Email : `commercant@test.com`
- Mot de passe : `123456`

Cette page devrait rediriger automatiquement vers le bon dashboard.

---

### Solution 3 : Vérifier les Fichiers JavaScript

Les fichiers suivants doivent exister :

```
dashboards/commercant/js/
├── config.js                ✅ Créé
├── utils.js                 ✅ Créé
├── nav-manager.js           ✅ Créé
├── data-store.js            ✅ Créé
└── commercant-dashboard.js  ✅ Créé
```

Vérifions qu'ils sont bien présents...

---

### Solution 4 : Test Direct de l'API

Testez si l'API répond depuis le navigateur :

**Ouvrez cette URL :**
```
http://localhost:5000/
```

**Vous devriez voir :**
```json
{
  "success": true,
  "message": "API Plateforme de Livraison",
  "version": "1.0.0"
}
```

---

### Solution 5 : Tester la Connexion Manuellement

**Ouvrez la console du navigateur (F12)** et exécutez :

```javascript
// Test connexion API
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'commercant@test.com',
    password: '123456'
  })
})
.then(res => res.json())
.then(data => console.log('✅ Réponse:', data))
.catch(err => console.error('❌ Erreur:', err));
```

**Si ça fonctionne**, le problème vient du code JavaScript du dashboard.

---

## 🎯 PROCHAINES ÉTAPES

1. **Ouvrir la console du navigateur** (F12)
2. **Copier-coller les erreurs** que vous voyez
3. Me les envoyer pour que je puisse corriger

**Ou alors :**

Essayez de vous connecter via **login.html** :
```
http://localhost:8080/login.html
Email: commercant@test.com
Password: 123456
```

Cette page devrait fonctionner et vous rediriger automatiquement.

---

## 📞 BESOIN D'AIDE ?

**Envoyez-moi :**
1. Une capture d'écran de la console (F12)
2. Les erreurs en rouge que vous voyez
3. L'URL exacte que vous utilisez

Je pourrai alors corriger le problème précisément !

---

**Compte de test commerçant :**
```
📧 Email    : commercant@test.com
🔒 Password : 123456
```
