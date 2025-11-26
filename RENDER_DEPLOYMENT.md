# Guide de Déploiement TERANGASCHOOL sur Render

## Prérequis

Avant de commencer, assurez-vous d'avoir :
- Un compte Render (https://render.com)
- Le code source poussé sur GitHub

## Configuration Rapide avec render.yaml (Recommandé)

Le fichier `render.yaml` est déjà configuré pour un déploiement automatique.

### Étapes :

1. **Connectez votre repo GitHub à Render**
   - Allez sur https://dashboard.render.com
   - Cliquez sur "New" → "Blueprint"
   - Sélectionnez votre repository GitHub
   - Render détectera automatiquement le fichier `render.yaml`

2. **Confirmez le déploiement**
   - Vérifiez la configuration
   - Cliquez sur "Apply"

## Configuration Manuelle

Si vous préférez configurer manuellement :

### 1. Créer la Base de Données PostgreSQL

1. Dashboard Render → "New" → "PostgreSQL"
2. Configuration :
   - **Name:** terangaschool-db
   - **Database:** terangaschool
   - **User:** terangaschool_user
   - **Region:** Frankfurt (EU) ou votre région préférée
   - **Plan:** Free

3. Une fois créée, copiez l'**Internal Database URL**

### 2. Créer le Web Service

1. Dashboard Render → "New" → "Web Service"
2. Connectez votre repository GitHub
3. Configuration :

| Paramètre | Valeur |
|-----------|--------|
| **Name** | terangaschool |
| **Region** | Frankfurt (EU) |
| **Branch** | main |
| **Runtime** | Node |
| **Build Command** | `chmod +x scripts/build.sh && ./scripts/build.sh` |
| **Start Command** | `npm start` |
| **Plan** | Free |

### 3. Variables d'Environnement

Dans l'onglet "Environment" du Web Service, ajoutez :

| Variable | Valeur |
|----------|--------|
| `NODE_ENV` | production |
| `PORT` | 10000 |
| `DATABASE_URL` | [Coller l'Internal Database URL] |
| `SESSION_SECRET` | [Générer une chaîne aléatoire de 32+ caractères] |

Pour générer un SESSION_SECRET sécurisé :
```bash
openssl rand -hex 32
```

## Variables d'Environnement Requises

| Variable | Description | Obligatoire |
|----------|-------------|-------------|
| `DATABASE_URL` | URL de connexion PostgreSQL | ✅ |
| `SESSION_SECRET` | Clé secrète pour les sessions | ✅ |
| `PORT` | Port d'écoute (10000 pour Render) | ✅ |
| `NODE_ENV` | Environnement (production) | ✅ |

## Commandes de Build et Démarrage

### Build Command
```bash
chmod +x scripts/build.sh && ./scripts/build.sh
```

Le script `scripts/build.sh` :
1. Installe toutes les dépendances (y compris les devDependencies)
2. Compile le frontend avec Vite (vers `dist/public/`)
3. Compile le backend avec esbuild (vers `dist/index.js`)
4. Crée le dossier uploads
5. Applique le schéma de base de données

**Note :** Le script utilise les chemins directs vers les binaires (`./node_modules/.bin/vite`) pour éviter les problèmes de PATH.

### Start Command
```bash
npm start
```

Démarre le serveur de production sur le port configuré.

## Structure des Fichiers de Production

Après le build, la structure est :
```
dist/
├── index.js          # Backend compilé
└── public/           # Frontend compilé (assets statiques)
    ├── index.html
    └── assets/
        ├── *.js
        └── *.css
uploads/              # Dossier pour les PDFs uploadés
```

## Vérification du Déploiement

1. **URL de l'application** : `https://terangaschool.onrender.com`

2. **Tester l'API** :
   ```bash
   curl https://terangaschool.onrender.com/api/auth/user
   ```

3. **Vérifier les logs** dans le dashboard Render

## Dépannage

### L'application ne démarre pas

1. Vérifiez les logs dans le dashboard Render
2. Assurez-vous que toutes les variables d'environnement sont définies
3. Vérifiez que la base de données est accessible

### Erreur de base de données

1. Vérifiez que `DATABASE_URL` est correct
2. Assurez-vous que la base de données est dans la même région que le service
3. Utilisez l'**Internal Database URL** (pas l'External)

### Le frontend ne charge pas

1. Vérifiez que le build a réussi
2. Assurez-vous que le dossier `dist/public` existe après le build

## Mise à Jour

Les mises à jour se font automatiquement à chaque push sur la branche main si `autoDeploy: true` est activé.

## Support

Pour toute question, consultez :
- Documentation Render : https://render.com/docs
- Support Render : https://render.com/support

---
**Auteur :** Maodo Ka  
**Application :** TERANGASCHOOL - Plateforme de Cours de Renforcement
