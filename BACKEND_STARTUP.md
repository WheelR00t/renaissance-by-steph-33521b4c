# 🚀 Guide de Démarrage Backend

## ✅ Backend 100% Connecté à la DB - Toutes les données mockées supprimées !

Toutes les données factices ont été supprimées du frontend. Désormais, **TOUT** vient de ta base de données SQLite :
- ✅ Services
- ✅ Réservations  
- ✅ Paiements
- ✅ Dashboard & statistiques
- ✅ Articles de blog
- ✅ Créneaux disponibles
- ✅ Emails automatiques

## 🎯 Pour démarrer ton backend :

### Option 1: Démarrage simple
```bash
cd backend
npm install
node src/app.js
```

### Option 2: Démarrage avec données de démonstration (RECOMMANDÉ)
```bash
cd backend  
npm install
node start-with-data.js
```

Cette option :
- Démarre le serveur sur http://127.0.0.1:3001
- Crée automatiquement des données de test si la DB est vide
- Initialise 3 réservations exemple
- Ajoute 3 articles de blog de démo

## 📋 Données créées automatiquement :

### Admin par défaut :
- **Email:** admin@renaissancebysteph.fr  
- **Mot de passe:** admin123
- **URL Admin:** http://127.0.0.1:3001/admin

### Services pré-configurés :
- Tirage de Cartes (45€, 30-60 min)
- Séance Reiki (60€, 45-90 min) 
- Divination au Pendule (35€, 30-45 min)
- Guérison Énergétique (70€, 60-90 min)

### Réservations de test :
- Marie Dubois - Tarot (confirmée, payée)
- Pierre Martin - Reiki (en attente)
- Sophie Leroy - Pendule (confirmée, payée)

## 🔧 Variables d'environnement requises :

Créer/vérifier `backend/.env` :
```env
PORT=3001
HOST=127.0.0.1
FRONTEND_URL=https://tondomaine.fr

# Stripe (requis pour paiements)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (requis pour confirmations)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=ton@email.com
EMAIL_PASS=motdepasse
```

## 🌐 URLs importantes :

- **Frontend:** https://tondomaine.fr
- **API Backend:** http://127.0.0.1:3001/api
- **Admin Panel:** https://tondomaine.fr/admin
- **Health Check:** http://127.0.0.1:3001/api/health

## ⚠️ Important :

Si le frontend affiche des erreurs de connexion, c'est **NORMAL** - cela signifie que le système fonctionne correctement et force la vraie connexion à la DB au lieu d'utiliser des données factices.

Assure-toi que le backend soit démarré avant d'utiliser le frontend !

## 🐛 Debug :

Si tu as des problèmes :
1. Vérifier les logs du serveur 
2. Tester l'API : `curl http://127.0.0.1:3001/api/health`
3. Vérifier que la DB se crée dans `backend/data/voyance.db`
4. Consulter les logs dans la console du navigateur