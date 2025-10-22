# 🧪 Test des Frais de Livraison - Checklist

## ✅ Étape 1: Vérifier que le Backend est Lancé

```powershell
# Le serveur doit afficher :
✅ MongoDB connecté: localhost
🚀 Serveur démarré en mode development
📡 Port: 1000
```

## ✅ Étape 2: Configurer les Frais dans l'Admin

### Connexion Admin
- URL: `http://localhost:1000` (ou votre frontend)
- Email: `admin@platforme.com`
- Mot de passe: `admin123`

### Configuration Test
Créez une configuration de test : **Alger (16) → Constantine (25)**

| Champ | Valeur |
|-------|--------|
| Wilaya Source | 16 - Alger |
| Wilaya Dest | 25 - Constantine |
| Frais Stop Desk | 400 |
| Frais Domicile | 600 |
| Base Bureau | 300 |
| Par Kg Bureau | 50 |
| Base Domicile | 500 |
| Par Kg Domicile | 80 |

**Sauvegardez** la configuration.

## ✅ Étape 3: Tester avec un Commerçant

### Connexion Commerçant
- Email: `commercant@test.com`
- Mot de passe: `123456`
- Wilaya du commerçant: **16 (Alger)**

### Test 1: Colis Léger (≤ 5kg)
1. Ouvrez la console du navigateur (F12)
2. Cliquez sur "Nouveau Colis"
3. Remplissez :
   - **Prix**: 5000 DA
   - **Poids**: 3 kg
   - **Wilaya Dest**: Constantine (25)
   - **Type**: Bureau

**Résultat Attendu:**
```
💰 Recherche frais: {wilayaSource: "16", wilayaDest: "25", typeLivraison: "bureau", poids: "3 kg"}
📦 Frais API récupérés: {fraisStopDesk: 400, ...}
✅ Frais bureau fixe: 400 DA
💵 Calcul final: {prix: "5000 DA", poids: "3 kg", frais: "400 DA", total: "5400 DA"}
```

**Vérification:**
- ✅ Frais de livraison: **400 DA**
- ✅ Total à payer: **5400 DA**

### Test 2: Colis Lourd (> 5kg) - Bureau
1. Modifiez le poids: **10 kg**
2. Gardez le type: **Bureau**

**Résultat Attendu:**
```
✅ Calcul bureau avec poids: 300 + (10 × 50) = 800 DA
💵 Calcul final: {frais: "800 DA", total: "5800 DA"}
```

**Vérification:**
- ✅ Frais de livraison: **800 DA** (300 + 500)
- ✅ Total à payer: **5800 DA**

### Test 3: Colis Lourd (> 5kg) - Domicile
1. Changez le type: **Domicile**
2. Poids: **10 kg**

**Résultat Attendu:**
```
✅ Calcul domicile avec poids: 500 + (10 × 80) = 1300 DA
💵 Calcul final: {frais: "1300 DA", total: "6300 DA"}
```

**Vérification:**
- ✅ Frais de livraison: **1300 DA** (500 + 800)
- ✅ Total à payer: **6300 DA**

### Test 4: Colis Léger - Domicile
1. Modifiez le poids: **2 kg**
2. Type: **Domicile**

**Résultat Attendu:**
```
✅ Frais domicile fixe: 600 DA
💵 Calcul final: {frais: "600 DA", total: "5600 DA"}
```

**Vérification:**
- ✅ Frais de livraison: **600 DA**
- ✅ Total à payer: **5600 DA**

## ✅ Étape 4: Tester le Fallback (Frais Non Configurés)

### Test avec une wilaya non configurée
1. Sélectionnez une wilaya différente (ex: Oran - 31)
2. Les frais devraient utiliser ceux de la wilaya par défaut

**Résultat Attendu:**
```
⚠️ Frais non configuré dans l'API pour cette combinaison
⚠️ Utilisation des frais par défaut de la wilaya (fallback): 550 DA
```

## 🎯 Résumé des Tests

| Test | Poids | Type | Frais Attendus | Calcul |
|------|-------|------|----------------|--------|
| 1 | 3 kg | Bureau | 400 DA | Fixe |
| 2 | 10 kg | Bureau | 800 DA | 300 + (10×50) |
| 3 | 10 kg | Domicile | 1300 DA | 500 + (10×80) |
| 4 | 2 kg | Domicile | 600 DA | Fixe |
| 5 | 8 kg | Bureau | 700 DA | 300 + (8×50) |
| 6 | 15 kg | Domicile | 1700 DA | 500 + (15×80) |

## 🐛 Dépannage Rapide

### Si Frais = 0 DA
1. **Vérifiez la console** (F12) pour voir les logs
2. **Vérifiez que le backend tourne** : http://localhost:1000/api/wilayas
3. **Vérifiez le token** : Déconnectez/reconnectez-vous
4. **Vérifiez la wilaya** du commerçant dans la base de données

### Si Frais Incorrects
1. **Ouvrez la console** (F12)
2. Cherchez : `📦 Frais API récupérés:`
3. Vérifiez que les valeurs correspondent à votre configuration
4. Si message `⚠️ Frais non configuré`, créez la config dans l'admin

### Si Calcul par Poids ne Marche Pas
1. **Vérifiez le poids** : doit être > 5kg
2. **Vérifiez parKg** dans la config admin : doit être > 0
3. **Vérifiez base** dans la config admin : doit être rempli
4. Si tous les champs sont corrects, rechargez la page

## 📝 Commandes Utiles

### Vérifier les Frais en Base de Données (MongoDB)
```javascript
use platforme
db.fraislivraisons.find().pretty()
```

### Tester l'API Directement
```bash
# Dans votre navigateur ou Postman
GET http://localhost:1000/api/frais-livraison/search?wilayaSource=16&wilayaDest=25
Authorization: Bearer <votre-token>
```

### Redémarrer le Backend
```powershell
# Arrêter tous les processus Node
Get-Process -Name node | Stop-Process -Force

# Démarrer le backend
cd "C:\Users\ADMIN\Documents\PLATFORME\platforme 222222 - Copie\backend"
node server.js
```

---
**Date**: Octobre 2025  
**Status**: ✅ Tests Validés
