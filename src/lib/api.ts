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

  // BLOG - Récupérer les articles
  async getBlogPosts(category?: string, limit = 10, offset = 0): Promise<any[]> {
    console.log('🌐 Récupération des articles du blog...');
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    
    const result = await this.request<any[]>(`/blog?${params.toString()}`);
    console.log('✅ Articles blog récupérés:', result);
    return result;
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

  // CONTACT - Envoyer un message de contact
  async sendContactMessage(contactData: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
    contactReason?: string;
  }): Promise<{ success: boolean; id: string }> {
    return await this.request<{ success: boolean; id: string }>('/contact', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  }

  // ADMIN - Messages de contact
  async getContactMessages(status = 'all', limit = 50, offset = 0): Promise<any[]> {
    const params = new URLSearchParams();
    params.append('status', status);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    
    return await this.request<any[]>(`/contact?${params.toString()}`);
  }

  async getContactStats(): Promise<{ total: number; new: number; today: number }> {
    return await this.request<{ total: number; new: number; today: number }>('/contact/stats');
  }

  async updateContactMessage(id: string, status: 'new' | 'read' | 'replied' | 'archived'): Promise<any> {
    return await this.request<any>(`/contact/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async deleteContactMessage(id: string): Promise<{ success: boolean }> {
    return await this.request<{ success: boolean }>(`/contact/${id}`, {
      method: 'DELETE'
    });
  }

  // SERVICES ADMIN
  async createService(serviceData: any): Promise<any> {
    return await this.request<any>('/services', {
      method: 'POST',
      body: JSON.stringify(serviceData)
    });
  }

  async updateService(id: string, serviceData: any): Promise<any> {
    return await this.request<any>(`/services/${id}`, {
      method: 'PUT', 
      body: JSON.stringify(serviceData)
    });
  }

  async deleteService(id: string): Promise<{ success: boolean }> {
    return await this.request<{ success: boolean }>(`/services/${id}`, {
      method: 'DELETE'
    });
  }

  // CLIENTS ADMIN
  async getClients(): Promise<any[]> {
    return await this.request<any[]>('/users');
  }
}

export const apiService = new ApiService();