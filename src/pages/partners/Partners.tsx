import React from "react";
import styles from "./Partners.module.css";
import heroImg from "../../assets/shutterstock_2580645597.jpg";

import scarabeoLogo from "../../assets/LogoScarabeo_Bianco.png";
import fimaLogo from "../../assets/logo.svg";
import lavastoneLogo from "../../assets/LAVASTONE.avif";
import dosemLogo from "../../assets/logo.png";
import rexaLogo from "../../assets/Rexa prova.avif";
import inkiostroLogo from "../../assets/inkiostrobianco.avif";
import laminamLogo from "../../assets/laminam.avif";
import newformLogo from "../../assets/logo (1).png";
import acquarioLogo from "../../assets/new_logo_acquariodue_nero_tiff.avif";
import naiciLogo from "../../assets/logoNaici-2024-450x144_2vy550ra.png";
import cavalliLogo from "../../assets/robertocavallihomeinteriors-logo.e54c5509.svg";
import lamborghiniLogo from "../../assets/cropped-lamborghini-logo-total-living-negative.png";
import sicisLogo from "../../assets/logo (2).png";
import { Helmet } from "react-helmet-async";

type Partner = {
  name: string;
  logo: string;
  url: string;
};

const partners: Partner[] = [
  { name: "SCARABEO", logo: scarabeoLogo, url: "https://scarabeoceramiche.it/" },
  { name: "Fima", logo: fimaLogo, url: "https://fimacf.com/" },
  { name: "Lavastone", logo: lavastoneLogo, url: "https://www.lavastone-official.com/" },
  { name: "Dosem Ceramiche", logo: dosemLogo, url: "https://www.dosemceramiche.it/" },
  { name: "Rexa", logo: rexaLogo, url: "https://rexadesign.it/" },
  { name: "Inkiostro Bianco", logo: inkiostroLogo, url: "https://www.inkiostrobianco.com/" },
  { name: "Laminam", logo: laminamLogo, url: "https://www.laminam.com/de/" },
  { name: "Newform", logo: newformLogo, url: "https://www.newform.it/" },
  { name: "Acquario Due", logo: acquarioLogo, url: "https://de.acquariodue.com/" },
  { name: "Naici", logo: naiciLogo, url: "https://www.naici.it/" },
  { name: "Roberto Cavalli Home Interiors", logo: cavalliLogo, url: "https://robertocavallihomeinteriors.onirogroup.it/" },
  { name: "Tonino Lamborghini", logo: lamborghiniLogo, url: "https://lamborghini-surfaces.com/" },
  { name: "Sicis", logo: sicisLogo, url: "https://www.sicis.com/GLOBAL/en/" },
];

const Partners: React.FC = () => {
  return (
    <main className={styles["partners-page"]}>
      <Helmet>
        <title>Partner & Marken – New Living Design GmbH</title>
        <meta
          name="description"
          content="Exklusive Partner von New Living Design: Scarabeo, Fima, Rexa, Laminam, Roberto Cavalli Home Interiors, Lamborghini Surfaces und viele mehr."
        />
        <meta property="og:title" content="Unsere Partner & Marken – New Living Design GmbH" />
        <meta property="og:description" content="Ausgewählte Premium-Marken für Innenarchitektur, Badezimmer, Küchen und Designmöbel." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.newlivingdesign.ch/partner" />
        <meta property="og:image" content="https://www.newlivingdesign.ch/assets/shutterstock_2580645597.jpg" />
      </Helmet>

      {/* Hero */}
      <section className={styles["partners-hero"]}>
        <div className={styles["hero-background"]}>
          <img
            src={heroImg}
            alt="Showroom – Partner & Marken"
            className={styles["hero-bg-image"]}
          />
        </div>
        <div className={styles["hero-overlay"]} />

        <div className={styles["partners-hero-container"]}>
          <h1 className={styles["partners-title"]}>
            <span className={styles["title-line"]}>Vertrauen durch Zusammenarbeit</span>
            <span className={styles["title-highlight"]}>Unsere Partner</span>
          </h1>
          <p className={styles["partners-subtitle"]}>
            Ausgewählte Marken für Qualität, Design und Langlebigkeit.
          </p>
          <div className={styles["hero-scroll-indicator"]}>
            <div className={styles["scroll-dot"]}></div>
            <span>Scrollen Sie nach unten</span>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className={styles["partners-section"]}>
        <div className={styles["partners-container"]}>
          <div className={styles["partners-grid"]}>
            {partners.map((p) => (
              <article key={p.name} className={styles["partner-card"]} title={p.name}>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles["partner-link"]}
                  aria-label={`${p.name} – Website öffnen`}
                >
                  <div className={styles["partner-logo-wrap"]}>
                    <img
                      src={p.logo}
                      alt={p.name}
                      className={styles["partner-logo"]}
                      loading="lazy"
                    />
                  </div>
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "Partner & Marken von New Living Design",
          "itemListElement": partners.map((p, i) => ({
            "@type": "Organization",
            "position": i + 1,
            "name": p.name,
            "url": p.url,
            "logo": `https://www.newlivingdesign.ch/assets/${p.logo}`
          }))
        })}
      </script>
    </main>
  );
};

export default Partners;
