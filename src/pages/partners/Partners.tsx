import React from "react";
import styles from "./Partners.module.css";
import heroImg from "../../assets/shutterstock_2580645597.webp";
import { Link } from "react-router-dom";
import PageIntro from "../../components/layout/PageIntro";
import { Helmet } from "react-helmet-async";
import SupplierDirectory from "../../components/suppliers/SupplierDirectory";
import { suppliers } from "../../data/suppliers";


const Partners: React.FC = () => {
  return (
    <main id="main-content" className={styles["partners-page"]}>
      <Helmet>
        <title>Marken & Partner | New Living Design Zofingen</title>
        <link rel="canonical" href="https://newlivingdesign.ch/partner" />
        <meta
          name="description"
          content="Ausgewählte Marken für Bad, Armaturen, Platten, Oberflächen und Interior Design. Verfügbarkeit und passende Produkte klären wir persönlich."
        />
        <meta property="og:title" content="Marken & Partner – New Living Design GmbH" />
        <meta property="og:description" content="Marken und Sortimente, aus denen wir eine passende Auswahl für Ihr Projekt zusammenstellen." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://newlivingdesign.ch/partner" />
        <meta property="og:image" content={`https://newlivingdesign.ch${heroImg}`} />
      </Helmet>

      <PageIntro eyebrow="Unsere Marken & Partner" title="Gute Materialien. Passend ausgewählt." description="Wir arbeiten mit ausgewählten Marken für Bad, Küchen, Platten und Wellness. Welche Produkte verfügbar sind und sich für Ihren Raum eignen, klären wir persönlich mit Ihnen."><Link to="/produkte" className="nld-link">Zur Inspiration nach Fachbereich →</Link><Link to="/kontakt" className="nld-button">Beratung anfragen</Link></PageIntro>

      <section className={styles["partners-section"]} aria-label="Marken nach Bereich">
        <SupplierDirectory />
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "Partner & Marken von New Living Design",
          "itemListElement": suppliers.map((p, i) => ({
            "@type": "Organization",
            "position": i + 1,
            "name": p.name,
            "url": p.url
          }))
        }) }} />
    </main>
  );
};

export default Partners;
