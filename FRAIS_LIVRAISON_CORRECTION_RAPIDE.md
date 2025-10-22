# ✅ CORRECTION RAPIDE - Frais de Livraison

## 🔴 PROBLÈME

**Les frais de livraison ne se calculaient pas lors de la création d'un colis dans Admin !**

---

## ✅ CAUSE

La méthode `calculateFrais()` cherchait :
```javascript
// ❌ Code qui ne marche pas
f.typeLivraison === typeLivraison  // Ce champ n'existe pas dans MongoDB !
```

Mais la structure MongoDB est :
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

---

## ✅ SOLUTION

**Fichier modifié :** `dashboards/shared/js/colis-form-handler.js`

### 1. Recherche par wilayaSource + wilayaDest

```javascript
// ✅ Code qui fonctionne
let fraisConfig = this.fraisLivraison.find(f => 
    f.wilayaSource === wilayaSourceCode && 
    f.wilayaDest === wilayaDestCode
);
```

### 2. Calcul selon type de livraison

```javascript
if (typeLivraison === 'bureau') {
    prixBase = fraisConfig.baseBureau || 0;
    prixParKg = fraisConfig.parKgBureau || 0;
} else if (typeLivraison === 'domicile') {
    prixBase = fraisConfig.baseDomicile || 0;
    prixParKg = fraisConfig.parKgDomicile || 0;
}

frais = prixBase + (poids × prixParKg);

if (fragile) {
    frais += frais × 0.10; // +10%
}
```

### 3. Recalcul automatique

Ajout de `this.calculateFrais()` quand wilaya source change.

---

## 🧪 COMMENT TESTER

### Dans Admin Dashboard :

1. **Ajouter un colis**
2. **Wilaya Expéditeur** : 16 - Alger
3. **Wilaya Destinataire** : 31 - Oran
4. **Type Livraison** : Bureau
5. **Poids** : 2 kg
6. **Type Colis** : Normal

**Résultat attendu :**
- Console : `💰 Frais calculés: 500.00 DA (Base: 400, Poids: 2kg × 50 DA/kg, Type: normal)`
- Affichage : **500.00 DA**

---

### Test avec Fragile :

1. **Type Colis** : Fragile
2. **Même config**

**Résultat attendu :**
- Console : `📦 Supplément fragile: +50.00 DA (10%)`
- Console : `💰 Frais calculés: 550.00 DA`
- Affichage : **550.00 DA**

---

## 📊 FORMULE

```
Bureau:
  Frais = baseBureau + (poids × parKgBureau)

Domicile:
  Frais = baseDomicile + (poids × parKgDomicile)

Si Fragile:
  Frais = Frais × 1.10 (+10%)
```

---

## 📝 MODIFICATIONS

**Fichier :** `dashboards/shared/js/colis-form-handler.js`

**Méthodes modifiées :**
1. ✅ `calculateFrais()` - Nouvelle logique de calcul
2. ✅ `setupEventListeners()` - Ajout recalcul sur wilaya source

**Lignes modifiées :** ~340-420

---

## ⚠️ SI ÇA NE MARCHE PAS

### Vérifier :
- [ ] Wilaya source sélectionnée (Admin)
- [ ] Wilaya dest sélectionnée  
- [ ] Poids > 0
- [ ] Configuration existe dans frais de livraison

### Console :
- ⚠️ "Wilaya source non définie" → Sélectionner une wilaya source
- ⚠️ "Pas de frais configurés pour X → Y" → Ajouter la config dans Admin

---

**🎉 Rechargez la page Admin pour tester ! 🎉**

**Les frais se calculent maintenant correctement !** ✅
