import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  User, 
  LogOut, 
  Settings,
  Eye,
  Moon,
  Sun
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Link } from "react-router-dom";

export function AdminHeader() {
  const handleLogout = () => {
    // Ici vous gérerez la déconnexion
    console.log("Logout");
  };

  const toggleTheme = () => {
    // Ici vous gérerez le changement de thème
    console.log("Toggle theme");
  };

  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-4">
      <div className="flex items-center space-x-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-lg font-semibold text-foreground">Administration</h1>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Voir le site */}
        <Button variant="outline" size="sm" asChild>
          <Link to="/" target="_blank">
            <Eye className="h-4 w-4 mr-2" />
            Voir le site
          </Link>
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">Nouvelle réservation</p>
                <p className="text-xs text-muted-foreground">
                  Marie Dupont a réservé une séance Reiki
                </p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">Paiement reçu</p>
                <p className="text-xs text-muted-foreground">
                  Consultation terminée - 45€
                </p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">Nouveau message</p>
                <p className="text-xs text-muted-foreground">
                  Contact depuis le formulaire du site
                </p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Toggle theme */}
        <Button variant="outline" size="sm" onClick={toggleTheme}>
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        {/* Profil utilisateur */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <User className="h-4 w-4 mr-2" />
              Stéphanie
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/admin/profile">
                <User className="h-4 w-4 mr-2" />
                Profil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/admin/settings">
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}