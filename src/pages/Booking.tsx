import { useState, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, Clock, User, Mail, Phone, MapPin, CreditCard } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookingCalendar from "@/components/BookingCalendar";
import PaymentFlow from "@/components/PaymentFlow";
import { apiService, BookingData } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const Booking = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [services, setServices] = useState<Array<{
    id: string;
    name: string;
    price: number;
    duration: string;
    description: string;
  }>>([]);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    message: ""
  });
  
  const [bookingType, setBookingType] = useState<"guest" | "registered" | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const [currentBooking, setCurrentBooking] = useState<BookingData | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  // Charger les services au montage
  useEffect(() => {
    loadServices();
  }, []);

  // Pré-remplir les données si l'utilisateur est connecté
  useEffect(() => {
    if (isAuthenticated && user) {
      const safeName = typeof user.name === 'string' && user.name.trim().length > 0 ? user.name.trim() : '';
      const [firstName, ...lastNameParts] = safeName.split(' ').filter(Boolean);
      setFormData(prev => ({
        ...prev,
        firstName: firstName || '',
        lastName: lastNameParts.join(' ') || '',
        email: user.email || ''
      }));
      setBookingType('registered');
    }
  }, [isAuthenticated, user]);

  const loadServices = async () => {
    try {
      const servicesList = await apiService.getServices();
      setServices(servicesList);
    } catch (error) {
      toast.error('Erreur lors du chargement des services');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (!selectedDate || !selectedTime || !selectedService) {
      toast.error("Veuillez sélectionner une date, un horaire et un service");
      return;
    }

    if (!bookingType) {
      toast.error("Veuillez choisir un type de réservation");
      return;
    }

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const selectedServiceData = services.find(s => s.id === selectedService);
    if (!selectedServiceData) {
      toast.error("Service introuvable");
      return;
    }

    try {
      // Créer la réservation
      const bookingData: Omit<BookingData, 'id' | 'createdAt'> = {
        service: selectedServiceData.id, // utiliser l'ID du service
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        message: formData.message,
        bookingType: bookingType,
        status: 'pending',
        paymentStatus: 'pending',
        price: selectedServiceData.price
      };

      const result = await apiService.createBooking(bookingData);
      setCurrentBooking(result.booking);
      
      // Afficher le dialog de paiement
      setShowPaymentDialog(true);
      
      toast.success("Réservation créée ! Procédez au paiement pour confirmer.");
      
    } catch (error) {
      toast.error("Erreur lors de la création de la réservation");
      console.error(error);
    }
  };

  const handlePaymentSuccess = (booking: BookingData) => {
    setShowPaymentDialog(false);
    toast.success("Paiement confirmé ! Redirection vers votre récapitulatif...");
    
    // Rediriger vers le récapitulatif avec un délai pour laisser voir le toast
    setTimeout(() => {
      navigate(`/booking-summary/${booking.confirmationToken || booking.id}`);
    }, 2000);
  };

  const handlePaymentError = (error: string) => {
    console.error('Erreur de paiement:', error);
    // Le dialog reste ouvert pour permettre de réessayer
  };

  const handlePaymentCancel = () => {
    setShowPaymentDialog(false);
    // La réservation reste en statut 'pending'
    toast.info("Paiement annulé. Votre réservation est conservée en attente.");
  };

  const resetForm = () => {
    setSelectedDate(undefined);
    setSelectedTime("");
    setSelectedService("");
    setBookingType(null);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      message: ""
    });
    setCurrentBooking(null);
  };

  const selectedServiceData = services.find(s => s.id === selectedService);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-12 bg-gradient-subtle">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center space-x-2 bg-accent/50 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <CalendarIcon className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-accent-foreground">Réservation</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-6">
              <span className="bg-gradient-mystique bg-clip-text text-transparent">
                Prenez Rendez-vous
              </span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choisissez votre service, sélectionnez une date et un horaire qui vous conviennent, 
              et procédez au paiement sécurisé pour confirmer votre rendez-vous.
            </p>
          </div>
        </section>

        {/* Formulaire de réservation */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            {/* Choix du type de réservation */}
            {!isAuthenticated && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Comment souhaitez-vous réserver ?</CardTitle>
                  <CardDescription>
                    Choisissez votre mode de réservation préféré
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      onClick={() => setBookingType("guest")}
                      className={cn(
                        "p-6 rounded-lg border-2 cursor-pointer transition-all duration-200",
                        bookingType === "guest" 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <h3 className="font-semibold text-foreground mb-2">Réservation rapide</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Sans inscription, recevez un lien unique pour suivre votre RDV
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Email de confirmation avec lien de suivi</li>
                        <li>• Rappel automatique avant le RDV</li>
                        <li>• Paiement sécurisé par Stripe</li>
                      </ul>
                    </div>
                    
                    <div
                      onClick={() => setBookingType("registered")}
                      className={cn(
                        "p-6 rounded-lg border-2 cursor-pointer transition-all duration-200",
                        bookingType === "registered" 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <h3 className="font-semibold text-foreground mb-2">Avec compte client</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Créez un compte pour un suivi personnalisé
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        <li>• Historique de vos consultations</li>
                        <li>• Notifications personnalisées</li>
                        <li>• Gestion de vos préférences</li>
                      </ul>
                    </div>
                  </div>
                  
                  {bookingType === "registered" && (
                    <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-3">
                        Vous devez avoir un compte pour cette option.
                      </p>
                      <div className="flex gap-3">
                        <Button variant="outline" size="sm" asChild>
                          <Link to="/login">Se connecter</Link>
                        </Button>
                        <Button size="sm" asChild>
                          <Link to="/register">Créer un compte</Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Sélection du service */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">1</span>
                    </div>
                    Choisissez votre service
                  </CardTitle>
                  <CardDescription>
                    Sélectionnez le service qui vous intéresse
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        onClick={() => setSelectedService(service.id)}
                        className={cn(
                          "p-4 rounded-lg border-2 cursor-pointer transition-all duration-200",
                          selectedService === service.id 
                            ? "border-primary bg-primary/5" 
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <h3 className="font-semibold text-foreground">{service.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{service.duration}</p>
                        <p className="text-lg font-bold text-primary">{service.price}€</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Calendrier interactif */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">2</span>
                    </div>
                    Sélectionnez une date et horaire
                  </CardTitle>
                  <CardDescription>
                    Choisissez le jour et l'heure de votre rendez-vous
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BookingCalendar
                    selectedDate={selectedDate}
                    onDateSelect={setSelectedDate}
                    selectedTime={selectedTime}
                    onTimeSelect={setSelectedTime}
                  />
                </CardContent>
              </Card>

              {/* Informations personnelles */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">3</span>
                    </div>
                    Vos informations
                  </CardTitle>
                  <CardDescription>
                    Complétez vos informations pour finaliser la réservation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Prénom *
                      </Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Téléphone *
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Adresse (optionnel)
                    </Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message (optionnel)</Label>
                    <Textarea
                      id="message"
                      placeholder="Questions particulières, demandes spécifiques..."
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Résumé et validation */}
              {selectedService && selectedDate && selectedTime && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle>Résumé de votre réservation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <p><strong>Service :</strong> {selectedServiceData?.name} - {selectedServiceData?.price}€</p>
                      <p><strong>Date :</strong> {format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}</p>
                      <p><strong>Heure :</strong> {selectedTime}</p>
                      <p><strong>Durée :</strong> {selectedServiceData?.duration}</p>
                    </div>
                    
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-gradient-mystique shadow-warm"
                      disabled={!bookingType}
                    >
                      <CreditCard className="h-5 w-5 mr-2" />
                      Procéder au paiement ({selectedServiceData?.price}€)
                    </Button>
                  </CardContent>
                </Card>
              )}
            </form>
          </div>
        </section>

        {/* Dialog de paiement */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Paiement sécurisé
              </DialogTitle>
              <DialogDescription>
                Finalisez votre réservation avec un paiement sécurisé
              </DialogDescription>
            </DialogHeader>
            
            {currentBooking && (
              <PaymentFlow
                booking={currentBooking}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
                onCancel={handlePaymentCancel}
              />
            )}
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
    </div>
  );
};

export default Booking;