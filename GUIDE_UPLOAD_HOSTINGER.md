# 📤 GUIDE UPLOAD FRONTEND SUR HOSTINGER

## ✅ CE QUI EST FAIT
- ✅ Backend déployé sur Render: `https://amiraneplatforme.onrender.com`
- ✅ MongoDB Atlas configuré et fonctionnel
- ✅ Frontend configuré avec l'URL backend de production
- ✅ Package `frontend-package.zip` créé et prêt

---

## 🎯 MAINTENANT: UPLOAD SUR HOSTINGER

### ÉTAPE 1: Connexion à Hostinger

1. Va sur: **https://www.hostinger.com**
2. Connecte-toi à ton compte
3. Va dans **"Hosting"** → Sélectionne ton hébergement
4. Clique sur **"File Manager"** (Gestionnaire de fichiers)

---

### ÉTAPE 2: Préparer le dossier public_html

#### Option A: Si public_html est vide
- Tu peux uploader directement dedans ✅

#### Option B: Si public_html contient déjà des fichiers
- **SAUVEGARDE D'ABORD** (télécharge tout ce qui est dedans)
- Puis **supprime tout** ou **crée un sous-dossier**

💡 **Recommandation**: Mets tout dans `public_html/` directement pour que l'URL soit:
```
https://ton-domaine.com
```

Sinon si tu mets dans `public_html/platforme/`, l'URL sera:
```
https://ton-domaine.com/platforme/
```

---

### ÉTAPE 3: Upload du fichier ZIP

1. Dans le File Manager, va dans **`public_html/`**
2. Clique sur **"Upload Files"** (icône nuage ☁️)
3. Sélectionne **`frontend-package.zip`** depuis ton PC
4. Attends la fin de l'upload (barre de progression)
5. ✅ Upload terminé !

---

### ÉTAPE 4: Extraire l'archive

1. Dans le File Manager, **clic droit** sur `frontend-package.zip`
2. Sélectionne **"Extract"** (Extraire)
3. Confirme l'extraction
4. Attends quelques secondes
5. ✅ Tous les fichiers sont maintenant dans `public_html/`

**Tu devrais voir:**
```
public_html/
  ├── admin/
  ├── agent/
  ├── agence/
  ├── commercant/
  ├── config.js
  ├── .htaccess
  └── frontend-package.zip (tu peux le supprimer)
```

---

### ÉTAPE 5: Vérifier les permissions

1. Sélectionne **tous les fichiers** dans `public_html/`
2. Clic droit → **"Permissions"** ou **"Chmod"**
3. **Dossiers**: `755` (rwxr-xr-x)
4. **Fichiers**: `644` (rw-r--r--)
5. Coche **"Apply to subdirectories"**
6. ✅ Appliquer

---

### ÉTAPE 6: Activer SSL (HTTPS)

#### Via Hostinger Panel:

1. Retourne sur le dashboard Hostinger
2. Va dans **"SSL"** ou **"Advanced"** → **"SSL"**
3. Sélectionne ton domaine
4. Clique sur **"Install SSL"** ou **"Enable SSL"**
5. Hostinger va installer un certificat **Let's Encrypt gratuit**
6. Attends 5-10 minutes

#### Forcer HTTPS:

Le fichier `.htaccess` est déjà configuré pour forcer HTTPS ! 
Il contient:
```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

---

### ÉTAPE 7: Mettre à jour config.js avec ton vrai domaine

Une fois que tu connais ton domaine Hostinger, tu dois modifier `config.js`:

1. Dans le File Manager, ouvre **`public_html/config.js`**
2. Trouve la ligne:
```javascript
BASE_URL: 'https://ton-domaine-hostinger.com',
```
3. Remplace par ton vrai domaine, exemple:
```javascript
BASE_URL: 'https://plateforme-colis.com',
```
4. **Save** (Enregistrer)

---

## 🧪 TESTER LE SITE

### Test 1: Accès au site

Ouvre ton navigateur et va sur:
```
https://ton-domaine.com/admin/
```

Tu devrais voir la page de login admin ! ✅

### Test 2: Vérifier la console

1. Appuie sur **F12** (DevTools)
2. Va dans **Console**
3. Tu devrais voir:
```
╔══════════════════════════════════════╗
║  🌍 CONFIGURATION ENVIRONNEMENT      ║
╠══════════════════════════════════════╣
║  Environnement: production           ║
║  Hostname: ton-domaine.com           ║
║  API URL: https://amiraneplatforme.onrender.com/api ║
║  Base URL: https://ton-domaine.com   ║
╚══════════════════════════════════════╝
```

### Test 3: Tester le login

1. Essaie de te connecter avec un compte admin
2. Vérifie dans la console qu'il n'y a **pas d'erreurs CORS**
3. Si ça fonctionne → **BRAVO !** 🎉

---

## 🔧 DÉPANNAGE

### Problème 1: "Cannot GET /"

**Cause**: Le `.htaccess` ne fonctionne pas

**Solution**:
1. Vérifie que `.htaccess` est bien présent dans `public_html/`
2. Vérifie que le module Apache `mod_rewrite` est activé (normalement c'est automatique sur Hostinger)

---

### Problème 2: Erreur CORS

**Cause**: Le CORS_ORIGIN sur Render n'est pas correct

**Solution**:
1. Va sur Render.com → ton service
2. Environment → Modifie `CORS_ORIGIN`
3. Mets ton vrai domaine: `https://ton-domaine.com`
4. Save → Render va redéployer automatiquement

---

### Problème 3: "Mixed Content" (HTTP/HTTPS)

**Cause**: Certaines ressources sont chargées en HTTP au lieu de HTTPS

**Solution**:
- Le `.htaccess` force déjà HTTPS
- Vérifie que le certificat SSL est bien installé
- Attends 10 minutes après l'installation du SSL

---

### Problème 4: Page blanche

**Cause**: Erreur JavaScript

**Solution**:
1. Ouvre la console (F12)
2. Regarde les erreurs
3. Vérifie que `config.js` est bien inclus dans le HTML
4. Vérifie qu'il n'y a pas d'erreur 404 sur des fichiers CSS/JS

---

## 📋 CHECKLIST FINALE

Avant de dire que c'est terminé:

- [ ] Frontend uploadé sur Hostinger
- [ ] Archive extraite dans `public_html/`
- [ ] SSL activé (HTTPS)
- [ ] `config.js` modifié avec le vrai domaine
- [ ] Site accessible via `https://ton-domaine.com`
- [ ] Console affiche "Environnement: production"
- [ ] Pas d'erreurs CORS
- [ ] Login fonctionne
- [ ] API répond (test avec F12 → Network)

---

## 🎯 STRUCTURE FINALE

```
BACKEND (Render.com):
https://amiraneplatforme.onrender.com
├── /api/auth/login
├── /api/agences
├── /api/colis
└── ...

FRONTEND (Hostinger):
https://ton-domaine.com
├── /admin/
├── /agent/
├── /agence/
├── /commercant/
└── /config.js → API_URL: https://amiraneplatforme.onrender.com/api

DATABASE (MongoDB Atlas):
mongodb+srv://...@platforme-colis.ssiwvcm.mongodb.net/
```

---

## 🚀 C'EST PRESQUE FINI !

Une fois que tu as:
1. ✅ Uploadé sur Hostinger
2. ✅ Activé le SSL
3. ✅ Modifié `config.js` avec ton domaine
4. ✅ Testé le site

**TON APPLICATION EST EN PRODUCTION !** 🎉

---

**DIS-MOI QUAND C'EST FAIT ET DONNE-MOI TON DOMAINE !**
