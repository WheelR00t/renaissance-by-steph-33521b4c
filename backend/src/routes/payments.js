const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const nodemailer = require('nodemailer');

// Configuration du transporteur email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// GET /api/payments/list - Liste des paiements (à partir des réservations)
router.get('/list', async (req, res) => {
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
      service: b.service_name || b.service_id,
      amount: b.price,
      status: b.payment_status === 'paid' ? 'completed' : (b.payment_status === 'failed' ? 'failed' : 'pending'),
      date: b.created_at?.split('T')[0] || b.date,
      method: 'card'
    }));

    res.json(list);
  } catch (error) {
    console.error('Erreur liste paiements:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// POST /api/payments/create-intent - Créer une intention de paiement Stripe
router.post('/create-intent', async (req, res) => {
  try {
    const { bookingId, amount } = req.body;

    if (!bookingId || !amount) {
      return res.status(400).json({ error: 'bookingId et amount requis' });
    }

    // Vérifier que la réservation existe
    const booking = await db.get('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    if (!booking) {
      return res.status(404).json({ error: 'Réservation non trouvée' });
    }

    // Créer une PaymentIntent avec Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // montant en centimes
      currency: 'eur',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        bookingId: bookingId,
        customerEmail: booking.email,
        customerName: `${booking.first_name} ${booking.last_name}`
      }
    });

    // Sauvegarder l'ID du PaymentIntent dans la base
    await db.run(`
      UPDATE bookings 
      SET stripe_payment_intent_id = ?
      WHERE id = ?
    `, [paymentIntent.id, bookingId]);

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: amount,
      currency: 'eur',
      bookingId: bookingId
    });

  } catch (error) {
    console.error('Erreur création PaymentIntent Stripe:', error);
    res.status(500).json({ error: 'Erreur serveur: ' + error.message });
  }
});

// POST /api/payments/confirm - Confirmer un paiement Stripe
router.post('/confirm', async (req, res) => {
  try {
    const { paymentIntentId, bookingId } = req.body;

    if (!paymentIntentId || !bookingId) {
      return res.status(400).json({ error: 'paymentIntentId et bookingId requis' });
    }

    // Récupérer le PaymentIntent depuis Stripe pour vérifier le statut
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId.split('_secret_')[0]);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ 
        success: false, 
        error: 'Paiement non confirmé par Stripe' 
      });
    }

    // Mettre à jour la réservation
    await db.run(`
      UPDATE bookings 
      SET status = 'confirmed', payment_status = 'paid', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [bookingId]);

    // Récupérer la réservation mise à jour
    const updatedBooking = await db.get(`
      SELECT b.*, s.name as service_name, s.duration as service_duration
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE b.id = ?
    `, [bookingId]);

    // Envoyer automatiquement l'email de confirmation
    try {
      const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366f1;">✨ Confirmation de votre réservation</h2>
        <p>Bonjour ${updatedBooking.first_name} ${updatedBooking.last_name},</p>
        <p>Votre réservation a été confirmée avec succès et votre paiement a été accepté !</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1f2937;">📋 Détails de votre réservation :</h3>
          <p><strong>Service :</strong> ${updatedBooking.service_name}</p>
          <p><strong>Date :</strong> ${new Date(updatedBooking.date).toLocaleDateString('fr-FR')}</p>
          <p><strong>Heure :</strong> ${updatedBooking.time}</p>
          <p><strong>Durée :</strong> ${updatedBooking.service_duration}</p>
          <p><strong>Prix :</strong> ${updatedBooking.price}€</p>
          <p><strong>Statut :</strong> <span style="color: #10b981;">✅ Confirmé et payé</span></p>
        </div>
        
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>🔗 Lien de suivi de votre réservation :</strong></p>
          <p style="margin: 5px 0;"><a href="${process.env.FRONTEND_URL}/reservation/confirmation?token=${updatedBooking.id}" style="color: #6366f1; text-decoration: none;">${process.env.FRONTEND_URL}/reservation/confirmation?token=${updatedBooking.id}</a></p>
          <p style="margin: 0; font-size: 0.9em; color: #6b7280;">Conservez ce lien pour accéder aux détails de votre séance et au lien visio le jour J.</p>
        </div>
        
        <p>Je vous contacterai prochainement pour finaliser les derniers détails et vous communiquer le lien de visioconférence si nécessaire.</p>
        <p>À très bientôt,<br><strong>Stéphanie</strong><br>Renaissance by Steph ✨</p>
      </div>`;

      await transporter.sendMail({
        from: '"Renaissance by Steph" <contact@renaissancebysteph.fr>',
        to: updatedBooking.email,
        subject: `✨ Réservation confirmée - ${updatedBooking.service_name}`,
        text: `Bonjour ${updatedBooking.first_name} ${updatedBooking.last_name},\n\nVotre réservation a été confirmée et votre paiement accepté !\n\nService: ${updatedBooking.service_name}\nDate: ${new Date(updatedBooking.date).toLocaleDateString('fr-FR')}\nHeure: ${updatedBooking.time}\nPrix: ${updatedBooking.price}€\n\nLien de suivi: ${process.env.FRONTEND_URL}/reservation/confirmation?token=${updatedBooking.id}\n\nÀ bientôt,\nStéphanie - Renaissance by Steph`,
        html: emailHtml
      });

      console.log(`📧 Email de confirmation automatiquement envoyé à ${updatedBooking.email}`);
    } catch (emailError) {
      console.error('⚠️  Erreur envoi email automatique:', emailError);
      // On ne fait pas échouer la réponse si l'email échoue
    }

    res.json({
      success: true,
      booking: {
        id: updatedBooking.id,
        service: updatedBooking.service_name,
        date: updatedBooking.date,
        time: updatedBooking.time,
        firstName: updatedBooking.first_name,
        lastName: updatedBooking.last_name,
        email: updatedBooking.email,
        phone: updatedBooking.phone,
        address: updatedBooking.address,
        message: updatedBooking.message,
        bookingType: updatedBooking.booking_type,
        status: updatedBooking.status,
        paymentStatus: updatedBooking.payment_status,
        price: updatedBooking.price,
        createdAt: updatedBooking.created_at
      }
    });

  } catch (error) {
    console.error('Erreur confirmation paiement Stripe:', error);
    res.status(500).json({ error: 'Erreur serveur: ' + error.message });
  }
});

module.exports = router;