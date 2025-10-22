# 🖨️ Configuration Imprimante Thermique 10x15 cm

## 🎯 Objectif

Imprimer les bordereaux directement sur une **imprimante thermique** utilisant du papier **10x15 cm** (étiquettes postales).

---

## 📋 Imprimantes Thermiques Compatibles

### Modèles Recommandés

| Marque | Modèle | Format | Prix approx. | Recommandé |
|--------|--------|--------|--------------|------------|
| **Zebra** | ZD410 | 10x15 cm | 15 000 DA | ⭐⭐⭐⭐⭐ |
| **Zebra** | ZD420 | 10x15 cm | 18 000 DA | ⭐⭐⭐⭐⭐ |
| **Brother** | QL-820NWB | 10x15 cm | 25 000 DA | ⭐⭐⭐⭐ |
| **DYMO** | LabelWriter 4XL | 10x15 cm | 20 000 DA | ⭐⭐⭐⭐ |
| **TSC** | TE200 | 10x15 cm | 12 000 DA | ⭐⭐⭐ |
| **Xprinter** | XP-470B | 10x15 cm | 8 000 DA | ⭐⭐⭐ |

---

## ⚙️ Configuration Windows

### Étape 1 : Installer le Pilote

1. **Télécharger** le pilote depuis le site du fabricant
2. **Brancher** l'imprimante (USB ou réseau)
3. **Installer** le pilote
4. **Redémarrer** l'ordinateur

### Étape 2 : Configurer le Format Papier

#### Via Panneau de Configuration Windows

1. Ouvrir **Panneau de configuration** → **Périphériques et imprimantes**
2. **Clic droit** sur votre imprimante thermique → **Propriétés de l'imprimante**
3. Cliquer sur **Préférences d'impression**
4. Onglet **Mise en page** ou **Papier**
5. **Format** → Sélectionner ou créer un format personnalisé :
   - Nom : `Étiquette 10x15`
   - Largeur : `100 mm`
   - Hauteur : `150 mm`
6. **Marges** : Mettre toutes les marges à `0 mm`
7. **Orientation** : Portrait
8. Cliquer sur **Appliquer** puis **OK**

#### Créer un Format Personnalisé (si non disponible)

1. **Paramètres** → **Imprimantes et scanners**
2. Sélectionner votre imprimante thermique
3. **Gérer** → **Propriétés de l'imprimante**
4. Onglet **Avancé** → **Format de papier** → **Nouveau**
5. Entrer :
   - Nom : `10x15cm`
   - Largeur : `10 cm` (ou `100 mm`)
   - Hauteur : `15 cm` (ou `150 mm`)
6. **Enregistrer**

### Étape 3 : Définir comme Imprimante par Défaut (Optionnel)

1. **Paramètres** → **Imprimantes et scanners**
2. Cliquer sur votre imprimante thermique
3. Cocher **Définir comme imprimante par défaut**

---

## 🌐 Configuration Navigateur

### Google Chrome / Microsoft Edge

#### Méthode 1 : Configuration Manuelle à Chaque Impression

1. Cliquer sur **Imprimer** (Ctrl+P)
2. **Destination** : Sélectionner votre imprimante thermique
3. **Plus de paramètres** :
   - Format du papier : `10x15 cm` ou `Étiquette 10x15`
   - Marges : `Aucune` (0 mm)
   - Échelle : `100%` (par défaut)
   - Options : Cocher **Graphiques en arrière-plan**
4. Cliquer sur **Imprimer**

#### Méthode 2 : Utiliser l'Impression Système

Pour ouvrir directement le dialogue système (avec les paramètres sauvegardés) :

**Dans Chrome** :
1. `chrome://flags/#enable-system-print-dialog`
2. Activer **Use system print dialog**
3. Redémarrer Chrome
4. Ctrl+Shift+P ouvrira le dialogue système Windows

**Dans Edge** :
1. Paramètres → **Imprimer**
2. Cocher **Ouvrir le dialogue système**

### Firefox

1. **Menu** → **Imprimer** (Ctrl+P)
2. Sélectionner votre imprimante thermique
3. **Options de page** :
   - Format : `10 x 15 cm` ou `Personnalisé`
   - Si personnalisé : Largeur `10 cm`, Hauteur `15 cm`
   - Marges : `0` pour toutes
4. **Apparence** :
   - Cocher **Imprimer les arrière-plans**
5. **Imprimer**

---

## 🔧 Configuration du Code (Si Nécessaire)

### Option 1 : Ajouter un Bouton "Impression Système"

Créer un bouton qui ouvre directement le dialogue système Windows :

```javascript
// Ajouter dans data-store.js ou ticket.js

function printTicketSystemDialog(colis) {
    // Préparer le ticket comme d'habitude
    preparerTicket(colis);
    
    // Attendre un peu pour le rendu
    setTimeout(() => {
        // Utiliser execCommand pour forcer le dialogue système
        document.execCommand('print', false, null);
    }, 800);
}
```

### Option 2 : Détection Automatique de l'Imprimante Thermique

```javascript
// Détecter si une imprimante thermique est disponible
async function detectThermalPrinter() {
    try {
        // API Web Print (Chrome 109+)
        if ('printing' in window) {
            const printers = await window.printing.getPrinters();
            const thermal = printers.find(p => 
                p.name.toLowerCase().includes('zebra') ||
                p.name.toLowerCase().includes('brother') ||
                p.name.toLowerCase().includes('dymo') ||
                p.name.toLowerCase().includes('thermal') ||
                p.name.toLowerCase().includes('label')
            );
            
            if (thermal) {
                console.log('✅ Imprimante thermique détectée:', thermal.name);
                return thermal;
            }
        }
    } catch (error) {
        console.warn('⚠️ Détection automatique non disponible');
    }
    return null;
}
```

### Option 3 : Paramètres d'Impression Pré-configurés

Ajouter des paramètres spécifiques avant `window.print()` :

```javascript
async function printTicket(colis) {
    // ... (préparation du ticket)
    
    // Forcer l'utilisation du dialogue système avec paramètres
    const printOptions = {
        silent: false, // Toujours afficher le dialogue
        deviceName: '', // Laisser vide pour utiliser l'imprimante par défaut
        pageSize: {
            width: 100000, // 100 mm en micromètres
            height: 150000  // 150 mm en micromètres
        },
        margins: {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0
        },
        shouldPrintBackgrounds: true,
        color: false, // Noir et blanc pour thermique
        scaleFactor: 100
    };
    
    // Lancer l'impression
    setTimeout(() => {
        window.print();
    }, 800);
}
```

---

## 🎯 Solution Recommandée : Impression en 3 Clics

### Workflow Optimisé

```
1. Clic sur bouton "Imprimer" dans le dashboard
   └─> Le ticket s'affiche à l'écran (aperçu)
   └─> Dialogue d'impression s'ouvre automatiquement

2. Vérifier l'aperçu dans le dialogue
   └─> Format : 10x15 cm ✅
   └─> Imprimante : Zebra/Brother/DYMO ✅
   └─> Aperçu correct ✅

3. Clic sur "Imprimer"
   └─> L'imprimante thermique imprime immédiatement
   └─> Résultat : Étiquette 10x15 cm parfaite ✅
```

---

## 🐛 Problèmes Courants et Solutions

### Problème 1 : Le Papier N'Avance Pas

**Causes possibles** :
- Papier mal chargé
- Capteur de papier sale
- Pilote mal configuré

**Solutions** :
```
1. Éteindre l'imprimante
2. Retirer le rouleau de papier
3. Nettoyer le capteur avec un chiffon sec
4. Remettre le papier en s'assurant qu'il est bien aligné
5. Allumer l'imprimante
6. Faire un test d'impression (bouton sur l'imprimante)
```

### Problème 2 : L'Impression est Trop Grande/Petite

**Cause** : Échelle incorrecte ou format papier mal configuré.

**Solution** :
```
1. Panneau de configuration → Imprimantes
2. Propriétés de l'imprimante thermique
3. Vérifier Format papier : 100 x 150 mm
4. Vérifier Échelle : 100% (aucun ajustement)
5. Sauvegarder et réessayer
```

### Problème 3 : L'Impression est Décalée

**Cause** : Marges non nulles.

**Solution** :
```
1. Dans le dialogue d'impression
2. Marges → Personnalisées → 0 mm pour toutes
3. Ou dans les propriétés de l'imprimante :
   - Marges → Aucune
   - Impression sans bordure → Activée
```

### Problème 4 : Le Code-Barres ne Scanne Pas

**Causes** :
- Impression floue ou bavée
- Densité d'impression trop faible
- Code-barres trop petit

**Solutions** :
```
1. Augmenter la densité d'impression (voir pilote)
2. Nettoyer la tête d'impression thermique
3. Vérifier la qualité du papier thermique
4. Dans ticket.js, augmenter la taille :
   
   JsBarcode("#ticket-barcode", value, {
       width: 3,    // Au lieu de 2
       height: 80   // Au lieu de 60
   });
```

### Problème 5 : Dialogue d'Impression Bloqué sur A4

**Cause** : Format personnalisé non reconnu par le navigateur.

**Solution 1 - Forcer le format dans le pilote** :
```
1. Propriétés de l'imprimante
2. Onglet Avancé
3. Format de papier → 10x15 cm
4. Cocher "Toujours utiliser ce format"
5. Appliquer
```

**Solution 2 - Utiliser l'API Web Print** :
```javascript
// Dans ticket.js - Utiliser l'API moderne
if (window.print && CSS.supports('size', '100mm 150mm')) {
    // Forcer @page dans un style inline
    const style = document.createElement('style');
    style.textContent = `
        @page { size: 100mm 150mm; margin: 0; }
        @media print { body { margin: 0; } }
    `;
    document.head.appendChild(style);
    window.print();
    setTimeout(() => document.head.removeChild(style), 1000);
}
```

---

## 🔌 Connexion de l'Imprimante

### USB Direct (Recommandé)

**Avantages** :
- ✅ Configuration simple
- ✅ Pas de réseau requis
- ✅ Vitesse maximale
- ✅ Fonctionne hors ligne

**Installation** :
1. Brancher le câble USB
2. Windows détecte automatiquement
3. Installer le pilote si demandé
4. Prêt à imprimer

### Réseau (WiFi/Ethernet)

**Avantages** :
- ✅ Plusieurs postes peuvent imprimer
- ✅ Pas de câble à gérer
- ✅ Imprimante peut être éloignée

**Installation** :
1. Connecter l'imprimante au réseau (voir manuel)
2. Noter l'adresse IP de l'imprimante
3. Ajouter l'imprimante réseau dans Windows :
   - Paramètres → Imprimantes → Ajouter
   - Sélectionner "Ajouter une imprimante réseau"
   - Entrer l'adresse IP
4. Installer le pilote
5. Tester l'impression

### Bluetooth (Si disponible)

**Avantages** :
- ✅ Sans fil
- ✅ Portable

**Installation** :
1. Activer Bluetooth sur l'imprimante
2. Windows → Paramètres → Bluetooth
3. Ajouter un appareil → Imprimante
4. Sélectionner l'imprimante
5. Installer le pilote

---

## 📄 Qualité du Papier Thermique

### Papier Recommandé

**Spécifications** :
- Format : **10 x 15 cm** (100 x 150 mm)
- Type : **Thermique direct** (pas besoin de ruban encreur)
- Grammage : **60-80 g/m²**
- Adhésif : **Autocollant permanent** ou **Sans adhésif**
- Rouleau : 500 à 1000 étiquettes
- Mandrin : 25 mm ou 40 mm (selon imprimante)

**Marques Recommandées** :
- Zebra Z-Select 2000T
- Brother DK-1240
- DYMO LW 4XL Labels
- Avery Dennison Thermal
- Générique de qualité (moins cher)

**Prix Algérie (approximatif)** :
- Rouleau 500 étiquettes : 2 500 - 4 000 DA
- Rouleau 1000 étiquettes : 4 500 - 7 000 DA

---

## 🧪 Test d'Impression

### Test 1 : Impression de Test Système

**But** : Vérifier que l'imprimante fonctionne.

**Procédure** :
1. Panneau de configuration → Imprimantes
2. Clic droit sur l'imprimante thermique
3. **Propriétés de l'imprimante**
4. Onglet **Général**
5. Bouton **Imprimer une page de test**
6. Vérifier que la page s'imprime correctement

### Test 2 : Impression Depuis le Dashboard

**But** : Vérifier l'impression d'un bordereau réel.

**Procédure** :
1. Ouvrir le dashboard Agent ou Admin
2. Aller dans la section **Colis**
3. Cliquer sur **🖨️ Imprimer** sur n'importe quel colis
4. Le ticket s'affiche à l'écran
5. Le dialogue d'impression s'ouvre
6. **Vérifier** :
   - Imprimante sélectionnée : Votre imprimante thermique ✅
   - Format papier : 10x15 cm ✅
   - Aperçu correct ✅
7. Cliquer sur **Imprimer**
8. **Résultat attendu** :
   - Étiquette 10x15 cm imprimée ✅
   - Code-barres scannable ✅
   - Toutes les infos visibles ✅

### Test 3 : Scanner le Code-Barres

**But** : Vérifier que le code-barres est lisible.

**Procédure** :
1. Utiliser un scanner de code-barres (douchette)
2. Scanner le code-barres sur l'étiquette imprimée
3. **Résultat attendu** :
   - Le code s'affiche correctement ✅
   - Pas d'erreur de lecture ✅

---

## 💡 Astuces et Optimisations

### Astuce 1 : Créer un Profil d'Impression

**Windows** permet de sauvegarder des profils d'impression :

1. Propriétés de l'imprimante → Préférences
2. Configurer tous les paramètres (format, marges, etc.)
3. En bas : **Profils** → **Nouveau**
4. Nom : `Bordereau 10x15`
5. Sauvegarder
6. Lors de l'impression, sélectionner ce profil

### Astuce 2 : Raccourci Clavier Chrome

Ajouter une extension pour imprimer directement :

```javascript
// Extension ou script Tampermonkey
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        // Impression rapide avec paramètres par défaut
        const ticket = document.getElementById('ticketColisPrint');
        if (ticket && ticket.style.display === 'flex') {
            window.print();
        }
    }
});
```

### Astuce 3 : Impression Silencieuse (Avancé)

**Attention** : Nécessite une extension ou Electron.

Avec **Electron** :
```javascript
const { ipcRenderer } = require('electron');

function printSilent(colis) {
    preparerTicket(colis);
    setTimeout(() => {
        ipcRenderer.send('print-silent', {
            printer: 'Zebra ZD410', // Nom exact de l'imprimante
            options: {
                silent: true,
                pageSize: { width: 100000, height: 150000 }
            }
        });
    }, 800);
}
```

### Astuce 4 : Pré-charger les Paramètres

Dans `ticket.js`, ajouter avant `window.print()` :

```javascript
// Forcer les paramètres dans le localStorage du navigateur
localStorage.setItem('print_paper_size', '100x150mm');
localStorage.setItem('print_margins', '0,0,0,0');
localStorage.setItem('print_scale', '100');
```

---

## 📊 Checklist Complète

### ✅ Configuration Initiale

- [ ] Imprimante thermique branchée et allumée
- [ ] Pilote installé et à jour
- [ ] Format papier 10x15 cm configuré dans Windows
- [ ] Marges définies à 0 mm
- [ ] Imprimante définie comme défaut (optionnel)
- [ ] Test d'impression système réussi

### ✅ Avant Chaque Impression

- [ ] Papier thermique chargé dans l'imprimante
- [ ] Niveau de papier suffisant
- [ ] Imprimante en ligne (pas d'erreur)
- [ ] Navigateur ouvert (Chrome/Edge recommandé)

### ✅ Lors de l'Impression

- [ ] Cliquer sur bouton Imprimer dans le dashboard
- [ ] Ticket s'affiche correctement à l'écran
- [ ] Dialogue d'impression s'ouvre
- [ ] Imprimante thermique sélectionnée
- [ ] Format papier : 10x15 cm
- [ ] Marges : 0 mm
- [ ] Aperçu correct
- [ ] Clic sur Imprimer

### ✅ Après l'Impression

- [ ] Étiquette imprimée sans erreur
- [ ] Dimensions correctes (10x15 cm)
- [ ] Code-barres scannable
- [ ] Texte lisible
- [ ] Bordures nettes
- [ ] Pas de zones blanches excessives

---

## 🚀 Résultat Final Attendu

```
┌─────────────────────────────────────────┐
│  [Étiquette 10x15 cm imprimée]          │
│                                         │
│  ✅ Dimensions : Exactement 10 x 15 cm  │
│  ✅ Qualité : Nette et professionnelle  │
│  ✅ Code-barres : Scannable             │
│  ✅ Texte : Lisible et bien aligné      │
│  ✅ Bordures : Présentes et droites     │
│  ✅ Temps d'impression : 2-3 secondes   │
│                                         │
│  → Prêt à coller sur le colis ! 📦      │
└─────────────────────────────────────────┘
```

---

## 🆘 Support

### Si Ça Ne Fonctionne Toujours Pas

1. **Vérifier le modèle exact** de votre imprimante
2. **Télécharger** le pilote le plus récent
3. **Désinstaller** complètement l'ancien pilote
4. **Redémarrer** l'ordinateur
5. **Réinstaller** le nouveau pilote
6. **Reconfigurer** le format 10x15 cm
7. **Tester** à nouveau

### Ressources Utiles

- **Zebra Support** : https://www.zebra.com/support
- **Brother Support** : https://support.brother.com
- **DYMO Support** : https://www.dymo.com/support

### Contact Fabricant

Si problème persistant, contacter le support du fabricant avec :
- Modèle exact de l'imprimante
- Version du pilote installé
- Version de Windows
- Description du problème
- Captures d'écran

---

**Date de création** : 19 Octobre 2025  
**Imprimante cible** : Thermique 10x15 cm  
**Status** : ✅ GUIDE COMPLET
