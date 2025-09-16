import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  MessageCircle, 
  Send,
  Calendar,
  Heart,
  Star
} from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { apiService } from "@/lib/api";

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    contactReason: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setLoading(true);
    
    try {
      console.debug('[Contact] payload', formData);
      const response = await apiService.sendContactMessage({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        contactReason: formData.contactReason
      });
      console.debug('[Contact] response', response);
      
      toast.success("Votre message a été envoyé ! Je vous répondrai dans les plus brefs délais.");
      
      // Reset du formulaire
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        contactReason: ""
      });
    } catch (error) {
      console.error('Erreur envoi message:', error);
      toast.error("Erreur lors de l'envoi du message. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const contactReasons = [
    { value: "consultation", label: "Demande de consultation" },
    { value: "info", label: "Demande d'informations" },
    { value: "feedback", label: "Témoignage / Retour d'expérience" },
    { value: "collaboration", label: "Proposition de collaboration" },
    { value: "other", label: "Autre" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-12 bg-gradient-subtle">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center space-x-2 bg-accent/50 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <MessageCircle className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-accent-foreground">Contact</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-6">
              <span className="bg-gradient-mystique bg-clip-text text-transparent">
                Entrons en Contact
              </span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Une question, une demande particulière ? Je suis là pour vous accompagner 
              dans votre cheminement spirituel et répondre à toutes vos interrogations.
            </p>
          </div>
        </section>

        {/* Section principale */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Informations de contact */}
              <div className="lg:col-span-1 space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Mes coordonnées</CardTitle>
                    <CardDescription>
                      N'hésitez pas à me contacter directement
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">contact@renaissance-by-steph.fr</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="font-medium">Téléphone</p>
                        <p className="text-sm text-muted-foreground">06 12 34 56 78</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="font-medium">Localisation</p>
                        <p className="text-sm text-muted-foreground">Consultations en ligne et à domicile</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="font-medium">Horaires</p>
                        <p className="text-sm text-muted-foreground">Lun-Sam : 9h-19h</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Réseaux sociaux ou info supplémentaire */}
                <Card className="bg-gradient-subtle border-0">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Heart className="h-8 w-8 text-primary mx-auto mb-4" />
                      <h3 className="font-semibold text-foreground mb-2">
                        Engagement personnel
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Je m'engage à vous répondre dans les 24h et à vous accompagner 
                        avec bienveillance dans votre démarche spirituelle.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Formulaire de contact */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Envoyez-moi un message</CardTitle>
                    <CardDescription>
                      Remplissez ce formulaire et je vous répondrai rapidement
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Informations personnelles */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">Prénom *</Label>
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
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Téléphone</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          />
                        </div>
                      </div>

                      {/* Raison du contact */}
                      <div>
                        <Label htmlFor="contactReason">Motif de votre demande</Label>
                        <Select value={formData.contactReason} onValueChange={(value) => setFormData({...formData, contactReason: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez le motif de votre demande" />
                          </SelectTrigger>
                          <SelectContent>
                            {contactReasons.map((reason) => (
                              <SelectItem key={reason.value} value={reason.value}>
                                {reason.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Sujet */}
                      <div>
                        <Label htmlFor="subject">Sujet</Label>
                        <Input
                          id="subject"
                          placeholder="Résumez votre demande en quelques mots"
                          value={formData.subject}
                          onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        />
                      </div>

                      {/* Message */}
                      <div>
                        <Label htmlFor="message">Votre message *</Label>
                        <Textarea
                          id="message"
                          placeholder="Décrivez votre demande, vos questions ou ce que vous souhaitez partager..."
                          rows={6}
                          value={formData.message}
                          onChange={(e) => setFormData({...formData, message: e.target.value})}
                          required
                        />
                      </div>

                      {/* Bouton d'envoi */}
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-mystique hover:shadow-lg transition-all duration-300"
                        disabled={loading}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {loading ? "Envoi en cours..." : "Envoyer mon message"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Section CTA */}
        <section className="py-16 bg-gradient-subtle">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto">
              <Star className="h-12 w-12 text-primary mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-4">
                Prêt(e) pour votre première consultation ?
              </h2>
              <p className="text-muted-foreground mb-6">
                Découvrez ce que l'univers a préparé pour vous. 
                Réservez dès maintenant votre première séance.
              </p>
              <Button size="lg" className="bg-gradient-mystique shadow-warm hover:shadow-lg transition-all duration-300">
                <Calendar className="h-5 w-5 mr-2" />
                Réserver ma consultation
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;