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

// POST /api/services - Créer un nouveau service
router.post('/', async (req, res) => {
  try {
    const { name, description, shortDescription, price, duration, category, isActive, features } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'Nom et prix requis' });
    }

    const serviceId = req.body.id || name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    await db.run(`
      INSERT INTO services (id, name, description, price, duration, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [serviceId, name, description || '', price, duration || '', isActive ? 1 : 0]);

    const newService = await db.get('SELECT * FROM services WHERE id = ?', [serviceId]);
    
    res.status(201).json({
      id: newService.id,
      name: newService.name,
      description: newService.description || '',
      price: newService.price,
      duration: newService.duration,
      isActive: newService.is_active === 1
    });
  } catch (error) {
    console.error('Erreur création service:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/services/:id - Modifier un service
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('PUT /api/services/:id - ID:', id);
    console.log('PUT /api/services/:id - Body:', req.body);
    const { name, description, shortDescription, price, duration, category, isActive, features } = req.body;

    const updates = [];
    const params = [];

    if (name) { updates.push('name = ?'); params.push(name); }
    if (typeof description !== 'undefined') { updates.push('description = ?'); params.push(description); }
    if (typeof price !== 'undefined') { updates.push('price = ?'); params.push(price); }
    if (typeof duration !== 'undefined') { updates.push('duration = ?'); params.push(duration); }
    if (typeof isActive !== 'undefined') { updates.push('is_active = ?'); params.push(isActive ? 1 : 0); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Aucune mise à jour fournie' });
    }

    params.push(id);

    await db.run(`UPDATE services SET ${updates.join(', ')} WHERE id = ?`, params);

    const updatedService = await db.get('SELECT * FROM services WHERE id = ?', [id]);
    
    if (!updatedService) {
      return res.status(404).json({ error: 'Service non trouvé' });
    }

    res.json({
      id: updatedService.id,
      name: updatedService.name,
      description: updatedService.description || '',
      price: updatedService.price,
      duration: updatedService.duration,
      isActive: updatedService.is_active === 1
    });
  } catch (error) {
    console.error('Erreur modification service:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/services/:id - Supprimer un service
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier s'il existe des réservations pour ce service
    const bookingsCount = await db.get(
      'SELECT COUNT(*) as count FROM bookings WHERE service_id = ?',
      [id]
    );

    if (bookingsCount.count > 0) {
      return res.status(400).json({ 
        error: 'Impossible de supprimer ce service car il y a des réservations associées' 
      });
    }

    const result = await db.run('DELETE FROM services WHERE id = ?', [id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Service non trouvé' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Erreur suppression service:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;