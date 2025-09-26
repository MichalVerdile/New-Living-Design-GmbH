import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Header, Footer, Home, Products, Services, About, Contact, Booking, DataSecurity, Impressum, AGB } from './components';
import './App.css';
import ScrollToTop from './components/scroll-helper/ScrollToTop';
import Partners from './pages/partners/Partners';
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import SEOHead from './components/seo/SEOHead';
import CookieBanner from './components/cookie/CookieBanner';
import { generateOrganizationStructuredData, generateWebsiteStructuredData } from './utils/structuredData';


function App() {
  const organizationData = generateOrganizationStructuredData();
  const websiteData = generateWebsiteStructuredData();
  
  const globalStructuredData = [organizationData, websiteData];

  return (
    <HelmetProvider>
      <div className="app">
        <SEOHead structuredData={globalStructuredData} />
        
        <Router>
          <ScrollToTop />
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
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
        </Router>
        
        {/* Vercel Analytics */}
        <Analytics />
        <SpeedInsights />
        
        {/* Cookie Banner for GDPR Compliance */}
        <CookieBanner />
      </div>
    </HelmetProvider>
  );
}

export default App;
