import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Euro, TrendingUp, Eye, Clock, MessageSquare, Star } from "lucide-react";

const Stats = () => {
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
            <div className="text-2xl font-bold">2,450€</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +15% par rapport au mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultations</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +8% ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nouveaux clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +22% ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Note moyenne</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.9</div>
            <p className="text-xs text-muted-foreground">
              Basé sur 28 avis
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