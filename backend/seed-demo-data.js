#!/usr/bin/env node

/**
 * Script d'initialisation de données de démonstration
 * Usage: node seed-demo-data.js
 */

const db = require('./src/database/db');
const { v4: uuidv4 } = require('uuid');

async function seedDemoData() {
  console.log('🌱 Initialisation des données de démonstration...');

  try {
    // Vérifier si on a déjà des réservations (éviter de dupliquer)
    const existingBookings = await db.get('SELECT COUNT(*) as count FROM bookings');
    
    if (existingBookings.count > 0) {
      console.log('ℹ️  Des réservations existent déjà, arrêt du seeding');
      return;
    }

    // Créer quelques réservations de démonstration
    const demoBookings = [
      {
        id: uuidv4(),
        service_id: 'tarot',
        date: '2025-09-16',
        time: '14:00',
        first_name: 'Marie',
        last_name: 'Dubois',
        email: 'marie.dubois@example.com',
        phone: '0123456789',
        address: '123 Rue de la Paix, Paris',
        message: 'Première consultation, très enthousiaste !',
        booking_type: 'guest',
        status: 'confirmed',
        payment_status: 'paid',
        price: 45.0,
        confirmation_token: 'demo-token-' + Math.random().toString(36).substr(2, 10)
      },
      {
        id: uuidv4(),
        service_id: 'reiki',
        date: '2025-09-17',
        time: '10:30',
        first_name: 'Pierre',
        last_name: 'Martin',
        email: 'pierre.martin@example.com',
        phone: '0987654321',
        address: '456 Avenue des Champs, Lyon',
        message: 'Séance de relaxation après une période difficile',
        booking_type: 'guest',
        status: 'pending',
        payment_status: 'pending',
        price: 60.0,
        confirmation_token: 'demo-token-' + Math.random().toString(36).substr(2, 10)
      },
      {
        id: uuidv4(),
        service_id: 'pendule',
        date: '2025-09-15',
        time: '16:00',
        first_name: 'Sophie',
        last_name: 'Leroy',
        email: 'sophie.leroy@example.com',
        phone: '0147258369',
        address: '789 Boulevard Saint-Germain, Marseille',
        message: 'Questions importantes à clarifier',
        booking_type: 'guest',
        status: 'confirmed',
        payment_status: 'paid',
        price: 35.0,
        confirmation_token: 'demo-token-' + Math.random().toString(36).substr(2, 10)
      }
    ];

    // Insérer les réservations de démonstration
    for (const booking of demoBookings) {
      await db.run(`
        INSERT INTO bookings (
          id, service_id, date, time, first_name, last_name, email, phone, 
          address, message, booking_type, status, payment_status, price, confirmation_token
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        booking.id, booking.service_id, booking.date, booking.time,
        booking.first_name, booking.last_name, booking.email, booking.phone,
        booking.address, booking.message, booking.booking_type, booking.status,
        booking.payment_status, booking.price, booking.confirmation_token
      ]);
    }

    // Créer quelques articles de blog de démonstration
    const demoBlogPosts = [
      {
        id: uuidv4(),
        title: 'Les Bienfaits de la Méditation Quotidienne',
        slug: 'les-bienfaits-de-la-meditation-quotidienne',
        content: `# Les Bienfaits de la Méditation Quotidienne

La méditation est une pratique millénaire qui offre de nombreux bienfaits pour l'esprit et le corps. Dans notre monde moderne, elle devient un outil essentiel pour maintenir l'équilibre et la sérénité.

## Pourquoi méditer ?

La méditation permet de :
- Réduire le stress et l'anxiété
- Améliorer la concentration
- Développer la conscience de soi
- Favoriser un sommeil réparateur

## Comment commencer ?

Commencez par des séances de 5 à 10 minutes par jour, idéalement le matin. Trouvez un endroit calme et concentrez-vous sur votre respiration.

N'hésitez pas à me contacter si vous souhaitez être accompagné dans cette démarche spirituelle.`,
        excerpt: 'Découvrez comment la méditation quotidienne peut transformer votre vie et vous apporter sérénité et bien-être.',
        image_url: null,
        author_id: 'admin-1',
        status: 'published',
        published_at: new Date().toISOString().replace('T', ' ').replace('Z', '').slice(0, 19)
      },
      {
        id: uuidv4(),
        title: 'Comprendre l\'Énergie des Cristaux',
        slug: 'comprendre-energie-des-cristaux',
        content: `# Comprendre l'Énergie des Cristaux

Les cristaux et pierres précieuses ont toujours fasciné l'humanité par leur beauté et leurs propriétés énergétiques uniques.

## Les cristaux les plus puissants

### Améthyste
Pierre de la spiritualité et de la sagesse, l'améthyste aide à calmer l'esprit et favorise l'intuition.

### Quartz Rose
Pierre de l'amour inconditionnel, elle apporte douceur et guérison émotionnelle.

### Cristal de Roche
Amplificateur naturel, il purifie les énergies et renforce les intentions.

## Comment utiliser les cristaux ?

- Portez-les sur vous
- Placez-les dans votre environnement
- Utilisez-les en méditation
- Intégrez-les dans vos soins énergétiques

Les cristaux sont de merveilleux alliés sur le chemin de la guérison et de l'évolution personnelle.`,
        excerpt: 'Plongez dans l\'univers fascinant des cristaux et découvrez comment ils peuvent enrichir votre pratique spirituelle.',
        image_url: null,
        author_id: 'admin-1',
        status: 'published',
        published_at: new Date(Date.now() - 86400000).toISOString().replace('T', ' ').replace('Z', '').slice(0, 19)
      },
      {
        id: uuidv4(),
        title: 'L\'Art du Tirage de Tarot',
        slug: 'art-du-tirage-de-tarot',
        content: `# L'Art du Tirage de Tarot

Le tarot est bien plus qu'un simple jeu de cartes. C'est un outil de développement personnel et de guidance spirituelle d'une richesse incroyable.

## Histoire du Tarot

Le tarot trouve ses origines au XVe siècle en Europe. Les 78 cartes qui le composent racontent l'histoire de l'évolution humaine à travers les Arcanes Majeurs et Mineurs.

## Les différents types de tirages

### Le tirage à 3 cartes
- Passé - Présent - Futur
- Situation - Action - Résultat

### La croix celtique
Un tirage plus complexe qui offre une vision globale de la situation.

## Interpréter les cartes

L'interprétation ne se limite pas à la signification traditionnelle des cartes. Elle nécessite :
- Intuition développée
- Compréhension des symboles
- Capacité d'écoute
- Bienveillance

Le tarot est un miroir de l'âme qui révèle ce que nous savons déjà au fond de nous.`,
        excerpt: 'Découvrez les secrets du tarot et apprenez comment ces cartes millénaires peuvent vous guider dans votre vie.',
        image_url: null,
        author_id: 'admin-1',
        status: 'draft'
      }
    ];

    // Insérer les articles de blog
    for (const post of demoBlogPosts) {
      await db.run(`
        INSERT INTO blog_posts (
          id, title, slug, content, excerpt, image_url, author_id, status, published_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        post.id, post.title, post.slug, post.content, post.excerpt,
        post.image_url, post.author_id, post.status, post.published_at
      ]);
    }

    // Ajouter quelques messages de contact de test (désactivé par défaut)
    if (process.env.SEED_CONTACT_MESSAGES === '1') {
      console.log('📧 Ajout de messages de contact de démo...');
      const contactMessages = [
        {
          id: uuidv4(),
          firstName: 'Marie',
          lastName: 'Dubois',
          email: 'marie.dubois@email.com',
          phone: '06 12 34 56 78',
          subject: 'Demande d\'informations',
          message: 'Bonjour, j\'aimerais avoir des informations sur vos consultations de tarot. Merci !',
          contactReason: 'consultation',
          status: 'new'
        },
        {
          id: uuidv4(),
          firstName: 'Pierre',
          lastName: 'Martin',
          email: 'pierre.martin@email.com',
          subject: 'Séance de Reiki',
          message: 'Bonsoir, je voudrais réserver une séance de Reiki. Quels sont vos créneaux disponibles ?',
          contactReason: 'consultation',
          status: 'read'
        },
        {
          id: uuidv4(),
          firstName: 'Sophie',
          lastName: 'Leroy',
          email: 'sophie.leroy@email.com',
          phone: '07 89 12 34 56',
          message: 'Merci pour la magnifique séance d\'hier ! J\'ai ressenti beaucoup de bien-être.',
          contactReason: 'feedback',
          status: 'replied'
        }
      ];

      for (const msg of contactMessages) {
        await db.run(`
          INSERT INTO contact_messages (
            id, first_name, last_name, email, phone, subject, message, contact_reason, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [msg.id, msg.firstName, msg.lastName, msg.email, msg.phone || null, msg.subject || null, msg.message, msg.contactReason || null, msg.status]);
      }
      console.log(`   - ${contactMessages.length} messages de contact`);
    } else {
      console.log('⏭️  Saut des messages de contact de démo (SEED_CONTACT_MESSAGES != 1)');
    }
    console.log('');
    console.log('📋 Vous pouvez maintenant :');
    console.log('   - Tester les réservations');
    console.log('   - Consulter le dashboard admin');
    console.log('   - Voir les articles de blog');
    console.log('   - Accéder aux statistiques');

  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
  } finally {
    await db.close();
  }
}

// Exécuter le script
seedDemoData();