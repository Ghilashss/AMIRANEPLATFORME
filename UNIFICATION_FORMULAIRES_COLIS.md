# 🎨 UNIFICATION DES FORMULAIRES DE COLIS

## 📋 Objectif
Uniformiser les 3 formulaires d'ajout de colis (Admin, Agent, Commerçant) avec le design du formulaire commerçant.

## 🎯 Design Commerçant (Référence)

### Structure HTML
```html
<div id="colisModal" class="modal">
  <div class="modal-content">
    <div class="modal-header">
      <h2>Ajouter un Colis</h2>
      <span class="close-button">&times;</span>
    </div>
    <div class="modal-body">
      <form id="colisForm" class="param-form">
        <div class="form-columns">
          <!-- Colonne gauche -->
          <div>
            <!-- Expéditeur -->
            <div class="form-section">
              <h3 class="form-section-title">
                <i class="fas fa-warehouse"></i>Expéditeur
              </h3>
              <!-- Champs expéditeur -->
            </div>
            
            <!-- Type de livraison -->
            <div class="form-section">
              <h3 class="form-section-title">
                <i class="fas fa-truck"></i>Type de livraison
              </h3>
              <!-- Champs type -->
            </div>
            
            <!-- Détails du colis -->
            <div class="form-section">
              <h3 class="form-section-title">
                <i class="fas fa-box"></i>Détails du colis
              </h3>
              <!-- Champs colis -->
            </div>
          </div>
          
          <!-- Colonne droite -->
          <div>
            <!-- Destinataire -->
            <div class="form-section">
              <h3 class="form-section-title">
                <i class="fas fa-user"></i>Destinataire
              </h3>
              <!-- Champs destinataire -->
            </div>
            
            <!-- Résumé des frais -->
            <div class="form-section">
              <h3 class="form-section-title">
                <i class="fas fa-calculator"></i>Résumé des frais
              </h3>
              <!-- Calcul frais -->
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button type="submit" class="btn-primary">Créer le colis</button>
        </div>
      </form>
    </div>
  </div>
</div>
```

### Caractéristiques
- ✅ Layout en 2 colonnes (`.form-columns`)
- ✅ Sections avec titres et icônes (`.form-section`, `.form-section-title`)
- ✅ Organisation logique : Expéditeur | Destinataire
- ✅ Résumé des frais en temps réel
- ✅ Bouton vert style uniforme (`.btn-primary`)
- ✅ Animations fade-in

## 📝 Modifications à faire

### 1. Admin Dashboard
**Fichier**: `dashboards/admin/admin-dashboard.html`
- Remplacer le formulaire actuel par la structure commerçant
- Conserver le champ `bureauSource` (dropdown des agences)
- Ajouter le résumé des frais

### 2. Agent Dashboard  
**Fichier**: `dashboards/agent/agent-dashboard.html`
- Remplacer le formulaire actuel par la structure commerçant
- Auto-remplir `bureauSource` avec l'agence de l'agent (disabled)
- Ajouter le résumé des frais

### 3. CSS Commun
**Créer**: `dashboards/shared/css/colis-form.css`
- Extraire tous les styles du formulaire commerçant
- Inclure dans les 3 dashboards

## ⚙️ Plan d'Action

1. ✅ Créer `dashboards/shared/css/colis-form.css`
2. ✅ Extraire le HTML du modal commerçant
3. ✅ Remplacer dans admin-dashboard.html
4. ✅ Remplacer dans agent-dashboard.html
5. ✅ Tester les 3 formulaires
6. ✅ Vérifier le calcul des frais
7. ✅ Vérifier la soumission API

## 🎨 Styles Clés

```css
.form-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.form-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  animation: fadeInUp 0.5s ease-out;
}

.form-section-title {
  font-size: 16px;
  font-weight: 600;
  color: #0b2b24;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.montant {
  font-size: 20px;
  font-weight: 700;
  color: #0b2b24;
  margin: 8px 0;
}

.montant.total {
  font-size: 24px;
  color: #16a34a;
}

.btn-primary {
  background: #0b2b24;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary:hover {
  background: #0a241f;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(11, 43, 36, 0.3);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .form-columns {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
```

## 🔄 État Actuel

- ❌ Admin : formulaire basique sans style
- ❌ Agent : formulaire basique sans style  
- ✅ Commerçant : formulaire avec design complet

## ✅ État Cible

- ✅ Admin : même design que commerçant
- ✅ Agent : même design que commerçant
- ✅ Commerçant : inchangé (référence)
- ✅ CSS partagé pour cohérence
