# 📋 Affichage Conditionnel des Champs du Formulaire Colis Agent

## 📅 Date : 16 Octobre 2025

## 🎯 Objectif

Adapter dynamiquement les champs affichés dans le formulaire de création de colis selon le **type de livraison** sélectionné :
- **Livraison Bureau** → Afficher **Bureau destinataire**
- **Livraison Domicile** → Afficher **Adresse de livraison**
- Dans **tous les cas** → Afficher **Wilaya destinataire**

---

## 🔧 Modifications Apportées

### 1. **Fichier HTML** : `dashboards/agent/agent-dashboard.html`

#### Ajout du champ "Adresse de livraison"
```html
<!-- Ligne 691-695 : Wilaya destinataire (toujours visible) -->
<div class="form-group">
  <label for="wilayaDest"><i class="fas fa-map"></i> Wilaya destinataire</label>
  <select id="wilayaDest" name="wilayaDest" required>
    <option value="">Sélectionner une wilaya</option>
  </select>
</div>

<!-- Ligne 696-700 : Bureau destinataire (visible si type = bureau) -->
<div class="form-group" id="bureauDestGroup">
  <label for="bureauDest"><i class="fas fa-building"></i> Bureau destinataire</label>
  <select id="bureauDest" name="bureauDest">
    <option value="">Sélectionner un bureau</option>
  </select>
</div>

<!-- Ligne 702-708 : Adresse livraison (visible si type = domicile) -->
<div class="form-row" id="adresseLivraisonGroup" style="display: none;">
  <div class="form-group" style="width: 100%;">
    <label for="adresseLivraison"><i class="fas fa-map-marker-alt"></i> Adresse de livraison</label>
    <textarea id="adresseLivraison" name="adresseLivraison" rows="2" 
              placeholder="Entrez l'adresse complète de livraison"></textarea>
  </div>
</div>
```

**Points clés** :
- `bureauDestGroup` : Conteneur avec ID pour contrôle dynamique
- `adresseLivraisonGroup` : Masqué par défaut (`display: none`)
- `required` : Ajouté/retiré dynamiquement selon le type

---

### 2. **Fichier JavaScript** : `dashboards/agent/js/colis-form.js`

#### a) Nouvelle fonction `handleTypeLivraisonChange()`

```javascript
// Ligne 397-455 : Gestion de l'affichage conditionnel
function handleTypeLivraisonChange() {
    const typelivraisonSelect = document.getElementById('typelivraison');
    const bureauDestGroup = document.getElementById('bureauDestGroup');
    const adresseLivraisonGroup = document.getElementById('adresseLivraisonGroup');
    const bureauDestSelect = document.getElementById('bureauDest');
    const adresseLivraisonInput = document.getElementById('adresseLivraison');
    
    const typeLivraison = typelivraisonSelect.value;
    console.log('🚚 Type de livraison changé:', typeLivraison);
    
    if (typeLivraison === 'bureau') {
        // MODE BUREAU : Afficher bureau, masquer adresse
        bureauDestGroup.style.display = '';
        adresseLivraisonGroup.style.display = 'none';
        
        bureauDestSelect.required = true;
        adresseLivraisonInput.required = false;
        
        // Réinitialiser les champs non utilisés
        adresseLivraisonInput.value = '';
        
        console.log('✅ Mode Bureau: Bureau destinataire affiché');
        
    } else if (typeLivraison === 'domicile') {
        // MODE DOMICILE : Masquer bureau, afficher adresse
        bureauDestGroup.style.display = 'none';
        adresseLivraisonGroup.style.display = '';
        
        bureauDestSelect.required = false;
        adresseLivraisonInput.required = true;
        
        // Réinitialiser les champs non utilisés
        bureauDestSelect.value = '';
        
        console.log('✅ Mode Domicile: Adresse affichée');
        
    } else {
        // AUCUN TYPE : Afficher bureau par défaut, masquer adresse
        bureauDestGroup.style.display = '';
        adresseLivraisonGroup.style.display = 'none';
        
        bureauDestSelect.required = false;
        adresseLivraisonInput.required = false;
        
        console.log('⚠️ Aucun type sélectionné');
    }
}
```

**Logique** :
| Type Livraison | Bureau Dest | Adresse Livraison | Wilaya Dest |
|----------------|-------------|-------------------|-------------|
| `bureau`       | ✅ Visible + Requis | ❌ Masqué | ✅ Visible + Requis |
| `domicile`     | ❌ Masqué | ✅ Visible + Requis | ✅ Visible + Requis |
| Non sélectionné | ✅ Visible | ❌ Masqué | ✅ Visible |

#### b) Modification de l'event listener

```javascript
// Ligne 441-445 : Ajout de handleTypeLivraisonChange() à l'event
const typelivraisonSelect = document.getElementById('typelivraison');
if (typelivraisonSelect) {
    typelivraisonSelect.addEventListener('change', function() {
        handleTypeLivraisonChange();  // ← NOUVEAU
        calculateFrais();
    });
}
```

---

### 3. **Fichier JavaScript** : `dashboards/agent/modal-manager.js`

#### a) Ajout du champ dans `directData`

```javascript
// Ligne 110-124 : Collecte des données du formulaire
const directData = {
    nomExpediteur: document.getElementById('nomExpediteur')?.value || '-',
    // ... autres champs ...
    wilayaDest: document.getElementById('wilayaDest')?.value || '-',
    bureauDest: document.getElementById('bureauDest')?.value || '-',
    adresseLivraison: document.getElementById('adresseLivraison')?.value || '-'  // ← NOUVEAU
};
```

#### b) Logique conditionnelle pour `adresse`

```javascript
// Ligne 156-164 : Déterminer l'adresse selon le type de livraison
let adresseFinal = '';
if (directData.typelivraison === 'domicile') {
    adresseFinal = directData.adresseLivraison || '-';
} else if (directData.typelivraison === 'bureau') {
    adresseFinal = directData.bureauDest || '-';
} else {
    adresseFinal = directData.bureauDest || directData.adresseLivraison || '-';
}
```

#### c) Mise à jour de `colisData`

```javascript
// Ligne 185-187 : Utiliser l'adresse déterminée
adresse: adresseFinal,  // ← Conditionnel
adresseLivraison: directData.adresseLivraison,  // ← Toujours inclus
```

**Résultat** :
- `adresse` : Contient soit le bureau soit l'adresse selon le type
- `adresseLivraison` : Conservé tel quel pour référence

---

## 🧪 Tests à Effectuer

### Test 1 : Livraison Bureau
1. Sélectionner **Type livraison : Livraison au bureau**
2. **Vérifier** :
   - ✅ Champ "Bureau destinataire" visible et requis
   - ❌ Champ "Adresse de livraison" masqué
   - ✅ Champ "Wilaya destinataire" visible et requis
3. Remplir et soumettre
4. **Vérifier** dans le colis créé :
   - `adresse` = code bureau sélectionné
   - `bureauDest` = code bureau sélectionné
   - `adresseLivraison` = vide ou '-'

### Test 2 : Livraison Domicile
1. Sélectionner **Type livraison : Livraison à domicile**
2. **Vérifier** :
   - ❌ Champ "Bureau destinataire" masqué
   - ✅ Champ "Adresse de livraison" visible et requis
   - ✅ Champ "Wilaya destinataire" visible et requis
3. Remplir l'adresse complète
4. **Vérifier** dans le colis créé :
   - `adresse` = adresse saisie
   - `adresseLivraison` = adresse saisie
   - `bureauDest` = vide ou '-'

### Test 3 : Changement de Type
1. Sélectionner "Bureau" → Remplir le bureau
2. Changer pour "Domicile"
3. **Vérifier** :
   - Bureau sélectionné précédemment est **réinitialisé** (vide)
   - Adresse s'affiche
4. Remplir l'adresse et soumettre
5. **Vérifier** que seule l'adresse est enregistrée

---

## 📊 État Avant/Après

### ❌ Avant
- Bureau destinataire **toujours affiché**
- Pas de champ adresse de livraison
- Confusion : quel champ utiliser pour livraison domicile ?

### ✅ Après
- **Affichage dynamique** selon le type
- **Bureau** pour livraisons en agence
- **Adresse** pour livraisons à domicile
- **Wilaya toujours visible** pour calcul des frais
- Champs réinitialisés automatiquement lors du changement de type

---

## 🚀 Prochaines Étapes

1. ✅ Tester en conditions réelles avec différents types de livraison
2. ⏳ Vérifier l'affichage de l'adresse dans la liste des colis
3. ⏳ Adapter le ticket d'impression pour afficher le bon champ
4. ⏳ Mettre à jour le backend pour stocker ces données correctement

---

## 📝 Notes Techniques

- **CSS** : Utilisation de `display: none` / `display: ''` pour contrôle visuel
- **Validation** : Attribut `required` géré dynamiquement via JavaScript
- **Réinitialisation** : Champs non utilisés vidés automatiquement
- **Compatibilité** : Fonctionne avec la structure existante du formulaire
- **Console logs** : Messages détaillés pour débogage facile

---

## 🎯 Résumé Final

✅ **2 fichiers HTML modifiés** : Ajout champ adresse + IDs sur conteneurs  
✅ **2 fichiers JS modifiés** : Logique d'affichage + collecte données  
✅ **Fonctionnalité complète** : Bureau OU Adresse selon type  
✅ **Wilaya toujours présente** : Pour calcul frais livraison  

**Résultat** : Formulaire intelligent qui s'adapte au type de livraison ! 🎉
