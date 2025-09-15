import { Gem, Mail, Phone, MapPin, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Gem className="h-8 w-8 text-primary" />
              <div>
                <h3 className="text-xl font-bold">Renaissance By Steph</h3>
                <p className="text-sm opacity-80">Voyance • Bien-être • Spiritualité</p>
              </div>
            </div>
            <p className="text-background/80 leading-relaxed max-w-md">
              Votre guide spirituel de confiance pour révéler votre potentiel intérieur 
              et vous accompagner vers votre renaissance personnelle.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2 text-background/80">
              <li><a href="#accueil" className="hover:text-primary transition-colors">Accueil</a></li>
              <li><a href="#services" className="hover:text-primary transition-colors">Services</a></li>
              <li><a href="#rdv" className="hover:text-primary transition-colors">Rendez-vous</a></li>
              <li><a href="#blog" className="hover:text-primary transition-colors">Blog</a></li>
              <li><a href="#contact" className="hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-background/80">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-primary" />
                <span>contact@renaissancebysteph.fr</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-primary" />
                <span>06 XX XX XX XX</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Consultations en ligne</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-background/60">
            © 2024 Renaissance By Steph. Tous droits réservés.
          </p>
          <p className="text-background/60 flex items-center space-x-1 mt-4 md:mt-0">
            <span>Créé avec</span>
            <Heart className="h-4 w-4 text-primary" />
            <span>par Lovable</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;