import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Edit, Trash2, Eye, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  status: "published" | "draft" | "scheduled";
  category: string;
  publishDate: string;
  author: string;
  views: number;
}

const Blog = () => {
  const [articles, setArticles] = useState<Article[]>([
    {
      id: "1",
      title: "Les bienfaits de la méditation spirituelle",
      content: "La méditation spirituelle apporte de nombreux bienfaits...",
      excerpt: "Découvrez comment la méditation peut transformer votre quotidien",
      status: "published",
      category: "Spiritualité",
      publishDate: "2024-01-10",
      author: "Steph",
      views: 156
    },
    {
      id: "2",
      title: "Comprendre les cartes de Tarot",
      content: "Les cartes de Tarot sont un outil puissant...",
      excerpt: "Guide complet pour débuter avec les cartes de Tarot",
      status: "draft",
      category: "Tarot",
      publishDate: "2024-01-20",
      author: "Steph",
      views: 0
    }
  ]);

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('blogArticles');
    if (saved) {
      try {
        setArticles(JSON.parse(saved));
      } catch {}
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('blogArticles', JSON.stringify(articles));
  }, [articles, hydrated]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isAddingArticle, setIsAddingArticle] = useState(false);
  const [articleForm, setArticleForm] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "",
    status: "draft" as Article["status"]
  });

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddArticle = () => {
    if (!articleForm.title.trim() || !articleForm.content.trim()) {
      toast.error("Titre et contenu sont requis");
      return;
    }

    const newArticle: Article = {
      id: Date.now().toString(),
      title: articleForm.title,
      content: articleForm.content,
      excerpt: articleForm.excerpt,
      status: articleForm.status,
      category: articleForm.category,
      publishDate: new Date().toISOString().split('T')[0],
      author: "Steph",
      views: 0
    };

    setArticles(prev => [...prev, newArticle]);
    setArticleForm({ title: "", content: "", excerpt: "", category: "", status: "draft" });
    setIsAddingArticle(false);
    toast.success("Article créé avec succès");
  };

  const handleDeleteArticle = (id: string) => {
    setArticles(prev => prev.filter(article => article.id !== id));
    toast.success("Article supprimé");
  };

  const getStatusBadge = (status: Article["status"]) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-100 text-green-800">Publié</Badge>;
      case "draft":
        return <Badge variant="secondary">Brouillon</Badge>;
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800">Programmé</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Articles & Blog</h1>
          <p className="text-muted-foreground">Gestion de votre contenu éditorial</p>
        </div>
        
        <Dialog open={isAddingArticle} onOpenChange={setIsAddingArticle}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvel article
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nouvel article</DialogTitle>
              <DialogDescription>Créez un nouvel article pour votre blog</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={articleForm.title}
                  onChange={(e) => setArticleForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Titre de l'article"
                />
              </div>
              <div>
                <Label htmlFor="excerpt">Extrait</Label>
                <Textarea
                  id="excerpt"
                  value={articleForm.excerpt}
                  onChange={(e) => setArticleForm(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Résumé de l'article..."
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Catégorie</Label>
                  <Input
                    id="category"
                    value={articleForm.category}
                    onChange={(e) => setArticleForm(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="Spiritualité, Tarot..."
                  />
                </div>
                <div>
                  <Label>Statut</Label>
                  <Select value={articleForm.status} onValueChange={(value) => setArticleForm(prev => ({ ...prev, status: value as Article["status"] }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Brouillon</SelectItem>
                      <SelectItem value="published">Publié</SelectItem>
                      <SelectItem value="scheduled">Programmé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="content">Contenu *</Label>
                <Textarea
                  id="content"
                  value={articleForm.content}
                  onChange={(e) => setArticleForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Contenu de l'article..."
                  rows={8}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddArticle}>Créer l'article</Button>
                <Button variant="outline" onClick={() => setIsAddingArticle(false)}>Annuler</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un article..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="grid gap-4">
          {filteredArticles.map((article) => (
            <Card key={article.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{article.title}</CardTitle>
                    <CardDescription>{article.excerpt}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(article.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {article.publishDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {article.views} vues
                    </span>
                    <Badge variant="outline">{article.category}</Badge>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4 mr-1" />
                    Modifier
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link to={`/blog/${article.id}`} target="_blank">
                      <Eye className="h-4 w-4 mr-1" />
                      Prévisualiser
                    </Link>
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleDeleteArticle(article.id)}
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

export default Blog;