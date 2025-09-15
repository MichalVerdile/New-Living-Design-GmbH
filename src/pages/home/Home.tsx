import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.module.css';
import rexaImage from '../../assets/Rexa_mobili_moode_gallery_7.jpg';
import trinidadImage from '../../assets/FebalCasa_Cucina_Moderna_Origina_AntaProfiloAlluminio_Vol1_Compo8e.webp';
import clubRoomImage from '../../assets/22-Private-House-Club-Room.jpg.webp';
import { Helmet } from 'react-helmet-async';

const Home: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <main className={styles.home}>
      <Helmet>
        <title>New Living Design GmbH – Innenarchitektur & Renovierungen in Zofingen</title>
        <meta
          name="description"
          content="New Living Design GmbH in Zofingen: Exklusive Badezimmer, Küchen und Wohnraumlösungen. Individuelle Beratung, maßgeschneiderte Innenarchitektur und professionelle Renovierungen."
        />
        <meta property="og:title" content="New Living Design GmbH – Innenarchitektur & Renovierungen" />
        <meta property="og:description" content="Ihr Partner für hochwertige Badezimmer, Küchen und maßgeschneiderte Wohnkonzepte in der Schweiz." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.newlivingdesign.ch/" />
        <meta property="og:image" content="https://www.newlivingdesign.ch/assets/rexa.jpg" />
      </Helmet>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles['hero-background']}>
          <div className={styles['hero-overlay']}></div>
          <img
            src={rexaImage}
            alt="Moderne Badezimmerausstattung"
            className={styles['hero-bg-image']}
          />
        </div>
        <div className={styles['hero-container']}>
          <div className={`${styles['hero-content']} ${isVisible ? styles.visible : ''}`}>
            <h1 className={styles['hero-title']}>
              <span className={styles['title-line']}>Willkommen bei</span>
              <span className={styles['title-highlight']}>New Living Design</span>
            </h1>
            <div className={styles['hero-description']}>
              <p>
                Ihr Partner für Hausrenovierung und moderne Innenausstattung.
              </p>
            </div>
          </div>
          <div className={styles['hero-scroll-indicator']}>
            <div className={styles['scroll-dot']}></div>
            <span>Scrollen Sie nach unten</span>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className={styles.services}>
        <div className={styles['services-container']}>
          <div className={styles['section-header']}>
            <span className={styles['section-label']}>Was wir bieten</span>
            <h2 className={styles['section-title']}>Erstklassige Dienstleistungen</h2>
          </div>

          <div className={styles['services-grid']}>
            <div className={styles['services-content']}>
              <div className={styles['services-image-container']}>
                <div className={styles['image-frame']}>
                  <img
                    src={trinidadImage}
                    alt="Trinidad Badezimmer Design"
                    className={styles['services-img']}
                  />
                  <div className={styles['image-overlay']}>
                    <div className={styles['overlay-content']}>
                      <h3>Premium Küchen und Badezimmer</h3>
                      <p>Hochwertige Einrichtungen</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles['services-text']}>
                <div className={styles['services-features']}>
                  <div className={styles['feature-item']}>
                    <div className={styles['feature-icon']}>
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </div>
                    <div className={styles['feature-content']}>
                      <h4>Erstklassiger Service</h4>
                      <p>Bei New Living Design steht ein erstklassiger Service an oberster Stelle.</p>
                    </div>
                  </div>

                  <div className={styles['feature-item']}>
                    <div className={styles['feature-icon']}>
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" />
                        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </div>
                    <div className={styles['feature-content']}>
                      <h4>Persönliche Betreuung</h4>
                      <p>Unser engagiertes Team begleitet Sie Schritt für Schritt – von der Auswahl des perfekten Produkts, über eine individuelle Beratung, bis hin zur termingerechten Lieferung und professionellen Montage.</p>
                    </div>
                  </div>

                  <div className={styles['feature-item']}>
                    <div className={styles['feature-icon']}>
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className={styles['feature-content']}>
                      <h4>Massgeschneiderte Lösungen</h4>
                      <p>Dabei legen wir grossen Wert darauf, Ihre Wünsche und Bedürfnisse zu berücksichtigen, um sicherzustellen, dass Sie mit dem Endergebnis rundum zufrieden sind.</p>
                    </div>
                  </div>
                </div>

                <div className={styles['services-cta-container']}>
                  <Link to="/dienstleistungen" className={styles['services-cta']}>
                    <span>Zu den Dienstleistungen</span>
                    <svg className={styles['cta-arrow']} viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className={styles['products']}>
        <div className={styles['products-container']}>
          <div className={styles['section-header']}>
            <span className={styles['section-label']}>Entdecken Sie</span>
            <h2 className={styles['section-title']}>Unsere Produktvielfalt</h2>
          </div>

          <div className={styles['products-content']}>
            <div className={styles['products-text']}>
              <div className={styles['products-features']}>
                <div className={styles['feature-item']}>
                  <div className={styles['feature-icon']}>
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </div>
                  <div className={styles['feature-content']}>
                    <h4>Premium Badezimmer</h4>
                    <p>Hochwertige Sanitäranlagen und moderne Badezimmermöbel für Ihr Traumhadbad.</p>
                  </div>
                </div>

                <div className={styles['feature-item']}>
                  <div className={styles['feature-icon']}>
                    <svg viewBox="0 0 24 24" fill="none">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
                      <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2" />
                      <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </div>
                  <div className={styles['feature-content']}>
                    <h4>Wohnraum Design</h4>
                    <p>Stilvolle Möbel und Accessoires für jeden Raum Ihres Zuhauses.</p>
                  </div>
                </div>

                <div className={styles['feature-item']}>
                  <div className={styles['feature-icon']}>
                    <svg viewBox="0 0 24 24" fill="none">
                      <polygon points="12,2 2,7 12,12 22,7 12,2" stroke="currentColor" strokeWidth="2" />
                      <polyline points="2,17 12,22 22,17" stroke="currentColor" strokeWidth="2" />
                      <polyline points="2,12 12,17 22,12" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  </div>
                  <div className={styles['feature-content']}>
                    <h4>Massgeschneiderte Lösungen</h4>
                    <p>Individuelle Anpassungen nach Ihren persönlichen Wünschen und Bedürfnissen.</p>
                  </div>
                </div>
              </div>

              <div className={styles['products-cta-container']}>
                <Link to="/produkte" className={styles['products-cta']}>
                  <span>Alle Produkte entdecken</span>
                  <svg className={styles['cta-arrow']} viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
            </div>

            <div className={styles['products-image-container']}>
              <div className={styles['image-frame']}>
                <img
                  src={clubRoomImage}
                  alt="Elegantes Wohnzimmer mit modernem Design"
                  className={styles['products-img']}
                />
                <div className={styles['image-overlay']}>
                  <div className={styles['overlay-content']}>
                    <h3>Luxuriöse Wohnräume</h3>
                    <p>Moderne Eleganz trifft auf höchste Qualität</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "New Living Design GmbH",
          "url": "https://www.newlivingdesign.ch",
          "logo": "https://www.newlivingdesign.ch/logo.png",
          "sameAs": [
            "https://www.facebook.com/NewLDGMBH/",
            "https://www.instagram.com/new_living_design/",
            "https://www.linkedin.com/in/diego-verdile-56727064/"
          ],
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Im Römerquartier 4A",
            "postalCode": "4800",
            "addressLocality": "Zofingen",
            "addressCountry": "CH"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+41 76 605 13 07",
            "contactType": "customer service",
            "availableLanguage": ["German", "English", "Italian"]
          }
        })}
      </script>
    </main>
  );
};

export default Home;
