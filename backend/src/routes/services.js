const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET /api/services - Récupérer tous les services actifs
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

// GET /api/services/:id - Récupérer un service par ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const service = await db.get(
      'SELECT * FROM services WHERE id = ? AND is_active = 1',
      [id]
    );

    if (!service) {
      return res.status(404).json({ error: 'Service non trouvé' });
    }

    const formatted = {
      id: service.id,
      name: service.name,
      description: service.description || '',
      price: service.price,
      duration: service.duration,
      isActive: service.is_active === 1
    };

    res.json(formatted);
  } catch (error) {
    console.error('Erreur service:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;