import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, User, Search, Eye, Clock, Tag, BookOpen } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { apiService } from "@/lib/api";

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  imageUrl?: string;
  status: "published" | "draft";
  author: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

const Blog = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Articles par défaut (pour fallback)
  const defaultArticles: Article[] = [
    {
      id: "1",
      title: "Les Bienfaits de la Méditation Quotidienne",
      slug: "bienfaits-meditation-quotidienne",
      content: "La méditation est une pratique millénaire qui apporte de nombreux bienfaits pour le corps et l'esprit. Dans notre monde moderne, prendre quelques minutes chaque jour pour méditer peut transformer votre vie...",
      excerpt: "Découvrez comment la méditation quotidienne peut transformer votre bien-être physique et mental.",
      status: "published",
      publishedAt: "2024-01-15",
      author: "Stéphanie",
      createdAt: "2024-01-15",
      updatedAt: "2024-01-15"
    },
    {
      id: "2", 
      title: "Comprendre les Énergies lors d'une Séance de Reiki",
      slug: "comprendre-energies-reiki",
      content: "Le Reiki est une technique de guérison énergétique qui permet de rééquilibrer les chakras et d'harmoniser l'énergie vitale. Pendant une séance, plusieurs phénomènes peuvent se manifester...",
      excerpt: "Apprenez à reconnaître et comprendre les différentes sensations énergétiques durant une séance de Reiki.",
      status: "published",
      publishedAt: "2024-01-10",
      author: "Stéphanie",
      createdAt: "2024-01-10",
      updatedAt: "2024-01-10"
    },
    {
      id: "3",
      title: "L'Art de la Lecture des Cartes de Tarot",
      slug: "art-lecture-cartes-tarot",
      content: "Le tarot est un outil divinatoire puissant qui nous aide à comprendre notre passé, présent et futur. Chaque carte porte une symbolique riche et des messages profonds...",
      excerpt: "Plongez dans l'univers fascinant du tarot et découvrez les secrets de la lecture des cartes.",
      status: "published",
      publishedAt: "2024-01-05",
      author: "Stéphanie",
      createdAt: "2024-01-05",
      updatedAt: "2024-01-05"
    }
  ];

  // Charger les articles depuis l'API
  useEffect(() => {
    const loadArticles = async () => {
      try {
        console.log('🔄 Chargement des articles du blog...');
        const posts = await apiService.getBlogPosts();
        console.log('✅ Articles récupérés:', posts);
        setArticles(posts);
      } catch (error) {
        console.error('❌ Erreur chargement articles:', error);
        // Afficher l'erreur au lieu de fallback
        setArticles([]);
      }
    };
    
    loadArticles();
  }, []);

  const displayedArticles = articles;

  // Filtrer les articles selon la recherche
  const filteredArticles = displayedArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <>
      <SEO 
        title="Blog - Renaissance by Steph | Articles sur la Voyance et le Bien-être"
        description="Découvrez nos articles sur la voyance, le reiki, la spiritualité et le développement personnel. Conseils pratiques et enseignements spirituels par Stéphanie."
        keywords={["blog voyance", "articles reiki", "spiritualité", "développement personnel", "conseils bien-être", "tarot", "méditation"]}
      />
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-mystique-start to-mystique-end">
        {/* Hero Section */}
        <section className="relative py-20 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Blog Renaissance
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
              Découvrez mes conseils, réflexions et enseignements sur la voyance, 
              le bien-être et le développement spirituel.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            {/* Search and Filters */}
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-12">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un article..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              {/* Articles Count */}
              <p className="text-muted-foreground">
                {filteredArticles.length} article{filteredArticles.length > 1 ? "s" : ""} trouvé{filteredArticles.length > 1 ? "s" : ""}
              </p>
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((article) => (
                <Card key={article.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300 bg-white">
                  {/* Image d'en-tête */}
                  {article.imageUrl && (
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={article.imageUrl} 
                        alt={article.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  <CardHeader>
                    <CardTitle className="text-xl hover:text-primary transition-colors cursor-pointer line-clamp-2">
                      <Link to={`/blog/${article.slug}`}>
                        {article.title}
                      </Link>
                    </CardTitle>
                    <CardDescription className="line-clamp-3">
                      {article.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {article.author}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(article.publishedAt).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {article.content.substring(0, 150)}...
                    </p>
                    <Button className="w-full bg-gradient-mystique shadow-warm" asChild>
                      <Link to={`/blog/${article.slug}`}>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Lire l'article
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {filteredArticles.length === 0 && (
              <div className="text-center py-16">
                <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md mx-auto">
                  <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Aucun article trouvé</h3>
                  <p className="text-muted-foreground mb-4">
                    Essayez de modifier vos critères de recherche ou explorez une autre catégorie.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setSearchTerm("")}
                  >
                    Réinitialiser les filtres
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Blog;