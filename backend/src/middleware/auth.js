const jwt = require('jsonwebtoken');
const db = require('../database/db');

// Secret JWT (à mettre dans .env en production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production-2024';

// Middleware d'authentification
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Token d\'accès requis' });
    }

    // Vérifier le token JWT
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Vérifier que l'utilisateur existe toujours
    const user = await db.get('SELECT id, email, first_name, last_name, role, is_active FROM users WHERE id = ? AND is_active = 1', [decoded.userId]);
    
    if (!user) {
      return res.status(401).json({ error: 'Utilisateur introuvable ou désactivé' });
    }

    // Ajouter les infos utilisateur à la requête
    req.user = {
      id: user.id,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('Erreur authentification:', error);
    return res.status(401).json({ error: 'Token invalide' });
  }
};

// Middleware pour vérifier le rôle admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentification requise' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
  }

  next();
};

// Générer un token JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

module.exports = {
  authenticateToken,
  requireAdmin,
  generateToken,
  JWT_SECRET
};