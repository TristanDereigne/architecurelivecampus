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
- créer un .env dans les dossiers (elise et diego) et mettre la clé TOKEN

### Installation des dépendances

```bash
# Service Bill
cd bill
npm install

# Service Diego (Filtres)
cd diego
npm install

# Service Elise (Effets)
cd ../elise
npm install
```

### Démarrage des services

```bash
# Service Bill
cd bill
npm run dev

# Service Diego (dans un autre terminal)
cd diego
npm run dev

# Service Elise (dans un autre terminal)
cd elise
npm run dev
```

## 🔒 Sécurité

### Mesures de sécurité implémentées

1. **Validation des entrées** : Validation stricte avec Joi
2. **Limitation de taille** : Limite de 5MB par image
3. **Validation Base64** : Vérification du format des images

### Codes d'erreur

| Code | Description             | Message                                            |
| ---- | ----------------------- | -------------------------------------------------- |
| 400  | Validation échouée      | Erreur de validation des données                   |
| 400  | Aucune image            | No file uploaded                                   |
| 413  | Fichier trop volumineux | The file is too large. Maximum allowed size is 5MB |
| 422  | Base64 invalide         | The base64 string provided is invalid or corrupted |
| 500  | Erreur interne          | An internal server error occurred                  |

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

### CODE de test

# Test de l'API `/api/v1/actions`

## ✅ POST /api/v1/actions

- **URL** : `http://localhost:3000/api/v1/actions`
- **Méthode** : `POST`
- **Headers** :
  - `Content-Type: application/json`
- **Body JSON** :

```json
{
  "metadata": {
    "party_id": "154247"
  },
  "data": {
    "image": "data:image/png;base64",
    "transformation": "filter",
    "type_id": "3",
    "direction": "horizontal"
  }
}
```

- **Exemple de réponse** :

```json
{
  "metadata": {
    "party_id": "154247"
  },
  "data": {
    "success": true,
    "status": "inProgress",
    "task_id": "eb4f904b-273c-479d-a494-6b843cea09e2"
  }
}
```

---

## 🔁 GET /api/v1/actions

- **URL** : `http://localhost:3000/api/v1/actions`
- **Méthode** : `GET`
- **Headers** :
  - `Content-Type: application/json`
- **Body JSON** (si utilisé avec outils comme Postman, REST Client, etc.) :

```json
{
  "metadata": {
    "party_id": "154247",
    "task_id": "eb4f904b-273c-479d-a494-6b843cea09e2"
  },
  "data": {
    "image": "data:image/png;base64",
    "transformation": "effect",
    "type_id": "3",
    "direction": "horizontal"
  }
}
```

- **Exemple de réponse** :

```json
{
  "metadata": {
    "party_id": "154247",
    "task_id": "eb4f904b-273c-479d-a494-6b843cea09e2"
  },
  "data": {
    "success": true,
    "status": "done",
    "image": "data:image/png;base64,iVIiIiion/HyzNjTsXZjBXAAAAAElFTkSuQmCC"
  }
}
```

---

## 💡 Notes

- Le champ `image` doit contenir une vraie image encodée en Base64.
- Le champ `task_id` est fourni dans la réponse du POST.
- Le `GET` utilise ce `task_id` pour vérifier le statut ou récupérer l’image transformée.
