const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');

// Debug logging for all users routes
router.use((req, res, next) => {
  console.log(`[users] ${req.method} ${req.originalUrl} ct=${req.headers['content-type'] || ''}`);
  next();
});

// GET /api/users/register - Info (avoid SPA 200 on GET)
router.get('/register', (req, res) => {
  res.status(405).json({ error: 'Méthode non autorisée. Utilisez POST pour /api/users/register.' });
});

// POST /api/users/register - Inscription
router.post('/register', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password
    } = req.body;

    console.log('POST /api/users/register', { email, firstName, lastName });

    // Validation des données
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'Données manquantes' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 8 caractères' });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    // Hash du mot de passe
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const userId = uuidv4();

    // Créer l'utilisateur
    await db.run(`
      INSERT INTO users (
        id, email, password_hash, first_name, last_name, phone, role, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, 'client', 1)
    `, [userId, email, hashedPassword, firstName, lastName, phone || null]);

    // Récupérer l'utilisateur créé (sans le mot de passe)
    const newUser = await db.get(`
      SELECT id, email, first_name, last_name, phone, role, created_at
      FROM users WHERE id = ?
    `, [userId]);

    console.log('✅ User created', newUser);

    res.status(201).json({
      message: 'Compte créé avec succès',
      user: newUser
    });

  } catch (error) {
    console.error('Erreur création utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error?.message });
  }
});

// POST /api/users/login - Connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    // Récupérer l'utilisateur
    const user = await db.get('SELECT * FROM users WHERE email = ? AND is_active = 1', [email]);
    console.log('POST /api/users/login lookup', { email, found: !!user });
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    console.log('POST /api/users/login passwordCheck', { email, isValidPassword });
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Retourner les infos utilisateur (sans le mot de passe)
    const userInfo = {
      id: user.id,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`,
      role: user.role
    };

    res.json({
      message: 'Connexion réussie',
      user: userInfo
    });

  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Debug endpoints (safe: no sensitive data)
router.get('/ping', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

router.get('/debug-list', async (req, res) => {
  try {
    const users = await db.query(
      'SELECT id, email, first_name, last_name, role, is_active, created_at FROM users ORDER BY created_at DESC LIMIT 50'
    );
    res.json({ count: users.length, users });
  } catch (error) {
    console.error('Erreur debug-list:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/debug-schema', async (req, res) => {
  try {
    const columns = await db.query('PRAGMA table_info(users)');
    res.json({ columns });
  } catch (error) {
    console.error('Erreur debug-schema:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.get('/debug-count', async (req, res) => {
  try {
    const row = await db.get('SELECT COUNT(*) as count FROM users');
    res.json(row);
  } catch (error) {
    console.error('Erreur debug-count:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Créer l'admin par défaut s'il n'existe pas  
router.post('/create-admin', async (req, res) => {
  try {
    // Vérifier si l'admin existe déjà
    const existingAdmin = await db.get('SELECT * FROM users WHERE email = ?', ['admin@renaissancebysteph.fr']);
    
    if (existingAdmin) {
      return res.json({ message: 'Admin existe déjà', admin: { email: existingAdmin.email, role: existingAdmin.role } });
    }

    // Créer l'admin avec le mot de passe hashé (admin123)
    const hashedPassword = '$2a$10$CwTycUXWue0Thq9StjUM0uJ8R8.lR1BQrQ9/WuCJWs3f5j6s9Y5OG';
    
    await db.run(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active) 
      VALUES ('admin-1', 'admin@renaissancebysteph.fr', ?, 'Stéphanie', 'Admin', 'admin', 1)
    `, [hashedPassword]);

    console.log('✅ Admin créé avec succès');
    res.json({ message: 'Admin créé avec succès', email: 'admin@renaissancebysteph.fr' });

  } catch (error) {
    console.error('Erreur création admin:', error);
    res.status(500).json({ error: 'Erreur serveur', details: error?.message });
  }
});

module.exports = router;