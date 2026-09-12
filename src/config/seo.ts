import { business } from './business';

// SEO and analytics configuration
export const seoConfig = {
  // Google Analytics
  googleAnalyticsId: import.meta.env.VITE_GOOGLE_ANALYTICS_ID || business.ga4MeasurementId,
  
  // Google Tag Manager
  googleTagManagerId: import.meta.env.VITE_GOOGLE_TAG_MANAGER_ID || '',
  
  // Facebook Pixel
  facebookPixelId: import.meta.env.VITE_FACEBOOK_PIXEL_ID || business.metaPixelId,
  
  // Site information
  siteUrl: 'https://newlivingdesign.ch',
  siteName: 'New Living Design GmbH',
  defaultImage: '/og-image.jpg',
  
  // Company information
  company: {
    name: 'New Living Design GmbH',
    address: {
      street: business.address.street,
      city: business.address.city,
      state: business.address.regionName,
      zip: business.address.zip,
      country: business.address.country
    },
    phone: business.phone.e164,
    email: business.email,
    socialMedia: {
      facebook: business.social.facebook,
      instagram: business.social.instagram,
      linkedin: business.social.linkedin
    }
  },
  
  // SEO keywords by page
  keywords: {
    home: 'Interior Design, Innenarchitektur, Badezimmer, Küchen, Renovierung, Zofingen, Aargau, Schweiz, New Living Design, Sanitär, Bodenbeläge',
    products: 'Badezimmermöbel, Küchenmöbel, Armaturen, Sanitärapparate, Bodenbeläge, Wandverkleidungen, Heizkörper, Wellness, Accessoires, Schweiz',
    services: 'Beratung, Planung, Installation, Renovation, Badezimmer Renovation, Küchen Planung, Interior Design Service, Schweiz',
    about: 'New Living Design Team, Über uns, Innenarchitektur Experten, Badezimmer Spezialisten, Schweiz',
    contact: 'Kontakt, New Living Design, Zofingen, Beratungstermin, Interior Design Beratung, Schweiz'
  }
};

// Utility function to get page-specific keywords
export const getPageKeywords = (page: keyof typeof seoConfig.keywords): string => {
  return seoConfig.keywords[page] || seoConfig.keywords.home;
};

// Utility function to generate page URL
export const getPageUrl = (path: string): string => {
  return `${seoConfig.siteUrl}${path}`;
};