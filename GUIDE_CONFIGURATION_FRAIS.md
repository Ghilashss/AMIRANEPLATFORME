# 🔧 Guide de Configuration des Frais de Livraison

## 📋 Vue d'ensemble

Le système de frais de livraison permet à l'administrateur de configurer des tarifs personnalisés pour chaque combinaison de wilayas (source → destination).

## 🎯 Deux Modes de Calcul

### Mode 1: Frais Fixes (par défaut)
- Tarif unique peu importe le poids
- Simple à configurer
- Idéal pour les colis standards (≤ 5kg)

### Mode 2: Frais par Poids (pour colis lourds)
- Base fixe + supplément par kg
- Appliqué automatiquement si poids > 5kg
- Idéal pour les gros colis

## ⚙️ Configuration dans le Dashboard Admin

### Accès
1. Connectez-vous en tant qu'**admin**
2. Allez dans la section **"Frais de Livraison"**
3. Cliquez sur **"Nouvelle Configuration"**

### Champs à Remplir

#### 1. Wilaya Source
- Sélectionnez la wilaya d'**expédition** (ex: Alger - 16)
- C'est la wilaya du commerçant ou de l'agence

#### 2. Wilaya Destination
- Sélectionnez la wilaya de **livraison** (ex: Constantine - 25)

#### 3. Frais Stop Desk (Bureau)
- Tarif pour livraison **au bureau** de poste
- Exemple: **400 DA**

#### 4. Frais Domicile
- Tarif pour livraison **à domicile**
- Exemple: **600 DA**

#### 5. Base Bureau (optionnel)
- Frais de base pour colis lourds (bureau)
- Si vide, utilise "Frais Stop Desk"
- Exemple: **300 DA**

#### 6. Par Kg Bureau (optionnel)
- Supplément par kg pour colis > 5kg (bureau)
- Si > 0, active le calcul par poids
- Exemple: **50 DA/kg**

#### 7. Base Domicile (optionnel)
- Frais de base pour colis lourds (domicile)
- Si vide, utilise "Frais Domicile"
- Exemple: **500 DA**

#### 8. Par Kg Domicile (optionnel)
- Supplément par kg pour colis > 5kg (domicile)
- Si > 0, active le calcul par poids
- Exemple: **100 DA/kg**

## 💡 Exemples de Configuration

### Exemple 1: Tarif Fixe Simple
**Alger (16) → Constantine (25)**

| Champ | Valeur |
|-------|--------|
| Wilaya Source | 16 - Alger |
| Wilaya Dest | 25 - Constantine |
| Frais Stop Desk | 400 DA |
| Frais Domicile | 600 DA |
| Base Bureau | (vide) |
| Par Kg Bureau | (vide) |
| Base Domicile | (vide) |
| Par Kg Domicile | (vide) |

**Résultat:**
- Colis 2kg → Bureau: **400 DA**, Domicile: **600 DA**
- Colis 8kg → Bureau: **400 DA**, Domicile: **600 DA** (même tarif)

### Exemple 2: Tarif avec Poids
**Alger (16) → Oran (31)**

| Champ | Valeur |
|-------|--------|
| Wilaya Source | 16 - Alger |
| Wilaya Dest | 31 - Oran |
| Frais Stop Desk | 350 DA |
| Frais Domicile | 500 DA |
| Base Bureau | 300 DA |
| Par Kg Bureau | 50 DA |
| Base Domicile | 450 DA |
| Par Kg Domicile | 80 DA |

**Résultat:**
- Colis 2kg → Bureau: **350 DA**, Domicile: **500 DA** (frais fixes)
- Colis 8kg → Bureau: **300 + (8 × 50) = 700 DA**
- Colis 8kg → Domicile: **450 + (8 × 80) = 1090 DA**

### Exemple 3: Configuration Complète
**Alger (16) → Tamanrasset (11)** (longue distance)

| Champ | Valeur |
|-------|--------|
| Wilaya Source | 16 - Alger |
| Wilaya Dest | 11 - Tamanrasset |
| Frais Stop Desk | 800 DA |
| Frais Domicile | 1200 DA |
| Base Bureau | 600 DA |
| Par Kg Bureau | 100 DA |
| Base Domicile | 1000 DA |
| Par Kg Domicile | 150 DA |

**Résultat:**
- Colis 3kg → Bureau: **800 DA**, Domicile: **1200 DA**
- Colis 10kg → Bureau: **600 + (10 × 100) = 1600 DA**
- Colis 10kg → Domicile: **1000 + (10 × 150) = 2500 DA**

## 🔄 Fonctionnement Automatique

### Dans le Dashboard Commerçant

Quand un commerçant crée un colis :

1. Il sélectionne la **wilaya de destination**
2. Il entre le **poids du colis**
3. Il choisit le **type de livraison** (Bureau / Domicile)
4. Les frais sont calculés **automatiquement** :

```
SI poids ≤ 5kg ALORS
   frais = Frais Stop Desk (ou Frais Domicile)
SINON SI parKg > 0 ALORS
   frais = Base + (poids × parKg)
SINON
   frais = Frais Stop Desk (ou Frais Domicile)
FIN SI
```

### Logs Console (F12)
Le commerçant peut voir dans la console :
```
💰 Recherche frais: {wilayaSource: "16", wilayaDest: "25", typeLivraison: "domicile", poids: "8 kg"}
📦 Frais API récupérés: {fraisStopDesk: 400, fraisDomicile: 600, ...}
✅ Calcul domicile avec poids: 500 + (8 × 80) = 1140 DA
💵 Calcul final: {prix: "5000 DA", poids: "8 kg", frais: "1140 DA", total: "6140 DA"}
```

## 🚨 Cas Particuliers

### Cas 1: Frais Non Configurés
- Si aucune configuration n'existe pour la combinaison wilayaSource → wilayaDest
- Le système utilise les **frais par défaut** de la wilaya de destination
- Message dans la console : `⚠️ Frais non configuré dans l'API pour cette combinaison`

### Cas 2: Configuration Partielle
- Si seuls les frais fixes sont remplis (pas de base/parKg)
- Le système applique le **tarif fixe** même pour les colis lourds

### Cas 3: Modification des Frais
- Les modifications sont **appliquées immédiatement**
- Pas besoin de redémarrer le backend
- Les commerçants voient les nouveaux tarifs au prochain calcul

## ✅ Vérification de la Configuration

### Méthode 1: Via l'API
Testez directement l'API avec Postman ou le navigateur :

```
GET http://localhost:1000/api/frais-livraison/search?wilayaSource=16&wilayaDest=25
Authorization: Bearer <votre-token>
```

Réponse attendue :
```json
{
  "success": true,
  "data": {
    "wilayaSource": "16",
    "wilayaDest": "25",
    "fraisStopDesk": 400,
    "fraisDomicile": 600,
    "baseBureau": 300,
    "parKgBureau": 50,
    "baseDomicile": 500,
    "parKgDomicile": 80
  }
}
```

### Méthode 2: Via le Dashboard Commerçant
1. Connectez-vous en tant que commerçant
2. Ouvrez la console (F12)
3. Créez un nouveau colis
4. Sélectionnez une wilaya
5. Vérifiez les logs : `📦 Frais API récupérés:`

### Méthode 3: Test Manuel
1. Créez une configuration : Alger (16) → Constantine (25)
2. Frais Bureau: 400 DA, Domicile: 600 DA
3. Base Bureau: 300 DA, Par Kg Bureau: 50 DA
4. Connectez-vous en tant que commerçant avec wilaya = "16"
5. Créez un colis vers Constantine (25)
6. Testez avec poids 3kg : devrait afficher **400 DA** (bureau)
7. Testez avec poids 10kg : devrait afficher **800 DA** (300 + 10×50)

## 📊 Recommandations

### Pour les Wilayas Proches (< 200km)
- Frais fixes simples (pas de calcul par poids)
- Bureau: 350-450 DA
- Domicile: 500-650 DA

### Pour les Wilayas Moyennes (200-500km)
- Frais fixes + option poids
- Bureau: 400-600 DA (fixe), +50-80 DA/kg (>5kg)
- Domicile: 600-800 DA (fixe), +80-120 DA/kg (>5kg)

### Pour les Wilayas Éloignées (> 500km)
- Calcul par poids recommandé
- Bureau: 600-800 DA (base), +80-120 DA/kg
- Domicile: 1000-1500 DA (base), +120-200 DA/kg

### Pour le Sud (Tamanrasset, Illizi, etc.)
- Calcul par poids obligatoire
- Bureau: 800-1000 DA (base), +100-150 DA/kg
- Domicile: 1200-1800 DA (base), +150-250 DA/kg

## 🔄 Migration depuis l'Ancien Système

Si vous aviez des frais dans la collection `Wilaya` :

1. **Pas de panique** : le système utilise un fallback automatique
2. Les anciens frais fonctionnent toujours
3. Configurez progressivement les nouvelles routes
4. Les nouvelles configurations **remplacent** les anciennes

## 🛠️ Dépannage

### Problème: Frais toujours à 0 DA
**Causes possibles:**
- Backend non lancé (port 1000)
- Wilaya du commerçant non définie
- Token expiré
- Configuration inexistante

**Solution:**
1. Vérifiez que le backend tourne : `http://localhost:1000/api/wilayas`
2. Vérifiez le profil utilisateur : wilaya doit être rempli
3. Reconnectez-vous
4. Créez la configuration dans l'admin

### Problème: Frais incorrects
**Causes possibles:**
- Mauvaise combinaison wilayaSource/wilayaDest
- Calcul par poids mal configuré

**Solution:**
1. Ouvrez la console (F12)
2. Vérifiez les logs : `📦 Frais API récupérés:`
3. Vérifiez que wilayaSource = wilaya du commerçant
4. Recalculez : Base + (poids × parKg)

### Problème: Calcul par poids ne fonctionne pas
**Vérifications:**
- Poids > 5kg ?
- Champ `parKg` > 0 ?
- Champ `base` rempli ?

**Solution:**
- Si parKg = 0 ou vide, le système utilise les frais fixes
- Remplissez `baseBureau` et `parKgBureau` (ou domicile)

---

**Dernière mise à jour**: Octobre 2025  
**Version**: 2.0  
**Documentation**: FRAIS_LIVRAISON_DYNAMIQUES.md
