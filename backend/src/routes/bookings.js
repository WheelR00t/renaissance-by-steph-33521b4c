const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const db = require('../database/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET /api/bookings/:token - Récupérer une réservation par son token (public)
router.get('/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    // Récupérer la réservation avec le service associé
    const booking = await db.get(`
      SELECT b.*, s.name as service_name, s.duration as service_duration, s.price as service_price
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      WHERE b.id = ? OR b.confirmation_token = ?
    `, [token, token]);

    if (!booking) {
      return res.status(404).json({ error: 'Réservation non trouvée' });
    }

    // Formatter la réponse
    const bookingData = {
      id: booking.id,
      service: {
        name: booking.service_name || booking.service_id,
        price: `${booking.price || booking.service_price}€`,
        duration: booking.service_duration || booking.duration || '60 min'
      },
      date: booking.date,
      time: booking.time,
      client: {
        firstName: booking.first_name,
        lastName: booking.last_name,
        email: booking.email,
        phone: booking.phone,
        address: booking.address,
        message: booking.message
      },
      status: booking.status,
      paymentStatus: booking.payment_status,
      confirmationToken: booking.confirmation_token,
      createdAt: booking.created_at
    };

    res.json(bookingData);
  } catch (error) {
    console.error('Erreur récupération réservation:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/bookings - Créer une nouvelle réservation
router.post('/', async (req, res) => {
  try {
    const {
      serviceId,
      date,
      time,
      firstName,
      lastName,
      email,
      phone,
      address,
      message,
      bookingType = 'guest'
    } = req.body;

    // Validation des données
    if (!serviceId || !date || !time || !firstName || !lastName || !email || !phone) {
      return res.status(400).json({ error: 'Données manquantes' });
    }

    // Vérifier que le service existe
    const service = await db.get('SELECT * FROM services WHERE id = ? AND is_active = 1', [serviceId]);
    if (!service) {
      return res.status(404).json({ error: 'Service non trouvé' });
    }

    // Vérifier que le créneau est disponible
    const existingBooking = await db.get(
      'SELECT * FROM bookings WHERE date = ? AND time = ? AND status != "cancelled"',
      [date, time]
    );
    
    if (existingBooking) {
      return res.status(400).json({ error: 'Créneau déjà réservé' });
    }

    // Générer un token de confirmation unique
    const confirmationToken = crypto.randomBytes(32).toString('hex');
    const bookingId = uuidv4();

    // Créer la réservation
    await db.run(`
      INSERT INTO bookings (
        id, service_id, date, time, first_name, last_name, 
        email, phone, address, message, booking_type, 
        price, confirmation_token, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `, [
      bookingId, serviceId, date, time, firstName, lastName,
      email, phone, address, message, bookingType,
      service.price, confirmationToken
    ]);

    // Récupérer la réservation créée avec les détails du service
    const newBooking = await db.get(`
      SELECT b.*, s.name as service_name, s.duration as service_duration
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE b.id = ?
    `, [bookingId]);

    res.status(201).json({
      booking: {
        id: newBooking.id,
        service: newBooking.service_name,
        date: newBooking.date,
        time: newBooking.time,
        firstName: newBooking.first_name,
        lastName: newBooking.last_name,
        email: newBooking.email,
        phone: newBooking.phone,
        address: newBooking.address,
        message: newBooking.message,
        bookingType: newBooking.booking_type,
        status: newBooking.status,
        paymentStatus: newBooking.payment_status,
        price: newBooking.price,
        createdAt: newBooking.created_at
      },
      confirmationToken: newBooking.confirmation_token
    });

  } catch (error) {
    console.error('Erreur création réservation:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/bookings - Liste des réservations (ADMIN SEULEMENT)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const rows = await db.query(`
      SELECT b.*, s.name as service_name
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      ORDER BY b.created_at DESC
    `);

    const list = rows.map((b) => ({
      id: b.id,
      clientName: `${b.first_name} ${b.last_name}`.trim(),
      clientEmail: b.email,
      service: b.service_name || b.service_id,
      date: b.date,
      time: b.time,
      status: b.status,
      price: b.price,
      notes: '',
      visioLink: b.visio_link || '',
      bookingType: b.booking_type,
      paymentStatus: b.payment_status,
      createdAt: b.created_at,
    }));

    res.json(list);
  } catch (error) {
    console.error('Erreur liste réservations:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const rows = await db.query(`
      SELECT b.*, s.name as service_name
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      ORDER BY b.created_at DESC
    `);

    const list = rows.map((b) => ({
      id: b.id,
      clientName: `${b.first_name} ${b.last_name}`.trim(),
      clientEmail: b.email,
      service: b.service_name || b.service_id,
      date: b.date,
      time: b.time,
      status: b.status,
      price: b.price,
      notes: '',
      visioLink: b.visio_link || '',
      bookingType: b.booking_type,
      paymentStatus: b.payment_status,
      createdAt: b.created_at,
    }));

    res.json(list);
  } catch (error) {
    console.error('Erreur liste réservations:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/bookings/token/:token - Récupérer par token (alias compatible frontend)
router.get('/token/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const booking = await db.get(`
      SELECT b.*, s.name as service_name, s.duration as service_duration
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE b.confirmation_token = ?
    `, [token]);

    if (!booking) {
      return res.status(404).json({ error: 'Réservation non trouvée' });
    }

    res.json({
      id: booking.id,
      service: booking.service_name,
      date: booking.date,
      time: booking.time,
      firstName: booking.first_name,
      lastName: booking.last_name,
      email: booking.email,
      phone: booking.phone,
      address: booking.address,
      message: booking.message,
      bookingType: booking.booking_type,
      status: booking.status,
      paymentStatus: booking.payment_status,
      price: booking.price,
      createdAt: booking.created_at,
      confirmationToken: booking.confirmation_token
    });
  } catch (error) {
    console.error('Erreur récupération réservation (token):', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/bookings/id/:id - Mise à jour par ID (ADMIN SEULEMENT)
router.put('/id/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, visioLink } = req.body;

    const updates = [];
    const params = [];

    if (status) { updates.push('status = ?'); params.push(status); }
    if (paymentStatus) { updates.push('payment_status = ?'); params.push(paymentStatus); }
    if (typeof visioLink !== 'undefined') { updates.push('visio_link = ?'); params.push(visioLink || null); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Aucune mise à jour fournie' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    await db.run(`
      UPDATE bookings SET ${updates.join(', ')} WHERE id = ?
    `, params);

    const updated = await db.get(`
      SELECT b.*, s.name as service_name
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      WHERE b.id = ?
    `, [id]);

    res.json({
      id: updated.id,
      clientName: `${updated.first_name} ${updated.last_name}`.trim(),
      clientEmail: updated.email,
      service: updated.service_name || updated.service_id,
      date: updated.date,
      time: updated.time,
      status: updated.status,
      price: updated.price,
      notes: '',
      visioLink: updated.visio_link || '',
      bookingType: updated.booking_type,
      paymentStatus: updated.payment_status,
      createdAt: updated.created_at,
    });
  } catch (error) {
    console.error('Erreur update réservation (id):', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/bookings/id/:id - Suppression (ADMIN SEULEMENT)
router.delete('/id/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await db.run('DELETE FROM bookings WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Erreur suppression réservation:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;