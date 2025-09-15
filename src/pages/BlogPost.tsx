import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, User, ArrowLeft, BookOpen } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
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
  author: string;
  publishedAt: string;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticle = async () => {
      if (!slug) return;
      
      try {
        const post = await apiService.getBlogPost(slug);
        setArticle(post);
      } catch (error) {
        console.error('Erreur chargement article:', error);
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [slug]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-mystique-start to-mystique-end flex items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Chargement de l'article...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!article) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-mystique-start to-mystique-end flex items-center justify-center">
          <Card className="max-w-md mx-auto text-center p-8">
            <CardContent>
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Article non trouvé</h2>
              <Button asChild>
                <Link to="/blog">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour au blog
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEO 
        title={`${article.title} - Renaissance by Steph`}
        description={article.excerpt}
        type="article"
        publishedTime={article.publishedAt}
        author={article.author}
      />
      <Header />
      
      <article className="min-h-screen bg-gradient-to-br from-mystique-start to-mystique-end">
        {/* Image d'en-tête */}
        {article.imageUrl && (
          <section className="relative h-96 overflow-hidden">
            <img 
              src={article.imageUrl} 
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40"></div>
          </section>
        )}
        
        <section className="relative py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <nav className="mb-8">
              <Button variant="ghost" asChild className="text-white hover:bg-white/10">
                <Link to="/blog">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour au blog
                </Link>
              </Button>
            </nav>
            
            {/* Titre et métadonnées toujours visibles dans le contenu */}
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <Card className="shadow-xl">
              <CardContent className="p-8 md:p-12">
                <header className="mb-8 text-center">
                  <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">{article.title}</h1>
                  <div className="flex items-center justify-center gap-6 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{article.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(article.publishedAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </header>
                <div className="prose prose-lg max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.content}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </article>
      
      <Footer />
    </>
  );
};

export default BlogPost;