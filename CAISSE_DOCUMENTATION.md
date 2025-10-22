# 💰 Section Caisse - Documentation Complète

## 📋 Vue d'ensemble

La section caisse permet une gestion complète des versements entre les agents et l'administration. Les agents peuvent verser des sommes collectées et l'administrateur peut valider ou refuser ces versements, ainsi que visualiser la caisse de chaque agent.

## 🏗️ Architecture

### Backend

#### 1. Routes (`/backend/routes/caisse.js`)
```
Routes Agent:
- POST /api/caisse/verser - Créer un versement
- GET /api/caisse/solde - Obtenir le solde de caisse
- GET /api/caisse/historique - Historique des versements

Routes Admin:
- GET /api/caisse/versements - Tous les versements
- GET /api/caisse/versements/en-attente - Versements en attente
- PUT /api/caisse/versements/:id/valider - Valider un versement
- PUT /api/caisse/versements/:id/refuser - Refuser un versement
- GET /api/caisse/agent/:agentId - Caisse d'un agent spécifique
```

#### 2. Contrôleur (`/backend/controllers/caisseController.js`)

**Fonctionnalités clés:**

- `verserSomme()` - Permet à un agent de créer un versement
  - Valide le montant
  - Crée une transaction avec statut "en_attente"
  - Enregistre la méthode de paiement et les références

- `getVersements()` - Récupère tous les versements avec filtres
  - Filtrage par statut, agence, date
  - Calcul des statistiques (total, en attente, validés, montants)

- `validerVersement()` - Valide un versement en attente
  - Change le statut à "validee"
  - Seuls les versements en attente peuvent être validés

- `refuserVersement()` - Refuse un versement
  - Change le statut à "annulee"
  - Ajoute un motif de refus

- `getSoldeCaisse()` - Calcule le solde d'un agent
  - Total à collecter (colis livrés)
  - Total versé (validé)
  - Total en attente
  - Solde = À collecter - Versé

- `getCaisseAgent()` - Détails complets de la caisse d'un agent
  - Toutes les informations financières
  - Historique des versements

#### 3. Modèle Transaction (`/backend/models/Transaction.js`)

Le modèle existant est utilisé avec le type "versement":
```javascript
{
  numero: String (généré auto),
  type: 'versement',
  montant: Number,
  utilisateur: ObjectId (agent),
  agence: ObjectId,
  methodePaiement: 'especes' | 'virement' | 'carte' | 'cheque',
  referencePaiement: String (optionnel),
  description: String,
  status: 'en_attente' | 'validee' | 'annulee'
}
```

### Frontend - Agent

#### 1. Interface (`/dashboards/agent/agent-dashboard.html`)

**Section: #caisse-agent**

- **Cartes de solde** (4 cartes):
  - Total à Collecter
  - Total Versé
  - En Attente
  - Solde Actuel

- **Tableau historique**:
  - N° Transaction
  - Date
  - Montant
  - Méthode de paiement
  - Statut
  - Référence/Notes

- **Modal de versement**:
  - Montant
  - Méthode de paiement
  - Référence
  - Description

- **Filtres**:
  - Période (tous, 7 jours, 30 jours, ce mois)
  - Statut (tous, en attente, validée, refusée)

#### 2. Manager (`/dashboards/agent/js/caisse-manager.js`)

**Méthodes principales:**

```javascript
init() - Initialise le gestionnaire
chargerSolde() - Charge et affiche le solde
afficherFormulaireVersement() - Ouvre le modal
soumettreVersement() - Envoie le versement au backend
chargerHistorique() - Charge l'historique avec filtres
```

**Workflow de versement:**
1. Agent clique sur "Verser une somme"
2. Modal s'ouvre avec le solde pré-rempli
3. Agent remplit le formulaire
4. Validation du montant (ne peut pas dépasser le solde)
5. Envoi à l'API
6. Versement créé avec statut "en_attente"
7. Rafraîchissement automatique

#### 3. Styles (`/dashboards/agent/css/caisse.css`)

- Cards avec animations au hover
- Table responsive
- Modal moderne
- Badges de statut colorés
- Design responsive

### Frontend - Admin

#### 1. Interface (`/dashboards/admin/admin-dashboard.html`)

**Section: #caisse**

- **Statistiques** (5 cartes):
  - Total Versements
  - En Attente
  - Validés
  - Montant Total
  - Montant En Attente

- **Filtres**:
  - Statut
  - Agence
  - Période
  - Sélection d'agent pour voir sa caisse

- **Tableau des versements**:
  - N° Transaction
  - Date
  - Agent (nom, prénom, email)
  - Agence (nom, ville)
  - Montant
  - Méthode
  - Statut
  - Actions (Valider/Refuser/Détails)

- **Modal caisse agent**:
  - Informations de l'agent
  - Statistiques financières
  - Historique des versements

#### 2. Manager (`/dashboards/admin/js/caisse-manager.js`)

**Méthodes principales:**

```javascript
init() - Initialise le gestionnaire
chargerVersements() - Charge tous les versements avec filtres
chargerAgents() - Charge la liste des agents
validerVersement(id) - Valide un versement
refuserVersement(id) - Refuse un versement avec motif
afficherCaisseAgent(agentId) - Affiche le détail d'une caisse
```

**Workflow de validation:**
1. Admin voit les versements en attente
2. Clique sur "Valider" ou "Refuser"
3. Pour refus, peut saisir un motif
4. Mise à jour instantanée du statut
5. Rafraîchissement de la liste

**Workflow visualisation caisse agent:**
1. Admin sélectionne un agent dans le dropdown
2. Modal s'ouvre avec tous les détails
3. Affiche: solde, à collecter, versé, en attente
4. Liste tous les versements de l'agent

#### 3. Styles (`/dashboards/admin/css/caisse.css`)

- Design cohérent avec le reste du dashboard
- Tables responsives
- Boutons d'action avec icônes
- Badges de statut
- Modal moderne

## 🔄 Flux de données

### Versement Agent → Admin

```
1. Agent crée un versement
   ↓
2. Transaction créée (status: en_attente)
   ↓
3. Agent voit "En Attente" dans son historique
   ↓
4. Admin voit le versement dans la liste
   ↓
5. Admin valide ou refuse
   ↓
6. Transaction mise à jour (status: validee/annulee)
   ↓
7. Solde de l'agent recalculé
   ↓
8. Les deux voient le nouveau statut
```

### Calcul du solde

```javascript
// Formule du solde agent:
solde = totalACollecter - totalVerse

// Où:
totalACollecter = somme(colis.montant + colis.fraisLivraison) 
                  pour tous les colis status="livre"
totalVerse = somme(transactions.montant) 
             pour toutes les transactions type="versement" 
             ET status="validee"
```

## 🚀 Installation et Configuration

### 1. Backend

Le backend est déjà configuré dans `server.js`. La route est ajoutée:

```javascript
app.use('/api/caisse', require('./routes/caisse'));
```

### 2. Frontend Agent

Le module est importé dans `agent-dashboard.html`:

```javascript
import { CaisseManager } from './js/caisse-manager.js';
CaisseManager.init();
```

### 3. Frontend Admin

Le module est importé dans `admin-dashboard.html`:

```html
<script type="module" src="./js/caisse-manager.js"></script>
```

Et dans `page-manager.js`, la caisse est initialisée lors de la navigation.

## 🎨 Personnalisation

### Méthodes de paiement

Modifier dans les deux fichiers caisse-manager.js:

```javascript
formatMethodePaiement(methode) {
    const methodes = {
        'especes': 'Espèces',
        'virement': 'Virement',
        'carte': 'Carte bancaire',
        'cheque': 'Chèque',
        // Ajouter ici
    };
    return methodes[methode] || methode;
}
```

### Périodes de filtrage

Modifier les options dans le HTML:

```html
<select id="filtre-periode-caisse">
    <option value="tous">Toutes les périodes</option>
    <option value="7jours">7 derniers jours</option>
    <!-- Ajouter ici -->
</select>
```

Et la logique dans caisse-manager.js:

```javascript
switch (filtrePeriode) {
    case '7jours':
        dateDebut.setDate(dateFin.getDate() - 7);
        break;
    // Ajouter ici
}
```

## 📊 Statistiques disponibles

### Pour l'agent:
- Total à collecter
- Total versé (validé)
- Total en attente de validation
- Solde actuel
- Nombre de colis livrés

### Pour l'admin:
- Total des versements
- Nombre en attente
- Nombre validés
- Nombre refusés
- Montant total validé
- Montant en attente de validation
- Par agence
- Par agent

## 🔐 Sécurité

- ✅ Authentification JWT requise
- ✅ Autorisation par rôle (agent/admin)
- ✅ Validation des montants côté serveur
- ✅ Impossibilité de verser plus que le solde
- ✅ Seuls les versements en attente peuvent être traités
- ✅ Traçabilité complète (dates, utilisateur, etc.)

## 🐛 Dépannage

### Agent ne peut pas verser

Vérifier:
1. Le token d'authentification est valide
2. L'utilisateur a le rôle "agent"
3. Le montant est positif et ne dépasse pas le solde
4. La connexion au backend est établie

### Admin ne voit pas les versements

Vérifier:
1. Le token d'authentification est valide
2. L'utilisateur a le rôle "admin"
3. La route `/api/caisse` est bien configurée dans server.js
4. Le CaisseManager est bien initialisé

### Solde incorrect

Vérifier:
1. Les colis ont bien le status "livre"
2. Les montants et frais de livraison sont corrects
3. Seuls les versements "validee" sont comptés
4. L'agence de l'agent correspond aux colis

## 📝 Tests

### Test côté agent:

```javascript
// 1. Test du chargement du solde
GET /api/caisse/solde

// 2. Test de création de versement
POST /api/caisse/verser
{
    "montant": 50000,
    "methodePaiement": "especes",
    "description": "Test"
}

// 3. Test de l'historique
GET /api/caisse/historique?status=en_attente
```

### Test côté admin:

```javascript
// 1. Test liste des versements
GET /api/caisse/versements

// 2. Test validation
PUT /api/caisse/versements/:id/valider

// 3. Test refus
PUT /api/caisse/versements/:id/refuser
{
    "motif": "Montant incorrect"
}

// 4. Test caisse agent
GET /api/caisse/agent/:agentId
```

## 🎯 Fonctionnalités futures possibles

- [ ] Notifications en temps réel (WebSocket)
- [ ] Export Excel des versements
- [ ] Graphiques de l'évolution de la caisse
- [ ] Rappels automatiques pour versement
- [ ] Versements planifiés
- [ ] Multi-devises
- [ ] Réconciliation bancaire automatique
- [ ] Génération de reçus PDF
- [ ] Historique des modifications
- [ ] Commentaires sur les versements
- [ ] Pièces jointes (justificatifs)

## 📞 Support

En cas de problème:
1. Vérifier la console du navigateur pour les erreurs
2. Vérifier les logs du serveur backend
3. Vérifier que MongoDB est bien lancé
4. Vérifier les données dans la collection `transactions`

## ✅ Checklist de déploiement

- [x] Backend routes configurées
- [x] Backend controller créé
- [x] Modèle Transaction utilisé
- [x] Frontend agent HTML créé
- [x] Frontend agent JS créé
- [x] Frontend agent CSS créé
- [x] Frontend admin HTML créé
- [x] Frontend admin JS créé
- [x] Frontend admin CSS créé
- [x] Imports ajoutés dans les dashboards
- [x] Page managers mis à jour
- [x] Navigation configurée

## 🎉 Conclusion

La section caisse est maintenant complètement fonctionnelle! Les agents peuvent verser leurs recettes et l'administration peut valider, refuser et suivre tous les versements en temps réel.
