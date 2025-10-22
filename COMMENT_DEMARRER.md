# 🚀 COMMENT DÉMARRER LA PLATEFORME

## ✅ Solution Rapide (RECOMMANDÉ)

### Méthode 1 : Double-clic sur DEMARRER.bat
1. Cherchez le fichier **`DEMARRER.bat`** dans le dossier principal
2. **Double-cliquez** dessus
3. Attendez que les fenêtres du Backend et Frontend s'ouvrent
4. Le navigateur s'ouvrira automatiquement
5. **NE FERMEZ PAS** les fenêtres "Backend API" et "Frontend Server"

### Méthode 2 : Via Terminal
```powershell
cd "c:\Users\ADMIN\Desktop\MA PLAT\platforme 222222 - Copie"
.\DEMARRER.bat
```

## 🌐 URLs de la Plateforme

Une fois démarrée, vous pouvez accéder à :

| Page | URL | Description |
|------|-----|-------------|
| **Login** | http://localhost:8080/login.html | Page de connexion |
| **Admin Dashboard** | http://localhost:8080/dashboards/admin/admin-dashboard.html | Dashboard administrateur |
| **Agent Dashboard** | http://localhost:8080/dashboards/agent/agent-dashboard.html | Dashboard agent |
| **API Backend** | http://localhost:5000 | API REST |

## 🔑 Identifiants de Connexion

### Admin
- **Email** : `admin@platforme.com`
- **Mot de passe** : `admin123`

### Agent (si créé)
- **Email** : Selon ce que vous avez créé
- **Mot de passe** : Selon ce que vous avez créé

## 🛠️ Dépannage

### Problème : "Ce site est inaccessible" ou "localhost n'autorise pas la connexion"

**Solution :**
1. Vérifiez que les serveurs sont démarrés
2. Exécutez `DEMARRER.bat`
3. Attendez 5-10 secondes
4. Rafraîchissez la page (F5)

### Vérifier si les serveurs tournent

Dans PowerShell :
```powershell
netstat -ano | Select-String "5000|8080"
```

Vous devriez voir :
```
TCP    0.0.0.0:5000    ...    LISTENING
TCP    0.0.0.0:8080    ...    LISTENING
```

### Problème : MongoDB n'est pas démarré

```powershell
net start MongoDB
```

### Problème : Port déjà utilisé

**Arrêter les anciens processus :**
```powershell
# Trouver les processus sur les ports
netstat -ano | findstr :5000
netstat -ano | findstr :8080

# Arrêter par PID (remplacez XXXX par le PID trouvé)
taskkill /PID XXXX /F
```

## 🔄 Redémarrer la Plateforme

1. Fermez les fenêtres "Backend API" et "Frontend Server"
2. Relancez `DEMARRER.bat`

## ⚠️ IMPORTANT

**NE FERMEZ JAMAIS** les fenêtres suivantes tant que vous utilisez la plateforme :
- ✅ Fenêtre **"Backend API"** (Node.js serveur backend)
- ✅ Fenêtre **"Frontend Server"** (Serveur HTTP frontend)

Si vous les fermez, la plateforme deviendra inaccessible !

## 📋 Checklist de Démarrage

- [ ] MongoDB est démarré (`net start MongoDB`)
- [ ] Double-clic sur `DEMARRER.bat`
- [ ] Fenêtre "Backend API" est ouverte
- [ ] Fenêtre "Frontend Server" est ouverte
- [ ] Navigateur ouvert sur http://localhost:8080/login.html
- [ ] Connexion avec admin@platforme.com / admin123

## 🎯 Après les Modifications de Filtrage

Maintenant que le système de filtrage des colis est en place :

1. **Connectez-vous en Admin** : http://localhost:8080/dashboards/admin/admin-dashboard.html
2. **Migrez les colis existants** : Ouvrez `migrate-colis-createdby.html`
3. **Testez la création de colis** :
   - Créez un colis en Admin → Il apparaît UNIQUEMENT dans Admin
   - Créez un colis en Agent → Il apparaît dans Admin ET Agent

## 📞 Besoin d'Aide ?

1. Vérifiez les logs dans les fenêtres "Backend API" et "Frontend Server"
2. Ouvrez la console du navigateur (F12)
3. Consultez `FILTRAGE_COLIS_README.md` pour le système de filtrage

---

**Date de création :** 15 octobre 2025  
**Statut :** ✅ SERVEURS DÉMARRÉS ET OPÉRATIONNELS
