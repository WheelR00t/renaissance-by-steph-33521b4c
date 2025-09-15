const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET /api/dashboard/stats - Statistiques du dashboard
router.get('/stats', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const weekStart = startOfWeek.toISOString().split('T')[0];
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    const monthStart = startOfMonth.toISOString().split('T')[0];

    // Rendez-vous aujourd'hui
    const todayAppointments = await db.get(
      'SELECT COUNT(*) as count FROM bookings WHERE date = ?',
      [today]
    );

    // Rendez-vous de la semaine
    const weekAppointments = await db.get(
      'SELECT COUNT(*) as count FROM bookings WHERE date >= ?',
      [weekStart]
    );

    // Revenus du mois (paiements reçus ce mois-ci, basé sur la dernière mise à jour)
    const monthRevenue = await db.get(
      'SELECT SUM(price) as total FROM bookings WHERE updated_at >= ? AND payment_status = "paid"',
      [monthStart]
    );

    // Réservations en attente
    const pendingBookings = await db.get(
      'SELECT COUNT(*) as count FROM bookings WHERE status = "pending"',
      []
    );

    // Total clients (utilisateurs uniques dans les bookings + users registered)
    const uniqueBookingClients = await db.get(
      'SELECT COUNT(DISTINCT email) as count FROM bookings',
      []
    );
    
    const registeredClients = await db.get(
      'SELECT COUNT(*) as count FROM users WHERE role = "client"',
      []
    );

    const totalClientCount = (uniqueBookingClients.count || 0) + (registeredClients.count || 0);

    const stats = {
      todayAppointments: todayAppointments.count || 0,
      weekAppointments: weekAppointments.count || 0,
      monthRevenue: monthRevenue.total || 0,
      pendingBookings: pendingBookings.count || 0,
      totalClients: totalClientCount,
      avgRating: 4.8 // TODO: Ajouter système de notes
    };

    res.json(stats);
  } catch (error) {
    console.error('Erreur stats dashboard:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/dashboard/activity - Activité récente
router.get('/activity', async (req, res) => {
  try {
    const recentBookings = await db.query(
      `SELECT 
        id, 
        first_name, 
        last_name, 
        service_id,
        status,
        payment_status,
        price,
        created_at
      FROM bookings 
      ORDER BY created_at DESC 
      LIMIT 10`
    );

    const services = await db.query('SELECT id, name FROM services');
    const serviceMap = {};
    services.forEach(s => serviceMap[s.id] = s.name);

    const activity = recentBookings.map(booking => {
      const createdAt = new Date(booking.created_at);
      const now = new Date();
      const diffHours = Math.floor((now - createdAt) / (1000 * 60 * 60));
      
      let timeText;
      if (diffHours < 1) timeText = 'Il y a moins d\'une heure';
      else if (diffHours < 24) timeText = `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
      else timeText = `Il y a ${Math.floor(diffHours / 24)} jour${Math.floor(diffHours / 24) > 1 ? 's' : ''}`;

      if (booking.payment_status === 'paid') {
        return {
          id: booking.id,
          type: 'payment',
          title: 'Paiement reçu',
          description: `${booking.price}€ - ${serviceMap[booking.service_id] || 'Service'}`,
          time: timeText,
          status: 'success'
        };
      } else {
        return {
          id: booking.id,
          type: 'booking',
          title: booking.status === 'pending' ? 'Réservation en attente' : 'Nouvelle réservation',
          description: `${booking.first_name} ${booking.last_name} - ${serviceMap[booking.service_id] || 'Service'}`,
          time: timeText,
          status: booking.status === 'pending' ? 'warning' : 'success'
        };
      }
    });

    res.json(activity);
  } catch (error) {
    console.error('Erreur activité dashboard:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/dashboard/today-appointments - RDV du jour
router.get('/today-appointments', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const appointments = await db.query(
      `SELECT 
        b.id,
        b.service_id,
        b.date,
        b.time,
        b.first_name,
        b.last_name,
        b.email,
        b.status,
        b.price,
        s.name as service_name,
        s.duration
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      WHERE b.date = ?
      ORDER BY b.time ASC`,
      [today]
    );

    res.json(appointments);
  } catch (error) {
    console.error('Erreur RDV du jour:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;