import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  canonicalUrl?: string;
}

const SEO = ({
  title = "Renaissance by Steph - Voyance, Reiki et Guidance Spirituelle",
  description = "Découvrez mes services de voyance, séances de Reiki et guidance spirituelle. Tirage de cartes, divination au pendule et guérison énergétique avec Stéphanie, praticienne expérimentée.",
  keywords = [
    "voyance",
    "reiki", 
    "tarot",
    "pendule",
    "divination",
    "guidance spirituelle",
    "guérison énergétique",
    "développement personnel",
    "bien-être",
    "méditation",
    "chakras",
    "spiritualité"
  ],
  image = "/hero-mystique.jpg",
  type = "website",
  publishedTime,
  modifiedTime,
  author = "Stéphanie",
  canonicalUrl
}: SEOProps) => {
  const location = useLocation();
  const currentUrl = `${window.location.origin}${location.pathname}`;
  const finalCanonicalUrl = canonicalUrl || currentUrl;
  const finalImage = image.startsWith('http') ? image : `${window.location.origin}${image}`;

  useEffect(() => {
    // Titre de la page
    document.title = title.length > 60 ? title.substring(0, 57) + '...' : title;
    
    // Meta description
    const metaDescription = document.querySelector('meta[name="description"]') || 
                           document.createElement('meta');
    metaDescription.setAttribute('name', 'description');
    metaDescription.setAttribute('content', description.length > 160 ? description.substring(0, 157) + '...' : description);
    if (!document.querySelector('meta[name="description"]')) {
      document.head.appendChild(metaDescription);
    }

    // Meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]') || 
                        document.createElement('meta');
    metaKeywords.setAttribute('name', 'keywords');
    metaKeywords.setAttribute('content', keywords.join(', '));
    if (!document.querySelector('meta[name="keywords"]')) {
      document.head.appendChild(metaKeywords);
    }

    // Canonical URL
    const canonicalLink = document.querySelector('link[rel="canonical"]') || 
                         document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    canonicalLink.setAttribute('href', finalCanonicalUrl);
    if (!document.querySelector('link[rel="canonical"]')) {
      document.head.appendChild(canonicalLink);
    }

    // Open Graph tags
    const ogTags = [
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: finalImage },
      { property: 'og:url', content: currentUrl },
      { property: 'og:type', content: type },
      { property: 'og:site_name', content: 'Renaissance by Steph' },
      { property: 'og:locale', content: 'fr_FR' }
    ];

    if (publishedTime && type === 'article') {
      ogTags.push({ property: 'article:published_time', content: publishedTime });
    }
    if (modifiedTime && type === 'article') {
      ogTags.push({ property: 'article:modified_time', content: modifiedTime });
    }
    if (author && type === 'article') {
      ogTags.push({ property: 'article:author', content: author });
    }

    ogTags.forEach(({ property, content }) => {
      let metaTag = document.querySelector(`meta[property="${property}"]`);
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('property', property);
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute('content', content);
    });

    // Twitter Card tags
    const twitterTags = [
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: finalImage }
    ];

    twitterTags.forEach(({ name, content }) => {
      let metaTag = document.querySelector(`meta[name="${name}"]`);
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('name', name);
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute('content', content);
    });

    // JSON-LD Structured Data
    const structuredData = {
      "@context": "https://schema.org",
      "@type": type === 'article' ? "Article" : "Organization",
      ...(type === 'article' ? {
        "headline": title,
        "description": description,
        "image": finalImage,
        "author": {
          "@type": "Person",
          "name": author
        },
        "publisher": {
          "@type": "Organization",
          "name": "Renaissance by Steph",
          "logo": {
            "@type": "ImageObject",
            "url": `${window.location.origin}/logo.png`
          }
        },
        "datePublished": publishedTime,
        "dateModified": modifiedTime || publishedTime,
        "url": currentUrl
      } : {
        "name": "Renaissance by Steph",
        "description": description,
        "url": window.location.origin,
        "logo": `${window.location.origin}/logo.png`,
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "availableLanguage": "French"
        },
        "sameAs": [
          // Ajoutez vos réseaux sociaux ici
        ],
        "makesOffer": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Service",
              "name": "Voyance et Guidance Spirituelle",
              "description": "Services de voyance, tarot, reiki et développement spirituel"
            }
          }
        ]
      })
    };

    let scriptTag = document.querySelector('script[type="application/ld+json"]');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(structuredData);

  }, [title, description, keywords, finalImage, type, publishedTime, modifiedTime, author, currentUrl, finalCanonicalUrl]);

  return null;
};

export default SEO;