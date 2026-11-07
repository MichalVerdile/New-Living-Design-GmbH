import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Booking.module.css';

import beratungImage from '../../assets/shutterstock_2286698317.webp';
import heroImage from '../../assets/shutterstock_2336703843.webp';
import gallery1Image from '../../assets/2025-09-10.webp';
import gallery2Image from '../../assets/2025-09-10 (4).webp';
import gallery3Image from '../../assets/2025-09-10 (2).jpg';

import gallery4Image from '../../assets/2025-09-10 (3).webp';
import { Helmet } from 'react-helmet-async';

const galleryImages = [
  gallery1Image,
  gallery2Image,
  gallery3Image,
  gallery4Image
];

const Booking: React.FC = () => {

  return (
    <main id="main-content" className={styles.home}>
      
      {/* SEO Head */}
      <Helmet>
        <title>Beratung & Ausstellung in Zofingen | New Living Design</title>
        <link rel="canonical" href="https://newlivingdesign.ch/booking" />
        <meta
          name="description"
          content="Ausstellungsberatung in Zofingen oder Besichtigung vor Ort anfragen. Für Architekturbüros steht der Showroom auch für Kundentermine zur Verfügung."
        />
        <meta property="og:title" content="Beratung & Ausstellung | New Living Design GmbH" />
        <meta
          property="og:description"
          content="Produkte in der Ausstellung auswählen oder die bestehende Raumsituation bei Ihnen vor Ort klären."
        />
        <meta property="og:image" content={`https://newlivingdesign.ch${heroImage}`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://newlivingdesign.ch/booking" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Beratung & Ausstellung | New Living Design GmbH" />
        <meta
          name="twitter:description"
          content="Ausstellungsberatung, Besichtigung vor Ort oder Showroom-Termin für Architekturbüros anfragen."
        />
        <meta name="twitter:image" content={heroImage} />

        {/* Schema.org für LocalBusiness + Service */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "serviceType": "Interior Design Beratung",
            "provider": {
              "@type": "LocalBusiness",
              "name": "New Living Design GmbH",
              "image": "https://newlivingdesign.ch" + heroImage,
              "url": "https://newlivingdesign.ch/booking",
              "telephone": "+41625445854",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Im Römerquartier 4A",
                "postalCode": "4800",
                "addressLocality": "Zofingen",
                "addressCountry": "CH"
              }
            },
            "areaServed": { "@type": "Country", "name": "Schweiz" }
          })}
        </script>
      </Helmet>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles['hero-background']}>
          <div className={styles['hero-overlay']} />
          <img
            src={heroImage}
            alt="Stilvolles Bad – Beratung & Showroom"
            className={styles['hero-bg-image']}
          />
        </div>
        <div className={styles['hero-container']}>
          <div className={styles['hero-content']}>
            <h1 className={styles['hero-title']}>
              <span>Der passende Termin für Ihre nächste Entscheidung.</span>
            </h1>
            <div className={styles['hero-description']}>
              <p>
                Für die Produktauswahl treffen wir uns in der Ausstellung. Wenn Masse, Anschlüsse oder der Zustand
                des Raums entscheidend sind, kommen wir zu Ihnen vor Ort. Wir schlagen Ihnen den Termin vor, der zu
                Ihrem Projekt passt.
              </p>
            </div>
          </div>
          <p className={styles.requestNote}>Sie stellen eine Anfrage. Ein Termin ist erst vereinbart, wenn wir ihn persönlich bestätigt haben.</p>
          <div className={styles['hero-scroll-indicator']}>
            <div className={styles['scroll-dot']} />
            <span>Scrollen Sie nach unten</span>
          </div>
        </div>
      </section>

      {/* Abschnitt: Besichtigungstermin vor Ort */}
      <section data-reveal="text" className={styles.services}>
        <div className={styles['services-container']}>
          <div className={styles['section-header']}>
            <span className={styles['section-label']}>Wenn der bestehende Raum zählt</span>
            <h2 className={styles['section-title']}>Besichtigung bei Ihnen vor Ort</h2>
          </div>

          <div className={styles['services-grid']}>
            <div className={styles['services-content']}>
              {/* Text */}
              <div className={styles['services-text']}>
                {/* Meta-Infos als Features */}
                <div className={styles['services-features']}>
                  <div className={styles['feature-item']}>
                    <div className={styles['feature-icon']}>
                      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                        <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className={styles['feature-content']}>
                      <h3>Ca. 1&nbsp;Stunde</h3>
                      <p>Richtwert für den ersten Termin</p>
                    </div>
                  </div>

                  <div className={styles['feature-item']}>
                    <div className={styles['feature-icon']}>
                      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M21 10c0 7-9 12-9 12S3 17 3 10a9 9 0 1 1 18 0Z" stroke="currentColor" strokeWidth="2" />
                        <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </div>
                    <div className={styles['feature-content']}>
                      <h3>Bei Ihnen zu Hause</h3>
                      <p>Im vereinbarten Ausführungsgebiet</p>
                    </div>
                  </div>
                </div>

                {/* Beschreibung */}
                <div className={styles['services-features']}>
                  <div className={styles['feature-item']}>
                    <div className={styles['feature-icon']}>
                      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </div>
                    <div className={styles['feature-content']}>
                      <h3>Beschreibung</h3>
                      <p>
                        Eine Besichtigung ist sinnvoll, wenn Sie Bad, Küche oder einen weiteren Raum umbauen möchten. Wir sehen
                        uns die Raumsituation an, nehmen die nötigen Masse auf und klären Anschlüsse, Zugänglichkeit und den
                        gewünschten Leistungsumfang.
                      </p>
                      <p style={{ marginTop: '0.75rem' }}>
                        Danach wissen wir, welche Auswahl Sie in der Ausstellung treffen können und welche Angaben für eine
                        Offerte noch fehlen. Ob die Besichtigung kostenlos ist, richtet sich nach Projekt und
                        Entfernung und wird vor dem Termin bestätigt.
                      </p>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className={styles['services-cta-container']}>
                  <Link to="/kontakt" className={styles['services-cta']}>
                    <span>Besichtigung anfragen</span>
                    <svg className={styles['cta-arrow']} viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Bild */}
              <div className={styles['services-image-container']}>
                <div className={styles['image-frame']}>
                  <img src={beratungImage} alt="Beratung bei Ihnen zu Hause" className={styles['services-img']} />
                  <div className={styles['image-overlay']}>
                    <div className={styles['overlay-content']}>
                      <h3>Besichtigung vor Ort</h3>
                      <p>Klären, was der Raum wirklich braucht</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Abschnitt: Ausstellungsraum mieten */}
      <section data-reveal="text" className={styles.products}>
        <div className={styles['products-container']}>
          <div className={styles['section-header']}>
            <span className={styles['section-label']}>Für Architektinnen und Architekten</span>
            <h2 className={styles['section-title']}>Showroom für Ihr Kundengespräch anfragen</h2>
          </div>

          <div className={styles['products-content']}>
            {/* Text rechts */}
            <div className={styles['products-text']}>
              {/* Meta-Infos */}
              <div className={styles['products-features']}>
                <div className={styles['feature-item']}>
                  <div className={styles['feature-icon']}>
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                      <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className={styles['feature-content']}>
                    <h3>Bis zu 3&nbsp;Stunden</h3>
                    <p>Nach Vereinbarung</p>
                  </div>
                </div>
                <div className={styles['feature-item']}>
                  <div className={styles['feature-icon']}>
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M21 10c0 7-9 12-9 12S3 17 3 10a9 9 0 1 1 18 0Z" stroke="currentColor" strokeWidth="2" />
                      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </div>
                  <div className={styles['feature-content']}>
                    <h3>Im Römerquartier 4A</h3>
                    <p>4800 Zofingen</p>
                  </div>
                </div>
              </div>

              {/* Beschreibung */}
              <div className={styles['products-features']}>
                <div className={styles['feature-item']}>
                  <div className={styles['feature-icon']}>
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </div>
                  <div className={styles['feature-content']}>
                    <h3>Beschreibung</h3>
                    <p>
                      Nutzen Sie unsere Ausstellung, um mit Ihren Kundinnen und Kunden Materialien, Farben und Produkte direkt
                      am Muster zu besprechen. Der Showroom bietet Platz für das Gespräch und für den Vergleich unterschiedlicher
                      Kombinationen.
                    </p>
                  </div>
                </div>

                {/* Vorteile */}
                <div className={styles['feature-item']}>
                    <div className={styles['feature-icon']}>
                      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </div>
                    <div className={styles['feature-content']}>
                      <h3>Vorteile</h3>
                      <p>- Sitzungsbereich</p>
                      <p>- Bildschirm für Pläne und Präsentationen</p>
                      <p>- Musik und Getränke</p>
                      <p>- Material- und Produktmuster aus der Ausstellung</p>
                      <p>- Auf Wunsch Unterstützung durch New Living Design</p>
                    </div>
                  </div>

                <div className={styles['feature-item']}>
                  <div className={styles['feature-icon']}>
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className={styles['feature-content']}>
                    <h3>Hinweis</h3>
                    <p>
                      Die Nutzung ist für ausgewählte Architekturbüros kostenlos und erfolgt nach bestätigter Anfrage.
                      Materialien und Produkte aus dem Termin werden über New Living Design bezogen. Details und Verfügbarkeit
                      klären wir vor der Reservation.
                    </p>
                  </div>
                </div>

                <div className={styles['products-cta-container']}>
                  <Link to="/kontakt" className={styles['products-cta']}>
                    <span>Showroom-Termin anfragen</span>
                    <svg className={styles['cta-arrow']} viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className={styles['products-image-container']}>
              <div className={styles.showroomGrid}>
                {galleryImages.map((src, i) => (
                  <div key={i} className={styles['image-frame']}>
                    <img
                      src={src} loading="lazy" decoding="async"
                      alt="Unsere Ausstellung in Zofingen – für Bemusterung und Kundengespräche."
                      className={styles['products-img']}
                    />
                    <div className={styles['image-overlay']}>
                      <div className={styles['overlay-content']}>
                        <h3>Showroom</h3>
                        <p>Bemusterung und Kundengespräche</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
        </div>
      </section>
    </main>
  );
};

export default Booking;
