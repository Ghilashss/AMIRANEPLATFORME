# 🚀 QUICK START - Système Caisse COMPLET ✅

## ⚡ Installation en 3 étapes

### 1. Vérifier que le backend inclut la route caisse

Le fichier `/backend/server.js` doit contenir:
```javascript
app.use('/api/caisse', require('./routes/caisse'));
```

✅ **C'est déjà fait!**

### 2. Démarrer le serveur

```bash
cd backend
npm start
```

Vous devriez voir:
```
╔═══════════════════════════════════════════╗
║   🚀 Serveur démarré en mode development  ║
║   📡 Port: 5000                           ║
║   🌐 URL: http://localhost:5000           ║
╚═══════════════════════════════════════════╝
```

### 3. Ouvrir les dashboards

**Pour l'agent:**
- Ouvrir: `dashboards/agent/agent-dashboard.html`
- Se connecter avec un compte agent
- Cliquer sur "Caisse agent" dans le menu

**Pour l'admin:**
- Ouvrir: `dashboards/admin/admin-dashboard.html`
- Se connecter avec un compte admin
- Cliquer sur "Caisse" dans le menu

## 🎯 Test Rapide (5 minutes)

### Créer des données de test

Ouvrir MongoDB Compass et exécuter:

```javascript
// 1. Créer un agent test
use platforme_livraison;

db.users.insertOne({
  nom: "Test",
  prenom: "Agent",
  email: "agent.test@mail.com",
  password: "$2a$10$YourHashedPasswordHere", // Hash de votre mot de passe
  role: "agent",
  agence: ObjectId("your-agence-id"), // Remplacer par un ID d'agence existant
  telephone: "0555123456",
  createdAt: new Date()
});

// 2. Créer quelques colis livrés
db.colis.insertMany([
  {
    numeroSuivi: "TEST001",
    status: "livre",
    montant: 5000,
    fraisLivraison: 500,
    agence: ObjectId("your-agence-id"), // Même agence que l'agent
    destinataire: {
      nom: "Client Test",
      telephone: "0666123456",
      adresse: "Alger"
    },
    createdAt: new Date()
  },
  {
    numeroSuivi: "TEST002",
    status: "livre",
    montant: 8000,
    fraisLivraison: 700,
    agence: ObjectId("your-agence-id"),
    destinataire: {
      nom: "Client Test 2",
      telephone: "0777123456",
      adresse: "Oran"
    },
    createdAt: new Date()
  }
]);
```

### Tester le workflow

#### Côté Agent:

1. **Se connecter** avec `agent.test@mail.com`
2. **Aller sur "Caisse agent"**
3. **Vérifier le solde** → Devrait afficher 14200 DA (5500 + 8700)
4. **Cliquer sur "Verser une somme"**
5. **Remplir:**
   - Montant: 10000
   - Méthode: Espèces
   - Description: "Premier versement test"
6. **Confirmer** → Le versement apparaît avec badge "En attente"

#### Côté Admin:

1. **Se connecter** avec un compte admin
2. **Aller sur "Caisse"**
3. **Voir le versement** de l'agent test
4. **Cliquer sur "Valider"**
5. **Confirmer** → Le badge devient "Validée" (vert)

#### Retour côté Agent:

1. **Rafraîchir** la page caisse
2. **Vérifier:**
   - Total versé: 10000 DA ✅
   - Solde actuel: 4200 DA ✅
   - Le versement a un badge vert ✅

## 🎉 C'est tout!

La section caisse fonctionne!

## 🔧 En cas de problème

### Le serveur ne démarre pas
```bash
# Vérifier que MongoDB est lancé
mongod --version

# Vérifier les dépendances
cd backend
npm install
```

### Erreur 404 sur les routes caisse
- Vérifier que `app.use('/api/caisse', ...)` est dans server.js
- Redémarrer le serveur

### Les données ne s'affichent pas
- Ouvrir la console du navigateur (F12)
- Vérifier les erreurs JavaScript
- Vérifier que le token est valide (se reconnecter)

### Le solde est à 0
- Créer des colis avec status "livre"
- Vérifier que l'agence correspond

## 📚 Documentation Complète

- **Guide complet**: `CAISSE_DOCUMENTATION.md`
- **Guide de test**: `CAISSE_TESTS.md`
- **Résumé**: `CAISSE_RESUME.md`

## 💡 Astuces

### Réinitialiser les tests
```javascript
// Supprimer tous les versements de test
db.transactions.deleteMany({ type: "versement" });

// Supprimer les colis de test
db.colis.deleteMany({ numeroSuivi: /^TEST/ });
```

### Voir les logs du serveur
```bash
# Dans le terminal du serveur
# Les logs s'affichent automatiquement
```

### Déboguer le frontend
```javascript
// Dans la console du navigateur
console.log(window.caisseManager); // Admin
console.log(CaisseManager); // Agent
```

## ✅ Checklist de vérification

- [ ] MongoDB lancé
- [ ] Backend démarré (port 5000)
- [ ] Agent créé dans la DB
- [ ] Colis livrés créés
- [ ] Agent dashboard ouvert
- [ ] Admin dashboard ouvert
- [ ] Section caisse visible dans les menus
- [ ] Les données s'affichent

## 🎓 Prochaines étapes

Une fois la section caisse maîtrisée, vous pouvez:

1. **Personnaliser** les méthodes de paiement
2. **Ajouter** des notifications par email
3. **Créer** des rapports Excel
4. **Implémenter** des graphiques
5. **Configurer** des alertes automatiques

---

**Besoin d'aide?** Consultez les documentations complètes! 🚀
