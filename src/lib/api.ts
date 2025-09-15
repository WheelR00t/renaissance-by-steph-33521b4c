// API Layer - Connectez ces endpoints à votre backend SQLite

const API_BASE_URL = '/api';

// Types pour le backend
export interface TimeSlot {
  time: string;
  available: boolean;
  booked?: boolean;
}

export interface BookingData {
  id?: string;
  service: string;
  date: string;
  time: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  message?: string;
  bookingType?: 'guest' | 'registered';
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  price: number;
  createdAt?: string;
  confirmationToken?: string;
}

export interface PaymentIntent {
  clientSecret: string;
  amount: number;
  currency: string;
  bookingId: string;
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log('🌐 API Request:', options.method || 'GET', url);
    console.log('📤 Request body:', options.body);
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      console.log('📥 Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error response:', errorText);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📋 Response data:', data);
      return data;
    } catch (error) {
      console.error('❌ API Request failed:', error);
      throw error;
    }
  }

  // CALENDRIER - Récupérer les créneaux disponibles
  async getAvailableSlots(date: string): Promise<TimeSlot[]> {
    try {
      return await this.request<TimeSlot[]>(`/calendar/slots?date=${date}`);
    } catch (error) {
      console.warn('API non disponible, utilisation des créneaux par défaut');
      // Fallback pour le développement
      return this.getFallbackSlots();
    }
  }

  private getFallbackSlots(): TimeSlot[] {
    const slots = [
      "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
      "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
      "17:00", "17:30", "18:00", "18:30", "19:00"
    ];
    
    return slots.map(time => ({
      time,
      available: Math.random() > 0.3, // 70% de disponibilité aléatoire
      booked: Math.random() > 0.8
    }));
  }

  // RÉSERVATIONS - Créer une réservation
  async createBooking(bookingData: Omit<BookingData, 'id' | 'createdAt'>): Promise<{
    booking: BookingData;
    confirmationToken: string;
  }> {
    try {
      // Adapter les données pour l'API backend
      const backendData = {
        serviceId: bookingData.service, // service contient l'ID du service
        date: bookingData.date,
        time: bookingData.time,
        firstName: bookingData.firstName,
        lastName: bookingData.lastName,
        email: bookingData.email,
        phone: bookingData.phone,
        address: bookingData.address,
        message: bookingData.message,
        bookingType: bookingData.bookingType || 'guest'
      };

      return await this.request<{booking: BookingData; confirmationToken: string}>('/bookings', {
        method: 'POST',
        body: JSON.stringify(backendData),
      });
    } catch (error) {
      console.warn('API non disponible, simulation de création');
      // Fallback pour le développement
      const bookingId = 'booking_' + Date.now();
      return {
        booking: {
          ...bookingData,
          id: bookingId,
          createdAt: new Date().toISOString(),
          confirmationToken: 'token_' + Math.random().toString(36).substr(2, 9)
        },
        confirmationToken: 'token_' + Math.random().toString(36).substr(2, 9)
      };
    }
  }

  // PAIEMENTS - Créer une intention de paiement Stripe
  async createPaymentIntent(bookingId: string, amount: number): Promise<PaymentIntent> {
    try {
      return await this.request<PaymentIntent>('/payments/create-intent', {
        method: 'POST',
        body: JSON.stringify({ bookingId, amount }),
      });
    } catch (error) {
      console.warn('API non disponible, simulation de paiement');
      // Fallback pour le développement
      return {
        clientSecret: 'pi_fake_client_secret_' + Math.random().toString(36).substr(2, 9),
        amount,
        currency: 'eur',
        bookingId
      };
    }
  }

  // PAIEMENTS - Confirmer le paiement
  async confirmPayment(paymentIntentId: string, bookingId: string): Promise<{
    success: boolean;
    booking: BookingData;
  }> {
    try {
      return await this.request<{success: boolean; booking: BookingData}>('/payments/confirm', {
        method: 'POST',
        body: JSON.stringify({ paymentIntentId, bookingId }),
      });
    } catch (error) {
      console.warn('API non disponible, simulation de confirmation');
      return {
        success: true,
        booking: {
          id: bookingId,
          paymentStatus: 'paid',
          status: 'confirmed'
        } as BookingData
      };
    }
  }

  // RÉSERVATIONS - Récupérer une réservation par token
  async getBookingByToken(token: string): Promise<BookingData> {
    try {
      return await this.request<BookingData>(`/bookings/token/${token}`);
    } catch (error) {
      console.warn('API non disponible, données simulées');
      // Fallback pour le développement
      return {
        id: 'booking_' + Date.now(),
        service: 'Tirage de Cartes',
        date: new Date().toISOString().split('T')[0],
        time: '14:00',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '0123456789',
        bookingType: 'guest',
        status: 'confirmed',
        paymentStatus: 'paid',
        price: 45,
        createdAt: new Date().toISOString()
      };
    }
  }

  // ADMIN - Réservations (liste)
  async getAdminBookings(): Promise<any[]> {
    return await this.request<any[]>('/bookings');
  }

  // ADMIN - Mettre à jour une réservation par ID
  async updateBookingById(id: string, payload: Partial<{ status: string; paymentStatus: string; visioLink: string }>): Promise<any> {
    return await this.request<any>(`/bookings/id/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }

  // ADMIN - Supprimer une réservation par ID
  async deleteBookingById(id: string): Promise<{ success: boolean }> {
    return await this.request<{ success: boolean }>(`/bookings/id/${id}`, {
      method: 'DELETE'
    });
  }

  // ADMIN - Paiements (liste)
  async getPaymentsList(): Promise<any[]> {
    return await this.request<any[]>('/payments/list');
  }

  // EMAILS - Déclencher l'envoi d'emails (confirmation, rappel)
  async sendConfirmationEmail(bookingId: string): Promise<{success: boolean}> {
    try {
      return await this.request<{success: boolean}>('/emails/confirmation', {
        method: 'POST',
        body: JSON.stringify({ bookingId }),
      });
    } catch (error) {
      console.warn('API non disponible, email simulé');
      return { success: true };
    }
  }

  async sendReminderEmail(bookingId: string): Promise<{success: boolean}> {
    try {
      return await this.request<{success: boolean}>('/emails/reminder', {
        method: 'POST',
        body: JSON.stringify({ bookingId }),
      });
    } catch (error) {
      console.warn('API non disponible, email simulé');
      return { success: true };
    }
  }

  // SERVICES - Récupérer la liste des services
  async getServices(): Promise<Array<{
    id: string;
    name: string;
    price: number;
    duration: string;
    description: string;
    isActive: boolean;
  }>> {
    console.log('📋 Récupération de la liste des services...');
    try {
      const services = await this.request<Array<any>>('/services');
      console.log('✅ Services récupérés:', services);
      return services;
    } catch (error) {
      console.warn('⚠️ API non disponible, services par défaut');
      return [
        { id: "tarot", name: "Tirage de Cartes", price: 45, duration: "30-60 min", description: "", isActive: true },
        { id: "reiki", name: "Séance Reiki", price: 60, duration: "45-90 min", description: "", isActive: true },
        { id: "pendule", name: "Divination au Pendule", price: 35, duration: "30-45 min", description: "", isActive: true },
        { id: "guerison", name: "Guérison Énergétique", price: 70, duration: "60-90 min", description: "", isActive: true }
      ];
    }
  }

  // SERVICES - Créer un service
  async createService(serviceData: any): Promise<any> {
    return await this.request<any>('/services', {
      method: 'POST',
      body: JSON.stringify(serviceData)
    });
  }

  // SERVICES - Modifier un service
  async updateService(id: string, serviceData: any): Promise<any> {
    console.log('🔄 Tentative de modification du service:', id, serviceData);
    try {
      const result = await this.request<any>(`/services/${id}`, {
        method: 'PUT',
        body: JSON.stringify(serviceData)
      });
      console.log('✅ Service modifié avec succès:', result);
      return result;
    } catch (error) {
      console.error('❌ Erreur lors de la modification du service:', error);
      throw error;
    }
  }

  // SERVICES - Supprimer un service
  async deleteService(id: string): Promise<{ success: boolean }> {
    return await this.request<{ success: boolean }>(`/services/${id}`, {
      method: 'DELETE'
    });
  }

  // ADMIN - Clients (liste)
  async getClients(): Promise<any[]> {
    try {
      const res = await this.request<{ count: number; users: any[] }>(`/users/debug-list`);
      return res.users.map((u) => ({
        id: u.id,
        name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email,
        email: u.email,
        phone: u.phone || '',
        dateCreated: (u.created_at || '').split('T')[0] || '',
        totalBookings: 0,
        lastBooking: '-',
        status: u.is_active ? 'active' : 'inactive',
        notes: ''
      }));
    } catch (error) {
      return [];
    }
  }

  // BLOG - Récupérer tous les articles publiés
  async getBlogPosts(category?: string, limit = 10, offset = 0): Promise<any[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    
    return await this.request<any[]>(`/blog?${params.toString()}`);
  }

  // BLOG - Récupérer un article par slug
  async getBlogPost(slug: string): Promise<any> {
    return await this.request<any>(`/blog/${slug}`);
  }

  // BLOG ADMIN - Récupérer tous les articles (admin)
  async getAdminBlogPosts(status = 'all', limit = 50, offset = 0): Promise<any[]> {
    const params = new URLSearchParams();
    params.append('status', status);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    
    return await this.request<any[]>(`/blog/admin?${params.toString()}`);
  }

  // BLOG ADMIN - Créer un article
  async createBlogPost(postData: {
    title: string;
    content: string;
    excerpt?: string;
    status?: 'draft' | 'published';
  }): Promise<any> {
    return await this.request<any>('/blog', {
      method: 'POST',
      body: JSON.stringify(postData)
    });
  }

  // BLOG ADMIN - Modifier un article
  async updateBlogPost(id: string, postData: {
    title?: string;
    content?: string;
    excerpt?: string;
    status?: 'draft' | 'published';
  }): Promise<any> {
    return await this.request<any>(`/blog/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData)
    });
  }

  // BLOG ADMIN - Supprimer un article
  async deleteBlogPost(id: string): Promise<{ success: boolean }> {
    return await this.request<{ success: boolean }>(`/blog/${id}`, {
      method: 'DELETE'
    });
  }
}

export const apiService = new ApiService();

// Helpers pour votre backend
export const API_ENDPOINTS = {
  // Calendrier
  GET_SLOTS: '/calendar/slots?date={date}',
  
  // Réservations  
  CREATE_BOOKING: '/bookings',
  GET_BOOKING_BY_TOKEN: '/bookings/token/{token}',
  UPDATE_BOOKING: '/bookings/id/{id}',
  DELETE_BOOKING: '/bookings/id/{id}',
  LIST_BOOKINGS: '/bookings',
  
  // Paiements
  CREATE_PAYMENT_INTENT: '/payments/create-intent',
  CONFIRM_PAYMENT: '/payments/confirm',
  LIST_PAYMENTS: '/payments/list',
  
  // Emails
  SEND_CONFIRMATION: '/emails/confirmation',
  SEND_REMINDER: '/emails/reminder',
  
  // Services
  GET_SERVICES: '/services',
};

/*
BACKEND SQLITE STRUCTURE RECOMMANDÉE :

-- Table services
CREATE TABLE services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  duration TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table bookings
CREATE TABLE bookings (
  id TEXT PRIMARY KEY,
  service_id TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  message TEXT,
  booking_type TEXT CHECK(booking_type IN ('guest', 'registered')) NOT NULL,
  status TEXT CHECK(status IN ('pending', 'confirmed', 'cancelled')) DEFAULT 'pending',
  payment_status TEXT CHECK(payment_status IN ('pending', 'paid', 'failed')) DEFAULT 'pending',
  price REAL NOT NULL,
  confirmation_token TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services (id)
);

-- Table time_slots (optionnel, pour gérer la disponibilité)
CREATE TABLE time_slots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  is_blocked BOOLEAN DEFAULT false,
  UNIQUE(date, time)
);

-- Index pour les performances
CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_bookings_token ON bookings(confirmation_token);
CREATE INDEX idx_time_slots_date ON time_slots(date);
*/