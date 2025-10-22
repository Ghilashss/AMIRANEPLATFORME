# ✅ CORRECTION - Calcul des Frais de Livraison

## 🔴 PROBLÈME IDENTIFIÉ

**Les frais de livraison ne se calculaient pas lors de la création d'un colis !**

### Causes :

1. **Structure de données incompatible**
   - Le code cherchait `f.typeLivraison` dans les frais
   - Mais la structure MongoDB n'a PAS ce champ
   - Elle a plutôt : `fraisStopDesk`, `fraisDomicile`, `baseBureau`, `parKgBureau`, etc.

2. **Logique de recherche incorrecte**
   ```javascript
   // ❌ ANCIEN CODE
   let fraisConfig = this.fraisLivraison.find(f => 
       f.wilayaDest === wilayaDestCode && 
       f.typeLivraison === typeLivraison  // ❌ Ce champ n'existe pas !
   );
   ```

3. **Wilaya source non utilisée**
   - Les frais dépendent de : `wilayaSource` → `wilayaDest`
   - Mais le code ne cherchait que par `wilayaDest`

---

## ✅ SOLUTION APPLIQUÉE

### Modification : `dashboards/shared/js/colis-form-handler.js`

#### 1️⃣ Ajout de la wilaya source dans la recherche

```javascript
// ✅ NOUVEAU CODE
// Pour Admin : récupérer wilaya source depuis le select
let wilayaSourceCode = null;
if (this.userRole === 'admin') {
    const wilayaSourceSelect = document.getElementById('wilayaExpediteur');
    if (wilayaSourceSelect && wilayaSourceSelect.selectedIndex > 0) {
        wilayaSourceCode = wilayaSourceSelect.options[wilayaSourceSelect.selectedIndex]?.dataset?.code;
    }
} else {
    // Pour agent/commercant, utiliser leur wilaya
    wilayaSourceCode = this.currentUser?.wilaya;
}

// Chercher par wilayaSource ET wilayaDest
let fraisConfig = this.fraisLivraison.find(f => 
    f.wilayaSource === wilayaSourceCode && 
    f.wilayaDest === wilayaDestCode
);
```

---

#### 2️⃣ Calcul selon le type de livraison

```javascript
let frais = 0;
let prixBase = 0;
let prixParKg = 0;

if (typeLivraison === 'bureau') {
    // Livraison au bureau (Stop Desk)
    prixBase = fraisConfig.baseBureau || fraisConfig.fraisStopDesk || 0;
    prixParKg = fraisConfig.parKgBureau || 0;
} else if (typeLivraison === 'domicile') {
    // Livraison à domicile
    prixBase = fraisConfig.baseDomicile || fraisConfig.fraisDomicile || 0;
    prixParKg = fraisConfig.parKgDomicile || 0;
}

// Frais de base
frais = prixBase;

// Ajouter les frais par poids
if (prixParKg && poids > 0) {
    frais += (poids * prixParKg);
}

// Supplément fragile (10%)
if (typeColis === 'fragile') {
    frais += frais * 0.10;
}
```

---

#### 3️⃣ Ajout d'event listener pour wilaya source

```javascript
// Wilaya expéditeur change (Admin uniquement)
const wilayaExp = document.getElementById('wilayaExpediteur');
if (wilayaExp) {
    wilayaExp.addEventListener('change', (e) => {
        this.populateBureauxExpediteur(e.target.value);
        this.calculateFrais(); // ✅ Recalculer les frais
    });
}
```

---

## 📊 STRUCTURE DES DONNÉES

### MongoDB - Collection fraislivraisons

```json
{
  "_id": "67...",
  "wilayaSource": "16",
  "wilayaDest": "31",
  "fraisStopDesk": 500,
  "fraisDomicile": 700,
  "baseBureau": 400,
  "parKgBureau": 50,
  "baseDomicile": 600,
  "parKgDomicile": 70
}
```

### Calcul des frais :

**Exemple 1 : Livraison Bureau (Stop Desk)**
- Wilaya Source : 16 (Alger)
- Wilaya Dest : 31 (Oran)
- Type : bureau
- Poids : 2 kg
- Fragile : Non

**Calcul :**
```
Base Bureau     : 400 DA
Poids (2 × 50)  : 100 DA
Supplément      : 0 DA
──────────────────────
TOTAL          : 500 DA
```

---

**Exemple 2 : Livraison Domicile Fragile**
- Wilaya Source : 16 (Alger)
- Wilaya Dest : 31 (Oran)
- Type : domicile
- Poids : 3 kg
- Fragile : Oui

**Calcul :**
```
Base Domicile   : 600 DA
Poids (3 × 70)  : 210 DA
Sous-total      : 810 DA
Fragile (+10%)  : 81 DA
──────────────────────
TOTAL          : 891 DA
```

---

## 🔄 FLUX DE CALCUL

```
1. Utilisateur sélectionne Wilaya Source (Admin)
   ↓
2. Utilisateur sélectionne Wilaya Destinataire
   ↓
3. Utilisateur sélectionne Type Livraison (bureau/domicile)
   ↓
4. Utilisateur entre Poids (kg)
   ↓
5. Utilisateur sélectionne Type Colis (normal/fragile)
   ↓
6. À chaque changement → calculateFrais()
   ↓
7. Recherche config : wilayaSource + wilayaDest
   ↓
8. Si trouvé :
   - Type bureau → baseBureau + (poids × parKgBureau)
   - Type domicile → baseDomicile + (poids × parKgDomicile)
   - Si fragile → +10%
   ↓
9. Affichage du résultat dans #fraisLivraison
   ↓
10. Mise à jour du Total à Payer
```

---

## 🧪 COMMENT TESTER

### Test 1 : Admin - Livraison Bureau

1. Ouvrir Admin Dashboard
2. Cliquer "Ajouter un colis"
3. **Wilaya Expéditeur** : 16 - Alger
4. **Wilaya Destinataire** : 31 - Oran
5. **Type Livraison** : Bureau (Stop Desk)
6. **Poids** : 2
7. **Type Colis** : Normal

**Console attendue :**
```
💰 Frais calculés: 500.00 DA (Base: 400, Poids: 2kg × 50 DA/kg, Type: normal)
```

**Affichage :**
- Frais de Livraison : **500.00 DA**

---

### Test 2 : Admin - Livraison Domicile Fragile

1. **Wilaya Expéditeur** : 16 - Alger
2. **Wilaya Destinataire** : 31 - Oran
3. **Type Livraison** : Domicile
4. **Poids** : 3
5. **Type Colis** : Fragile

**Console attendue :**
```
📦 Supplément fragile: +81.00 DA (10%)
💰 Frais calculés: 891.00 DA (Base: 600, Poids: 3kg × 70 DA/kg, Type: fragile)
```

**Affichage :**
- Frais de Livraison : **891.00 DA**

---

### Test 3 : Vérifier Recalcul Automatique

1. Remplir le formulaire
2. **Changer Wilaya Source** → Frais recalculés ✅
3. **Changer Wilaya Dest** → Frais recalculés ✅
4. **Changer Type Livraison** → Frais recalculés ✅
5. **Changer Poids** → Frais recalculés ✅
6. **Changer Type Colis** → Frais recalculés ✅

---

### Test 4 : Cas sans configuration

1. Sélectionner une combinaison wilaya non configurée
2. Ex: Wilaya Source 01 → Wilaya Dest 58

**Console attendue :**
```
⚠️ Pas de frais configurés pour 01 → 58
```

**Affichage :**
- Frais de Livraison : **0.00 DA**

---

## 📝 LOGS DE DEBUG

### Logs utiles dans la console :

```javascript
// Quand frais chargés
💰 4 configurations de frais chargées

// Quand wilaya source manquante
⚠️ Wilaya source non définie

// Quand config introuvable
⚠️ Pas de frais configurés pour 16 → 31

// Quand frais calculés avec succès
💰 Frais calculés: 500.00 DA (Base: 400, Poids: 2kg × 50 DA/kg, Type: normal)

// Quand colis fragile
📦 Supplément fragile: +50.00 DA (10%)
```

---

## 🔍 VÉRIFICATION DES DONNÉES

### Dans la console du navigateur :

```javascript
// Vérifier les frais chargés
console.log(window.colisFormHandler.fraisLivraison);

// Exemple de sortie attendue :
[
  {
    wilayaSource: "16",
    nomWilayaSource: "Alger",
    wilayaDest: "31",
    nomWilayaDest: "Oran",
    fraisStopDesk: 500,
    fraisDomicile: 700,
    baseBureau: 400,
    parKgBureau: 50,
    baseDomicile: 600,
    parKgDomicile: 70
  }
]
```

---

## ⚙️ FORMULES DE CALCUL

### Livraison Bureau (Stop Desk)

```
Frais = baseBureau + (poids × parKgBureau)

Si fragile:
Frais = Frais × 1.10
```

### Livraison Domicile

```
Frais = baseDomicile + (poids × parKgDomicile)

Si fragile:
Frais = Frais × 1.10
```

### Fallback

Si `baseBureau` ou `baseDomicile` n'existent pas :
```javascript
prixBase = fraisConfig.baseBureau || fraisConfig.fraisStopDesk || 0;
prixBase = fraisConfig.baseDomicile || fraisConfig.fraisDomicile || 0;
```

---

## 🔧 COMPATIBILITÉ

### Anciennes données (sans base/parKg) :

```json
{
  "wilayaSource": "16",
  "wilayaDest": "31",
  "fraisStopDesk": 500,
  "fraisDomicile": 700
}
```

**Calcul :**
- Bureau : 500 DA (fixe)
- Domicile : 700 DA (fixe)
- Pas de frais par kg

---

### Nouvelles données (avec détails) :

```json
{
  "wilayaSource": "16",
  "wilayaDest": "31",
  "baseBureau": 400,
  "parKgBureau": 50,
  "baseDomicile": 600,
  "parKgDomicile": 70
}
```

**Calcul :**
- Bureau : 400 + (poids × 50)
- Domicile : 600 + (poids × 70)

---

## 🎯 RÉSUMÉ DES MODIFICATIONS

### Fichier modifié :
✅ `dashboards/shared/js/colis-form-handler.js`

### Méthodes modifiées :
1. ✅ `calculateFrais()` - Logique de calcul complètement réécrite
2. ✅ `setupEventListeners()` - Ajout recalcul sur changement wilaya source

### Améliorations :
- ✅ Utilise wilayaSource + wilayaDest pour trouver config
- ✅ Supporte bureau/domicile selon structure MongoDB
- ✅ Calcul base + poids avec fallback
- ✅ Supplément fragile 10%
- ✅ Logs détaillés pour debug
- ✅ Recalcul automatique sur tous les changements

---

## ⚠️ DÉPANNAGE

### Problème : Frais = 0 DA

**Vérifier :**
1. Wilaya source sélectionnée (Admin)
2. Wilaya dest sélectionnée
3. Type livraison sélectionné
4. Poids > 0
5. Configuration existe dans la base

**Console :**
- Si "Wilaya source non définie" → Sélectionner wilaya source
- Si "Pas de frais configurés" → Ajouter config dans Admin

---

### Problème : Frais ne recalculent pas

**Solution :**
- Recharger la page : `Ctrl + F5`
- Vérifier console pour erreurs JS

---

**🎉 Les frais de livraison se calculent maintenant correctement ! 🎉**
