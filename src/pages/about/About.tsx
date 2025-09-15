import React from "react";
import styles from "./About.module.css";
import heroImg from "../../assets/shutterstock_2600582595.jpg";
import { Helmet } from "react-helmet-async";

const cx = (...classes: Array<string | false | undefined>) =>
  classes.filter(Boolean).join(" ");

const About: React.FC = () => {
  return (
    <main className={styles.about}>
      <Helmet>
        <title>Über uns | New Living Design GmbH</title>
        <meta
          name="description"
          content="Lernen Sie die New Living Design GmbH kennen – familiengeführt, mit Showroom in Zofingen (AG). Wir stehen für Qualität, persönliche Beratung und zuverlässige Innenausstattung."
        />
        <meta property="og:title" content="Über uns | New Living Design GmbH" />
        <meta
          property="og:description"
          content="Familiengeführt, qualitätsverliebt und mit klarer Vision: Erfahren Sie mehr über die Geschichte und Werte der New Living Design GmbH."
        />
        <meta property="og:image" content={heroImg} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.newlivingdesign.ch/ueber-uns" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Über uns | New Living Design GmbH" />
        <meta
          name="twitter:description"
          content="Innenausstattung mit Herz: Unsere Geschichte, Werte und Kontaktinformationen."
        />
        <meta name="twitter:image" content={heroImg} />

        {/* Local Business Schema.org */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "New Living Design GmbH",
            "image": "https://www.newlivingdesign.ch" + heroImg,
            "url": "https://www.newlivingdesign.ch/ueber-uns",
            "telephone": "+41766051307",
            "email": "emanuel.verdile@newlivingdesign.ch",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Im Römerquartier 4A",
              "postalCode": "4800",
              "addressLocality": "Zofingen",
              "addressCountry": "CH"
            },
            "openingHoursSpecification": [
              {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday"
                ],
                "opens": "08:00",
                "closes": "18:00"
              },
              {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": "Saturday",
                "opens": "09:00",
                "closes": "12:00"
              }
            ]
          })}
        </script>
      </Helmet>
      
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles["hero-background"]}>
          <div className={styles["hero-overlay"]}></div>
          <img
            src={heroImg}
            alt="Showroom / Innenausstattung"
            className={styles["hero-bg-image"]}
          />
        </div>

        <div className={styles["hero-container"]}>
          <div className={styles["hero-content"]}>
            <h1 className={styles["hero-title"]}>
              <span className={styles["title-highlight"]}>Über uns</span>
            </h1>
            <p className={styles["hero-subtitle"]}>
              Familiengeführt, qualitätsverliebt und mit klarer Vision: Innenausstattung,
              die lange Freude macht.
            </p>
          </div>
          <div className={styles["hero-scroll-indicator"]}>
            <div className={styles["scroll-dot"]}></div>
            <span>Scrollen Sie nach unten</span>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className={cx(styles.section, styles.dark)}>
        <div className={styles.container}>
          <div className={cx(styles["section-header"], styles.centered)}>
            <span className={styles["section-label"]}>Unsere Geschichte</span>
            <h2 className={styles["section-title"]}>Von der Fliese zum Full-Interior</h2>
          </div>

          <div className={styles.grid}>
            <article className={styles.card}>
              <h3>Wurzeln</h3>
              <p>
                Die New Living Design startete als Fliesenlegerfirma und hat sich Schritt
                für Schritt auf den Verkauf hochwertiger Innenausstattungs-Produkte
                spezialisiert.
              </p>
            </article>

            <article className={styles.card}>
              <h3>Showroom & Nähe</h3>
              <p>
                Mit der Zeit kam ein eigener Ausstellungsraum in <strong>Zofingen (AG) </strong>
                hinzu, damit Kundinnen und Kunden Materialien und Oberflächen live erleben
                können. Als <strong>Familienunternehmen</strong> legen wir Wert auf persönliche
                Beratung und eine Atmosphäre zum Wohlfühlen.
              </p>
            </article>

            <article className={styles.card}>
              <h3>Ausblick</h3>
              <p>
                Die New Living Design arbeitet an neuen Konzepten, weitere Ausstellungsräume in der Schweiz
                sind in Planung, um noch näher bei den Projekten zu sein.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Fakten */}
      <section className={cx(styles.section, styles.light)}>
        <div className={styles.container}>
          <div className={cx(styles["section-header"], styles.centered)}>
            <span className={styles["section-label"]}>Zahlen & Fakten</span>
            <h2 className={styles["section-title"]}>Das Wichtigste kompakt</h2>
          </div>

          <div className={styles.facts}>
            <div className={styles.fact}>
              <div className={styles["fact-badge"]}>2023</div>
              <div className={styles["fact-content"]}>
                <h4>Gründung der GmbH</h4>
                <p>Eintrag im Handelsregister des Kantons Aargau.</p>
              </div>
            </div>

            <div className={styles.fact}>
              <div className={styles["fact-badge"]}>Leitung</div>
              <div className={styles["fact-content"]}>
                <h4>Diego Verdile</h4>
                <p>Geschäftsführung.</p>
              </div>
            </div>

            <div className={styles.fact}>
              <div className={styles["fact-badge"]}> Showroom </div>
              <div className={styles["fact-content"]}>
                <h4>Zofingen (AG)</h4>
                <p>Ausstellungsraum für Materialien & Lösungen.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Werte */}
      <section className={cx(styles.section, styles.dark)}>
        <div className={styles.container}>
          <div className={cx(styles["section-header"], styles.centered)}>
            <span className={styles["section-label"]}>Wofür wir stehen</span>
            <h2 className={styles["section-title"]}>Unsere Werte</h2>
          </div>

          <div className={styles.values}>
            <div className={styles["value-item"]}>
              <div className={styles["value-icon"]}>
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h4>Qualität</h4>
              <p>Ausgewählte Produkte, saubere Ausführung, langlebige Ergebnisse.</p>
            </div>

            <div className={styles["value-item"]}>
              <div className={styles["value-icon"]}>
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <h4>Persönliche Beratung</h4>
              <p>Familiengeführt, wir nehmen uns Zeit und bleiben nah am Projekt.</p>
            </div>

            <div className={styles["value-item"]}>
              <div className={styles["value-icon"]}>
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M3 12h6l3 7 3-14 3 7h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h4>Zuverlässigkeit</h4>
              <p>Planbar in Timing, Budget und Kommunikation, vom Erstkontakt bis Montage.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Kontakt & Öffnungszeiten */}
      <section className={cx(styles.section, styles.light)}>
        <div className={styles.container}>
          <div className={styles["contact-wrap"]}>
            <div className={styles["contact-block"]}>
              <h3>Kontakt</h3>
              <p className={styles["contact-lines"]}>
                New Living Design GmbH<br />
                Im Römerquartier 4A<br />
                4800 Zofingen<br />
                <a href="tel:+41766051307">+41 76 605 13 07</a><br />
                <a href="mailto:emanuel.verdile@newlivingdesign.ch">emanuel.verdile@newlivingdesign.ch</a>
              </p>
            </div>

            <div className={styles["hours-block"]}>
              <h3>Öffnungszeiten</h3>
              <ul>
                <li><span>Mo–Fr</span><span>08:00–12:00 / 14:00–18:00</span></li>
                <li><span>Samstag</span><span>09:00–12:00</span></li>
                <li><span>Sonntag</span><span>Geschlossen</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;
