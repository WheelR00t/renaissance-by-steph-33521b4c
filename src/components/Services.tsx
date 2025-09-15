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
      image: tarotImage,
      title: "Tirage de Cartes",
      description: "Guidance et clarté à travers la lecture des cartes de tarot et d'oracle",
      price: "45€",
      duration: "30-60 min",
      features: [
        "Lecture personnalisée",
        "Guidance sur l'avenir", 
        "Conseils pratiques",
        "Support émotionnel"
      ],
      icon: "✨"
    },
    {
      image: reikiImage,
      title: "Reiki",
      description: "Séance de guérison énergétique pour harmoniser corps et esprit",
      price: "60€",
      duration: "45-90 min",
      features: [
        "Rééquilibrage énergétique",
        "Détente profonde",
        "Libération des blocages",
        "Bien-être global"
      ],
      icon: "💙"
    },
    {
      image: pendulumImage,
      title: "Pendule",
      description: "Divination précise pour obtenir des réponses à vos questions",
      price: "35€",
      duration: "30-45 min",
      features: [
        "Réponses précises",
        "Art de la radiesthésie",
        "Guidance spirituelle",
        "Clarification des doutes"
      ],
      icon: "🔮"
    },
    {
      image: healingImage,
      title: "Guérison",
      description: "Soins énergétiques pour libérer les blocages et activer l'auto-guérison",
      price: "70€",
      duration: "60-90 min",
      features: [
        "Libération des blocages",
        "Activation de l'auto-guérison",
        "Harmonisation énergétique",
        "Transformation profonde"
      ],
      icon: "⚡"
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
            <Card key={index} className="group hover:shadow-mystique transition-all duration-300 border-0 shadow-elegant overflow-hidden bg-card">
              {/* Image de fond avec overlay */}
              <div 
                className="relative h-48 bg-cover bg-center"
                style={{ backgroundImage: `url(${service.image})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60"></div>
                <div className="absolute top-4 right-4 w-12 h-12 bg-primary/90 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xl">
                  {service.icon}
                </div>
              </div>
              
              {/* Contenu de la carte */}
              <CardContent className="p-6">
                <div className="mb-4">
                  <CardTitle className="text-2xl font-bold text-foreground mb-2">{service.title}</CardTitle>
                  <CardDescription className="text-muted-foreground mb-4">
                    {service.description}
                  </CardDescription>
                  
                  {/* Prix et durée */}
                  <div className="mb-4">
                    <div className="text-2xl font-bold text-primary mb-1">À partir de {service.price}</div>
                    <div className="text-sm text-muted-foreground">{service.duration}</div>
                  </div>
                </div>

                {/* Liste des caractéristiques */}
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0"></div>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Bouton de réservation */}
                <Button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold py-3 rounded-lg transition-all duration-300">
                  Réserver ce service
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