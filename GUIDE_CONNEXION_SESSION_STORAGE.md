# 🔐 Guide de Connexion - Système Migré vers sessionStorage

## 🎯 Contexte

La plateforme a été **migrée de localStorage vers sessionStorage** pour plus de sécurité. Cela signifie que **vous devez vous reconnecter** pour que le nouveau système fonctionne.

---

## ✅ Procédure de Connexion

### Pour Admin

1. **Allez sur** : `http://localhost:9000/login.html?role=admin`
2. **Entrez vos identifiants** admin
3. **Cliquez sur "Se connecter"**
4. **Vous serez redirigé** vers `http://localhost:9000/dashboards/admin/admin-dashboard.html`

### Pour Agent

1. **Allez sur** : `http://localhost:9000/login.html?role=agent`
2. **Entrez vos identifiants** agent
3. **Cliquez sur "Se connecter"**
4. **Vous serez redirigé** vers `http://localhost:9000/dashboards/agent/agent-dashboard.html`

---

## 🔍 Vérification

### Ouvrir la Console (F12)

Après connexion, vous devriez voir dans la console :

```
✅ Connexion réussie via AuthService
👤 Rôle: admin
📧 Email: admin@example.com
✅ Token bien stocké dans sessionStorage.auth_token
🔑 Token: eyJhbGciOiJIUzI1NiIsInR5cCI...
🔄 Redirection vers le dashboard admin
```

### Vérifier le Token

Ouvrez **`debug-tokens.html`** :
- ✅ Vous devriez voir **sessionStorage.auth_token** avec une valeur
- ❌ Si vide, **reconnectez-vous**

---

## ⚠️ Problème : "Session expirée"

Si vous voyez ce message **immédiatement après connexion** :

### Cause 1 : Token non stocké
```
Solution: Ouvrez la console (F12) lors de la connexion
Vérifiez si vous voyez: "✅ Token bien stocké"
Si NON : Problème avec AuthService
```

### Cause 2 : Token dans le mauvais emplacement
```
Solution: Ouvrez debug-tokens.html
Vérifiez où est le token:
- ✅ sessionStorage.auth_token → BON
- ❌ localStorage.admin_token → ANCIEN SYSTÈME
```

### Cause 3 : Page en cache
```
Solution: Videz le cache du navigateur
Ctrl + Shift + Delete → Cocher "Images et fichiers en cache"
Puis reconnectez-vous
```

---

## 🛠️ Outils de Debug

### 1. **debug-tokens.html**
Affiche tous les tokens stockés dans sessionStorage et localStorage

```
http://localhost:9000/debug-tokens.html
```

**Actions disponibles** :
- 🔍 Vérifier les Tokens
- 📦 Tester DataStore
- 🌐 Tester API
- 🗑️ Tout Effacer

### 2. **test-token-admin.html**
Tests spécifiques pour le token admin

```
http://localhost:9000/test-token-admin.html
```

---

## 🔄 Migration Automatique

Le système inclut un **script de migration automatique** qui s'exécute au chargement des dashboards :

**Fichier** : `dashboards/migrate-tokens.js`

**Ce qu'il fait** :
- Lit l'ancien token dans localStorage
- Le copie dans sessionStorage
- Marque la migration comme effectuée

**Note** : Cette migration est temporaire et sera supprimée une fois que tous les utilisateurs auront migré.

---

## 📊 Différences localStorage vs sessionStorage

| Critère | localStorage | sessionStorage |
|---------|--------------|----------------|
| **Durée** | Permanent (jusqu'à suppression) | Session (fermeture du navigateur) |
| **Sécurité** | ⚠️ Moins sécurisé | ✅ Plus sécurisé |
| **Partage** | Entre tous les onglets | Unique par onglet |
| **Recommandé pour** | Préférences, cache | Tokens, sessions |

---

## 🚀 Tests de Connexion

### Test Admin

```bash
1. Ouvrir: http://localhost:9000/login.html?role=admin
2. Email: admin@example.com (ou votre email admin)
3. Mot de passe: votre mot de passe
4. Vérifier la console (F12)
5. Vérifier la redirection vers /dashboards/admin/admin-dashboard.html
```

### Test Agent

```bash
1. Ouvrir: http://localhost:9000/login.html?role=agent
2. Email: agent@agence.com (l'email créé lors de l'ajout d'agence)
3. Mot de passe: le mot de passe défini
4. Vérifier la console (F12)
5. Vérifier la redirection vers /dashboards/agent/agent-dashboard.html
```

---

## ❌ Erreurs Courantes

### 1. "Session expirée" immédiatement après connexion

**Cause** : Token non trouvé dans sessionStorage

**Solution** :
```bash
1. Ouvrir debug-tokens.html
2. Cliquer sur "🗑️ Tout Effacer"
3. Retourner sur login.html?role=admin
4. Se reconnecter
5. Ouvrir la console (F12) pour voir les logs
```

### 2. Redirection vers login en boucle

**Cause** : getAdminToken() ne trouve pas le token

**Solution** :
```bash
1. Vider le cache (Ctrl+Shift+Delete)
2. Fermer TOUS les onglets de la plateforme
3. Rouvrir un nouvel onglet
4. Aller sur login.html?role=admin
5. Se reconnecter
```

### 3. "Erreur de connexion"

**Cause** : Backend non démarré ou problème réseau

**Solution** :
```bash
1. Vérifier que le backend tourne sur le port 1000
2. Ouvrir: http://localhost:1000/api/auth/login (test API)
3. Si erreur: redémarrer le backend
   cd backend
   npm run dev
```

---

## 📝 Logs à Surveiller

### Connexion Réussie
```
✅ Connexion réussie via AuthService
👤 Rôle: admin
✅ Token bien stocké dans sessionStorage.auth_token
🔄 Redirection vers le dashboard admin
```

### Token Trouvé (dashboard)
```
🔍 getAdminToken() appelé - Recherche du token...
1️⃣ sessionStorage.auth_token: TROUVÉ (eyJhbGciOiJIUzI1NiIs...)
✅ Token trouvé et retourné
```

### Token NON Trouvé (problème)
```
🔍 getAdminToken() appelé - Recherche du token...
1️⃣ sessionStorage.auth_token: ❌ NON TROUVÉ
2️⃣ localStorage.admin_token: ❌ NON TROUVÉ
3️⃣ localStorage.token: ❌ NON TROUVÉ
❌ AUCUN TOKEN TROUVÉ NULLE PART !
```

---

## 🎯 Checklist de Résolution

- [ ] Vider le cache du navigateur
- [ ] Fermer tous les onglets de la plateforme
- [ ] Aller sur `http://localhost:9000/login.html?role=admin`
- [ ] Ouvrir la console (F12) **AVANT** de se connecter
- [ ] Entrer les identifiants et cliquer sur "Se connecter"
- [ ] Vérifier les logs dans la console
- [ ] Vérifier que `sessionStorage.auth_token` contient un token
- [ ] Si erreur, ouvrir `debug-tokens.html` pour diagnostiquer

---

## 📞 Support

Si le problème persiste après avoir suivi toutes ces étapes :

1. **Ouvrez** `debug-tokens.html`
2. **Copiez** le contenu affiché
3. **Ouvrez** la console (F12) sur le dashboard
4. **Copiez** tous les logs
5. **Fournissez** ces informations pour diagnostic

---

**Date de création** : 18 octobre 2025  
**Version** : 2.0 (Migration sessionStorage)
