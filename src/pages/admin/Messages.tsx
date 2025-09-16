import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Search, 
  Mail, 
  MessageCircle, 
  Clock, 
  Trash2, 
  Eye,
  Reply,
  Archive,
  Filter,
  ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { apiService } from "@/lib/api";

interface ContactMessage {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  contactReason?: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  createdAt: string;
  updatedAt: string;
}

interface ContactStats {
  total: number;
  new: number;
  today: number;
}

const Messages = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [stats, setStats] = useState<ContactStats>({ total: 0, new: 0, today: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const [messagesData, statsData] = await Promise.all([
        apiService.getContactMessages(statusFilter),
        apiService.getContactStats()
      ]);
      setMessages(messagesData);
      setStats(statsData);
    } catch (error) {
      console.error('Erreur chargement messages:', error);
      toast.error("Erreur lors du chargement des messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [statusFilter]);

  const handleUpdateStatus = async (id: string, newStatus: ContactMessage["status"]) => {
    try {
      await apiService.updateContactMessage(id, newStatus);
      setMessages(prev => prev.map(msg => 
        msg.id === id ? { ...msg, status: newStatus, updatedAt: new Date().toISOString() } : msg
      ));
      toast.success("Statut mis à jour");
      
      // Recharger les stats
      const newStats = await apiService.getContactStats();
      setStats(newStats);
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce message ?")) return;
    
    try {
      await apiService.deleteContactMessage(id);
      setMessages(prev => prev.filter(msg => msg.id !== id));
      toast.success("Message supprimé");
      
      // Recharger les stats
      const newStats = await apiService.getContactStats();
      setStats(newStats);
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleViewMessage = async (message: ContactMessage) => {
    setSelectedMessage(message);
    
    // Marquer comme lu si nouveau
    if (message.status === 'new') {
      await handleUpdateStatus(message.id, 'read');
    }
  };

  const getStatusBadge = (status: ContactMessage["status"]) => {
    const configs = {
      new: { label: "Nouveau", className: "bg-blue-100 text-blue-800" },
      read: { label: "Lu", className: "bg-gray-100 text-gray-800" },
      replied: { label: "Répondu", className: "bg-green-100 text-green-800" },
      archived: { label: "Archivé", className: "bg-yellow-100 text-yellow-800" }
    };
    
    const config = configs[status];
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getContactReasonLabel = (reason?: string) => {
    const reasons = {
      consultation: "Demande de consultation",
      info: "Demande d'informations", 
      feedback: "Témoignage / Retour",
      collaboration: "Collaboration",
      other: "Autre"
    };
    return reason ? reasons[reason as keyof typeof reasons] || reason : 'Non spécifié';
  };

  const filteredMessages = messages.filter(message => {
    const searchString = `${message.firstName} ${message.lastName} ${message.email} ${message.subject || ''} ${message.message}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-lg"></div>
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Messages de Contact</h1>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nouveaux</p>
                <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
              </div>
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aujourd'hui</p>
                <p className="text-2xl font-bold text-green-600">{stats.today}</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher dans les messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="new">Nouveaux</SelectItem>
                  <SelectItem value="read">Lus</SelectItem>
                  <SelectItem value="replied">Répondus</SelectItem>
                  <SelectItem value="archived">Archivés</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des messages */}
      <div className="space-y-4">
        {filteredMessages.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun message</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Aucun message ne correspond à votre recherche" : "Aucun message de contact pour le moment"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredMessages.map((message) => (
            <Card key={message.id} className={message.status === 'new' ? 'border-blue-200 bg-blue-50/50' : ''}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">
                        {message.firstName} {message.lastName}
                      </h3>
                      {getStatusBadge(message.status)}
                      {message.contactReason && (
                        <Badge variant="outline" className="text-xs">
                          {getContactReasonLabel(message.contactReason)}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-sm text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {message.email}
                      </span>
                      {message.phone && (
                        <span className="flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          {message.phone}
                        </span>
                      )}
                    </div>

                    {message.subject && (
                      <p className="font-medium text-sm mb-2">
                        Sujet: {message.subject}
                      </p>
                    )}

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {message.message}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Reçu le {format(new Date(message.createdAt), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                    </p>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewMessage(message)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        {selectedMessage && (
                          <>
                            <DialogHeader>
                              <DialogTitle>
                                Message de {selectedMessage.firstName} {selectedMessage.lastName}
                              </DialogTitle>
                              <DialogDescription>
                                Reçu le {format(new Date(selectedMessage.createdAt), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Email:</span> {selectedMessage.email}
                                </div>
                                {selectedMessage.phone && (
                                  <div>
                                    <span className="font-medium">Téléphone:</span> {selectedMessage.phone}
                                  </div>
                                )}
                                {selectedMessage.contactReason && (
                                  <div className="col-span-2">
                                    <span className="font-medium">Motif:</span> {getContactReasonLabel(selectedMessage.contactReason)}
                                  </div>
                                )}
                                {selectedMessage.subject && (
                                  <div className="col-span-2">
                                    <span className="font-medium">Sujet:</span> {selectedMessage.subject}
                                  </div>
                                )}
                              </div>
                              
                              <div>
                                <span className="font-medium">Message:</span>
                                <div className="mt-2 p-4 bg-muted rounded-lg whitespace-pre-wrap">
                                  {selectedMessage.message}
                                </div>
                              </div>

                              <div className="flex gap-2 pt-4">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(`mailto:${selectedMessage.email}`)}
                                >
                                  <Reply className="h-4 w-4 mr-2" />
                                  Répondre par email
                                </Button>
                                
                                {selectedMessage.status !== 'replied' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUpdateStatus(selectedMessage.id, 'replied')}
                                  >
                                    Marquer comme répondu
                                  </Button>
                                )}
                                
                                {selectedMessage.status !== 'archived' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUpdateStatus(selectedMessage.id, 'archived')}
                                  >
                                    <Archive className="h-4 w-4 mr-2" />
                                    Archiver
                                  </Button>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteMessage(message.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Messages;