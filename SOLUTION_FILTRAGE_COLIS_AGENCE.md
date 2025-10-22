# 🎯 SYSTÈME DE FILTRAGE DES COLIS PAR AGENCE

## ✅ Modifications Effectuées

### 1. Modèle Colis (backend/models/Colis.js)
**Ajouté le champ `bureauSource`** :
```javascript
bureauSource: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Agence'
}
```

### 2. Controller Colis (backend/controllers/colisController.js)

#### A. Création de colis (createColis)
**Logique ajoutée** :
- Si **agent** crée un colis → `bureauSource = agence de l'agent`
- Si **admin** crée un colis → `bureauSource = agence sélectionnée dans le formulaire`

#### B. Récupération des colis (getColis)
**Filtrage intelligent par rôle** :

```javascript
if (req.user.role === 'agent' || req.user.role === 'agence') {
  query.$or = [
    { createdBy: req.user._id },        // Colis créés par l'agent
    { bureauSource: req.user.agence }   // Colis où leur agence est le bureau source
  ];
}
```

## 📊 Comment ça Fonctionne

### Scénario 1 : Agent crée un colis
1. Agent se connecte → `sessionStorage.auth_token` stocké
2. Agent crée un colis → Backend enregistre :
   - `createdBy = ID de l'agent`
   - `bureauSource = agence de l'agent`
   - `agence = agence de l'agent`
3. Agent voit ce colis dans sa liste ✅

### Scénario 2 : Admin crée un colis et choisit une agence
1. Admin se connecte → `sessionStorage.auth_token` stocké
2. Admin sélectionne "Agence Alger" comme bureau source
3. Admin crée le colis → Backend enregistre :
   - `createdBy = 'admin'`
   - `bureauSource = ObjectId de "Agence Alger"`
   - `agence = ObjectId de "Agence Alger"`
4. **Agence Alger** voit ce colis dans sa liste ✅
5. **Admin** voit TOUS les colis ✅

### Scénario 3 : Commerçant crée un colis
1. Commerçant se connecte → `sessionStorage.auth_token` stocké
2. Commerçant crée un colis → Backend enregistre :
   - `createdBy = 'commercant'`
   - `expediteur.id = ID du commerçant`
   - `agence = agence choisie`
   - `bureauSource = null` (ou agence si spécifié)
3. Commerçant voit UNIQUEMENT ses propres colis ✅

## 🔐 Tokens Unifiés

**Tous les rôles utilisent le même système** :
- ✅ Token stocké dans : `sessionStorage.auth_token`
- ✅ Fallback pour compatibilité : `localStorage.admin_token` ou `localStorage.agent_token`
- ✅ Format JWT contenant : `{ id, role, agence, iat, exp }`

## 📝 Fichiers Modifiés

### Backend :
1. `backend/models/Colis.js` - Ajout du champ `bureauSource`
2. `backend/controllers/colisController.js` :
   - Ligne 60-77 : Logique bureau source dans `createColis`
   - Ligne 148-157 : Filtrage avec `$or` dans `getColis`

### Frontend :
1. **Admin** - Fichiers corrigés pour utiliser `sessionStorage.auth_token` :
   - `dashboards/admin/js/frais-livraison.js` (4 occurrences)
   - `dashboards/admin/js/colis-form.js` (2 occurrences)
   - `dashboards/admin/js/user-form.js` (1 occurrence)
   - `dashboards/admin/js/retours-manager.js` (4 occurrences)
   - `dashboards/admin/js/livraisons-manager.js` (4 occurrences)
   - `dashboards/admin/js/modal-manager.js` (1 occurrence)
   - `dashboards/shared/agence-store.js` (1 occurrence)

2. **Agent** - Fichiers corrigés pour utiliser `sessionStorage.auth_token` :
   - `dashboards/agent/js/colis-form.js` (4 occurrences)
   - `dashboards/agent/js/retours-manager.js` (6 occurrences)
   - `dashboards/agent/js/livraisons-manager.js` (5 occurrences)
   - `dashboards/agent/js/commercants-manager.js` (1 occurrence)
   - `dashboards/agent/js/caisse-agent.js` (3 occurrences)
   - `dashboards/agent/js/auth-manager.js` (1 occurrence)
   - `dashboards/agent/modal-manager.js` (1 occurrence)

**Total : 37 remplacements effectués**

## 🚀 Prochaines Étapes

1. ⚠️ **Redémarrer le backend** pour charger le nouveau modèle Colis
2. 🔄 **Se reconnecter** en tant qu'admin et agent
3. ✅ **Tester la création de colis** :
   - En tant qu'admin → choisir une agence comme bureau source
   - En tant qu'agent → vérifier que son agence est automatiquement le bureau source
4. 📊 **Vérifier l'affichage** :
   - Chaque agent voit ses colis + colis admin avec son agence comme bureau source
   - Admin voit tous les colis

## 🐛 Commandes de Debug

### Dans la console du navigateur :
```javascript
// Vérifier le token
sessionStorage.getItem('auth_token')

// Décoder le token (coller le token sur jwt.io)
```

### Dans MongoDB :
```javascript
// Vérifier les colis avec bureauSource
db.colis.find({ bureauSource: { $exists: true } })

// Compter les colis par agent
db.colis.aggregate([
  { $group: { _id: "$createdBy", count: { $sum: 1 } } }
])
```

## ✅ Résultat Final

Chaque agence a maintenant son **propre espace de travail** :
- Elle voit **ses propres colis** (créés par elle)
- Elle voit **les colis admin** qui lui sont assignés (bureau source)
- Elle ne voit **PAS** les colis des autres agences

L'admin conserve la **vue globale** de tous les colis.
