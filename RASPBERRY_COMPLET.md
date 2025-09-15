# 🍓 Déploiement Complet - Frontend + Backend sur Raspberry Pi

## 🎯 Architecture finale
- **Frontend React** : http://192.168.1.236:3000
- **Backend API** : http://192.168.1.236:3001  
- **Base SQLite** : Locale sur la Pi

---

## 📁 Structure du projet sur la Raspberry Pi

```
/home/pi/voyance-complete/
├── frontend/          # Export de votre projet Lovable
├── backend/           # API Node.js + SQLite
└── nginx.conf         # Configuration nginx (optionnel)
```

---

## 🚀 ÉTAPE 1 : Préparer la Raspberry Pi

```bash
# Se connecter à votre Raspberry Pi
ssh pi@192.168.1.236

# Installer Node.js + Build tools
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs git nginx
sudo npm install -g pm2

# Créer la structure
mkdir -p /home/pi/voyance-complete
cd /home/pi/voyance-complete
```

---

## 🎯 ÉTAPE 2 : Export depuis Lovable

### A. Dans Lovable (interface web) :
1. **Cliquez sur le bouton GitHub** en haut à droite
2. **"Transfer to GitHub"** → Créez un repo (ex: `voyance-site`)
3. **Clonez sur votre PC** :
```bash
git clone https://github.com/VOTRE-USERNAME/voyance-site.git
```

### B. Transférer vers la Raspberry Pi :
```bash
# Depuis votre PC
scp -r voyance-site/ pi@192.168.1.236:/home/pi/voyance-complete/frontend/

# OU directement cloner sur la Pi
ssh pi@192.168.1.236
cd /home/pi/voyance-complete
git clone https://github.com/VOTRE-USERNAME/voyance-site.git frontend
```

---

## 🛠️ ÉTAPE 3 : Configuration Backend

```bash
# Sur la Raspberry Pi
cd /home/pi/voyance-complete
mkdir backend && cd backend

# Initialiser le backend
npm init -y
npm install express sqlite3 cors helmet morgan compression dotenv stripe nodemailer uuid serve-static
npm install --save-dev nodemon
```

### A. Créer `backend/.env` :
```bash
cat > .env << 'EOF'
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Chemins
DB_PATH=./data/voyance.db
FRONTEND_PATH=../frontend/dist

# URLs
FRONTEND_URL=http://192.168.1.236:3000
BACKEND_URL=http://192.168.1.236:3001
EOF
```

### B. Créer `backend/database/schema.sql` :
```bash
mkdir database
cat > database/schema.sql << 'EOF'
-- Table services
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  duration TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table bookings
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  service_id TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  message TEXT,
  booking_type TEXT CHECK(booking_type IN ('guest', 'registered')) NOT NULL,
  status TEXT CHECK(status IN ('pending', 'confirmed', 'cancelled')) DEFAULT 'pending',
  payment_status TEXT CHECK(payment_status IN ('pending', 'paid', 'failed')) DEFAULT 'pending',
  price REAL NOT NULL,
  confirmation_token TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  visio_link TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services (id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_token ON bookings(confirmation_token);

-- Services par défaut
INSERT OR IGNORE INTO services (id, name, description, price, duration) VALUES
('tarot', 'Tirage de Cartes', 'Révélez votre avenir grâce aux messages des cartes', 45.00, '30-60 min'),
('reiki', 'Séance Reiki', 'Harmonisez vos énergies et retrouvez l''équilibre', 60.00, '45-90 min'),
('pendule', 'Divination au Pendule', 'Obtenez des réponses précises à vos questions', 35.00, '30-45 min'),
('guerison', 'Guérison Énergétique', 'Soins énergétiques pour libérer les blocages', 70.00, '60-90 min');
EOF
```

### C. Créer `backend/src/database/db.js` :
```bash
mkdir -p src/database
cat > src/database/db.js << 'EOF'
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class Database {
  constructor() {
    const dbPath = path.join(__dirname, '../../data/voyance.db');
    
    // Créer le dossier data
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Erreur SQLite:', err);
      } else {
        console.log('✅ Connecté à SQLite:', dbPath);
        this.initializeSchema();
      }
    });
  }

  initializeSchema() {
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      this.db.exec(schema, (err) => {
        if (err) console.error('❌ Schema error:', err);
        else console.log('✅ Schema SQLite OK');
      });
    }
  }

  query(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
}

module.exports = new Database();
EOF
```

### D. Créer `backend/src/routes/services.js` :
```bash
mkdir -p src/routes
cat > src/routes/services.js << 'EOF'
const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/', async (req, res) => {
  try {
    const services = await db.query(
      'SELECT * FROM services WHERE is_active = 1 ORDER BY name'
    );

    const formatted = services.map(s => ({
      id: s.id,
      name: s.name,
      description: s.description || '',
      price: s.price,
      duration: s.duration,
      isActive: s.is_active === 1
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Erreur services:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
EOF
```

### E. Créer `backend/src/routes/calendar.js` :
```bash
cat > src/routes/calendar.js << 'EOF'
const express = require('express');
const router = express.Router();
const db = require('../database/db');

router.get('/slots', async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: 'Date requise' });
    }

    const baseSlots = [
      "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
      "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", 
      "17:00", "17:30", "18:00", "18:30", "19:00"
    ];

    const booked = await db.query(
      'SELECT time FROM bookings WHERE date = ? AND status != "cancelled"',
      [date]
    );

    const bookedTimes = booked.map(b => b.time);

    const slots = baseSlots.map(time => ({
      time,
      available: !bookedTimes.includes(time),
      booked: bookedTimes.includes(time)
    }));

    res.json(slots);
  } catch (error) {
    console.error('Erreur créneaux:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
EOF
```

### F. Créer `backend/src/app.js` :
```bash
cat > src/app.js << 'EOF'
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const serveStatic = require('serve-static');
require('dotenv').config();

const app = express();

// Middlewares sécurité
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // Pour éviter les conflits avec React
}));

app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes API
app.use('/api/services', require('./routes/services'));
app.use('/api/calendar', require('./routes/calendar'));

// Servir le frontend statique
const frontendPath = path.join(__dirname, process.env.FRONTEND_PATH || '../frontend/dist');
app.use(express.static(frontendPath));

// Route de base API
app.get('/api', (req, res) => {
  res.json({ 
    message: '🍓 API Renaissance By Steph',
    version: '1.0.0',
    frontend: 'http://192.168.1.236:3000',
    backend: 'http://192.168.1.236:3001'
  });
});

// SPA fallback - toutes les autres routes renvoient index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Gestion erreurs
app.use((err, req, res, next) => {
  console.error('❌ Erreur:', err);
  res.status(500).json({ error: 'Erreur serveur' });
});

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`🚀 Serveur complet sur http://192.168.1.236:${PORT}`);
  console.log(`📁 Frontend path: ${frontendPath}`);
});

module.exports = app;
EOF
```

---

## ⚡ ÉTAPE 4 : Build du Frontend

```bash
# Aller dans le dossier frontend
cd /home/pi/voyance-complete/frontend

# Installer les dépendances
npm install

# Créer le build de production
npm run build

# Vérifier que le dossier dist est créé
ls -la dist/
```

---

## 🚀 ÉTAPE 5 : Lancement

### A. Démarrer le backend (qui servira aussi le frontend) :
```bash
cd /home/pi/voyance-complete/backend

# Installer les dépendances backend
npm install

# Lancer en mode dev
npm run dev

# OU en mode production avec PM2
pm2 start src/app.js --name "voyance-site"
pm2 startup
pm2 save
```

### B. Ajouter les scripts dans `backend/package.json` :
```bash
cat > package.json << 'EOF'
{
  "name": "voyance-complete",
  "version": "1.0.0",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "build-frontend": "cd ../frontend && npm run build",
    "deploy": "npm run build-frontend && pm2 restart voyance-site"
  },
  "dependencies": {
    "express": "^4.18.2",
    "sqlite3": "^5.1.6",
    "cors": "^2.8.5", 
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "compression": "^1.7.4",
    "dotenv": "^16.3.1",
    "serve-static": "^1.15.0",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
EOF
```

---

## ✅ ÉTAPE 6 : Test et Vérification

```bash
# Vérifier que tout fonctionne
curl http://192.168.1.236:3001/api
curl http://192.168.1.236:3001/api/services

# Accéder au site complet
# Dans votre navigateur : http://192.168.1.236:3001
```

---

## 🛠️ Commandes de Maintenance

```bash
# Reconstruire le frontend
cd /home/pi/voyance-complete/backend
npm run build-frontend

# Redéployer complètement  
npm run deploy

# Voir les logs
pm2 logs voyance-site

# Redémarrer
pm2 restart voyance-site

# Voir le statut
pm2 status

# Backup de la base
cp /home/pi/voyance-complete/backend/data/voyance.db /home/pi/backup-$(date +%Y%m%d).db
```

---

## 🎯 Résultat Final

✅ **Site complet** : http://192.168.1.236:3001  
✅ **API** : http://192.168.1.236:3001/api  
✅ **Base SQLite** locale sur la Pi  
✅ **Tout autonome** - pas besoin d'internet !

---

## 🔧 Optimisations (optionnel)

### A. Nginx en proxy (pour de meilleures performances) :
```bash
sudo nano /etc/nginx/sites-available/voyance

# Contenu :
server {
    listen 80;
    server_name 192.168.1.236;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Activer
sudo ln -s /etc/nginx/sites-available/voyance /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

### B. Script de démarrage automatique :
```bash
# Ajouter au crontab
crontab -e

# Ajouter cette ligne :
@reboot cd /home/pi/voyance-complete/backend && pm2 start src/app.js --name voyance-site
```

**Votre site sera maintenant entièrement hébergé sur votre Raspberry Pi ! 🍓🚀**