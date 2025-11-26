# Guide de Déploiement TERANGASCHOOL sur Render

## Prérequis

Avant de commencer, assurez-vous d'avoir :
- Un compte Render (https://render.com)
- Le code source poussé sur GitHub

## ⚡ Configuration Rapide (Déploiement Manuel)

### Étape 1: Créer la Base de Données PostgreSQL

1. Dashboard Render → **New +** → **PostgreSQL**
2. Configuration :
   - **Name:** terangaschool-db
   - **Database:** terangaschool
   - **User:** terangaschool_user
   - **Region:** Frankfurt (EU)
   - **Plan:** Free

3. **IMPORTANT:** Une fois créée, copiez l'**Internal Database URL** depuis l'onglet "Info" ou "Connect"
   - Elle ressemble à : `postgres://terangaschool_user:xxxxx@dpg-xxxxx-a.frankfurt-postgres.render.com/terangaschool`

### Étape 2: Créer le Web Service

1. Dashboard Render → **New +** → **Web Service**
2. Connectez votre repository GitHub
3. Configuration :

| Paramètre | Valeur |
|-----------|--------|
| **Name** | terangaschool |
| **Region** | Frankfurt (EU) - **MÊME RÉGION que la base de données!** |
| **Branch** | main |
| **Runtime** | Node |
| **Build Command** | `chmod +x scripts/build.sh && chmod +x scripts/start.sh && ./scripts/build.sh` |
| **Start Command** | `./scripts/start.sh` |
| **Plan** | Free |

### Étape 3: Variables d'Environnement

Dans l'onglet **Environment** du Web Service, ajoutez ces 4 variables :

| Variable | Valeur |
|----------|--------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `DATABASE_URL` | *Collez l'Internal Database URL copiée à l'étape 1* |
| `SESSION_SECRET` | *Générez une clé secrète (voir ci-dessous)* |

**Pour générer un SESSION_SECRET sécurisé :**
```bash
openssl rand -hex 32
```
Ou utilisez n'importe quelle chaîne aléatoire de 32+ caractères.

### Étape 4: Déployer

Cliquez sur **Manual Deploy** → **Deploy latest commit**

---

## 🔧 Configuration avec Blueprint (Automatique)

Le fichier `render.yaml` est préconfiguré pour un déploiement automatique.

1. Dashboard Render → **New +** → **Blueprint**
2. Sélectionnez votre repository GitHub
3. Render détectera automatiquement le fichier `render.yaml`
4. Cliquez sur **Apply**

Cela créera automatiquement :
- La base de données PostgreSQL
- Le Web Service avec toutes les variables d'environnement

---

## 📦 Fichiers de Déploiement

| Fichier | Description |
|---------|-------------|
| `render.yaml` | Configuration Blueprint pour déploiement automatique |
| `scripts/build.sh` | Script de compilation (frontend + backend) |
| `scripts/start.sh` | Script de démarrage avec sync de la base de données |
| `vite.config.render.ts` | Configuration Vite sans plugins Replit |
| `.node-version` | Spécifie Node.js 20.18.0 |

---

## ✅ Vérification du Déploiement

1. **URL de l'application** : `https://terangaschool.onrender.com`

2. **Tester le healthcheck** :
   ```bash
   curl https://terangaschool.onrender.com/api/health
   ```
   Doit retourner : `{"status":"ok","timestamp":"..."}`

3. **Vérifier les logs** dans Dashboard → Votre Service → Logs

---

## 🐛 Dépannage

### ❌ Erreur: "DATABASE_URL must be set"

**Cause :** La variable DATABASE_URL n'est pas configurée.

**Solution :**
1. Allez dans votre Web Service → Environment
2. Vérifiez que `DATABASE_URL` existe et contient l'Internal Database URL
3. Cliquez sur "Save Changes" puis "Manual Deploy"

### ❌ Erreur de connexion SSL

**Cause :** La base de données Render requiert SSL.

**Solution :** Le code a été mis à jour pour gérer automatiquement SSL en production. Assurez-vous d'avoir la dernière version du code.

### ❌ Le frontend ne charge pas

**Cause :** Le build n'a pas créé les fichiers frontend.

**Solution :**
1. Vérifiez les logs du build
2. Assurez-vous que `dist/public/` existe après le build

### ❌ Erreur 502 Bad Gateway

**Cause :** L'application ne démarre pas sur le bon port.

**Solution :**
1. Vérifiez que `PORT=10000` est défini
2. Vérifiez les logs pour voir les erreurs de démarrage

### ❌ La base de données n'est pas synchronisée

**Cause :** Les tables n'ont pas été créées.

**Solution :** Le script de démarrage exécute automatiquement `drizzle-kit push`. Si cela échoue :
1. Allez dans le Shell de votre service (Dashboard → Shell)
2. Exécutez : `npx drizzle-kit push`

---

## 🔄 Mise à Jour

Les mises à jour se font automatiquement à chaque push sur la branche main si `autoDeploy: true` est activé dans render.yaml.

---

## 📋 Checklist de Déploiement

- [ ] Base de données PostgreSQL créée sur Render
- [ ] Internal Database URL copiée
- [ ] Web Service créé et connecté au repo GitHub
- [ ] Variables d'environnement configurées (NODE_ENV, PORT, DATABASE_URL, SESSION_SECRET)
- [ ] Build Command: `chmod +x scripts/build.sh && chmod +x scripts/start.sh && ./scripts/build.sh`
- [ ] Start Command: `./scripts/start.sh`
- [ ] Même région pour la base de données et le service
- [ ] Déploiement lancé
- [ ] Healthcheck vérifié: `/api/health`

---

**Auteur :** Maodo Ka  
**Application :** TERANGASCHOOL - Plateforme de Cours de Renforcement
