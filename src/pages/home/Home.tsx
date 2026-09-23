import React from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '../../components';
import { business, bathPackages, localBusinessJsonLd } from '../../config/business';
import { homeReferencePhotos, photoUrl, referenceById } from '../../data/references';
import { areas, packImages, supplierByKey, supplierHref, suppliers, suppliersInArea, type SupplierImage, type SupplierKey } from '../../data/suppliers';
import styles from './Home.module.css';

const kitchen = referenceById('kueche-insel-messing');
const heroRef = referenceById('bad-marmoroptik-grau-schwarz');
const heroPhoto = heroRef?.photos.find((p) => p.file === 'bad-marmor-grau-02.webp');

type Story = {
  id: string; title: string; label: string; text: string; href: string; more: string;
  image: SupplierImage; sizes: string; credit: { prefix: string; label: string; href: string };
};

// Vier Bereiche als Bildgeschichten; der Bildnachweis führt zur Marke bzw. zur Referenz.
const stories: Story[] = [
  { id: 'bereich-bad', title: 'Bad', label: 'Aufeinander abgestimmt', text: 'Badmöbel, Waschtische, Armaturen, Keramik, Dusche und Badewanne – gemeinsam ausgewählt, damit Form, Farbe und Funktion zusammenpassen.', href: '/produkte#bad', more: 'Bad ansehen',
    image: packImages.edone, sizes: '(max-width: 767px) 100vw, 60vw', credit: { prefix: 'Marke', label: 'Edoné', href: supplierHref('edone') } },
  { id: 'bereich-kuechen', title: 'Küchen', label: 'Für Ihren Alltag geplant', text: 'Raumaufteilung, Fronten, Arbeitsflächen, Geräte und Licht. Mit 3D-Planung, Lieferung, Montage und auf Wunsch mit Renovation der bestehenden Küche.', href: '/produkte#kuechen', more: 'Küchen ansehen',
    image: { src: photoUrl('kueche-insel-messing-01.webp'), srcSet: `${photoUrl('kueche-insel-messing-01.webp', true)} 480w, ${photoUrl('kueche-insel-messing-01.webp')} 900w`, width: 900, height: 1600, alt: 'Realisierte Küche mit Insel, Messingdetails und Einbaugeräten' },
    sizes: '(max-width: 767px) 100vw, (max-width: 1100px) 50vw, 36vw', credit: { prefix: 'Referenz', label: kitchen?.title ?? 'Referenzen', href: '/referenzen#kueche-insel-messing' } },
  { id: 'bereich-platten', title: 'Platten', label: 'Vom Muster in den Raum', text: 'Keramik, Feinsteinzeug, Mosaik und Grossformate für Wand und Boden – ausgewählt nach Wirkung, Nutzung und Pflege.', href: '/produkte#platten', more: 'Platten ansehen',
    image: packImages.lafabbrica, sizes: '(max-width: 767px) 100vw, 70vw', credit: { prefix: 'Marke', label: 'La Fabbrica AVA', href: supplierHref('lafabbrica') } },
  { id: 'bereich-wellness', title: 'Wellness', label: 'Entspannung, die zum Raum passt', text: 'Sauna, Dampfbad, Wellnesskabine oder Whirlwanne. Wir klären Platz, Anschlüsse und Nutzung und zeigen Ihnen passende Möglichkeiten.', href: '/produkte#wellness', more: 'Wellness ansehen',
    image: packImages.novelliniOasis, sizes: '(max-width: 767px) 100vw, 55vw', credit: { prefix: 'Marke', label: 'Novellini', href: supplierHref('novellini') } },
];

// Marken mit mehreren Bildern als Vorschau im Markenindex.
const featured: SupplierKey[] = ['novellini', 'febal', 'megius'];
const brandColumns = [...areas.map((a) => ({ id: a.id, title: a.title })), { id: 'weitere' as const, title: 'Weitere Marken' }];

const Home: React.FC = () => {
  const showroomImage = photoUrl('ausstellung-zofingen-01.webp');
  return (
    <main id="main-content" className={styles.home}>
      <SEOHead title="Bad, Küchen, Platten & Wellness in Zofingen | New Living Design"
        description="Bad, Küchen, Platten und Wellness in Zofingen: Materialien vergleichen, persönlich beraten lassen und Bad oder Küche auf Wunsch in 3D planen."
        keywords="Bad Zofingen, Küchen Zofingen, Küchenplanung, Badmöbel, Platten, Keramikplatten, Wellness, Ausstellung Zofingen, New Living Design"
        url="/" type="website" structuredData={localBusinessJsonLd} image={`${business.siteUrl}${showroomImage}`} />

      {/* Hero: vollflächiges Projektbild, Typografie-Panel ragt in den nächsten Abschnitt */}
      <section className={styles.hero} aria-labelledby="home-title">
        <figure className={styles.heroFigure}>
          <img src={photoUrl('bad-marmor-grau-02.webp')} alt={heroPhoto?.alt ?? ''} width="1600" height="1102" fetchPriority="high" />
          {heroRef && <figcaption><Link to={`/referenzen#${heroRef.id}`}>{heroRef.title}</Link></figcaption>}
        </figure>
        <div className={styles.heroPanel}>
          <p className={styles.eyebrow}><span className={styles.dot} /> Ausstellung in Zofingen</p>
          <h1 id="home-title" className={styles.heroTitle}>Bad, Küchen, Platten &amp; Wellness.</h1>
          <p className={styles.heroLead}>Nicht einzeln ausgesucht. Als Raum gedacht.</p>
          <p className={styles.heroText}>Wir kombinieren Materialien, Farben und Produkte so, dass sie zu Ihrem Raum, Ihrem Stil und Ihrem Budget passen. Wir beraten Sie persönlich in unserer Ausstellung in Zofingen. Bad und Küche visualisieren wir auf Wunsch in 3D.</p>
          <div className={styles.actions}>
            <Link to="/kontakt" className={`${styles.button} ${styles.buttonLight}`}>Ausstellungsberatung anfragen</Link>
            <a href="#sortiment" className={styles.textLink}>Produkte entdecken</a>
          </div>
          <div className={styles.heroAddress}><span>{business.address.street}</span><span>{business.address.zip} {business.address.city}</span></div>
        </div>
      </section>

      {/* Vier Bereiche als Reise: Index, dann versetzte Bildgeschichten */}
      <section id="sortiment" className={styles.journey} aria-labelledby="sortiment-title">
        <div className={styles.container}>
          <div className={styles.journeyHead}>
            <div><p className={styles.eyebrow}>Bad, Küchen, Platten und Wellness</p><h2 id="sortiment-title">Vier Bereiche. Eine stimmige Auswahl.</h2></div>
            <nav aria-label="Bereiche" className={styles.index}>
              <ol>{stories.map((s, i) => <li key={s.id}><a href={`#${s.id}`}><span>{String(i + 1).padStart(2, '0')}</span>{s.title}</a></li>)}</ol>
            </nav>
            <Link to="/produkte" className={styles.textLink}>Alle Produkte ansehen</Link>
          </div>
          {stories.map((s, i) => (
            <article key={s.id} id={s.id} className={`${styles.story} ${styles[`story${i + 1}`]}`} aria-labelledby={`${s.id}-title`}>
              <figure className={styles.storyFigure}>
                <img {...s.image} sizes={s.sizes} loading="lazy" decoding="async" />
                <figcaption>{s.credit.prefix}: <Link to={s.credit.href}>{s.credit.label}</Link></figcaption>
              </figure>
              <div className={styles.storyText}>
                <span className={styles.storyNumber} aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <h3 id={`${s.id}-title`}>{s.title}</h3>
                <p className={styles.storyLabel}>{s.label}</p>
                <p className={styles.storyBody}>{s.text}</p>
                <Link to={s.href} className={styles.textLink}>{s.more}</Link>
              </div>
            </article>
          ))}
          <p className={styles.imageNote}>Die gezeigte Küche wurde von uns realisiert. Weitere Motive zeigen ausgewählte Produkte unserer Lieferanten. Auswahl und Verfügbarkeit klären wir persönlich mit Ihnen.</p>
        </div>
      </section>

      {/* Markenindex: alle Marken nach Bereich, jede führt zu ihren Bildern und Angaben */}
      <section className={styles.brands} aria-labelledby="brands-title">
        <div className={`${styles.container} ${styles.brandsGrid}`}>
          <div className={styles.brandsIntro}>
            <p className={styles.eyebrow}>Unsere Marken</p>
            <h2 id="brands-title">Marken, aus denen eine stimmige Auswahl wird.</h2>
            <p>Nicht jedes Produkt passt zu jedem Raum. Wir nutzen die Sortimente unserer Partner, um Materialien, Funktionen und Oberflächen passend zu Ihrem Projekt zusammenzustellen.</p>
            <Link to="/partner" className={styles.textLink}>Alle {suppliers.length} Marken ansehen</Link>
          </div>
          <ul className={styles.featured} aria-label="Marken mit mehreren Bildern">
            {featured.map((key) => {
              const s = supplierByKey(key);
              return (
                <li key={key}>
                  <Link to={supplierHref(key)}>
                    <span className={styles.featuredStack} aria-hidden="true">
                      {s.images.slice(1, 3).map((img) => <img key={img.src} src={img.src} srcSet={img.srcSet} sizes="200px" width={img.width} height={img.height} alt="" loading="lazy" decoding="async" />)}
                      <img src={s.images[0].src} srcSet={s.images[0].srcSet} sizes="(max-width: 767px) 33vw, 360px" width={s.images[0].width} height={s.images[0].height} alt="" loading="lazy" decoding="async" />
                    </span>
                    <span className={styles.featuredName}>{s.name}</span>
                    <span className={styles.featuredCount}>{s.images.length} Bilder</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className={styles.brandIndex}>
            {brandColumns.map((col) => (
              <div key={col.id}>
                <h3>{col.title}</h3>
                <ul>
                  {suppliersInArea(col.id).map((s) => (
                    <li key={s.key}>
                      <Link to={supplierHref(s.key)}>{s.name}</Link>
                      {s.images.length > 0 && <span className={styles.imageCount} aria-label={`${s.images.length} ${s.images.length === 1 ? 'Bild' : 'Bilder'}`}>{s.images.length}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.showroom} aria-labelledby="showroom-title">
        <div className={`${styles.container} ${styles.showroomGrid}`}>
          <figure className={styles.showroomFigure}>
            <img src={showroomImage} srcSet={`${photoUrl('ausstellung-zofingen-01.webp', true)} 480w, ${showroomImage} 1200w`} sizes="(max-width: 767px) 100vw, 40vw" alt="Einblick in unsere Ausstellung in Zofingen: Waschtische, ovale Spiegel und eine Wand in Onyxoptik" width="1200" height="1600" loading="lazy" decoding="async" />
            <figcaption><span>New Living Design</span><span>Unsere Ausstellung</span></figcaption>
          </figure>
          <div className={styles.showroomText}>
            <p className={styles.eyebrow}>Ausstellung in Zofingen</p><h2 id="showroom-title">Was am Bildschirm gefällt, muss im Raum überzeugen.</h2>
            <p className={styles.showroomIntro}>Oberflächen wirken je nach Licht, Format und Umgebung anders. In unserer Ausstellung vergleichen Sie Platten, Möbel, Armaturen und Farben direkt miteinander. Wir stellen mit Ihnen eine Auswahl zusammen, die nicht nur einzeln gefällt, sondern als Ganzes funktioniert.</p>
            <Link to="/kontakt" className={`${styles.button} ${styles.buttonLight}`}>Beratung in Zofingen anfragen</Link>
          </div>
          <div className={styles.visitCard}>
            <p className={styles.visitLabel}>Wir freuen uns auf Ihren Besuch.</p>
            <address><strong>{business.address.street}</strong><br />{business.address.zip} {business.address.city}</address>
            <dl>{business.openingHours.map((hours) => <div key={hours.days}><dt>{hours.days}</dt><dd>{hours.opens}–{hours.closes}</dd></div>)}</dl>
            <p className={styles.visitNote}>{business.openingHoursNote}</p>
            <div className={styles.visitLinks}><a href={business.mapsLink} target="_blank" rel="noopener noreferrer" className={styles.textLink}>Route planen</a><a href={`tel:${business.phone.e164}`} className={styles.textLink}>{business.phone.display}</a></div>
            <a href={business.mapsLink} target="_blank" rel="noopener noreferrer" className={styles.reviewLink}>Kundenstimmen auf Google lesen</a>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.references}`} aria-labelledby="references-title">
        <div className={styles.container}>
          <div className={styles.sectionHead}><div><p className={styles.eyebrow}>Echte Projekte aus der Region</p><h2 id="references-title">Von uns geplant. Für Kunden realisiert.</h2></div><Link to="/referenzen" className={styles.textLink}>Referenzen ansehen</Link></div>
          <div className={styles.referenceGrid}>
            {homeReferencePhotos.map(({ reference, photo }) => (
              <Link key={reference.id} to={`/referenzen#${reference.id}`} className={styles.referenceCard}>
                <img src={photoUrl(photo.file, true)} srcSet={`${photoUrl(photo.file, true)} 480w, ${photoUrl(photo.file)} 1067w`} sizes="(max-width: 767px) 100vw, 40vw" alt={photo.alt} loading="lazy" decoding="async" width="480" height="640" /><div><h3>{reference.title}</h3></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.planner} aria-labelledby="planner-title">
        <div className={`${styles.container} ${styles.plannerInner}`}>
          <div><p className={styles.eyebrow}>Ein erster Eindruck</p><h2 id="planner-title">Ein Ideenbild, bevor Sie sich festlegen.</h2><p>Mit dem Badplaner probieren Sie ausgewählte Materialien und Farben auf einem Foto Ihres Badezimmers aus. Das Ergebnis ist eine erste Inspiration – kostenlos und unverbindlich, aber keine verbindliche Planung.</p></div>
          <Link to="/badplaner" className={`${styles.button} ${styles.buttonLight}`}>Badplaner ausprobieren</Link>
        </div>
      </section>

      <section className={`${styles.section} ${styles.renovation}`} aria-labelledby="renovation-title">
        <div className={styles.container}>
          <div className={styles.sectionHead}><div><p className={styles.eyebrow}>Wenn Sie nicht nur Produkte suchen</p><h2 id="renovation-title">Vom ausgewählten Bad zum kompletten Umbau.</h2><p className={styles.renovationIntro}>Für Badumbauten im Umkreis von rund 40 km um Zofingen koordinieren wir auf Wunsch den gesamten Ablauf – von der Demontage über Sanitär-, Elektro- und Plattenarbeiten bis zur Montage und Übergabe. Unsere drei Badpakete geben Ihnen dafür eine klare erste Preisorientierung.</p></div><Link to="/badumbau-zofingen" className={styles.textLink}>Badumbau und Pakete ansehen</Link></div>
          <div className={styles.packageRow}>{bathPackages.map((pkg) => <Link key={pkg.id} to={`/badumbau-zofingen#paket-${pkg.id}`}><span>{pkg.name}</span><strong>ab CHF {pkg.priceLabel}</strong></Link>)}</div>
          <p className={styles.imageNote}>Richtpreise inkl. Material, Montage und MwSt. Der Fixpreis gilt nach der Besichtigung vor Ort.</p>
        </div>
      </section>

      <section className={styles.contact} aria-labelledby="contact-title">
        <div className={`${styles.container} ${styles.contactInner}`}>
          <div><p className={styles.eyebrow}>Der nächste Schritt</p><h2 id="contact-title">Was möchten Sie verändern?</h2><p>Bringen Sie Fotos, einen Grundriss oder einfach Ihre erste Idee mit. Wir klären gemeinsam, welche Produkte und welcher nächste Schritt zu Ihrem Projekt passen.</p></div>
          <div className={styles.contactActions}><Link to="/kontakt" className={styles.button}>Beratung anfragen</Link><a href={`tel:${business.phone.e164}`} className={styles.textLink}>{business.phone.display} anrufen</a></div>
        </div>
      </section>
    </main>
  );
};

export default Home;
