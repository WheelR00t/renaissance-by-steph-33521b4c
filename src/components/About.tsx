import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Heart, Users, Award } from "lucide-react";

const About = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Content */}
          <div>
            <div className="inline-flex items-center space-x-2 bg-accent/50 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Star className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-accent-foreground">À propos de moi</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Stéphanie, votre 
              <span className="bg-gradient-mystique bg-clip-text text-transparent block">
                Guide Spirituel
              </span>
            </h2>

            <div className="space-y-4 text-muted-foreground leading-relaxed mb-8">
              <p>
                Passionnée par les arts divinatoires depuis plus de 8 ans, je vous accompagne 
                dans votre cheminement personnel avec bienveillance et authenticité.
              </p>
              <p>
                Ma mission est de vous aider à révéler votre potentiel intérieur, à surmonter 
                les obstacles de la vie et à trouver l'harmonie entre votre corps, votre esprit 
                et votre âme.
              </p>
              <p>
                Formée aux techniques du Reiki et de la radiesthésie, je combine tradition 
                et modernité pour vous offrir des consultations personnalisées et enrichissantes.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <Card className="border-0 shadow-elegant">
                <CardContent className="p-4 text-center">
                  <Award className="h-6 w-6 text-primary mx-auto mb-2" />
                  <div className="font-semibold text-foreground">Certifiée</div>
                  <div className="text-sm text-muted-foreground">Reiki & Radiesthésie</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-elegant">
                <CardContent className="p-4 text-center">
                  <Users className="h-6 w-6 text-secondary mx-auto mb-2" />
                  <div className="font-semibold text-foreground">500+</div>
                  <div className="text-sm text-muted-foreground">Consultations</div>
                </CardContent>
              </Card>
            </div>

            <Button size="lg" className="bg-gradient-mystique shadow-warm">
              <Heart className="h-5 w-5 mr-2" />
              Faire connaissance
            </Button>
          </div>

          {/* Image placeholder - will be replaced with actual photo */}
          <div className="relative">
            <div className="aspect-[4/5] bg-gradient-mystique rounded-2xl shadow-mystique flex items-center justify-center text-white">
              <div className="text-center">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Heart className="h-12 w-12" />
                </div>
                <p className="text-lg font-medium">Photo de Stéphanie</p>
                <p className="text-sm opacity-80">Renaissance By Steph</p>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-4 -left-4 w-8 h-8 bg-primary rounded-full animate-pulse" />
            <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-secondary/30 rounded-full" />
            <div className="absolute top-1/2 -right-6 w-6 h-6 bg-primary/50 rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;