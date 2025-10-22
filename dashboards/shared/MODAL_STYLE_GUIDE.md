# 🎨 Guide de Style Modal Global

## 📋 Vue d'ensemble

Le fichier `modal-global.css` contient tous les styles pour les modaux du projet. Il garantit une **cohérence visuelle** et un **design moderne** sur tous les dashboards.

---

## 🚀 Comment l'utiliser

### 1. **Inclure le CSS dans votre dashboard**

Ajoutez cette ligne dans le `<head>` de votre fichier HTML :

```html
<link rel="stylesheet" href="../shared/css/modal-global.css" />
```

OU (selon l'emplacement de votre fichier) :

```html
<link rel="stylesheet" href="../../shared/css/modal-global.css" />
```

---

### 2. **Structure HTML du modal**

```html
<!-- Modal Container -->
<div id="monModal" class="modal">
  <div class="modal-content">
    
    <!-- Header -->
    <div class="modal-header">
      <h2><i class="fas fa-box"></i> Titre du Modal</h2>
      <button class="close-button" onclick="closeModal()">&times;</button>
    </div>
    
    <!-- Body -->
    <div class="modal-body">
      <form id="monFormulaire">
        
        <!-- Colonnes (2 colonnes côte à côte) -->
        <div class="form-columns">
          
          <!-- Colonne gauche -->
          <div>
            <!-- Section 1 -->
            <div class="form-section">
              <h3 class="form-section-title">
                <i class="fas fa-user"></i> Section 1
              </h3>
              
              <!-- Ligne avec 2 champs -->
              <div class="form-row">
                <div class="form-group">
                  <label><i class="fas fa-envelope"></i> Email</label>
                  <input type="email" required>
                </div>
                <div class="form-group">
                  <label><i class="fas fa-phone"></i> Téléphone</label>
                  <input type="tel" required>
                </div>
              </div>
              
              <!-- Ligne avec 1 champ pleine largeur -->
              <div class="form-row">
                <div class="form-group" style="grid-column: 1 / -1;">
                  <label><i class="fas fa-map"></i> Adresse</label>
                  <textarea required></textarea>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Colonne droite -->
          <div>
            <!-- Section 2 -->
            <div class="form-section">
              <h3 class="form-section-title">
                <i class="fas fa-calculator"></i> Résumé
              </h3>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Prix</label>
                  <p class="montant">1500 DA</p>
                </div>
              </div>
              
              <div class="form-row total-row">
                <div class="form-group">
                  <label>Total</label>
                  <p class="montant total">2000 DA</p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </form>
    </div>
    
    <!-- Footer -->
    <div class="modal-footer">
      <button type="submit" class="btn-primary">Enregistrer</button>
      <button type="button" class="btn-secondary" onclick="closeModal()">Annuler</button>
    </div>
    
  </div>
</div>
```

---

## 🎨 Classes disponibles

### **Structure principale**
| Classe | Description |
|--------|-------------|
| `.modal` | Conteneur principal (fond sombre avec blur) |
| `.modal-content` | Boîte blanche du modal (max-width: 850px) |
| `.modal-header` | En-tête vert avec gradient |
| `.modal-body` | Corps du modal avec scroll si nécessaire |
| `.modal-footer` | Pied de page avec boutons |

### **Formulaire**
| Classe | Description |
|--------|-------------|
| `.form-columns` | Grille 2 colonnes (responsive: 1 colonne sur mobile) |
| `.form-section` | Section blanche avec ombre |
| `.form-section-title` | Titre de section avec icône |
| `.form-row` | Ligne avec 2 champs (ou 1 pleine largeur) |
| `.form-group` | Groupe label + input |

### **Éléments**
| Classe | Description |
|--------|-------------|
| `.montant` | Affichage d'un montant avec bordure pointillée |
| `.montant.total` | Montant total (fond vert, texte blanc) |
| `.total-row` | Ligne pour le total (pleine largeur) |

### **Boutons**
| Classe | Description |
|--------|-------------|
| `.btn-primary` | Bouton principal (vert gradient) |
| `.btn-secondary` | Bouton secondaire (gris) |
| `.close-button` | Bouton fermer (×) dans le header |

---

## 📐 Dimensions et espacements

### **Modal**
- Largeur : `95%` (max: `850px`)
- Padding body : `10px`
- Border-radius : `20px`

### **Sections**
- Padding : `10px`
- Margin-bottom : `8px`
- Gap entre colonnes : `8px`

### **Champs**
- Font-size label : `11px`
- Font-size input : `12px`
- Padding input : `6px 8px`
- Gap entre champs : `6px`

### **Titres**
- Header h2 : `18px`
- Section title : `12px`

---

## 📱 Responsive

### **Tablette (≤768px)**
- Colonnes : `2` → `1` colonne
- Boutons : pleine largeur

### **Mobile (≤480px)**
- Titres réduits
- Espacements compacts

---

## ✅ Dashboards compatibles

Ce style global peut être utilisé dans :
- ✅ Dashboard Admin
- ✅ Dashboard Agent
- ✅ Dashboard Agence
- ✅ Dashboard Commerçant
- ✅ Tous les futurs dashboards

---

## 🔧 Personnalisation

### **Couleur principale**
Pour changer le vert foncé (`#0b2b24`), remplacez :
```css
background: linear-gradient(135deg, #0b2b24, #0d4a3d);
border-bottom: 2px solid #0b2b24;
```

### **Largeur du modal**
Pour un modal plus large/étroit :
```css
.modal-content {
  max-width: 1000px; /* au lieu de 850px */
}
```

---

## 📝 Exemple complet

Voir le fichier **commercant-dashboard.html** pour un exemple complet d'utilisation du formulaire de création de colis.

---

## 🐛 Dépannage

**Problème** : Le modal est trop large
**Solution** : Réduire `max-width` dans `.modal-content`

**Problème** : Scroll horizontal sur mobile
**Solution** : Les colonnes passent automatiquement en 1 colonne ≤768px

**Problème** : Styles écrasés par un autre CSS
**Solution** : Charger `modal-global.css` **après** les autres CSS

---

## 📞 Support

Pour toute question ou amélioration, contactez l'équipe de développement.

---

**Dernière mise à jour** : 17 octobre 2025
