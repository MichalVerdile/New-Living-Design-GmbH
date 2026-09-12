import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Header, Footer, Home, Products, Services, About, Contact, Booking, DataSecurity, Impressum, AGB, Badumbau, Referenzen } from './components';
import './App.css';
import ScrollToTop from './components/scroll-helper/ScrollToTop';
import Partners from './pages/partners/Partners';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import SEOHead from './components/seo/SEOHead';
import CookieBanner from './components/cookie/CookieBanner';
import WhatsAppButton from './components/whatsapp/WhatsAppButton';
import { generateOrganizationStructuredData, generateWebsiteStructuredData } from './utils/structuredData';
import RouteTracker from './components/analytics/RouteTracker';
import { initTrackingFromConsent } from './utils/tracking';

/**
 * Die App ohne Router und ohne HelmetProvider: beides setzt der Einstieg,
 * main.tsx (Browser) bzw. entry-server.tsx (statisches Prerendering).
 */
function App() {
  useEffect(() => {
    initTrackingFromConsent();
  }, []);

  const organizationData = generateOrganizationStructuredData();
  const websiteData = generateWebsiteStructuredData();

  const globalStructuredData = [organizationData, websiteData];

  return (
    <div className="app">
      <SEOHead structuredData={globalStructuredData} />

      <ScrollToTop />
      <RouteTracker />
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/badumbau-zofingen" element={<Badumbau />} />
        <Route path="/referenzen" element={<Referenzen />} />
        <Route path="/produkte" element={<Products />} />
        <Route path="/dienstleistungen" element={<Services />} />
        <Route path="/partner" element={<Partners />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/ueber-uns" element={<About />} />
        <Route path="/kontakt" element={<Contact />} />
        <Route path="/datenschutz" element={<DataSecurity />} />
        <Route path="/impressum" element={<Impressum />} />
        <Route path="/agb" element={<AGB />} />
      </Routes>
      <Footer />

      {/* Vercel Analytics */}
      <Analytics />
      <SpeedInsights />

      {/* Cookie Banner for GDPR Compliance */}
      <CookieBanner />
      <WhatsAppButton />
    </div>
  );
}

export default App;
