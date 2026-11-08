import { Link } from 'react-router-dom';
import SEOHead from '../../components/seo/SEOHead';
import SceneStory, { type Scene } from '../../components/scroll-helper/SceneStory';
import { business, localBusinessJsonLd } from '../../config/business';
import { homeReferencePhotos, photoUrl, referenceById } from '../../data/references';
import { imageOf } from '../../data/suppliers';
import styles from './Home.module.css';

const hero = referenceById('bad-marmoroptik-grau-schwarz');
const scenes: Scene[] = [
  { id: 'bereich-bad', label: 'Bad', title: 'Ein Bad, das zu Ihnen passt.', text: 'Wir planen Nutzung, Aufteilung und Materialien gemeinsam. Vom einzelnen Waschtisch bis zum kompletten Badumbau begleiten wir die vereinbarten Arbeiten.', image: imageOf('edone'), href: '/produkte/bad', link: 'Möglichkeiten fürs Bad', credit: 'Material- und Raumbeispiel unserer Marke Edoné.' },
  { id: 'bereich-kuechen', label: 'Küchen', title: 'Für das Leben dazwischen.', text: 'Kochen, ankommen, zusammensitzen. Wir planen Ihre Küche als Teil Ihres Alltags – mit passenden Arbeitswegen, Stauraum und Materialien. Lieferung und Montage stimmen wir darauf ab.', image: { src: photoUrl('kueche-insel-messing-01.webp'), srcSet: `${photoUrl('kueche-insel-messing-01.webp', true)} 480w, ${photoUrl('kueche-insel-messing-01.webp')} 900w`, width: 900, height: 1600, alt: 'Von New Living Design realisierte Küche mit Insel und Messingdetails' }, href: '/produkte/kuechen', link: 'Küchen mit uns planen', credit: 'Von New Living Design realisiertes Projekt.' },
  { id: 'bereich-platten', label: 'Platten', title: 'Material, das einen Raum prägt.', text: 'Format, Oberfläche und Fugenbild gehören zusammen. Wir beraten zu Wand, Boden und Aussenbereich und berücksichtigen die Verarbeitung bereits bei der Auswahl.', image: imageOf('lafabbrica'), href: '/produkte/platten', link: 'Materialien kennenlernen', credit: 'Material- und Raumbeispiel unserer Marke La Fabbrica AVA.' },
  { id: 'bereich-wellness', label: 'Wellness', title: 'Zeit für sich. Raum dafür.', text: 'Wir klären Platz, Anschlüsse und Ihre Wünsche. Daraus entsteht eine passende Auswahl für Sauna, Dampf oder Wasser – mit einem gemeinsam abgestimmten Ablauf.', image: imageOf('novellini', 'Home Oasis'), href: '/produkte/wellness', link: 'Wellness zu Hause', credit: 'Raumbeispiel Novellini Home Oasis.' },
];

export default function Home() {
  return <main id="main-content" className={styles.home}>
    <SEOHead title="New Living Design Zofingen | Räume planen & umsetzen" description="Persönliche Beratung, Planung und Umsetzung für Bad, Küchen, Platten und Wellness. Lernen Sie New Living Design und unsere Ausstellung in Zofingen kennen." url="/" type="website" structuredData={localBusinessJsonLd} image={`${business.siteUrl}${photoUrl('bad-marmor-grau-02.webp')}`} />
    <section className={styles.hero} aria-labelledby="home-title">
      <div className={styles.heroMedia} data-parallax data-hero-motion><img src={photoUrl('bad-marmor-grau-02.webp')} srcSet={`${photoUrl('bad-marmor-grau-02.webp', true)} 480w, ${photoUrl('bad-marmor-grau-02.webp')} 1600w`} sizes="100vw" width="1600" height="1102" alt={hero?.photos.find(photo => photo.file === 'bad-marmor-grau-02.webp')?.alt ?? 'Realisierter Badumbau von New Living Design'} {...{ fetchpriority: 'high' }} /></div>
      <div className={`nld-container ${styles.heroContent}`} data-reveal="stagger">
        <p className="nld-eyebrow">New Living Design · Zofingen</p>
        <h1 id="home-title">Ihr Raum.<br />Von der Idee<br />bis zur Umsetzung.</h1>
        <p className={styles.heroLead}>Wir beraten, planen und realisieren.<br />Bad, Küchen, Platten und Wellness.</p>
        <div className="nld-actions"><Link className="nld-button nld-button--light" to="/kontakt">Projekt besprechen</Link><Link className="nld-link" to="/referenzen">Unsere Arbeit ansehen <span aria-hidden="true">→</span></Link></div>
      </div>
      <p className={styles.heroCredit}>Ein Projekt von New Living Design · <Link to="/referenzen#bad-marmoroptik-grau-schwarz">{hero?.title}</Link></p>
    </section>

    <section className="nld-section" aria-labelledby="company-title"><div className={`nld-container ${styles.company}`}>
      <div data-reveal="stagger"><p className="nld-eyebrow">Das Unternehmen hinter Ihrem Projekt</p><h2 id="company-title">Persönlich im Gespräch.<br />Praktisch in der Umsetzung.</h2></div>
      <div className={styles.companyText} data-reveal="stagger"><p>New Living Design ist ein familiengeführtes Unternehmen in Zofingen. Unsere Erfahrung aus Umbau und Plattenarbeiten prägt, wie wir Räume planen und Materialien auswählen.</p><p>Wir hören zu, klären die Möglichkeiten und halten die nächsten Schritte gemeinsam fest. Von der ersten Beratung in unserer Ausstellung bis zur vereinbarten Lieferung, Montage oder Renovation.</p><Link to="/ueber-uns" className="nld-link">Lernen Sie uns kennen <span aria-hidden="true">→</span></Link></div>
    </div></section>

    <section className={`${styles.process} nld-section`} aria-labelledby="process-title"><div className="nld-container">
      <div className="nld-section-head"><div data-reveal="stagger"><p className="nld-eyebrow">So arbeiten wir</p><h2 id="process-title">Ein klarer Weg.<br />Ein gemeinsames Ziel.</h2></div><Link to="/dienstleistungen" className="nld-link">Unsere Leistungen <span aria-hidden="true">→</span></Link></div>
      <ol className={styles.steps}>
        <li data-reveal="stagger"><span>01</span><h3>Zuhören & beraten</h3><p>Wir besprechen Ihre Wünsche, den Raum und das Budget. Materialien vergleichen Sie direkt in unserer Ausstellung.</p></li>
        <li data-reveal="stagger"><span>02</span><h3>Planen & abstimmen</h3><p>Wir führen Gestaltung und Funktion zusammen. Auf Wunsch machen wir Bad oder Küche in 3D sichtbar.</p></li>
        <li data-reveal="stagger"><span>03</span><h3>Koordinieren & umsetzen</h3><p>Nach Ihrer Freigabe stimmen wir Lieferung, Montage und die vereinbarten Facharbeiten aufeinander ab.</p></li>
      </ol><Link className="nld-link" to="/badumbau-zofingen">Kompletter Badumbau: Ablauf und Preisorientierung <span aria-hidden="true">→</span></Link>
    </div></section>

    <section className="nld-section" aria-labelledby="projects-title"><div className="nld-container">
      <div className="nld-section-head"><div data-reveal="stagger"><p className="nld-eyebrow">Aus unserer Arbeit</p><h2 id="projects-title">Aus Ideen werden<br />bewohnte Räume.</h2></div><Link to="/referenzen" className="nld-link">Alle Projekte <span aria-hidden="true">→</span></Link></div>
      <div className={styles.projects}>{homeReferencePhotos.map(({ reference, photo }) => <Link key={reference.id} to={`/referenzen#${reference.id}`} className={styles.project}>
        <div data-reveal="image"><img src={photoUrl(photo.file)} srcSet={`${photoUrl(photo.file, true)} 480w, ${photoUrl(photo.file)} 1067w`} sizes="(max-width: 767px) 100vw, 45vw" width="1067" height="1600" alt={photo.alt} loading="lazy" decoding="async" /></div><h3>{reference.title}<span aria-hidden="true"> ↗</span></h3>
      </Link>)}</div>
    </div></section>

    <section id="sortiment" className={`${styles.expertise} nld-section`} aria-labelledby="expertise-title"><div className="nld-container">
      <div className="nld-section-head"><div data-reveal="stagger"><p className="nld-eyebrow">Vier Fachbereiche. Ein Blick fürs Ganze.</p><h2 id="expertise-title">Was möchten Sie<br />verändern?</h2></div><Link to="/produkte" className="nld-link">Inspiration für Ihr Vorhaben <span aria-hidden="true">→</span></Link></div>
      <SceneStory scenes={scenes} label="Unsere vier Fachbereiche" />
      <div className={styles.resources}><Link to="/badplaner">Eine erste Badidee visualisieren <span aria-hidden="true">→</span></Link><Link to="/partner">Unsere Marken und Partner <span aria-hidden="true">→</span></Link></div>
    </div></section>

    <section className={`${styles.showroom} nld-section`} aria-labelledby="showroom-title"><div className={`nld-container ${styles.showroomInner}`}>
      <figure data-reveal="image" data-parallax><img src={photoUrl('ausstellung-zofingen-01.webp')} srcSet={`${photoUrl('ausstellung-zofingen-01.webp', true)} 480w, ${photoUrl('ausstellung-zofingen-01.webp')} 1200w`} sizes="(max-width: 767px) 100vw, 50vw" alt="Unsere Ausstellung in Zofingen mit Waschtischen, Spiegeln und Materialmustern" width="1200" height="1600" loading="lazy" decoding="async" /></figure>
      <div data-reveal="stagger"><p className="nld-eyebrow">Bei uns in Zofingen</p><h2 id="showroom-title">Am besten beginnt<br />es vor Ort.</h2><p>Oberflächen anfassen. Farben nebeneinander sehen. Ihr Vorhaben in Ruhe besprechen. In unserer Ausstellung nehmen wir uns Zeit für Ihre nächsten Entscheidungen.</p><address>{business.address.street}<br />{business.address.zip} {business.address.city}</address><div className="nld-actions"><Link className="nld-button nld-button--light" to="/kontakt">Beratung anfragen</Link><Link className="nld-link" to="/booking">Ausstellung kennenlernen <span aria-hidden="true">→</span></Link></div><a className="nld-link" href={`tel:${business.phone.e164}`}>{business.phone.display}</a><br /><a className="nld-link" href={business.mapsLink} target="_blank" rel="noopener noreferrer">Kundenstimmen auf Google</a></div>
    </div></section>
  </main>;
}
