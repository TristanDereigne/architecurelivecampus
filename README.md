# Architecture Live Campus - Services d'Image Processing

Ce projet implémente une architecture microservices pour le traitement d'images avec trois services distincts :

## 🏗️ Architecture

### Services

- **Bill** (Port 3000) : Service principal (non modifié)
- **Diego** (Port 3001) : Service de traitement de filtres d'images
- **Elise** (Port 3002) : Service de traitement d'effets d'images

## 🚀 Installation et Démarrage

### Prérequis
- Node.js (version 16 ou supérieure)
- npm ou yarn

### Installation des dépendances

```bash
# Service Diego (Filtres)
cd diego
npm install

# Service Elise (Effets)
cd ../elise
npm install
```

### Démarrage des services

```bash
# Service Diego
cd diego
npm run dev

# Service Elise (dans un autre terminal)
cd elise
npm run dev
```

## 📚 API Documentation

### Service Diego - Filtres d'Images

**Endpoint :** `POST http://localhost:3001/api/v1/actions`

**Documentation Swagger :** http://localhost:3001/api-docs

**Exemple de requête :**
```json
{
  "metadata": {
    "party_id": "154247",
    "task_id": "45659"
  },
  "data": {
    "Image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA...",
    "transformation": "filter",
    "type_id": "3",
    "filter_name": "Sepia"
  }
}
```

**Réponse de succès (200) :**
```json
{
  "metadata": {
    "party_id": "154247",
    "task_id": "45659"
  },
  "data": {
    "success": true,
    "Image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA..."
  }
}
```

### Service Elise - Effets d'Images

**Endpoint :** `POST http://localhost:3002/api/v1/actions`

**Documentation Swagger :** http://localhost:3002/api-docs

**Exemple de requête :**
```json
{
  "metadata": {
    "party_id": "154247",
    "task_id": "45659"
  },
  "data": {
    "Image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA...",
    "transformation": "effect",
    "type_id": "3",
    "direction": "horizontal"
  }
}
```

**Réponse de succès (200) :**
```json
{
  "metadata": {
    "party_id": "154247",
    "task_id": "45659"
  },
  "data": {
    "success": true,
    "Image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA..."
  }
}
```

## 🔒 Sécurité

### Mesures de sécurité implémentées

1. **Helmet.js** : Headers de sécurité HTTP
2. **CSRF Protection** : Protection contre les attaques CSRF
3. **Validation des entrées** : Validation stricte avec Joi
4. **Limitation de taille** : Limite de 5MB par image
5. **Validation Base64** : Vérification du format des images

### Codes d'erreur

| Code | Description | Message |
|------|-------------|---------|
| 400 | Validation échouée | Erreur de validation des données |
| 400 | Aucune image | No file uploaded |
| 413 | Fichier trop volumineux | The file is too large. Maximum allowed size is 5MB |
| 422 | Base64 invalide | The base64 string provided is invalid or corrupted |
| 500 | Erreur interne | An internal server error occurred |

## 🧪 Tests

### Exécution des tests

```bash
# Service Diego
cd diego
npm test

# Service Elise
cd elise
npm test
```

### Couverture de code

```bash
# Service Diego
cd diego
npm run test:coverage

# Service Elise
cd elise
npm run test:coverage
```

Les tests couvrent :
- ✅ Validation des requêtes
- ✅ Gestion des erreurs
- ✅ Validation des images Base64
- ✅ Limitation de taille des fichiers
- ✅ Réponses de succès

## 📋 Validation des Données

### Service Diego (Filtres)
- `transformation` doit être `"filter"`
- `filter_name` est requis
- `Image` doit être un string Base64 valide

### Service Elise (Effets)
- `transformation` doit être `"effect"`
- `direction` doit être `"horizontal"` ou `"vertical"`
- `Image` doit être un string Base64 valide

## 🔧 Configuration

### Variables d'environnement

Les services utilisent les ports suivants par défaut :
- Diego : 3001
- Elise : 3002

### Limites de sécurité
- Taille maximale des images : 5MB
- Format d'image supporté : Base64 avec préfixe `data:image/`

## 📝 Notes de Développement

### Architecture TDD
Le développement suit les principes TDD (Test-Driven Development) :
1. **RED** : Écrire un test qui échoue
2. **GREEN** : Implémenter le code pour faire passer le test
3. **REFACTOR** : Améliorer le code

### Couverture de code
- Objectif : 80% de couverture minimum
- Tous les tests doivent passer avant le merge

### Sécurité
- Scan Semgrep automatique pour détecter les vulnérabilités
- Validation stricte de toutes les entrées
- Protection CSRF sur tous les endpoints

## 🚨 Points d'Attention

1. **Clés API** : Ne jamais commiter de clés API ou secrets dans le code
2. **Validation** : Toujours valider les entrées utilisateur
3. **Gestion d'erreurs** : Implémenter une gestion d'erreurs robuste
4. **Tests** : Maintenir une couverture de code élevée
5. **Documentation** : Tenir la documentation Swagger à jour

## 📞 Support

Pour toute question ou problème :
1. Vérifier la documentation Swagger
2. Consulter les logs du service
3. Exécuter les tests pour identifier les problèmes
4. Vérifier la configuration de sécurité 