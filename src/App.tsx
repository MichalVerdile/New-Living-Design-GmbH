import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header, Footer, Home, Products, Services, About, Contact, Booking, DataSecurity, Impressum, AGB } from './components';
import './App.css';
import ScrollToTop from './components/scroll-helper/ScrollToTop';
import Partners from './components/partners/Partners';
import { Analytics } from "@vercel/analytics/react";


function App() {
  return (
    <div className="app">
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
          {<Route path="/agb" element={<AGB />} />}
        </Routes>
        <Footer />
      </Router>
      <Analytics />
    </div>
  );
}

export default App;
