import { Link } from 'react-router-dom';
import SEOHead from '../../components/seo/SEOHead';
import PageIntro, { ProjectInvitation } from '../../components/layout/PageIntro';
import { business, localBusinessJsonLd } from '../../config/business';
import beratungImage from '../../assets/shutterstock_2286698317.webp';
import heroImage from '../../assets/shutterstock_2336703843.webp';
import gallery1 from '../../assets/2025-09-10.webp';
import gallery2 from '../../assets/2025-09-10 (4).webp';
import gallery3 from '../../assets/2025-09-10 (2).jpg';
import gallery4 from '../../assets/2025-09-10 (3).webp';
import styles from './Booking.module.css';

export default function Booking() {
  return <main id="main-content" className="nld-page">
    <SEOHead title="Ausstellung & Beratung in Zofingen | New Living Design" description="Besuchen Sie unsere Ausstellung in Zofingen. Beratung, Besichtigung vor Ort oder einen Showroom-Termin für Ihr Architekturbüro persönlich anfragen." url="/booking" type="website" image={`https://newlivingdesign.ch${heroImage}`} structuredData={localBusinessJsonLd} />
    <PageIntro eyebrow="Unsere Ausstellung in Zofingen" title="Sehen. Anfassen. Gemeinsam entscheiden." description="Vergleichen Sie Materialien direkt am Muster und besprechen Sie Ihr Vorhaben mit uns. Wenn Masse, Anschlüsse oder der Zustand des Raums entscheidend sind, vereinbaren wir eine Besichtigung vor Ort." image={{ src: heroImage, alt: 'Badgestaltung als Inspiration für die Beratung', width: 1920, height: 1280 }}><Link to="/kontakt" className="nld-button">Beratung anfragen</Link><a className="nld-link" href="#besuch">Besuch planen ↓</a></PageIntro>
    <section id="besuch" className={`${styles.visit} nld-section`}><div className={`nld-container ${styles.visitGrid}`}>
      <div data-reveal="stagger"><p className="nld-eyebrow">Wir freuen uns auf Ihren Besuch.</p><h2>Bei uns im<br />Römerquartier.</h2><address>{business.address.street}<br />{business.address.zip} {business.address.city}</address><a className="nld-link" href={business.mapsLink} target="_blank" rel="noopener noreferrer">Route planen →</a></div>
      <div><h3>Öffnungszeiten</h3><dl>{business.openingHours.map(hours => <div key={hours.days}><dt>{hours.days}</dt><dd>{hours.opens}–{hours.closes}</dd></div>)}</dl><p>{business.openingHoursNote}</p><p className={styles.note}>Sie stellen eine Anfrage. Ein Termin ist erst vereinbart, wenn wir ihn persönlich bestätigt haben.</p><a className="nld-link" href={`tel:${business.phone.e164}`}>{business.phone.display}</a></div>
    </div><div className={`nld-container ${styles.gallery}`}>{[gallery1, gallery2, gallery3, gallery4].map((src, index) => <figure key={src} data-reveal="image"><img src={src} alt={`Einblick ${index + 1} in unsere Ausstellung für Bemusterung und Kundengespräche in Zofingen`} loading="lazy" decoding="async" /></figure>)}</div></section>
    <section className="nld-section"><div className={`nld-container ${styles.split}`}>
      <div data-reveal="stagger"><p className="nld-eyebrow">Wenn der bestehende Raum zählt</p><h2>Wir kommen<br />zu Ihnen.</h2><p>Bei einer Besichtigung sehen wir uns Ihre Raumsituation an, nehmen die nötigen Masse auf und klären Anschlüsse, Zugänglichkeit und Leistungsumfang.</p><p>Planen Sie für das erste Gespräch ungefähr eine Stunde ein. Ob die Besichtigung kostenlos ist, richtet sich nach Projekt und Entfernung und wird vor dem Termin bestätigt.</p><Link to="/kontakt" className="nld-button">Besichtigung anfragen</Link></div>
      <figure data-reveal="image"><img src={beratungImage} alt="Persönliche Beratung mit Unterlagen" loading="lazy" decoding="async" /></figure>
    </div></section>
    <section className={`${styles.architects} nld-section`}><div className={`nld-container ${styles.split}`}>
      <div data-reveal="stagger"><p className="nld-eyebrow">Für Architektinnen und Architekten</p><h2>Ihr Kundengespräch.<br />Unsere Ausstellung.</h2><p>Nutzen Sie den Showroom, um Materialien, Farben und Produkte mit Ihren Kundinnen und Kunden direkt zu besprechen. Termine bis zu drei Stunden sind nach Vereinbarung möglich.</p><Link className="nld-link" to="/kontakt">Showroom-Termin anfragen →</Link></div>
      <div><h3>Für Ihre Besprechung vorhanden</h3><ul><li>Sitzungsbereich</li><li>Bildschirm für Pläne und Präsentationen</li><li>Musik und Getränke</li><li>Material- und Produktmuster</li><li>Auf Wunsch Unterstützung durch New Living Design</li></ul><p className={styles.note}>Die Nutzung ist für ausgewählte Architekturbüros kostenlos und erfolgt nach bestätigter Anfrage. Materialien und Produkte aus dem Termin werden über New Living Design bezogen. Details und Verfügbarkeit klären wir vor der Reservation.</p></div>
    </div></section>
    <ProjectInvitation title="Welcher Termin passt zu Ihrem Vorhaben?"><Link className="nld-button nld-button--light" to="/kontakt">Termin anfragen</Link></ProjectInvitation>
  </main>;
}
