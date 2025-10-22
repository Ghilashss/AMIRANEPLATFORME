# 🎫 Système de Ticket de Livraison - FREEDLIV

## ✅ Installation Complète

Le système de ticket a été ajouté avec succès aux dashboards suivants :
- ✅ **Dashboard Agent**
- ✅ **Dashboard Admin**

---

## 📁 Structure des Fichiers

```
dashboards/
├── ticket.js                           # Logique principale (partagée)
├── test-ticket-new.html                # Page de test
├── agent/
│   ├── agent-dashboard.html            # HTML avec ticket intégré
│   └── css/
│       └── ticket.css                  # Styles du ticket
└── admin/
    └── admin-dashboard.html            # HTML avec ticket intégré
```

---

## 🎨 Format du Ticket

Le ticket est basé sur le format **AMIRANE EXPRESS** avec les caractéristiques suivantes :

### Structure
1. **En-tête**
   - Date et heure en haut à gauche
   - Logo et nom de l'agence
   - Numéro "2" et wilaya en haut à droite

2. **Sections d'information**
   - Expéditeur (Nom, Téléphone, Wilaya)
   - Destinataire (Nom, Téléphone, Wilaya)
   - ID COLIS (centré)
   - Détails du colis (zone grisée)
   - Assurance

3. **Code-barres**
   - Code-barres CODE128
   - Référence en dessous

4. **Déclaration**
   - Texte en arabe (RTL)
   - Conditions générales

5. **Signature**
   - Date
   - Espace pour signature

---

## 🔧 Utilisation

### Dans le Dashboard Agent

Le ticket s'affiche automatiquement quand vous :
1. Cliquez sur le bouton **"Imprimer"** d'un colis
2. Utilisez l'action **"print"** sur un colis

### Dans le Dashboard Admin

Le ticket s'affiche automatiquement quand vous :
1. Cliquez sur le bouton **"Imprimer"** d'un colis
2. Utilisez l'action **"print"** depuis le tableau des colis

---

## 💻 Utilisation Programmatique

### Format des Données

```javascript
const colis = {
    ref: "FL-2025-001234",                // Référence unique
    date: "2025-10-13T10:30:00",          // Date ISO
    commercant: "Boutique Mode DZ",       // Nom expéditeur
    commercantTel: "0550 12 34 56",       // Téléphone expéditeur
    commercantAdresse: "Rue Didouche",    // Adresse expéditeur
    wilayaExp: "Alger",                   // Wilaya expéditeur
    client: "Ahmed Benali",               // Nom client
    tel: "0660 98 76 54",                 // Téléphone client
    adresse: "Cité 1000 logements",       // Adresse livraison
    wilayaDest: "Oran",                   // Wilaya destination
    type: "stop_desk",                    // Type de service
    contenu: "Vêtements",                 // Contenu
    montant: 5000,                        // Montant en DA
    fraisLivraison: 500,                  // Frais en DA
    poids: 2.5                            // Poids en kg
};
```

### Appeler le Ticket

```javascript
// Depuis n'importe où dans l'application
printTicket(colis);
```

---

## 🎯 Adaptation Automatique des Champs

Le système adapte automatiquement les noms de champs entre différents formats :

### Dashboard Admin
```javascript
{
    reference → ref
    trackingNumber → ref
    expediteur → commercant
    clientNom → client
    telephone → tel
    prixColis → montant
    // ... etc
}
```

Cette adaptation permet d'utiliser le même système de ticket partout, même si les noms de champs diffèrent.

---

## 🖨️ Paramètres d'Impression

### Format Recommandé
- **Papier** : A4 (21cm x 29.7cm)
- **Orientation** : Portrait
- **Marges** : 1cm
- **Échelle** : 100%

### Imprimantes Compatibles
- ✅ Imprimantes laser/jet d'encre A4
- ✅ Imprimantes thermiques A4
- ✅ PDF (via "Imprimer vers PDF")

---

## 🔧 Personnalisation

### Modifier les Couleurs

Dans `dashboards/agent/css/ticket.css` :

```css
/* En-tête */
.ticket-header h2 {
    color: #000; /* Couleur du nom de l'agence */
}

/* Zone grisée des détails */
.details-section {
    background: #f9f9f9;
    border-left: 3px solid #333;
}

/* Déclaration en arabe */
.declaration-ar {
    background: #f9f9f9;
    border: 1px solid #ccc;
}
```

### Modifier le Texte en Arabe

Dans `dashboards/admin/admin-dashboard.html` ou `agent/agent-dashboard.html` :

```html
<div class="declaration-ar">
    <p>Votre texte en arabe ici...</p>
</div>
```

### Ajouter un Logo Personnalisé

Remplacez le fichier `logo.png` dans le dossier principal ou modifiez le chemin :

```html
<img src="../logo.png" alt="Logo" class="header-logo"/>
```

---

## 🐛 Dépannage

### Le ticket ne s'affiche pas

1. **Vérifiez la console (F12)**
   ```javascript
   // Erreur : printTicket is not defined
   // Solution : Vérifiez que ticket.js est chargé
   ```

2. **Vérifiez le chargement des scripts**
   ```html
   <!-- Doit être présent dans le HTML -->
   <script src="../ticket.js"></script>
   <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
   ```

3. **Vérifiez le CSS**
   ```html
   <!-- Doit être présent dans le HTML -->
   <link rel="stylesheet" href="../agent/css/ticket.css" />
   ```

### Le code-barres ne s'affiche pas

```javascript
// Erreur : JsBarcode is not defined
// Solution : La bibliothèque JsBarcode n'est pas chargée
```

Ajoutez le script CDN :
```html
<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
```

### Les données ne s'affichent pas correctement

Vérifiez l'adaptation des champs dans `data-store.js` :

```javascript
const colisAdapte = {
    ref: colis.reference || colis.trackingNumber || colis.id,
    // ... vérifiez que tous les champs sont mappés correctement
};
```

### Le ticket ne s'imprime pas

1. **Désactivez le bloqueur de popup** dans votre navigateur
2. **Utilisez Ctrl+P** pour ouvrir manuellement le dialogue d'impression
3. **Vérifiez les paramètres d'impression** :
   - Format : A4
   - Orientation : Portrait
   - Couleur activée

---

## ✨ Fonctionnalités

### ✅ Complétées
- [x] Affichage du ticket style AMIRANE EXPRESS
- [x] Code-barres CODE128
- [x] Texte en arabe (RTL)
- [x] Adaptation automatique des champs
- [x] Impression A4
- [x] Design responsive
- [x] Intégration Admin
- [x] Intégration Agent

### 🎯 À Améliorer (Optionnel)
- [ ] Export PDF automatique
- [ ] Envoi par email
- [ ] QR Code (actuellement désactivé)
- [ ] Multi-langues (FR/AR/EN)
- [ ] Templates personnalisables par agence
- [ ] Impression thermique 10x15cm

---

## 📞 Support

Pour toute question :
- **Documentation** : Voir ce fichier
- **Test** : Ouvrir `dashboards/test-ticket-new.html`
- **Modifications** : Éditer `dashboards/ticket.js` et `dashboards/agent/css/ticket.css`

---

## 🔄 Historique des Versions

### Version 2.0 (Actuelle)
- Format AMIRANE EXPRESS
- Texte en arabe
- Code-barres CODE128
- Intégration complète Admin/Agent

### Version 1.0 (Précédente)
- Format A6
- QR Code
- Style basique

---

**Développé pour** : FreeDeLiv Platform  
**Date** : Octobre 2025  
**Format** : AMIRANE EXPRESS Compatible
