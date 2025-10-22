# 🐛 DEBUG: Bordereau N/A - Guide de Test

**Date**: 19/10/2025 22:10
**Problème**: Le bordereau affiche toujours "N/A" pour toutes les données

## 🧪 Tests à Effectuer

### Test 1: Vérifier les Logs Console

1. **Ouvrir le dashboard commerçant**
   ```
   http://localhost:9000/dashboards/commercant/commercant-dashboard.html
   ```

2. **Ouvrir la console du navigateur**
   - Appuyez sur `F12`
   - Allez dans l'onglet "Console"

3. **Cliquer sur le bouton "Imprimer" d'un colis**

4. **Regarder les logs dans la console**. Vous devriez voir:
   ```
   🖨️ Impression bordereau colis: [ID_DU_COLIS]
   📡 Réponse colis: 200
   📦 Données colis brutes: { ... }
   📦 Structure expediteur: { ... }
   📦 Structure destinataire: { ... }
   🌍 Code wilaya expéditeur: XX
   🌍 Code wilaya destinataire: YY
   📦 Données colis adaptées: { ... }
   🔍 Vérification des données clés:
      - ref: TRK...
      - commercant: [NOM]
      - commercantTel: [TEL]
      - client: [NOM]
      - tel: [TEL]
      - wilayaExp: [NOM_WILAYA]
      - wilayaDest: [NOM_WILAYA]
      - montant: [MONTANT]
   ```

5. **Copier-coller TOUS les logs** de la console et les envoyer pour analyse

---

### Test 2: Vérifier la Structure des Données API

1. **Ouvrir une nouvelle fenêtre de navigateur**

2. **Aller sur l'onglet "Network" (Réseau) dans F12**

3. **Cliquer sur "Imprimer"**

4. **Dans l'onglet Network, chercher la requête** qui ressemble à:
   ```
   GET http://localhost:1000/api/colis/[ID]
   ```

5. **Cliquer sur cette requête et regarder l'onglet "Response"**

6. **Copier la réponse JSON complète** et l'envoyer

---

### Test 3: Vérifier les Données dans MongoDB

Si vous avez MongoDB Compass installé:

1. **Ouvrir MongoDB Compass**

2. **Se connecter à** `mongodb://localhost:27017`

3. **Ouvrir la base** `amirane-express`

4. **Ouvrir la collection** `colis`

5. **Cliquer sur un document colis**

6. **Copier le JSON complet** du colis

---

## 🔍 Ce que Je Cherche

Pour débugger efficacement, j'ai besoin de voir:

### 1. La Structure Exacte du Colis MongoDB
```json
{
  "_id": "...",
  "tracking": "TRK...",
  "expediteur": {
    "id": "...",
    "nom": "???",        ← EST-CE QUE C'EST REMPLI?
    "telephone": "???",  ← EST-CE QUE C'EST REMPLI?
    "wilaya": "???"      ← EST-CE QUE C'EST REMPLI?
  },
  "destinataire": {
    "nom": "???",        ← EST-CE QUE C'EST REMPLI?
    "telephone": "???",  ← EST-CE QUE C'EST REMPLI?
    "wilaya": "???",     ← EST-CE QUE C'EST REMPLI?
    "adresse": "???"     ← EST-CE QUE C'EST REMPLI?
  },
  "montant": ???,
  "fraisLivraison": ???,
  "typeLivraison": "???"
}
```

### 2. Les Logs de la Console
- Est-ce que `colis.expediteur` est un objet?
- Est-ce que `colis.destinataire` est un objet?
- Est-ce que les codes wilaya sont des strings comme "15", "16"?
- Est-ce que `colisAdapte` contient les bonnes valeurs?

---

## 🎯 Hypothèses Actuelles

### Hypothèse 1: Les Données ne Sont Pas Créées Correctement
**Symptôme**: `colis.expediteur.nom` est `undefined` ou `null`
**Cause**: Le formulaire de création ne remplit pas les champs `expediteur` et `destinataire`
**Solution**: Corriger le contrôleur `colisController.js`

### Hypothèse 2: L'Adaptation ne Fonctionne Pas
**Symptôme**: `colisAdapte.commercant` est `undefined` même si `colis.expediteur.nom` existe
**Cause**: Problème de syntaxe dans l'adaptation (optional chaining `?.`)
**Solution**: Modifier la logique d'adaptation

### Hypothèse 3: Les Codes Wilaya ne Sont Pas Valides
**Symptôme**: `wilayaExpCode` est `undefined` ou un format incorrect
**Cause**: Le champ `wilaya` n'est pas rempli ou a un mauvais format
**Solution**: Vérifier le formulaire et la validation

---

## 📝 Actions Immédiates

1. **Rechargez la page** commerçant (F5)
2. **Ouvrez la console** (F12)
3. **Cliquez sur "Imprimer"** sur un colis
4. **Envoyez-moi**:
   - 📸 Screenshot de la console avec tous les logs
   - 📋 Copie du texte des logs
   - 📦 JSON de la réponse API (onglet Network)

---

## 🔧 Modifications Récentes Appliquées

### Changement 1: Prioriser expediteur/destinataire
```javascript
// AVANT (incorrect)
wilayaExpCode = colis.wilayaSource || colis.wilayaExp || colis.wilayaDepart;
commercant: colis.nomExp || colis.expediteur?.nom || ...

// APRÈS (correct)
wilayaExpCode = colis.expediteur?.wilaya || colis.wilayaSource || colis.wilayaExp;
commercant: colis.expediteur?.nom || colis.nomExp || 'Commerçant';
```

### Changement 2: Logs de Debug
Ajout de logs pour voir la structure exacte:
```javascript
console.log('📦 Structure expediteur:', colis.expediteur);
console.log('📦 Structure destinataire:', colis.destinataire);
console.log('🌍 Code wilaya expéditeur:', wilayaExpCode);
console.log('🌍 Code wilaya destinataire:', wilayaDestCode);
```

### Changement 3: Vérification des Données Adaptées
Logs pour chaque champ important du `colisAdapte`

---

## ⏭️ Prochaine Étape

**Si les logs montrent que les données sont undefined**, je devrai:
1. Vérifier comment le colis est créé dans `colisController.js`
2. Voir si le formulaire envoie les bonnes données
3. Potentiellement corriger la création des objets `expediteur` et `destinataire`

**Si les logs montrent que les données existent mais ne s'affichent pas**, je devrai:
1. Vérifier que `formatText()` dans `ticket.js` reçoit les bonnes valeurs
2. Vérifier que les IDs HTML dans le ticket correspondent
3. Vérifier que le CSS ne cache pas les valeurs

---

## 🆘 Besoin d'Aide

**Envoyez-moi maintenant**:
1. Les logs de la console (après avoir cliqué sur Imprimer)
2. Le JSON de la réponse API (onglet Network → colis/[ID] → Response)

Sans ces informations, je ne peux pas debugger plus précisément!
