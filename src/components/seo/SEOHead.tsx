import React from 'react';
import { Helmet } from 'react-helmet-async';
import type { SEOProps } from '../../types/seo';

interface SEOHeadProps extends SEOProps {
  children?: React.ReactNode;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'New Living Design GmbH | Interior Design & Sanitäre Lösungen',
  description = 'New Living Design GmbH – Ihr Partner für Bodenbeläge, Badezimmermöbel, Sanitärinstallationen und Designlösungen. Modernes Interior Design aus der Schweiz.',
  keywords = 'Interior Design, Bodenbeläge, Badezimmermöbel, Sanitär, Schweiz, New Living Design, Badezimmer, Fliesen, Keramik, Luxus Badezimmer, Sanitärinstallation, Innenarchitektur',
  image = 'https://www.newlivingdesign.ch/src/assets/og-image.jpg',
  url = 'https://www.newlivingdesign.ch',
  type = 'website',
  structuredData,
  canonical,
  noindex = false,
  nofollow = false,
  children
}) => {
  const fullTitle = title.includes('New Living Design') ? title : `${title} | New Living Design GmbH`;
  const fullUrl = url.startsWith('http') ? url : `https://www.newlivingdesign.ch${url}`;
  const canonicalUrl = canonical || fullUrl;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Robots */}
      {(noindex || nofollow) && (
        <meta name="robots" content={`${noindex ? 'noindex' : 'index'},${nofollow ? 'nofollow' : 'follow'}`} />
      )}
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="New Living Design GmbH" />
      <meta property="og:locale" content="de_CH" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional SEO Meta Tags */}
      <meta name="author" content="New Living Design GmbH" />
      <meta name="publisher" content="New Living Design GmbH" />
      <meta name="language" content="de" />
      <meta name="geo.region" content="CH" />
      <meta name="geo.placename" content="Schweiz" />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
      
      {children}
    </Helmet>
  );
};

export default SEOHead;