# 💰 SYSTÈME DE FACTURATION DES COLIS

**Date**: 20 octobre 2025  
**Fichier**: `dashboards/shared/js/colis-form-handler.js`  
**Fonction**: `calculateFrais()` (ligne 485)

---

## ✅ OUI, IL Y A UNE FACTURATION SELON LE TYPE DE COLIS!

Le système de facturation prend en compte **plusieurs facteurs**:

### 📋 **Facteurs de calcul**

1. **🗺️ Wilaya Source → Wilaya Destination** (obligatoire)
2. **📦 Type de Livraison** (obligatoire)
   - **Domicile** (livraison à l'adresse)
   - **Bureau** (Stop Desk - livraison à l'agence)
3. **⚖️ Poids du colis** (obligatoire)
4. **🔴 Type de colis** (optionnel)
   - **Normal**
   - **Fragile** (+10% de supplément)

---

## 💵 FORMULE DE CALCUL

### **1. Prix de base (selon type de livraison)**

**Livraison à DOMICILE**:
```javascript
prixBase = fraisConfig.baseDomicile || fraisConfig.fraisDomicile || 0;
prixParKg = fraisConfig.parKgDomicile || 0;
```

**Livraison au BUREAU** (Stop Desk):
```javascript
prixBase = fraisConfig.baseBureau || fraisConfig.fraisStopDesk || 0;
prixParKg = fraisConfig.parKgBureau || 0;
```

### **2. Calcul selon le poids**

**Règle**: Le prix de base **inclut jusqu'à 5 kg**

```javascript
if (poids <= 5 kg) {
    frais = prixBase;
}

if (poids > 5 kg) {
    kgSupplementaires = poids - 5;
    fraisSupplementaires = kgSupplementaires × prixParKg;
    frais = prixBase + fraisSupplementaires;
}
```

**Exemple**:
- Prix de base domicile: **500 DA** (inclut 0-5 kg)
- Prix par kg domicile: **50 DA/kg**
- Colis de **8 kg**:
  ```
  Frais = 500 DA + ((8 - 5) × 50) DA
        = 500 DA + (3 × 50) DA
        = 500 DA + 150 DA
        = 650 DA
  ```

### **3. Supplément fragile (+10%)**

Si le colis est **fragile**:
```javascript
supplement = frais × 0.10;  // 10% du total
frais += supplement;
```

**Exemple** (suite du précédent):
- Frais calculés: **650 DA**
- Supplément fragile: **65 DA** (10%)
- **Total**: **715 DA**

---

## 📊 DIFFÉRENCE DE PRIX: DOMICILE vs BUREAU

### **Configuration typique**

Pour une route donnée (ex: Tizi Ouzou → Alger):

| Type | Prix Base (0-5kg) | Prix/kg (>5kg) |
|------|-------------------|----------------|
| **Domicile** | 500 DA | 50 DA/kg |
| **Bureau** | 350 DA | 35 DA/kg |

### **Exemples de calcul**

**Colis 3 kg - Normal**:
- Domicile: **500 DA**
- Bureau: **350 DA**
- **Économie**: 150 DA (30%)

**Colis 10 kg - Normal**:
- Domicile: 500 + (5 × 50) = **750 DA**
- Bureau: 350 + (5 × 35) = **525 DA**
- **Économie**: 225 DA (30%)

**Colis 10 kg - Fragile**:
- Domicile: 750 + (750 × 0.10) = **825 DA**
- Bureau: 525 + (525 × 0.10) = **577.50 DA**
- **Économie**: 247.50 DA (30%)

---

## 🔧 CONFIGURATION DES FRAIS

### **Structure dans MongoDB**

```javascript
{
  wilayaSource: "15",              // Code wilaya source (Tizi Ouzou)
  nomWilayaSource: "Tizi Ouzou",
  wilayaDest: "16",                // Code wilaya destination (Alger)
  nomWilayaDest: "Alger",
  
  // 🏠 Tarifs DOMICILE
  baseDomicile: 500,               // Prix de base 0-5 kg
  parKgDomicile: 50,               // Prix par kg supplémentaire
  
  // 🏢 Tarifs BUREAU (Stop Desk)
  baseBureau: 350,                 // Prix de base 0-5 kg
  parKgBureau: 35,                 // Prix par kg supplémentaire
  
  createdAt: "2025-10-20T...",
  updatedAt: "2025-10-20T..."
}
```

### **Champs importants**

| Champ | Description | Obligatoire |
|-------|-------------|-------------|
| `baseDomicile` | Prix fixe domicile (0-5kg) | ✅ Oui |
| `parKgDomicile` | Prix/kg domicile (>5kg) | ⚠️ Recommandé |
| `baseBureau` | Prix fixe bureau (0-5kg) | ✅ Oui |
| `parKgBureau` | Prix/kg bureau (>5kg) | ⚠️ Recommandé |

---

## 🎯 LOGIQUE D'AFFICHAGE

### **Dans le formulaire**

Quand l'utilisateur remplit:
1. **Wilaya destinataire** → Sélectionne la route
2. **Type de livraison** → Détermine domicile vs bureau
3. **Poids** → Calcule les frais
4. **Type colis** → Ajoute supplément si fragile

### **Affichage en temps réel**

```html
<!-- Champ affiché -->
<div class="form-group">
  <label>💰 Frais de livraison</label>
  <div id="fraisLivraison" class="frais-display">
    650 DA
  </div>
</div>
```

### **Messages d'erreur**

**Si frais non configurés**:
```
⚠️ NON CONFIGURÉS
Route: Tizi Ouzou → Adrar
Veuillez configurer les frais pour cette route
```

---

## 📝 LOGS DE DÉBOGAGE

### **Logs générés lors du calcul**

```javascript
🔍 DÉBUT CALCUL FRAIS: {
  wilayaDestValue: "16",
  typeLivraison: "domicile",
  poids: 8,
  poidsValide: true
}

🔍 RECHERCHE FRAIS: {
  wilayaSourceCode: "15",
  wilayaDestCode: "16",
  fraisDisponibles: 6,
  fraisPourSource: 2
}

✅ Frais trouvés: {
  wilayaSource: "15",
  wilayaDest: "16",
  baseDomicile: 500,
  parKgDomicile: 50,
  baseBureau: 350,
  parKgBureau: 35
}

⚖️ Poids > 5 kg: Base (0-5kg) = 500 DA, Supplémentaire (3 kg × 50 DA/kg) = 150 DA

📦 Supplément fragile: +65 DA (10%)

💰 Frais calculés: 715 DA
```

---

## 🚀 EXEMPLES CONCRETS

### **Exemple 1: Colis léger à domicile**

**Données**:
- Tizi Ouzou → Alger
- Type: Domicile
- Poids: 2 kg
- Colis: Normal

**Calcul**:
```
Frais = 500 DA (base domicile, inclut 0-5 kg)
Total = 500 DA
```

### **Exemple 2: Colis lourd au bureau**

**Données**:
- Tizi Ouzou → Alger
- Type: Bureau
- Poids: 12 kg
- Colis: Normal

**Calcul**:
```
Base bureau = 350 DA (0-5 kg)
Kg supplémentaires = 12 - 5 = 7 kg
Frais supplémentaires = 7 × 35 = 245 DA
Total = 350 + 245 = 595 DA
```

### **Exemple 3: Colis fragile à domicile**

**Données**:
- Tizi Ouzou → Alger
- Type: Domicile
- Poids: 4 kg
- Colis: **Fragile**

**Calcul**:
```
Base domicile = 500 DA (0-5 kg)
Supplément fragile = 500 × 0.10 = 50 DA
Total = 500 + 50 = 550 DA
```

---

## 💡 AVANTAGES DU SYSTÈME

### **1. Tarification flexible**

✅ Prix différents selon le type de livraison  
✅ Incitation à utiliser le bureau (moins cher)  
✅ Tarification progressive selon le poids  

### **2. Transparence**

✅ Calcul en temps réel dans le formulaire  
✅ Affichage détaillé dans le résumé  
✅ Logs complets pour débogage  

### **3. Sécurité**

✅ Vérification des frais configurés  
✅ Avertissement si route non configurée  
✅ Validation des données avant calcul  

---

## 🔍 VÉRIFICATION DANS LA BASE

### **Voir les frais configurés**

```javascript
// Dans MongoDB Compass ou terminal
db.fraislivraisons.find({
  wilayaSource: "15",  // Tizi Ouzou
  wilayaDest: "16"     // Alger
}).pretty()
```

**Résultat attendu**:
```json
{
  "_id": ObjectId("..."),
  "wilayaSource": "15",
  "nomWilayaSource": "Tizi Ouzou",
  "wilayaDest": "16",
  "nomWilayaDest": "Alger",
  "baseDomicile": 500,
  "parKgDomicile": 50,
  "baseBureau": 350,
  "parKgBureau": 35,
  "createdAt": "2025-10-20T...",
  "updatedAt": "2025-10-20T..."
}
```

---

## 📊 RÉSUMÉ

| Question | Réponse |
|----------|---------|
| **Y a-t-il facturation selon le type?** | ✅ **OUI** - Domicile vs Bureau |
| **Différence de prix?** | ✅ Bureau ~30% moins cher |
| **Poids impact le prix?** | ✅ Après 5 kg, tarif au kg |
| **Colis fragile coûte plus?** | ✅ +10% de supplément |
| **Calcul automatique?** | ✅ Temps réel dans formulaire |
| **Routes non configurées?** | ⚠️ Message d'avertissement |

---

**Auteur**: GitHub Copilot  
**Système**: Facturation dynamique multi-critères  
**Version**: 1.0 (Production)
