import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, Reply, Trash2, Eye, Star, StarOff } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  status: "new" | "read" | "replied";
  important: boolean;
}

const Messages = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      name: "Marie Dubois",
      email: "marie.dubois@email.com",
      subject: "Question sur les consultations",
      message: "Bonjour, j'aimerais en savoir plus sur vos consultations de tarot. Quels sont vos disponibilités ?",
      date: "2024-01-15",
      status: "new",
      important: false
    },
    {
      id: "2",
      name: "Pierre Martin",
      email: "p.martin@email.com",
      subject: "Annulation rendez-vous",
      message: "Je dois malheureusement annuler mon rendez-vous du 20 janvier. Pouvons-nous reporter ?",
      date: "2024-01-14",
      status: "read",
      important: true
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState("");

  const filteredMessages = messages.filter(message =>
    message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMarkAsRead = (id: string) => {
    setMessages(prev => prev.map(msg =>
      msg.id === id ? { ...msg, status: "read" as const } : msg
    ));
  };

  const handleToggleImportant = (id: string) => {
    setMessages(prev => prev.map(msg =>
      msg.id === id ? { ...msg, important: !msg.important } : msg
    ));
  };

  const handleDelete = (id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
    toast.success("Message supprimé");
  };

  const handleReply = () => {
    if (!selectedMessage || !replyText.trim()) return;

    setMessages(prev => prev.map(msg =>
      msg.id === selectedMessage.id ? { ...msg, status: "replied" as const } : msg
    ));
    
    toast.success("Réponse envoyée");
    setReplyText("");
    setSelectedMessage(null);
  };

  const getStatusBadge = (status: Message["status"]) => {
    switch (status) {
      case "new":
        return <Badge variant="destructive">Nouveau</Badge>;
      case "read":
        return <Badge variant="secondary">Lu</Badge>;
      case "replied":
        return <Badge className="bg-green-100 text-green-800">Répondu</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Gestion des messages clients</p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Liste des messages */}
        <div className="flex-1 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher dans les messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="grid gap-4">
            {filteredMessages.map((message) => (
              <Card key={message.id} className={`cursor-pointer transition-colors hover:bg-muted/50 ${message.status === 'new' ? 'border-primary' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{message.name}</CardTitle>
                        {message.important && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                      </div>
                      <CardDescription>{message.email}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(message.status)}
                      <span className="text-sm text-muted-foreground">{message.date}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <h4 className="font-semibold text-sm mb-2">{message.subject}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {message.message}
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedMessage(message);
                        handleMarkAsRead(message.id);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Voir
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedMessage(message);
                        handleMarkAsRead(message.id);
                      }}
                    >
                      <Reply className="h-4 w-4 mr-1" />
                      Répondre
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleToggleImportant(message.id)}
                    >
                      {message.important ? 
                        <StarOff className="h-4 w-4 mr-1" /> : 
                        <Star className="h-4 w-4 mr-1" />
                      }
                      {message.important ? 'Retirer' : 'Important'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDelete(message.id)}
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

        {/* Panneau de réponse */}
        {selectedMessage && (
          <div className="w-1/3 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Message de {selectedMessage.name}</CardTitle>
                <CardDescription>{selectedMessage.email} • {selectedMessage.date}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Sujet: {selectedMessage.subject}</h4>
                  <p className="text-sm">{selectedMessage.message}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Réponse</label>
                  <Textarea
                    placeholder="Tapez votre réponse..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={6}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleReply} disabled={!replyText.trim()}>
                    Envoyer la réponse
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedMessage(null)}>
                    Fermer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;