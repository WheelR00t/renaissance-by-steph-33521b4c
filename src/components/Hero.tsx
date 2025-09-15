import { Button } from "@/components/ui/button";
import { Calendar, Sparkles, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-mystique.jpg";

const Hero = () => {
  return (
    <section id="accueil" className="relative min-h-screen flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Univers mystique de Renaissance By Steph"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px]" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-accent/50 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-accent-foreground">
              Votre guide spirituel de confiance
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="block text-foreground mb-2">Découvrez votre</span>
            <span className="bg-gradient-mystique bg-clip-text text-transparent">
              Renaissance Spirituelle
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Stéphanie vous accompagne dans votre cheminement personnel à travers la voyance, 
            le reiki et les soins énergétiques. Révélez votre potentiel et trouvez votre équilibre.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button size="lg" className="bg-gradient-mystique shadow-warm hover:shadow-lg transition-all duration-300" asChild>
              <Link to="/reservation">
                <Calendar className="h-5 w-5 mr-2" />
                Réserver une consultation
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-primary/50 hover:bg-primary/5" asChild>
              <a href="#services">
                <Heart className="h-5 w-5 mr-2" />
                Découvrir mes services
              </a>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                8+
              </div>
              <p className="text-sm text-muted-foreground">Années d'expérience</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-secondary bg-clip-text text-transparent mb-2">
                500+
              </div>
              <p className="text-sm text-muted-foreground">Consultations réalisées</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold bg-gradient-mystique bg-clip-text text-transparent mb-2">
                98%
              </div>
              <p className="text-sm text-muted-foreground">Clients satisfaits</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default Hero;