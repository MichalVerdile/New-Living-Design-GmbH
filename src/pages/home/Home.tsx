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
  { title: 'Bad', label: 'Ihr persönlicher Rückzugsort', text: 'Badmöbel, Armaturen und Keramik. Finden Sie die Formen und Oberflächen, die zu Ihnen passen.', href: '/produkte#bad', image: bathroomImage, alt: 'Badmöbel und Waschtisch aus dem Produktsortiment' },
  { title: 'Platten', label: 'Materialien mit Ausdruck', text: 'Für Wand und Boden. Entdecken Sie Farben, Strukturen und Formate für ein stimmiges Ganzes.', href: '/produkte#platten', image: tilesImage, alt: 'Badezimmer mit grossformatigen Wandplatten in blauer und weisser Onyxoptik' },
  { title: 'Wellness', label: 'Raum zum Abschalten', text: 'Entdecken Sie unser Wellness-Sortiment. Wir beraten Sie zu den Möglichkeiten für Ihre Räume.', href: '/produkte#wellness', image: wellnessImage, alt: 'Wellness-Kabine aus dem Produktsortiment' },
];

const Arrow = () => <span aria-hidden="true">↗</span>;

const Home: React.FC = () => {
  const showroomImage = photoUrl('ausstellung-zofingen-01.webp');
  return (
    <main id="main-content" className={styles.home}>
      <SEOHead title="Bad, Platten & Wellness in Zofingen | New Living Design"
        description="Bad, Platten und Wellness: Entdecken Sie unser Sortiment und finden Sie Ihre Materialien mit persönlicher Beratung in unserer Ausstellung in Zofingen."
        keywords="Bad Zofingen, Badmöbel, Platten, Keramikplatten, Wellness, Ausstellung Zofingen, New Living Design"
        url="/" type="website" structuredData={localBusinessJsonLd} image={`${business.siteUrl}${showroomImage}`} />

      <section className={styles.hero} aria-labelledby="home-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}><span className={styles.dot} /> Ausstellung in Zofingen</p>
          <h1 id="home-title" className={styles.heroTitle}>Bad, Platten<br />&amp; <em>Wellness.</em></h1>
          <p className={styles.heroLead}>Für Räume mit Charakter.</p>
          <p className={styles.heroText}>Materialien entdecken, Oberflächen fühlen, Lieblingsstücke finden. Wir unterstützen Sie bei der Auswahl – persönlich in unserer Ausstellung.</p>
          <div className={styles.actions}>
            <Link to="/kontakt" className={styles.button}>Ausstellungsberatung anfragen <Arrow /></Link>
            <a href="#sortiment" className={styles.textLink}>Sortiment entdecken <span aria-hidden="true">↓</span></a>
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
          <div className={styles.sectionHead}><div><p className={styles.eyebrow}>Drei Welten. Ihr Stil.</p><h2 id="sortiment-title">Was passt zu Ihnen?</h2></div><Link to="/produkte" className={styles.textLink}>Das ganze Sortiment <Arrow /></Link></div>
          <div className={styles.categoryGrid}>
            {categories.map((category, index) => (
              <Link key={category.title} to={category.href} className={styles.categoryCard}>
                <div className={styles.categoryImage}><img src={category.image} alt={category.alt} width="640" height="600" loading="lazy" /><span className={styles.categoryNumber}>0{index + 1}</span></div>
                <div className={styles.categoryHeading}><h3>{category.title}</h3><span className={styles.roundArrow} aria-hidden="true">↗</span></div>
                <p className={styles.categoryLabel}>{category.label}</p><p className={styles.categoryText}>{category.text}</p>
              </Link>
            ))}
          </div>
          <p className={styles.imageNote}>Sortimentsbilder unserer Lieferanten. Auswahl und Verfügbarkeit besprechen wir persönlich.</p>
        </div>
      </section>

      <section className={`${styles.section} ${styles.showroom}`} aria-labelledby="showroom-title">
        <div className={`${styles.container} ${styles.showroomGrid}`}>
          <div><p className={styles.eyebrow}>Von der Idee zur Auswahl</p><h2 id="showroom-title">Am Bildschirm entdecken.<br /><em>Vor Ort entscheiden.</em></h2>
            <p className={styles.showroomIntro}>Wie fühlt sich eine Oberfläche an? Welche Farbe passt zum Möbel? In unserer Ausstellung nehmen wir uns Zeit für Ihre Auswahl.</p>
            <Link to="/kontakt" className={styles.button}>Ausstellungsberatung anfragen <Arrow /></Link>
          </div>
          <div className={styles.visitCard}>
            <p className={styles.visitLabel}>Wir freuen uns auf Ihren Besuch.</p>
            <address><strong>{business.address.street}</strong><br />{business.address.zip} {business.address.city}</address>
            <dl>{business.openingHours.map((hours) => <div key={hours.days}><dt>{hours.days}</dt><dd>{hours.opens}–{hours.closes}</dd></div>)}</dl>
            <p className={styles.visitNote}>{business.openingHoursNote}</p>
            <div className={styles.visitLinks}><a href={business.mapsLink} target="_blank" rel="noopener noreferrer" className={styles.textLink}>Route planen <Arrow /></a><a href={`tel:${business.phone.e164}`} className={styles.textLink}>{business.phone.display}</a></div>
            <a href={business.mapsLink} target="_blank" rel="noopener noreferrer" className={styles.reviewLink}>Kundenstimmen auf Google lesen <Arrow /></a>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.references}`} aria-labelledby="references-title">
        <div className={styles.container}>
          <div className={styles.sectionHead}><div><p className={styles.eyebrow}>Einblicke in unsere Arbeit</p><h2 id="references-title">Materialien, die Räume verändern.</h2></div><Link to="/referenzen" className={styles.textLink}>Alle Referenzen <Arrow /></Link></div>
          <div className={styles.referenceGrid}>
            {homeReferencePhotos.map(({ reference, photo }) => (
              <Link key={reference.id} to={`/referenzen#${reference.id}`} className={styles.referenceCard}>
                <img src={photoUrl(photo.file, true)} alt={photo.alt} loading="lazy" width="640" height="853" /><div><h3>{reference.title}</h3><Arrow /></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.planner} aria-labelledby="planner-title">
        <div className={`${styles.container} ${styles.plannerInner}`}>
          <div><p className={styles.eyebrow}>Ein erster Eindruck</p><h2 id="planner-title">Ihre Materialien.<br />In Ihrem Bad.</h2><p>Mit dem Badplaner probieren Sie Farben und Materialien auf einem Foto Ihres Bads aus. Kostenlos und unverbindlich – als Ideenbild, nicht als verbindliche Planung.</p></div>
          <Link to="/badplaner" className={`${styles.button} ${styles.buttonLight}`}>Badplaner ausprobieren <Arrow /></Link>
        </div>
      </section>

      <section className={`${styles.section} ${styles.renovation}`} aria-labelledby="renovation-title">
        <div className={styles.container}>
          <div className={styles.sectionHead}><div><p className={styles.eyebrow}>Wenn Sie mehr vorhaben</p><h2 id="renovation-title">Auch ein kompletter Badumbau?</h2><p className={styles.renovationIntro}>Für alle, die neben der Produktauswahl auch die komplette Umsetzung wünschen, stehen unsere drei Badpakete zur Verfügung.</p></div><Link to="/badumbau-zofingen" className={styles.textLink}>Badumbau und Details <Arrow /></Link></div>
          <div className={styles.packageRow}>{bathPackages.map((pkg) => <Link key={pkg.id} to={`/badumbau-zofingen#paket-${pkg.id}`}><span>{pkg.name}</span><strong>ab CHF {pkg.priceLabel}</strong><Arrow /></Link>)}</div>
          <p className={styles.imageNote}>Richtpreise inkl. Material, Montage und MwSt. Der Fixpreis gilt nach der Besichtigung vor Ort.</p>
        </div>
      </section>

      <section className={styles.contact} aria-labelledby="contact-title">
        <div className={`${styles.container} ${styles.contactInner}`}>
          <div><p className={styles.eyebrow}>Wir hören zu.</p><h2 id="contact-title">Erzählen Sie uns<br />von Ihren Ideen.</h2><p>Bad, Platten oder Wellness – beginnen wir mit Ihrer Auswahl.</p></div>
          <div className={styles.contactActions}><Link to="/kontakt" className={styles.button}>Beratung anfragen <Arrow /></Link><a href={`tel:${business.phone.e164}`} className={styles.textLink}>Oder anrufen: {business.phone.display}</a></div>
        </div>
      </section>
    </main>
  );
};

export default Home;
