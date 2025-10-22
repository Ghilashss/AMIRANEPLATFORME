# 📋 Frais de Livraison Dynamiques - Documentation

## 🎯 Objectif
Les frais de livraison dans le formulaire de création de colis du commerçant sont maintenant **importés dynamiquement** depuis la configuration de l'administrateur, au lieu d'être codés en dur.

## 🔄 Changements Effectués

### Avant
- Les frais étaient récupérés depuis les attributs `data-frais-bureau` et `data-frais-domicile` des options du select wilaya
- Valeurs statiques chargées une seule fois au démarrage
- Pas de synchronisation avec la configuration admin

### Après
- Les frais sont récupérés en temps réel via l'API `/api/frais-livraison/search`
- Paramètres: `wilayaSource` (wilaya du commerçant) et `wilayaDest` (wilaya sélectionnée)
- Calcul dynamique basé sur la configuration actuelle de l'admin

## 🔍 Fonctionnement

### 1. Structure de la Base de Données (FraisLivraison)
```javascript
{
  wilayaSource: String,        // Code de la wilaya source (ex: "16")
  wilayaDest: String,          // Code de la wilaya destination (ex: "25")
  fraisStopDesk: Number,       // Frais pour livraison au bureau
  fraisDomicile: Number,       // Frais pour livraison à domicile
  baseBureau: Number,          // Frais de base bureau (optionnel)
  parKgBureau: Number,         // Frais par kg bureau (optionnel)
  baseDomicile: Number,        // Frais de base domicile (optionnel)
  parKgDomicile: Number        // Frais par kg domicile (optionnel)
}
```

### 2. API Endpoint
**GET** `/api/frais-livraison/search?wilayaSource=XX&wilayaDest=YY`

**Réponse Succès (200):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "wilayaSource": "16",
    "wilayaDest": "25",
    "fraisStopDesk": 400,
    "fraisDomicile": 600,
    "baseBureau": 300,
    "parKgBureau": 50,
    "baseDomicile": 500,
    "parKgDomicile": 100
  }
}
```

**Réponse Non Trouvé (404):**
```json
{
  "success": false,
  "message": "Frais de livraison non configuré pour cette combinaison"
}
```

### 3. Fonction `calculerFrais()` Mise à Jour

#### Fichier: `dashboards/commercant/commercant-dashboard.html`

**Logique:**
1. Récupère le prix du colis et la wilaya de destination
2. Lit la wilaya source depuis `localStorage` (utilisateur connecté)
3. Appelle l'API avec `wilayaSource` et `wilayaDest`
4. Applique le bon frais selon le type de livraison:
   - `bureau` → utilise `fraisStopDesk`
   - `domicile` → utilise `fraisDomicile`
5. Calcule le total: `prixColis + fraisLivraison`
6. Met à jour l'affichage en temps réel

**Gestion des Erreurs:**
- Si l'API retourne 404 (frais non configuré) → frais = 0 DA
- Si erreur réseau → frais = 0 DA, affiche le prix du colis uniquement
- Si wilaya source manquante → frais = 0 DA, log warning

## 📝 Utilisation pour l'Administrateur

### Configuration des Frais
L'administrateur doit configurer les frais dans la section **"Frais de Livraison"** du dashboard admin:

1. Sélectionner **Wilaya Source** (wilaya du commerçant/agence)
2. Sélectionner **Wilaya Destination** (wilaya de livraison)
3. Définir:
   - **Frais Stop Desk**: montant pour livraison au bureau
   - **Frais Domicile**: montant pour livraison à domicile
4. Sauvegarder la configuration

### Impact Immédiat
Dès qu'un frais est configuré ou modifié par l'admin, il est **immédiatement appliqué** lors du calcul dans le formulaire commerçant.

## ✅ Avantages

1. **Centralisation**: Une seule source de vérité pour les frais
2. **Temps réel**: Les modifications admin sont appliquées instantanément
3. **Flexibilité**: L'admin peut ajuster les frais sans modifier le code
4. **Traçabilité**: Tous les frais sont stockés en base de données
5. **Évolutivité**: Possibilité d'ajouter des règles complexes (poids, zones, etc.)

## 🔧 Tests à Effectuer

### Test 1: Frais Configurés
1. Connectez-vous en tant qu'admin
2. Configurez des frais pour une combinaison wilaya source/destination
3. Connectez-vous en tant que commerçant (avec la même wilaya source)
4. Créez un colis avec la wilaya destination configurée
5. **Vérification**: Les frais affichés correspondent à ceux configurés

### Test 2: Frais Non Configurés
1. Connectez-vous en tant que commerçant
2. Sélectionnez une wilaya destination sans frais configurés
3. **Vérification**: Frais = 0 DA (pas d'erreur affichée)

### Test 3: Changement Type Livraison
1. Créez un colis
2. Sélectionnez une wilaya destination
3. Changez le type de livraison (Bureau ↔ Domicile)
4. **Vérification**: Les frais se mettent à jour automatiquement

### Test 4: Modification Admin en Temps Réel
1. Admin modifie les frais d'une combinaison
2. Commerçant (déjà connecté) change la wilaya ou le type
3. **Vérification**: Les nouveaux frais sont appliqués

## 📌 Notes Techniques

### Dépendances
- **Backend**: `/api/frais-livraison/search` endpoint
- **Model**: `FraisLivraison` (MongoDB)
- **Controller**: `fraisLivraisonController.js`
- **User**: Doit avoir le champ `wilaya` rempli

### Logs Console
La fonction affiche des logs pour le débogage:
```
💰 Recherche frais: {wilayaSource, wilayaDest, typeLivraison}
📦 Frais récupérés: {data}
✅ Calcul final: {prix, frais, type, total}
```

### Performance
- Requête API à chaque changement de wilaya ou type de livraison
- Calcul instantané (< 100ms généralement)
- Pas de cache côté client (toujours les frais les plus récents)

## 🚀 Évolutions Possibles

1. **Cache Local**: Stocker temporairement les frais récupérés
2. **Calcul par Poids**: Utiliser `baseBureau`/`baseDomicile` + `parKgBureau`/`parKgDomicile`
3. **Zones Tarifaires**: Grouper les wilayas en zones pour simplifier la config
4. **Promotions**: Appliquer des réductions temporaires sur certaines routes
5. **Affichage Tableau**: Montrer une grille de tous les frais disponibles

## 📞 Support

En cas de problème:
1. Vérifier que le backend est lancé (port 1000)
2. Vérifier que l'utilisateur a un champ `wilaya` rempli
3. Vérifier que les frais sont configurés dans le dashboard admin
4. Consulter la console du navigateur pour les logs détaillés

---
**Dernière mise à jour**: Décembre 2024  
**Version**: 1.0  
**Fichiers modifiés**: `dashboards/commercant/commercant-dashboard.html`
