# 📋 VISIBILITÉ RETOURS & LIVRAISONS - ANALYSE

## ⚠️ SITUATION ACTUELLE

### 🔴 PROBLÈME IDENTIFIÉ

**Les retours et livraisons n'ont PAS de filtrage par rôle !**

Actuellement, **TOUS les utilisateurs** (admin, agent, agence, commercant) voient **TOUS les retours et livraisons** de toutes les agences.

---

## 📊 ANALYSE DÉTAILLÉE

### 1️⃣ **RETOURS** (backend/controllers/retourController.js)

**Ligne 66-99:** `getAllRetours()`

```javascript
exports.getAllRetours = async (req, res) => {
    try {
        const { startDate, endDate, wilaya, motif } = req.query;
        
        let query = {};  // ❌ PAS de filtre par rôle !
        
        // Filtres disponibles:
        if (startDate || endDate) {
            query.dateRetour = { ... };
        }
        if (wilaya) {
            query.wilaya = wilaya;
        }
        if (motif) {
            query.motifRetour = motif;
        }

        const retours = await Retour.find(query)  // ❌ Retourne TOUS les retours
            .populate('colisId', 'reference prixColis')
            .populate('retournePar', 'nom prenom email')
            .sort({ dateRetour: -1 });

        res.status(200).json({
            success: true,
            data: retours  // ❌ Tous visibles par tous
        });
    }
}
```

**Conséquence:**
- ❌ Agent d'Alger voit les retours d'Oran
- ❌ Commercant voit les retours de tous les autres commercants
- ❌ Aucune isolation des données

---

### 2️⃣ **LIVRAISONS** (backend/controllers/livraisonController.js)

**Ligne 65-98:** `getAllLivraisons()`

```javascript
exports.getAllLivraisons = async (req, res) => {
    try {
        const { startDate, endDate, wilaya } = req.query;
        
        let query = {};  // ❌ PAS de filtre par rôle !
        
        // Filtres disponibles:
        if (startDate || endDate) {
            query.dateLivraison = { ... };
        }
        if (wilaya) {
            query.wilaya = wilaya;
        }

        const livraisons = await Livraison.find(query)  // ❌ Retourne TOUTES les livraisons
            .populate('colisId', 'reference prixColis')
            .populate('livrePar', 'nom prenom email')
            .sort({ dateLivraison: -1 });

        res.status(200).json({
            success: true,
            data: livraisons  // ❌ Toutes visibles par tous
        });
    }
}
```

**Conséquence:**
- ❌ Agent d'Alger voit les livraisons d'Oran
- ❌ Commercant voit les livraisons de tous les autres commercants
- ❌ Aucune isolation des données

---

## 🔍 VÉRIFICATION DES MODÈLES

### Modèle Retour (backend/models/Retour.js)

```javascript
const RetourSchema = new mongoose.Schema({
    colisId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Colis',
        required: true
    },
    reference: String,
    nomDestinataire: String,
    wilaya: String,
    dateRetour: Date,
    motifRetour: String,
    retournePar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    livreurNom: String,
    fraisRetour: Number
    // ❌ Pas de champ "agence" ou "bureauSource"
});
```

### Modèle Livraison (backend/models/Livraison.js)

```javascript
const LivraisonSchema = new mongoose.Schema({
    colisId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Colis',
        required: true
    },
    reference: String,
    nomDestinataire: String,
    wilaya: String,
    dateLivraison: Date,
    livrePar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    livreurNom: String
    // ❌ Pas de champ "agence" ou "bureauSource"
});
```

---

## ✅ SOLUTION RECOMMANDÉE

### Option 1: Filtrer via le Colis (RAPIDE) ✅

Utiliser la relation `colisId` pour filtrer par agence:

```javascript
// RETOURS
exports.getAllRetours = async (req, res) => {
    try {
        let query = {};
        
        // Filtrage par rôle
        if (req.user.role === 'agent' || req.user.role === 'agence') {
            // Récupérer les colis de l'agence
            const colisAgence = await Colis.find({
                $or: [
                    { agence: req.user.agence },
                    { bureauSource: req.user.agence }
                ]
            }).select('_id');
            
            const colisIds = colisAgence.map(c => c._id);
            query.colisId = { $in: colisIds };
        } else if (req.user.role === 'commercant') {
            // Récupérer les colis du commercant
            const colisCom = await Colis.find({
                'expediteur.id': req.user._id
            }).select('_id');
            
            const colisIds = colisCom.map(c => c._id);
            query.colisId = { $in: colisIds };
        }
        // Admin: pas de filtre (voit tout)
        
        const retours = await Retour.find(query)
            .populate('colisId', 'reference prixColis agence')
            .populate('retournePar', 'nom prenom email')
            .sort({ dateRetour: -1 });

        res.status(200).json({
            success: true,
            data: retours
        });
    } catch (error) {
        console.error('Erreur getAllRetours:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des retours',
            error: error.message
        });
    }
};
```

**Même logique pour les livraisons !**

---

### Option 2: Ajouter champ agence aux modèles (OPTIMAL) ⭐

**Modifier les modèles:**

```javascript
// backend/models/Retour.js
const RetourSchema = new mongoose.Schema({
    colisId: { ... },
    agence: {  // ✅ AJOUTER
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agence'
    },
    bureauSource: {  // ✅ AJOUTER
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agence'
    },
    // ... autres champs
});

// backend/models/Livraison.js
const LivraisonSchema = new mongoose.Schema({
    colisId: { ... },
    agence: {  // ✅ AJOUTER
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agence'
    },
    bureauSource: {  // ✅ AJOUTER
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agence'
    },
    // ... autres champs
});
```

**Lors de la création, copier l'agence du colis:**

```javascript
// Créer un retour
exports.createRetour = async (req, res) => {
    const colis = await Colis.findById(colisId);
    
    const retour = new Retour({
        colisId,
        agence: colis.agence,  // ✅ Copier du colis
        bureauSource: colis.bureauSource,  // ✅ Copier du colis
        // ... autres champs
    });
    
    await retour.save();
};
```

**Puis filtrer directement:**

```javascript
exports.getAllRetours = async (req, res) => {
    let query = {};
    
    if (req.user.role === 'agent' || req.user.role === 'agence') {
        query.$or = [
            { agence: req.user.agence },
            { bureauSource: req.user.agence }
        ];
    } else if (req.user.role === 'commercant') {
        // Filtrer via colisId...
    }
    
    const retours = await Retour.find(query);
};
```

---

## 📊 COMPARAISON DES OPTIONS

| Critère | Option 1 (Via Colis) | Option 2 (Champ agence) |
|---------|---------------------|------------------------|
| **Rapidité mise en place** | ⭐⭐⭐ Immédiate | ⭐⭐ Modification schéma |
| **Performance** | ⭐⭐ Double requête | ⭐⭐⭐ Requête directe |
| **Maintenabilité** | ⭐⭐ Complexe | ⭐⭐⭐ Simple |
| **Cohérence** | ⭐⭐ Dépend du colis | ⭐⭐⭐ Données propres |
| **Migration données** | ❌ Pas nécessaire | ⚠️ Script migration |

---

## 🎯 RECOMMANDATION

### **OPTION 1 pour l'instant** (rapide)
- ✅ Pas de modification de schéma
- ✅ Pas de migration de données
- ✅ Fonctionne immédiatement
- ⚠️ Moins performant (2 requêtes)

### **OPTION 2 à terme** (optimal)
- ⭐ Meilleure architecture
- ⭐ Meilleures performances
- ⭐ Plus maintenable
- ⚠️ Nécessite migration

---

## 🔧 CODE À IMPLÉMENTER (OPTION 1)

### 1. Modifier `backend/controllers/retourController.js`

```javascript
const Retour = require('../models/Retour');
const Colis = require('../models/Colis');  // ✅ Ajouter

exports.getAllRetours = async (req, res) => {
    try {
        const { startDate, endDate, wilaya, motif } = req.query;
        
        let query = {};
        
        // ✅ FILTRAGE PAR RÔLE
        if (req.user.role === 'commercant') {
            // Commercant voit uniquement ses retours
            const colisCom = await Colis.find({
                'expediteur.id': req.user._id
            }).select('_id');
            
            const colisIds = colisCom.map(c => c._id);
            query.colisId = { $in: colisIds };
            
            console.log(`🔍 Commercant: ${colisIds.length} colis trouvés`);
            
        } else if (req.user.role === 'agent' || req.user.role === 'agence') {
            // Agent voit retours de son agence
            const colisAgence = await Colis.find({
                $or: [
                    { agence: req.user.agence },
                    { bureauSource: req.user.agence }
                ]
            }).select('_id');
            
            const colisIds = colisAgence.map(c => c._id);
            query.colisId = { $in: colisIds };
            
            console.log(`🔍 Agent/Agence: ${colisIds.length} colis trouvés pour agence ${req.user.agence}`);
        }
        // Admin: pas de filtre (voit tout)
        
        // Filtrer par date
        if (startDate || endDate) {
            query.dateRetour = {};
            if (startDate) query.dateRetour.$gte = new Date(startDate);
            if (endDate) query.dateRetour.$lte = new Date(endDate);
        }
        
        // Filtrer par wilaya
        if (wilaya) {
            query.wilaya = wilaya;
        }
        
        // Filtrer par motif
        if (motif) {
            query.motifRetour = motif;
        }

        const retours = await Retour.find(query)
            .populate('colisId', 'reference prixColis agence tracking')
            .populate('retournePar', 'nom prenom email')
            .sort({ dateRetour: -1 });

        console.log(`✅ ${retours.length} retours retournés`);

        res.status(200).json({
            success: true,
            data: retours
        });
    } catch (error) {
        console.error('Erreur getAllRetours:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des retours',
            error: error.message
        });
    }
};
```

### 2. Modifier `backend/controllers/livraisonController.js`

```javascript
const Livraison = require('../models/Livraison');
const Colis = require('../models/Colis');  // ✅ Ajouter

exports.getAllLivraisons = async (req, res) => {
    try {
        const { startDate, endDate, wilaya } = req.query;
        
        let query = {};
        
        // ✅ FILTRAGE PAR RÔLE
        if (req.user.role === 'commercant') {
            // Commercant voit uniquement ses livraisons
            const colisCom = await Colis.find({
                'expediteur.id': req.user._id
            }).select('_id');
            
            const colisIds = colisCom.map(c => c._id);
            query.colisId = { $in: colisIds };
            
            console.log(`🔍 Commercant: ${colisIds.length} colis trouvés`);
            
        } else if (req.user.role === 'agent' || req.user.role === 'agence') {
            // Agent voit livraisons de son agence
            const colisAgence = await Colis.find({
                $or: [
                    { agence: req.user.agence },
                    { bureauSource: req.user.agence }
                ]
            }).select('_id');
            
            const colisIds = colisAgence.map(c => c._id);
            query.colisId = { $in: colisIds };
            
            console.log(`🔍 Agent/Agence: ${colisIds.length} colis trouvés pour agence ${req.user.agence}`);
        }
        // Admin: pas de filtre (voit tout)
        
        // Filtrer par date
        if (startDate || endDate) {
            query.dateLivraison = {};
            if (startDate) query.dateLivraison.$gte = new Date(startDate);
            if (endDate) query.dateLivraison.$lte = new Date(endDate);
        }
        
        // Filtrer par wilaya
        if (wilaya) {
            query.wilaya = wilaya;
        }

        const livraisons = await Livraison.find(query)
            .populate('colisId', 'reference prixColis agence tracking')
            .populate('livrePar', 'nom prenom email')
            .sort({ dateLivraison: -1 });

        console.log(`✅ ${livraisons.length} livraisons retournées`);

        res.status(200).json({
            success: true,
            data: livraisons
        });
    } catch (error) {
        console.error('Erreur getAllLivraisons:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des livraisons',
            error: error.message
        });
    }
};
```

---

## 📊 RÉSUMÉ VISUEL

```
┌─────────────────────────────────────────────────────────┐
│  VISIBILITÉ RETOURS & LIVRAISONS (APRÈS CORRECTION)    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  AGENT crée retour/livraison                           │
│       ↓                                                │
│  Le retour/livraison est lié à un COLIS               │
│       ↓                                                │
│  Le COLIS a une AGENCE                                 │
│       ↓                                                │
│  FILTRAGE:                                             │
│                                                         │
│  ✅ AGENT → Voit retours/livraisons de SON agence      │
│  ✅ AGENCE → Voit retours/livraisons de SON agence     │
│  ✅ COMMERCANT → Voit uniquement SES retours/livr.     │
│  ✅ ADMIN → Voit TOUT                                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ CONCLUSION

### État actuel:
- ❌ **Aucun filtrage** sur retours et livraisons
- ❌ Tous les utilisateurs voient tout
- ❌ Problème de sécurité et confidentialité

### Après correction:
- ✅ **Filtrage par agence** pour agents
- ✅ **Filtrage par commercant** pour commercants
- ✅ **Accès complet** pour admin
- ✅ Isolation correcte des données

### Action requise:
**Appliquer le code ci-dessus dans les 2 controllers !** 🚀

---

**Date:** 19 octobre 2025
**Priorité:** 🔴 HAUTE (sécurité des données)
**Temps estimé:** 15 minutes
