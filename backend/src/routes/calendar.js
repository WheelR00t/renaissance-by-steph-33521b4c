const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET /api/calendar/slots - Récupérer les créneaux disponibles pour une date
router.get('/slots', async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: 'Date requise' });
    }

    // Créneaux de base (à personnaliser selon vos horaires)
    const baseSlots = [
      "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
      "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", 
      "17:00", "17:30", "18:00", "18:30", "19:00"
    ];

    // Récupérer les créneaux déjà réservés pour cette date
    const bookedSlots = await db.query(
      'SELECT time FROM bookings WHERE date = ? AND status != "cancelled"',
      [date]
    );

    const bookedTimes = bookedSlots.map(b => b.time);

    // Créer la liste des créneaux avec leur disponibilité
    const slots = baseSlots.map(time => ({
      time,
      available: !bookedTimes.includes(time),
      booked: bookedTimes.includes(time)
    }));

    res.json(slots);
  } catch (error) {
    console.error('Erreur créneaux:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/calendar/bookings - Récupérer les réservations (pour l'admin)
router.get('/bookings', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    let query = `
      SELECT b.*, s.name as service_name 
      FROM bookings b 
      JOIN services s ON b.service_id = s.id 
      WHERE b.status != 'cancelled'
    `;
    
    const params = [];
    
    if (start_date && end_date) {
      query += ' AND b.date BETWEEN ? AND ?';
      params.push(start_date, end_date);
    }
    
    query += ' ORDER BY b.date, b.time';
    
    const bookings = await db.query(query, params);
    
    res.json(bookings);
  } catch (error) {
    console.error('Erreur réservations:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;