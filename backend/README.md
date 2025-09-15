# Backend Renaissance By Steph

Backend Node.js avec SQLite pour le site de voyance.

## 🚀 Installation rapide sur Raspberry Pi

```bash
# 1. Cloner le projet (après export GitHub)
git clone https://github.com/VOTRE-USERNAME/voyance-site.git
cd voyance-site

# 2. Installer Node.js (si pas déjà fait)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Installer les dépendances backend
cd backend
npm install

# 4. Build du frontend
cd ..
npm install
npm run build

# 5. Lancer le serveur complet
cd backend
npm run dev
```

## 📡 Accès

- **Site complet** : http://192.168.1.236:3001
- **API** : http://192.168.1.236:3001/api
- **Test API** : http://192.168.1.236:3001/api/health

## 🗂️ Structure

```
backend/
├── src/
│   ├── app.js              # Serveur Express principal
│   ├── database/
│   │   └── db.js          # Connexion SQLite
│   └── routes/
│       ├── services.js    # API services
│       ├── calendar.js    # API créneaux
│       └── bookings.js    # API réservations
├── database/
│   └── schema.sql         # Schéma BDD
├── data/                  # Base SQLite (auto-créée)
├── .env                   # Configuration
└── package.json
```

## 🛠️ Commandes utiles

```bash
# Développement
npm run dev

# Production avec PM2
npm install -g pm2
pm2 start src/app.js --name voyance-site
pm2 startup
pm2 save

# Rebuild frontend + redémarrage
npm run deploy

# Logs
pm2 logs voyance-site

# Backup base de données
cp data/voyance.db backup-$(date +%Y%m%d).db
```

## 🔧 Configuration

Modifier le fichier `.env` pour adapter :
- Ports
- Chemins
- Clés API (Stripe, Email, etc.)

## 📊 Base de données

SQLite avec tables :
- `services` : Services proposés
- `bookings` : Réservations
- `users` : Utilisateurs (admin/clients)
- `blog_posts` : Articles blog

La base est automatiquement créée au démarrage avec des données par défaut.