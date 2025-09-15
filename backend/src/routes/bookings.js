const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const db = require('../database/db');

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
      ...newBooking,
      confirmationToken
    });

  } catch (error) {
    console.error('Erreur création réservation:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/bookings/:token - Récupérer une réservation par token
router.get('/:token', async (req, res) => {
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

    res.json(booking);
  } catch (error) {
    console.error('Erreur récupération réservation:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/bookings/:token - Mettre à jour une réservation
router.put('/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { status, paymentStatus, visioLink } = req.body;

    const updates = [];
    const params = [];

    if (status) {
      updates.push('status = ?');
      params.push(status);
    }

    if (paymentStatus) {
      updates.push('payment_status = ?');
      params.push(paymentStatus);
    }

    if (visioLink) {
      updates.push('visio_link = ?');
      params.push(visioLink);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Aucune mise à jour fournie' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(token);

    await db.run(`
      UPDATE bookings 
      SET ${updates.join(', ')}
      WHERE confirmation_token = ?
    `, params);

    // Récupérer la réservation mise à jour
    const updatedBooking = await db.get(`
      SELECT b.*, s.name as service_name, s.duration as service_duration
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE b.confirmation_token = ?
    `, [token]);

    res.json(updatedBooking);
  } catch (error) {
    console.error('Erreur mise à jour réservation:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;