import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Mail, Phone, Video, MapPin, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface BookingData {
  id: string;
  service: {
    name: string;
    price: string;
    duration: string;
  };
  date: string;
  time: string;
  client: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
    message?: string;
  };
  status: "pending" | "confirmed" | "completed" | "cancelled";
  videoLink?: string;
  notes?: string;
}

const BookingSummary = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ici vous appellerez votre API backend
    // Pour la démo, on simule des données
    setTimeout(() => {
      setBooking({
        id: bookingId || "",
        service: {
          name: "Tirage de Cartes",
          price: "45€",
          duration: "30-60 min"
        },
        date: "2024-03-25",
        time: "14:30",
        client: {
          firstName: "Marie",
          lastName: "Dupont",
          email: "marie.dupont@email.com",
          phone: "06 12 34 56 78",
          address: "123 Rue de la Paix, 75000 Paris"
        },
        status: "confirmed",
        videoLink: "https://meet.google.com/abc-defg-hij", // Sera ajouté par l'admin
        notes: "N'oubliez pas d'être dans un endroit calme pour la consultation."
      });
      setLoading(false);
    }, 1000);
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de votre réservation...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 py-16">
          <div className="container mx-auto px-4 text-center">
            <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Réservation introuvable</h1>
            <p className="text-muted-foreground">
              Cette réservation n'existe pas ou le lien est invalide.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-12 bg-gradient-subtle">
          <div className="container mx-auto px-4 text-center">
            <Badge className={`mb-4 ${getStatusColor(booking.status)}`}>
              {getStatusText(booking.status)}
            </Badge>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-mystique bg-clip-text text-transparent">
                Votre Réservation
              </span>
            </h1>
            
            <p className="text-lg text-muted-foreground">
              Référence : #{booking.id}
            </p>
          </div>
        </section>

        {/* Détails de la réservation */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Informations du service */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Détails de votre consultation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Service</span>
                    <span className="font-medium">{booking.service.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Prix</span>
                    <span className="font-medium text-primary">{booking.service.price}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Durée</span>
                    <span className="font-medium">{booking.service.duration}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">
                      {format(new Date(booking.date), "EEEE d MMMM yyyy", { locale: fr })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Heure</span>
                    <span className="font-medium flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {booking.time}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Informations client */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Vos informations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Nom</span>
                    <span className="font-medium">
                      {booking.client.firstName} {booking.client.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {booking.client.email}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Téléphone</span>
                    <span className="font-medium flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {booking.client.phone}
                    </span>
                  </div>
                  {booking.client.address && (
                    <div className="flex justify-between items-start">
                      <span className="text-muted-foreground">Adresse</span>
                      <span className="font-medium text-right flex items-start gap-1">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        {booking.client.address}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Lien de visioconférence */}
            {booking.videoLink && (
              <Card className="mt-8 border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Video className="h-5 w-5" />
                    Lien de visioconférence
                  </CardTitle>
                  <CardDescription>
                    Rejoignez votre consultation en ligne au moment du rendez-vous
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-background rounded-lg">
                    <span className="text-sm text-muted-foreground font-mono">
                      {booking.videoLink}
                    </span>
                    <Button 
                      size="sm" 
                      onClick={() => window.open(booking.videoLink, '_blank')}
                    >
                      Rejoindre
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes de l'administratrice */}
            {booking.notes && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Notes importantes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{booking.notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Message de Stéphanie */}
            <Card className="mt-8 bg-gradient-subtle border-0">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h3 className="font-semibold text-foreground mb-2">
                    Message de Stéphanie
                  </h3>
                  <p className="text-muted-foreground">
                    Merci pour votre confiance ! Je me réjouis de vous accompagner dans votre cheminement spirituel. 
                    Si vous avez des questions, n'hésitez pas à me contacter.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default BookingSummary;