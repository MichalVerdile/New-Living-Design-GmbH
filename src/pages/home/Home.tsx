import React from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '../../components';
import { business, bathPackages, localBusinessJsonLd } from '../../config/business';
import { homeReferencePhotos, photoUrl } from '../../data/references';
import bathroomImage from '../../assets/PRIME_mobili_generale.webp';
import tilesImage from '../../assets/Dosem_Onyx_WhiteBlue_60x120120x270_bathroom_HD_1.jpg';
import wellnessImage from '../../assets/Zen_Combi_duo_Linear_6-1030x1030.webp';
import styles from './Home.module.css';

const categories = [
  { title: 'Bad', label: 'Aufeinander abgestimmt', text: 'Badmöbel, Waschtische, Armaturen, Keramik, Dusche und Badewanne – gemeinsam ausgewählt, damit Form, Farbe und Funktion zusammenpassen.', href: '/produkte#bad', image: bathroomImage, alt: 'Badmöbel und Waschtisch aus dem Produktsortiment' },
  { title: 'Küchen', label: 'Für Ihren Alltag geplant', text: 'Raumaufteilung, Fronten, Arbeitsflächen, Geräte und Licht. Mit 3D-Planung, Lieferung, Montage und auf Wunsch mit Renovation.', href: '/produkte#kuechen', image: photoUrl('kueche-insel-messing-01.webp', true), alt: 'Realisierte Küche mit Insel, Messingdetails und Einbaugeräten' },
  { title: 'Platten', label: 'Vom Muster in den Raum', text: 'Keramik, Feinsteinzeug, Mosaik und Grossformate für Wand und Boden – ausgewählt nach Wirkung, Nutzung und Pflege.', href: '/produkte#platten', image: tilesImage, alt: 'Badezimmer mit grossformatigen Wandplatten in blauer und weisser Onyxoptik' },
  { title: 'Wellness', label: 'Passend zu Raum und Nutzung', text: 'Sauna, Dampfbad, Wellnesskabine oder Whirlwanne. Wir klären Platz, Anschlüsse und die passenden Möglichkeiten.', href: '/produkte#wellness', image: wellnessImage, alt: 'Wellness-Kabine aus dem Produktsortiment' },
];

const Home: React.FC = () => {
  const showroomImage = photoUrl('ausstellung-zofingen-01.webp');
  return (
    <main id="main-content" className={styles.home}>
      <SEOHead title="Bad, Küchen, Platten & Wellness in Zofingen | New Living Design"
        description="Bad, Küchen, Platten und Wellness in Zofingen: Materialien vergleichen, persönlich beraten lassen und Bad oder Küche auf Wunsch in 3D planen."
        keywords="Bad Zofingen, Küchen Zofingen, Küchenplanung, Badmöbel, Platten, Keramikplatten, Wellness, Ausstellung Zofingen, New Living Design"
        url="/" type="website" structuredData={localBusinessJsonLd} image={`${business.siteUrl}${showroomImage}`} />

      <section className={styles.hero} aria-labelledby="home-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}><span className={styles.dot} /> Ausstellung in Zofingen</p>
          <h1 id="home-title" className={styles.heroTitle}>Bad, Küchen,<br />Platten &amp; Wellness.</h1>
          <p className={styles.heroLead}>Nicht einzeln ausgesucht. Als Raum gedacht.</p>
          <p className={styles.heroText}>Wir kombinieren Materialien, Farben und Produkte so, dass sie zu Ihrem Raum, Ihrem Stil und Ihrem Budget passen. Bad und Küche visualisieren wir auf Wunsch in 3D.</p>
          <div className={styles.actions}>
            <Link to="/kontakt" className={styles.button}>Ausstellungsberatung anfragen</Link>
            <a href="#sortiment" className={styles.textLink}>Produkte entdecken</a>
          </div>
          <div className={styles.heroAddress}><span>{business.address.street}</span><span>{business.address.zip} {business.address.city}</span></div>
        </div>
        <figure className={styles.heroFigure}>
          <img src={showroomImage} alt="Einblick in unsere Ausstellung in Zofingen: Waschtische, ovale Spiegel und eine Wand in Onyxoptik" width="1200" height="1600" fetchPriority="high" />
          <figcaption><span>New Living Design</span><span>Unsere Ausstellung</span></figcaption>
        </figure>
      </section>

      <section id="sortiment" className={`${styles.section} ${styles.assortment}`} aria-labelledby="sortiment-title">
        <div className={styles.container}>
          <div className={styles.sectionHead}><div><p className={styles.eyebrow}>Bad, Küchen, Platten und Wellness</p><h2 id="sortiment-title">Vier Bereiche. Eine stimmige Auswahl.</h2></div><Link to="/produkte" className={styles.textLink}>Alle Produkte ansehen</Link></div>
          <div className={styles.categoryGrid}>
            {categories.map((category) => (
              <Link key={category.title} to={category.href} className={styles.categoryCard}>
                <div className={styles.categoryImage}><img src={category.image} alt={category.alt} width="640" height="600" loading="lazy" /></div>
                <div className={styles.categoryHeading}><h3>{category.title}</h3></div>
                <p className={styles.categoryLabel}>{category.label}</p><p className={styles.categoryText}>{category.text}</p>
              </Link>
            ))}
          </div>
          <p className={styles.imageNote}>Die Küche zeigt eine ausgeführte Referenz; weitere Bilder zeigen das Sortiment unserer Lieferanten. Auswahl und Verfügbarkeit besprechen wir persönlich.</p>
        </div>
      </section>

      <section className={`${styles.section} ${styles.showroom}`} aria-labelledby="showroom-title">
        <div className={`${styles.container} ${styles.showroomGrid}`}>
          <div><p className={styles.eyebrow}>Ausstellung in Zofingen</p><h2 id="showroom-title">Was am Bildschirm gefällt, muss im Raum überzeugen.</h2>
            <p className={styles.showroomIntro}>Oberflächen wirken je nach Licht, Format und Umgebung anders. In unserer Ausstellung vergleichen Sie Platten, Möbel, Armaturen und Farben direkt miteinander.</p>
            <Link to="/kontakt" className={styles.button}>Beratung in Zofingen anfragen</Link>
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
                <img src={photoUrl(photo.file, true)} alt={photo.alt} loading="lazy" width="640" height="853" /><div><h3>{reference.title}</h3></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.planner} aria-labelledby="planner-title">
        <div className={`${styles.container} ${styles.plannerInner}`}>
          <div><p className={styles.eyebrow}>Ein erster Eindruck</p><h2 id="planner-title">Ihre Materialien.<br />In Ihrem Bad.</h2><p>Mit dem Badplaner probieren Sie Farben und Materialien auf einem Foto Ihres Bads aus. Kostenlos und unverbindlich – als Ideenbild, nicht als verbindliche Planung.</p></div>
          <Link to="/badplaner" className={`${styles.button} ${styles.buttonLight}`}>Badplaner ausprobieren</Link>
        </div>
      </section>

      <section className={`${styles.section} ${styles.renovation}`} aria-labelledby="renovation-title">
        <div className={styles.container}>
          <div className={styles.sectionHead}><div><p className={styles.eyebrow}>Wenn Sie nicht nur Produkte suchen</p><h2 id="renovation-title">Vom ausgewählten Bad zum kompletten Umbau.</h2><p className={styles.renovationIntro}>Für Badumbauten im Umkreis von rund 40 km um Zofingen koordinieren wir auf Wunsch den gesamten Ablauf. Drei Badpakete geben Ihnen eine klare erste Preisorientierung.</p></div><Link to="/badumbau-zofingen" className={styles.textLink}>Badumbau und Pakete ansehen</Link></div>
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
