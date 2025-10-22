# README - Déploiement rapide sur Hostinger + Railway

## Objectif
Déployer le frontend sur Hostinger et le backend sur Railway (ou VPS). Ce README regroupe toutes les commandes et étapes rapides.

---

## Prérequis
- Node.js installé localement
- Compte GitHub
- Compte Railway.app
- Compte MongoDB Atlas
- Compte Hostinger

---

## 1) Packager le frontend (fichiers à uploader sur Hostinger)

```powershell
# Depuis le répertoire racine du projet
.
# Crée une archive frontend-package.zip contenant le dossier dashboards/
.
./package-frontend.ps1 -Output frontend-package.zip
```

Puis upload `frontend-package.zip` via File Manager ou dézipper en local et uploader le contenu.

---

## 2) Pousser le backend sur GitHub

```powershell
cd backend
# si git pas initialisé
git init
git add .
git commit -m "initial backend"
# créer repo sur GitHub et remplacer URL
git remote add origin https://github.com/TON_USERNAME/platforme-backend.git
git branch -M main
git push -u origin main
```

---

## 3) Déployer sur Railway

1. Créer un nouveau projet → Deploy from GitHub
2. Choisir le repo backend
3. Configurer Variables (Railway Settings → Variables):
   - NODE_ENV = production
   - PORT = 1000
   - MONGODB_URI = mongodb+srv://... (depuis Atlas)
   - JWT_SECRET = [secret fort]
   - CORS_ORIGIN = https://ton-domaine.com

---

## 4) Configurer `dashboards/config.js` pour la production

Modifier `dashboards/config.js` :

```javascript
production: {
  API_URL: 'https://platforme-backend-production.up.railway.app/api',
  BASE_URL: 'https://ton-domaine.com',
  FRONTEND_PORT: 443
},
```

---

## 5) Uploader frontend sur Hostinger

1. hPanel → File Manager → public_html
2. Supprimer les fichiers par défaut
3. Upload contenu de `dashboards/` (ou dézip un package)
4. Installer SSL (Let's Encrypt)
5. Forcer HTTPS dans hPanel

---

## 6) Tester

- Ouvre la console (F12)
- Vérifie que la console indique `Environnement: production`
- Tester le login, ajouter colis, scanner, livrer

---

## 7) Rollback rapide

Si quelque chose casse, ré-upload l'ancienne archive (backup) ou restaure depuis GitHub pour le backend.

---

## Besoin d'aide
Copie/colle ici ce que tu veux faire maintenant (ex: "Je veux créer le cluster Atlas" ou "Pousser le backend sur GitHub" ) et je t'assisterai étape par étape.
