import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Upload, Edit, Trash2, Image as ImageIcon, Eye } from "lucide-react";
import { toast } from "sonner";

interface GalleryImage {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  uploadDate: string;
}

const Gallery = () => {
  const [images, setImages] = useState<GalleryImage[]>([
    {
      id: "1",
      title: "Espace de consultation",
      description: "Mon espace de travail chaleureux pour les consultations",
      url: "/placeholder.svg",
      category: "Espace",
      uploadDate: "2024-01-15"
    },
    {
      id: "2",
      title: "Cartes de Tarot",
      description: "Collection de cartes utilisées lors des consultations",
      url: "/placeholder.svg",
      category: "Outils",
      uploadDate: "2024-01-14"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingImage, setIsAddingImage] = useState(false);
  const [imageForm, setImageForm] = useState({
    title: "",
    description: "",
    category: "",
    file: null as File | null
  });

  const filteredImages = images.filter(image =>
    image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    image.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddImage = () => {
    if (!imageForm.title.trim() || !imageForm.file) {
      toast.error("Titre et image sont requis");
      return;
    }

    // En réalité, ici vous uploaderiez le fichier vers votre serveur
    const newImage: GalleryImage = {
      id: Date.now().toString(),
      title: imageForm.title,
      description: imageForm.description,
      url: URL.createObjectURL(imageForm.file), // Temporaire pour la démo
      category: imageForm.category,
      uploadDate: new Date().toISOString().split('T')[0]
    };

    setImages(prev => [...prev, newImage]);
    setImageForm({ title: "", description: "", category: "", file: null });
    setIsAddingImage(false);
    toast.success("Image ajoutée avec succès");
  };

  const handleDeleteImage = (id: string) => {
    setImages(prev => prev.filter(image => image.id !== id));
    toast.success("Image supprimée");
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageForm(prev => ({ ...prev, file }));
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Galerie</h1>
          <p className="text-muted-foreground">Gestion de vos images et médias</p>
        </div>
        
        <Dialog open={isAddingImage} onOpenChange={setIsAddingImage}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Ajouter une image
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouvelle image</DialogTitle>
              <DialogDescription>Ajoutez une nouvelle image à votre galerie</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="image-file">Image *</Label>
                <Input
                  id="image-file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
              <div>
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={imageForm.title}
                  onChange={(e) => setImageForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Titre de l'image"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={imageForm.description}
                  onChange={(e) => setImageForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description de l'image"
                />
              </div>
              <div>
                <Label htmlFor="category">Catégorie</Label>
                <Input
                  id="category"
                  value={imageForm.category}
                  onChange={(e) => setImageForm(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Espace, Outils, Formations..."
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddImage}>Ajouter l'image</Button>
                <Button variant="outline" onClick={() => setIsAddingImage(false)}>Annuler</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une image..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((image) => (
            <Card key={image.id}>
              <div className="aspect-square relative overflow-hidden rounded-t-lg">
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded px-2 py-1">
                  <span className="text-xs">{image.category}</span>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{image.title}</CardTitle>
                {image.description && (
                  <CardDescription>{image.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">
                    Ajoutée le {image.uploadDate}
                  </span>
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" />
                    Voir
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4 mr-1" />
                    Modifier
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleDeleteImage(image.id)}
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

export default Gallery;