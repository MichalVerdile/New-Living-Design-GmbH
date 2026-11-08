import { Link } from 'react-router-dom';
import SEOHead from '../../components/seo/SEOHead';
import PageIntro, { ProjectInvitation } from '../../components/layout/PageIntro';
import { business, localBusinessJsonLd } from '../../config/business';
import { photoUrl } from '../../data/references';
import heroImg from '../../assets/shutterstock_2600582595.webp';
import styles from './About.module.css';

export default function About() {
  return <main id="main-content" className="nld-page">
    <SEOHead title="Über New Living Design | Unternehmen in Zofingen" description="Ein familiengeführtes Unternehmen für Bad, Küchen, Platten und Wellness. Lernen Sie New Living Design, unsere Arbeitsweise und die Ausstellung in Zofingen kennen." url="/ueber-uns" type="website" image={`https://newlivingdesign.ch${heroImg}`} structuredData={localBusinessJsonLd} />
    <PageIntro eyebrow="New Living Design" title="Aus der Praxis. Für Ihren Raum." description="Wir sind ein familiengeführtes Unternehmen in Zofingen. Unsere Erfahrung aus Umbau und Plattenarbeiten verbindet die Gestaltung mit dem, was sich im Alltag bewährt." image={{ src: heroImg, alt: 'Materialien und Innenausstattung als Inspiration', width: 1920, height: 1080 }}><Link className="nld-button" to="/kontakt">Lernen wir uns kennen</Link><Link className="nld-link" to="/dienstleistungen">Unsere Leistungen →</Link></PageIntro>
    <section className={`${styles.story} nld-section`}><div className={`nld-container ${styles.split}`}>
      <div data-reveal="stagger"><p className="nld-eyebrow">Unsere Arbeitsweise</p><h2>Wir sehen das Material.<br />Und den ganzen Raum.</h2></div>
      <div data-reveal="stagger"><p>Unsere Arbeit begann bei Oberflächen, Formaten und ihrer sauberen Verarbeitung. Diese Nähe zum Material prägt bis heute, wie wir beraten, Produkte beurteilen und miteinander kombinieren.</p><p>Heute begleiten wir Vorhaben in den Bereichen Bad, Küchen, Platten und Wellness. Je nach Projekt gehören 3D-Visualisierung, Lieferung, Montage oder die Koordination einer Renovation dazu.</p><p>Seit 2023 ist New Living Design als GmbH im Kanton Aargau eingetragen.</p></div>
    </div></section>
    <section className="nld-section"><div className="nld-container"><div className="nld-section-head"><h2 data-reveal="text">Worauf Sie sich<br />im Gespräch verlassen können.</h2></div><div className={styles.principles}>
      <article data-reveal="stagger"><h3>Am Material entscheiden.</h3><p>Wir zeigen reale Muster und erklären Unterschiede bei Wirkung, Nutzung und Pflege.</p></article>
      <article data-reveal="stagger"><h3>Zusammenhänge sehen.</h3><p>Wir betrachten Proportionen, Anschlüsse, Farben und die Ausstattung als Ganzes.</p></article>
      <article data-reveal="stagger"><h3>Klar vereinbaren.</h3><p>Produkte, Leistungen und Zuständigkeiten halten wir vor Bestellung oder Ausführung nachvollziehbar fest.</p></article>
    </div></div></section>
    <section className={`${styles.visit} nld-section`}><div className={`nld-container ${styles.split}`}>
      <figure data-reveal="image" data-parallax><img src={photoUrl('ausstellung-zofingen-01.webp')} srcSet={`${photoUrl('ausstellung-zofingen-01.webp', true)} 480w, ${photoUrl('ausstellung-zofingen-01.webp')} 1200w`} sizes="(max-width:900px) 100vw, 50vw" alt="Materialien, Möbel und Spiegel in unserer Ausstellung in Zofingen" width="1200" height="1600" loading="lazy" /></figure>
      <div data-reveal="stagger"><p className="nld-eyebrow">Persönlich für Sie da</p><h2>Ihr Ansprechpartner:<br />Emanuel Verdile.</h2><p>Für Ihre Fragen, den passenden Termin und Ihr Vorhaben. In unserer Ausstellung können Sie Materialien sehen, anfassen und direkt miteinander vergleichen.</p><address>{business.name}<br />{business.address.street}<br />{business.address.zip} {business.address.city}</address><div className="nld-actions"><Link to="/booking" className="nld-link">Unsere Ausstellung →</Link><a className="nld-link" href={`tel:${business.phone.e164}`}>{business.phone.display}</a></div></div>
    </div></section>
    <ProjectInvitation title="Was haben Sie vor?"><Link className="nld-button nld-button--light" to="/kontakt">Kontakt aufnehmen</Link><Link className="nld-link" to="/referenzen">Unsere Projekte ansehen →</Link></ProjectInvitation>
  </main>;
}
