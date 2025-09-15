import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Link, 
  Calendar, 
  Clock, 
  Video, 
  User, 
  Mail, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Eye
} from "lucide-react";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";

interface Booking {
  id: string;
  service: {
    name: string;
    duration: string;
  };
  date: string;
  time: string;
  status: string;
  paymentStatus: string;
  price: number;
  visioLink?: string;
  confirmationToken: string;
  createdAt: string;
}

const ClientDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const apiBase = window.location.origin;
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${apiBase}/api/bookings/user/my-bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      } else {
        toast.error('Erreur lors du chargement de vos réservations');
      }
    } catch (error) {
      console.error('Erreur chargement réservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "confirmed": return "bg-green-100 text-green-800 border-green-300";
      case "completed": return "bg-blue-100 text-blue-800 border-blue-300";
      case "cancelled": return "bg-red-100 text-red-800 border-red-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending": return "En attente";
      case "confirmed": return "Confirmé";
      case "completed": return "Terminé";
      case "cancelled": return "Annulé";
      default: return status;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "failed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case "paid": return "Payé";
      case "pending": return "En attente";
      case "failed": return "Échec";
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20">
        <section className="py-12 bg-gradient-subtle">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="bg-gradient-mystique bg-clip-text text-transparent">
                Espace Client
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Bienvenue{user?.name ? `, ${user.name}` : ''} ! Retrouvez ici vos rendez-vous et consultations.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            {/* Actions rapides */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Actions rapides
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <Button asChild className="bg-gradient-mystique">
                  <RouterLink to="/reservation">Prendre un nouveau rendez-vous</RouterLink>
                </Button>
                <Button variant="outline" onClick={loadBookings}>
                  Actualiser mes réservations
                </Button>
              </CardContent>
            </Card>

            {/* Mes réservations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Mes Réservations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Chargement de vos réservations...</span>
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="font-medium text-foreground mb-2">Aucune réservation</h3>
                    <p className="text-muted-foreground mb-4">
                      Vous n'avez pas encore de rendez-vous programmé.
                    </p>
                    <Button asChild>
                      <RouterLink to="/reservation">Prendre un rendez-vous</RouterLink>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <Card key={booking.id} className="border-l-4 border-l-primary">
                        <CardContent className="pt-6">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            
                            {/* Détails de la consultation */}
                            <div className="space-y-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge className={getStatusColor(booking.status)}>
                                  {getStatusText(booking.status)}
                                </Badge>
                                <Badge className={getPaymentStatusColor(booking.paymentStatus)}>
                                  {getPaymentStatusText(booking.paymentStatus)}
                                </Badge>
                              </div>
                              
                              <div>
                                <h3 className="font-semibold text-foreground">{booking.service.name}</h3>
                                <p className="text-sm text-muted-foreground">{booking.service.duration}</p>
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-primary" />
                                <span>{format(new Date(booking.date), "EEEE d MMMM yyyy", { locale: fr })}</span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-primary" />
                                <span>{booking.time}</span>
                              </div>
                              
                              <div className="text-sm font-medium text-primary">
                                {booking.price}€
                              </div>
                            </div>

                            {/* Lien de visioconférence */}
                            <div className="space-y-3">
                              {booking.visioLink ? (
                                <Alert className="border-primary/20 bg-primary/5">
                                  <Video className="h-4 w-4" />
                                  <AlertDescription>
                                    <div className="space-y-2">
                                      <p className="font-medium text-primary">Consultation en ligne</p>
                                      <Button 
                                        size="sm" 
                                        onClick={() => window.open(booking.visioLink, '_blank')}
                                        className="w-full"
                                      >
                                        <Video className="h-4 w-4 mr-2" />
                                        Rejoindre la consultation
                                      </Button>
                                    </div>
                                  </AlertDescription>
                                </Alert>
                              ) : booking.status === 'confirmed' ? (
                                <Alert>
                                  <AlertCircle className="h-4 w-4" />
                                  <AlertDescription>
                                    Le lien de consultation sera ajouté par Stéphanie avant votre rendez-vous.
                                  </AlertDescription>
                                </Alert>
                              ) : null}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <RouterLink to={`/booking-summary/${booking.confirmationToken}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Voir les détails
                                </RouterLink>
                              </Button>
                              
                              {booking.status === 'pending' && booking.paymentStatus !== 'paid' && (
                                <Alert className="p-3">
                                  <AlertCircle className="h-4 w-4" />
                                  <AlertDescription className="text-xs">
                                    Paiement en attente
                                  </AlertDescription>
                                </Alert>
                              )}
                            </div>
                            
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ClientDashboard;
