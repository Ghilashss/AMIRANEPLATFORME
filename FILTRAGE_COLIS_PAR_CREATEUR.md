# 📋 FILTRAGE DES COLIS PAR CRÉATEUR

## 🎯 Objectif
Mettre en place un système de filtrage des colis selon qui les a créés :
- **Colis créés par ADMIN** → Visibles UNIQUEMENT dans le dashboard ADMIN
- **Colis créés par AGENT** → Visibles dans les dashboards ADMIN ET AGENT

## ✅ Modifications Effectuées

### 1️⃣ Backend - Modèle Colis (`backend/models/Colis.js`)
**Ajout du champ `createdBy`** :
```javascript
// Rôle du créateur du colis (admin, agent, commercant, etc.)
createdBy: {
  type: String,
  enum: ['admin', 'agent', 'agence', 'commercant'],
  default: 'commercant'
}
```

### 2️⃣ Backend - Controller (`backend/controllers/colisController.js`)

#### Création de colis - Enregistrement du créateur :
```javascript
const colis = await Colis.create({
  ...req.body,
  expediteur: { ... },
  createdBy: req.user.role, // ✅ Enregistre le rôle du créateur
  fraisLivraison,
  historique: [...]
});
```

#### Récupération des colis - Filtrage :
```javascript
if (req.user.role === 'agent' || req.user.role === 'agence') {
  // Les agents voient UNIQUEMENT les colis créés par des agents
  query.createdBy = 'agent';
  query.agence = req.user.agence;
}
// Les admins voient TOUS les colis (pas de filtre createdBy)
```

### 3️⃣ Frontend - Admin Dashboard (`dashboards/admin/js/data-store.js`)

#### Création de colis :
```javascript
addColis(colisData) {
  const newColis = {
    id: Date.now().toString(),
    reference: reference,
    trackingNumber: reference,
    ...colisData,
    createdBy: 'admin', // ✅ Marque comme créé par admin
    adresse: colisData.adresse || colisData.bureauDest || '-',
    createdAt: new Date().toISOString()
  };
  // ...
}
```

#### Affichage des colis :
```javascript
updateColisTable() {
  // ...
  // ADMIN voit TOUS les colis (pas de filtrage par createdBy)
  console.log(`Admin voit TOUS les ${this.colis.length} colis`);
  // ...
}
```

### 4️⃣ Frontend - Agent Dashboard (`dashboards/agent/data-store.js`)

#### Création de colis :
```javascript
addColis(colisData) {
  const newColis = {
    id: Date.now().toString(),
    reference: reference,
    trackingNumber: reference,
    ...colisData,
    createdBy: 'agent', // ✅ Marque comme créé par agent
    adresse: colisData.adresse || colisData.bureauDest || '-',
    createdAt: new Date().toISOString()
  };
  // ...
}
```

#### Affichage des colis :
```javascript
updateColisTable() {
  // ...
  // FILTRER pour afficher UNIQUEMENT les colis créés par des agents
  const colisFiltres = this.colis.filter(c => c.createdBy === 'agent');
  console.log(`Agent voit ${colisFiltres.length} colis sur ${this.colis.length} total`);
  
  if (!colisFiltres || colisFiltres.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="13">Aucun colis créé par les agents</td></tr>';
    return;
  }
  
  tableBody.innerHTML = colisFiltres.map(colis => {
    // ...
  }).join('');
}
```

## 🔄 Comportement du Système

### Scénarios :

1. **Admin crée un colis** :
   - ✅ Le colis est marqué avec `createdBy: 'admin'`
   - ✅ Visible dans le dashboard ADMIN
   - ❌ NON visible dans le dashboard AGENT

2. **Agent crée un colis** :
   - ✅ Le colis est marqué avec `createdBy: 'agent'`
   - ✅ Visible dans le dashboard ADMIN
   - ✅ Visible dans le dashboard AGENT

3. **Commerçant crée un colis** (via API) :
   - ✅ Le colis est marqué avec `createdBy: 'commercant'`
   - ✅ Visible dans le dashboard ADMIN
   - ❌ NON visible dans le dashboard AGENT

## 📊 Tableau Récapitulatif

| Créateur | createdBy | Visible Admin | Visible Agent |
|----------|-----------|---------------|---------------|
| Admin | `'admin'` | ✅ OUI | ❌ NON |
| Agent | `'agent'` | ✅ OUI | ✅ OUI |
| Commercant | `'commercant'` | ✅ OUI | ❌ NON |

## 🧪 Tests à Effectuer

1. **Créer un colis depuis Admin** :
   - Vérifier qu'il apparaît dans Admin
   - Vérifier qu'il N'apparaît PAS dans Agent

2. **Créer un colis depuis Agent** :
   - Vérifier qu'il apparaît dans Agent
   - Vérifier qu'il apparaît dans Admin

3. **Vérifier les logs console** :
   - Admin doit afficher : `"Admin voit TOUS les X colis"`
   - Agent doit afficher : `"Agent voit Y colis sur X total (filtre: createdBy='agent')"`

## 🔧 Maintenance

### Migrer les colis existants :
Si vous avez des colis existants sans le champ `createdBy`, vous pouvez exécuter ce script dans la console MongoDB :

```javascript
// Marquer tous les colis existants comme créés par 'admin' par défaut
db.colis.updateMany(
  { createdBy: { $exists: false } },
  { $set: { createdBy: 'admin' } }
);
```

Ou depuis la console du navigateur (localStorage) :
```javascript
const colis = JSON.parse(localStorage.getItem('colis') || '[]');
colis.forEach(c => {
  if (!c.createdBy) c.createdBy = 'admin'; // ou 'agent' selon le contexte
});
localStorage.setItem('colis', JSON.stringify(colis));
location.reload();
```

## 📝 Notes Importantes

- Le filtrage se fait **uniquement à l'affichage** dans l'interface Agent
- Les colis restent accessibles dans le localStorage pour les actions (view, edit, delete, print)
- Cette implémentation est cohérente avec le système backend qui filtre aussi par `createdBy`
- Pour le mode backend + MongoDB, le filtrage est géré dans `getColis()` du controller

## ✅ Statut
**IMPLÉMENTATION COMPLÈTE** ✨
- ✅ Modèle backend mis à jour
- ✅ Controller backend mis à jour avec filtrage
- ✅ Frontend Admin configuré
- ✅ Frontend Agent configuré avec filtrage
- ✅ Documentation créée
