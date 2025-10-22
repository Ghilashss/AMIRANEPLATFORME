# 🧪 Guide de Test - Section Caisse

## Prérequis

1. **Backend démarré** : `cd backend && npm start`
2. **MongoDB lancé**
3. **Un compte agent créé** dans la base de données
4. **Un compte admin créé** dans la base de données
5. **Quelques colis avec status "livre"** pour avoir un solde

## 📋 Tests Backend

### 1. Test de connexion

```bash
curl http://localhost:5000/
```

Résultat attendu: Message de bienvenue de l'API

### 2. Login Agent

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "agent@test.com",
    "password": "password123"
  }'
```

**Sauvegarder le token retourné** : `TOKEN_AGENT="eyJhbGc..."`

### 3. Login Admin

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "admin123"
  }'
```

**Sauvegarder le token retourné** : `TOKEN_ADMIN="eyJhbGc..."`

### 4. Test Agent - Solde de caisse

```bash
curl http://localhost:5000/api/caisse/solde \
  -H "Authorization: Bearer $TOKEN_AGENT"
```

Résultat attendu:
```json
{
  "success": true,
  "data": {
    "totalACollecter": 150000,
    "totalVerse": 100000,
    "totalEnAttente": 20000,
    "solde": 50000,
    "colisLivresCount": 15
  }
}
```

### 5. Test Agent - Créer un versement

```bash
curl -X POST http://localhost:5000/api/caisse/verser \
  -H "Authorization: Bearer $TOKEN_AGENT" \
  -H "Content-Type: application/json" \
  -d '{
    "montant": 30000,
    "methodePaiement": "especes",
    "description": "Versement test"
  }'
```

Résultat attendu:
```json
{
  "success": true,
  "data": {
    "numero": "TRX2410xxxxx",
    "type": "versement",
    "montant": 30000,
    "status": "en_attente",
    ...
  }
}
```

### 6. Test Agent - Historique

```bash
curl http://localhost:5000/api/caisse/historique \
  -H "Authorization: Bearer $TOKEN_AGENT"
```

### 7. Test Admin - Liste des versements

```bash
curl http://localhost:5000/api/caisse/versements \
  -H "Authorization: Bearer $TOKEN_ADMIN"
```

Résultat attendu:
```json
{
  "success": true,
  "count": 5,
  "stats": {
    "total": 5,
    "enAttente": 2,
    "valides": 3,
    "refuses": 0,
    "montantTotal": 250000,
    "montantEnAttente": 50000
  },
  "data": [...]
}
```

### 8. Test Admin - Versements en attente

```bash
curl http://localhost:5000/api/caisse/versements/en-attente \
  -H "Authorization: Bearer $TOKEN_ADMIN"
```

### 9. Test Admin - Valider un versement

```bash
curl -X PUT http://localhost:5000/api/caisse/versements/[ID_VERSEMENT]/valider \
  -H "Authorization: Bearer $TOKEN_ADMIN"
```

Résultat attendu:
```json
{
  "success": true,
  "message": "Versement validé avec succès",
  "data": {
    "status": "validee",
    ...
  }
}
```

### 10. Test Admin - Refuser un versement

```bash
curl -X PUT http://localhost:5000/api/caisse/versements/[ID_VERSEMENT]/refuser \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "motif": "Montant incorrect"
  }'
```

### 11. Test Admin - Caisse d'un agent

```bash
curl http://localhost:5000/api/caisse/agent/[ID_AGENT] \
  -H "Authorization: Bearer $TOKEN_ADMIN"
```

## 🖥️ Tests Frontend

### Test Agent Dashboard

1. **Ouvrir** : `dashboards/agent/agent-dashboard.html`
2. **Se connecter** avec un compte agent
3. **Naviguer** vers "Caisse agent" dans le menu

#### Tests à effectuer:

✅ **Affichage du solde**
- Les 4 cartes doivent afficher les montants corrects
- Le solde doit être = Total à collecter - Total versé

✅ **Bouton "Verser une somme"**
- Cliquer sur le bouton
- Le modal doit s'ouvrir
- Le montant max doit être pré-rempli avec le solde

✅ **Formulaire de versement**
- Remplir le montant (ex: 10000)
- Choisir une méthode de paiement
- Ajouter une référence (optionnel)
- Ajouter une description
- Cliquer sur "Confirmer"
- Le versement doit être créé
- Le tableau doit se mettre à jour

✅ **Filtres**
- Tester le filtre par période
- Tester le filtre par statut
- Le tableau doit se mettre à jour

✅ **Tableau historique**
- Doit afficher tous les versements
- Les badges de statut doivent être colorés
- Les montants doivent être formatés en DA

### Test Admin Dashboard

1. **Ouvrir** : `dashboards/admin/admin-dashboard.html`
2. **Se connecter** avec un compte admin
3. **Naviguer** vers "Caisse" dans le menu

#### Tests à effectuer:

✅ **Affichage des statistiques**
- Les 5 cartes doivent afficher les chiffres corrects
- Total versements, en attente, validés, montants

✅ **Liste des versements**
- Doit afficher tous les versements de tous les agents
- Nom de l'agent et de l'agence doivent s'afficher
- Les badges de statut doivent être corrects

✅ **Validation d'un versement**
- Trouver un versement "en attente"
- Cliquer sur "Valider"
- Confirmer l'action
- Le statut doit passer à "Validée"
- Les statistiques doivent se mettre à jour

✅ **Refus d'un versement**
- Trouver un versement "en attente"
- Cliquer sur "Refuser"
- Saisir un motif
- Le statut doit passer à "Refusée"

✅ **Filtres**
- Tester filtre par statut
- Tester filtre par agence
- Tester filtre par période
- Le tableau doit se mettre à jour

✅ **Voir la caisse d'un agent**
- Sélectionner un agent dans le dropdown
- Le modal doit s'ouvrir
- Afficher toutes les infos de l'agent
- Afficher les 4 cartes (à collecter, versé, attente, solde)
- Afficher l'historique des versements de l'agent

✅ **Bouton actualiser**
- Cliquer sur "Actualiser"
- La liste doit se recharger

## 🎯 Scénario complet de test

### Étape 1: Préparation des données

```javascript
// Dans MongoDB Compass ou mongosh
use platforme_livraison;

// Créer un agent
db.users.insertOne({
  nom: "Dupont",
  prenom: "Jean",
  email: "agent.test@example.com",
  password: "$2a$10$...", // Hash de "password123"
  role: "agent",
  agence: ObjectId("..."), // ID d'une agence existante
  telephone: "0123456789"
});

// Créer des colis livrés pour cet agent
db.colis.insertMany([
  {
    numeroSuivi: "COL001",
    status: "livre",
    montant: 5000,
    fraisLivraison: 500,
    agence: ObjectId("..."), // Même agence que l'agent
    // ... autres champs
  },
  {
    numeroSuivi: "COL002",
    status: "livre",
    montant: 8000,
    fraisLivraison: 600,
    agence: ObjectId("..."),
    // ... autres champs
  }
]);
```

### Étape 2: Test du workflow complet

1. **Agent se connecte**
   - Login via l'interface
   - Naviguer vers "Caisse agent"
   
2. **Agent vérifie son solde**
   - Doit voir: 5500 + 8600 = 14100 DA à collecter
   - Total versé: 0 DA (première fois)
   - Solde: 14100 DA

3. **Agent fait un versement**
   - Clic sur "Verser une somme"
   - Montant: 10000 DA
   - Méthode: Espèces
   - Confirmer
   - Voir le versement avec statut "En attente"
   - Nouveau solde en attente: 10000 DA

4. **Admin se connecte**
   - Login via l'interface admin
   - Naviguer vers "Caisse"

5. **Admin voit le versement**
   - Dans la liste, voir le versement de l'agent
   - Statut: "En attente"
   - Badge orange

6. **Admin valide le versement**
   - Clic sur "Valider"
   - Confirmer
   - Statut passe à "Validée"
   - Badge vert

7. **Agent vérifie à nouveau**
   - Retourner sur le dashboard agent
   - Rafraîchir la caisse
   - Total versé: 10000 DA
   - Solde: 4100 DA
   - Versement avec badge vert "Validée"

8. **Agent fait un autre versement**
   - Montant: 4100 DA (tout le solde)
   - Confirmer

9. **Admin refuse ce versement**
   - Clic sur "Refuser"
   - Motif: "Vérification nécessaire"
   - Confirmer
   - Badge rouge "Refusée"

10. **Agent vérifie le refus**
    - Le versement apparaît en rouge
    - Le solde reste à 4100 DA
    - Peut créer un nouveau versement

## 🐛 Tests d'erreur

### Test 1: Versement supérieur au solde

```javascript
// Dans l'interface agent
// Si solde = 5000 DA
// Essayer de verser 10000 DA
// → Erreur: "Le montant ne peut pas dépasser le solde disponible"
```

### Test 2: Versement avec montant négatif

```javascript
// Montant: -1000
// → Erreur: "Veuillez entrer un montant valide"
```

### Test 3: Valider un versement déjà validé

```bash
# Essayer de valider 2 fois le même versement
# → Erreur: "Ce versement a déjà été traité"
```

### Test 4: Agent essayant d'accéder aux routes admin

```bash
curl http://localhost:5000/api/caisse/versements \
  -H "Authorization: Bearer $TOKEN_AGENT"
# → Erreur 403: Non autorisé
```

### Test 5: Admin essayant de créer un versement

```bash
curl -X POST http://localhost:5000/api/caisse/verser \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{"montant": 5000}'
# → Erreur 403: Non autorisé
```

## ✅ Checklist de validation

### Backend
- [ ] Route `/api/caisse/verser` fonctionne
- [ ] Route `/api/caisse/solde` fonctionne
- [ ] Route `/api/caisse/historique` fonctionne
- [ ] Route `/api/caisse/versements` fonctionne
- [ ] Route `/api/caisse/versements/en-attente` fonctionne
- [ ] Route `/api/caisse/versements/:id/valider` fonctionne
- [ ] Route `/api/caisse/versements/:id/refuser` fonctionne
- [ ] Route `/api/caisse/agent/:agentId` fonctionne
- [ ] Autorisation par rôle fonctionne
- [ ] Validation des données fonctionne

### Frontend Agent
- [ ] Navigation vers la page caisse
- [ ] Affichage des 4 cartes de solde
- [ ] Chargement de l'historique
- [ ] Ouverture du modal de versement
- [ ] Soumission du formulaire
- [ ] Filtrage par période
- [ ] Filtrage par statut
- [ ] Formatage des montants en DA
- [ ] Badges de statut colorés
- [ ] Responsive design

### Frontend Admin
- [ ] Navigation vers la page caisse
- [ ] Affichage des 5 cartes statistiques
- [ ] Chargement de la liste des versements
- [ ] Filtrage par statut
- [ ] Filtrage par agence
- [ ] Filtrage par période
- [ ] Validation d'un versement
- [ ] Refus d'un versement avec motif
- [ ] Sélection et affichage caisse agent
- [ ] Modal détails agent
- [ ] Bouton actualiser
- [ ] Formatage des montants
- [ ] Badges de statut

## 📊 Données de test recommandées

Pour tester efficacement, créer:

- **3 agents** avec différentes agences
- **15-20 colis livrés** répartis entre les agents
- **10 versements** avec différents statuts:
  - 3 en attente
  - 5 validés
  - 2 refusés
- **Différentes méthodes de paiement** (espèces, virement, carte, chèque)
- **Différentes périodes** (aujourd'hui, cette semaine, le mois dernier)

## 🎉 Succès!

Si tous les tests passent, la section caisse est complètement fonctionnelle et prête à être utilisée en production!
