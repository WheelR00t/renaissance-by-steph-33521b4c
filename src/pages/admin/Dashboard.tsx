import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Users, 
  Euro, 
  TrendingUp,
  Clock,
  Mail,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface DashboardStats {
  todayAppointments: number;
  weekAppointments: number;
  monthRevenue: number;
  pendingBookings: number;
  totalClients: number;
  avgRating: number;
}

interface RecentActivity {
  id: string;
  type: "booking" | "payment" | "review";
  title: string;
  description: string;
  time: string;
  status: "success" | "warning" | "error";
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 3,
    weekAppointments: 12,
    monthRevenue: 1250,
    pendingBookings: 5,
    totalClients: 127,
    avgRating: 4.8
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([
    {
      id: "1",
      type: "booking",
      title: "Nouvelle réservation",
      description: "Marie Dupont - Tirage de cartes",
      time: "Il y a 2 heures",
      status: "success"
    },
    {
      id: "2",
      type: "payment",
      title: "Paiement reçu",
      description: "45€ - Consultation Reiki",
      time: "Il y a 4 heures",
      status: "success"
    },
    {
      id: "3",
      type: "booking",
      title: "Réservation en attente",
      description: "Jean Martin - Pendule",
      time: "Il y a 6 heures",
      status: "warning"
    },
    {
      id: "4",
      type: "review",
      title: "Nouveau témoignage",
      description: "5 étoiles - \"Excellente consultation\"",
      time: "Hier",
      status: "success"
    }
  ]);

  const getActivityIcon = (type: string, status: string) => {
    switch (type) {
      case "booking":
        return status === "warning" ? (
          <Clock className="h-4 w-4 text-yellow-500" />
        ) : (
          <Calendar className="h-4 w-4 text-green-500" />
        );
      case "payment":
        return <Euro className="h-4 w-4 text-green-500" />;
      case "review":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Tableau de bord
          </h1>
          <p className="text-muted-foreground">
            {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            En ligne
          </Badge>
          <Button className="bg-gradient-mystique">
            <Calendar className="h-4 w-4 mr-2" />
            Voir les RDV du jour
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RDV Aujourd'hui</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.todayAppointments}</div>
            <p className="text-xs text-muted-foreground">
              +2 depuis hier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cette Semaine</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.weekAppointments}</div>
            <p className="text-xs text-muted-foreground">
              +15% vs semaine dernière
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus du Mois</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.monthRevenue}€</div>
            <p className="text-xs text-muted-foreground">
              +12% vs mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pendingBookings}</div>
            <p className="text-xs text-muted-foreground">
              Réservations à confirmer
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Activité récente */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Activité Récente</CardTitle>
            <CardDescription>
              Dernières actions sur votre site
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg bg-muted/30">
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type, activity.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {activity.title}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {activity.description}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions rapides */}
        <Card>
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
            <CardDescription>
              Accès direct aux fonctions principales
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Gérer les RDV
            </Button>
            
            <Button className="w-full justify-start" variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Voir les clients
            </Button>
            
            <Button className="w-full justify-start" variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Messages clients
            </Button>
            
            <Button className="w-full justify-start" variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              Statistiques
            </Button>

            <div className="pt-4">
              <Button className="w-full bg-gradient-mystique">
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirmer RDV en attente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RDV du jour */}
      <Card>
        <CardHeader>
          <CardTitle>Rendez-vous d'Aujourd'hui</CardTitle>
          <CardDescription>
            Planning de vos consultations du jour
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="font-bold text-primary">10:00</div>
                  <div className="text-xs text-muted-foreground">60 min</div>
                </div>
                <div>
                  <p className="font-medium">Marie Dupont</p>
                  <p className="text-sm text-muted-foreground">Séance Reiki - 60€</p>
                  <p className="text-xs text-muted-foreground">marie.dupont@email.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Confirmé
                </Badge>
                <Button size="sm" variant="outline">
                  Démarrer
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="font-bold text-primary">14:30</div>
                  <div className="text-xs text-muted-foreground">45 min</div>
                </div>
                <div>
                  <p className="font-medium">Jean Martin</p>
                  <p className="text-sm text-muted-foreground">Tirage de Cartes - 45€</p>
                  <p className="text-xs text-muted-foreground">jean.martin@email.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                  En attente
                </Badge>
                <Button size="sm" variant="outline">
                  Confirmer
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="font-bold text-primary">16:00</div>
                  <div className="text-xs text-muted-foreground">30 min</div>
                </div>
                <div>
                  <p className="font-medium">Sophie Leroy</p>
                  <p className="text-sm text-muted-foreground">Pendule - 35€</p>
                  <p className="text-xs text-muted-foreground">sophie.leroy@email.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Confirmé
                </Badge>
                <Button size="sm" variant="outline">
                  Démarrer
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;