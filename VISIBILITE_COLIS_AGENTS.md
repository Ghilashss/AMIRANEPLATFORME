# 🔍 VISIBILITÉ DES COLIS ENTRE AGENTS

## ❓ Question

**"Quand je crée un colis dans un compte agent, va-t-il être affiché dans un autre compte agent ?"**

---

## ✅ RÉPONSE: OUI, SI LES AGENTS SONT DE LA MÊME AGENCE

---

## 📊 Comment Ça Fonctionne

### Règles de Filtrage Backend

**Fichier:** `backend/controllers/colisController.js` (ligne 83-86)

```javascript
if (req.user.role === 'agent' || req.user.role === 'agence') {
  // Les agents voient TOUS les colis de leur agence (commercants + agents)
  query.agence = req.user.agence;
}
```

### Ce Que Cela Signifie

✅ **Un agent voit:**
- Tous les colis créés par **lui-même**
- Tous les colis créés par **d'autres agents de la même agence**
- Tous les colis créés par **des commerçants** rattachés à son agence
- Tous les colis **destinés** à son agence

❌ **Un agent NE voit PAS:**
- Les colis d'autres agences
- Les colis qui n'ont aucun lien avec son agence

---

## 🏢 Exemples Concrets

### Exemple 1: Même Agence ✅

**Agence:** NK (AG2510-15-674) - Wilaya 15

**Agent 1:**
- Email: `nk@nk.com`
- Agence: `68f13175d0fffe31caf4fa98` (NK)

**Agent 2:**
- Email: `agent2@nk.com`
- Agence: `68f13175d0fffe31caf4fa98` (NK) ← **MÊME AGENCE**

**Scénario:**
1. Agent 1 crée un colis
2. Agent 2 **VOIT** ce colis ✅
3. Agent 1 **VOIT** aussi les colis de l'Agent 2 ✅

---

### Exemple 2: Agences Différentes ❌

**Agence A:** NK (AG2510-15-674) - Wilaya 15
**Agence B:** Autre Agence (AG2510-16-999) - Wilaya 16

**Agent 1:**
- Agence: NK (ID: `68f13175d0fffe31caf4fa98`)

**Agent 2:**
- Agence: Autre Agence (ID: `68f13175d0fffe31caf4fa99`) ← **AGENCE DIFFÉRENTE**

**Scénario:**
1. Agent 1 crée un colis
2. Agent 2 **NE VOIT PAS** ce colis ❌
3. Seuls les agents de l'Agence NK voient ce colis

---

## 🔐 Qui Voit Quoi ?

| Rôle | Colis Visibles |
|------|----------------|
| **Admin** | 🌍 TOUS les colis de toutes les agences |
| **Agent** | 🏢 TOUS les colis de son agence uniquement |
| **Commerçant** | 👤 UNIQUEMENT ses propres colis |

---

## 💡 Cas d'Usage

### Cas 1: Collaboration dans une Agence

**Situation:**
- Agence NK a 3 agents
- Agent 1 est absent
- Agent 2 doit traiter les colis de l'Agent 1

**Résultat:**
- ✅ Agent 2 voit tous les colis de l'Agent 1
- ✅ Agent 2 peut gérer les livraisons
- ✅ Collaboration fluide dans l'agence

---

### Cas 2: Sécurité entre Agences

**Situation:**
- Agence NK (Wilaya 15)
- Agence Alger (Wilaya 16)
- Chaque agence a des agents

**Résultat:**
- ✅ Les agents de NK voient UNIQUEMENT les colis de NK
- ✅ Les agents d'Alger voient UNIQUEMENT les colis d'Alger
- ✅ Isolation des données entre agences
- ✅ Sécurité et confidentialité préservées

---

## 🔧 Code Technique

### Backend - Filtre SQL (MongoDB)

```javascript
// Dans colisController.js

let query = {};

if (req.user.role === 'agent' || req.user.role === 'agence') {
  // Filtre: agence = agence de l'utilisateur connecté
  query.agence = req.user.agence; // ← Clé du filtrage
}

const colis = await Colis.find(query)
  .populate('agence', 'nom code')
  .sort({ createdAt: -1 });
```

**Requête MongoDB Générée:**
```javascript
// Pour Agent avec agence ID: 68f13175d0fffe31caf4fa98
db.colis.find({
  agence: ObjectId("68f13175d0fffe31caf4fa98")
})
```

---

### Frontend - Affichage

```javascript
// Dans data-store.js ligne 815-817

// Agent voit TOUS les colis de son agence (filtre fait par le backend)
const colisFiltres = this.colis;
console.log(`Agent voit ${colisFiltres.length} colis de son agence`);
```

Le frontend **ne fait PAS de filtre supplémentaire**, il affiche simplement ce que le backend a déjà filtré.

---

## 📝 Vérification Pratique

### Test 1: Créer un Colis avec Agent 1

**Étapes:**
1. Se connecter comme Agent 1 (nk@nk.com)
2. Créer un nouveau colis
3. Noter l'agence: `NK - AG2510-15-674`
4. Se déconnecter

**Résultat attendu:**
- ✅ Colis visible dans le dashboard de l'Agent 1

---

### Test 2: Vérifier avec Agent 2 (Même Agence)

**Étapes:**
1. Se connecter comme Agent 2 (même agence NK)
2. Aller dans la section "Mes Colis"
3. Chercher le colis créé par l'Agent 1

**Résultat attendu:**
- ✅ Le colis de l'Agent 1 est visible ✅
- ✅ Agent 2 peut voir tous les détails
- ✅ Agent 2 peut modifier le statut
- ✅ Agent 2 peut affecter un livreur

---

### Test 3: Vérifier avec Agent 3 (Autre Agence)

**Étapes:**
1. Se connecter comme Agent 3 (agence différente, ex: Wilaya 16)
2. Aller dans la section "Mes Colis"
3. Chercher le colis créé par l'Agent 1

**Résultat attendu:**
- ❌ Le colis de l'Agent 1 n'est PAS visible ❌
- ❌ Agent 3 ne voit que les colis de son agence (Wilaya 16)

---

## 🎯 Champ Clé dans le Modèle Colis

**Fichier:** `backend/models/Colis.js`

```javascript
const colisSchema = new mongoose.Schema({
  // ...
  agence: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agence',
    required: true  // ← CHAMP CLÉ pour le filtrage
  },
  // ...
});
```

**Lors de la création d'un colis par un agent:**

```javascript
// Dans colisController.js - createColis()
const colis = new Colis({
  // ...
  agence: req.user.agence, // ← L'agence de l'agent qui crée le colis
  // ...
});
```

---

## 🔍 Comment Vérifier l'Agence d'un Utilisateur

### Dans le Dashboard

**Console (F12):**
```javascript
// Récupérer l'utilisateur connecté
const user = JSON.parse(localStorage.getItem('user'));
console.log('Agence ID:', user.agence);
console.log('Nom:', user.nom);
console.log('Role:', user.role);
```

**Résultat:**
```javascript
{
  _id: "68f13175d0fffe31caf4fa9a",
  nom: "NK",
  email: "nk@nk.com",
  role: "agent",
  agence: "68f13175d0fffe31caf4fa98", // ← ID de l'agence
  ...
}
```

---

### Dans la Base de Données

**MongoDB Compass / MongoDB Shell:**

```javascript
// Voir l'agence d'un utilisateur
db.users.findOne({ email: "nk@nk.com" })

// Résultat:
{
  _id: ObjectId("68f13175d0fffe31caf4fa9a"),
  nom: "NK",
  agence: ObjectId("68f13175d0fffe31caf4fa98"), // ← Référence à l'agence
  ...
}

// Voir les détails de l'agence
db.agences.findOne({ _id: ObjectId("68f13175d0fffe31caf4fa98") })

// Résultat:
{
  _id: ObjectId("68f13175d0fffe31caf4fa98"),
  code: "AG2510-15-674",
  nom: "NK",
  wilaya: "15",
  ...
}
```

---

## 🛠️ Pour Créer un Deuxième Agent dans la Même Agence

### Via l'Interface Admin

1. Se connecter en tant qu'Admin
2. Aller dans "Utilisateurs"
3. Cliquer "Ajouter Utilisateur"
4. Remplir:
   - Nom: `Agent 2`
   - Email: `agent2@nk.com`
   - Password: `password123`
   - Rôle: `Agent`
   - **Agence: `NK` (AG2510-15-674)** ← IMPORTANT
5. Enregistrer

**Résultat:**
- ✅ Agent 2 créé
- ✅ Rattaché à l'agence NK
- ✅ Verra tous les colis de l'agence NK

---

### Via MongoDB Directement

```javascript
// Insérer un nouvel agent dans la même agence
db.users.insertOne({
  nom: "Agent 2",
  prenom: "Test",
  email: "agent2@nk.com",
  password: "$2a$10$...", // Hash bcrypt du password
  role: "agent",
  agence: ObjectId("68f13175d0fffe31caf4fa98"), // ← MÊME AGENCE que Agent 1
  telephone: "0600000002",
  status: "active",
  createdAt: new Date()
});
```

---

## ✅ Résumé Final

### Question Initiale
**"Quand je crée un colis dans un compte agent, va-t-il être affiché dans un autre compte agent ?"**

### Réponse
**OUI**, mais **UNIQUEMENT** si les deux agents appartiennent à la **MÊME AGENCE**.

### Règle Simple
```
Même Agence = Colis Visibles ✅
Agences Différentes = Colis NON Visibles ❌
```

### Avantages
- ✅ Collaboration entre agents d'une même agence
- ✅ Sécurité: isolation des données entre agences
- ✅ Flexibilité: un agent peut prendre le relais d'un autre
- ✅ Gestion centralisée par agence

### Architecture
```
┌─────────────────────────────────────────┐
│           PLATEFORME                    │
├─────────────────────────────────────────┤
│  Agence NK (Wilaya 15)                  │
│  ├─ Agent 1 (nk@nk.com)                 │
│  ├─ Agent 2 (agent2@nk.com)             │
│  └─ Colis communs: 5 colis visibles ✅  │
├─────────────────────────────────────────┤
│  Agence Alger (Wilaya 16)               │
│  ├─ Agent 3 (agent@alger.com)           │
│  └─ Colis propres: 3 colis visibles ✅  │
└─────────────────────────────────────────┘

Agent 1 voit: 5 colis de NK ✅
Agent 2 voit: 5 colis de NK ✅ (mêmes colis)
Agent 3 voit: 3 colis d'Alger ✅ (colis différents)
```

---

## 📚 Documentation Associée

- `backend/controllers/colisController.js` - Ligne 83-86 (Filtrage agents)
- `dashboards/agent/data-store.js` - Ligne 815-817 (Affichage)
- `backend/models/Colis.js` - Champ `agence` (Modèle)
- `backend/models/User.js` - Champ `agence` (Association utilisateur-agence)

---

**Votre système est bien conçu avec une isolation par agence ! 🎉**