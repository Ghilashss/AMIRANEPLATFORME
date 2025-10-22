## 🎨 NOUVEAU FORMULAIRE COLIS - SPÉCIFICATIONS COMPLÈTES

### 📋 Structure du Formulaire

#### **Colonne Gauche : Expéditeur**

**Section 1 : Informations Expéditeur**
```
- Nom expéditeur (input text) *
- Téléphone expéditeur (input tel) *
```

**Section 2 : Localisation Expéditeur**
```
- Wilaya expéditeur (select) *
  → Chargé depuis API /api/frais-livraison
  → Admin: Peut sélectionner
  → Agent/Commerçant: Auto-rempli + disabled
  
- Bureau expéditeur (select) *
  → Bureaux filtrés selon wilaya expéditeur
  → Chargé depuis API /api/agences?wilaya=XX
  → Admin: Peut sélectionner
  → Agent/Commerçant: Auto-rempli + disabled
```

**Section 3 : Détails du Colis**
```
- Poids (kg) (input number) *
- Prix du colis (DA) (input number) *
- Type de colis (select) *
  Options:
  - Standard
  - Fragile
  - Périssable
  - Électronique
  - Documents
  - Autre
- Contenu du colis (input text) *
- Description détaillée (textarea)
```

#### **Colonne Droite : Destinataire**

**Section 4 : Informations Destinataire**
```
- Nom complet (input text) *
- Téléphone (input tel) *
- Téléphone secondaire (input tel)
```

**Section 5 : Localisation Destinataire**
```
- Wilaya destination (select) *
  → Chargé depuis API /api/frais-livraison
  
- Type de livraison (select) *
  Options:
  - Livraison au bureau
  - Livraison à domicile
  
- Bureau destination (select) [Affiché si type = bureau] *
  → Bureaux filtrés selon wilaya destinataire
  
- Adresse de livraison (textarea) [Affiché si type = domicile] *
```

**Section 6 : Résumé des Frais**
```
- Prix du colis: XXXX DA (calculé)
- Frais de livraison: XXXX DA (calculé depuis API)
  → Formule: 
    Si poids ≤ 5kg: tarif base
    Si poids > 5kg: tarif base + (poids - 5) × tarif par kg
- Total à payer: XXXX DA (calculé)
```

### 🎨 Design

**Couleurs**
- Primaire: #0b2b24 (vert foncé)
- Secondaire: #16a34a (vert)
- Fond sections: #f8f9fa
- Bordures: #e0e0e0

**Layout**
- 2 colonnes sur desktop
- 1 colonne sur mobile
- Sections avec titres + icônes
- Animations fadeInUp

### 📊 Tableau des Colis

**Colonnes**
1. Référence (tracking)
2. Date
3. Expéditeur (nom + wilaya)
4. Destinataire (nom + wilaya)
5. Type (Bureau/Domicile)
6. Poids
7. Montant
8. Frais
9. Total
10. Statut (badge coloré)
11. Actions (Voir/Modifier/Supprimer)

**Statuts avec Couleurs**
- 🟡 En attente (warning)
- 🔵 En transit (info)
- 🟢 Livré (success)
- 🔴 Retourné (danger)
- ⚫ Annulé (secondary)

### 🔄 Fonctionnalités

**Calcul Automatique**
- Frais de livraison mis à jour en temps réel
- Déclencheurs: changement de wilaya dest, type livraison, poids
- Source: API /api/frais-livraison

**Affichage Conditionnel**
- Bureau destination → visible si type = bureau
- Adresse livraison → visible si type = domicile

**Auto-remplissage**
- Agent: wilaya + bureau expéditeur depuis user.agence
- Commerçant: wilaya + bureau expéditeur depuis user.agence

**Filtrage Bureaux**
- Expéditeur: filtré par wilaya expéditeur
- Destinataire: filtré par wilaya destinataire

### 📁 Fichiers à Créer/Modifier

**Nouveau formulaire HTML** (inséré dans chaque dashboard)
```
dashboards/admin/admin-dashboard.html (modal #colisModal)
dashboards/agent/agent-dashboard.html (modal #colisModal)
dashboards/commercant/commercant-dashboard.html (modal #colisModal)
```

**CSS commun**
```
dashboards/shared/css/colis-form-v2.css
```

**JavaScript**
```
dashboards/shared/js/colis-form-handler.js
```

### ✅ Validation

**Champs requis**
- Tous les champs marqués * sont obligatoires
- Validation avant soumission
- Messages d'erreur clairs

**Format**
- Téléphone: 10 chiffres (0XXXXXXXXX)
- Poids: > 0
- Prix: > 0
- Wilaya: code valide
- Bureau: ID valide

### 🚀 Soumission

**Données envoyées à l'API**
```javascript
{
  // Expéditeur
  expediteur: {
    nom: string,
    telephone: string,
    wilaya: string,
    bureau: string (ID agence)
  },
  
  // Destinataire
  destinataire: {
    nom: string,
    telephone: string,
    telephoneSecondaire?: string,
    wilaya: string,
    adresse: string (bureau ID ou adresse texte)
  },
  
  // Colis
  poids: number,
  montant: number,
  typeColis: string,
  contenu: string,
  description?: string,
  typeLivraison: 'bureau' | 'domicile',
  
  // Financier
  fraisLivraison: number,
  totalAPayer: number,
  
  // Metadata
  createdBy: string (user ID),
  agence: string (agence ID),
  bureauSource: string (agence ID)
}
```

### 📝 Notes Importantes

1. **Wilayas** : Chargées depuis `/api/frais-livraison` (seulement celles configurées)
2. **Bureaux** : Chargés depuis `/api/agences` filtrés par wilaya
3. **Frais** : Calculés selon la configuration dans frais-livraison
4. **Auto-remplissage** : Via `/api/auth/me` pour récupérer l'agence de l'utilisateur
5. **Responsive** : Mobile-first design

