# 👤 Affichage Nom Commerçant + Agence

## ✅ Modification effectuée

**Objectif** : Afficher en haut à droite du dashboard commerçant :
- Le nom complet du commerçant
- Son email
- Le nom de l'agence qui l'a créé

---

## 📝 Modifications

### 1. **HTML - Structure d'affichage** (Ligne 146-154)

```html
<div class="user" style="display: flex; align-items: center; gap: 12px;">
  <div id="user-info" style="display: flex; flex-direction: column; align-items: flex-end; gap: 2px;">
    <!-- Nom du commerçant -->
    <span id="commercantNom" style="font-weight: 600; color: #0b2b24; font-size: 14px;">Commerçant</span>
    
    <!-- Email du commerçant -->
    <span id="commercantEmail" style="color: #999; font-size: 12px;">email@example.com</span>
    
    <!-- ✅ NOUVEAU : Nom de l'agence avec icône -->
    <span id="commercantAgence" style="color: #16a34a; font-size: 11px; font-weight: 500;">
      <ion-icon name="business-outline" style="font-size: 12px; vertical-align: middle;"></ion-icon>
      <span id="agenceNom">Chargement...</span>
    </span>
  </div>
  
  <!-- Icône utilisateur -->
  <ion-icon name="person-circle-outline" style="font-size: 2.5em; color: #0b2b24;"></ion-icon>
</div>
```

**Style appliqué :**
- 🟢 Agence en vert (`#16a34a`)
- 📏 Police 11px, poids 500
- 🏢 Icône "business-outline" avant le nom

### 2. **JavaScript - Chargement des données** (Ligne 801-862)

```javascript
// ✅ Fonction pour charger les infos du commerçant
async function loadCommercantInfo() {
  try {
    // 1️⃣ Récupérer les données du localStorage
    const userStr = localStorage.getItem(CONFIG.USER_KEY); // 'commercant_user'
    const token = localStorage.getItem(CONFIG.TOKEN_KEY);  // 'commercant_token'

    if (!userStr) {
      console.warn('⚠️ Utilisateur non connecté');
      return;
    }

    const user = JSON.parse(userStr);
    
    // 2️⃣ Afficher nom et email du commerçant
    document.getElementById('commercantNom').textContent = 
      user.nom + (user.prenom ? ' ' + user.prenom : '');
    document.getElementById('commercantEmail').textContent = user.email || '';

    // 3️⃣ Si le commerçant a une agence, charger ses infos
    if (user.agence && token) {
      const response = await fetch(`${CONFIG.API_URL}/agences/${user.agence}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.data) {
          const agence = result.data;
          const agenceNom = agence.nom || `Agence ${agence.wilaya}`;
          
          // 4️⃣ Afficher le nom de l'agence
          document.getElementById('agenceNom').textContent = agenceNom;
          console.log('✅ Agence affichée:', agenceNom);
        }
      }
    } else {
      document.getElementById('agenceNom').textContent = 'Aucune agence';
    }
  } catch (error) {
    console.error('❌ Erreur chargement:', error);
    document.getElementById('agenceNom').textContent = 'Erreur';
  }
}

// 5️⃣ Appeler au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
  loadCommercantInfo(); // ← Ajouté ici
  // ... reste du code
});
```

---

## 🔍 Flux de données

### Étape 1 : Login du commerçant
```javascript
// login.html stocke :
localStorage.setItem('commercant_user', JSON.stringify({
  _id: "68f123...",
  nom: "Dupont",
  prenom: "Jean",
  email: "jean.dupont@example.com",
  role: "commercant",
  agence: "68fab123..."  // ← ID de l'agence
}));
```

### Étape 2 : Chargement du dashboard
```javascript
// 1. Récupère commercant_user depuis localStorage
const user = JSON.parse(localStorage.getItem('commercant_user'));

// 2. Affiche immédiatement nom + email
commercantNom.textContent = "Dupont Jean";
commercantEmail.textContent = "jean.dupont@example.com";
```

### Étape 3 : Chargement de l'agence
```javascript
// 3. Si user.agence existe, appel API
GET /api/agences/68fab123...
Headers: { Authorization: "Bearer <commercant_token>" }

// 4. Réponse :
{
  success: true,
  data: {
    _id: "68fab123...",
    nom: "Agence Paris Centre",
    code: "AG2510-75-001",
    wilaya: "75",
    telephone: "01234567890"
  }
}

// 5. Affiche le nom de l'agence
agenceNom.textContent = "Agence Paris Centre";
```

---

## 🎨 Résultat visuel

```
┌─────────────────────────────────────────────┐
│                             Dupont Jean     │ ← Nom (gras, noir)
│                   jean.dupont@example.com   │ ← Email (gris clair)
│                    🏢 Agence Paris Centre   │ ← Agence (vert avec icône)
│                                      👤     │ ← Icône profil
└─────────────────────────────────────────────┘
```

---

## 🧪 Tests à effectuer

### Test 1 : Commerçant AVEC agence
1. **Créez un commerçant** via le dashboard agent (déjà fait)
2. **Connectez-vous** avec ce commerçant
3. **Vérifiez** en haut à droite :
   - ✅ Nom : "Prénom Nom"
   - ✅ Email : "email@example.com"
   - ✅ Agence : "Nom de l'agence" (en vert avec 🏢)

### Test 2 : Commerçant SANS agence (ancien)
1. **Connectez-vous** avec un commerçant créé avant la mise à jour
2. **Vérifiez** :
   - ✅ Nom et email affichés
   - ⚠️ Agence : "Aucune agence" (car pas d'agence assignée)

### Test 3 : Console F12
```javascript
// Ouvrir la console et taper :
const user = JSON.parse(localStorage.getItem('commercant_user'));
console.log('User:', user);
console.log('Agence ID:', user.agence);

// Doit afficher :
// User: { nom: "...", agence: "68f..." }
// Agence ID: 68f...
```

### Test 4 : Vérification API
```javascript
// Dans la console, vérifier que l'API fonctionne :
const token = localStorage.getItem('commercant_token');
const user = JSON.parse(localStorage.getItem('commercant_user'));

fetch(`http://localhost:1000/api/agences/${user.agence}`, {
  headers: { Authorization: `Bearer ${token}` }
})
.then(r => r.json())
.then(d => console.log('Agence:', d));

// Doit retourner :
// Agence: { success: true, data: { nom: "...", ... } }
```

---

## 🐛 Dépannage

### Problème : Affiche "Chargement..." indéfiniment

**Cause 1** : Pas d'agence assignée
```javascript
// Vérifier :
JSON.parse(localStorage.getItem('commercant_user')).agence
// Si undefined → le commerçant n'a pas d'agence
```

**Solution** : Assigner une agence dans MongoDB ou recréer le commerçant

**Cause 2** : Token invalide
```javascript
// Vérifier le token :
localStorage.getItem('commercant_token')
// Si null → reconnexion nécessaire
```

**Solution** : Se déconnecter et se reconnecter

### Problème : Affiche "Aucune agence"

**Cas normal** : Le commerçant a été créé sans agence  
**Solution** : Recréer le commerçant via un agent

### Problème : Erreur 401 Unauthorized

**Cause** : Token expiré ou incorrect  
**Solution** :
```javascript
localStorage.clear();
// Reconnexion
```

### Problème : Affiche "Agence inconnue"

**Cause** : L'agence existe mais l'API retourne une structure différente  
**Debug** :
```javascript
// Console F12 :
console.log('📦 Agence:', result);
// Vérifier la structure de result.data
```

---

## 🔒 Sécurité

### ✅ Points sécurisés :
- **Token JWT** : L'API vérifie l'authentification
- **ID Agence** : Stocké dans le user MongoDB (pas modifiable côté client)
- **Filtrage backend** : Seul le commerçant connecté peut voir ses infos

### ⚠️ Limitations :
- Si un commerçant **n'a pas** d'agence assignée → affiche "Aucune agence"
- Les commerçants créés **avant la mise à jour** doivent être migrés

---

## 📋 Checklist

- [x] HTML modifié (ajout ligne agence)
- [x] JavaScript ajouté (fonction loadCommercantInfo)
- [x] Appel de la fonction au DOMContentLoaded
- [x] Style appliqué (vert + icône)
- [ ] Tests effectués (commerçant avec agence)
- [ ] Tests effectués (commerçant sans agence)
- [ ] Vérification console F12

---

## 🎯 Améliorations futures (optionnel)

1. **Clic sur l'agence** → Affiche détails (téléphone, adresse)
2. **Tooltip** au survol → Affiche wilaya + code agence
3. **Badge** si plusieurs agences (multi-agence)
4. **Photo de profil** au lieu de l'icône par défaut

---

**Date** : 17 octobre 2025  
**Statut** : ✅ Implémenté - En attente de tests  
**Fichiers modifiés** : `commercant-dashboard.html` (lignes 146-154 et 801-862)
