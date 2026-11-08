import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/header/Header';
import Footer from './components/footer/Footer';
import Home from './pages/home/Home';
import PageExperience from './components/scroll-helper/PageExperience';
import './App.css';
import ScrollToTop from './components/scroll-helper/ScrollToTop';
import NotFound from './pages/not-found/NotFound';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import SEOHead from './components/seo/SEOHead';
import CookieBanner from './components/cookie/CookieBanner';
import WhatsAppButton from './components/whatsapp/WhatsAppButton';
import { generateOrganizationStructuredData, generateWebsiteStructuredData } from './utils/structuredData';
import RouteTracker from './components/analytics/RouteTracker';
import { initTrackingFromConsent, installLeadClickTracking } from './utils/tracking';

const Products = lazy(() => import('./pages/products/Products'));
const Services = lazy(() => import('./pages/services/Services'));
const About = lazy(() => import('./pages/about/About'));
const Contact = lazy(() => import('./pages/contact/Contact'));
const Booking = lazy(() => import('./pages/book-online/Booking'));
const DataSecurity = lazy(() => import('./pages/data-security/DataSecurity'));
const Impressum = lazy(() => import('./pages/impressum/Impressum'));
const AGB = lazy(() => import('./pages/agb/Agb'));
const Badumbau = lazy(() => import('./pages/badumbau/Badumbau'));
const Badplaner = lazy(() => import('./pages/badplaner/Badplaner'));
const Referenzen = lazy(() => import('./pages/referenzen/Referenzen'));
const Blog = lazy(() => import('./pages/blog/Blog'));
const BlogPost = lazy(() => import('./pages/blog/BlogPost'));
const Partners = lazy(() => import('./pages/partners/Partners'));
const CategoryPage = lazy(() => import('./pages/catalog/CategoryPage'));
const SupplierPage = lazy(() => import('./pages/catalog/SupplierPage'));

/**
 * Die App ohne Router und ohne HelmetProvider: beides setzt der Einstieg,
 * main.tsx (Browser) bzw. entry-server.tsx (statisches Prerendering).
 */
function App() {
  const { pathname } = useLocation();
  useEffect(() => {
    initTrackingFromConsent();
    installLeadClickTracking();
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
      <Suspense fallback={<main id="main-content" className="page-loading" aria-busy="true"><p role="status">Seite wird geladen …</p></main>}>
      <PageExperience key={pathname}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/badumbau-zofingen" element={<Badumbau />} />
        <Route path="/badplaner" element={<Badplaner />} />
        <Route path="/referenzen" element={<Referenzen />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/produkte" element={<Products />} />
        <Route path="/produkte/:area" element={<CategoryPage />} />
        <Route path="/produkte/:area/:supplier" element={<SupplierPage />} />
        <Route path="/dienstleistungen" element={<Services />} />
        <Route path="/partner" element={<Partners />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/ueber-uns" element={<About />} />
        <Route path="/kontakt" element={<Contact />} />
        <Route path="/datenschutz" element={<DataSecurity />} />
        <Route path="/impressum" element={<Impressum />} />
        <Route path="/agb" element={<AGB />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </PageExperience>
      </Suspense>
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
