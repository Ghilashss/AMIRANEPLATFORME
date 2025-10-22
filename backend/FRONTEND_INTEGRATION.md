# 🔗 Intégration Frontend-Backend

Ce guide explique comment connecter votre frontend existant au backend API.

## 📋 Étapes d'intégration

### 1. Configuration de base

Créez un fichier `config/api.js` dans votre frontend :

```javascript
// config/api.js
const API_BASE_URL = 'http://localhost:5000/api';

// Helper pour les requêtes authentifiées
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

const api = {
  // URL de base
  baseURL: API_BASE_URL,

  // Helper pour fetch
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Une erreur est survenue');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
};

export default api;
```

---

## 🔐 Authentification

### Modifier votre `login.html` / `script.js`

```javascript
// Remplacer votre fonction de connexion actuelle
async function login(email, password) {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    if (result.success) {
      // Sauvegarder le token et les infos utilisateur
      localStorage.setItem('token', result.data.token);
      localStorage.setItem('user', JSON.stringify(result.data));
      
      // Rediriger selon le rôle
      switch(result.data.role) {
        case 'admin':
          window.location.href = './dashboards/admin/admin-dashboard.html';
          break;
        case 'agence':
          window.location.href = './dashboards/agence/agence-dashboard.html';
          break;
        case 'agent':
          window.location.href = './dashboards/agent/agent-dashboard.html';
          break;
        case 'commercant':
          window.location.href = './dashboards/commercant/commercant-dashboard.html';
          break;
        default:
          alert('Rôle non reconnu');
      }
    } else {
      alert(result.message || 'Erreur de connexion');
    }
  } catch (error) {
    console.error('Erreur:', error);
    alert('Erreur de connexion au serveur');
  }
}

// Exemple d'utilisation dans le formulaire
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  await login(email, password);
});
```

---

## 📦 Gestion des Colis

### Créer un module `services/colisService.js`

```javascript
// services/colisService.js
import api from '../config/api.js';

const colisService = {
  // Créer un colis
  async createColis(colisData) {
    return await api.request('/colis', {
      method: 'POST',
      body: JSON.stringify(colisData)
    });
  },

  // Obtenir tous les colis
  async getColis(filters = {}) {
    const queryString = new URLSearchParams(filters).toString();
    return await api.request(`/colis?${queryString}`);
  },

  // Obtenir un colis par ID
  async getColisById(id) {
    return await api.request(`/colis/${id}`);
  },

  // Tracker un colis (public)
  async trackColis(tracking) {
    return await fetch(`${api.baseURL}/colis/tracking/${tracking}`)
      .then(res => res.json());
  },

  // Mettre à jour le statut
  async updateStatus(id, status, description) {
    return await api.request(`/colis/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, description })
    });
  },

  // Obtenir les statistiques
  async getStats() {
    return await api.request('/colis/stats');
  }
};

export default colisService;
```

### Exemple d'utilisation dans votre dashboard

```javascript
// Dans dashboard-main.js ou similaire
import colisService from './services/colisService.js';

// Charger les colis
async function loadColis() {
  try {
    const result = await colisService.getColis({
      page: 1,
      limit: 20,
      status: 'en_attente'
    });

    if (result.success) {
      displayColis(result.data);
      updatePagination(result.page, result.pages);
    }
  } catch (error) {
    console.error('Erreur chargement colis:', error);
    alert('Erreur lors du chargement des colis');
  }
}

// Créer un colis
async function createNewColis(formData) {
  try {
    const result = await colisService.createColis({
      destinataire: {
        nom: formData.nom,
        telephone: formData.telephone,
        adresse: formData.adresse,
        wilaya: formData.wilaya,
        commune: formData.commune
      },
      typeLivraison: formData.typeLivraison,
      typeArticle: formData.typeArticle,
      montant: parseFloat(formData.montant),
      poids: parseFloat(formData.poids),
      notes: formData.notes
    });

    if (result.success) {
      alert('Colis créé avec succès! Numéro de tracking: ' + result.data.tracking);
      loadColis(); // Recharger la liste
      closeModal();
    }
  } catch (error) {
    console.error('Erreur création colis:', error);
    alert('Erreur lors de la création du colis');
  }
}

// Charger au démarrage
document.addEventListener('DOMContentLoaded', () => {
  loadColis();
  loadStats();
});
```

---

## 🏢 Gestion des Agences

### Créer `services/agenceService.js`

```javascript
// services/agenceService.js
import api from '../config/api.js';

const agenceService = {
  // Obtenir toutes les agences
  async getAgences(filters = {}) {
    const queryString = new URLSearchParams(filters).toString();
    return await api.request(`/agences?${queryString}`);
  },

  // Créer une agence
  async createAgence(agenceData) {
    return await api.request('/agences', {
      method: 'POST',
      body: JSON.stringify(agenceData)
    });
  },

  // Mettre à jour une agence
  async updateAgence(id, agenceData) {
    return await api.request(`/agences/${id}`, {
      method: 'PUT',
      body: JSON.stringify(agenceData)
    });
  },

  // Supprimer une agence
  async deleteAgence(id) {
    return await api.request(`/agences/${id}`, {
      method: 'DELETE'
    });
  },

  // Obtenir les agences par wilaya (public)
  async getAgencesByWilaya(wilayaCode) {
    return await fetch(`${api.baseURL}/agences/wilaya/${wilayaCode}`)
      .then(res => res.json());
  }
};

export default agenceService;
```

### Remplacer votre système localStorage actuel

```javascript
// Au lieu de:
// const agences = JSON.parse(localStorage.getItem('agences')) || [];

// Utilisez:
async function loadAgences() {
  try {
    const result = await agenceService.getAgences();
    if (result.success) {
      displayAgences(result.data);
    }
  } catch (error) {
    console.error('Erreur:', error);
  }
}

// Créer une agence
async function saveAgence(formData) {
  try {
    const result = await agenceService.createAgence(formData);
    if (result.success) {
      alert('Agence créée avec succès!');
      loadAgences(); // Recharger
    }
  } catch (error) {
    alert('Erreur: ' + error.message);
  }
}
```

---

## 🗺️ Gestion des Wilayas

### Créer `services/wilayaService.js`

```javascript
// services/wilayaService.js
import api from '../config/api.js';

const wilayaService = {
  // Obtenir toutes les wilayas (public)
  async getWilayas() {
    return await fetch(`${api.baseURL}/wilayas`)
      .then(res => res.json());
  },

  // Créer une wilaya (admin)
  async createWilaya(wilayaData) {
    return await api.request('/wilayas', {
      method: 'POST',
      body: JSON.stringify(wilayaData)
    });
  },

  // Mettre à jour les frais (admin)
  async updateFrais(code, frais) {
    return await api.request(`/wilayas/${code}/frais`, {
      method: 'PUT',
      body: JSON.stringify(frais)
    });
  }
};

export default wilayaService;
```

### Charger les wilayas dans les formulaires

```javascript
// Remplacer le chargement depuis localStorage
async function loadWilayasInSelect() {
  try {
    const result = await wilayaService.getWilayas();
    
    if (result.success) {
      const select = document.getElementById('wilayaSelect');
      select.innerHTML = '<option value="">Sélectionner une wilaya...</option>';
      
      result.data.forEach(wilaya => {
        const option = document.createElement('option');
        option.value = wilaya.code;
        option.textContent = `${wilaya.code} - ${wilaya.nom}`;
        option.dataset.domicile = wilaya.fraisLivraison.domicile;
        option.dataset.stopdesk = wilaya.fraisLivraison.stopDesk;
        select.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Erreur chargement wilayas:', error);
  }
}

// Calculer les frais automatiquement
document.getElementById('wilayaSelect').addEventListener('change', (e) => {
  const option = e.target.selectedOptions[0];
  const typeLivraison = document.getElementById('typeLivraison').value;
  
  const frais = typeLivraison === 'domicile' 
    ? option.dataset.domicile 
    : option.dataset.stopdesk;
  
  document.getElementById('fraisLivraison').value = frais;
});
```

---

## 🔒 Protection des pages

### Middleware d'authentification

```javascript
// utils/auth.js
export function checkAuth() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    window.location.href = '/login.html';
    return null;
  }

  return user;
}

export function requireRole(allowedRoles) {
  const user = checkAuth();
  
  if (!user || !allowedRoles.includes(user.role)) {
    alert('Accès non autorisé');
    window.location.href = '/login.html';
    return false;
  }
  
  return true;
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login.html';
}
```

### Utilisation dans vos dashboards

```javascript
// Au début de admin-dashboard.html
import { requireRole } from './utils/auth.js';

// Vérifier l'accès admin
if (!requireRole(['admin'])) {
  // L'utilisateur sera redirigé automatiquement
}

// Bouton de déconnexion
document.getElementById('logoutBtn').addEventListener('click', () => {
  logout();
});
```

---

## 📊 Statistiques en temps réel

```javascript
// services/statsService.js
import api from '../config/api.js';

const statsService = {
  async getDashboardStats() {
    const [colisStats, agencesCount, wilayasCount] = await Promise.all([
      api.request('/colis/stats'),
      api.request('/agences'),
      api.request('/wilayas')
    ]);

    return {
      colis: colisStats.data,
      totalAgences: agencesCount.count,
      totalWilayas: wilayasCount.count
    };
  }
};

// Utilisation
async function updateDashboard() {
  const stats = await statsService.getDashboardStats();
  
  document.getElementById('totalColis').textContent = stats.colis.total;
  document.getElementById('totalAgences').textContent = stats.totalAgences;
  document.getElementById('totalWilayas').textContent = stats.totalWilayas;
}
```

---

## 🔄 Migration progressive

Vous pouvez migrer progressivement de localStorage vers l'API:

1. **Phase 1:** Commencer par l'authentification
2. **Phase 2:** Migrer les wilayas (lecture seule)
3. **Phase 3:** Migrer les agences
4. **Phase 4:** Migrer les colis
5. **Phase 5:** Supprimer tout le code localStorage

---

## 🐛 Débogage

### Activer les logs

```javascript
// config/api.js - ajouter du logging
const api = {
  async request(endpoint, options = {}) {
    console.log(`📡 API Request: ${options.method || 'GET'} ${endpoint}`);
    console.log('📦 Data:', options.body);
    
    const response = await fetch(url, config);
    const data = await response.json();
    
    console.log('✅ API Response:', data);
    return data;
  }
};
```

### Gérer les erreurs réseau

```javascript
async function loadData() {
  try {
    const result = await colisService.getColis();
    displayData(result.data);
  } catch (error) {
    if (error.message.includes('fetch')) {
      alert('Erreur de connexion au serveur. Vérifiez que le backend est démarré.');
    } else {
      alert('Erreur: ' + error.message);
    }
  }
}
```

---

## ✅ Checklist d'intégration

- [ ] Backend démarré sur `http://localhost:5000`
- [ ] Configuration API créée (`config/api.js`)
- [ ] Services créés (colis, agence, wilaya)
- [ ] Authentification modifiée pour utiliser l'API
- [ ] Token JWT sauvegardé dans localStorage
- [ ] Headers Authorization ajoutés aux requêtes
- [ ] Gestion des erreurs implémentée
- [ ] Test de toutes les fonctionnalités
- [ ] Suppression du code localStorage obsolète

---

## 📞 Besoin d'aide?

- Vérifiez que le backend est démarré
- Ouvrez la console du navigateur (F12)
- Regardez les logs réseau (onglet Network)
- Vérifiez les erreurs dans le terminal backend

---

**Bonne intégration! 🚀**
