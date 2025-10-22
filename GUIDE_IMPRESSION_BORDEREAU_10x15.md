# 📄 Guide Impression Bordereau 10x15 cm

## 📏 Format du Bordereau

Le bordereau d'impression est configuré pour s'imprimer sur **papier 10x15 cm** (100x150 mm).

### Dimensions Exactes
- **Largeur** : 10 cm (100 mm)
- **Hauteur** : 15 cm (150 mm)
- **Format** : Étiquette postale standard
- **Orientation** : Portrait

---

## ⚙️ Configuration CSS

### 1. Règle @page

```css
@media print {
    @page {
        size: 100mm 150mm; /* Format étiquette 10x15 cm */
        margin: 0;
        padding: 0;
    }
}
```

**Rôle** : Définit la taille de la page d'impression pour que le navigateur utilise le bon format.

### 2. Conteneur HTML/Body

```css
html, body {
    margin: 0 !important;
    padding: 0 !important;
    width: 100mm !important;
    height: 150mm !important;
    overflow: hidden !important;
}
```

**Rôle** : Force le document entier à 10x15 cm, sans marges ni débordement.

### 3. Wrapper du Ticket

```css
.ticket-wrapper {
    width: 100mm !important;
    height: 150mm !important;
    min-width: 100mm !important;
    min-height: 150mm !important;
    max-width: 100mm !important;
    max-height: 150mm !important;
    padding: 3mm !important;
    border: 2px solid #000 !important;
    box-sizing: border-box !important;
}
```

**Rôle** : Conteneur principal du bordereau avec dimensions fixes et bordure noire.

---

## 🖨️ Configuration Imprimante

### Paramètres Recommandés

#### Google Chrome / Edge
1. Ouvrir **Imprimer** (Ctrl+P)
2. **Mise en page** :
   - Format : **Personnalisé**
   - Largeur : **100 mm**
   - Hauteur : **150 mm**
3. **Marges** : **Aucune** (0 mm)
4. **Échelle** : **100%** (pas d'ajustement)
5. **Graphiques en arrière-plan** : **Activé** ✅
6. **Orientation** : **Portrait**

#### Firefox
1. Ouvrir **Imprimer** (Ctrl+P)
2. **Options de page** :
   - Format : **Personnalisé**
   - Largeur : **10 cm**
   - Hauteur : **15 cm**
3. **Marges** : **Personnalisées** → **0** pour toutes
4. **Imprimer les arrière-plans** : **Coché** ✅
5. **Échelle** : **100%**

---

## 🎨 Contenu du Bordereau

### Structure du Bordereau (de haut en bas)

```
┌────────────────────────────────────────┐
│ Date/Heure          Ticket de Livraison│ ← En-tête (6pt)
├────────────────────────────────────────┤
│ [LOGO]                    Wilaya: 16   │
│ AMIRANE EXPRESS           Code: AG2    │ ← Header avec logo et infos
├────────────────────────────────────────┤
│ N° Tracking: ABC123456789              │
│ ████████████████████████               │ ← Code-barres
├────────────────────────────────────────┤
│ 📤 EXPÉDITEUR                          │
│ Nom: Ahmed Benali                      │
│ Tél: 0555 12 34 56                     │
│ Wilaya: Alger                          │ ← Section expéditeur
├────────────────────────────────────────┤
│ 📥 DESTINATAIRE                        │
│ Nom: Fatima Zohra                      │
│ Tél: 0666 78 90 12                     │
│ Wilaya: Oran                           │
│ Adresse: Rue de la Liberté, Oran      │ ← Section destinataire
├────────────────────────────────────────┤
│ 📦 DÉTAILS COLIS                       │
│ Service: Domicile                      │
│ Wilaya Exp: Alger                      │
│ Prix: 1200.00 DA                       │
│ Frais: 300.00 DA                       │
│ Total: 1500.00 DA                      │
│ Poids: 2 KG                            │
│ Contenu: Vêtements                     │ ← Détails colis
├────────────────────────────────────────┤
│ Date d'expédition: 19/10/2025          │ ← Date
├────────────────────────────────────────┤
│ Signature:                             │
│                                        │
│ Date: 19/10/2025                       │ ← Signature
├────────────────────────────────────────┤
│ [Texte arabe]                          │ ← Déclaration
└────────────────────────────────────────┘
```

### Tailles de Police

| Élément | Taille | Poids |
|---------|--------|-------|
| Date en-tête | 6pt | Bold |
| Numéro tracking | 16pt | Bold |
| Titre sections | 8pt | Bold |
| Contenu sections | 7pt | Normal |
| Code-barres texte | 7pt | Normal |
| Code wilaya | 9pt | Bold |

---

## 🔧 Configuration JavaScript

### Fonction d'Impression

```javascript
async function printTicket(colis) {
    // ... (préparation des données)
    
    // Génération du code-barres
    JsBarcode("#ticket-barcode", barcodeValue, {
        format: "CODE128",
        width: 2,           // Largeur des barres
        height: 60,         // Hauteur en pixels
        displayValue: false, // Pas de texte sous le code
        margin: 5,          // Marge autour
        background: "#ffffff",
        lineColor: "#000000"
    });
    
    // Afficher le ticket
    ticketDiv.style.display = 'flex';
    
    // Forcer les dimensions avant impression
    setTimeout(() => {
        const ticketWrapper = document.querySelector('.ticket-wrapper');
        if (ticketWrapper) {
            ticketWrapper.style.width = '100mm';
            ticketWrapper.style.height = '150mm';
            ticketWrapper.style.maxWidth = '100mm';
            ticketWrapper.style.maxHeight = '150mm';
            ticketWrapper.style.minWidth = '100mm';
            ticketWrapper.style.minHeight = '150mm';
            ticketWrapper.style.transform = 'scale(1)';
            ticketWrapper.style.margin = '0';
            ticketWrapper.style.padding = '3mm';
            ticketWrapper.style.boxSizing = 'border-box';
        }
        
        window.print();
    }, 800);
}
```

**Délai de 800ms** : Laisse le temps au code-barres de se générer avant l'impression.

---

## 🖨️ Types d'Imprimantes Compatibles

### 1. Imprimante Thermique
- **Zebra ZD410** ✅
- **Zebra ZD420** ✅
- **Brother QL-820NWB** ✅
- **DYMO LabelWriter 4XL** ✅

**Configuration** : 
- Format papier : 100 x 150 mm
- Mode : Thermique direct
- Densité : 203 dpi ou 300 dpi

### 2. Imprimante Laser/Jet d'encre
- Peut imprimer avec du papier coupé à 10x15 cm
- Ou utiliser des feuilles d'étiquettes autocollantes 10x15 cm

**Configuration** :
- Format papier personnalisé : 100 x 150 mm
- Alimentation : Manuelle (pour papier coupé)
- Qualité : Standard (pas besoin de haute qualité)

### 3. Imprimante Photo Format Carte Postale
- Format 10x15 cm standard
- Mode : Impression sans bordure

---

## 📝 Checklist Avant Impression

### ✅ Vérifications Navigateur
- [ ] Code-barres visible à l'écran
- [ ] Toutes les données affichées (nom, tél, adresse, etc.)
- [ ] Bordure noire visible autour du ticket
- [ ] Pas de débordement du contenu

### ✅ Vérifications Dialogue d'Impression
- [ ] Format : 100 x 150 mm (ou 10 x 15 cm)
- [ ] Marges : 0 mm (aucune marge)
- [ ] Échelle : 100% (pas d'ajustement)
- [ ] Graphiques en arrière-plan : Activé
- [ ] Orientation : Portrait
- [ ] Aperçu correct dans la fenêtre de prévisualisation

### ✅ Vérifications Imprimante
- [ ] Papier 10x15 cm chargé
- [ ] Imprimante allumée et en ligne
- [ ] Pas d'erreur de papier ou d'encre
- [ ] Pilote d'imprimante à jour

---

## 🐛 Dépannage

### Problème 1 : Le Ticket est Coupé

**Cause** : Marges d'impression non nulles ou échelle incorrecte.

**Solution** :
1. Ouvrir le dialogue d'impression
2. Définir **Marges : Aucune** (0 mm)
3. Définir **Échelle : 100%**
4. Décocher "Ajuster à la page"

### Problème 2 : Le Ticket est Trop Petit/Grand

**Cause** : Format de papier incorrect dans les paramètres.

**Solution** :
1. Ouvrir **Paramètres d'impression**
2. **Format de papier** → **Personnalisé**
3. Entrer **100 mm x 150 mm** exactement
4. Sauvegarder et réessayer

### Problème 3 : Le Code-Barres ne S'Imprime Pas

**Cause** : JsBarcode pas chargé ou graphiques désactivés.

**Solution** :
1. Vérifier la console (F12) pour erreurs JavaScript
2. S'assurer que JsBarcode est chargé :
   ```html
   <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
   ```
3. Activer **Graphiques en arrière-plan** dans les paramètres d'impression

### Problème 4 : Bordures/Ombres ne S'Impriment Pas

**Cause** : Graphiques en arrière-plan désactivés.

**Solution** :
1. Dans le dialogue d'impression
2. Cocher **Imprimer les arrière-plans** (Chrome/Edge)
3. Ou **Graphiques en arrière-plan** (Firefox)

### Problème 5 : Texte Tronqué ou Débordant

**Cause** : Contenu trop long pour la taille de police.

**Solution** :
- Le CSS utilise `font-size: 7pt` pour le contenu
- Si le texte est très long, il sera automatiquement tronqué
- Réduire la taille du texte dans les champs (ex: adresse)
- Ou ajuster `font-size` dans `ticket.css`

---

## 🎯 Optimisations Appliquées

### 1. Dimensions Forcées en JavaScript
```javascript
ticketWrapper.style.width = '100mm';
ticketWrapper.style.height = '150mm';
ticketWrapper.style.minWidth = '100mm';
ticketWrapper.style.maxWidth = '100mm';
// Empêche tout redimensionnement automatique
```

### 2. Règle @page Stricte
```css
@page {
    size: 100mm 150mm; /* Taille exacte imposée */
    margin: 0;
    padding: 0;
}
```

### 3. Suppression de Tous les Débordements
```css
overflow: hidden !important;
page-break-inside: avoid !important;
```

### 4. Code-Barres Optimisé pour 10 cm de Large
```javascript
JsBarcode("#ticket-barcode", value, {
    width: 2,   // Barres fines pour tenir dans 10 cm
    height: 60, // Hauteur raisonnable
    margin: 5   // Petite marge
});
```

---

## 📐 Calcul des Marges Internes

### Dimensions Effectives

```
Papier total     : 100 mm x 150 mm
Bordure          : 2 mm (1 mm de chaque côté)
Padding interne  : 3 mm

Zone utile       : 94 mm x 144 mm
```

### Répartition Verticale (approximative)

```
En-tête          : ~10 mm
Code tracking    : ~15 mm (avec barcode)
Expéditeur       : ~20 mm
Destinataire     : ~25 mm
Détails colis    : ~35 mm
Date expédition  : ~8 mm
Signature        : ~20 mm
Déclaration AR   : ~11 mm
────────────────────────
Total            : ~144 mm ✅
```

---

## 🚀 Utilisation

### Depuis le Dashboard Agent

1. Naviguer vers **Section Colis**
2. Cliquer sur le bouton **🖨️ Imprimer** sur un colis
3. Le bordereau s'affiche à l'écran
4. La fenêtre d'impression s'ouvre automatiquement après 800ms
5. Vérifier l'aperçu
6. Cliquer sur **Imprimer**

### Depuis le Dashboard Admin

1. Naviguer vers **Section Colis**
2. Cliquer sur le bouton **🖨️ Imprimer** sur un colis
3. Même processus que pour l'agent

---

## ✅ Validation de l'Impression

### À l'Écran (Avant Impression)

✅ Le ticket occupe toute la largeur de la div  
✅ Pas de barre de défilement horizontal  
✅ Code-barres visible et lisible  
✅ Toutes les sections visibles  
✅ Bordure noire autour du ticket  

### Dans l'Aperçu d'Impression

✅ Format : 100 x 150 mm affiché  
✅ Une seule page  
✅ Pas de zones blanches excessives  
✅ Contenu centré et bien aligné  
✅ Code-barres noir et blanc (pas de gris)  

### Sur le Papier Imprimé

✅ Dimensions exactes : 10 x 15 cm (avec une règle)  
✅ Code-barres scannable avec un lecteur  
✅ Texte lisible (pas trop petit)  
✅ Bordures droites et nettes  
✅ Pas de texte coupé ou tronqué  

---

## 📊 Compatibilité Navigateurs

| Navigateur | Support @page | Support 100x150mm | Notes |
|------------|---------------|-------------------|-------|
| Chrome ✅ | ✅ Excellent | ✅ Parfait | Recommandé |
| Edge ✅ | ✅ Excellent | ✅ Parfait | Recommandé |
| Firefox ✅ | ✅ Bon | ✅ Bon | Fonctionne bien |
| Safari ⚠️ | ⚠️ Partiel | ⚠️ Partiel | Peut nécessiter ajustements |
| Opera ✅ | ✅ Bon | ✅ Bon | Basé sur Chromium |

**Recommandation** : Utiliser **Google Chrome** ou **Microsoft Edge** pour les meilleurs résultats.

---

## 🔗 Fichiers Impliqués

### 1. CSS
**Fichier** : `dashboards/agent/css/ticket.css`
- Définit le format 10x15 cm
- Règle `@page { size: 100mm 150mm; }`
- Styles `@media print`

### 2. JavaScript
**Fichier** : `dashboards/ticket.js`
- Fonction `printTicket(colis)`
- Génération code-barres JsBarcode
- Forçage dimensions avant impression

### 3. HTML
**Fichier** : `dashboards/agent/agent-dashboard.html`
- Conteneur `<div id="ticketColisPrint">`
- Structure du ticket
- Éléments de contenu

---

## 📝 Notes Importantes

### ⚠️ Attendre la Génération du Code-Barres

Le délai de 800ms dans `printTicket()` est **crucial** :

```javascript
setTimeout(() => {
    window.print();
}, 800);
```

Sans ce délai :
- ❌ Le code-barres peut être vide/manquant
- ❌ L'impression peut se lancer avant le rendu complet

### ⚠️ Format Papier dans l'Imprimante

Assurez-vous que :
1. Le papier 10x15 cm est **correctement chargé**
2. L'imprimante est **configurée** pour ce format
3. Le **pilote d'imprimante** reconnaît le format personnalisé

### ⚠️ Pas de Mise à l'Échelle Automatique

Les paramètres suivants **désactivent** la mise à l'échelle :
```css
transform: scale(1) !important;
```
```javascript
ticketWrapper.style.transform = 'scale(1)';
```

Cela garantit que **1 mm CSS = 1 mm physique** sur le papier.

---

## ✅ Résultat Final

Le bordereau s'imprime correctement sur **papier 10x15 cm** avec :
- ✅ Dimensions exactes (10 x 15 cm)
- ✅ Code-barres lisible par scanner
- ✅ Toutes les informations visibles
- ✅ Qualité professionnelle
- ✅ Bordures et sections bien définies
- ✅ Aucun débordement ou texte coupé

---

**Date de documentation** : 19 Octobre 2025  
**Format cible** : 10 x 15 cm (100 x 150 mm)  
**Status** : ✅ CONFIGURÉ ET OPÉRATIONNEL
