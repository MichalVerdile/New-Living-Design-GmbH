// SEO and analytics configuration
export const seoConfig = {
  // Google Analytics
  googleAnalyticsId: import.meta.env.VITE_GOOGLE_ANALYTICS_ID || 'G-KX239CT54D',
  
  // Google Tag Manager
  googleTagManagerId: import.meta.env.VITE_GOOGLE_TAG_MANAGER_ID || '',
  
  // Facebook Pixel
  facebookPixelId: import.meta.env.VITE_FACEBOOK_PIXEL_ID || '',
  
  // Site information
  siteUrl: 'https://www.newlivingdesign.ch',
  siteName: 'New Living Design GmbH',
  defaultImage: '/src/assets/og-image-default.jpg',
  
  // Company information
  company: {
    name: 'New Living Design GmbH',
    address: {
      street: 'Musterstraße 123', // Replace with actual address
      city: 'Zofingen',
      state: 'Aargau',
      zip: '4800',
      country: 'CH'
    },
    phone: '+41-XX-XXX-XX-XX', // Replace with actual phone
    email: 'info@newlivingdesign.ch',
    socialMedia: {
      facebook: 'https://www.facebook.com/newlivingdesign',
      instagram: 'https://www.instagram.com/newlivingdesign',
      linkedin: ''
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