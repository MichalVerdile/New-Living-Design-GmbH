import type { LocalBusinessSEO, ProductSEO, ServiceSEO, BreadcrumbItem } from '../types/seo';

export const generateOrganizationStructuredData = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "New Living Design GmbH",
  "url": "https://www.newlivingdesign.ch",
  "logo": "https://www.newlivingdesign.ch/src/assets/logo.png",
  "description": "New Living Design GmbH – Ihr Partner für hochwertige Interior- und Sanitärlösungen in der Schweiz. Spezialisiert auf Bodenbeläge, Badezimmermöbel und Sanitärinstallationen.",
  "sameAs": [
    "https://www.facebook.com/newlivingdesign",
    "https://www.instagram.com/newlivingdesign"
  ],
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "CH",
    "addressLocality": "Schweiz"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "availableLanguage": ["de", "en"]
  }
});

export const generateLocalBusinessStructuredData = (business: LocalBusinessSEO) => ({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": business.url,
  "name": business.name,
  "description": business.description,
  "url": business.url,
  "telephone": business.telephone,
  "priceRange": business.priceRange,
  "image": business.image,
  "address": {
    "@type": "PostalAddress",
    "streetAddress": business.address.streetAddress,
    "addressLocality": business.address.addressLocality,
    "addressRegion": business.address.addressRegion,
    "postalCode": business.address.postalCode,
    "addressCountry": business.address.addressCountry
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": business.geo.latitude,
    "longitude": business.geo.longitude
  },
  "openingHoursSpecification": business.openingHours.map(hours => ({
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": hours
  }))
});

export const generateProductStructuredData = (product: ProductSEO) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": product.title || "Produkt",
  "description": product.description,
  "image": product.image,
  "url": product.url,
  ...(product.brand && { "brand": { "@type": "Brand", "name": product.brand } }),
  ...(product.sku && { "sku": product.sku }),
  ...(product.category && { "category": product.category }),
  ...(product.price && {
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "CHF",
      "availability": `https://schema.org/${product.availability || 'InStock'}`,
      "seller": {
        "@type": "Organization",
        "name": "New Living Design GmbH"
      }
    }
  })
});

export const generateServiceStructuredData = (service: ServiceSEO) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "name": service.title || "Dienstleistung",
  "description": service.description,
  "url": service.url,
  ...(service.serviceType && { "serviceType": service.serviceType }),
  ...(service.areaServed && { "areaServed": service.areaServed }),
  "provider": {
    "@type": "Organization",
    "name": service.provider?.name || "New Living Design GmbH",
    "url": service.provider?.url || "https://www.newlivingdesign.ch"
  }
});

export const generateBreadcrumbStructuredData = (breadcrumbs: BreadcrumbItem[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": breadcrumbs.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url.startsWith('http') ? item.url : `https://www.newlivingdesign.ch${item.url}`
  }))
});

export const generateWebsiteStructuredData = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "New Living Design GmbH",
  "url": "https://www.newlivingdesign.ch",
  "description": "Ihr Partner für hochwertige Interior- und Sanitärlösungen in der Schweiz",
  "inLanguage": "de-CH",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://www.newlivingdesign.ch/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
});

export const generateFAQStructuredData = (faqs: { question: string; answer: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});