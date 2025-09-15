const express = require('express');
const router = express.Router();
const db = require('../database/db');

// POST /api/emails/confirmation - Envoyer email de confirmation
router.post('/confirmation', async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ error: 'bookingId requis' });
    }

    // Récupérer les détails de la réservation
    const booking = await db.get(`
      SELECT b.*, s.name as service_name, s.duration as service_duration
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE b.id = ?
    `, [bookingId]);

    if (!booking) {
      return res.status(404).json({ error: 'Réservation non trouvée' });
    }

    // Simulation d'envoi d'email
    // Dans une vraie implémentation, vous utiliseriez un service comme :
    // - Nodemailer
    // - SendGrid
    // - AWS SES
    
    console.log(`📧 Email de confirmation envoyé à ${booking.email}`);
    console.log(`Service: ${booking.service_name}`);
    console.log(`Date: ${booking.date} à ${booking.time}`);
    console.log(`Prix: ${booking.price}€`);

    // Marquer l'email comme envoyé (optionnel - ajouter une colonne confirmation_email_sent)
    await db.run(`
      UPDATE bookings 
      SET updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [bookingId]);

    res.json({
      success: true,
      message: 'Email de confirmation envoyé'
    });

  } catch (error) {
    console.error('Erreur envoi email confirmation:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/emails/reminder - Envoyer email de rappel
router.post('/reminder', async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ error: 'bookingId requis' });
    }

    // Récupérer les détails de la réservation
    const booking = await db.get(`
      SELECT b.*, s.name as service_name, s.duration as service_duration
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE b.id = ?
    `, [bookingId]);

    if (!booking) {
      return res.status(404).json({ error: 'Réservation non trouvée' });
    }

    // Simulation d'envoi d'email de rappel
    console.log(`📧 Email de rappel envoyé à ${booking.email}`);
    console.log(`Rappel: RDV ${booking.service_name} le ${booking.date} à ${booking.time}`);

    res.json({
      success: true,
      message: 'Email de rappel envoyé'
    });

  } catch (error) {
    console.error('Erreur envoi email rappel:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;