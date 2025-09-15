import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './Services.module.css';
import heroImage from '../../assets/shutterstock_2583534585.jpg';
import beratungImage from '../../assets/shutterstock_2479065515.jpg';
import visualisierungImage from '../../assets/shutterstock_2600181185.jpg';
import lieferungImage from '../../assets/shutterstock_236748076.jpg';
import { Helmet } from 'react-helmet-async';

const Services: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    // CSS-Module-kompatible Reveal-Animation
    const timer = setTimeout(() => {
      const allElements = document.querySelectorAll('.' + styles['scroll-reveal']);
      allElements.forEach((el, index) => {
        setTimeout(() => {
          el.classList.add(styles.visible);
        }, index * 200);
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className={styles['services-page']}>
      <Helmet>
        <title>Dienstleistungen – New Living Design GmbH | Beratung, 3D-Visualisierung, Lieferung</title>
        <meta
          name="description"
          content="Unsere Dienstleistungen: kostenlose Beratung, detaillierte Offerten mit 3D-Visualisierung sowie Lieferung und Montage. Perfekte Lösungen für Ihr Bau- und Designprojekt."
        />
        <meta property="og:title" content="Dienstleistungen – New Living Design GmbH" />
        <meta property="og:description" content="Kostenlose Beratung, 3D-Visualisierung und professionelle Lieferung & Montage. Ihr Partner für hochwertige Bau- und Designprojekte." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.newlivingdesign.ch/dienstleistungen" />
        <meta property="og:image" content="https://www.newlivingdesign.ch/assets/shutterstock_2583534585.jpg" />
      </Helmet>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles['hero-background']}>
          <div className={styles['hero-overlay']}></div>
          <img
            src={heroImage}
            alt="Dienstleistungen"
            className={styles['hero-bg-image']}
          />
        </div>
        <div className={styles['hero-container']}>
          <div className={`${styles['hero-content']} ${isVisible ? styles.visible : ''}`}>
            <h1 className={styles['hero-title']}>
              <span className={styles['title-line']}>Unsere</span>
              <span className={styles['title-highlight']}>Dienstleistungen</span>
            </h1>
            <div className={styles['hero-description']}>
              <p>
                Perfekte Lösungen für all Ihre Bedürfnisse –
                von der ersten Beratung bis zur finalen Montage.
              </p>
            </div>
          </div>
          <div className={styles['hero-scroll-indicator']}>
            <div className={styles['scroll-dot']}></div>
            <span>Scrollen Sie nach unten</span>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className={`${styles.introduction} ${styles['scroll-reveal']}`}>
        <div className={styles['introduction-container']}>
          <div className={styles['section-header']}>
            <span className={styles['section-label']}>Unser Service</span>
            <h2 className={styles['section-title']}>Von der Idee zur Realität</h2>
          </div>
          <div className={styles['introduction-content']}>
            <p>
              Dank der langjährigen Erfahrung unserer Mitarbeiter werden Sie individuell beraten und betreut.
              Wir nehmen uns die Zeit, Ihre speziellen Anforderungen und Wünsche zu verstehen, und bieten
              massgeschneiderte Empfehlungen, die genau auf Sie zugeschnitten sind.
            </p>
            <p>
              Von der kostenlosen Beratung über detaillierte 3D-Visualisierungen bis hin zur professionellen
              Lieferung und Montage – wir begleiten Sie durch jeden Schritt Ihres Projekts.
            </p>
          </div>
        </div>
      </section>

      {/* Services Sections */}
      <section className={styles['services-categories']}>
        <div className={styles['categories-container']}>

          {/* Beratung */}
          <div className={`${styles['service-section']} ${styles.light} ${styles['scroll-reveal']}`}>
            <div className={styles['service-content']}>
              <div className={styles['service-text']}>
                <h3 className={styles['service-title']}>Beratung</h3>
                <div className={styles['service-description']}>
                  <p>
                    Dank der langjährigen Erfahrung unserer Mitarbeiter werden Sie individuell beraten und betreut.
                    Wir nehmen uns die Zeit, Ihre speziellen Anforderungen und Wünsche zu verstehen, und bieten
                    massgeschneiderte Empfehlungen, die genau auf Sie zugeschnitten sind.
                  </p>
                  <p>
                    Wir freuen uns, Sie in unseren Ausstellungsraum einzuladen, wo Sie die Möglichkeit haben,
                    unsere Produkte und Dienstleistungen hautnah zu erleben. Lassen Sie sich inspirieren und
                    überzeugen Sie sich selbst von der Qualität und Vielfalt unseres Angebots.
                  </p>
                  <div className={styles['service-highlight']}>
                    <strong>Die Beratung ist völlig kostenlos!</strong> Nutzen Sie diese Gelegenheit, um sich
                    unverbindlich zu informieren und von unserem umfassenden Service zu profitieren.
                  </div>
                </div>
              </div>
              <div className={styles['service-image']}>
                <img src={beratungImage} alt="Beratung" />
              </div>
            </div>
          </div>

          {/* Offerte und 3D-Visualisierung */}
          <div className={`${styles['service-section']} ${styles.dark} ${styles.reverse} ${styles['scroll-reveal']}`}>
            <div className={styles['service-content']}>
              <div className={styles['service-text']}>
                <h3 className={styles['service-title']}>Offerte und 3D-Visualisierung</h3>
                <div className={styles['service-description']}>
                  <p>
                    Sie erhalten bei uns nicht nur ein schnelles und sauberes Angebot, sondern auch die Möglichkeit,
                    eine 3D-Visualisierung Ihres Projekts anzufordern. So können Sie sich ein genaues Bild von Ihrer
                    Auswahl machen und sehen, wie Ihre Ideen in die Realität umgesetzt werden.
                  </p>
                  <p>
                    Unsere 3D-Visualisierungen bieten eine realistische Vorschau auf das Endergebnis, sodass Sie
                    sicherstellen können, dass alle Details Ihren Vorstellungen entsprechen. Dies ermöglicht eine
                    präzisere Planung und Umsetzung.
                  </p>
                  <div className={styles['service-highlight']}>
                    <strong>Modernste Technologie:</strong> Mit dem Fachwissen unseres Teams liefern wir Ihnen
                    beeindruckende und detailgetreue Darstellungen, die Ihre Vision greifbar machen.
                  </div>
                </div>
              </div>
              <div className={styles['service-image']}>
                <img src={visualisierungImage} alt="3D-Visualisierung" />
              </div>
            </div>
          </div>

          {/* Lieferung und Montage */}
          <div className={`${styles['service-section']} ${styles.light} ${styles['scroll-reveal']}`}>
            <div className={styles['service-content']}>
              <div className={styles['service-text']}>
                <h3 className={styles['service-title']}>Lieferung und Montage</h3>
                <div className={styles['service-description']}>
                  <p>
                    Bis Sie das gesamte bestellte Material erhalten haben, gewährleisten wir eine umfassende und
                    transparente Kommunikation. Sie werden regelmässig über den aktuellen Status Ihrer Bestellung
                    informiert, sodass Sie stets auf dem neuesten Stand sind.
                  </p>
                  <p>
                    Darüber hinaus bieten wir Ihnen die Möglichkeit, das Material, einschliesslich Fliesen, von
                    unseren vertrauenswürdigen Partnern montieren zu lassen. Wichtig zu wissen: Diese zusätzliche
                    Dienstleistung wird die Kosten von ihrer Seite nicht erhöhen.
                  </p>
                  <div className={styles['service-highlight']}>
                    <strong>Qualitätsgarantie:</strong> Unsere Partner arbeiten Hand in Hand mit uns, um sicherzustellen,
                    dass Ihre Projekte termingerecht und nach höchsten Qualitätsstandards abgeschlossen werden.
                  </div>
                </div>
              </div>
              <div className={styles['service-image']}>
                <img src={lieferungImage} alt="Lieferung und Montage" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Process Section */}
      <section className={`${styles['process-section']} ${styles['scroll-reveal']}`}>
        <div className={styles['process-container']}>
          <div className={styles['section-header']}>
            <span className={styles['section-label']}>Unser Prozess</span>
            <h2 className={styles['section-title']}>So arbeiten wir</h2>
          </div>
          <div className={styles['process-steps']}>
            <div className={styles['process-step']}>
              <div className={styles['step-number']}>01</div>
              <h4 className={styles['step-title']}>Kostenlose Beratung</h4>
              <p className={styles['step-description']}>
                Persönliche Beratung in unserem Ausstellungsraum oder vor Ort bei Ihnen.
              </p>
            </div>
            <div className={styles['process-step']}>
              <div className={styles['step-number']}>02</div>
              <h4 className={styles['step-title']}>Offerte & 3D-Visualisierung</h4>
              <p className={styles['step-description']}>
                Detaillierte Offerte mit realistischer 3D-Darstellung Ihres Projekts.
              </p>
            </div>
            <div className={styles['process-step']}>
              <div className={styles['step-number']}>03</div>
              <h4 className={styles['step-title']}>Lieferung & Montage</h4>
              <p className={styles['step-description']}>
                Termingerechte Lieferung und professionelle Montage durch unsere Partner.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`${styles['cta-section']} ${styles['scroll-reveal']}`}>
        <div className={styles['cta-container']}>
          <div className={styles['cta-content']}>
            <h2 className={styles['cta-title']}>Bereit für Ihr Projekt?</h2>
            <p className={styles['cta-description']}>
              Kontaktieren Sie uns für eine kostenlose Beratung und lassen Sie sich von unserer
              Erfahrung und unserem umfassenden Service überzeugen.
            </p>
            <div className={styles['cta-buttons']}>
              <Link to="/kontakt" className={`${styles['cta-button']} ${styles.primary}`}>
                <span>Termin vereinbaren</span>
                <svg className={styles['cta-arrow']} viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link to="/produkte" className={`${styles['cta-button']} ${styles.secondary}`}>
                <span>Unsere Produkte</span>
                <svg className={styles['cta-arrow']} viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "provider": {
            "@type": "Organization",
            "name": "New Living Design GmbH",
            "url": "https://www.newlivingdesign.ch"
          },
          "serviceType": "Innenausbau & Design Services",
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Dienstleistungen von New Living Design",
            "itemListElement": [
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Beratung",
                  "description": "Individuelle und kostenlose Beratung im Showroom oder vor Ort."
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "3D-Visualisierung",
                  "description": "Realistische Vorschau Ihres Projekts mit moderner 3D-Technologie."
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Lieferung & Montage",
                  "description": "Termingerechte Lieferung und professionelle Montage durch Partner."
                }
              }
            ]
          }
        })}
      </script>
    </main>
  );
};

export default Services;
