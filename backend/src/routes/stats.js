const express = require('express');
const router = express.Router();
const db = require('../database/db');

// GET /api/stats - Récupérer toutes les statistiques
router.get('/', async (req, res) => {
  try {
    console.log('📊 [STATS] Récupération des statistiques...');
    
    // Date actuelle et dates de référence
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    
    const currentMonthStr = startOfMonth.toISOString().split('T')[0];
    const lastMonthStartStr = startOfLastMonth.toISOString().split('T')[0];
    const lastMonthEndStr = endOfLastMonth.toISOString().split('T')[0];

    console.log('📅 [STATS] Périodes:', { currentMonthStr, lastMonthStartStr, lastMonthEndStr });

    // 1. Revenus du mois courant
    const currentMonthRevenue = await db.get(`
      SELECT COALESCE(SUM(price), 0) as revenue
      FROM bookings 
      WHERE date >= ? AND payment_status = 'paid'
    `, [currentMonthStr]);

    // 2. Revenus du mois précédent
    const lastMonthRevenue = await db.get(`
      SELECT COALESCE(SUM(price), 0) as revenue
      FROM bookings 
      WHERE date >= ? AND date <= ? AND payment_status = 'paid'
    `, [lastMonthStartStr, lastMonthEndStr]);

    // 3. Consultations du mois courant
    const currentMonthBookings = await db.get(`
      SELECT COUNT(*) as count
      FROM bookings 
      WHERE date >= ? AND status != 'cancelled'
    `, [currentMonthStr]);

    // 4. Consultations du mois précédent
    const lastMonthBookings = await db.get(`
      SELECT COUNT(*) as count
      FROM bookings 
      WHERE date >= ? AND date <= ? AND status != 'cancelled'
    `, [lastMonthStartStr, lastMonthEndStr]);

    // 5. Nouveaux clients du mois courant
    const newClientsThisMonth = await db.get(`
      SELECT COUNT(DISTINCT email) as count
      FROM bookings 
      WHERE created_at >= ? AND booking_type = 'guest'
    `, [currentMonthStr]);

    // 6. Services les plus populaires
    const popularServices = await db.all(`
      SELECT 
        s.name,
        COUNT(b.id) as bookings_count,
        ROUND(COUNT(b.id) * 100.0 / (SELECT COUNT(*) FROM bookings WHERE status != 'cancelled'), 1) as percentage
      FROM services s
      LEFT JOIN bookings b ON s.id = b.service_id AND b.status != 'cancelled'
      GROUP BY s.id, s.name
      ORDER BY bookings_count DESC
      LIMIT 5
    `);

    // 7. Activité récente (vraies données)
    const recentActivity = await db.all(`
      SELECT 
        'booking' as type,
        'Nouvelle réservation' as title,
        (first_name || ' ' || SUBSTR(last_name, 1, 1) || '. - ' || (SELECT name FROM services WHERE id = service_id)) as description,
        created_at as time,
        'success' as status
      FROM bookings 
      WHERE created_at >= datetime('now', '-7 days')
      ORDER BY created_at DESC
      LIMIT 10
    `);

    // 8. Messages de contact récents
    const recentMessages = await db.all(`
      SELECT 
        'message' as type,
        'Nouveau message' as title,
        (first_name || ' ' || SUBSTR(last_name, 1, 1) || '. - ' || COALESCE(subject, 'Message général')) as description,
        created_at as time,
        CASE WHEN status = 'new' THEN 'warning' ELSE 'success' END as status
      FROM contact_messages 
      WHERE created_at >= datetime('now', '-7 days')
      ORDER BY created_at DESC
      LIMIT 5
    `).catch(() => []); // Fallback si table n'existe pas

    // 9. Horaires de pointe (basés sur les vraies réservations)
    const peakHours = await db.all(`
      SELECT 
        CASE 
          WHEN time BETWEEN '09:00' AND '10:59' THEN '09h00 - 11h00'
          WHEN time BETWEEN '11:00' AND '13:59' THEN '11h00 - 14h00'
          WHEN time BETWEEN '14:00' AND '16:59' THEN '14h00 - 17h00'
          WHEN time BETWEEN '17:00' AND '19:59' THEN '17h00 - 20h00'
          ELSE 'Autre'
        END as time_slot,
        COUNT(*) as bookings_count
      FROM bookings
      WHERE status != 'cancelled'
      GROUP BY time_slot
      ORDER BY bookings_count DESC
    `);

    // 10. Calcul des pourcentages d'évolution
    const revenueGrowth = lastMonthRevenue.revenue > 0 
      ? Math.round(((currentMonthRevenue.revenue - lastMonthRevenue.revenue) / lastMonthRevenue.revenue) * 100)
      : 0;

    const bookingsGrowth = lastMonthBookings.count > 0
      ? Math.round(((currentMonthBookings.count - lastMonthBookings.count) / lastMonthBookings.count) * 100)
      : 0;

    // Combiner activité récente et messages
    const allActivity = [...recentActivity, ...recentMessages]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 10);

    const stats = {
      // Métriques principales
      monthlyRevenue: {
        current: currentMonthRevenue.revenue,
        growth: revenueGrowth
      },
      monthlyBookings: {
        current: currentMonthBookings.count,
        growth: bookingsGrowth
      },
      newClients: newClientsThisMonth.count,
      averageRating: 4.8, // À implémenter plus tard avec un système d'avis
      totalReviews: 0, // À implémenter plus tard

      // Services populaires
      popularServices: popularServices,

      // Activité récente
      recentActivity: allActivity.map(activity => ({
        id: `${activity.type}-${Math.random()}`,
        type: activity.type,
        title: activity.title,
        description: activity.description,
        time: activity.time,
        status: activity.status
      })),

      // Horaires de pointe
      peakHours: peakHours.map(slot => ({
        timeSlot: slot.time_slot,
        bookingsCount: slot.bookings_count,
        level: slot.bookings_count >= 10 ? 'high' : 
               slot.bookings_count >= 5 ? 'medium' : 'low'
      }))
    };

    console.log('✅ [STATS] Statistiques calculées:', stats);
    res.json(stats);

  } catch (error) {
    console.error('❌ [STATS] Erreur:', error);
    res.status(500).json({ 
      error: 'Erreur serveur',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;