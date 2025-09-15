import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Booking.module.css';

import beratungImage from '../../assets/shutterstock_2286698317.jpg';
import heroImage from '../../assets/shutterstock_2336703843.jpg';
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
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => setIsVisible(true), []);

  return (
    <main className={styles.home}>
      
      {/* SEO Head */}
      <Helmet>
        <title>Online Beratung & Showroom buchen | New Living Design GmbH</title>
        <meta
          name="description"
          content="Buchen Sie jetzt Ihre persönliche Beratung – bei Ihnen zu Hause oder im Showroom in Zofingen. Kostenloser Ersttermin, exklusive Räume für Architekten."
        />
        <meta property="og:title" content="Beratung & Showroom buchen | New Living Design GmbH" />
        <meta
          property="og:description"
          content="Individuelle Beratung bei Ihnen zu Hause oder im Showroom. Jetzt Termin sichern – kostenloser Ersttermin."
        />
        <meta property="og:image" content={heroImage} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.newlivingdesign.ch/booking" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Beratung & Showroom buchen | New Living Design GmbH" />
        <meta
          name="twitter:description"
          content="Persönliche Beratung buchen oder exklusiven Showroom in Zofingen reservieren."
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
              "image": "https://www.newlivingdesign.ch" + heroImage,
              "url": "https://www.newlivingdesign.ch/booking",
              "telephone": "+41766051307",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Im Römerquartier 4A",
                "postalCode": "4800",
                "addressLocality": "Zofingen",
                "addressCountry": "CH"
              }
            },
            "offers": {
              "@type": "Offer",
              "url": "https://www.newlivingdesign.ch/booking",
              "price": "0",
              "priceCurrency": "CHF",
              "eligibleRegion": {
                "@type": "Place",
                "address": { "@type": "PostalAddress", "addressCountry": "CH" }
              }
            }
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
          <div className={`${styles['hero-content']} ${isVisible ? styles.visible : ''}`}>
            <h1 className={styles['hero-title']}>
              <span className={styles['title-highlight']}>Beratung & Showroom</span>
            </h1>
            <div className={styles['hero-description']}>
              <p>
                Individuelle Beratung, wo es am wichtigsten ist, bei Ihnen daheim oder in unserem Showroom.
              </p>
            </div>
          </div>
          <div className={styles['hero-scroll-indicator']}>
            <div className={styles['scroll-dot']} />
            <span>Scrollen Sie nach unten</span>
          </div>
        </div>
      </section>

      {/* Abschnitt: Besichtigungstermin vor Ort */}
      <section className={styles.services}>
        <div className={styles['services-container']}>
          <div className={styles['section-header']}>
            <span className={styles['section-label']}>Individuelle Beratung</span>
            <h2 className={styles['section-title']}>Besichtigungstermin bei Ihnen vor Ort</h2>
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
                      <h4>1&nbsp;Std.</h4>
                      <p>Dauer des Ersttermins</p>
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
                      <h4>Beim Kunden</h4>
                      <p>Beratung direkt bei Ihnen zu Hause</p>
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
                      <h4>Beschreibung</h4>
                      <p>
                        Wenn Sie planen, Ihr Bad, Ihre Küche oder ein Zimmer umzubauen, können Sie sich gerne hier anmelden. Wir
                        besuchen Sie zu einem ersten Beratungstermin direkt bei Ihnen zu Hause, um Ihre Ideen gemeinsam
                        anzuschauen und zu besprechen. Diese Beratung bei Ihnen vor Ort ist selbstverständlich kostenlos. Je
                        nach Bedarf kann anschliessend ein weiterer Termin in unserem Ausstellungsraum in Zofingen vereinbart
                        werden.
                      </p>
                      <p style={{ marginTop: '0.75rem' }}>
                        Melden Sie sich jetzt und sichern Sie sich Ihre persönliche Beratung vor Ort.
                      </p>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <div className={styles['services-cta-container']}>
                  <Link to="/kontakt" className={styles['services-cta']}>
                    <span>Kontakt aufnehmen</span>
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
                      <h3>Vor-Ort-Beratung</h3>
                      <p>Individuell, persönlich, kostenlos</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Abschnitt: Ausstellungsraum mieten */}
      <section className={styles.products}>
        <div className={styles['products-container']}>
          <div className={styles['section-header']}>
            <span className={styles['section-label']}>Exklusiver Showroom für Architekten – kostenlos nutzen</span>
            <h2 className={styles['section-title']}>Ausstellungsraum mieten</h2>
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
                    <h4>3&nbsp;Std.</h4>
                    <p>Reservierungsdauer</p>
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
                    <h4>Zofingen</h4>
                    <p>Zentrale Lage, optimal erreichbar</p>
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
                    <h4>Beschreibung</h4>
                    <p>
                      Ab dem <strong>01.01.2026</strong> öffnen wir unseren Showroom in Zofingen exklusiv für ausgewählte
                      Architekten. Nutzen Sie die Möglichkeit, Ihre Kunden nicht nur anhand von Katalogen, sondern direkt in
                      einem vollständig ausgestatteten Ausstellungsraum zu beraten.
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
                      <h4>Vorteile</h4>
                      <p>- Persönliche Beratung in stilvollem Ambiente</p>
                      <p>- Materialien und Designlösungen zum Anfassen</p>
                      <p>- Kostenloser Zugang zu Sitzungsraum, Bildschirmprojektion, Musik und Getränken</p>
                      <p>- Zentrale Lage in Zofingen, für Ihre Kunden optimal erreichbar</p>
                    </div>
                  </div>

                <div className={styles['feature-item']}>
                  <div className={styles['feature-icon']}>
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className={styles['feature-content']}>
                    <h4>Hinweis</h4>
                    <p>
                      Die ausgewählten Materialien müssen direkt über uns bezogen werden. Auf Wunsch begleiten wir Sie während
                      der Beratung und unterstützen mit unserem Fachwissen – oder überlassen Ihnen den Showroom ganz exklusiv
                      für Ihr Kundengespräch. Dieses Angebot richtet sich ausschliesslich an ausgewählte Architekten.
                    </p>
                  </div>
                </div>

                <div className={styles['products-cta-container']}>
                  <Link to="/kontakt" className={styles['products-cta']}>
                    <span>Showroom-Termín reservieren</span>
                    <svg className={styles['cta-arrow']} viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className={styles['products-image-container']}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                  gap: '1rem',
                  height: '100%',
                }}
              >
                {galleryImages.map((src, i) => (
                  <div key={i} className={styles['image-frame']} style={{ height: 240 }}>
                    <img src={src} alt={`Showroom Impression ${i + 1}`} className={styles['products-img']} />
                    <div className={styles['image-overlay']}>
                      <div className={styles['overlay-content']}>
                        <h3>Showroom</h3>
                        <p>Materialien & Designlösungen live</p>
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
