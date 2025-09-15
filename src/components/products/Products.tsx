import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './Products.module.css';
import heroImage from '../../assets/14264-rchi-mirabilia-villas-01.webp';
import bodenbelaegeImage from '../../assets/Dosem_Onyx_WhiteBlue_60x120120x270_bathroom_HD_1.jpg';
import wandverkleidungenImage from '../../assets/Inediti_05_HP_desktop.jpg';
import badmoebelImage from '../../assets/PRIME_mobili_generale.jpg';
import armaturenImage from '../../assets/Newform_Deltazero_P2.jpg';
import sanitaerapparateImage from '../../assets/Ambiente-Set-5.jpg';
import heizkoerperImage from '../../assets/image.avif';
import wellnessImage from '../../assets/Zen_Combi_duo_Linear_6-1030x1030.jpg';
import kuechenImage from '../../assets/ixycxivw.avif';
import beleuchtungenImage from '../../assets/BEAM_STICK_family_color_edited.avif';
import accessoiresImage from '../../assets/viv-au2420bmset5_5.avif';
import { Helmet } from 'react-helmet-async';

const Products: React.FC = () => {
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
    <main className={styles['products-page']}>
      <Helmet>
        <title>Produkte – New Living Design GmbH | Badezimmer, Küchen, Bodenbeläge</title>
        <meta
          name="description"
          content="Entdecken Sie hochwertige Produkte von New Living Design: Badezimmermöbel, Küchen, Armaturen, Sanitärapparate, Bodenbeläge, Wandverkleidungen, Heizkörper, Wellness und Accessoires."
        />
        <meta property="og:title" content="Unsere Produkte – New Living Design GmbH" />
        <meta property="og:description" content="Exklusive Produktvielfalt für Interior Design: Badezimmer, Küchen, Möbel, Armaturen, Wellness und mehr." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.newlivingdesign.ch/produkte" />
        <meta property="og:image" content="https://www.newlivingdesign.ch/assets/14264-rchi-mirabilia-villas-01.webp" />
      </Helmet>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles['hero-background']}>
          <div className={styles['hero-overlay']}></div>
          <img
            src={heroImage}
            alt="Produktvielfalt"
            className={styles['hero-bg-image']}
          />
        </div>
        <div className={styles['hero-container']}>
          <div className={`${styles['hero-content']} ${isVisible ? styles.visible : ''}`}>
            <h1 className={styles['hero-title']}>
              <span className={styles['title-line']}>Entdecken Sie unsere</span>
              <span className={styles['title-highlight']}>Produktvielfalt</span>
            </h1>
            <div className={styles['hero-description']}>
              <p>
                Von Standardartikeln bis hin zu den neuesten Designstücken –
                für jeden Bedarf haben wir etwas Passendes.
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
      <section className={`${styles.introduction}`}>
        <div className={styles['introduction-container']}>
          <div className={styles['section-header']}>
            <span className={styles['section-label']}>Unser Sortiment</span>
            <h2 className={styles['section-title']}>Vielfalt trifft auf Qualität</h2>
          </div>
          <div className={styles['introduction-content']}>
            <p>
              Unser Produktsortiment bietet Ihnen eine umfassende Auswahl. Von Standardartikeln bis hin zu den neuesten massgeschneiderten Designerstücken,
              von kostengünstigen bis zu hochwertigen Optionen – für jeden Bedarf haben wir etwas Passendes.
              Unsere Vielfalt an Produkten sorgt dafür, dass unser Sortiment sowohl breit als auch tief ist.
            </p>
            <p>
              Entdecken Sie unsere Angebote auf unserer Webseite oder besuchen Sie uns direkt im Ausstellungsraum.
            </p>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className={styles['product-categories']}>
        <div className={styles['categories-container']}>
          {/* Badmöbel */}
          <div className={`${styles['category-section']} ${styles.light}`}>
            <div className={styles['category-content']}>
              <div className={styles['category-text']}>
                <h3 className={styles['category-title']}>Badmöbel</h3>
                <div className={styles['category-description']}>
                  <p>
                    Unsere Lieferanten bieten eine äusserst umfangreiche Palette von Badmöbeln und massgefertigten Möbeln aus
                    Corian® und Korakril™ an. Diese Möbelstücke sind speziell darauf ausgelegt, den unterschiedlichen
                    Bedürfnissen jedes Kunden gerecht zu werden.
                  </p>
                </div>
              </div>
              <div className={styles['category-image']}>
                <img src={badmoebelImage} alt="Badmöbel" />
              </div>
            </div>
          </div>

          {/* Küchen */}
          <div className={`${styles['category-section']} ${styles.dark} ${styles.reverse}`}>
            <div className={styles['category-content']}>
              <div className={styles['category-text']}>
                <h3 className={styles['category-title']}>Küchen</h3>
                <div className={styles['category-description']}>
                  <p>
                    Dank unserer langjährigen Partnerschaften mit führenden Küchenherstellern präsentieren wir eine
                    breite Palette hochwertiger Küchenlösungen. Von modernen bis zu zeitlosen Klassikern.
                  </p>
                </div>
              </div>
              <div className={styles['category-image']}>
                <img src={kuechenImage} alt="Küchen" />
              </div>
            </div>
          </div>

          {/* Wellness */}
          <div className={`${styles['category-section']} ${styles.light}`}>
            <div className={styles['category-content']}>
              <div className={styles['category-text']}>
                <h3 className={styles['category-title']}>Wellness</h3>
                <div className={styles['category-description']}>
                  <p>
                    Dank unserer herausragenden Partnerschaften mit führenden Lieferanten im Wellness-Bereich präsentieren
                    wir Ihnen eine umfassende Auswahl an Produkten für Ihre persönliche Entspannung.
                  </p>
                </div>
              </div>
              <div className={styles['category-image']}>
                <img src={wellnessImage} alt="Wellness" />
              </div>
            </div>
          </div>

          {/* Bodenbeläge */}
          <div className={`${styles['category-section']} ${styles.dark} ${styles.reverse}`}>
            <div className={styles['category-content']}>
              <div className={styles['category-text']}>
                <h3 className={styles['category-title']}>Bodenbeläge</h3>
                <div className={styles['category-description']}>
                  <p>
                    Wir sind bestens ausgestattet, wenn es um Bodenbeläge geht! Unser Sortiment reicht von Keramikböden
                    bis hin zu Parkettverkleidungen. Wir bieten eine breite Auswahl an Keramikplatten an.
                  </p>
                </div>
              </div>
              <div className={styles['category-image']}>
                <img src={bodenbelaegeImage} alt="Bodenbeläge" />
              </div>
            </div>
          </div>

          {/* Wandverkleidungen */}
          <div className={`${styles['category-section']} ${styles.light}`}>
            <div className={styles['category-content']}>
              <div className={styles['category-text']}>
                <h3 className={styles['category-title']}>Wandverkleidungen</h3>
                <div className={styles['category-description']}>
                  <p>
                    Wir bieten eine grosse Auswahl an Wandverkleidungen: Glasfasertapeten, Vinyltapeten, Holzverkleidungen,
                    Keramikverkleidungen, Mosaik, Vetrite und vieles mehr.
                  </p>
                </div>
              </div>
              <div className={styles['category-image']}>
                <img src={wandverkleidungenImage} alt="Wandverkleidungen" />
              </div>
            </div>
          </div>

          {/* Armaturen */}
          <div className={`${styles['category-section']} ${styles.dark} ${styles.reverse}`}>
            <div className={styles['category-content']}>
              <div className={styles['category-text']}>
                <h3 className={styles['category-title']}>Armaturen</h3>
                <div className={styles['category-description']}>
                  <p>
                    Unsere Lieferanten liefern ausschliesslich hochwertige Armaturen aus Edelstahl,
                    die für ihre aussergewöhnliche Langlebigkeit und Zuverlässigkeit bekannt sind.
                  </p>
                </div>
              </div>
              <div className={styles['category-image']}>
                <img src={armaturenImage} alt="Armaturen" />
              </div>
            </div>
          </div>

          {/* Sanitärapparate */}
          <div className={`${styles['category-section']} ${styles.light}`}>
            <div className={styles['category-content']}>
              <div className={styles['category-text']}>
                <h3 className={styles['category-title']}>Sanitärapparate</h3>
                <div className={styles['category-description']}>
                  <p>
                    Bei uns finden Sie eine umfassende Auswahl an Sanitäreinrichtungen, die keine Wünsche offen lässt.
                    Unser Sortiment umfasst alles von Lavabos, WCs, Badewannen und Duschen bis hin zu speziellen
                    Wellness-Lösungen.
                  </p>
                </div>
              </div>
              <div className={styles['category-image']}>
                <img src={sanitaerapparateImage} alt="Sanitärapparate" />
              </div>
            </div>
          </div>

          {/* Heizkörper */}
          <div className={`${styles['category-section']} ${styles.dark} ${styles.reverse}`}>
            <div className={styles['category-content']}>
              <div className={styles['category-text']}>
                <h3 className={styles['category-title']}>Heizkörper</h3>
                <div className={styles['category-description']}>
                  <p>
                    Vor kurzem haben wir das NLD-Sortiment um Heizkörper erweitert. Nun bieten wir eine breite Auswahl
                    an Heizkörpern, die individuell anpassbar sind. Unsere Heizkörper sind nicht nur effizient und leistungsstark.
                  </p>
                </div>
              </div>
              <div className={styles['category-image']}>
                <img src={heizkoerperImage} alt="Heizkörper" />
              </div>
            </div>
          </div>

          {/* Beleuchtungen */}
          <div className={`${styles['category-section']} ${styles.light}`}>
            <div className={styles['category-content']}>
              <div className={styles['category-text']}>
                <h3 className={styles['category-title']}>Beleuchtungen</h3>
                <div className={styles['category-description']}>
                  <p>
                    In Zusammenarbeit mit führenden Herstellern von Beleuchtungslösungen präsentieren wir eine
                    vielseitige Auswahl hochwertiger Beleuchtungsprodukte für Ihr Zuhause.
                  </p>
                </div>
              </div>
              <div className={styles['category-image']}>
                <img src={beleuchtungenImage} alt="Beleuchtungen" />
              </div>
            </div>
          </div>

          {/* Accessoires */}
          <div className={`${styles['category-section']} ${styles.dark} ${styles.reverse}`}>
            <div className={styles['category-content']}>
              <div className={styles['category-text']}>
                <h3 className={styles['category-title']}>Accessoires</h3>
                <div className={styles['category-description']}>
                  <p>
                    In unserem Sortiment führen wir eine vielfältige Auswahl an Accessoires, darunter Handtuch- und
                    Papierrollenhalter, Kleiderhaken, Seifenhalter, Becher und vieles mehr.
                  </p>
                </div>
              </div>
              <div className={styles['category-image']}>
                <img src={accessoiresImage} alt="Accessoires" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* CTA Section */}
      <section className={`${styles['cta-section']}`}>
        <div className={styles['cta-container']}>
          <div className={styles['cta-content']}>
            <h2 className={styles['cta-title']}>Besuchen Sie unseren Showroom</h2>
            <p className={styles['cta-description']}>
              Entdecken Sie unsere komplette Produktpalette in unserem Ausstellungsraum in Zofingen.
              Lassen Sie sich von der Vielfalt und Qualität unserer Produkte überzeugen.
            </p>
            <div className={styles['cta-buttons']}>
              <Link to="/kontakt" className={`${styles['cta-button']} ${styles.primary}`}>
                <span>Termin vereinbaren</span>
                <svg className={styles['cta-arrow']} viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link to="/dienstleistungen" className={`${styles['cta-button']} ${styles.secondary}`}>
                <span>Unsere Dienstleistungen</span>
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
          "@type": "ItemList",
          "name": "Produktkategorien von New Living Design",
          "itemListElement": [
            "Bodenbeläge",
            "Wandverkleidungen",
            "Badmöbel",
            "Armaturen",
            "Sanitärapparate",
            "Heizkörper",
            "Wellness",
            "Küchen",
            "Beleuchtungen",
            "Accessoires"
          ].map((cat, i) => ({
            "@type": "ListItem",
            "position": i + 1,
            "name": cat,
            "url": `https://www.newlivingdesign.ch/produkte#${cat.toLowerCase()}`
          }))
        })}
      </script>
    </main>
  );
};

export default Products;
