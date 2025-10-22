# Section Colis - Dashboard Agence

## 📋 Vue d'ensemble

La section colis complète de l'admin a été copiée vers le dashboard de l'agence avec toutes les fonctionnalités suivantes :

## ✨ Fonctionnalités ajoutées

### 1. **Section Colis complète**
   - Statistiques en temps réel (Total colis, En transit, En attente, Retards)
   - Tableau moderne avec pagination
   - Filtres avancés (Date, Statut, Wilaya)
   - Recherche en temps réel
   - Actions sur les colis (Voir, Modifier, Supprimer)

### 2. **Formulaire de création de colis**
   - **Expéditeur** : Sélection du bureau source
   - **Type de livraison** : Domicile ou Bureau
   - **Détails du colis** : Poids, Prix, Description
   - **Destinataire** : Nom, Téléphones, Wilaya, Bureau destination
   - **Résumé des frais** : Calcul automatique des frais de livraison

### 3. **Import des wilayas et agences depuis l'Admin**
   ✅ Les wilayas ajoutées par l'admin sont automatiquement disponibles
   ✅ Les agences ajoutées par l'admin sont automatiquement disponibles
   ✅ Filtrage automatique des bureaux par wilaya sélectionnée

## 📁 Fichiers créés/modifiés

### Nouveaux fichiers CSS :
1. **`css/colis.css`** - Styles pour la section colis (tableau, stats, filtres)
2. **`css/colis-form.css`** - Styles pour le formulaire de création de colis

### Nouveaux fichiers JavaScript :
1. **`js/colis-form.js`** - Gestion du formulaire (validation, calcul frais, soumission)
2. **`js/colis-table.js`** - Gestion du tableau (affichage, filtres, recherche, actions)

### Fichier modifié :
- **`agence-dashboard.html`** - Ajout de la section colis complète

## 🔄 Flux de données

### 1. **Admin ajoute une Wilaya**
```
Admin Dashboard → Wilayas → Ajouter
     ↓
localStorage['wilayas']
     ↓
Agence Dashboard → Formulaire Colis → Wilaya (Chargement automatique)
```

### 2. **Admin ajoute une Agence**
```
Admin Dashboard → Agences → Ajouter
     ↓
localStorage['agences']
     ↓
Agence Dashboard → Formulaire Colis → Bureau source/destination (Chargement automatique)
```

### 3. **Agence crée un Colis**
```
Agence Dashboard → Colis → Nouveau Colis
     ↓
Formulaire avec Wilayas et Agences depuis Admin
     ↓
localStorage['colis']
     ↓
Affichage dans le tableau des colis
```

## 💾 Structure des données

### Wilayas (localStorage)
```javascript
{
  id: "timestamp",
  code: "16",
  nom: "Alger",
  designation: "Wilaya d'Alger",
  zone: "centre",
  email: "alger@contact.dz",
  status: "active"
}
```

### Agences (localStorage)
```javascript
{
  id: "timestamp",
  code: "AG2410-16-123",
  nom: "Agence Alger Centre",
  wilaya: "16",
  wilayaText: "Alger",
  email: "agence@mail.com",
  telephone: "0555123456",
  status: "active"
}
```

### Colis (localStorage)
```javascript
{
  id: "timestamp",
  reference: "COL12345678",
  bureauSource: "agence_id",
  typeLivraison: "domicile",
  poids: "1.5",
  prixColis: "5000",
  description: "Description du colis",
  clientNom: "Ahmed Mohamed",
  clientTel: "0555123456",
  telSecondaire: "0666123456",
  wilaya: "16",
  bureauDest: "bureau_id",
  fraisLivraison: 500,
  statut: "en_attente",
  date: "2025-10-13T..."
}
```

## 🎨 Design

### Styles appliqués :
- ✅ Design moderne et responsive
- ✅ Cartes de statistiques avec icônes
- ✅ Tableau avec hover effects
- ✅ Formulaire en 2 colonnes
- ✅ Badges de statut colorés
- ✅ Boutons d'action avec icônes
- ✅ Modal avec animation fadeIn

### Couleurs :
- **Succès** : #28a745 (Vert)
- **Info** : #17a2b8 (Bleu clair)
- **Avertissement** : #ffc107 (Jaune)
- **Danger** : #dc3545 (Rouge)
- **Primary** : #1976D2 (Bleu)

## 🔧 Fonctions principales

### colis-form.js
- `loadWilayas()` - Charge les wilayas depuis localStorage
- `loadBureaux(wilayaCode)` - Charge les bureaux/agences depuis localStorage
- `calculateFraisLivraison()` - Calcule les frais automatiquement
- `updateFraisResume()` - Met à jour le résumé des frais
- `openColisModal()` / `closeColisModal()` - Gestion du modal

### colis-table.js
- `loadColisTable()` - Charge et affiche les colis
- `updateColisStats()` - Met à jour les statistiques
- `viewColis(id)` - Affiche les détails d'un colis
- `editColis(id)` - Édite un colis
- `deleteColis(id)` - Supprime un colis
- `setupColisSearch()` - Configure la recherche
- `setupColisFilters()` - Configure les filtres

## 📱 Navigation

Dans le menu latéral de l'agence :
```
Dashboard
├── Colis ⭐ (NOUVEAU)
├── Bureaux
├── Commerçant
├── Caisse
├── Réclamation
├── Gestion des utilisateurs
└── Déconnexion
```

## ✅ Tests recommandés

1. **Admin** : Ajouter des wilayas et agences
2. **Agence** : Vérifier que les wilayas et agences apparaissent dans le formulaire
3. **Agence** : Créer un colis
4. **Agence** : Vérifier l'affichage dans le tableau
5. **Agence** : Tester les filtres et la recherche
6. **Agence** : Tester les actions (Voir, Modifier, Supprimer)

## 🚀 Utilisation

1. Accédez au dashboard de l'agence
2. Cliquez sur "Colis" dans le menu latéral
3. Cliquez sur "Nouveau Colis"
4. Remplissez le formulaire :
   - Sélectionnez un bureau source
   - Choisissez le type de livraison
   - Entrez les détails du colis
   - Sélectionnez une wilaya (les wilayas de l'admin s'affichent)
   - Sélectionnez un bureau destination (les agences de la wilaya s'affichent)
5. Les frais se calculent automatiquement
6. Cliquez sur "Créer le colis"

## 📝 Notes importantes

- Les wilayas et agences doivent être ajoutées par l'admin en premier
- Les données sont stockées dans localStorage
- Le calcul des frais est basique et peut être personnalisé
- Les filtres fonctionnent en temps réel
- La recherche est insensible à la casse

## 🔐 Sécurité

- Validation côté client des champs obligatoires
- Vérification de l'existence des wilayas et agences
- Génération automatique des références uniques
- Protection contre les doublons

## 🎯 Prochaines améliorations possibles

- [ ] Édition complète des colis
- [ ] Export PDF/Excel
- [ ] Import en masse
- [ ] Notifications en temps réel
- [ ] Historique des modifications
- [ ] Code QR pour chaque colis
- [ ] Suivi de livraison en temps réel
- [ ] Intégration avec une API backend
