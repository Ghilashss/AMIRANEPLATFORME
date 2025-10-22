# 🔄 MODIFICATION - PRIX UNIQUE POUR TOUS LES TYPES DE LIVRAISON

**Date**: 20 octobre 2025  
**Changement**: Suppression de la facturation différenciée par type de livraison  
**Statut**: ❌ **ANNULÉ** (Restauré le 20 octobre 2025)

---

## ⚠️ AVERTISSEMENT - CETTE MODIFICATION A ÉTÉ ANNULÉE

Cette modification a été **restaurée** à la facturation différenciée.

**Raison**: L'utilisateur a besoin de prix différents pour bureau et domicile.

**Voir**: `CORRECTION_FACTURATION_DIFFERENCIEE.md` pour la version actuelle.

---

## 📋 CHANGEMENT DEMANDÉ

**AVANT**: Tarifs différents pour "Domicile" et "Bureau"  
**APRÈS**: **Prix unique** peu importe le type de livraison

---

## 🔍 SYSTÈME AVANT

### **Facturation différenciée**

```javascript
if (typeLivraison === 'bureau') {
    prixBase = fraisConfig.baseBureau || fraisConfig.fraisStopDesk || 0;
    prixParKg = fraisConfig.parKgBureau || 0;
} else if (typeLivraison === 'domicile') {
    prixBase = fraisConfig.baseDomicile || fraisConfig.fraisDomicile || 0;
    prixParKg = fraisConfig.parKgDomicile || 0;
}
```

### **Exemple (Tizi Ouzou → Alger)**

**Configuration**:
- Domicile: 500 DA base + 50 DA/kg
- Bureau: 350 DA base + 35 DA/kg

**Colis 10 kg**:
- Domicile: 500 + (5×50) = **750 DA**
- Bureau: 350 + (5×35) = **525 DA**
- Différence: **225 DA** (30% moins cher au bureau)

---

## ✅ SYSTÈME APRÈS

### **Prix unique**

```javascript
// 🔥 PRIX UNIQUE - Même tarif pour domicile et bureau
let prixBase = 0;
let prixParKg = 0;

// Utiliser le prix domicile comme prix unique (ou bureau si domicile non défini)
prixBase = fraisConfig.baseDomicile || fraisConfig.fraisDomicile || 
           fraisConfig.baseBureau || fraisConfig.fraisStopDesk || 0;
prixParKg = fraisConfig.parKgDomicile || fraisConfig.parKgBureau || 0;

console.log(`💰 Prix unique utilisé (domicile/bureau): Base=${prixBase} DA, ParKg=${prixParKg} DA/kg`);
```

### **Logique de priorité**

Le système utilise **en priorité** le tarif "Domicile":
1. Essayer `baseDomicile` ou `fraisDomicile`
2. Si non défini → Fallback sur `baseBureau` ou `fraisStopDesk`
3. Même logique pour le prix/kg

### **Exemple (Tizi Ouzou → Alger)**

**Configuration** (inchangée):
- Domicile: 500 DA base + 50 DA/kg
- Bureau: 350 DA base + 35 DA/kg

**Colis 10 kg** (nouveau comportement):
- Domicile: 500 + (5×50) = **750 DA**
- Bureau: 500 + (5×50) = **750 DA** ✅ (même prix maintenant!)
- Différence: **0 DA**

---

## 🎯 IMPACT

### **Pour les clients**

✅ **Simplification**: Un seul prix à retenir  
✅ **Transparence**: Pas de surprise selon le type choisi  
✅ **Équité**: Même coût pour tous les modes de livraison  

### **Pour l'admin**

⚠️ **Configuration**: Seul le tarif "Domicile" est utilisé  
💡 **Recommandation**: Configurer uniquement le tarif "Domicile"  
ℹ️ **Fallback**: Si domicile vide, le système utilise le tarif "Bureau"  

### **Pour le système**

✅ **Code simplifié**: Plus de condition if/else  
✅ **Cohérence**: Même calcul pour tous  
✅ **Maintenance**: Plus facile à gérer  

---

## 📊 COMPARAISON

### **Scénario 1: Colis 3 kg Normal**

| Type | AVANT | APRÈS | Changement |
|------|-------|-------|------------|
| Domicile | 500 DA | 500 DA | = |
| Bureau | 350 DA | 500 DA | +150 DA (+43%) |

### **Scénario 2: Colis 10 kg Normal**

| Type | AVANT | APRÈS | Changement |
|------|-------|-------|------------|
| Domicile | 750 DA | 750 DA | = |
| Bureau | 525 DA | 750 DA | +225 DA (+43%) |

### **Scénario 3: Colis 10 kg Fragile**

| Type | AVANT | APRÈS | Changement |
|------|-------|-------|------------|
| Domicile | 825 DA | 825 DA | = |
| Bureau | 577.50 DA | 825 DA | +247.50 DA (+43%) |

**Résumé**: 
- Prix "Domicile" **inchangé**
- Prix "Bureau" **augmenté** pour égaler le domicile

---

## 🔧 FORMULE DE CALCUL

### **Reste identique**

```
Frais de base = Prix configuré (domicile prioritaire)

Si poids ≤ 5 kg:
    Frais total = Frais de base

Si poids > 5 kg:
    Kg supplémentaires = poids - 5
    Frais supplémentaires = Kg supplémentaires × Prix/kg
    Frais total = Frais de base + Frais supplémentaires

Si colis fragile:
    Supplément = Frais total × 10%
    Frais total += Supplément
```

**Changement**: Le "Prix configuré" est maintenant le **même** pour domicile et bureau.

---

## 🧪 TESTS

### **Test 1: Vérifier le calcul**

1. Ouvrir formulaire colis
2. Sélectionner wilaya destination (ex: Alger)
3. Saisir poids: 10 kg
4. Choisir **Domicile** → Noter le prix (ex: 750 DA)
5. Choisir **Bureau** → Vérifier le prix (doit être **750 DA** aussi)

**Résultat attendu**: ✅ Prix identique

### **Test 2: Vérifier les logs**

**Console F12**:
```
💰 Prix unique utilisé (domicile/bureau): Base=500 DA, ParKg=50 DA/kg
⚖️ Poids > 5 kg: Base (0-5kg) = 500 DA, Supplémentaire (5.00 kg × 50 DA/kg) = 250.00 DA
💰 Frais calculés: 750.00 DA (Base: 500, Poids: 10kg, ParKg: 50 DA/kg, Type: normal)
```

**Vérifier**: Le log dit "Prix unique" au lieu de mentionner domicile/bureau séparément.

---

## 📝 FICHIER MODIFIÉ

**Fichier**: `dashboards/shared/js/colis-form-handler.js`

**Fonction**: `calculateFrais()` (lignes 560-580)

**Avant** (17 lignes):
```javascript
// Calculer les frais selon le type de livraison
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

// 🎯 NOUVEAU CALCUL : Prix de base inclut jusqu'à 5 kg
// Au-delà de 5 kg, on facture le surplus au tarif prixParKg
frais = prixBase;
```

**Après** (13 lignes):
```javascript
// 🔥 PRIX UNIQUE - Même tarif pour domicile et bureau
let frais = 0;
let prixBase = 0;
let prixParKg = 0;

// Utiliser le prix domicile comme prix unique (ou bureau si domicile non défini)
prixBase = fraisConfig.baseDomicile || fraisConfig.fraisDomicile || 
           fraisConfig.baseBureau || fraisConfig.fraisStopDesk || 0;
prixParKg = fraisConfig.parKgDomicile || fraisConfig.parKgBureau || 0;

console.log(`💰 Prix unique utilisé (domicile/bureau): Base=${prixBase} DA, ParKg=${prixParKg} DA/kg`);

// 🎯 CALCUL : Prix de base inclut jusqu'à 5 kg
// Au-delà de 5 kg, on facture le surplus au tarif prixParKg
frais = prixBase;
```

**Changement**: -4 lignes (suppression du if/else)

---

## ⚠️ RECOMMANDATIONS

### **Pour l'admin**

1. **Configuration des frais**: Utiliser uniquement le tarif "Domicile"
2. **Tarifs bureau**: Peuvent être laissés vides ou égaux au domicile
3. **Cohérence**: Vérifier que tous les tarifs domicile sont bien configurés

### **Configuration recommandée**

```javascript
// Exemple de configuration dans MongoDB
{
  wilayaSource: "15",
  wilayaDest: "16",
  baseDomicile: 500,      // ✅ Utilisé pour TOUS les types
  parKgDomicile: 50,      // ✅ Utilisé pour TOUS les types
  baseBureau: 0,          // ⚠️ Ignoré (fallback seulement)
  parKgBureau: 0          // ⚠️ Ignoré (fallback seulement)
}
```

### **Si migration nécessaire**

Si vous avez des tarifs bureau moins chers et voulez les appliquer à tous:

**Option 1**: Mettre les tarifs bureau dans domicile
```javascript
// Copier baseBureau → baseDomicile
db.fraisLivraison.updateMany(
  {},
  { $set: { 
    baseDomicile: "$baseBureau",
    parKgDomicile: "$parKgBureau"
  }}
)
```

**Option 2**: Modifier le code pour utiliser bureau en priorité
```javascript
// Dans colis-form-handler.js, inverser la priorité:
prixBase = fraisConfig.baseBureau || fraisConfig.fraisStopDesk ||
           fraisConfig.baseDomicile || fraisConfig.fraisDomicile || 0;
```

---

## ✅ AVANTAGES

✅ **Simplicité**: Un seul prix à retenir  
✅ **Transparence**: Pas de confusion sur le tarif  
✅ **Équité**: Même coût pour tous  
✅ **Maintenance**: Code plus simple  
✅ **Performance**: Moins de conditions  

---

## ❌ INCONVÉNIENTS

❌ **Flexibilité réduite**: Plus de tarif préférentiel pour le bureau  
❌ **Augmentation** pour les clients bureau (si tarifs différents avant)  
⚠️ **Migration** potentiellement nécessaire dans la base de données  

---

## 🔄 RETOUR EN ARRIÈRE

Si vous voulez restaurer la facturation différenciée:

```javascript
// Remplacer ces lignes (560-572):
// 🔥 PRIX UNIQUE - Même tarif pour domicile et bureau
let prixBase = 0;
let prixParKg = 0;

// Utiliser le prix domicile comme prix unique
prixBase = fraisConfig.baseDomicile || fraisConfig.fraisDomicile || 
           fraisConfig.baseBureau || fraisConfig.fraisStopDesk || 0;
prixParKg = fraisConfig.parKgDomicile || fraisConfig.parKgBureau || 0;

// Par ce code:
let prixBase = 0;
let prixParKg = 0;

if (typeLivraison === 'bureau') {
    prixBase = fraisConfig.baseBureau || fraisConfig.fraisStopDesk || 0;
    prixParKg = fraisConfig.parKgBureau || 0;
} else if (typeLivraison === 'domicile') {
    prixBase = fraisConfig.baseDomicile || fraisConfig.fraisDomicile || 0;
    prixParKg = fraisConfig.parKgDomicile || 0;
}
```

---

**Auteur**: GitHub Copilot  
**Type**: Modification de logique métier  
**Impact**: Haut (change le calcul des frais)  
**Version**: 1.0
