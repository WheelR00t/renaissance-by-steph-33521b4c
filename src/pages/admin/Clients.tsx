import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, UserPlus, Edit, Trash2, Calendar, Mail, Phone } from "lucide-react";
import { apiService } from "@/lib/api";
import { toast } from "sonner";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateCreated: string;
  totalBookings: number;
  lastBooking: string;
  status: "active" | "inactive";
  notes: string;
}

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [clientForm, setClientForm] = useState({
    name: "",
    email: "",
    phone: "",
    notes: ""
  });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiService.getClients();
        setClients(data as Client[]);
      } catch (e) {
        // silent
      }
    };
    load();
  }, []);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  );

  const handleAddClient = () => {
    if (!clientForm.name.trim() || !clientForm.email.trim()) {
      toast.error("Nom et email sont requis");
      return;
    }

    const newClient: Client = {
      id: Date.now().toString(),
      name: clientForm.name,
      email: clientForm.email,
      phone: clientForm.phone,
      dateCreated: new Date().toISOString().split('T')[0],
      totalBookings: 0,
      lastBooking: "-",
      status: "active",
      notes: clientForm.notes
    };

    setClients(prev => [...prev, newClient]);
    setClientForm({ name: "", email: "", phone: "", notes: "" });
    setIsAddingClient(false);
    toast.success("Client ajouté avec succès");
  };

  const handleUpdateClient = () => {
    if (!selectedClient) return;

    setClients(prev => prev.map(client =>
      client.id === selectedClient.id ? selectedClient : client
    ));
    
    setSelectedClient(null);
    toast.success("Client mis à jour");
  };

  const handleDeleteClient = (id: string) => {
    setClients(prev => prev.filter(client => client.id !== id));
    toast.success("Client supprimé");
  };

  const getStatusBadge = (status: Client["status"]) => {
    return status === "active" ? 
      <Badge className="bg-green-100 text-green-800">Actif</Badge> :
      <Badge variant="secondary">Inactif</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-muted-foreground">Gestion de votre base clients</p>
        </div>
        
        <Dialog open={isAddingClient} onOpenChange={setIsAddingClient}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Ajouter un client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouveau client</DialogTitle>
              <DialogDescription>Ajoutez un nouveau client à votre base</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nom complet *</Label>
                <Input
                  id="name"
                  value={clientForm.name}
                  onChange={(e) => setClientForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nom du client"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={clientForm.email}
                  onChange={(e) => setClientForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@exemple.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={clientForm.phone}
                  onChange={(e) => setClientForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="06 12 34 56 78"
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={clientForm.notes}
                  onChange={(e) => setClientForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Notes sur le client..."
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddClient}>Ajouter</Button>
                <Button variant="outline" onClick={() => setIsAddingClient(false)}>Annuler</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-6">
        <div className="flex-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="grid gap-4">
            {filteredClients.map((client) => (
              <Card key={client.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{client.name}</CardTitle>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {client.email}
                        </div>
                        {client.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {client.phone}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(client.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{client.totalBookings}</div>
                      <div className="text-sm text-muted-foreground">Réservations</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">{client.lastBooking}</div>
                      <div className="text-sm text-muted-foreground">Dernier RDV</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">{client.dateCreated}</div>
                      <div className="text-sm text-muted-foreground">Client depuis</div>
                    </div>
                  </div>
                  
                  {client.notes && (
                    <p className="text-sm text-muted-foreground mb-4 p-2 bg-muted rounded">
                      {client.notes}
                    </p>
                  )}
                  
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" onClick={() => setSelectedClient(client)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Modifier
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Modifier le client</DialogTitle>
                        </DialogHeader>
                        {selectedClient && (
                          <div className="space-y-4">
                            <div>
                              <Label>Nom complet</Label>
                              <Input
                                value={selectedClient.name}
                                onChange={(e) => setSelectedClient(prev => prev ? { ...prev, name: e.target.value } : null)}
                              />
                            </div>
                            <div>
                              <Label>Email</Label>
                              <Input
                                value={selectedClient.email}
                                onChange={(e) => setSelectedClient(prev => prev ? { ...prev, email: e.target.value } : null)}
                              />
                            </div>
                            <div>
                              <Label>Téléphone</Label>
                              <Input
                                value={selectedClient.phone}
                                onChange={(e) => setSelectedClient(prev => prev ? { ...prev, phone: e.target.value } : null)}
                              />
                            </div>
                            <div>
                              <Label>Notes</Label>
                              <Textarea
                                value={selectedClient.notes}
                                onChange={(e) => setSelectedClient(prev => prev ? { ...prev, notes: e.target.value } : null)}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={handleUpdateClient}>Sauvegarder</Button>
                              <Button variant="outline" onClick={() => setSelectedClient(null)}>Annuler</Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                    
                    <Button size="sm" variant="outline">
                      <Calendar className="h-4 w-4 mr-1" />
                      Historique
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDeleteClient(client.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Clients;