const express = require('express');
const router = express.Router();
const db = require('../database/db');
const nodemailer = require('nodemailer');

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: Number(process.env.EMAIL_PORT) === 465, // true pour 465 (SSL), false pour 587 (STARTTLS)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
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
      from: '"Renaissance by Steph" <contact@renaissancebysteph.fr>',
      to: booking.email,
      subject: `✨ Confirmation de réservation - ${booking.service_name}`,
      text: `Bonjour ${booking.first_name} ${booking.last_name},\n\nVotre réservation a été confirmée !\n\nService: ${booking.service_name}\nDate: ${booking.date}\nHeure: ${booking.time}\nPrix: ${booking.price}€\n\nÀ bientôt,\nRenaissance by Steph`,
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

// POST /api/emails/cancellation - Envoyer email d'annulation
router.post('/cancellation', async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ error: 'bookingId requis' });
    }

    const booking = await db.get(`
      SELECT b.*, s.name as service_name, s.duration as service_duration
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE b.id = ?
    `, [bookingId]);

    if (!booking) {
      return res.status(404).json({ error: 'Réservation non trouvée' });
    }

    const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">❌ Annulation de votre réservation</h2>
      <p>Bonjour ${booking.first_name} ${booking.last_name},</p>
      <p>Votre réservation a été annulée.</p>
      
      <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
        <h3 style="margin-top: 0; color: #7f1d1d;">📋 Détails de la réservation annulée :</h3>
        <p><strong>Service :</strong> ${booking.service_name}</p>
        <p><strong>Date :</strong> ${new Date(booking.date).toLocaleDateString('fr-FR')}</p>
        <p><strong>Heure :</strong> ${booking.time}</p>
        <p><strong>Prix :</strong> ${booking.price}€</p>
      </div>
      
      <p>Si vous souhaitez reprendre un nouveau rendez-vous, n'hésitez pas à retourner sur notre site.</p>
      <p>À bientôt,<br><strong>Stéphanie</strong><br>Renaissance by Steph ✨</p>
    </div>`;

    await transporter.sendMail({
      from: '"Renaissance by Steph" <contact@renaissancebysteph.fr>',
      to: booking.email,
      subject: `❌ Annulation de réservation - ${booking.service_name}`,
      text: `Bonjour ${booking.first_name} ${booking.last_name},\n\nVotre réservation a été annulée.\n\nService: ${booking.service_name}\nDate: ${new Date(booking.date).toLocaleDateString('fr-FR')}\nHeure: ${booking.time}\n\nÀ bientôt,\nStéphanie - Renaissance by Steph`,
      html: emailHtml
    });

    console.log(`📧 Email d'annulation envoyé à ${booking.email}`);

    res.json({
      success: true,
      message: 'Email d\'annulation envoyé'
    });

  } catch (error) {
    console.error('Erreur envoi email annulation:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;