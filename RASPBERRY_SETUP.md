# 🍓 Démarrage Rapide - Raspberry Pi (192.168.1.236)

## 🚀 Setup complet pour votre Raspberry Pi

### 1. Préparation sur la Raspberry Pi

```bash
# Se connecter à votre Raspberry Pi
ssh pi@192.168.1.236

# Installer Node.js (si pas déjà fait)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Vérifier les versions
node --version  # Doit être >= 16
npm --version

# Créer le dossier projet
mkdir -p /home/pi/voyance-backend
cd /home/pi/voyance-backend
```

### 2. Initialiser le projet backend

```bash
# Initialiser le package.json
npm init -y

# Installer toutes les dépendances nécessaires
npm install express sqlite3 cors helmet morgan compression dotenv
npm install stripe nodemailer uuid crypto
npm install --save-dev nodemon

# Créer la structure des dossiers
mkdir -p src/database src/routes src/services database data
```

### 3. Créer les fichiers essentiels

#### A. `database/schema.sql` :

```bash
cat > database/schema.sql << 'EOF'
-- Table services
CREATE TABLE services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  duration TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table bookings
CREATE TABLE bookings (
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

-- Table time_slots
CREATE TABLE time_slots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  is_blocked BOOLEAN DEFAULT false,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(date, time)
);

-- Index pour les performances
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_bookings_token ON bookings(confirmation_token);
CREATE INDEX idx_time_slots_date ON time_slots(date, is_available);

-- Services par défaut
INSERT INTO services (id, name, description, price, duration) VALUES
('tarot', 'Tirage de Cartes', 'Révélez votre avenir grâce aux messages des cartes', 45.00, '30-60 min'),
('reiki', 'Séance Reiki', 'Harmonisez vos énergies et retrouvez l''équilibre', 60.00, '45-90 min'),
('pendule', 'Divination au Pendule', 'Obtenez des réponses précises à vos questions', 35.00, '30-45 min'),
('guerison', 'Guérison Énergétique', 'Soins énergétiques pour libérer les blocages', 70.00, '60-90 min');
EOF
```

#### B. `.env` de configuration :

```bash
cat > .env << 'EOF'
NODE_ENV=development
PORT=3001
HOST=0.0.0.0

# Base de données SQLite
DB_PATH=./data/voyance.db

# Frontend URL (votre site Lovable)
FRONTEND_URL=https://79a11d68-0325-4b19-91aa-ff2112517b49.sandbox.lovable.dev

# Stripe (optionnel pour l'instant - mode test)
# STRIPE_SECRET_KEY=sk_test_votre_cle_test
# STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_test

# Email (optionnel pour l'instant)
# SMTP_HOST=smtp.gmail.com
# SMTP_USER=votre-email@gmail.com
# SMTP_PASS=votre-mot-de-passe
EOF
```

#### C. `src/database/db.js` :

```bash
cat > src/database/db.js << 'EOF'
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class Database {
  constructor() {
    const dbPath = path.join(__dirname, '../../data/voyance.db');
    
    // Créer le dossier data s'il n'existe pas
    const dataDir = path.dirname(dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Erreur connexion SQLite:', err);
      } else {
        console.log('✅ Connecté à SQLite');
        this.initializeSchema();
      }
    });
  }

  initializeSchema() {
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      this.db.exec(schema, (err) => {
        if (err) console.error('❌ Erreur initialisation schema:', err);
        else console.log('✅ Schema SQLite initialisé');
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

  close() {
    return new Promise((resolve) => {
      this.db.close(resolve);
    });
  }
}

module.exports = new Database();
EOF
```

#### D. `src/routes/services.js` :

```bash
cat > src/routes/services.js << 'EOF'
const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET /api/services - Récupérer tous les services actifs
router.get('/', async (req, res) => {
  try {
    const services = await db.query(
      'SELECT * FROM services WHERE is_active = 1 ORDER BY name'
    );

    const formattedServices = services.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description || '',
      price: service.price,
      duration: service.duration,
      isActive: service.is_active === 1
    }));

    res.json(formattedServices);
  } catch (error) {
    console.error('Erreur récupération services:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
EOF
```

#### E. `src/routes/calendar.js` :

```bash
cat > src/routes/calendar.js << 'EOF'
const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET /api/calendar/slots?date=2024-01-15
router.get('/slots', async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: 'Date requise' });
    }

    // Créneaux de base (lundi à samedi)
    const baseSlots = [
      "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
      "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
      "17:00", "17:30", "18:00", "18:30", "19:00"
    ];

    // Vérifier les créneaux déjà réservés
    const bookedSlots = await db.query(
      'SELECT time FROM bookings WHERE date = ? AND status != "cancelled"',
      [date]
    );

    const bookedTimes = bookedSlots.map(slot => slot.time);

    // Construire la réponse
    const slots = baseSlots.map(time => ({
      time,
      available: !bookedTimes.includes(time),
      booked: bookedTimes.includes(time)
    }));

    res.json(slots);
  } catch (error) {
    console.error('Erreur récupération créneaux:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
EOF
```

#### F. `src/app.js` (serveur principal) :

```bash
cat > src/app.js << 'EOF'
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: '*', // Permet tous les origins pour le dev
  credentials: true
}));

app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/services', require('./routes/services'));
app.use('/api/calendar', require('./routes/calendar'));

// Route de base
app.get('/', (req, res) => {
  res.json({ 
    message: '🍓 API Renaissance By Steph sur Raspberry Pi', 
    version: '1.0.0',
    ip: '192.168.1.236',
    endpoints: [
      'GET /api/services',
      'GET /api/calendar/slots?date=YYYY-MM-DD'
    ]
  });
});

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint introuvable' });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur:', err);
  res.status(500).json({ 
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`🚀 Serveur démarré sur http://192.168.1.236:${PORT}`);
  console.log(`📊 Environnement: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
EOF
```

#### G. `package.json` scripts :

```bash
# Modifier le package.json pour ajouter les scripts
cat > package.json << 'EOF'
{
  "name": "voyance-backend",
  "version": "1.0.0",
  "description": "Backend pour Renaissance By Steph",
  "main": "src/app.js",
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "test": "echo \"No tests yet\"",
    "logs": "tail -f logs/app.log"
  },
  "dependencies": {
    "express": "^4.18.2",
    "sqlite3": "^5.1.6",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "compression": "^1.7.4",
    "dotenv": "^16.3.1",
    "stripe": "^14.9.0",
    "nodemailer": "^6.9.7",
    "uuid": "^9.0.1",
    "crypto": "^1.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  },
  "keywords": ["voyance", "raspberry-pi", "sqlite"],
  "author": "Renaissance By Steph"
}
EOF
```

### 4. 🚀 Lancer le serveur

```bash
# Installer les dépendances
npm install

# Vérifier que tout est en place
ls -la src/
ls -la database/

# Lancer en mode développement
npm run dev

# OU lancer en mode production
npm start
```

### 5. ✅ Vérification

```bash
# Tester l'API depuis un autre terminal
curl http://192.168.1.236:3001/

# Tester les services
curl http://192.168.1.236:3001/api/services

# Tester les créneaux
curl "http://192.168.1.236:3001/api/calendar/slots?date=2024-12-20"
```

### 6. 🌐 Configuration Frontend Lovable

Modifiez `src/lib/api.ts` dans votre projet Lovable :

```typescript
const API_BASE_URL = 'http://192.168.1.236:3001/api';
```

### 7. 🛠️ Commandes utiles

```bash
# Voir les logs en temps réel
tail -f /var/log/syslog | grep voyance

# Redémarrer le serveur
pkill -f "node src/app.js"
npm start

# Voir les processus Node.js actifs
ps aux | grep node

# Vérifier l'espace disque
df -h

# Voir le contenu de la base SQLite
sqlite3 data/voyance.db
.tables
SELECT * FROM services;
.quit
```

### 8. 🔧 Troubleshooting

**Erreur port occupé :**
```bash
sudo lsof -i :3001
sudo kill -9 PID_DU_PROCESSUS
```

**Erreur permissions SQLite :**
```bash
sudo chown -R pi:pi /home/pi/voyance-backend/
chmod 755 data/
chmod 644 data/voyance.db
```

**Vérifier connectivité réseau :**
```bash
# Depuis un autre PC sur le réseau
ping 192.168.1.236
telnet 192.168.1.236 3001
```

## 🎯 Une fois lancé :

✅ **Backend SQLite** : http://192.168.1.236:3001  
✅ **API Services** : http://192.168.1.236:3001/api/services  
✅ **Calendrier** : http://192.168.1.236:3001/api/calendar/slots  
✅ **Base SQLite** : `/home/pi/voyance-backend/data/voyance.db`  

Votre site Lovable va maintenant utiliser votre vraie base de données ! 🚀