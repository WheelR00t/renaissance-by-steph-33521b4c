import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Calendar, Clock, User, Edit, Trash2, Video, ExternalLink, Mail, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/lib/api";

interface Booking {
  id: string;
  clientName: string;
  clientEmail: string;
  service: string;
  date: string;
  time: string;
  status: "confirmed" | "pending" | "cancelled";
  price: number;
  notes: string;
  visioLink?: string;
  bookingType: "guest" | "registered";
  paymentStatus?: string;
}

const Bookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiService.getAdminBookings();
        setBookings(data as Booking[]);
      } catch (e) {
        toast.error("Impossible de charger les réservations");
      }
    };
    load();
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.service.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = async (id: string, newStatus: Booking["status"]) => {
    try {
      const booking = bookings.find(b => b.id === id);
      const wasNotCancelled = booking?.status !== 'cancelled';
      
      const updated = await apiService.updateBookingById(id, { status: newStatus });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: updated.status } : b));
      
      if (newStatus === 'cancelled' && wasNotCancelled) {
        toast.success("Statut mis à jour - Email d'annulation envoyé automatiquement");
      } else {
        toast.success("Statut mis à jour");
      }
    } catch (e) {
      toast.error("Échec de la mise à jour du statut");
    }
  };

  const handleUpdateVisioLink = async (id: string, link: string) => {
    try {
      // Formater le lien pour s'assurer qu'il a un protocole
      let formattedLink = link.trim();
      if (formattedLink && !formattedLink.startsWith('http://') && !formattedLink.startsWith('https://')) {
        formattedLink = 'https://' + formattedLink;
      }
      
      const updated = await apiService.updateBookingById(id, { visioLink: formattedLink });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, visioLink: updated.visioLink } : b));
      toast.success("Lien visio mis à jour");
    } catch (e) {
      toast.error("Échec de la mise à jour du lien visio");
    }
  };

  const handleSendConfirmation = async (id: string) => {
    try {
      await apiService.sendConfirmationEmail(id);
      toast.success("Email de confirmation envoyé");
    } catch (e) {
      toast.error("Échec de l'envoi de l'email");
    }
  };

  const handleSendCancellation = async (id: string) => {
    try {
      await apiService.sendCancellationEmail(id);
      toast.success("Email d'annulation envoyé");
    } catch (e) {
      toast.error("Échec de l'envoi de l'email d'annulation");
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      const updated = await apiService.updateBookingById(id, { paymentStatus: 'paid' });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, paymentStatus: 'paid' } : b));
      toast.success("Paiement marqué comme reçu");
    } catch (e) {
      toast.error("Échec de la mise à jour du paiement");
    }
  };

  const handleDeleteBooking = async (id: string) => {
    try {
      await apiService.deleteBookingById(id);
      setBookings(prev => prev.filter(booking => booking.id !== id));
      toast.success("Réservation supprimée - Email d'annulation envoyé automatiquement");
    } catch (e) {
      toast.error("Échec de la suppression");
    }
  };

  const getStatusBadge = (status: Booking["status"]) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800">Confirmé</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Annulé</Badge>;
    }
  };

  const getBookingTypeBadge = (type: Booking["bookingType"]) => {
    return type === "registered" ? 
      <Badge variant="outline">Compte client</Badge> :
      <Badge variant="outline" className="bg-blue-50 text-blue-700">Invité</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800">Payé</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case "failed":
        return <Badge variant="destructive">Échec</Badge>;
      default:
        return <Badge variant="outline">Non défini</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Réservations</h1>
          <p className="text-muted-foreground">Gestion de toutes les réservations</p>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une réservation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="confirmed">Confirmé</SelectItem>
            <SelectItem value="completed">Terminé</SelectItem>
            <SelectItem value="cancelled">Annulé</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredBookings.map((booking) => (
          <Card key={booking.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{booking.clientName}</CardTitle>
                    {getBookingTypeBadge(booking.bookingType)}
                  </div>
                  <CardDescription>{booking.clientEmail}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(booking.status)}
                  {getPaymentStatusBadge(booking.paymentStatus || 'pending')}
                  <span className="text-sm font-medium">{booking.price}€</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{booking.service}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{booking.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{booking.time}</span>
                </div>
              </div>

              {booking.notes && (
                <p className="text-sm text-muted-foreground mb-4 p-2 bg-muted rounded">
                  <strong>Notes:</strong> {booking.notes}
                </p>
              )}

              {booking.visioLink && (
                <div className="flex items-center gap-2 mb-4 p-2 bg-blue-50 rounded">
                  <Video className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-700">Lien visio disponible</span>
                  <Button size="sm" variant="outline" onClick={() => window.open(booking.visioLink, '_blank')}>
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Ouvrir
                  </Button>
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                <Select value={booking.status} onValueChange={(value) => handleUpdateStatus(booking.id, value as Booking["status"])}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="confirmed">Confirmé</SelectItem>
                    <SelectItem value="cancelled">Annulé</SelectItem>
                  </SelectContent>
                </Select>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" onClick={() => setSelectedBooking(booking)}>
                      <Video className="h-4 w-4 mr-1" />
                      {booking.visioLink ? 'Modifier lien' : 'Ajouter lien'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Lien de visioconférence</DialogTitle>
                      <DialogDescription>
                        Ajoutez le lien de visioconférence pour cette consultation
                      </DialogDescription>
                    </DialogHeader>
                    {selectedBooking && (
                      <div className="space-y-4">
                        <div>
                          <Label>Lien de la visio</Label>
                          <Input
                            placeholder="https://meet.google.com/..."
                            defaultValue={selectedBooking.visioLink || ""}
                            onChange={(e) => {
                              if (selectedBooking) {
                                setSelectedBooking({...selectedBooking, visioLink: e.target.value});
                              }
                            }}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => {
                            if (selectedBooking?.visioLink) {
                              handleUpdateVisioLink(selectedBooking.id, selectedBooking.visioLink);
                            }
                            setSelectedBooking(null);
                          }}>
                            Sauvegarder
                          </Button>
                          <Button variant="outline" onClick={() => setSelectedBooking(null)}>
                            Annuler
                          </Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Modifier la réservation</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Notes</Label>
                        <Textarea
                          placeholder="Notes sur la réservation..."
                          defaultValue={booking.notes}
                        />
                      </div>
                      <div>
                        <Label>Prix</Label>
                        <Input
                          type="number"
                          defaultValue={booking.price}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button>Sauvegarder</Button>
                        <Button variant="outline">Annuler</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {(booking.paymentStatus === 'pending' || !booking.paymentStatus) && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleMarkAsPaid(booking.id)}
                    className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                  >
                    <CreditCard className="h-4 w-4 mr-1" />
                    Marquer payé
                  </Button>
                )}

                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleSendConfirmation(booking.id)}
                >
                  <Mail className="h-4 w-4 mr-1" />
                  Envoyer confirmation
                </Button>

                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleSendCancellation(booking.id)}
                  className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
                  disabled={booking.status === 'cancelled'}
                  title={booking.status === 'cancelled' ? 'Cette réservation est déjà annulée' : 'Envoyer un email d\'annulation'}
                >
                  <Mail className="h-4 w-4 mr-1" />
                  Envoyer annulation
                </Button>

                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => handleDeleteBooking(booking.id)}
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
  );
};

export default Bookings;