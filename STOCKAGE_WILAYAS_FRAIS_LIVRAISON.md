# 📊 STOCKAGE DES WILAYAS - FRAIS DE LIVRAISON (ADMIN)

## 🎯 RÉPONSE DIRECTE

**Les wilayas dans les Frais de Livraison sont stockées dans l'API (MongoDB) !**

✅ **Source principale:** API Backend MongoDB (`/api/wilayas`)  
💾 **Cache local:** localStorage (pour performance)  
🔄 **Fallback:** Liste hardcodée (si API inaccessible)

---

## 📋 HIÉRARCHIE DE CHARGEMENT

### 1️⃣ Tentative API (Priorité 1)
```javascript
GET http://localhost:1000/api/wilayas
Headers: Authorization: Bearer <token>
```

**Si succès:**
- ✅ Charge les wilayas depuis MongoDB
- ✅ Sauvegarde dans localStorage pour cache
- ✅ Utilise ces données

### 2️⃣ Cache localStorage (Priorité 2)
```javascript
localStorage.getItem('wilayas')
```

**Si API échoue:**
- 💡 Charge depuis le cache local
- ⚠️ Données potentiellement obsolètes

### 3️⃣ Fallback hardcodé (Priorité 3)
```javascript
const WILAYAS_FALLBACK = [
    { code: "01", nom: "Adrar" },
    { code: "02", nom: "Chlef" },
    // ... 58 wilayas
];
```

**Si tout échoue:**
- 🆘 Utilise la liste hardcodée
- ⚠️ Pas de données personnalisées

---

## 🔍 CODE SOURCE

**Fichier:** `dashboards/admin/js/frais-livraison.js`

### Fonction de chargement (lignes 64-121):

```javascript
async function loadWilayasFromAPI() {
    console.log('🔍 Chargement des wilayas depuis l\'API backend...');
    
    try {
        const token = sessionStorage.getItem('auth_token') || localStorage.getItem('admin_token');
        if (!token) {
            console.warn('⚠️ Pas de token, utilisation des wilayas fallback');
            WILAYAS_ALGERIE = WILAYAS_FALLBACK;
            return WILAYAS_ALGERIE;
        }
        
        // 1️⃣ APPEL API
        const response = await fetch('http://localhost:1000/api/wilayas', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        const wilayasFromAPI = result.data || result.wilayas || [];
        
        if (wilayasFromAPI.length > 0) {
            WILAYAS_ALGERIE = wilayasFromAPI;
            
            // 💾 SAUVEGARDE DANS CACHE
            localStorage.setItem('wilayas', JSON.stringify(WILAYAS_ALGERIE));
            console.log('✅ ' + WILAYAS_ALGERIE.length + ' wilayas chargées depuis l\'API');
        } else {
            // 3️⃣ FALLBACK SI VIDE
            WILAYAS_ALGERIE = WILAYAS_FALLBACK;
        }
        
        return WILAYAS_ALGERIE;
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement des wilayas depuis l\'API:', error);
        
        // 2️⃣ ESSAYER LE CACHE
        const cachedWilayas = localStorage.getItem('wilayas');
        if (cachedWilayas) {
            console.log('💡 Utilisation des wilayas en cache...');
            WILAYAS_ALGERIE = JSON.parse(cachedWilayas);
        } else {
            // 3️⃣ FALLBACK
            console.log('💡 Utilisation des wilayas fallback...');
            WILAYAS_ALGERIE = WILAYAS_FALLBACK;
        }
        
        return WILAYAS_ALGERIE;
    }
}
```

---

## 🗄️ BACKEND API

**Endpoint:** `/api/wilayas`  
**Fichier:** `backend/routes/wilayas.js`  
**Base de données:** MongoDB collection `wilayas`

### Structure d'une wilaya:
```javascript
{
  _id: "67...",
  code: "15",
  nom: "Tizi Ouzou",
  nomAr: "تيزي وزو",
  createdAt: "2025-01-...",
  updatedAt: "2025-01-..."
}
```

### Réponse API:
```javascript
{
  success: true,
  count: 58,
  data: [
    { code: "01", nom: "Adrar", nomAr: "أدرار" },
    { code: "02", nom: "Chlef", nomAr: "الشلف" },
    // ... 58 wilayas
  ]
}
```

---

## 💾 CACHE localStorage

**Clé:** `'wilayas'`  
**Format:** JSON stringifié  
**Expiration:** Aucune (manuel)

### Avantages:
✅ Performance (pas d'appel API à chaque fois)  
✅ Disponibilité offline (si cache existe)  
✅ Réduction de la charge serveur

### Inconvénients:
⚠️ Peut être obsolète si wilayas modifiées dans MongoDB  
⚠️ Prend de l'espace navigateur (~10KB)

### Comment vider le cache:
```javascript
localStorage.removeItem('wilayas');
```

---

## 🔄 FRAIS DE LIVRAISON

Les **frais de livraison** eux-mêmes sont **TOUJOURS** chargés depuis l'API :

**Endpoint:** `/api/frais-livraison`  
**Fichier:** `backend/routes/fraisLivraison.js`  
**Collection:** MongoDB `fraislivraison`

### Structure d'un frais:
```javascript
{
  _id: "67...",
  wilayaCode: "15",
  wilayaText: "Tizi Ouzou",
  prixBase: 600,
  prixParKg: 50,
  supplementFragile: 150,
  delaiLivraison: "2-3 jours",
  createdAt: "...",
  updatedAt: "..."
}
```

### Chargement des frais (lignes 135-165):
```javascript
async loadFrais() {
    console.log('🔍 Chargement des frais depuis l\'API...');
    try {
        const token = sessionStorage.getItem('auth_token') || localStorage.getItem('admin_token');
        
        const response = await fetch('http://localhost:1000/api/frais-livraison', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        this.frais = result.data || result.fraisLivraison || result || [];
        
        console.log('✅ ' + this.frais.length + ' frais de livraison chargés');
        displayFrais(this.frais);
        
        return this.frais;
    } catch (error) {
        console.error('❌ Erreur chargement frais:', error);
        return [];
    }
}
```

**⚠️ IMPORTANT:** Les frais ne sont PAS mis en cache localStorage, ils sont toujours frais (à jour) depuis l'API !

---

## 📊 COMPARAISON

| Donnée | Source | Cache localStorage | Fallback |
|--------|--------|-------------------|----------|
| **Wilayas** | ✅ API `/api/wilayas` | ✅ Oui (`'wilayas'`) | ✅ Oui (hardcodé) |
| **Frais de livraison** | ✅ API `/api/frais-livraison` | ❌ Non | ❌ Non |
| **Agences** | ✅ API `/api/agences` | ✅ Oui (`'agences'`) | ❌ Non |
| **Colis** | ✅ API `/api/colis` | ❌ Non | ❌ Non |
| **Utilisateurs** | ✅ API `/api/users` | ❌ Non | ❌ Non |

---

## 🧪 TESTER LE CHARGEMENT

### Test 1: Vérifier la source actuelle

Ouvrez la console Admin (`F12`) et tapez:

```javascript
console.log('Wilayas actuelles:', WILAYAS_ALGERIE);
console.log('Source:', WILAYAS_ALGERIE === WILAYAS_FALLBACK ? 'FALLBACK' : 'API/CACHE');
```

### Test 2: Vider le cache et recharger

```javascript
localStorage.removeItem('wilayas');
location.reload();
```

Observez les logs:
```
🔍 Chargement des wilayas depuis l'API backend...
✅ 58 wilayas chargées depuis l'API
💾 Sauvegarde dans localStorage
```

### Test 3: Simuler une panne API

1. Arrêter le backend (`Ctrl+C` dans le terminal backend)
2. Recharger la page Admin
3. Observer les logs:
```
❌ Erreur lors du chargement des wilayas depuis l'API
💡 Utilisation des wilayas en cache...
```

### Test 4: Vérifier le cache

```javascript
const cache = localStorage.getItem('wilayas');
console.log('Cache existe:', !!cache);
console.log('Taille cache:', cache ? cache.length : 0, 'caractères');
console.log('Nombre wilayas en cache:', cache ? JSON.parse(cache).length : 0);
```

---

## 🔧 MODIFICATIONS POSSIBLES

### Option 1: Forcer le rechargement depuis l'API

Ajoutez un paramètre `force`:

```javascript
async function loadWilayasFromAPI(force = false) {
    if (!force) {
        // Essayer d'abord le cache
        const cachedWilayas = localStorage.getItem('wilayas');
        if (cachedWilayas) {
            WILAYAS_ALGERIE = JSON.parse(cachedWilayas);
            console.log('✅ Wilayas chargées depuis le cache');
            return WILAYAS_ALGERIE;
        }
    }
    
    // Sinon, charger depuis l'API...
}

// Utilisation:
loadWilayasFromAPI(true); // Force l'API
```

### Option 2: Ajouter une expiration au cache

```javascript
// Sauvegarde avec timestamp
localStorage.setItem('wilayas', JSON.stringify(WILAYAS_ALGERIE));
localStorage.setItem('wilayas_timestamp', Date.now().toString());

// Vérification lors du chargement
const cacheTimestamp = localStorage.getItem('wilayas_timestamp');
const cacheAge = Date.now() - parseInt(cacheTimestamp);
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 heures

if (cacheAge > CACHE_EXPIRATION) {
    console.log('💡 Cache expiré, rechargement depuis l\'API...');
    loadWilayasFromAPI(true);
}
```

### Option 3: Ne jamais utiliser le cache

```javascript
// Supprimer ces lignes (93-94):
// localStorage.setItem('wilayas', JSON.stringify(WILAYAS_ALGERIE));

// Et modifier le catch (lignes 110-113):
catch (error) {
    console.error('❌ Erreur:', error);
    WILAYAS_ALGERIE = WILAYAS_FALLBACK; // Direct au fallback
}
```

---

## ✅ RÉSUMÉ

**Question:** Les wilayas dans Frais de Livraison sont stockées dans API ou Local ?

**Réponse:** 
- 🎯 **Source principale:** API MongoDB (`/api/wilayas`)
- 💾 **Cache:** localStorage (pour performance)
- 🆘 **Fallback:** Liste hardcodée (58 wilayas)

**Ordre de priorité:**
1. ✅ API MongoDB (toujours à jour)
2. 💾 Cache localStorage (rapide mais peut être obsolète)
3. 🆘 Liste hardcodée (garantie de fonctionnement)

**Les frais de livraison eux-mêmes sont TOUJOURS chargés depuis l'API (pas de cache).**

---

**Fichiers concernés:**
- `dashboards/admin/js/frais-livraison.js` (logique chargement)
- `backend/routes/wilayas.js` (API)
- `backend/routes/fraisLivraison.js` (API frais)
- `backend/models/Wilaya.js` (modèle MongoDB)
- `backend/models/FraisLivraison.js` (modèle MongoDB)
