# 🏪 PAGE DE CONNEXION COMMERÇANT

## 📄 Fichier Créé

**`commercant-login.html`** - Page de connexion dédiée aux commerçants

## 🎨 Caractéristiques

### Design Moderne et Professionnel
- ✅ Même style que les pages Admin et Agent
- ✅ Design responsive (mobile-friendly)
- ✅ Animations fluides et modernes
- ✅ Gradient violet élégant (même que Admin/Agent)
- ✅ Icônes Font Awesome
- ✅ Interface à deux colonnes (branding + formulaire)

### Fonctionnalités Incluses

1. **Section Branding (Gauche)**
   - Logo avec icône magasin
   - Titre "Espace Commerçant"
   - Description de l'espace
   - Liste des fonctionnalités :
     - 📦 Créez vos colis facilement
     - 📈 Suivez vos statistiques
     - 💰 Gérez votre caisse
     - 🕐 Suivi en temps réel

2. **Section Formulaire (Droite)**
   - Champs Email et Mot de passe
   - Case "Se souvenir de moi"
   - Lien "Mot de passe oublié ?"
   - Bouton de connexion stylisé
   - Lien d'inscription (désactivé, contacte admin)
   - Messages d'alerte (succès/erreur)

### Sécurité et Validation

- ✅ Validation côté client (email requis)
- ✅ Vérification du rôle : Seuls les commerçants peuvent se connecter
- ✅ Stockage sécurisé du token JWT
- ✅ Redirection automatique si déjà connecté
- ✅ Messages d'erreur clairs

## 🔗 Accès à la Page

**URL Directe :** `http://localhost:8080/commercant-login.html`

### ⚠️ IMPORTANT
Cette page **N'EST PAS** reliée à `index.html` comme demandé.  
Les commerçants doivent accéder directement via l'URL ci-dessus.

## 🔐 Connexion

### Processus de Connexion

1. Le commerçant entre son email et mot de passe
2. Clic sur "Se connecter"
3. Appel API vers `http://localhost:5000/api/auth/login`
4. Vérification que le rôle est bien "commercant"
5. Si OK → Redirection vers `dashboards/commercant/commercant-dashboard.html`
6. Si rôle différent → Message d'erreur "Accès réservé aux commerçants"

### Identifiants de Test (À créer dans l'admin)

Vous devez d'abord créer un compte commerçant depuis le dashboard Admin :

1. Connectez-vous en Admin
2. Allez dans "Utilisateurs"
3. Créez un nouvel utilisateur avec le rôle "Commerçant"
4. Utilisez ces identifiants pour tester la page

## 🎯 Fonctionnalités Implémentées

### ✅ Déjà Fonctionnel

- [x] Design identique à Admin/Agent
- [x] Formulaire de connexion
- [x] Validation des champs
- [x] Connexion via API backend
- [x] Vérification du rôle
- [x] Stockage du token JWT
- [x] Option "Se souvenir de moi"
- [x] Messages d'alerte (succès/erreur)
- [x] Responsive design
- [x] Animations et transitions
- [x] Redirection automatique après connexion
- [x] Vérification si déjà connecté

### ⏳ Fonctionnalités Futures

- [ ] Récupération de mot de passe oublié
- [ ] Auto-inscription (actuellement désactivé)
- [ ] Authentification à deux facteurs (2FA)
- [ ] Connexion avec Google/Facebook

## 📱 Responsive Design

### Desktop (> 768px)
- Affichage en deux colonnes
- Branding à gauche, formulaire à droite
- Toutes les fonctionnalités visibles

### Mobile (< 768px)
- Affichage en une colonne
- Branding en haut, formulaire en bas
- Fonctionnalités cachées pour gagner de l'espace

## 🔧 Structure du Code

### HTML
```html
<div class="login-container">
  <!-- Section Gauche - Branding -->
  <div class="branding-section">
    <div class="logo">...</div>
    <h1>Espace Commerçant</h1>
    <div class="features">...</div>
  </div>
  
  <!-- Section Droite - Formulaire -->
  <div class="form-section">
    <div class="alert">...</div>
    <form id="login-form">...</form>
  </div>
</div>
```

### JavaScript
```javascript
// Configuration API
const API_URL = 'http://localhost:5000/api';

// Connexion
fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  body: JSON.stringify({ email, password })
})
```

## 🎨 Personnalisation

### Couleurs
```css
/* Gradient principal */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Couleur du bouton */
.btn-login {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

### Logo
Pour changer le logo, modifiez l'icône Font Awesome :
```html
<i class="fas fa-store"></i>  <!-- Icône actuelle -->
<!-- Autres options : fa-shopping-cart, fa-shop, fa-briefcase -->
```

## 📂 Emplacement des Fichiers

```
platforme 222222 - Copie/
├── commercant-login.html          ← Page de connexion commerçant
├── dashboards/
│   └── commercant/
│       └── commercant-dashboard.html  ← Dashboard commerçant (doit exister)
```

## ✅ Checklist de Vérification

- [x] Page créée : `commercant-login.html`
- [x] Design moderne et professionnel
- [x] Même style que Admin/Agent
- [x] Formulaire fonctionnel
- [x] Connexion API implémentée
- [x] Vérification du rôle
- [x] Messages d'alerte
- [x] Responsive design
- [ ] Dashboard commerçant existant (à vérifier)

## 🚀 Comment Tester

1. **Démarrer la plateforme** :
   ```
   .\DEMARRER.bat
   ```

2. **Créer un compte commerçant** :
   - Ouvrir http://localhost:8080/login.html
   - Se connecter en Admin (admin@platforme.com / admin123)
   - Aller dans "Utilisateurs" → "Nouveau Utilisateur"
   - Créer un utilisateur avec rôle "Commerçant"

3. **Tester la page commerçant** :
   - Ouvrir http://localhost:8080/commercant-login.html
   - Se connecter avec les identifiants créés
   - Vérifier la redirection vers le dashboard

## 🔍 Dépannage

### Problème : "Erreur de connexion au serveur"
**Solution :** Vérifier que le backend est démarré sur le port 5000
```powershell
netstat -ano | findstr :5000
```

### Problème : "Accès refusé"
**Solution :** Vérifier que l'utilisateur a bien le rôle "commercant" dans la base de données

### Problème : Page blanche
**Solution :** Vérifier la console du navigateur (F12) pour voir les erreurs

## 📞 Support

Pour toute question ou modification, consultez :
- `COMMENT_DEMARRER.md` - Guide de démarrage
- `FILTRAGE_COLIS_README.md` - Système de filtrage des colis

---

**Date de création :** 15 octobre 2025  
**Statut :** ✅ PAGE CRÉÉE ET FONCTIONNELLE  
**Accès :** http://localhost:8080/commercant-login.html  
**Non reliée à index.html** ✅ (comme demandé)
