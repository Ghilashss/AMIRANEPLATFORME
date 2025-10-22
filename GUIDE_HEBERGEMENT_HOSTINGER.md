# 🌐 GUIDE HÉBERGEMENT HOSTINGER

## ❌ PROBLÈME ACTUEL

Ton application a **100+ URLs hardcodées** :
```javascript
fetch('http://localhost:1000/api/colis')
```

Sur Hostinger, ça deviendra :
```javascript
fetch('https://tonsite.com/api/colis')
```

## ✅ SOLUTION : CONFIGURATION CENTRALISÉE

### 1️⃣ Créer un fichier de configuration

**Créer : `dashboards/config.js`**
```javascript
// Configuration API selon l'environnement
const API_CONFIG = {
  // Production (Hostinger)
  production: {
    API_URL: 'https://tonsite.com/api',
    BASE_URL: 'https://tonsite.com'
  },
  
  // Développement local
  development: {
    API_URL: 'http://localhost:1000/api',
    BASE_URL: 'http://localhost:9000'
  }
};

// Détection automatique de l'environnement
const isProduction = window.location.hostname !== 'localhost' && 
                     window.location.hostname !== '127.0.0.1';

const ENV = isProduction ? 'production' : 'development';
const API_URL = API_CONFIG[ENV].API_URL;
const BASE_URL = API_CONFIG[ENV].BASE_URL;

// Export
window.API_CONFIG = {
  API_URL,
  BASE_URL,
  ENV
};

console.log('🌍 Environnement:', ENV);
console.log('🔗 API URL:', API_URL);
```

### 2️⃣ Inclure dans TOUS les HTML

**Dans chaque fichier HTML, AVANT les autres scripts :**
```html
<!-- Configuration API (DOIT ÊTRE EN PREMIER) -->
<script src="/dashboards/config.js"></script>

<!-- Autres scripts ensuite -->
<script src="/dashboards/agent/js/livraisons-manager.js"></script>
```

### 3️⃣ Remplacer TOUTES les URLs hardcodées

**❌ AVANT :**
```javascript
fetch('http://localhost:1000/api/colis', {
```

**✅ APRÈS :**
```javascript
fetch(`${window.API_CONFIG.API_URL}/colis`, {
```

---

## 📋 FICHIERS À MODIFIER (100+ endroits!)

### Frontend (Dashboards)
1. **dashboards/agent/js/livraisons-manager.js** - 6 URLs
2. **dashboards/agent/js/retours-manager.js** - 4 URLs
3. **dashboards/agent/js/paiement-commercant.js** - 1 URL
4. **dashboards/agent/js/commercants-manager.js** - 4 URLs
5. **dashboards/agent/js/colis-scanner-manager.js** - 2 URLs
6. **dashboards/agent/js/colis-form.js** - 4 URLs
7. **dashboards/agent/data-store.js** - 13 URLs
8. **dashboards/admin/js/data-store.js** - 10 URLs
9. **dashboards/admin/js/wilaya-manager.js** - 4 URLs
10. **dashboards/admin/js/frais-livraison.js** - 3 URLs
11. **dashboards/admin/js/colis-admin.js** - 2 URLs
12. **dashboards/admin/js/dashboard-stats.js** - 5 URLs
13. **dashboards/shared/js/colis-form-handler-v2.js** - 4 URLs
14. **dashboards/shared/js/colis-form-handler.js** - 5 URLs
15. **Et 20+ autres fichiers...**

### Backend
**backend/server.js** - CORS à modifier :
```javascript
// ❌ AVANT
origin: ['http://localhost:9000', 'http://localhost:3000']

// ✅ APRÈS
origin: [
  'http://localhost:9000',  // Dev local
  'https://tonsite.com',    // Production
  'https://www.tonsite.com' // Production avec www
]
```

---

## 🔧 SCRIPT AUTOMATIQUE DE REMPLACEMENT

**Créer : `update-urls-for-production.js`**
```javascript
const fs = require('fs');
const path = require('path');

// Remplacer toutes les URLs localhost par la config
function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remplacer fetch avec localhost:1000
  content = content.replace(
    /fetch\(\s*['"`]http:\/\/localhost:1000\/api\//g,
    "fetch(`${window.API_CONFIG.API_URL}/"
  );
  
  // Remplacer fetch avec localhost:1000 (sans /api/)
  content = content.replace(
    /fetch\(\s*['"`]http:\/\/localhost:1000\//g,
    "fetch(`${window.API_CONFIG.API_URL}/../"
  );
  
  // Remplacer const API_URL = 'http://localhost:1000/api'
  content = content.replace(
    /const\s+API_URL\s*=\s*['"`]http:\/\/localhost:1000\/api['"`]/g,
    "const API_URL = window.API_CONFIG.API_URL"
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅', filePath);
}

// Parcourir tous les fichiers JS
function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.js')) {
      replaceInFile(fullPath);
    }
  });
}

// Démarrer
processDirectory('./dashboards');
console.log('✅ Toutes les URLs ont été mises à jour!');
```

**Pour l'exécuter :**
```powershell
node update-urls-for-production.js
```

---

## 📦 CONFIGURATION HOSTINGER

### Structure de dossiers Hostinger
```
public_html/
├── dashboards/          # Ton frontend
│   ├── agent/
│   ├── admin/
│   ├── config.js       # ⚠️ Configuration API
│   └── index.html
│
└── backend/             # ⚠️ NE PAS mettre ici!
```

### ⚠️ Backend séparé
Le backend Node.js doit être sur un **serveur séparé** ou **VPS** :
- Hostinger ne supporte PAS Node.js sur l'hébergement web standard
- Solutions :
  1. **VPS Hostinger** (20€/mois) - Recommandé
  2. **Heroku** (gratuit/payant)
  3. **Railway** (gratuit)
  4. **DigitalOcean** (5$/mois)

### Configuration DNS
Si backend sur VPS séparé :
```
tonsite.com          → Frontend (Hostinger)
api.tonsite.com      → Backend (VPS)
```

Alors dans config.js :
```javascript
production: {
  API_URL: 'https://api.tonsite.com/api',
  BASE_URL: 'https://tonsite.com'
}
```

---

## 🔐 VARIABLES D'ENVIRONNEMENT (Backend)

**Sur le VPS, créer `.env` :**
```env
NODE_ENV=production
PORT=1000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/platforme
JWT_SECRET=TON_SECRET_ULTRA_SECURISE_ICI
CORS_ORIGIN=https://tonsite.com,https://www.tonsite.com
```

**backend/server.js - Utiliser les variables :**
```javascript
require('dotenv').config();

const corsOptions = {
  origin: process.env.CORS_ORIGIN.split(','),
  credentials: true
};

app.use(cors(corsOptions));
```

---

## ✅ CHECKLIST AVANT DÉPLOIEMENT

### Frontend (Hostinger)
- [ ] Créer `dashboards/config.js` avec ta vraie URL
- [ ] Remplacer TOUTES les URLs `localhost:1000` par `window.API_CONFIG.API_URL`
- [ ] Inclure `config.js` dans TOUS les fichiers HTML
- [ ] Tester en local que ça marche toujours
- [ ] Upload sur Hostinger via FTP/File Manager

### Backend (VPS)
- [ ] Louer un VPS ou service Node.js
- [ ] Installer Node.js + MongoDB
- [ ] Créer fichier `.env` avec vraies valeurs
- [ ] Configurer CORS avec la vraie URL frontend
- [ ] Démarrer le backend : `node server.js`
- [ ] Configurer PM2 pour redémarrage auto : `pm2 start server.js`

### Base de données
- [ ] MongoDB Atlas (gratuit) ou MongoDB sur VPS
- [ ] Importer tes données
- [ ] Configurer IP whitelist (ajouter IP du VPS)
- [ ] Mettre l'URI MongoDB dans `.env`

### SSL/HTTPS
- [ ] Activer SSL sur Hostinger (frontend) - Gratuit
- [ ] Installer Certbot sur VPS (backend) - Gratuit
- [ ] Forcer HTTPS partout

### Tests finaux
- [ ] Tester le login
- [ ] Tester ajout colis
- [ ] Tester scan barcode
- [ ] Tester toutes les sections
- [ ] Vérifier console (F12) - aucune erreur 404/CORS

---

## 💰 COÛT ESTIMÉ

| Service | Prix/mois | Obligatoire? |
|---------|-----------|--------------|
| Hostinger Web | 2-4€ | ✅ Oui |
| VPS Node.js | 5-20€ | ✅ Oui |
| MongoDB Atlas | Gratuit | ✅ Oui |
| Nom de domaine | 10€/an | ✅ Oui |
| **TOTAL** | **7-24€/mois** | |

---

## 🆘 ALTERNATIVE : TOUT EN LOCAL

Si tu veux juste tester sans héberger :
1. Utilise **ngrok** pour exposer ton backend local :
   ```powershell
   ngrok http 1000
   ```
2. Tu auras une URL temporaire : `https://abc123.ngrok.io`
3. Modifie `config.js` :
   ```javascript
   production: {
     API_URL: 'https://abc123.ngrok.io/api'
   }
   ```
4. Upload juste le frontend sur Hostinger
5. Le backend reste sur ton PC (doit être allumé!)

**⚠️ Problèmes ngrok :**
- URL change à chaque redémarrage (version gratuite)
- Ton PC doit rester allumé 24/7
- Pas sécurisé pour production

---

## 📞 BESOIN D'AIDE?

1. **VPS trop compliqué?** → Utilise **Railway.app** (plus simple)
2. **MongoDB complexe?** → Utilise **MongoDB Atlas** (gratuit + simple)
3. **CORS errors?** → Vérifie que l'URL frontend est dans `corsOptions.origin`

---

## 🎯 RÉSUMÉ

**TU NE PEUX PAS héberger tel quel sur Hostinger car :**
1. ❌ 100+ URLs hardcodées avec `localhost:1000`
2. ❌ Hostinger hébergement web ne supporte pas Node.js backend
3. ❌ Pas de séparation frontend/backend

**SOLUTION :**
1. ✅ Créer `config.js` avec détection auto environnement
2. ✅ Remplacer toutes les URLs par `window.API_CONFIG.API_URL`
3. ✅ Héberger frontend sur Hostinger
4. ✅ Héberger backend sur VPS/Railway/Heroku
5. ✅ Utiliser MongoDB Atlas pour la base de données

**Tu veux que je crée le script automatique pour tout remplacer?** 🚀
