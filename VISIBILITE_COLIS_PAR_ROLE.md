# 📋 VISIBILITÉ DES COLIS PAR RÔLE

## ✅ RÉPONSE COURTE
**OUI, vous avez raison !** Les colis créés par un agent sont visibles par :
1. ✅ L'agent qui les a créés
2. ✅ Son agence (bureau source)
3. ✅ L'admin (voit tout)

---

## 📊 DÉTAILS COMPLETS

### 🔵 AGENT crée un colis

**Fichier:** `backend/controllers/colisController.js` (lignes 60-62)

```javascript
if (req.user.role === 'agent' && req.user.agence) {
  agenceId = req.user.agence; // Les agents créent des colis pour leur propre agence
  bureauSourceId = req.user.agence; // Le bureau source est leur agence
}
```

**Enregistrement dans MongoDB:**
```javascript
{
  tracking: "TRK12345678901",
  expediteur: {
    id: "ID_AGENT",          // ✅ ID de l'agent
    nom: "Nom Agent"
  },
  agence: "ID_AGENCE_AGENT",  // ✅ Agence de l'agent
  bureauSource: "ID_AGENCE_AGENT", // ✅ Bureau source = agence de l'agent
  createdBy: "agent",         // ✅ Rôle du créateur
  destinataire: { ... },
  montant: 5000,
  fraisLivraison: 500
}
```

---

## 👁️ QUI VOIT QUOI ?

### 1️⃣ **AGENT** (le créateur)
**Fichier:** `backend/controllers/colisController.js` (lignes 162-168)

```javascript
else if (req.user.role === 'agent' || req.user.role === 'agence') {
  query.$or = [
    { createdBy: req.user._id },        // ✅ Colis créés par l'agent
    { bureauSource: req.user.agence }   // ✅ Colis où son agence = bureau source
  ];
}
```

**L'agent voit:**
- ✅ Tous les colis qu'il a créés lui-même (`createdBy = son ID`)
- ✅ Tous les colis où son agence est le bureau source
- ✅ Les colis créés par l'admin pour son agence

**Exemple:**
```
Agent "Ahmed" (agence: "AGC123") voit:
- Colis créé par Ahmed → createdBy: "ID_AHMED" ✅
- Colis créé par Admin pour AGC123 → bureauSource: "AGC123" ✅
- Colis créé par un autre agent de AGC123 ✅
```

---

### 2️⃣ **AGENCE** (même logique que l'agent)
**Même filtre que l'agent:**
```javascript
query.$or = [
  { bureauSource: req.user.agence }  // Tous les colis de l'agence
];
```

**L'agence voit:**
- ✅ Tous les colis créés par SES agents
- ✅ Tous les colis où elle est le bureau source

---

### 3️⃣ **ADMIN** (voit tout)
**Fichier:** `backend/controllers/colisController.js` (ligne 174)

```javascript
// ✅ Les admins voient TOUS les colis (pas de filtre)
```

**L'admin voit:**
- ✅ **TOUS les colis** de toutes les agences
- ✅ Tous les colis créés par tous les agents
- ✅ Tous les colis créés par tous les commercants
- ✅ Tous les colis créés par lui-même

---

### 4️⃣ **COMMERCANT** (voit uniquement les siens)
**Fichier:** `backend/controllers/colisController.js` (lignes 159-161)

```javascript
if (req.user.role === 'commercant') {
  query['expediteur.id'] = req.user._id;  // UNIQUEMENT ses propres colis
}
```

**Le commercant voit:**
- ✅ UNIQUEMENT ses propres colis (`expediteur.id = son ID`)
- ❌ Ne voit PAS les colis des autres commercants
- ❌ Ne voit PAS les colis des agents

---

## 💰 MISE À JOUR DE LA CAISSE

**Fichier:** `backend/controllers/colisController.js` (lignes 98-130)

Quand un **agent** crée un colis, sa caisse est automatiquement mise à jour :

```javascript
if (req.user.role === 'agent') {
  let caisse = await Caisse.findOne({ user: req.user._id });
  
  // Ajouter les montants collectés
  caisse.fraisLivraisonCollectes += fraisLivraison;
  caisse.fraisRetourCollectes += fraisRetour;
  caisse.montantColisCollectes += montantColis;
  
  // Mettre à jour le solde
  const totalCollecte = fraisLivraison + fraisRetour + montantColis;
  caisse.totalCollecte += totalCollecte;
  caisse.soldeActuel += totalCollecte;
  
  await caisse.save();
}
```

---

## 📝 RÉSUMÉ VISUEL

```
┌─────────────────────────────────────────────────────────┐
│  QUI VOIT LES COLIS CRÉÉS PAR UN AGENT ?               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  AGENT crée colis                                      │
│       ↓                                                │
│  ┌──────────────────┐                                 │
│  │  Colis enregistré │                                 │
│  │  dans MongoDB     │                                 │
│  └────────┬─────────┘                                 │
│           │                                            │
│           ├─→ expediteur.id = ID_AGENT                │
│           ├─→ agence = AGENCE_AGENT                   │
│           ├─→ bureauSource = AGENCE_AGENT             │
│           └─→ createdBy = "agent"                     │
│                                                         │
│  VISIBILITÉ:                                           │
│  ✅ Agent créateur (lui-même)                          │
│  ✅ Son agence (AGC123)                                │
│  ✅ Autres agents de AGC123                            │
│  ✅ Admin (voit tout)                                  │
│  ❌ Autres agences                                     │
│  ❌ Commercants                                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔍 EXEMPLE CONCRET

### Scénario:
- **Agent Ahmed** (Agence: "Alger Centre" - ID: AGC001)
- **Agent Karim** (Agence: "Oran Est" - ID: AGC002)
- **Admin** (Voit tout)

### Agent Ahmed crée 3 colis:
```javascript
Colis 1: TRK11111111111
- expediteur.id: "ID_AHMED"
- agence: "AGC001"
- bureauSource: "AGC001"
- createdBy: "agent"

Colis 2: TRK22222222222
- expediteur.id: "ID_AHMED"
- agence: "AGC001"
- bureauSource: "AGC001"
- createdBy: "agent"

Colis 3: TRK33333333333
- expediteur.id: "ID_AHMED"
- agence: "AGC001"
- bureauSource: "AGC001"
- createdBy: "agent"
```

### Qui voit quoi ?

| Utilisateur | Colis 1 | Colis 2 | Colis 3 | Raison |
|------------|---------|---------|---------|--------|
| **Agent Ahmed** | ✅ | ✅ | ✅ | Créateur + agence AGC001 |
| **Agence Alger Centre** | ✅ | ✅ | ✅ | bureauSource = AGC001 |
| **Agent Karim (Oran)** | ❌ | ❌ | ❌ | Autre agence (AGC002) |
| **Admin** | ✅ | ✅ | ✅ | Voit tout |
| **Commercant** | ❌ | ❌ | ❌ | expediteur.id différent |

---

## ✅ CONCLUSION

**Votre compréhension est EXACTE :**

1. ✅ **Agent crée colis** → Enregistré avec son ID et son agence
2. ✅ **Agent voit ses colis** → Filtre `createdBy = son ID`
3. ✅ **Agence voit ses colis** → Filtre `bureauSource = son agence`
4. ✅ **Admin voit tout** → Aucun filtre

**Système complètement fonctionnel et sécurisé !** 🎉

---

## 📌 FICHIERS CONCERNÉS

### Backend:
- `backend/models/Colis.js` - Schéma avec `agence`, `bureauSource`, `createdBy`
- `backend/controllers/colisController.js` - Logique de création et filtrage
- `backend/models/Caisse.js` - Mise à jour caisse agent

### Frontend Agent:
- `dashboards/agent/data-store.js` - Fonction `addColis()` (ligne 238)
- `dashboards/agent/js/colis-form.js` - Formulaire création

### Frontend Admin:
- `dashboards/admin/js/colis-manager.js` - Voit tous les colis

---

**Date:** 19 octobre 2025
**Système:** 100% API MongoDB
**Sécurité:** Filtrage par rôle au niveau backend ✅
