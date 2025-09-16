import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Edit, Trash2, Eye, Calendar, Bold, Italic, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { apiService } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  imageUrl?: string;
  status: "published" | "draft";
  author: string;
  authorId: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

const Blog = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les articles depuis l'API
  useEffect(() => {
    const loadArticles = async () => {
      try {
        const posts = await apiService.getAdminBlogPosts();
        setArticles(posts);
      } catch (error) {
        console.error('Erreur chargement articles:', error);
        toast.error('Erreur lors du chargement des articles');
      } finally {
        setLoading(false);
      }
    };
    
    loadArticles();
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isAddingArticle, setIsAddingArticle] = useState(false);
  const [articleForm, setArticleForm] = useState({
    title: "",
    content: "",
    excerpt: "",
    imageUrl: "",
    status: "draft" as Article["status"]
  });

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddArticle = async () => {
    if (!articleForm.title.trim() || !articleForm.content.trim()) {
      toast.error("Titre et contenu sont requis");
      return;
    }

    try {
      const newArticle = await apiService.createBlogPost({
        title: articleForm.title,
        content: articleForm.content,
        excerpt: articleForm.excerpt,
        imageUrl: articleForm.imageUrl,
        status: articleForm.status
      });

      setArticles(prev => [newArticle, ...prev]);
      setArticleForm({ title: "", content: "", excerpt: "", imageUrl: "", status: "draft" });
      setIsAddingArticle(false);
      toast.success("Article créé avec succès");
    } catch (error) {
      console.error('Erreur création article:', error);
      toast.error("Erreur lors de la création de l'article");
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet article ?")) {
      return;
    }

    try {
      await apiService.deleteBlogPost(id);
      setArticles(prev => prev.filter(article => article.id !== id));
      toast.success("Article supprimé");
    } catch (error) {
      console.error('Erreur suppression article:', error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const togglePublish = async (a: Article) => {
    try {
      const newStatus = a.status === 'published' ? 'draft' : 'published';
      const updated = await apiService.updateBlogPost(a.id, { status: newStatus });
      setArticles(prev => prev.map(it => it.id === a.id ? { ...it, status: updated.status, publishedAt: updated.publishedAt } : it));
      toast.success(newStatus === 'published' ? 'Article publié' : 'Article dépublié');
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      toast.error("Impossible de changer le statut");
    }
  };
  const getStatusBadge = (status: Article["status"]) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-100 text-green-800">Publié</Badge>;
      case "draft":
        return <Badge variant="secondary">Brouillon</Badge>;
    }
  };

  // Helpers éditeur Markdown
  const insertMd = (type: 'bold' | 'italic' | 'image' | 'link' | 'list' | 'h2' | 'h3' | 'table' | 'quote' | 'code') => {
    const snippets: Record<string, string> = {
      bold: "**texte en gras**",
      italic: "*texte en italique*",
      image: "![texte alternatif](https://url-de-votre-image.jpg)",
      link: "[texte du lien](https://exemple.com)",
      list: "- élément de liste\n- autre élément",
      h2: "## Titre niveau 2",
      h3: "### Titre niveau 3", 
      table: "| Colonne 1 | Colonne 2 |\n|-----------|----------|\n| Valeur 1  | Valeur 2  |",
      quote: "> Citation ou remarque importante",
      code: "```\ncode ici\n```"
    };
    
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      
      let insertText = snippets[type];
      
      // Si du texte est sélectionné, l'entourer avec le formatage
      if (selectedText && (type === 'bold' || type === 'italic')) {
        insertText = type === 'bold' ? `**${selectedText}**` : `*${selectedText}*`;
      } else if (selectedText && type === 'link') {
        insertText = `[${selectedText}](https://exemple.com)`;
      }
      
      const newValue = textarea.value.substring(0, start) + insertText + textarea.value.substring(end);
      setArticleForm(prev => ({ ...prev, content: newValue }));
      
      // Remettre le focus et la sélection
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + insertText.length, start + insertText.length);
      }, 10);
    } else {
      // Fallback si pas de textarea trouvée
      const insertText = snippets[type];
      setArticleForm((prev) => ({ ...prev, content: `${prev.content}\n\n${insertText}` }));
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
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Nouvel article</DialogTitle>
              <DialogDescription>Créez un nouvel article pour votre blog</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 overflow-y-auto flex-1 pr-2">
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
              <div>
                <Label htmlFor="imageUrl">Image d'en-tête (URL)</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={articleForm.imageUrl}
                  onChange={(e) => setArticleForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="https://exemple.com/image.jpg"
                />
                {articleForm.imageUrl && (
                  <div className="mt-2">
                    <img 
                      src={articleForm.imageUrl} 
                      alt="Prévisualisation" 
                      className="w-full h-32 object-cover rounded-md border"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
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
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="content">Contenu *</Label>
                {/* Toolbar Markdown */}
                <div className="flex gap-2 mt-2 flex-wrap">
                  <Button type="button" variant="outline" size="sm" onClick={() => insertMd('bold')} title="Gras">
                    <strong>B</strong>
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => insertMd('italic')} title="Italique">
                    <em>I</em>
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => insertMd('h2')} title="Titre H2">
                    H2
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => insertMd('h3')} title="Titre H3">
                    H3
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => insertMd('list')} title="Liste">
                    ••
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => insertMd('table')} title="Tableau">
                    ⊞
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => insertMd('link')} title="Lien">
                    🔗
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => insertMd('image')} title="Image">
                    🖼️
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => insertMd('quote')} title="Citation">
                    "
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => insertMd('code')} title="Code">
                    &lt;/&gt;
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <Textarea
                    id="content"
                    value={articleForm.content}
                    onChange={(e) => setArticleForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Utilisez la syntaxe Markdown pour le gras (**bold**), italique (*italic*), images ![alt](url), listes, etc."
                    rows={12}
                  />
                  <div className="border rounded-md p-3 bg-muted/30 overflow-y-auto max-h-96">
                    <div className="text-sm text-muted-foreground mb-2">Aperçu</div>
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{articleForm.content || "Prévisualisation du contenu..."}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0 pt-4 border-t">
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
                      {new Date(article.publishedAt || article.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                    <span>Par {article.author}</span>
                  </div>
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => togglePublish(article)}>
                    {article.status === 'published' ? 'Dépublier' : 'Publier'}
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4 mr-1" />
                    Modifier
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link to={`/blog/${article.slug}`} target="_blank">
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