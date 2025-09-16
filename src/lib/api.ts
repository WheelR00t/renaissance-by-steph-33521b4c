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
    
    // Ajouter le token JWT aux headers si disponible
    const token = localStorage.getItem('authToken');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };
    
    if (token && token !== 'jwt-token') { // Ignorer l'ancien placeholder
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      headers,
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
    return await this.request<TimeSlot[]>(`/calendar/slots?date=${date}`);
  }


  // RÉSERVATIONS - Créer une réservation
  async createBooking(bookingData: Omit<BookingData, 'id' | 'createdAt'>): Promise<{
    booking: BookingData;
    confirmationToken: string;
  }> {
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
  }

  // PAIEMENTS - Créer une intention de paiement Stripe
  async createPaymentIntent(bookingId: string, amount: number): Promise<PaymentIntent> {
    return await this.request<PaymentIntent>('/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({ bookingId, amount }),
    });
  }

  // PAIEMENTS - Confirmer le paiement
  async confirmPayment(paymentIntentId: string, bookingId: string): Promise<{
    success: boolean;
    booking: BookingData;
  }> {
    return await this.request<{success: boolean; booking: BookingData}>('/payments/confirm', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId, bookingId }),
    });
  }

  // RÉSERVATIONS - Récupérer une réservation par token
  async getBookingByToken(token: string): Promise<BookingData> {
    return await this.request<BookingData>(`/bookings/token/${token}`);
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
    return await this.request<{success: boolean}>('/emails/confirmation', {
      method: 'POST',
      body: JSON.stringify({ bookingId }),
    });
  }

  async sendReminderEmail(bookingId: string): Promise<{success: boolean}> {
    return await this.request<{success: boolean}>('/emails/reminder', {
      method: 'POST',
      body: JSON.stringify({ bookingId }),
    });
  }

  async sendCancellationEmail(bookingId: string): Promise<{success: boolean}> {
    return await this.request<{success: boolean}>('/emails/cancellation', {
      method: 'POST',
      body: JSON.stringify({ bookingId }),
    });
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
    const services = await this.request<Array<any>>('/services');
    console.log('✅ Services récupérés:', services);
    return services;
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
    console.log('🌐 Récupération des articles du blog...');
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    
    try {
      const result = await this.request<any[]>(`/blog?${params.toString()}`);
      console.log('✅ Articles blog récupérés:', result);
      return result;
    } catch (error) {
      console.error('❌ Erreur API blog:', error);
      throw error;
    }
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
    imageUrl?: string;
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
    imageUrl?: string;
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

  // DASHBOARD - Stats
  async getDashboardStats(): Promise<any> {
    return await this.request<any>('/dashboard/stats');
  }

  // DASHBOARD - Activité récente
  async getDashboardActivity(): Promise<any[]> {
    return await this.request<any[]>('/dashboard/activity');
  }

  // DASHBOARD - RDV du jour
  async getTodayAppointments(): Promise<any[]> {
    return await this.request<any[]>('/dashboard/today-appointments');
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