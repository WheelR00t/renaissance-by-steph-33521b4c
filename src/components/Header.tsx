import { Button } from "@/components/ui/button";
import { Menu, X, Gem, Calendar, BookOpen, User, LogOut, Settings, Shield } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <header className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Gem className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold bg-gradient-mystique bg-clip-text text-transparent">
                Renaissance By Steph
              </h1>
              <p className="text-xs text-muted-foreground">Voyance • Bien-être • Spiritualité</p>
            </div>
          </div>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">
              Accueil
            </Link>
            <a href="/#services" className="text-foreground hover:text-primary transition-colors">
              Services
            </a>
            <Link to="/reservation" className="text-foreground hover:text-primary transition-colors">
              Rendez-vous
            </Link>
            <Link to="/blog" className="text-foreground hover:text-primary transition-colors">
              Blog
            </Link>
            <Link to="/contact" className="text-foreground hover:text-primary transition-colors">
              Contact
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {user?.name || user?.email || 'Mon compte'}
                    </Button>
                  </DropdownMenuTrigger>
                   <DropdownMenuContent align="end">
                     <DropdownMenuItem asChild>
                       <Link to="/account">
                         <Settings className="h-4 w-4 mr-2" />
                         Mon compte
                       </Link>
                     </DropdownMenuItem>
                     {isAdmin && (
                       <>
                         <DropdownMenuItem asChild>
                           <Link to="/admin">
                             <Shield className="h-4 w-4 mr-2" />
                             Administration
                           </Link>
                         </DropdownMenuItem>
                       </>
                     )}
                     <DropdownMenuSeparator />
                     <DropdownMenuItem onClick={logout}>
                       <LogOut className="h-4 w-4 mr-2" />
                       Déconnexion
                     </DropdownMenuItem>
                   </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">
                  <User className="h-4 w-4 mr-2" />
                  Connexion
                </Link>
              </Button>
            )}
            <Button className="bg-gradient-mystique shadow-warm" asChild>
              <Link to="/reservation">
                <Calendar className="h-4 w-4 mr-2" />
                Prendre RDV
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 space-y-2">
            <Link
              to="/"
              className="block py-2 text-foreground hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Accueil
            </Link>
            <a
              href="/#services"
              className="block py-2 text-foreground hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Services
            </a>
            <Link
              to="/reservation"
              className="block py-2 text-foreground hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Rendez-vous
            </Link>
            <Link
              to="/blog"
              className="block py-2 text-foreground hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Blog
            </Link>
            <Link
              to="/contact"
              className="block py-2 text-foreground hover:text-primary transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
             <div className="pt-4 space-y-2">
               {isAuthenticated ? (
                 <>
                   <Button variant="ghost" className="w-full" asChild>
                     <Link to="/account">
                       <User className="h-4 w-4 mr-2" />
                       {user?.name || user?.email || 'Mon compte'}
                     </Link>
                   </Button>
                   {isAdmin && (
                     <Button variant="ghost" className="w-full" asChild>
                       <Link to="/admin">
                         <Shield className="h-4 w-4 mr-2" />
                         Administration
                       </Link>
                     </Button>
                   )}
                   <Button variant="outline" className="w-full" onClick={logout}>
                     <LogOut className="h-4 w-4 mr-2" />
                     Déconnexion
                   </Button>
                 </>
               ) : (
                 <Button variant="ghost" className="w-full" asChild>
                   <Link to="/login">
                     <User className="h-4 w-4 mr-2" />
                     Connexion
                   </Link>
                 </Button>
               )}
               <Button className="w-full bg-gradient-mystique shadow-warm" asChild>
                 <Link to="/reservation">
                   <Calendar className="h-4 w-4 mr-2" />
                   Prendre RDV
                 </Link>
               </Button>
             </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;