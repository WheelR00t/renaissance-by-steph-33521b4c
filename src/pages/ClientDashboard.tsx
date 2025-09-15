import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ClientDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20">
        <section className="py-12 bg-gradient-subtle">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="bg-gradient-mystique bg-clip-text text-transparent">
                Espace client
              </span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Bienvenue{user?.name ? `, ${user.name}` : ''} ! Retrouvez ici vos informations et vos rendez-vous.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <Card>
              <CardHeader>
                <CardTitle>Vos actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <Button asChild className="bg-gradient-mystique">
                  <Link to="/reservation">Prendre un rendez-vous</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/reservation">Voir mes rendez-vous (bientôt)</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ClientDashboard;
