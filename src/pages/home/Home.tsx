import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './Home.module.css';
import trinidadImage from '../../assets/FebalCasa_Cucina_Moderna_Origina_AntaProfiloAlluminio_Vol1_Compo8e.webp';
import clubRoomImage from '../../assets/22-Private-House-Club-Room.jpg.webp';
import { SEOHead } from '../../components';
import { business, bathPackages, localBusinessJsonLd } from '../../config/business';
import { badumbauFaq } from '../../data/faq';
import { homeReferencePhotos, photoUrl } from '../../data/references';
import { posts as blogPosts, formatDate } from '../../lib/blog';

const GOOGLE_RATING = { value: '5.0', count: 23 }; // Google Unternehmensprofil, Stand September 2026

const Home: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const homeFaq = badumbauFaq.slice(0, 4);
  const heroImage = photoUrl('bad-marmor-grau-01.webp');

  return (
    <main id="main-content" className={styles.home}>
      <SEOHead
        title="Badumbau & Küchen in Zofingen | New Living Design"
        description={`Badumbau, Küchen und Platten aus einer Hand in Zofingen (AG): Ausstellung, 3D-Planung, eigene Equipe. Drei Badpakete mit Fixpreis ab CHF ${bathPackages[0].priceLabel}. Wir arbeiten in Aarau, Olten, Sursee, Langenthal und Umgebung.`}
        keywords="Badumbau Zofingen, Badezimmer Zofingen, Küchen Zofingen, Badsanierung Aargau, Bäderstudio Zofingen, Plattenleger Zofingen, Badplanung 3D, New Living Design"
        url="/"
        type="website"
        structuredData={localBusinessJsonLd}
        image={`${business.siteUrl}${heroImage}`}
      />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles['hero-background']}>
          <div className={styles['hero-overlay']}></div>
          <img
            src={heroImage}
            alt="Badumbau von New Living Design Zofingen: Bad in grauer Marmoroptik mit schwarzen Armaturen"
            className={styles['hero-bg-image']}
            fetchPriority="high"
          />
        </div>
        <div className={styles['hero-container']}>
          <div className={`${styles['hero-content']} ${isVisible ? styles.visible : ''}`}>
            <h1 className={styles['hero-title']}>
              <span className={styles['title-line']}>Badumbau und Küchen in Zofingen</span>
              <span className={styles['title-highlight']}>New Living Design</span>
            </h1>
            <div className={styles['hero-description']}>
              <p>
                Ausstellung, 3D-Planung und Umbau aus einer Hand. Drei Badpakete mit Fixpreis ab CHF {bathPackages[0].priceLabel},
                Farbe ohne Aufpreis. Für Zofingen, Aarau, Olten, Sursee, Langenthal und Umgebung.
              </p>
            </div>
            <div className={styles['hero-actions']}>
              <Link to="/badumbau-zofingen" className={styles['hero-cta']}>Badumbau und Preise</Link>
              <a href={`tel:${business.phone.e164}`} className={styles['hero-cta-secondary']}>{business.phone.display}</a>
            </div>
            <p className={styles['hero-meta']}>
              Ausstellung {business.address.street}, {business.address.zip} {business.address.city} · Mo–Fr {business.openingHours[0].opens}–{business.openingHours[0].closes}, Sa {business.openingHours[1].opens}–{business.openingHours[1].closes}
            </p>
          </div>
          <div className={styles['hero-scroll-indicator']}>
            <div className={styles['scroll-dot']}></div>
            <span>Scrollen Sie nach unten</span>
          </div>
        </div>
      </section>

      {/* Badpakete */}
      <section className={styles.packages}>
        <div className={styles['packages-container']}>
          <div className={styles['section-header']}>
            <span className={styles['section-label']}>Was kostet ein Badumbau?</span>
            <h2 className={styles['section-title']}>Drei Badpakete, ein Fixpreis</h2>
            <p className={styles['section-intro']}>
              Richtpreise inkl. Material, Montage und MwSt. für ein Bad von 6 bis 8 m². Innerhalb der Serie wählen Sie
              Platten, Farben und Armaturen frei.
            </p>
          </div>
          <div className={styles['packages-grid']}>
            {bathPackages.map((p) => (
              <Link key={p.id} to={`/badumbau-zofingen#paket-${p.id}`} className={`${styles['package-card']} ${p.highlight ? styles['package-card-highlight'] : ''}`}>
                <span className={styles['package-name']}>{p.name}</span>
                <span className={styles['package-price']}>ab CHF {p.priceLabel}</span>
                <span className={styles['package-claim']}>{p.claim}</span>
                <span className={styles['package-link']}>Details und Inhalt →</span>
              </Link>
            ))}
          </div>

          {/* Hinweis auf den Badplaner */}
          <aside className={styles['planner-box']}>
            <div>
              <span className={styles['planner-eyebrow']}>Neu</span>
              <h3>Badplaner – Ihr Bad als Ideenbild</h3>
              <p>Paket wählen, Foto vom Bad machen, in 30 Sekunden ein Ideenbild erhalten. Kostenlos und unverbindlich.</p>
            </div>
            <Link to="/badplaner" className={styles['planner-cta']}>Badplaner starten</Link>
          </aside>
        </div>
      </section>

      {/* Bewertungen */}
      <section className={styles.reviews}>
        <div className={styles['reviews-container']}>
          <div className={styles['reviews-rating']}>
            <span className={styles['reviews-stars']} aria-hidden="true">★★★★★</span>
            <span className={styles['reviews-value']}>{GOOGLE_RATING.value}</span>
          </div>
          <p className={styles['reviews-text']}>
            <strong>{GOOGLE_RATING.count} Bewertungen bei Google</strong>, Durchschnitt {GOOGLE_RATING.value} von 5. Unsere Kunden aus der Region
            schreiben über Beratung, Ausführung und das fertige Bad.
          </p>
          <div className={styles['reviews-actions']}>
            <a href="https://www.google.com/maps/search/?api=1&query=New+Living+Design+Zofingen" target="_blank" rel="noopener noreferrer" className={styles['reviews-link']}>
              Bewertungen lesen
            </a>
            <a href={business.reviewLink} target="_blank" rel="noopener noreferrer" className={styles['reviews-link-secondary']}>
              Bewertung schreiben
            </a>
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

      {/* Referenzen */}
      <section className={styles.references}>
        <div className={styles['references-container']}>
          <div className={styles['section-header']}>
            <span className={styles['section-label']}>Referenzen</span>
            <h2 className={styles['section-title']}>Bäder und Küchen, die wir gebaut haben</h2>
          </div>
          <div className={styles['references-grid']}>
            {homeReferencePhotos.map(({ reference, photo }) => (
              <Link key={reference.id} to={`/referenzen#${reference.id}`} className={styles['reference-card']}>
                <img src={photoUrl(photo.file, true)} alt={photo.alt} loading="lazy" width="640" height="853" />
                <span className={styles['reference-caption']}>{reference.title}</span>
              </Link>
            ))}
          </div>
          <div className={styles['references-cta-container']}>
            <Link to="/referenzen" className={styles['services-cta']}>
              <span>Alle Referenzen</span>
              <svg className={styles['cta-arrow']} viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Blog */}
      {blogPosts.length > 0 && (
        <section className={styles.blog}>
          <div className={styles['blog-container']}>
            <div className={styles['section-header']}>
              <span className={styles['section-label']}>Aus dem Blog</span>
              <h2 className={styles['section-title']}>Wissen aus unseren Baustellen</h2>
            </div>
            <div className={styles['blog-grid']}>
              {blogPosts.slice(0, 3).map((p) => (
                <Link key={p.slug} to={p.url} className={styles['blog-card']}>
                  <img src={p.image} alt={p.imageAlt} loading="lazy" width="800" height="533" />
                  <div className={styles['blog-card-text']}>
                    <span className={styles['blog-card-meta']}>{p.category} · {formatDate(p.date)}</span>
                    <h3>{p.title}</h3>
                    <p>{p.description}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className={styles['references-cta-container']}>
              <Link to="/blog" className={styles['services-cta']}>
                <span>Alle Beiträge</span>
                <svg className={styles['cta-arrow']} viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className={styles.faq}>
        <div className={styles['faq-container']}>
          <div className={styles['section-header']}>
            <span className={styles['section-label']}>Häufige Fragen</span>
            <h2 className={styles['section-title']}>Kosten, Dauer, Ablauf</h2>
          </div>
          <div className={styles['faq-list']}>
            {homeFaq.map((item) => (
              <details key={item.question} className={styles['faq-item']}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
          <div className={styles['faq-cta-container']}>
            <Link to="/badumbau-zofingen#faq" className={styles['faq-link']}>Alle Fragen zum Badumbau</Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
