# 🚀 DÉPLOIEMENT BACKEND SUR RENDER.COM

## ✅ AVANTAGES DE RENDER.COM
- **100% GRATUIT** pour toujours
- **750 heures/mois** (largement suffisant)
- **Déploiement automatique** depuis GitHub
- **Variables d'environnement** faciles à configurer
- **SSL/HTTPS gratuit**
- ⚠️ Seul inconvénient: se met en veille après 15 min d'inactivité (redémarre en ~30 secondes)

---

## 📋 ÉTAPES DE DÉPLOIEMENT

### ÉTAPE 1: Créer un compte Render.com

1. Va sur: **https://render.com**
2. Clique sur **"Get Started"** ou **"Sign Up"**
3. Choisis **"Sign up with GitHub"** (le plus simple)
4. Autorise Render à accéder à ton compte GitHub
5. ✅ Compte créé !

---

### ÉTAPE 2: Créer un Web Service

1. Une fois connecté, clique sur **"New +"** (en haut à droite)
2. Sélectionne **"Web Service"**
3. Tu verras la liste de tes repos GitHub
4. **Connecte ton repo**: `Ghilashss/AMIRANEPLATFORME`
   - Si tu ne le vois pas, clique sur "Configure account" et autorise Render à accéder à ce repo
5. Clique sur **"Connect"** à côté de AMIRANEPLATFORME

---

### ÉTAPE 3: Configuration du Service

Render va te demander plusieurs infos. Voici ce que tu dois mettre:

#### 📌 Informations de base:

| Champ | Valeur à mettre |
|-------|-----------------|
| **Name** | `platforme-backend` (ou ce que tu veux) |
| **Region** | `Frankfurt (EU Central)` (le plus proche de l'Algérie) |
| **Branch** | `main` |
| **Root Directory** | **LAISSE VIDE** (ton code est déjà à la racine) |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

#### 📌 Plan:

- Sélectionne **"Free"** (0$/mois)

---

### ÉTAPE 4: Variables d'environnement

**TRÈS IMPORTANT !** Avant de déployer, ajoute les variables d'environnement:

1. Descends jusqu'à la section **"Environment Variables"**
2. Clique sur **"Add Environment Variable"**
3. Ajoute ces 5 variables **UNE PAR UNE**:

```
NODE_ENV = production
```

```
PORT = 1000
```

```
MONGODB_URI = mongodb+srv://amiraneplatforme_db_user:GHIhss2002*@platforme-colis.ssiwvcm.mongodb.net/
```

```
JWT_SECRET = [Je vais te générer une clé secrète sécurisée]
```

```
CORS_ORIGIN = https://ton-domaine-hostinger.com
```

⚠️ **ATTENTION**: Pour `CORS_ORIGIN`, mets ton vrai domaine Hostinger quand tu l'auras. Pour l'instant, tu peux mettre `*` (accepte toutes les origines) mais c'est moins sécurisé.

---

### ÉTAPE 5: Déployer !

1. Une fois toutes les variables ajoutées, clique sur **"Create Web Service"**
2. Render va:
   - Cloner ton repo GitHub
   - Installer les dépendances (`npm install`)
   - Démarrer ton serveur (`npm start`)
3. **Attends 2-5 minutes** pendant le déploiement
4. ✅ Tu verras "Live" en vert quand c'est terminé !

---

## 🔗 RÉCUPÉRER L'URL DU BACKEND

Une fois déployé, Render te donne une URL automatique:

```
https://platforme-backend.onrender.com
```

**C'EST CETTE URL** que tu devras mettre dans `dashboards/config.js` !

---

## 🧪 TESTER LE BACKEND

### Test 1: Vérifier que le serveur répond

Ouvre ton navigateur et va sur:
```
https://platforme-backend.onrender.com/
```

Tu devrais voir:
```json
{"message": "API Plateforme Colis"}
```

### Test 2: Tester la connexion MongoDB

Va sur:
```
https://platforme-backend.onrender.com/api/agences
```

Si ça retourne un tableau JSON (même vide `[]`), c'est que MongoDB fonctionne !

---

## 🔧 DÉPANNAGE

### Problème 1: "Application failed to respond"

**Cause**: Le port n'est pas correct

**Solution**: 
1. Va dans les Settings du service Render
2. Vérifie que `PORT = 1000` est bien dans les variables d'environnement
3. Redéploie (onglet "Manual Deploy" → "Deploy latest commit")

---

### Problème 2: "Cannot connect to MongoDB"

**Cause**: L'IP de Render n'est pas autorisée sur MongoDB Atlas

**Solution**:
1. Va sur MongoDB Atlas → Network Access
2. Clique sur "Add IP Address"
3. Sélectionne **"Allow access from anywhere"** (IP: `0.0.0.0/0`)
4. Confirme
5. Attends 1 minute et redéploie sur Render

---

### Problème 3: Le serveur se met en veille

**Normal !** C'est le seul "défaut" de Render gratuit:
- Après **15 minutes sans requête**, le serveur se met en veille
- Au prochain accès, il redémarre en **~30 secondes**
- L'utilisateur verra juste un petit délai la première fois

**Solutions**:
1. **Accepter ce comportement** (gratuit)
2. **Payer 7$/mois** pour éviter le sleep (pas recommandé au début)
3. **Utiliser un service de ping** gratuit qui fait une requête toutes les 10 min (ex: UptimeRobot)

---

## 📝 PROCHAINE ÉTAPE

Une fois que tu as:
- ✅ Backend déployé sur Render
- ✅ URL du type `https://platforme-backend.onrender.com`
- ✅ Tests de connexion OK

**JE VAIS**:
1. Mettre à jour `dashboards/config.js` avec ton URL de production
2. T'expliquer comment uploader le frontend sur Hostinger
3. Faire les tests finaux

---

## 🎯 RÉSUMÉ RAPIDE

```
1. Aller sur render.com
2. Sign up with GitHub
3. New + → Web Service
4. Connecter repo: Ghilashss/AMIRANEPLATFORME
5. Name: platforme-backend
6. Runtime: Node
7. Build: npm install
8. Start: npm start
9. Ajouter 5 variables d'environnement
10. Create Web Service
11. Attendre 2-5 min
12. ✅ Récupérer l'URL !
```

---

**TU ES PRÊT ?** Va créer ton compte Render et dis-moi quand c'est fait ! 🚀
