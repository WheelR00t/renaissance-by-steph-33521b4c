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

// Routes API
app.use('/api/services', require('./routes/services'));
app.use('/api/calendar', require('./routes/calendar'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/users', require('./routes/users'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/emails', require('./routes/emails'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/blog', require('./routes/blog'));

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