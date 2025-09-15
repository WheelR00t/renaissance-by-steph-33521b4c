import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  DollarSign,
  Clock,
  Image,
  Eye,
  EyeOff
} from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/lib/api";

interface Service {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  duration: string;
  category: string;
  isActive: boolean;
  image?: string;
  features: string[];
}

const defaultServices: Service[] = [
  {
    id: "1",
    name: "Tirage de Cartes",
    description: "Révélez votre avenir grâce aux messages des cartes de tarot et d'oracle. Une guidance claire pour éclairer votre chemin.",
    shortDescription: "Guidance et clarté à travers la lecture des cartes de tarot et d'oracle",
    price: 45,
    duration: "30-60 min",
    category: "Voyance",
    isActive: true,
    image: "/src/assets/service-tarot.webp",
    features: [
      "Lecture personnalisée",
      "Guidance sur l'avenir",
      "Conseils pratiques",
      "Support émotionnel"
    ]
  },
  {
    id: "2", 
    name: "Séance Reiki",
    description: "Harmonisez vos énergies et retrouvez l'équilibre intérieur grâce à cette technique de guérison japonaise ancestrale.",
    shortDescription: "Séance de guérison énergétique pour harmoniser corps et esprit",
    price: 60,
    duration: "45-90 min",
    category: "Bien-être",
    isActive: true,
    image: "/src/assets/service-reiki.webp",
    features: [
      "Rééquilibrage énergétique",
      "Détente profonde", 
      "Libération des blocages",
      "Bien-être global"
    ]
  },
  {
    id: "3",
    name: "Divination au Pendule",
    description: "Obtenez des réponses précises à vos questions grâce à la sagesse du pendule et à l'art de la radiesthésie.",
    shortDescription: "Divination précise pour obtenir des réponses à vos questions",
    price: 35,
    duration: "30-45 min",
    category: "Voyance",
    isActive: true,
    image: "/src/assets/service-pendulum.webp",
    features: [
      "Réponses précises",
      "Art de la radiesthésie",
      "Guidance spirituelle", 
      "Clarification des doutes"
    ]
  },
  {
    id: "4",
    name: "Guérison Énergétique",
    description: "Soins énergétiques pour libérer les blocages et activer l'auto-guérison naturelle de votre être.",
    shortDescription: "Soins énergétiques pour libérer les blocages et activer l'auto-guérison",
    price: 70,
    duration: "60-90 min",
    category: "Bien-être",
    isActive: true,
    image: "/src/assets/service-healing.webp",
    features: [
      "Libération des blocages",
      "Activation de l'auto-guérison",
      "Harmonisation énergétique",
      "Transformation profonde"
    ]
  }
];

const Services = () => {
  // Charger les services depuis l'API
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const list = await apiService.getServices();
        setServices(list as Service[]);
      } catch (e) {
        // fallback local
        setServices(defaultServices);
      }
    };
    load();
  }, []);

  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Service>>({
    name: "",
    description: "",
    shortDescription: "",
    price: 0,
    duration: "",
    category: "",
    isActive: true,
    features: [""]
  });

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData(service);
    setIsCreating(false);
  };

  const handleCreate = () => {
    setFormData({
      name: "",
      description: "",
      shortDescription: "",
      price: 0,
      duration: "",
      category: "",
      isActive: true,
      features: [""]
    });
    setEditingService(null);
    setIsCreating(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.description || !formData.price) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    const newService: Service = {
      ...formData,
      id: editingService?.id || Date.now().toString(),
      features: formData.features?.filter(f => f.trim() !== "") || []
    } as Service;

    if (editingService) {
      setServices(services.map(s => s.id === editingService.id ? newService : s));
      toast.success("Service mis à jour avec succès");
    } else {
      setServices([...services, newService]);
      toast.success("Service créé avec succès");
    }

    setEditingService(null);
    setIsCreating(false);
    setFormData({});
  };

  const handleCancel = () => {
    setEditingService(null);
    setIsCreating(false);
    setFormData({});
  };

  const handleDelete = (service: Service) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le service "${service.name}" ?`)) {
      setServices(services.filter(s => s.id !== service.id));
      toast.success("Service supprimé avec succès");
    }
  };

  const toggleActive = (service: Service) => {
    const updated = { ...service, isActive: !service.isActive };
    setServices(services.map(s => s.id === service.id ? updated : s));
    toast.success(`Service ${updated.isActive ? 'activé' : 'désactivé'}`);
  };

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...(formData.features || []), ""]
    });
  };

  const removeFeature = (index: number) => {
    const newFeatures = [...(formData.features || [])];
    newFeatures.splice(index, 1);
    setFormData({ ...formData, features: newFeatures });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...(formData.features || [])];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestion des Services</h1>
          <p className="text-muted-foreground">
            Gérez vos services, leurs prix et descriptions
          </p>
        </div>
        <Button onClick={handleCreate} className="bg-gradient-mystique">
          <Plus className="h-4 w-4 mr-2" />
          Nouveau Service
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Liste des services */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Services existants</h2>
          {services.map((service) => (
            <Card key={service.id} className={!service.isActive ? "opacity-60" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {service.name}
                      {!service.isActive && (
                        <Badge variant="secondary">Désactivé</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{service.shortDescription}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary">{service.price}€</div>
                    <div className="text-sm text-muted-foreground">{service.duration}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(service)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleActive(service)}
                    >
                      {service.isActive ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-1" />
                          Désactiver
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-1" />
                          Activer
                        </>
                      )}
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(service)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Supprimer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Formulaire d'édition/création */}
        {(editingService || isCreating) && (
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>
                {editingService ? "Modifier le service" : "Créer un nouveau service"}
              </CardTitle>
              <CardDescription>
                Remplissez les informations du service
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nom du service *</Label>
                  <Input
                    id="name"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Tirage de cartes"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Catégorie</Label>
                  <Input
                    id="category"
                    value={formData.category || ""}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Ex: Voyance, Bien-être"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="shortDescription">Description courte</Label>
                <Input
                  id="shortDescription"
                  value={formData.shortDescription || ""}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Description affichée sur les cartes"
                />
              </div>

              <div>
                <Label htmlFor="description">Description complète *</Label>
                <Textarea
                  id="description"
                  rows={3}
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description détaillée du service"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Prix (€) *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price || ""}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    placeholder="45"
                  />
                </div>
                <div>
                  <Label htmlFor="duration" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Durée
                  </Label>
                  <Input
                    id="duration"
                    value={formData.duration || ""}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="30-60 min"
                  />
                </div>
              </div>

              {/* Caractéristiques */}
              <div>
                <Label>Caractéristiques du service</Label>
                <div className="space-y-2 mt-2">
                  {(formData.features || [""]).map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        placeholder="Ex: Lecture personnalisée"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeFeature(index)}
                        disabled={(formData.features?.length || 0) <= 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button size="sm" variant="outline" onClick={addFeature}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une caractéristique
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Service actif</Label>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button onClick={handleSave} className="bg-gradient-mystique">
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Services;