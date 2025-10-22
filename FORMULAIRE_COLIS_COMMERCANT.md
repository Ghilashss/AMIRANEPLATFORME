# 📦 FORMULAIRE DE CRÉATION DE COLIS - COMMERÇANT

## ✅ CHANGEMENTS EFFECTUÉS

### 1️⃣ **Formulaire Identique à Admin**
- ✅ Structure en 2 colonnes
- ✅ Sections avec icônes et animations
- ✅ Même design et couleurs (#0b2b24)
- ✅ Tous les champs de l'admin

### 2️⃣ **Sections du Formulaire**

#### **Colonne Gauche:**
1. **Expéditeur** 🏢
   - Nom expéditeur
   - Téléphone expéditeur
   - Bureau source

2. **Type de livraison** 🚚
   - Livraison à domicile
   - Livraison au bureau

3. **Détails du colis** 📦
   - Poids (kg)
   - Prix du colis
   - Description détaillée

#### **Colonne Droite:**
1. **Destinataire** 👤
   - Nom complet
   - Téléphone principal
   - Téléphone secondaire
   - Wilaya destination
   - Bureau destination

2. **Résumé des frais** 💰
   - Prix du colis
   - Frais de livraison (calculés automatiquement)
   - **Total à payer** (en gros et en vert)

### 3️⃣ **Fonctionnalités JavaScript**
- ✅ Chargement automatique des wilayas depuis l'API
- ✅ Chargement automatique des bureaux depuis l'API
- ✅ Calcul automatique des frais de livraison
- ✅ Mise à jour en temps réel du total
- ✅ Soumission du formulaire à l'API

## 🎨 DESIGN

### **Couleurs:**
- Couleur principale: `#0b2b24` (vert foncé comme admin/agence)
- Fond sections: blanc avec ombre légère
- Icônes: fond vert clair `#e8f5e9`
- Total: fond vert clair avec texte vert foncé

### **Animations:**
- Hover sur sections: élévation + ombre
- Fade-in lors de l'ouverture
- Focus sur inputs: bordure verte + ombre

### **Responsive:**
- Desktop: 2 colonnes
- Mobile: 1 colonne (empilées)

## 🧪 COMMENT TESTER

### **1. Ouvrir le Dashboard**
```
http://localhost:8080/dashboards/commercant/commercant-dashboard.html
```

### **2. Aller dans "Mes Colis"**
- Cliquer sur "Mes Colis" dans le menu
- Cliquer sur le bouton "+ Ajouter un Colis"

### **3. Remplir le Formulaire**

**Expéditeur:**
- Nom: Votre entreprise
- Tél: 0550123456
- Bureau source: (sélectionner dans la liste)

**Destinataire:**
- Nom: Ahmed Benali
- Tél: 0660987654
- Tél secondaire: 0770123456
- Wilaya: (sélectionner - les frais s'affichent automatiquement)
- Bureau destination: (sélectionner)

**Détails:**
- Poids: 2.5
- Prix: 5000
- Type: Domicile
- Description: Vêtements + chaussures

**Résumé:**
- Prix colis: 5000 DA
- Frais livraison: (automatique selon wilaya)
- Total: (calculé automatiquement)

### **4. Soumettre**
- Cliquer sur "Créer le colis"
- ✅ Message de succès
- Le modal se ferme automatiquement

## 🔧 DÉPANNAGE

### **Les wilayas ne s'affichent pas:**
```bash
# Vérifier que le backend est lancé
cd backend
node server.js
```

### **Les bureaux sont vides:**
```bash
# Créer des agences via le dashboard admin
# Ou exécuter le seed:
node backend/seed.js
```

### **Le total ne se calcule pas:**
1. Vérifier que le backend a des wilayas avec frais de livraison
2. Ouvrir la console (F12) pour voir les erreurs
3. Vérifier que l'API répond: http://localhost:5000/api/wilayas

## 📋 DIFFÉRENCES AVEC L'ADMIN

### **Identique:**
- ✅ Structure HTML complète
- ✅ Sections et champs
- ✅ Design et couleurs
- ✅ Animations et hover
- ✅ Calcul automatique des frais
- ✅ Responsive

### **Personnalisé pour commerçant:**
- Couleur #0b2b24 au lieu de #1976D2
- Fond icônes vert au lieu de bleu
- Les colis créés sont liés au commerçant connecté

## ✨ APERÇU DU FORMULAIRE

```
┌─────────────────────────────────────────────────────────┐
│  Ajouter un Colis                                    ×  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────┐  ┌───────────────────┐         │
│  │ 🏢 Expéditeur     │  │ 👤 Destinataire   │         │
│  │ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ │  │ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ │         │
│  │ Nom expéditeur    │  │ Nom complet       │         │
│  │ [____________]    │  │ [____________]    │         │
│  │ Téléphone         │  │ Téléphone         │         │
│  │ [____________]    │  │ [______] [______] │         │
│  │ Bureau source     │  │ Wilaya    Bureau  │         │
│  │ [▼___________]    │  │ [▼_____] [▼_____] │         │
│  └───────────────────┘  └───────────────────┘         │
│                                                         │
│  ┌───────────────────┐  ┌───────────────────┐         │
│  │ 🚚 Type livraison │  │ 💰 Résumé frais   │         │
│  │ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ │  │ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ │         │
│  │ Mode de livraison │  │ Prix colis        │         │
│  │ [▼___________]    │  │ 5000 DA           │         │
│  └───────────────────┘  │ Frais livraison   │         │
│                          │ 500 DA            │         │
│  ┌───────────────────┐  │ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ │         │
│  │ 📦 Détails colis  │  │ Total à payer     │         │
│  │ ┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄ │  │ 5500 DA           │         │
│  │ Poids  Prix       │  └───────────────────┘         │
│  │ [___] [_____]     │                                 │
│  │ Description       │                                 │
│  │ [____________]    │                                 │
│  └───────────────────┘                                 │
│                                                         │
│                          [ Créer le colis ]            │
└─────────────────────────────────────────────────────────┘
```

## 🚀 PROCHAINES ÉTAPES

1. **Tester la création d'un colis**
2. **Vérifier que le colis apparaît dans la liste**
3. **Tester le calcul automatique des frais**
4. **Créer plusieurs colis pour remplir le tableau**

---

**Le formulaire est maintenant identique à celui de l'admin !** 🎉
**Même design, mêmes fonctionnalités, juste adapté aux couleurs du commerçant.**
