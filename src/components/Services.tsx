import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Calendar } from "lucide-react";
import tarotImage from "@/assets/service-tarot.webp";
import reikiImage from "@/assets/service-reiki.webp";
import pendulumImage from "@/assets/service-pendulum.webp";
import healingImage from "@/assets/service-healing.webp";

const Services = () => {
  const services = [
    {
      icon: <img src={tarotImage} alt="Tirage de cartes" className="h-8 w-8 object-cover rounded" />,
      title: "Tirage de Cartes",
      description: "Révélez votre avenir grâce aux messages des cartes de tarot et d'oracle. Une guidance claire pour éclairer votre chemin.",
      price: "45€",
      duration: "45 min",
      gradient: "bg-gradient-primary"
    },
    {
      icon: <img src={reikiImage} alt="Séance Reiki" className="h-8 w-8 object-cover rounded" />,
      title: "Séance Reiki",
      description: "Harmonisez vos énergies et retrouvez l'équilibre intérieur grâce à cette technique de guérison japonaise ancestrale.",
      price: "60€",
      duration: "60 min",
      gradient: "bg-gradient-secondary"
    },
    {
      icon: <img src={pendulumImage} alt="Divination au pendule" className="h-8 w-8 object-cover rounded" />,
      title: "Divination au Pendule",
      description: "Obtenez des réponses précises à vos questions grâce à la sagesse du pendule et à l'art de la radiesthésie.",
      price: "35€",
      duration: "30 min",
      gradient: "bg-gradient-mystique"
    },
    {
      icon: <img src={healingImage} alt="Soins de guérison" className="h-8 w-8 object-cover rounded" />,
      title: "Soins de Guérison",
      description: "Libérez les blocages énergétiques et activez votre pouvoir d'auto-guérison grâce aux soins énergétiques personnalisés.",
      price: "70€",
      duration: "75 min",
      gradient: "bg-gradient-primary"
    }
  ];

  return (
    <section id="services" className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-accent/50 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-accent-foreground">Mes Services</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            <span className="bg-gradient-mystique bg-clip-text text-transparent">
              Services Spirituels
            </span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez mes différents services pour vous accompagner dans votre développement personnel 
            et votre bien-être spirituel.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {services.map((service, index) => (
            <Card key={index} className="group hover:shadow-mystique transition-all duration-300 border-0 shadow-elegant">
              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 ${service.gradient} rounded-full flex items-center justify-center text-white mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {service.icon}
                </div>
                <CardTitle className="text-xl font-bold text-foreground">{service.title}</CardTitle>
                <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                  <span className="font-semibold text-primary text-lg">{service.price}</span>
                  <span>•</span>
                  <span>{service.duration}</span>
                </div>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-base leading-relaxed mb-6">
                  {service.description}
                </CardDescription>
                <Button className="bg-gradient-mystique shadow-warm hover:shadow-lg transition-all duration-300 w-full">
                  <Calendar className="h-4 w-4 mr-2" />
                  Réserver maintenant
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Vous hésitez ? Découvrez votre service idéal avec une consultation découverte.
          </p>
          <Button variant="outline" size="lg" className="border-2 border-primary/50 hover:bg-primary/5">
            Consultation découverte - 25€
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Services;