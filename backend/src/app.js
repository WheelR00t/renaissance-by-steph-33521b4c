const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

const app = express();

// Middlewares sécurité
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // Pour éviter les conflits avec React
}));

app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware d'authentification
const { authenticateToken, requireAdmin } = require('./middleware/auth');

// Routes API publiques (pas de protection)
app.use('/api/users', require('./routes/users')); // login/register publics
app.use('/api/services', require('./routes/services')); // services publics pour affichage
app.use('/api/blog', require('./routes/blog')); // blog public

// Route publique pour consulter les créneaux disponibles
app.get('/api/calendar/slots', async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: 'Date requise' });
    }

    const db = require('./database/db');

    // Créneaux de base
    const baseSlots = [
      "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
      "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", 
      "17:00", "17:30", "18:00", "18:30", "19:00"
    ];

    // Récupérer les créneaux déjà réservés pour cette date
    const bookedSlots = await db.query(
      'SELECT time FROM bookings WHERE date = ? AND status != "cancelled"',
      [date]
    );

    const bookedTimes = bookedSlots.map(b => b.time);

    // Créer la liste des créneaux avec leur disponibilité
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

// Routes API protégées (authentification requise)
app.use('/api/calendar', authenticateToken, require('./routes/calendar'));
app.use('/api/bookings', authenticateToken, require('./routes/bookings'));
app.use('/api/payments', authenticateToken, require('./routes/payments'));
app.use('/api/emails', authenticateToken, require('./routes/emails'));

// Routes API admin (authentification + rôle admin requis)
app.use('/api/dashboard', authenticateToken, requireAdmin, require('./routes/dashboard'));

// Route de test API
app.get('/api', (req, res) => {
  res.json({ 
    message: '🍓 API Renaissance By Steph',
    version: '1.0.0',
    status: 'active',
    endpoints: [
      'GET /api/services',
      'GET /api/calendar/slots?date=YYYY-MM-DD',
      'POST /api/bookings',
      'GET /api/bookings/:token',
      'POST /api/users/register',
      'POST /api/users/login',
      'POST /api/payments/create-intent',
      'POST /api/payments/confirm',
      'POST /api/emails/confirmation'
    ]
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Simple ping
app.get('/api/ping', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Servir le frontend statique
const frontendPath = path.join(__dirname, process.env.FRONTEND_PATH || '../../dist');
console.log('📁 Frontend path:', frontendPath);

app.use(express.static(frontendPath, {
  maxAge: '1d',
  etag: false
}));

// SPA fallback - toutes les autres routes renvoient index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('❌ Erreur:', err);
  res.status(500).json({ 
    error: 'Erreur serveur',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
  });
});

// Gestion des routes non trouvées
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Serveur complet sur http://192.168.1.236:${PORT}`);
  console.log(`📱 API disponible sur http://192.168.1.236:${PORT}/api`);
  console.log(`🌐 Frontend sur http://192.168.1.236:${PORT}`);
  console.log(`📁 Chemin frontend: ${frontendPath}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM reçu, arrêt gracieux...');
  server.close(() => {
    console.log('Serveur fermé');
    process.exit(0);
  });
});

module.exports = app;