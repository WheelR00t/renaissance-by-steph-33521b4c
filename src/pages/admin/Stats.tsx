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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span className="font-medium">Consultation Tarot</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">45%</span>
                <Badge>18 consultations</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-secondary rounded-full"></div>
                <span className="font-medium">Séance de Reiki</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">30%</span>
                <Badge>12 consultations</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-accent rounded-full"></div>
                <span className="font-medium">Guérison Énergétique</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">15%</span>
                <Badge>6 consultations</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-muted rounded-full"></div>
                <span className="font-medium">Pendule Divinatoire</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">10%</span>
                <Badge>4 consultations</Badge>
              </div>
            </div>
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
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Nouvelle réservation</p>
                  <p className="text-xs text-muted-foreground">Marie D. - Consultation Tarot</p>
                </div>
                <span className="text-xs text-muted-foreground">Il y a 2h</span>
              </div>
              <div className="flex items-center gap-3">
                <Star className="h-4 w-4 text-yellow-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Nouveau témoignage</p>
                  <p className="text-xs text-muted-foreground">Pierre M. - 5 étoiles</p>
                </div>
                <span className="text-xs text-muted-foreground">Il y a 4h</span>
              </div>
              <div className="flex items-center gap-3">
                <MessageSquare className="h-4 w-4 text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Nouveau message</p>
                  <p className="text-xs text-muted-foreground">Question sur les horaires</p>
                </div>
                <span className="text-xs text-muted-foreground">Il y a 6h</span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Nouveau client</p>
                  <p className="text-xs text-muted-foreground">Julie L. s'est inscrite</p>
                </div>
                <span className="text-xs text-muted-foreground">Hier</span>
              </div>
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">14h00 - 16h00</span>
                </div>
                <Badge className="bg-green-100 text-green-800">Très demandé</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">10h00 - 12h00</span>
                </div>
                <Badge className="bg-blue-100 text-blue-800">Populaire</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">16h00 - 18h00</span>
                </div>
                <Badge variant="secondary">Modéré</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">09h00 - 10h00</span>
                </div>
                <Badge variant="outline">Faible</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Stats;