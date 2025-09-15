import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Eye, User, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  status: "published" | "draft" | "archived" | "scheduled";
  category: string;
  publishDate: string;
  author: string;
  views: number;
}

const BlogPost = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("blogArticles");
    if (saved) {
      try {
        const list: Article[] = JSON.parse(saved);
        const found = list.find((a) => a.id === id && a.status === "published");
        if (found) {
          setArticle(found);
          document.title = `${found.title} • Blog`;
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      }
    } else {
      setNotFound(true);
    }
  }, [id]);

  const formattedDate = useMemo(() => {
    if (!article?.publishDate) return "";
    return new Date(article.publishDate).toLocaleDateString("fr-FR");
  }, [article?.publishDate]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-mystique-start to-mystique-end">
        <section className="py-10 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="mb-6">
              <Button variant="outline" asChild>
                <Link to="/blog">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour au blog
                </Link>
              </Button>
            </div>

            {notFound && (
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle>Article introuvable</CardTitle>
                </CardHeader>
                <CardContent>
                  Cet article n'existe pas ou n'est pas publié.
                </CardContent>
              </Card>
            )}

            {article && (
              <Card className="overflow-hidden bg-white">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="bg-gradient-mystique text-white">
                      {article.category}
                    </Badge>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {article.author}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formattedDate}
                      </span>
                      <span className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {article.views} vues
                      </span>
                    </div>
                  </div>
                  <CardTitle className="text-3xl leading-tight">
                    {article.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-neutral max-w-none">
                    {article.excerpt && (
                      <p className="text-lg text-muted-foreground mb-6">{article.excerpt}</p>
                    )}
                    {article.content.split("\n\n").map((para, idx) => (
                      <p key={idx} className="mb-4">
                        {para}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default BlogPost;
