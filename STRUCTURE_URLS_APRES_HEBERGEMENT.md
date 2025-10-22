# 🌐 STRUCTURE DES URLS - APRÈS HÉBERGEMENT

## ✅ RÉPONSE COURTE

**OUI !** Après l'hébergement, tu auras **4 sites séparés** (ou plutôt 4 interfaces) accessibles via des URLs différentes, chacune pour un rôle spécifique.

---

## 📍 URLS COMPLÈTES (Exemple avec ton-domaine.com)

### 🔐 **1. ESPACE ADMINISTRATEUR**

**URL de connexion :**
```
https://ton-domaine.com/dashboards/admin/admin-dashboard.html
```

**Qui peut accéder ?**
- ✅ Administrateurs (role: admin)
- ❌ Agents, Agences, Commerçants

**Qu'est-ce qu'on peut faire ?**
- Créer/modifier/supprimer des utilisateurs
- Gérer les agences
- Configurer les wilayas et frais de livraison
- Voir TOUS les colis de toutes les agences
- Statistiques globales de la plateforme
- Gestion de la caisse admin
- Créer des rapports

**Login :**
- Email : admin@plateforme.com
- Mot de passe : (défini lors de la création)

---

### 👤 **2. ESPACE AGENT**

**URL de connexion :**
```
https://ton-domaine.com/dashboards/agent/agent-dashboard.html
```

**Qui peut accéder ?**
- ✅ Agents (role: agent)
- ❌ Admin, Agences, Commerçants

**Qu'est-ce qu'on peut faire ?**
- Ajouter des colis
- Scanner des colis (avec caméra ou lecteur)
- Gérer les livraisons
- Marquer les colis comme "en livraison" ou "livré"
- Gérer les retours
- Créer et gérer des commerçants
- Effectuer des paiements aux commerçants
- Voir la caisse agent
- Voir les colis de son agence

**Login :**
- Email : agent@agence.com
- Mot de passe : (défini lors de la création)

---

### 🏢 **3. ESPACE AGENCE (Responsable)**

**URL de connexion :**
```
https://ton-domaine.com/dashboards/agence/agence-dashboard.html
```

**Qui peut accéder ?**
- ✅ Responsables d'agence (role: agence)
- ❌ Admin, Agents, Commerçants

**Qu'est-ce qu'on peut faire ?**
- Voir les colis de SON agence uniquement
- Modifier certains colis
- Voir les statistiques de son agence

**Login :**
- Email : responsable@agence.com
- Mot de passe : (défini lors de la création)

---

### 🛍️ **4. ESPACE COMMERÇANT**

**URL de connexion (PAGE DE LOGIN) :**
```
https://ton-domaine.com/dashboards/commercant/commercant-login.html
```

**URL du dashboard (après connexion) :**
```
https://ton-domaine.com/dashboards/commercant/commercant-dashboard.html
```

**Qui peut accéder ?**
- ✅ Commerçants enregistrés (role: commercant)
- ❌ Admin, Agents, Agences

**Qu'est-ce qu'on peut faire ?**
- Voir UNIQUEMENT ses propres colis
- Ajouter de nouveaux colis
- Suivre l'état de ses livraisons
- Voir l'historique des paiements reçus
- Voir ses statistiques personnelles
- Générer des bordereaux

**Login :**
- Email : commercant@shop.com
- Mot de passe : (défini par l'agent lors de la création)

**Particularité :**
- Le commerçant a une **page de login dédiée** avec un design vert
- Après connexion, il est redirigé vers son dashboard
- Il ne peut JAMAIS voir les colis des autres commerçants

---

## 🔒 SÉCURITÉ - COMMENT ÇA MARCHE ?

### Contrôle d'accès

Chaque page vérifie automatiquement :

```javascript
// Exemple dans admin-dashboard.html
if (user.role !== 'admin') {
  // Redirection vers login
  window.location.href = '/login.html';
}
```

**Ce qui se passe :**
1. L'utilisateur visite une URL
2. Le système vérifie son token JWT
3. Si pas connecté → Redirigé vers login
4. Si connecté mais mauvais rôle → Accès refusé
5. Si connecté avec bon rôle → Accès autorisé

### Backend API

Le backend vérifie aussi chaque requête :

```javascript
// backend/middleware/authorize.js
function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès interdit' });
    }
    next();
  };
}
```

**Double sécurité :**
- Frontend : Affiche/cache les pages
- Backend : Autorise/refuse les données

---

## 📱 EXEMPLE CONCRET D'UTILISATION

### Scénario 1 : Un commerçant veut se connecter

```
1. Il va sur : https://ton-domaine.com/dashboards/commercant/commercant-login.html
2. Il entre son email et mot de passe
3. Le système vérifie ses credentials
4. Si OK → Redirigé vers commercant-dashboard.html
5. Il voit UNIQUEMENT ses colis
```

### Scénario 2 : Un agent veut livrer un colis

```
1. Il va sur : https://ton-domaine.com/dashboards/agent/agent-dashboard.html
2. Il se connecte avec son compte agent
3. Il va dans la section "Livraisons"
4. Il scanne le code-barres du colis
5. Le colis passe en statut "en_livraison"
6. Il livre physiquement le colis
7. Il clique sur le bouton vert "Livrer"
8. Le colis passe en statut "livre"
9. Le commerçant voit la mise à jour en temps réel
```

### Scénario 3 : Un admin veut voir toutes les statistiques

```
1. Il va sur : https://ton-domaine.com/dashboards/admin/admin-dashboard.html
2. Il se connecte avec son compte admin
3. Il voit :
   - Nombre total de colis
   - Nombre par statut
   - Nombre d'utilisateurs
   - Statistiques par agence
   - Revenus totaux
4. Il peut créer de nouveaux agents
5. Il peut modifier les frais de livraison
```

---

## 🌍 STRUCTURE COMPLÈTE APRÈS HÉBERGEMENT

```
https://ton-domaine.com/
│
├── dashboards/
│   │
│   ├── admin/
│   │   ├── admin-dashboard.html       ← Admin se connecte ici
│   │   ├── logout-admin.html
│   │   └── js/
│   │       ├── auth-service.js
│   │       ├── data-store.js
│   │       └── ... (tous les scripts admin)
│   │
│   ├── agent/
│   │   ├── agent-dashboard.html       ← Agent se connecte ici
│   │   └── js/
│   │       ├── livraisons-manager.js
│   │       ├── retours-manager.js
│   │       ├── commercants-manager.js
│   │       └── ... (tous les scripts agent)
│   │
│   ├── agence/
│   │   ├── agence-dashboard.html      ← Agence se connecte ici
│   │   └── js/
│   │
│   ├── commercant/
│   │   ├── commercant-login.html      ← Login commerçant (page verte)
│   │   ├── commercant-dashboard.html  ← Dashboard commerçant
│   │   └── js/
│   │
│   ├── shared/
│   │   └── js/                        ← Scripts partagés
│   │
│   └── config.js                      ← Configuration API (DEV/PROD)
│
└── backend/ (sur Railway.app ou VPS)
    ├── server.js
    ├── routes/
    ├── controllers/
    └── models/
```

---

## ❓ QUESTIONS FRÉQUENTES

### Q1 : Est-ce que je peux personnaliser les URLs ?

**Oui !** Tu peux créer des redirections plus simples :

```
https://ton-domaine.com/admin       → /dashboards/admin/admin-dashboard.html
https://ton-domaine.com/agent       → /dashboards/agent/agent-dashboard.html
https://ton-domaine.com/commercant  → /dashboards/commercant/commercant-login.html
```

Avec un fichier `.htaccess` sur Hostinger.

---

### Q2 : Est-ce qu'un commerçant peut accéder à l'espace agent ?

**NON !** Même s'il connait l'URL `https://ton-domaine.com/dashboards/agent/`, le système va :

1. Vérifier son token JWT
2. Voir qu'il a le rôle "commercant"
3. Lui refuser l'accès
4. Le rediriger vers la page de login

**Double protection :**
- Frontend : Vérifie le rôle avant d'afficher
- Backend : Refuse les requêtes API si mauvais rôle

---

### Q3 : Comment je donne les URLs aux utilisateurs ?

**Tu leur donnes des liens directs :**

**Pour les commerçants :**
```
Bonjour,

Voici votre accès à la plateforme :
🔗 https://ton-domaine.com/dashboards/commercant/commercant-login.html

Email : commercant@email.com
Mot de passe : [fourni par l'agent]

Cordialement,
```

**Pour les agents :**
```
Nouveau compte agent créé :
🔗 https://ton-domaine.com/dashboards/agent/agent-dashboard.html

Email : agent@agence.com
Mot de passe : [défini par admin]
```

---

### Q4 : Est-ce que je peux avoir un sous-domaine pour chaque rôle ?

**Oui, absolument !** Tu peux configurer :

```
https://admin.ton-domaine.com       → Admin
https://agent.ton-domaine.com       → Agent
https://shop.ton-domaine.com        → Commerçant
```

Mais ça nécessite de configurer les sous-domaines dans Hostinger.

---

### Q5 : Combien d'utilisateurs peuvent se connecter en même temps ?

**Illimité !**

- MongoDB Atlas gratuit : Jusqu'à 500 connexions simultanées
- Railway gratuit : Suffisant pour des centaines d'utilisateurs
- Hostinger Premium : Support de milliers de visiteurs

**En pratique :**
- 10-50 agents
- 100-500 commerçants
- Pas de problème de performance

---

## 🎨 PERSONNALISATION POSSIBLE

### Créer une page d'accueil principale

Tu peux créer `index.html` à la racine :

```html
<!DOCTYPE html>
<html>
<head>
  <title>Plateforme Colis - Accueil</title>
</head>
<body>
  <h1>Bienvenue sur la Plateforme</h1>
  
  <div class="login-options">
    <a href="/dashboards/admin/admin-dashboard.html">
      🔐 Espace Administrateur
    </a>
    
    <a href="/dashboards/agent/agent-dashboard.html">
      👤 Espace Agent
    </a>
    
    <a href="/dashboards/agence/agence-dashboard.html">
      🏢 Espace Agence
    </a>
    
    <a href="/dashboards/commercant/commercant-login.html">
      🛍️ Espace Commerçant
    </a>
  </div>
</body>
</html>
```

Accessible via : `https://ton-domaine.com/`

---

## ✅ CONCLUSION

**OUI, tu auras 4 espaces distincts :**

1. ✅ **Admin** : Contrôle total (`/dashboards/admin/`)
2. ✅ **Agent** : Gestion quotidienne (`/dashboards/agent/`)
3. ✅ **Agence** : Vue limitée (`/dashboards/agence/`)
4. ✅ **Commerçant** : Suivi personnel (`/dashboards/commercant/`)

**Chaque espace :**
- A sa propre URL
- A son propre login
- Affiche seulement les données autorisées
- Est sécurisé par JWT + vérification de rôle
- Fonctionne indépendamment

**Après l'hébergement, ça marche exactement comme en local, juste avec de vraies URLs au lieu de localhost !** 🚀

---

**D'autres questions sur la structure des URLs ou les accès ?** 💬
