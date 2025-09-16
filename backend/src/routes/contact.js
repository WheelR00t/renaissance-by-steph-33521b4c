const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// POST /api/contact - Créer un nouveau message de contact (public)
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, subject, message, contactReason } = req.body;

    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({ error: 'Prénom, nom, email et message sont obligatoires' });
    }

    const messageId = uuidv4();

    await db.run(`
      INSERT INTO contact_messages (
        id, first_name, last_name, email, phone, subject, message, contact_reason, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new')
    `, [messageId, firstName, lastName, email, phone || null, subject || null, message, contactReason || null]);

    console.log(`📧 Nouveau message de contact reçu de ${firstName} ${lastName} (${email})`);

    res.status(201).json({
      success: true,
      message: 'Votre message a été envoyé avec succès',
      id: messageId
    });
  } catch (error) {
    console.error('Erreur création message contact:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/contact - Récupérer tous les messages (ADMIN SEULEMENT)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM contact_messages';
    const params = [];

    if (status && status !== 'all') {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const messages = await db.all(query, params);
    
    const formatted = messages.map(msg => ({
      id: msg.id,
      firstName: msg.first_name,
      lastName: msg.last_name,
      email: msg.email,
      phone: msg.phone,
      subject: msg.subject,
      message: msg.message,
      contactReason: msg.contact_reason,
      status: msg.status,
      createdAt: msg.created_at,
      updatedAt: msg.updated_at
    }));

    res.set('Cache-Control', 'no-store');
    res.json(formatted);
  } catch (error) {
    console.error('Erreur récupération messages contact:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/contact/stats - Statistiques des messages (ADMIN SEULEMENT)
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalMessages = await db.get('SELECT COUNT(*) as count FROM contact_messages');
    const newMessages = await db.get('SELECT COUNT(*) as count FROM contact_messages WHERE status = "new"');
    const todayMessages = await db.get(`
      SELECT COUNT(*) as count FROM contact_messages 
      WHERE DATE(created_at) = DATE('now')
    `);
    
    const stats = {
      total: totalMessages.count || 0,
      new: newMessages.count || 0,
      today: todayMessages.count || 0
    };

    res.json(stats);
  } catch (error) {
    console.error('Erreur stats messages contact:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/contact/:id - Mettre à jour un message (ADMIN SEULEMENT)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['new', 'read', 'replied', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    await db.run(`
      UPDATE contact_messages 
      SET status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [status, id]);

    const updatedMessage = await db.get('SELECT * FROM contact_messages WHERE id = ?', [id]);
    
    if (!updatedMessage) {
      return res.status(404).json({ error: 'Message non trouvé' });
    }

    res.json({
      id: updatedMessage.id,
      firstName: updatedMessage.first_name,
      lastName: updatedMessage.last_name,
      email: updatedMessage.email,
      phone: updatedMessage.phone,
      subject: updatedMessage.subject,
      message: updatedMessage.message,
      contactReason: updatedMessage.contact_reason,
      status: updatedMessage.status,
      createdAt: updatedMessage.created_at,
      updatedAt: updatedMessage.updated_at
    });
  } catch (error) {
    console.error('Erreur mise à jour message contact:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/contact/:id - Supprimer un message (ADMIN SEULEMENT)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.run('DELETE FROM contact_messages WHERE id = ?', [id]);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Message non trouvé' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Erreur suppression message contact:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/contact - Purger tous les messages (ADMIN SEULEMENT)
router.delete('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await db.run('DELETE FROM contact_messages');
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur purge messages contact:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;