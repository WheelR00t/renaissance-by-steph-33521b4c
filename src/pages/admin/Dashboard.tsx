import { useState, useEffect, useRef, useCallback } from "react";
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
import { apiService } from "@/lib/api";

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

interface TodayAppointment {
  id: string;
  service_id: string;
  date: string;
  time: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  price: number;
  service_name: string;
  duration: string;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    weekAppointments: 0,
    monthRevenue: 0,
    pendingBookings: 0,
    totalClients: 0,
    avgRating: 0
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const appointmentsRef = useRef<HTMLDivElement>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      // Récupérer les statistiques (avec Auth via apiService)
      const statsData = await apiService.getDashboardStats();
      setStats(statsData);

      // Récupérer l'activité récente
      const activityData = await apiService.getDashboardActivity();
      setRecentActivity(activityData);

      // Récupérer les RDV du jour
      const appointmentsData = await apiService.getTodayAppointments();
      setTodayAppointments(appointmentsData);
    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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
          <Button className="bg-gradient-mystique" onClick={() => appointmentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
            <Calendar className="h-4 w-4 mr-2" />
            Voir les RDV du jour
          </Button>
          <Button variant="outline" onClick={fetchDashboardData}>
            Actualiser
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
              Total aujourd'hui
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
              RDV cette semaine
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
              Paiements confirmés
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
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Chargement...</p>
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucune activité récente</p>
              </div>
            ) : (
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
            )}
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
      <Card ref={appointmentsRef}>
        <CardHeader>
          <CardTitle>Rendez-vous d'Aujourd'hui</CardTitle>
          <CardDescription>
            Planning de vos consultations du jour
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Chargement...</p>
            </div>
          ) : todayAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucun rendez-vous aujourd'hui</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todayAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="font-bold text-primary">{appointment.time}</div>
                      <div className="text-xs text-muted-foreground">{appointment.duration}</div>
                    </div>
                    <div>
                      <p className="font-medium">{appointment.first_name} {appointment.last_name}</p>
                      <p className="text-sm text-muted-foreground">{appointment.service_name} - {appointment.price}€</p>
                      <p className="text-xs text-muted-foreground">{appointment.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="outline" 
                      className={
                        appointment.status === 'confirmed' 
                          ? "bg-green-50 text-green-700" 
                          : appointment.status === 'pending'
                          ? "bg-yellow-50 text-yellow-700"
                          : "bg-gray-50 text-gray-700"
                      }
                    >
                      {appointment.status === 'confirmed' ? 'Confirmé' : 
                       appointment.status === 'pending' ? 'En attente' : 
                       'Annulé'}
                    </Badge>
                    <Button size="sm" variant="outline">
                      {appointment.status === 'pending' ? 'Confirmer' : 'Démarrer'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;