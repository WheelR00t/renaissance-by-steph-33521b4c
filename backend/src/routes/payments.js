const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');

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


// POST /api/payments/create-intent - Créer une intention de paiement
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

    // Générer un client secret (simulation Stripe)
    const clientSecret = `pi_${uuidv4().replace(/-/g, '')}_secret_${uuidv4().slice(0, 8)}`;

    // Dans une vraie implémentation Stripe, vous feriez :
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: amount,
    //   currency: 'eur',
    //   metadata: { bookingId: bookingId }
    // });

    const paymentIntent = {
      clientSecret: clientSecret,
      amount: amount,
      currency: 'eur',
      bookingId: bookingId
    };

    res.json(paymentIntent);

  } catch (error) {
    console.error('Erreur création payment intent:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/payments/confirm - Confirmer un paiement
router.post('/confirm', async (req, res) => {
  try {
    const { paymentIntentId, bookingId } = req.body;

    if (!paymentIntentId || !bookingId) {
      return res.status(400).json({ error: 'paymentIntentId et bookingId requis' });
    }

    // Simuler la confirmation de paiement (90% de succès)
    const isPaymentSuccessful = Math.random() > 0.1;

    if (!isPaymentSuccessful) {
      return res.status(400).json({ 
        success: false, 
        error: 'Paiement refusé par la banque' 
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
    console.error('Erreur confirmation paiement:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;