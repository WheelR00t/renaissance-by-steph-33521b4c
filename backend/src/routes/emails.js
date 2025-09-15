const express = require('express');
const router = express.Router();
const db = require('../database/db');
const nodemailer = require('nodemailer');

// Configuration du transporteur email
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true pour 465, false pour autres ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

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

    // Envoi de l'email de confirmation
    const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #6366f1;">Confirmation de votre réservation</h2>
      <p>Bonjour ${booking.first_name} ${booking.last_name},</p>
      <p>Votre réservation a été confirmée avec succès !</p>
      
      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Détails de votre réservation :</h3>
        <p><strong>Service :</strong> ${booking.service_name}</p>
        <p><strong>Date :</strong> ${booking.date}</p>
        <p><strong>Heure :</strong> ${booking.time}</p>
        <p><strong>Durée :</strong> ${booking.service_duration}</p>
        <p><strong>Prix :</strong> ${booking.price}€</p>
      </div>
      
      <p>Nous vous contacterons prochainement pour finaliser les détails.</p>
      <p>À bientôt,<br>Renaissance by Steph</p>
    </div>`;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: booking.email,
      subject: `Confirmation de réservation - ${booking.service_name}`,
      html: emailHtml
    });

    console.log(`📧 Email de confirmation envoyé à ${booking.email}`);

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