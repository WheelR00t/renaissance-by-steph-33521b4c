import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Euro, TrendingUp, Eye, Clock, MessageSquare, Star, Loader2 } from "lucide-react";
import { apiService } from "@/lib/api";
import { toast } from "sonner";

interface StatsData {
  monthlyRevenue: {
    current: number;
    growth: number;
  };
  monthlyBookings: {
    current: number;
    growth: number;
  };
  newClients: number;
  averageRating: number;
  totalReviews: number;
  popularServices: Array<{
    name: string;
    bookings_count: number;
    percentage: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    time: string;
    status: string;
  }>;
  peakHours: Array<{
    timeSlot: string;
    bookingsCount: number;
    level: 'high' | 'medium' | 'low';
  }>;
}

const Stats = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await apiService.getStats();
        setStats(data);
      } catch (error) {
        console.error('Erreur chargement stats:', error);
        toast.error('Erreur lors du chargement des statistiques');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'À l\'instant';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Hier';
    if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
    return date.toLocaleDateString('fr-FR');
  };

  const getBadgeForLevel = (level: string) => {
    switch (level) {
      case 'high':
        return <Badge className="bg-green-100 text-green-800">Très demandé</Badge>;
      case 'medium':
        return <Badge className="bg-blue-100 text-blue-800">Populaire</Badge>;
      case 'low':
        return <Badge variant="outline">Faible</Badge>;
      default:
        return <Badge variant="secondary">Modéré</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Statistiques</h1>
          <p className="text-muted-foreground">Vue d'ensemble de votre activité</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Chargement des statistiques...</span>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Statistiques</h1>
          <p className="text-muted-foreground">Vue d'ensemble de votre activité</p>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Impossible de charger les statistiques</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Statistiques</h1>
        <p className="text-muted-foreground">Vue d'ensemble de votre activité</p>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus ce mois</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monthlyRevenue.current}€</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              {stats.monthlyRevenue.growth >= 0 ? '+' : ''}{stats.monthlyRevenue.growth}% par rapport au mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultations</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monthlyBookings.current}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              {stats.monthlyBookings.growth >= 0 ? '+' : ''}{stats.monthlyBookings.growth}% ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nouveaux clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newClients}</div>
            <p className="text-xs text-muted-foreground">
              Ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Note moyenne</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalReviews > 0 ? `Basé sur ${stats.totalReviews} avis` : 'Aucun avis pour le moment'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Services les plus populaires */}
      <Card>
        <CardHeader>
          <CardTitle>Services les plus populaires</CardTitle>
          <CardDescription>Répartition des consultations par service</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.popularServices.length > 0 ? (
              stats.popularServices.map((service, index) => (
                <div key={service.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-primary' :
                      index === 1 ? 'bg-secondary' :
                      index === 2 ? 'bg-accent' :
                      'bg-muted'
                    }`}></div>
                    <span className="font-medium">{service.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{service.percentage}%</span>
                    <Badge>{service.bookings_count} consultation{service.bookings_count > 1 ? 's' : ''}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">Aucune consultation pour le moment</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activité récente */}
        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
            <CardDescription>Dernières actions sur votre site</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3">
                    {activity.type === 'booking' && <Calendar className="h-4 w-4 text-primary" />}
                    {activity.type === 'message' && <MessageSquare className="h-4 w-4 text-blue-500" />}
                    {activity.type === 'review' && <Star className="h-4 w-4 text-yellow-500" />}
                    {activity.type === 'user' && <Users className="h-4 w-4 text-green-500" />}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatRelativeTime(activity.time)}</span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">Aucune activité récente</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Horaires de pointe */}
        <Card>
          <CardHeader>
            <CardTitle>Horaires de pointe</CardTitle>
            <CardDescription>Créneaux les plus demandés</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.peakHours.length > 0 ? (
                stats.peakHours.map((slot) => (
                  <div key={slot.timeSlot} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{slot.timeSlot}</span>
                    </div>
                    {getBadgeForLevel(slot.level)}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">Aucune donnée sur les horaires</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Stats;