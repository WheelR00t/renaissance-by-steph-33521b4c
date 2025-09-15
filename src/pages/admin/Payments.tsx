import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download, RefreshCw, Euro, CreditCard } from "lucide-react";
import { apiService } from "@/lib/api";

interface Payment {
  id: string;
  clientName: string;
  service: string;
  amount: number;
  status: "completed" | "pending" | "failed" | "refunded";
  date: string;
  method: "card" | "transfer" | "paypal";
}

const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiService.getPaymentsList();
        setPayments(data as Payment[]);
      } catch (e) {
        // silent
      }
    };
    load();
  }, []);

  const filteredPayments = payments.filter(payment =>
    payment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: Payment["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Complété</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case "failed":
        return <Badge variant="destructive">Échoué</Badge>;
      case "refunded":
        return <Badge variant="secondary">Remboursé</Badge>;
    }
  };

  const totalAmount = payments.filter(p => p.status === "completed").reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = payments.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0);
  const average = payments.length ? Math.round(totalAmount / payments.length) : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Paiements</h1>
          <p className="text-muted-foreground">Gestion des paiements et revenus</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus totaux</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAmount}€</div>
            <p className="text-xs text-muted-foreground">+12% ce mois</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingAmount}€</div>
            <p className="text-xs text-muted-foreground">2 paiements</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Moyenne</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{average}€</div>
            <p className="text-xs text-muted-foreground">par consultation</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un paiement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="grid gap-4">
          {filteredPayments.map((payment) => (
            <Card key={payment.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{payment.clientName}</CardTitle>
                    <CardDescription>{payment.service}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(payment.status)}
                    <span className="text-lg font-bold">{payment.amount}€</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Date: {payment.date}</span>
                  <span>Méthode: {payment.method === "card" ? "Carte" : payment.method === "transfer" ? "Virement" : "PayPal"}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Payments;