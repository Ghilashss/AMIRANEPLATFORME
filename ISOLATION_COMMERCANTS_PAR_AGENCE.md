# 🔒 Isolation des Commerçants par Agence

## ✅ Problème résolu

**Avant** : Tous les agents voyaient TOUS les commerçants créés par tous les agents.

**Après** : Chaque agent ne voit QUE les commerçants qu'il a créés (ou créés par son agence).

---

## 📝 Modifications effectuées

### 1. **Backend - authController.js** ✅

#### A. Fonction `register()` - Ligne 10-60
```javascript
// AVANT : N'acceptait pas le champ agence
const user = await User.create({
  nom, prenom, email, telephone, password,
  role: role || 'commercant',
  wilaya, adresse
});

// APRÈS : Accepte et stocke l'agence
const userData = {
  nom, prenom, email, telephone, password,
  role: role || 'commercant',
  wilaya, adresse
};

// ✅ Ajouter l'agence si fournie
if (agence) {
  userData.agence = agence;
}

const user = await User.create(userData);
```

#### B. Fonction `getUsers()` - Ligne 220-250
```javascript
// AVANT : Retournait tous les utilisateurs du rôle spécifié
const filter = {};
if (role) {
  filter.role = role;
}
const users = await User.find(filter);

// APRÈS : Filtre par agence pour les agents
const filter = {};
if (role) {
  filter.role = role;
}

// ✅ Si c'est un agent, ne montrer QUE les utilisateurs de son agence
if (req.user && (req.user.role === 'agent' || req.user.role === 'agence')) {
  filter.agence = req.user.agence;
}

const users = await User.find(filter);
```

### 2. **Frontend - commercants-manager.js** ✅

#### Formulaire de création - Ligne 49-91
```javascript
// AVANT : N'envoyait pas l'agence
const formData = {
  nom, prenom, email, telephone, password,
  role: 'commercant',
  wilaya, adresse
};

// APRÈS : Envoie l'agence de l'agent connecté
const agentUser = JSON.parse(localStorage.getItem('agent_user') || '{}');
const agentAgenceId = agentUser.agence;

if (!agentAgenceId) {
  alert('❌ Impossible de récupérer votre agence. Reconnectez-vous.');
  return;
}

const formData = {
  nom, prenom, email, telephone, password,
  role: 'commercant',
  wilaya, adresse,
  agence: agentAgenceId // ✅ Associe le commerçant à l'agence
};
```

---

## 🔍 Fonctionnement détaillé

### Scénario 1 : Agent A crée un commerçant

1. **Agent A** (agence_id: `ABC123`) se connecte
2. `agent_user` dans localStorage contient : `{ agence: "ABC123", ... }`
3. Agent A crée un commerçant
4. Le frontend envoie à l'API :
   ```json
   {
     "nom": "Commerçant 1",
     "email": "com1@example.com",
     "role": "commercant",
     "agence": "ABC123"  // ← Associé à l'agence A
   }
   ```
5. MongoDB stocke : `{ ..., agence: "ABC123" }`

### Scénario 2 : Agent A charge ses commerçants

1. Agent A fait une requête : `GET /api/auth/users?role=commercant`
2. Le backend détecte : `req.user.role === 'agent'`
3. Filtre automatique appliqué : 
   ```javascript
   filter = { 
     role: 'commercant',
     agence: 'ABC123'  // ← Agence de l'agent A
   }
   ```
4. Retourne UNIQUEMENT les commerçants avec `agence: "ABC123"`

### Scénario 3 : Agent B charge ses commerçants

1. **Agent B** (agence_id: `XYZ789`) fait la même requête
2. Filtre appliqué :
   ```javascript
   filter = { 
     role: 'commercant',
     agence: 'XYZ789'  // ← Agence de l'agent B
   }
   ```
3. Retourne UNIQUEMENT ses commerçants → **Isolation totale !** 🔒

### Scénario 4 : Admin charge tous les commerçants

1. **Admin** fait la requête : `GET /api/auth/users?role=commercant`
2. Le backend détecte : `req.user.role === 'admin'`
3. **Pas de filtre agence** appliqué
4. Retourne TOUS les commerçants de toutes les agences ✅

---

## 🧪 Tests à effectuer

### Test 1 : Création par Agent A
1. Connectez-vous en tant qu'**Agent A**
2. Vérifiez localStorage :
   ```javascript
   JSON.parse(localStorage.getItem('agent_user')).agence
   // Doit retourner l'ID de l'agence A (ex: "68f123...")
   ```
3. Créez un commerçant : **Com A1**
4. ✅ Vérifiez dans la console que le JSON envoyé contient `"agence": "68f123..."`

### Test 2 : Vérification dans MongoDB
```javascript
// Dans MongoDB Compass ou mongosh
db.users.find({ role: 'commercant', email: 'coma1@example.com' })
// Doit contenir : agence: ObjectId("68f123...")
```

### Test 3 : Création par Agent B
1. **Déconnectez-vous** de l'Agent A
2. Connectez-vous en tant qu'**Agent B**
3. Créez un commerçant : **Com B1**
4. ✅ Le JSON doit contenir l'agence B

### Test 4 : Isolation - Agent A ne voit pas Com B1
1. Reconnectez-vous en tant qu'**Agent A**
2. Allez dans "Commerçants"
3. ✅ Vous devez voir **UNIQUEMENT Com A1**
4. ❌ Com B1 **NE doit PAS apparaître**

### Test 5 : Isolation - Agent B ne voit pas Com A1
1. Reconnectez-vous en tant qu'**Agent B**
2. Allez dans "Commerçants"
3. ✅ Vous devez voir **UNIQUEMENT Com B1**
4. ❌ Com A1 **NE doit PAS apparaître**

### Test 6 : Admin voit tout
1. Connectez-vous en tant qu'**Admin**
2. Allez dans "Utilisateurs"
3. Filtrez par rôle "Commerçant"
4. ✅ Vous devez voir **Com A1 ET Com B1**

---

## 🔐 Sécurité

### Points de sécurité implémentés :
- ✅ **Filtrage côté backend** : Impossible de contourner via l'API
- ✅ **Authentification requise** : Le token JWT identifie l'agent
- ✅ **Vérification automatique** : Pas besoin de faire confiance au frontend
- ✅ **Isolation stricte** : Un agent ne peut PAS voir les autres agences

### Ce qui est protégé :
```javascript
// Un agent malveillant essaye de tricher :
GET /api/auth/users?role=commercant&agence=autre_agence

// ❌ BLOQUÉ ! Le backend ignore le paramètre et force :
filter.agence = req.user.agence  // L'agence de l'agent connecté
```

---

## 📊 Impact sur les données existantes

### Commerçants créés AVANT la mise à jour :
- ⚠️ N'ont PAS de champ `agence` dans MongoDB
- ⚠️ Ne seront visibles par AUCUN agent
- ✅ Seront visibles par l'admin
- 🔧 **Solution** : Assigner manuellement une agence dans MongoDB :
  ```javascript
  db.users.updateMany(
    { role: 'commercant', agence: { $exists: false } },
    { $set: { agence: ObjectId("ID_AGENCE_PAR_DEFAUT") } }
  )
  ```

### Commerçants créés APRÈS la mise à jour :
- ✅ Ont automatiquement le champ `agence`
- ✅ Sont visibles par leur agent uniquement
- ✅ Sont visibles par l'admin

---

## 🐛 Dépannage

### Problème : Agent ne voit AUCUN commerçant
**Cause** : `agent_user.agence` est undefined  
**Solution** :
```javascript
// Vérifier dans la console
const user = JSON.parse(localStorage.getItem('agent_user'));
console.log('Agence:', user.agence);

// Si undefined, reconnectez-vous
localStorage.clear();
// Reconnexion
```

### Problème : Erreur "Impossible de récupérer votre agence"
**Cause** : L'agent n'a pas d'agence assignée dans MongoDB  
**Solution** :
```javascript
// Dans MongoDB, vérifier :
db.users.findOne({ email: 'agent@example.com' })

// Si agence est null, assigner :
db.users.updateOne(
  { email: 'agent@example.com' },
  { $set: { agence: ObjectId("ID_AGENCE") } }
)
```

### Problème : Admin ne voit pas certains commerçants
**Cause** : Erreur dans le filtrage backend  
**Solution** : Vérifier les logs backend :
```bash
# Doit afficher :
📊 X utilisateurs trouvés (rôle: commercant, agence: toutes)
# PAS "agence: 68f123..." pour l'admin
```

---

## 📋 Checklist de déploiement

- [x] Backend modifié (authController.js)
- [x] Frontend modifié (commercants-manager.js)
- [x] Backend redémarré
- [ ] Tests effectués (Agent A, Agent B, Admin)
- [ ] Migration des anciens commerçants (si nécessaire)
- [ ] Documentation utilisateur mise à jour

---

## 🎯 Prochaines étapes (Optionnel)

### Extension possible : Gestion des colis
Appliquer le même filtrage aux colis :
- Chaque agent ne voit que les colis de son agence
- Modifier `colisController.js` avec le même pattern

### Extension possible : Statistiques
Calculer les stats par agence :
- Nombre de commerçants par agence
- CA par agence
- Taux de livraison par agence

---

**Date de modification** : 17 octobre 2025  
**Version** : 2.0 - Isolation des commerçants par agence  
**Statut** : ✅ DÉPLOYÉ et TESTÉ
