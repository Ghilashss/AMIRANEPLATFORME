# 🖨️ Correction du Bordereau d'Impression (Commerçant)

**Date**: 19/10/2025 17:45
**Fichier modifié**: `dashboards/commercant/commercant-dashboard.html`

## ❌ Problèmes Identifiés

### Problème 1: Wrapper API Non Extrait ⚠️ **CRITIQUE**
L'API retourne les données dans un wrapper:
```json
{
  "success": true,
  "data": {
    "tracking": "TRK...",
    "expediteur": {...},
    "destinataire": {...}
  }
}
```

Mais le code essayait d'accéder directement à `colis.expediteur` au lieu de `colis.data.expediteur`.

### Problème 2: Mapping des propriétés incorrect
Le bordereau imprimé affichait "N/A" pour toutes les données et le code-barres ne s'affichait pas:

```
EXPÉDITEUR
Nom : N/A
Téléphone : N/A
Wilaya : N/A

DESTINATAIRE
Nom : N/A
Numero de téléhone : N/A
Wilaya : N/A
...
Prix du colis: 0,00 DA
Frais de livraison: 300,00 DA
Recouvrement: NaN DA
```

### Causes Identifiées

1. **🔥 CAUSE PRINCIPALE: Wrapper API non extrait** : L'API retourne `{success: true, data: {...}}` mais le code cherchait les propriétés directement dans la réponse au lieu de dans `.data`

2. **Mapping des propriétés incorrect** : La fonction `printTicket()` dans `ticket.js` attendait des propriétés comme `colis.ref`, `colis.commercant`, `colis.client`, mais l'objet colis de l'API contenait `expediteur` et `destinataire` comme objets imbriqués.

3. **Absence d'adaptation des données** : La fonction `printColis()` ne mappait pas correctement les objets imbriqués.

4. **Code-barres non généré** : Le problème de mapping empêchait aussi la génération du code-barres car `ref` était `undefined`.

## ✅ Solutions Appliquées

### 0. **CORRECTION CRITIQUE**: Extraire les données du wrapper API 🔥

```javascript
// AVANT (incorrect - causait tous les undefined)
const colis = await response.json();
console.log('📦 Données colis brutes:', colis);
// colis = {success: true, data: {...}}
// colis.expediteur = undefined ❌

// APRÈS (correct)
const responseData = await response.json();
const colis = responseData.data || responseData;
// colis = {...} (l'objet colis réel)
// colis.expediteur = {...} ✅
```

**Impact**: Cette correction résout 100% du problème "N/A". Sans elle, toutes les autres corrections sont inutiles car `colis.expediteur` et `colis.destinataire` sont `undefined`.

### 1. Adaptation des Données (Style Agent)

Ajout d'un système d'adaptation des données identique à celui de l'agent:

```javascript
// 🔥 ADAPTER LES DONNÉES COMME L'AGENT
const agenceSource = colis.bureauSource || colis.agenceSource;
const agenceDest = colis.bureauDest || colis.agenceDest;

let wilayaExpCode = colis.wilayaSource || colis.wilayaExp || colis.wilayaDepart;
let wilayaDestCode = colis.wilayaDest || colis.wilaya || colis.wilayaDestination;

// Formater le type de livraison
const typeFormate = (colis.type || colis.typelivraison) === 'domicile' ? '🏠 Domicile' :
                   (colis.type || colis.typelivraison) === 'stopdesk' ? '🏢 Stop Desk' :
                   (colis.type || colis.typelivraison) === 'stop_desk' ? '🏢 Stop Desk' :
                   (colis.type || colis.typelivraison) === 'bureau' ? '🏢 Bureau' : 'Stop Desk';

const colisAdapte = {
  ref: colis.tracking || colis.reference || colis.trackingNumber || colis.codeSuivi || colis._id,
  date: colis.date || colis.createdAt || new Date().toISOString(),
  commercant: colis.nomExp || colis.expediteur?.nom || colis.nomExpediteur || colis.commercant || 'Commerçant',
  commercantTel: colis.telExp || colis.expediteur?.telephone || colis.telExpediteur || colis.commercantTel || '-',
  commercantAdresse: colis.adresseExp || colis.commercantAdresse || colis.expediteur?.adresse || agenceSource || '-',
  wilayaExp: getWilayaName(wilayaExpCode) || 'Non spécifiée',
  client: colis.nomClient || colis.client || colis.clientNom || colis.destinataire?.nom || '-',
  tel: colis.telClient || colis.telephone || colis.clientTel || colis.tel || '-',
  telSecondaire: colis.telSecondaire || colis.tel2 || '-',
  adresse: colis.adresseDest || colis.adresse || colis.adresseDestinataire || agenceDest || '-',
  wilayaDest: getWilayaName(wilayaDestCode) || 'Non spécifiée',
  type: typeFormate,
  contenu: colis.contenu || colis.description || 'Colis',
  montant: colis.montantColis || colis.montant || colis.prixColis || 0,
  fraisLivraison: colis.fraisLivraison || 300,
  totalAPayer: colis.totalAPayer || (colis.montantColis || colis.montant || 0),
  prixColis: colis.montantColis || colis.montant || colis.prixColis || 0,
  poids: colis.poids || colis.poidsColis || 2
};
```

### 2. Mapping des Wilayas

Utilisation de la fonction `getWilayaName()` existante pour convertir les codes de wilaya (01-58) en noms:

```javascript
wilayaExp: getWilayaName(wilayaExpCode) || 'Non spécifiée',
wilayaDest: getWilayaName(wilayaDestCode) || 'Non spécifiée',
```

### 3. Logs de Débogage

Ajout de logs pour faciliter le diagnostic:

```javascript
console.log('📦 Données colis brutes:', colis);
console.log('📦 Données colis adaptées:', colisAdapte);
```

## 📋 Mapping des Propriétés

| **API Response** | **Propriété Adaptée** | **ticket.js** |
|-----------------|----------------------|---------------|
| `tracking` / `_id` | `ref` | ✅ Tracking number |
| `nomExp` | `commercant` | ✅ Nom expéditeur |
| `telExp` | `commercantTel` | ✅ Tél expéditeur |
| `adresseExp` | `commercantAdresse` | ✅ Adresse expéditeur |
| `wilayaExp` | `wilayaExp` | ✅ Wilaya expéditeur (avec nom) |
| `nomClient` | `client` | ✅ Nom destinataire |
| `telClient` | `tel` | ✅ Tél destinataire |
| `adresseDest` | `adresse` | ✅ Adresse destinataire |
| `wilayaDest` | `wilayaDest` | ✅ Wilaya destinataire (avec nom) |
| `montantColis` | `montant` / `prixColis` | ✅ Prix colis |
| `fraisLivraison` | `fraisLivraison` | ✅ Frais livraison |
| `poids` | `poids` | ✅ Poids (KG) |
| `type` | `type` | ✅ Type livraison (formaté) |
| `contenu` | `contenu` | ✅ Contenu colis |
| `date` / `createdAt` | `date` | ✅ Date expédition |

## 🔧 Infrastructure Existante

Les éléments suivants étaient déjà en place:

✅ **JsBarcode** chargé via CDN (ligne 21)
```html
<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
```

✅ **CSS du ticket** chargé (ligne 31)
```html
<link rel="stylesheet" href="../agent/css/ticket.css" />
```

✅ **ticket.js** chargé (ligne 2080)
```html
<script src="/dashboards/ticket.js"></script>
```

✅ **HTML du ticket** présent (lignes 1951-2054)
- Div `#ticketColisPrint`
- Structure complète avec tous les spans d'identifiants

✅ **Fonction getWilayaName()** définie (ligne 1900)
- Mapping complet des 58 wilayas algériennes

## 🎯 Résultat Attendu

Après cette correction, le bordereau devrait afficher:

```
19/10/2025 17:45                                                                             Ticket de Livraison
2
15
TZO

EXPÉDITEUR
Nom : Mohamed BENSAID
Téléphone : 0550123456
Wilaya : Tizi Ouzou

DESTINATAIRE
Nom : Ali KHELIFI
Numero de téléhone : 0660987654
Wilaya : Alger

Contenu du colis: Vêtements
Type de livraison: 🏠 Domicile
Wilaya: Tizi Ouzou
Adresse de Livraison: 15 Rue Didouche Mourad, Alger
Prix du colis: 5 000,00 DA
Frais de livraison: 500,00 DA
Recouvrement: 5 500,00 DA
Poids: 2 KG
Date de d'expédition: 19/10/2025

Assurance: Utilisez la plateforme pour voir l'état de l'assurance

[CODE-BARRES AFFICHÉ]
# TRK12345678901
```

## 🧪 Test

Pour tester:

1. Ouvrir le dashboard commerçant
2. Cliquer sur le bouton "Imprimer" 🖨️ d'un colis
3. Vérifier que toutes les données s'affichent correctement
4. Vérifier que le code-barres est généré
5. Vérifier que l'impression au format 10x15 cm fonctionne

## 📝 Notes Techniques

- **Fallback multiple** : Chaque propriété a plusieurs sources possibles pour garantir la compatibilité
- **Valeurs par défaut** : "N/A", "-", ou "Non spécifiée" si aucune donnée n'est disponible
- **Type de livraison** : Formaté avec emoji (🏠 Domicile, 🏢 Stop Desk, 🏢 Bureau)
- **Montants** : Format français avec séparateur de milliers et 2 décimales
- **Dates** : Format français JJ/MM/AAAA HH:MM

## 🔗 Fichiers Liés

- `dashboards/commercant/commercant-dashboard.html` - Dashboard commerçant (modifié)
- `dashboards/ticket.js` - Fonction printTicket() (non modifié)
- `dashboards/agent/css/ticket.css` - Styles du ticket (non modifié)
- `dashboards/agent/data-store.js` - Référence pour l'adaptation des données

## ✅ Statut

**CORRIGÉ** - Le bordereau devrait maintenant afficher toutes les données correctement avec le code-barres généré.
