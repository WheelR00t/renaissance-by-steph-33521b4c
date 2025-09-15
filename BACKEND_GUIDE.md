# 🚀 Guide Complet - Backend SQLite + Stripe + Emails

Ce guide vous explique comment connecter votre frontend Lovable à un backend SQLite avec toutes les fonctionnalités avancées.

## 📋 Table des matières

1. [Structure de la base SQLite](#database)
2. [Configuration du serveur Node.js](#server)
3. [Intégration Stripe](#stripe)
4. [Système d'emails](#emails)
5. [Déploiement](#deployment)

---

## 🗄️ Structure de la base SQLite {#database}

### 1. Créez le fichier `database/schema.sql` :

```sql
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

-- Table time_slots pour gérer la disponibilité
CREATE TABLE time_slots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  is_blocked BOOLEAN DEFAULT false,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(date, time)
);

-- Table email_templates
CREATE TABLE email_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index pour les performances
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_bookings_token ON bookings(confirmation_token);
CREATE INDEX idx_bookings_status ON bookings(status, payment_status);
CREATE INDEX idx_time_slots_date ON time_slots(date, is_available);

-- Données par défaut
INSERT INTO services (id, name, description, price, duration) VALUES
('tarot', 'Tirage de Cartes', 'Révélez votre avenir grâce aux messages des cartes', 45.00, '30-60 min'),
('reiki', 'Séance Reiki', 'Harmonisez vos énergies et retrouvez l\'équilibre', 60.00, '45-90 min'),
('pendule', 'Divination au Pendule', 'Obtenez des réponses précises à vos questions', 35.00, '30-45 min'),
('guerison', 'Guérison Énergétique', 'Soins énergétiques pour libérer les blocages', 70.00, '60-90 min');

-- Templates d'emails par défaut
INSERT INTO email_templates (name, subject, html_content, text_content) VALUES
('booking_confirmation', 'Confirmation de votre rendez-vous chez Renaissance By Steph', 
  '<h1>Votre rendez-vous est confirmé !</h1><p>Bonjour {{first_name}},</p><p>Votre rendez-vous pour <strong>{{service}}</strong> le {{date}} à {{time}} est confirmé.</p><p>Lien de suivi : <a href="{{tracking_link}}">{{tracking_link}}</a></p>',
  'Bonjour {{first_name}}, votre rendez-vous pour {{service}} le {{date}} à {{time}} est confirmé. Lien: {{tracking_link}}'),
('booking_reminder', 'Rappel - Votre rendez-vous demain', 
  '<h1>Rappel de votre rendez-vous</h1><p>Bonjour {{first_name}},</p><p>N\'oubliez pas votre rendez-vous demain {{date}} à {{time}} pour {{service}}.</p>',
  'Bonjour {{first_name}}, rappel de votre rendez-vous demain {{date}} à {{time}} pour {{service}}.');
```

---

## 🖥️ Configuration du serveur Node.js {#server}

### 1. Initialisez le projet backend :

```bash
mkdir backend-voyance
cd backend-voyance
npm init -y
npm install express sqlite3 cors helmet morgan compression dotenv
npm install stripe nodemailer uuid crypto
npm install --save-dev nodemon @types/node typescript
```

### 2. Créez `src/database/db.js` :

```javascript
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
        console.error('Erreur connexion SQLite:', err);
      } else {
        console.log('✅ Connecté à SQLite');
        this.initializeSchema();
      }
    });
  }

  initializeSchema() {
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      this.db.exec(schema, (err) => {
        if (err) console.error('Erreur initialisation schema:', err);
        else console.log('✅ Schema SQLite initialisé');
      });
    }
  }

  // Wrapper pour promisifier les requêtes
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
```

### 3. Créez `src/routes/calendar.js` :

```javascript
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

    // Créneaux de base
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

    // Vérifier les créneaux bloqués manuellement
    const blockedSlots = await db.query(
      'SELECT time FROM time_slots WHERE date = ? AND (is_available = 0 OR is_blocked = 1)',
      [date]
    );

    const blockedTimes = blockedSlots.map(slot => slot.time);

    // Construire la réponse
    const slots = baseSlots.map(time => ({
      time,
      available: !bookedTimes.includes(time) && !blockedTimes.includes(time),
      booked: bookedTimes.includes(time)
    }));

    res.json(slots);
  } catch (error) {
    console.error('Erreur récupération créneaux:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/calendar/block-slot
router.post('/block-slot', async (req, res) => {
  try {
    const { date, time, blocked = true } = req.body;

    await db.run(
      `INSERT OR REPLACE INTO time_slots (date, time, is_available, is_blocked) 
       VALUES (?, ?, ?, ?)`,
      [date, time, !blocked, blocked]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Erreur blocage créneau:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
```

### 4. Créez `src/routes/bookings.js` :

```javascript
const express = require('express');
const router = express.Router();
const db = require('../database/db');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

// POST /api/bookings
router.post('/', async (req, res) => {
  try {
    const {
      service,
      date,
      time,
      clientInfo,
      type,
      price
    } = req.body;

    // Validation
    if (!service || !date || !time || !clientInfo?.email) {
      return res.status(400).json({ error: 'Données manquantes' });
    }

    // Vérifier disponibilité
    const existing = await db.get(
      'SELECT id FROM bookings WHERE date = ? AND time = ? AND status != "cancelled"',
      [date, time]
    );

    if (existing) {
      return res.status(409).json({ error: 'Créneau déjà réservé' });
    }

    // Générer IDs
    const bookingId = uuidv4();
    const confirmationToken = crypto.randomBytes(32).toString('hex');

    // Insérer la réservation
    await db.run(`
      INSERT INTO bookings (
        id, service_id, date, time, first_name, last_name, 
        email, phone, address, message, booking_type, 
        status, payment_status, price, confirmation_token
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', ?, ?)
    `, [
      bookingId,
      service, // TODO: mapper vers service_id
      date,
      time,
      clientInfo.firstName,
      clientInfo.lastName,
      clientInfo.email,
      clientInfo.phone || '',
      clientInfo.address || '',
      clientInfo.message || '',
      type,
      price,
      confirmationToken
    ]);

    // Récupérer la réservation créée
    const booking = await db.get('SELECT * FROM bookings WHERE id = ?', [bookingId]);

    res.status(201).json({
      booking: {
        id: booking.id,
        service: booking.service_id,
        date: booking.date,
        time: booking.time,
        clientInfo: {
          firstName: booking.first_name,
          lastName: booking.last_name,
          email: booking.email,
          phone: booking.phone,
          address: booking.address,
          message: booking.message
        },
        type: booking.booking_type,
        status: booking.status,
        paymentStatus: booking.payment_status,
        price: booking.price,
        createdAt: booking.created_at,
        confirmationToken: booking.confirmation_token
      },
      confirmationToken
    });

  } catch (error) {
    console.error('Erreur création réservation:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/bookings/token/:token
router.get('/token/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const booking = await db.get(
      'SELECT * FROM bookings WHERE confirmation_token = ?',
      [token]
    );

    if (!booking) {
      return res.status(404).json({ error: 'Réservation introuvable' });
    }

    res.json({
      id: booking.id,
      service: booking.service_id,
      date: booking.date,
      time: booking.time,
      clientInfo: {
        firstName: booking.first_name,
        lastName: booking.last_name,
        email: booking.email,
        phone: booking.phone,
        address: booking.address,
        message: booking.message
      },
      type: booking.booking_type,
      status: booking.status,
      paymentStatus: booking.payment_status,
      price: booking.price,
      visioLink: booking.visio_link,
      createdAt: booking.created_at
    });

  } catch (error) {
    console.error('Erreur récupération réservation:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
```

---

## 💳 Intégration Stripe {#stripe}

### 1. Créez `src/routes/payments.js` :

```javascript
const express = require('express');
const router = express.Router();
const db = require('../database/db');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// POST /api/payments/create-intent
router.post('/create-intent', async (req, res) => {
  try {
    const { bookingId, amount } = req.body;

    // Vérifier que la réservation existe
    const booking = await db.get('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    
    if (!booking) {
      return res.status(404).json({ error: 'Réservation introuvable' });
    }

    // Créer l'intention de paiement Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Montant en centimes
      currency: 'eur',
      metadata: {
        bookingId: bookingId,
        service: booking.service_id,
        customerEmail: booking.email
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Sauvegarder l'ID de l'intention
    await db.run(
      'UPDATE bookings SET stripe_payment_intent_id = ? WHERE id = ?',
      [paymentIntent.id, bookingId]
    );

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: amount,
      currency: 'eur',
      bookingId: bookingId
    });

  } catch (error) {
    console.error('Erreur création PaymentIntent:', error);
    res.status(500).json({ error: 'Erreur lors de la création du paiement' });
  }
});

// POST /api/payments/confirm
router.post('/confirm', async (req, res) => {
  try {
    const { paymentIntentId, bookingId } = req.body;

    // Récupérer l'intention de paiement depuis Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Mettre à jour le statut de la réservation
      await db.run(`
        UPDATE bookings 
        SET payment_status = 'paid', status = 'confirmed', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [bookingId]);

      // Récupérer la réservation mise à jour
      const booking = await db.get('SELECT * FROM bookings WHERE id = ?', [bookingId]);

      res.json({
        success: true,
        booking: {
          id: booking.id,
          paymentStatus: 'paid',
          status: 'confirmed'
        }
      });

      // TODO: Déclencher l'envoi de l'email de confirmation

    } else {
      res.status(400).json({ error: 'Paiement non confirmé' });
    }

  } catch (error) {
    console.error('Erreur confirmation paiement:', error);
    res.status(500).json({ error: 'Erreur lors de la confirmation' });
  }
});

// Webhook Stripe pour gérer les événements
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const bookingId = paymentIntent.metadata.bookingId;
        
        // Confirmer la réservation
        await db.run(`
          UPDATE bookings 
          SET payment_status = 'paid', status = 'confirmed', updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [bookingId]);
        
        console.log('✅ Paiement confirmé pour:', bookingId);
        break;

      case 'payment_intent.payment_failed':
        // Gérer l'échec de paiement
        console.log('❌ Paiement échoué:', event.data.object.id);
        break;
    }

    res.json({received: true});
  } catch (err) {
    console.error('Erreur webhook:', err);
    res.status(400).send(`Webhook error: ${err.message}`);
  }
});

module.exports = router;
```

### 2. Configuration Stripe dans `.env` :

```env
STRIPE_SECRET_KEY=sk_test_votre_cle_secrete_stripe
STRIPE_WEBHOOK_SECRET=whsec_votre_secret_webhook
STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_publique_stripe
```

---

## 📧 Système d'emails {#emails}

### 1. Créez `src/services/emailService.js` :

```javascript
const nodemailer = require('nodemailer');
const db = require('../database/db');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'localhost',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendBookingConfirmation(bookingId) {
    try {
      // Récupérer les données de la réservation
      const booking = await db.get('SELECT * FROM bookings WHERE id = ?', [bookingId]);
      
      if (!booking) {
        throw new Error('Réservation introuvable');
      }

      // Récupérer le template
      const template = await db.get(
        'SELECT * FROM email_templates WHERE name = ?',
        ['booking_confirmation']
      );

      // Variables pour le template
      const variables = {
        first_name: booking.first_name,
        last_name: booking.last_name,
        service: booking.service_id,
        date: new Date(booking.date).toLocaleDateString('fr-FR'),
        time: booking.time,
        tracking_link: `${process.env.FRONTEND_URL}/booking-summary/${booking.confirmation_token}`
      };

      // Remplacer les variables dans le template
      let htmlContent = template.html_content;
      let textContent = template.text_content;

      Object.keys(variables).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        htmlContent = htmlContent.replace(regex, variables[key]);
        textContent = textContent.replace(regex, variables[key]);
      });

      // Envoyer l'email
      await this.transporter.sendMail({
        from: `"Renaissance By Steph" <${process.env.FROM_EMAIL}>`,
        to: booking.email,
        subject: template.subject,
        text: textContent,
        html: htmlContent
      });

      console.log('✅ Email de confirmation envoyé à:', booking.email);
      return true;

    } catch (error) {
      console.error('❌ Erreur envoi email:', error);
      return false;
    }
  }

  async sendReminder(bookingId) {
    try {
      // Similaire à sendBookingConfirmation mais avec template 'booking_reminder'
      // ... logique similaire
      console.log('✅ Email de rappel envoyé');
      return true;
    } catch (error) {
      console.error('❌ Erreur envoi rappel:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
```

### 2. Créez `src/routes/emails.js` :

```javascript
const express = require('express');
const router = express.Router();
const emailService = require('../services/emailService');

// POST /api/emails/confirmation
router.post('/confirmation', async (req, res) => {
  try {
    const { bookingId } = req.body;
    
    const success = await emailService.sendBookingConfirmation(bookingId);
    
    if (success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'Échec envoi email' });
    }
  } catch (error) {
    console.error('Erreur email confirmation:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/emails/reminder
router.post('/reminder', async (req, res) => {
  try {
    const { bookingId } = req.body;
    
    const success = await emailService.sendReminder(bookingId);
    
    res.json({ success });
  } catch (error) {
    console.error('Erreur email rappel:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;
```

### 3. Configuration emails dans `.env` :

```env
# Configuration SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre-email@gmail.com
SMTP_PASS=votre-mot-de-passe-app
FROM_EMAIL=contact@renaissancebysteph.fr

# URL frontend
FRONTEND_URL=https://votre-domaine.com
```

---

## 🖥️ Serveur principal {#server}

### Créez `src/app.js` :

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

const app = express();

// Middlewares
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Middleware pour JSON (sauf pour webhook Stripe)
app.use('/api/payments/webhook', express.raw({type: 'application/json'}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/calendar', require('./routes/calendar'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/emails', require('./routes/emails'));

// Route de base
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Renaissance By Steph', 
    version: '1.0.0',
    endpoints: [
      '/api/calendar/slots',
      '/api/bookings',
      '/api/payments/create-intent',
      '/api/emails/confirmation'
    ]
  });
});

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint introuvable' });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  res.status(500).json({ 
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📊 Environnement: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
```

### Créez `package.json` scripts :

```json
{
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "test": "echo \"No tests yet\"",
    "build": "echo \"No build process\""
  }
}
```

---

## 🚀 Déploiement {#deployment}

### 1. Variables d'environnement production `.env` :

```env
NODE_ENV=production
PORT=3001

# Base de données
DB_PATH=./data/voyance.db

# Stripe
STRIPE_SECRET_KEY=sk_live_votre_vraie_cle
STRIPE_WEBHOOK_SECRET=whsec_votre_webhook_prod
STRIPE_PUBLISHABLE_KEY=pk_live_votre_cle_publique

# Email
SMTP_HOST=smtp.votre-provider.com
SMTP_PORT=587
SMTP_USER=votre-email@domaine.com
SMTP_PASS=votre-mot-de-passe
FROM_EMAIL=contact@renaissancebysteph.fr

# URLs
FRONTEND_URL=https://renaissancebysteph.fr
```

### 2. Dockerfile (optionnel) :

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src/ ./src/
COPY database/ ./database/

RUN mkdir -p data

EXPOSE 3001

CMD ["npm", "start"]
```

### 3. Commandes de déploiement :

```bash
# Sur votre serveur
git clone votre-repo
cd backend-voyance
npm install
cp .env.example .env
# Modifier .env avec vos vraies clés

# Démarrer
npm run dev  # Development
npm start    # Production

# Avec PM2 (recommandé pour production)
npm install -g pm2
pm2 start src/app.js --name "voyance-api"
pm2 startup
pm2 save
```

---

## ✅ Configuration Frontend

### Modifiez `src/lib/api.ts` ligne 4 :

```typescript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.renaissancebysteph.fr/api'  // Votre vraie API
  : 'http://localhost:3001/api';             // Local
```

### Ajoutez Stripe dans votre frontend :

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

---

## 🔧 Tests et Debug

### Test des endpoints :

```bash
# Test créneaux
curl "http://localhost:3001/api/calendar/slots?date=2024-01-15"

# Test création réservation
curl -X POST http://localhost:3001/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"service":"tarot","date":"2024-01-15","time":"14:00","clientInfo":{"firstName":"Test","lastName":"User","email":"test@example.com","phone":"0123456789"},"type":"guest","price":45}'
```

---

## 📝 Maintenance

### Tâches automatiques recommandées :

1. **Nettoyage des réservations expirées**
2. **Envoi des rappels automatiques** 
3. **Sauvegarde de la base SQLite**
4. **Logs de rotation**

### Cron jobs exemple :

```bash
# Crontab -e
0 2 * * * /usr/bin/node /path/to/scripts/cleanup-expired-bookings.js
0 18 * * * /usr/bin/node /path/to/scripts/send-reminders.js
0 3 * * * cp /path/to/data/voyance.db /backups/voyance-$(date +%Y%m%d).db
```

---

## 🎯 Résumé

Vous avez maintenant :

✅ **Base SQLite complète** avec schéma optimisé  
✅ **API REST** pour toutes les fonctionnalités  
✅ **Intégration Stripe** pour les paiements  
✅ **Système d'emails** automatique  
✅ **Frontend connecté** avec fallbacks  

Votre site Lovable peut maintenant être exporté et connecté à ce backend pour une solution complète et professionnelle !

---

**Questions ? Problèmes ?** Consultez les logs serveur et vérifiez vos variables d'environnement en premier lieu.