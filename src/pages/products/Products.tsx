import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './Products.module.css';
import heroImage from '../../assets/14264-rchi-mirabilia-villas-01.webp';
import bodenbelaegeImage from '../../assets/Dosem_Onyx_WhiteBlue_60x120120x270_bathroom_HD_1.jpg';
import wandverkleidungenImage from '../../assets/Inediti_05_HP_desktop.webp';
import badmoebelImage from '../../assets/PRIME_mobili_generale.webp';
import armaturenImage from '../../assets/Newform_Deltazero_P2.webp';
import sanitaerapparateImage from '../../assets/Ambiente-Set-5.webp';
import heizkoerperImage from '../../assets/image.avif';
import wellnessImage from '../../assets/Zen_Combi_duo_Linear_6-1030x1030.webp';
import beleuchtungenImage from '../../assets/BEAM_STICK_family_color_edited.avif';
import accessoiresImage from '../../assets/viv-au2420bmset5_5.avif';
import { SEOHead } from '../../components';
import { photoUrl } from '../../data/references';

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
      <SEOHead
        title="Bad, Küchen, Platten & Wellness | New Living Design Zofingen"
        description="Bad, Küchen, Keramikplatten und Wellness-Lösungen auswählen: Produkte, 3D-Planung und persönliche Beratung in Zofingen."
        keywords="Badmöbel Zofingen, Küchenplanung Zofingen, Küchenmontage, Keramikplatten kaufen, Wellnesskabine, Ausstellung Zofingen, Schweiz"
        url="/produkte"
        type="website"
        image="https://newlivingdesign.ch/assets/14264-rchi-mirabilia-villas-01.webp"
      />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles['hero-background']}>
          <div className={styles['hero-overlay']}></div>
          <img
            src={heroImage}
            alt="Ausstellung für Bad, Küchen, Platten und Wellness bei New Living Design in Zofingen"
            className={styles['hero-bg-image']}
          />
        </div>
        <div className={styles['hero-container']}>
          <div className={`${styles['hero-content']} ${isVisible ? styles.visible : ''}`}>
            <h1 className={styles['hero-title']}>
              <span className={styles['title-line']}>Bad, Küchen, Platten</span>
              <span className={styles['title-highlight']}>&amp; Wellness</span>
            </h1>
            <div className={styles['hero-description']}>
              <p>
                Produkte, Materialien und Farben in echt vergleichen –
                mit persönlicher Beratung in unserer Ausstellung in Zofingen.
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
            <h2 className={styles['section-title']}>Auswählen, anfassen, entscheiden</h2>
          </div>
          <div className={styles['introduction-content']}>
            <p>
              Bad, Küchen, Platten und Wellness stehen bei uns gleichberechtigt im Mittelpunkt. Dazu finden Sie
              passende Armaturen, Sanitärapparate, Wandverkleidungen, Beleuchtung und Accessoires – von bewährten
              Standardlösungen bis zu besonderen Designstücken.
            </p>
            <p>
              Besuchen Sie unsere Ausstellung, vergleichen Sie Muster und lassen Sie sich eine stimmige Auswahl zusammenstellen.
            </p>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className={styles['product-categories']}>
        <div className={styles['categories-container']}>
          {/* Badmöbel */}
          <div id="bad" className={`${styles['category-section']} ${styles.light}`}>
            <div className={styles['category-content']}>
              <div className={styles['category-text']}>
                <h3 className={styles['category-title']}>Badmöbel</h3>
                <div className={styles['category-description']}>
                  <p>
                    Wählen Sie Badmöbel, Waschtische, Armaturen und Keramik passend zu Ihrem Raum und Stil.
                    Neben Serienmöbeln zeigen wir auch massgefertigte Lösungen aus Corian® und Korakril™.
                  </p>
                  <div className={styles['category-highlights']} aria-label="Bad-Sortiment">
                    <span>Badmöbel</span><span>Armaturen</span><span>Keramik</span>
                  </div>
                  <Link to="/kontakt" className={styles['category-link']}>Badberatung anfragen <span aria-hidden="true">↗</span></Link>
                </div>
              </div>
              <div className={styles['category-image']}>
                <img src={badmoebelImage} alt="Badmöbel" />
              </div>
            </div>
          </div>

          {/* Küchen */}
          <div id="kuechen" className={`${styles['category-section']} ${styles.dark} ${styles.reverse}`}>
            <div className={styles['category-content']}>
              <div className={styles['category-text']}>
                <h3 className={styles['category-title']}>Küchen</h3>
                <div className={styles['category-description']}>
                  <p>
                    Wir planen Küchen passend zu Raum, Alltag und Stil und machen die Auswahl mit einer
                    3D-Visualisierung verständlich. Wir koordinieren die Lieferung, die fachgerechte Montage und
                    auf Wunsch die Renovation der bestehenden Küche.
                  </p>
                  <div className={styles['category-highlights']} aria-label="Küchenleistungen">
                    <span>Planung &amp; 3D</span><span>Lieferung</span><span>Montage &amp; Renovation</span>
                  </div>
                  <Link to="/kontakt" className={styles['category-link']}>Küchenberatung anfragen <span aria-hidden="true">↗</span></Link>
                </div>
              </div>
              <div className={styles['category-image']}>
                <img src={photoUrl('kueche-insel-messing-01.webp')} alt="Realisierte Küche mit Insel, Messingdetails und Einbaugeräten" loading="lazy" width="1200" height="800" />
              </div>
            </div>
          </div>

          {/* Wellness */}
          <div id="wellness" className={`${styles['category-section']} ${styles.light}`}>
            <div className={styles['category-content']}>
              <div className={styles['category-text']}>
                <h3 className={styles['category-title']}>Wellness für Ihr Zuhause</h3>
                <div className={styles['category-description']}>
                  <p>
                    Entdecken Sie Wellnesskabinen und Lösungen für Wärme, Dampf und Entspannung. Wir beraten Sie,
                    welche Ausführung zu Ihren Räumen, Ihren Gewohnheiten und Ihrem Budget passt.
                  </p>
                  <div className={styles['category-highlights']} aria-label="Wellness-Sortiment">
                    <span>Wellnesskabinen</span><span>Wärme</span><span>Dampf</span>
                  </div>
                  <Link to="/kontakt" className={styles['category-link']}>Wellness-Beratung anfragen <span aria-hidden="true">↗</span></Link>
                </div>
              </div>
              <div className={styles['category-image']}>
                <img src={wellnessImage} alt="Wellnesskabine für Wärme und Entspannung" />
              </div>
            </div>
          </div>

          {/* Platten */}
          <div id="platten" className={`${styles['category-section']} ${styles.dark} ${styles.reverse}`}>
            <div className={styles['category-content']}>
              <div className={styles['category-text']}>
                <h3 className={styles['category-title']}>Platten für Wand und Boden</h3>
                <div className={styles['category-description']}>
                  <p>
                    Vergleichen Sie Keramikplatten, Feinsteinzeug, Mosaik und Grossformate direkt am Muster.
                    Gemeinsam finden wir Farbe, Oberfläche und Format für Bad, Küche oder Wohnraum.
                  </p>
                  <div className={styles['category-highlights']} aria-label="Platten-Sortiment">
                    <span>Keramik</span><span>Grossformate</span><span>Mosaik</span>
                  </div>
                  <Link to="/kontakt" className={styles['category-link']}>Plattenberatung anfragen <span aria-hidden="true">↗</span></Link>
                </div>
              </div>
              <div className={styles['category-image']}>
                <img src={bodenbelaegeImage} alt="Grossformatige Keramikplatten für Wand und Boden" />
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "Produktkategorien von New Living Design",
          "itemListElement": [
            { name: "Badmöbel, Armaturen und Keramik", anchor: "bad" },
            { name: "Küchenplanung, Lieferung, Montage und Renovation", anchor: "kuechen" },
            { name: "Platten für Wand und Boden", anchor: "platten" },
            { name: "Wellness für Ihr Zuhause", anchor: "wellness" }
          ].map((cat, i) => ({
            "@type": "ListItem",
            "position": i + 1,
            "name": cat.name,
            "url": `https://newlivingdesign.ch/produkte#${cat.anchor}`
          }))
        }) }} />
    </main>
  );
};

export default Products;
