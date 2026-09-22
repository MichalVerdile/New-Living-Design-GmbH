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
    <main id="main-content" className={styles['products-page']}>
      <SEOHead
        title="Bad, Küchen, Platten & Wellness | New Living Design Zofingen"
        description="Badmöbel, Küchen, Platten und Wellness in Zofingen vergleichen. Persönliche Auswahlberatung, 3D-Planung sowie Lieferung und Montage."
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
            alt="Modernes Wohnhaus mit Pool in der Abenddämmerung"
            className={styles['hero-bg-image']}
          />
        </div>
        <div className={styles['hero-container']}>
          <div className={`${styles['hero-content']} ${isVisible ? styles.visible : ''}`}>
            <h1 className={styles['hero-title']}>
              <span className={styles['title-line']}>Bad, Küchen, Platten</span>
              <span>&amp; Wellness.</span>
            </h1>
            <div className={styles['hero-description']}>
              <p>
                Eine Auswahl, die zusammenpasst.
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
            <span className={styles['section-label']}>Ausstellung in Zofingen</span>
            <h2 className={styles['section-title']}>Nicht möglichst viel. Sondern das, was zusammenpasst.</h2>
          </div>
          <div className={styles['introduction-content']}>
            <p>
              Ein stimmiger Raum entsteht nicht durch möglichst viele Produkte. Entscheidend ist, dass Proportionen,
              Farben, Oberflächen und Nutzung zusammenpassen.
            </p>
            <p>
              In unserer Ausstellung vergleichen Sie Farben, Oberflächen und Formate direkt am Material.
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
                <h3 className={styles['category-title']}>Badprodukte gemeinsam auswählen</h3>
                <div className={styles['category-description']}>
                  <p>
                    Wir wählen mit Ihnen Badmöbel, Waschtisch, WC, Armaturen, Dusche, Badewanne und Zubehör als
                    gemeinsame Kombination aus. Dabei achten wir auf Masse, Materialien, Farben und die tägliche Nutzung.
                    Neben Serienmöbeln zeigen wir auch massgefertigte Lösungen aus Corian® und Korakril™.
                  </p>
                  <div className={styles['category-highlights']} aria-label="Bad-Sortiment">
                    <span>Badmöbel</span><span>Waschtische</span><span>Armaturen</span><span>Keramik</span><span>Duschen</span><span>Badewannen</span>
                  </div>
                  <Link to="/kontakt" className={styles['category-link']}>Badberatung anfragen</Link>
                </div>
              </div>
              <div className={styles['category-image']}>
                <img src={badmoebelImage} alt="Wandhängendes Badmöbel mit zwei Aufsatzbecken und Spiegeln vor grossformatigen Platten" />
              </div>
            </div>
          </div>

          {/* Küchen */}
          <div id="kuechen" className={`${styles['category-section']} ${styles.dark} ${styles.reverse}`}>
            <div className={styles['category-content']}>
              <div className={styles['category-text']}>
                <h3 className={styles['category-title']}>Eine Küche, die im Alltag funktioniert</h3>
                <div className={styles['category-description']}>
                  <p>
                    Eine Küche muss morgens, beim Kochen und mit Gästen funktionieren. Wir planen Raumaufteilung,
                    Stauraum, Fronten, Arbeitsfläche, Geräte und Licht als Ganzes. Mit der 3D-Visualisierung sehen Sie
                    Proportionen und Materialien vor der Bestellung. Lieferung, Montage und die Renovation der
                    bestehenden Küche koordinieren wir nach Bedarf.
                  </p>
                  <div className={styles['category-highlights']} aria-label="Küchenleistungen">
                    <span>Planung &amp; 3D</span><span>Lieferung</span><span>Montage</span><span>Renovation</span>
                  </div>
                  <Link to="/kontakt" className={styles['category-link']}>Küchenberatung anfragen</Link>
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
                <h3 className={styles['category-title']}>Wellness beginnt mit den Möglichkeiten des Raums</h3>
                <div className={styles['category-description']}>
                  <p>
                    Sauna, Dampfbad, Wellnesskabine oder Whirlwanne benötigen die passende Fläche und die richtigen
                    Anschlüsse. Wir klären zuerst Raum, Nutzung und technische Voraussetzungen. Danach wählen wir mit
                    Ihnen eine Ausführung, die zu Ihrem Alltag und Ihrem Budget passt.
                  </p>
                  <p>
                    Wellness sehen Sie bei uns in der Ausstellung in Zofingen.
                  </p>
                  <div className={styles['category-highlights']} aria-label="Wellness-Sortiment">
                    <span>Sauna</span><span>Dampf</span><span>Wellnesskabinen</span><span>Whirlwannen</span>
                  </div>
                  <Link to="/kontakt" className={styles['category-link']}>Wellness-Beratung anfragen</Link>
                </div>
              </div>
              <div className={styles['category-image']}>
                <img src={wellnessImage} alt="Kombinierte Wellnesskabine mit Saunabereich und Duschkabine" />
              </div>
            </div>
          </div>

          {/* Platten */}
          <div id="platten" className={`${styles['category-section']} ${styles.dark} ${styles.reverse}`}>
            <div className={styles['category-content']}>
              <div className={styles['category-text']}>
                <h3 className={styles['category-title']}>Platten für Wand, Boden und Aussenbereich</h3>
                <div className={styles['category-description']}>
                  <p>
                    Platten bestimmen nicht nur die Farbe eines Raums, sondern auch Fugenbild, Pflege und Trittsicherheit.
                    Vergleichen Sie Keramik, Feinsteinzeug, Mosaik und Grossformate direkt am Muster – von kleinen Formaten
                    bis zu grossen Platten für durchgehende Flächen. Für Terrassen und andere Aussenbereiche beraten wir
                    Sie auch zu geeigneten rutschhemmenden Oberflächen.
                  </p>
                  <div className={styles['category-highlights']} aria-label="Platten-Sortiment">
                    <span>Keramik</span><span>Feinsteinzeug</span><span>Mosaik</span><span>Grossformate</span><span>Outdoor</span>
                  </div>
                  <Link to="/kontakt" className={styles['category-link']}>Plattenberatung anfragen</Link>
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
                <h3 className={styles['category-title']}>Nicht jede Wand braucht dieselbe Oberfläche</h3>
                <div className={styles['category-description']}>
                  <p>
                    Neben Keramik bieten wir Glasfaser- und Vinyltapeten, Holzverkleidungen, Mosaik und Vetrite. Wir zeigen
                    Ihnen, welche Oberfläche für den jeweiligen Raum geeignet ist und wie sie sich mit Boden, Möbeln und Licht kombinieren lässt.
                  </p>
                </div>
              </div>
              <div className={styles['category-image']}>
                <img src={wandverkleidungenImage} alt="Wohnraum mit gemusterter Wandverkleidung" />
              </div>
            </div>
          </div>

          {/* Armaturen */}
          <div className={`${styles['category-section']} ${styles.dark} ${styles.reverse}`}>
            <div className={styles['category-content']}>
              <div className={styles['category-text']}>
                <h3 className={styles['category-title']}>Form und Oberfläche konsequent weiterführen</h3>
                <div className={styles['category-description']}>
                  <p>
                    Rund oder eckig, verchromt, schwarz, gebürstet oder in einer PVD-Oberfläche: Wir stimmen Waschtisch-,
                    Dusch- und Wannenarmaturen auf Keramik, Möbel und Zubehör ab. Dabei berücksichtigen wir Bedienung,
                    Anschlüsse und Pflege ebenso wie die Gestaltung.
                  </p>
                </div>
              </div>
              <div className={styles['category-image']}>
                <img src={armaturenImage} alt="Schwarze Wannenarmatur mit Handbrause auf einer dunklen Steinfläche" />
              </div>
            </div>
          </div>

          {/* Sanitärapparate */}
          <div className={`${styles['category-section']} ${styles.light}`}>
            <div className={styles['category-content']}>
              <div className={styles['category-text']}>
                <h3 className={styles['category-title']}>Keramik und Ausstattung passend zum Raum</h3>
                <div className={styles['category-description']}>
                  <p>
                    Unser Sortiment umfasst Waschtische, WCs, Dusch-WCs, Badewannen, Duschwannen und Duschlösungen.
                    Wir achten darauf, dass Masse, Anschlüsse und Nutzung zur Raumsituation passen und die einzelnen
                    Produkte eine gemeinsame Linie bilden.
                  </p>
                </div>
              </div>
              <div className={styles['category-image']}>
                <img src={sanitaerapparateImage} alt="Wandhängendes WC und Bidet in Schwarz neben einem Waschtischmöbel aus Holz" />
              </div>
            </div>
          </div>

          {/* Heizkörper */}
          <div className={`${styles['category-section']} ${styles.dark} ${styles.reverse}`}>
            <div className={styles['category-content']}>
              <div className={styles['category-text']}>
                <h3 className={styles['category-title']}>Wärme, Format und Anschluss zusammen planen</h3>
                <div className={styles['category-description']}>
                  <p>
                    Handtuch- und Designheizkörper sind in unterschiedlichen Grössen, Formen und Farben erhältlich.
                    Wir stimmen Modell, Heizleistung und Anschlussposition auf den Raum und die übrige Ausstattung ab.
                  </p>
                </div>
              </div>
              <div className={styles['category-image']}>
                <img src={heizkoerperImage} alt="Vertikaler Designheizkörper in einem Wohnraum" />
              </div>
            </div>
          </div>

          {/* Beleuchtungen */}
          <div className={`${styles['category-section']} ${styles.light}`}>
            <div className={styles['category-content']}>
              <div className={styles['category-text']}>
                <h3 className={styles['category-title']}>Licht für Alltag und Atmosphäre</h3>
                <div className={styles['category-description']}>
                  <p>
                    Gutes Licht am Spiegel erfüllt eine andere Aufgabe als die Beleuchtung des gesamten Raums. Wir
                    kombinieren Funktions- und Stimmungslicht passend zu Oberflächen, Farben und Nutzung.
                  </p>
                </div>
              </div>
              <div className={styles['category-image']}>
                <img src={beleuchtungenImage} alt="Zylindrische Pendelleuchten in Schwarz mit Messingdetails" />
              </div>
            </div>
          </div>

          {/* Accessoires */}
          <div className={`${styles['category-section']} ${styles.dark} ${styles.reverse}`}>
            <div className={styles['category-content']}>
              <div className={styles['category-text']}>
                <h3 className={styles['category-title']}>Die letzte Auswahl soll nicht zufällig sein</h3>
                <div className={styles['category-description']}>
                  <p>
                    Handtuchhalter, Papierrollenhalter, Haken, Seifenhalter und weitere Accessoires führen Form und
                    Oberfläche der Armaturen weiter. So wirkt der Raum bis ins Detail abgestimmt.
                  </p>
                </div>
              </div>
              <div className={styles['category-image']}>
                <img src={accessoiresImage} alt="Schwarzer Wandhalter mit zwei Seifenspendern" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* CTA Section */}
      <section className={`${styles['cta-section']}`}>
        <div className={styles['cta-container']}>
          <div className={styles['cta-content']}>
            <h2 className={styles['cta-title']}>Bringen Sie mit, was Sie bereits haben.</h2>
            <p className={styles['cta-description']}>
              Fotos, Grundriss, Masse, ein Materialmuster oder nur eine erste Idee: Wir beginnen dort, wo Ihr Projekt
              heute steht, und stellen mit Ihnen die nächsten Entscheidungen zusammen.
            </p>
            <div className={styles['cta-buttons']}>
              <Link to="/kontakt" className={`${styles['cta-button']} ${styles.primary}`}>
                <span>Auswahlberatung anfragen</span>
                <svg className={styles['cta-arrow']} viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link to="/dienstleistungen" className={`${styles['cta-button']} ${styles.secondary}`}>
                <span>Dienstleistungen ansehen</span>
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
            { name: "Platten für Wand, Boden und Aussenbereich", anchor: "platten" },
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
