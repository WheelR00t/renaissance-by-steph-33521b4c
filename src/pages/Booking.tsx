import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, Clock, User, Mail, Phone, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Booking = () => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    message: ""
  });

  const services = [
    { id: "tarot", name: "Tirage de Cartes", price: "45€", duration: "30-60 min" },
    { id: "reiki", name: "Reiki", price: "60€", duration: "45-90 min" },
    { id: "pendule", name: "Pendule", price: "35€", duration: "30-45 min" },
    { id: "guerison", name: "Guérison", price: "70€", duration: "60-90 min" }
  ];

  // Créneaux horaires disponibles
  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00", "18:30", "19:00"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime || !selectedService) {
      toast.error("Veuillez sélectionner une date, un horaire et un service");
      return;
    }

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    // Ici on enverrait les données au backend
    toast.success("Votre réservation a été envoyée ! Je vous recontacterai rapidement.");
    
    // Reset du formulaire
    setSelectedDate(undefined);
    setSelectedTime("");
    setSelectedService("");
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      message: ""
    });
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
              et je vous recontacterai pour confirmer votre rendez-vous.
            </p>
          </div>
        </section>

        {/* Formulaire de réservation */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
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
                        <p className="text-lg font-bold text-primary">{service.price}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Sélection de la date */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">2</span>
                    </div>
                    Sélectionnez une date
                  </CardTitle>
                  <CardDescription>
                    Choisissez le jour de votre rendez-vous
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !selectedDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, "PPP", { locale: fr }) : <span>Sélectionner une date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={(date) => date < new Date() || date.getDay() === 0} // Pas de dimanche
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    {selectedDate && (
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-3 flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Horaires disponibles
                        </p>
                        <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                          {timeSlots.map((time) => (
                            <Button
                              key={time}
                              type="button"
                              variant={selectedTime === time ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedTime(time)}
                              className="text-xs"
                            >
                              {time}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
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
                    <div className="space-y-2">
                      <p><strong>Service :</strong> {selectedServiceData?.name} - {selectedServiceData?.price}</p>
                      <p><strong>Date :</strong> {format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })}</p>
                      <p><strong>Heure :</strong> {selectedTime}</p>
                      <p><strong>Durée :</strong> {selectedServiceData?.duration}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Bouton de validation */}
              <div className="text-center">
                <Button 
                  type="submit" 
                  size="lg"
                  className="bg-gradient-mystique hover:shadow-lg transition-all duration-300 px-8 py-3"
                >
                  Confirmer ma réservation
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  * Je vous recontacterai rapidement pour confirmer le rendez-vous
                </p>
              </div>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Booking;