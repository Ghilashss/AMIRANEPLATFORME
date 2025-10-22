# 🎯 GUIDE COMPLET - FORMULAIRE DE COLIS AVEC WILAYAS ET AGENCES

## ✅ STATUT ACTUEL

### **Ce qui est fait :**
1. ✅ Base de données initialisée avec :
   - **58 wilayas** avec frais de livraison
   - **3 agences** (Alger, Oran, Constantine)
   - **5 utilisateurs** (admin, commerçant, 3 agents)

2. ✅ Formulaire de création de colis :
   - Structure complète en 2 colonnes
   - Design identique à l'admin
   - JavaScript pour charger wilayas et agences
   - Calcul automatique des frais

3. ✅ APIs fonctionnelles :
   - `/api/wilayas` - Liste des wilayas (public)
   - `/api/agences` - Liste des agences (nécessite authentification)
   - `/api/colis` - Création de colis (avec token)

---

## 🧪 TESTER MAINTENANT

### **OPTION 1 : Page de test rapide** ⚡

1. **Ouvrir la page de test :**
   ```
   http://localhost:8080/test-wilayas-agences.html
   ```

2. **Cliquer sur "Se connecter"**
   - Email: `commercant@test.com`
   - Password: `123456`

3. **Voir les résultats :**
   - ✅ 58 wilayas chargées
   - ✅ 3 agences chargées
   - ✅ Test du calcul des frais

4. **Cliquer sur "Ouvrir le Dashboard Commerçant"**

---

### **OPTION 2 : Dashboard complet** 🚀

1. **Aller sur le login :**
   ```
   http://localhost:8080/dashboards/commercant/commercant-login.html
   ```

2. **Se connecter :**
   - Email: `commercant@test.com`
   - Password: `123456`

3. **Cliquer sur "Mes Colis"** dans le menu

4. **Cliquer sur "+ Ajouter un Colis"**

5. **Remplir le formulaire :**

   **📤 Expéditeur :**
   ```
   Nom: Ma Boutique Alger
   Téléphone: 0550123456
   Bureau source: [Sélectionner Agence Alger Centre]
   ```

   **📥 Destinataire :**
   ```
   Nom complet: Ahmed Benali
   Téléphone: 0660987654
   Tél secondaire: 0770111222
   Wilaya: [Sélectionner 31 - Oran]
   Bureau destination: [Sélectionner Agence Oran]
   ```

   **📦 Type de livraison :**
   ```
   Mode: Livraison à domicile
   ```

   **📊 Détails du colis :**
   ```
   Poids: 2.5 kg
   Prix: 5000 DA
   Description: Vêtements et chaussures Nike
   ```

   **💰 Résumé (calculé automatiquement) :**
   ```
   Prix du colis:      5000 DA
   Frais de livraison:  550 DA  ← Calculé automatiquement !
   ─────────────────────────────
   TOTAL À PAYER:      5550 DA
   ```

6. **Cliquer sur "Créer le colis"**
   - ✅ Message de succès
   - Le modal se ferme
   - Le colis apparaît dans le tableau

---

## 📋 LISTES DISPONIBLES

### **58 Wilayas avec leurs frais :**

| Code | Wilaya | Domicile | Bureau | Délai |
|------|--------|----------|--------|-------|
| 16 | Alger | 500 DA | 350 DA | 24-48h |
| 31 | Oran | 550 DA | 400 DA | 2-3 jours |
| 25 | Constantine | 600 DA | 450 DA | 2-3 jours |
| 09 | Blida | 500 DA | 350 DA | 24-48h |
| 15 | Tizi Ouzou | 550 DA | 400 DA | 2-3 jours |
| 06 | Béjaïa | 600 DA | 450 DA | 2-3 jours |
| 19 | Sétif | 600 DA | 450 DA | 2-3 jours |
| 23 | Annaba | 650 DA | 500 DA | 2-3 jours |
| 11 | Tamanrasset | 1200 DA | 1000 DA | 5-7 jours |
| ... | ... | ... | ... | ... |

**Total : 58 wilayas disponibles** ✅

---

### **3 Agences créées :**

1. **Agence Alger Centre**
   - 📍 Wilaya: 16 - Alger
   - 📞 021123456
   - 📧 alger.centre@agence.com

2. **Agence Oran**
   - 📍 Wilaya: 31 - Oran
   - 📞 041654321
   - 📧 oran@agence.com

3. **Agence Constantine**
   - 📍 Wilaya: 25 - Constantine
   - 📞 031789456
   - 📧 constantine@agence.com

---

## 💡 COMMENT ÇA FONCTIONNE

### **1. Chargement des wilayas**

Quand le formulaire s'ouvre, le JavaScript :
```javascript
// Appelle l'API
fetch('http://localhost:5000/api/wilayas')

// Récupère les 58 wilayas
// Remplit le <select id="wilayaDest">
// Ajoute les frais dans data-frais
```

### **2. Chargement des agences**

Avec le token du commerçant connecté :
```javascript
// Appelle l'API avec authentification
fetch('http://localhost:5000/api/agences', {
  headers: { 'Authorization': 'Bearer TOKEN' }
})

// Récupère les 3 agences
// Remplit bureauSource et bureauDest
```

### **3. Calcul automatique**

Quand vous changez la wilaya ou le prix :
```javascript
// Récupère le prix du colis
const prix = 5000;

// Récupère les frais de la wilaya sélectionnée
const frais = 550; // Oran domicile

// Calcule le total
const total = prix + frais; // 5550 DA

// Affiche dans le résumé
document.getElementById('totalAPayer').textContent = '5550 DA';
```

---

## 🔍 DÉPANNAGE

### **❌ Les wilayas ne s'affichent pas**

**Vérification :**
```bash
# Ouvrir la console (F12)
# Regarder les erreurs

# OU tester l'API directement :
curl http://localhost:5000/api/wilayas
```

**Solution :**
```bash
# Si vide, relancer le seed :
cd backend
node seed.js
```

---

### **❌ Les agences ne s'affichent pas**

**Cause :** Pas connecté ou token invalide

**Solution :**
1. Se déconnecter et reconnecter
2. Vérifier dans la console :
   ```javascript
   console.log(localStorage.getItem('token'));
   console.log(localStorage.getItem('user'));
   ```
3. Si null, se reconnecter

---

### **❌ Le total ne se calcule pas**

**Vérifications :**
1. Ouvrir la console (F12)
2. Voir les logs :
   ```
   ✅ Wilayas chargées
   ✅ Bureaux chargés
   ```
3. Changer la wilaya → voir le total changer
4. Changer le prix → voir le total changer

**Si ça ne marche pas :**
- Rafraîchir la page (Ctrl + F5)
- Se reconnecter
- Vérifier que le backend est lancé

---

## 📊 EXEMPLES DE CALCULS

### **Exemple 1 : Livraison à Alger**
```
Prix colis: 3000 DA
Wilaya: 16 - Alger
Type: Domicile
─────────────────
Frais: 500 DA
TOTAL: 3500 DA
```

### **Exemple 2 : Livraison à Oran**
```
Prix colis: 5000 DA
Wilaya: 31 - Oran
Type: Domicile
─────────────────
Frais: 550 DA
TOTAL: 5550 DA
```

### **Exemple 3 : Livraison à Tamanrasset**
```
Prix colis: 8000 DA
Wilaya: 11 - Tamanrasset
Type: Domicile
─────────────────
Frais: 1200 DA
TOTAL: 9200 DA
```

### **Exemple 4 : Livraison au bureau (stop desk)**
```
Prix colis: 5000 DA
Wilaya: 31 - Oran
Type: Bureau
─────────────────
Frais: 400 DA (moins cher !)
TOTAL: 5400 DA
```

---

## 🚀 PROCHAINES ÉTAPES

1. ✅ **Tester avec la page de test**
   - `http://localhost:8080/test-wilayas-agences.html`

2. ✅ **Se connecter au dashboard**
   - `http://localhost:8080/dashboards/commercant/commercant-login.html`

3. ✅ **Créer un colis de test**
   - Remplir tous les champs
   - Voir le calcul automatique
   - Soumettre le formulaire

4. ✅ **Vérifier dans le tableau**
   - Le colis apparaît dans "Mes Colis"
   - Tous les détails sont corrects

5. ✅ **Créer plusieurs colis**
   - Tester différentes wilayas
   - Comparer les frais
   - Voir les différences domicile/bureau

---

## 📝 RÉSUMÉ TECHNIQUE

### **Fichiers modifiés :**
```
✅ commercant-dashboard.html
   - Formulaire HTML complet
   - Styles CSS inline
   - JavaScript pour wilayas/agences
   - Calcul automatique des frais

✅ Backend seed.js
   - 58 wilayas
   - 3 agences
   - 5 utilisateurs

✅ test-wilayas-agences.html
   - Page de test complète
   - Connexion rapide
   - Affichage des données
```

### **APIs utilisées :**
```
GET  /api/wilayas        → Liste des 58 wilayas
GET  /api/agences        → Liste des 3 agences (avec token)
POST /api/colis          → Créer un colis (avec token)
POST /api/auth/login     → Se connecter
```

---

## 🎉 TOUT EST PRÊT !

**Vous pouvez maintenant :**
- ✅ Voir les 58 wilayas dans le formulaire
- ✅ Voir les 3 agences dans les listes
- ✅ Calculer automatiquement les frais
- ✅ Créer des colis avec de vraies données
- ✅ Voir les différences de prix selon les wilayas

**Le système est 100% fonctionnel !** 🚀
