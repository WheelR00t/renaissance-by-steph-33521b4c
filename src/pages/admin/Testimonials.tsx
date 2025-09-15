import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Edit, Trash2, Star, User } from "lucide-react";
import { toast } from "sonner";

interface Testimonial {
  id: string;
  clientName: string;
  service: string;
  rating: number;
  comment: string;
  status: "approved" | "pending" | "rejected";
  date: string;
  featured: boolean;
}

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([
    {
      id: "1",
      clientName: "Marie D.",
      service: "Consultation Tarot",
      rating: 5,
      comment: "Consultation exceptionnelle! Steph a une véritable connexion spirituelle et ses conseils m'ont beaucoup aidée.",
      status: "approved",
      date: "2024-01-15",
      featured: true
    },
    {
      id: "2",
      clientName: "Pierre M.",
      service: "Séance de Reiki",
      rating: 5,
      comment: "Séance très relaxante et apaisante. Je recommande vivement!",
      status: "pending",
      date: "2024-01-14",
      featured: false
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [isAddingTestimonial, setIsAddingTestimonial] = useState(false);
  const [testimonialForm, setTestimonialForm] = useState({
    clientName: "",
    service: "",
    rating: 5,
    comment: "",
    status: "pending" as Testimonial["status"]
  });

  const filteredTestimonials = testimonials.filter(testimonial =>
    testimonial.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    testimonial.service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddTestimonial = () => {
    if (!testimonialForm.clientName.trim() || !testimonialForm.comment.trim()) {
      toast.error("Nom du client et commentaire sont requis");
      return;
    }

    const newTestimonial: Testimonial = {
      id: Date.now().toString(),
      clientName: testimonialForm.clientName,
      service: testimonialForm.service,
      rating: testimonialForm.rating,
      comment: testimonialForm.comment,
      status: testimonialForm.status,
      date: new Date().toISOString().split('T')[0],
      featured: false
    };

    setTestimonials(prev => [...prev, newTestimonial]);
    setTestimonialForm({ clientName: "", service: "", rating: 5, comment: "", status: "pending" });
    setIsAddingTestimonial(false);
    toast.success("Témoignage ajouté avec succès");
  };

  const handleUpdateStatus = (id: string, newStatus: Testimonial["status"]) => {
    setTestimonials(prev => prev.map(testimonial =>
      testimonial.id === id ? { ...testimonial, status: newStatus } : testimonial
    ));
    toast.success("Statut mis à jour");
  };

  const handleToggleFeatured = (id: string) => {
    setTestimonials(prev => prev.map(testimonial =>
      testimonial.id === id ? { ...testimonial, featured: !testimonial.featured } : testimonial
    ));
    toast.success("Statut mis en avant modifié");
  };

  const handleDeleteTestimonial = (id: string) => {
    setTestimonials(prev => prev.filter(testimonial => testimonial.id !== id));
    toast.success("Témoignage supprimé");
  };

  const getStatusBadge = (status: Testimonial["status"]) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approuvé</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejeté</Badge>;
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Témoignages</h1>
          <p className="text-muted-foreground">Gestion des avis et témoignages clients</p>
        </div>
        
        <Dialog open={isAddingTestimonial} onOpenChange={setIsAddingTestimonial}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un témoignage
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouveau témoignage</DialogTitle>
              <DialogDescription>Ajoutez un nouveau témoignage client</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="clientName">Nom du client *</Label>
                <Input
                  id="clientName"
                  value={testimonialForm.clientName}
                  onChange={(e) => setTestimonialForm(prev => ({ ...prev, clientName: e.target.value }))}
                  placeholder="Marie D."
                />
              </div>
              <div>
                <Label htmlFor="service">Service</Label>
                <Input
                  id="service"
                  value={testimonialForm.service}
                  onChange={(e) => setTestimonialForm(prev => ({ ...prev, service: e.target.value }))}
                  placeholder="Consultation Tarot"
                />
              </div>
              <div>
                <Label htmlFor="rating">Note</Label>
                <Select value={testimonialForm.rating.toString()} onValueChange={(value) => setTestimonialForm(prev => ({ ...prev, rating: parseInt(value) }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 étoile</SelectItem>
                    <SelectItem value="2">2 étoiles</SelectItem>
                    <SelectItem value="3">3 étoiles</SelectItem>
                    <SelectItem value="4">4 étoiles</SelectItem>
                    <SelectItem value="5">5 étoiles</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="comment">Commentaire *</Label>
                <Textarea
                  id="comment"
                  value={testimonialForm.comment}
                  onChange={(e) => setTestimonialForm(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Commentaire du client..."
                  rows={4}
                />
              </div>
              <div>
                <Label>Statut</Label>
                <Select value={testimonialForm.status} onValueChange={(value) => setTestimonialForm(prev => ({ ...prev, status: value as Testimonial["status"] }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="approved">Approuvé</SelectItem>
                    <SelectItem value="rejected">Rejeté</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddTestimonial}>Ajouter</Button>
                <Button variant="outline" onClick={() => setIsAddingTestimonial(false)}>Annuler</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un témoignage..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="grid gap-4">
          {filteredTestimonials.map((testimonial) => (
            <Card key={testimonial.id} className={testimonial.featured ? "border-primary" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <CardTitle className="text-lg">{testimonial.clientName}</CardTitle>
                      {testimonial.featured && <Badge className="bg-blue-100 text-blue-800">Mis en avant</Badge>}
                    </div>
                    <CardDescription>{testimonial.service}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(testimonial.status)}
                    <span className="text-sm text-muted-foreground">{testimonial.date}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-3">
                  {renderStars(testimonial.rating)}
                  <span className="text-sm text-muted-foreground">({testimonial.rating}/5)</span>
                </div>
                
                <p className="text-sm mb-4 p-3 bg-muted rounded italic">
                  "{testimonial.comment}"
                </p>
                
                <div className="flex gap-2 flex-wrap">
                  <Select value={testimonial.status} onValueChange={(value) => handleUpdateStatus(testimonial.id, value as Testimonial["status"])}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="approved">Approuvé</SelectItem>
                      <SelectItem value="rejected">Rejeté</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleToggleFeatured(testimonial.id)}
                  >
                    <Star className="h-4 w-4 mr-1" />
                    {testimonial.featured ? 'Retirer' : 'Mettre en avant'}
                  </Button>

                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4 mr-1" />
                    Modifier
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleDeleteTestimonial(testimonial.id)}
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
  );
};

export default Testimonials;