import { Link } from 'react-router-dom';
import SEOHead from '../../components/seo/SEOHead';
import PageIntro, { ProjectInvitation } from '../../components/layout/PageIntro';
import SceneStory, { type Scene } from '../../components/scroll-helper/SceneStory';
import heroImage from '../../assets/shutterstock_2583534585.webp';
import beratungImage from '../../assets/shutterstock_2479065515.webp';
import visualisierungImage from '../../assets/shutterstock_2600181185.webp';
import lieferungImage from '../../assets/shutterstock_236748076.webp';
import styles from './Services.module.css';

const steps: Scene[] = [
  { id: 'beratung', label: 'Beratung', title: 'Zuerst verstehen wir Ihr Vorhaben.', text: 'Wir besprechen Wünsche, Raum und Budget. Bringen Sie Fotos, einen Grundriss, Masse oder Muster mit. In unserer Ausstellung vergleichen wir Oberflächen und Möglichkeiten. Wenn technische Fragen oder ein Umbau im Vordergrund stehen, vereinbaren wir eine Besichtigung vor Ort.', image: { src: beratungImage, alt: 'Beratung mit Unterlagen am Tisch', width: 1400, height: 933 }, href: '/booking', link: 'Den passenden Termin finden' },
  { id: 'planung', label: 'Planung & Offerte', title: 'Entscheidungen werden sichtbar.', text: 'Wir stimmen Produkte, Masse, Anschlüsse und Materialien aufeinander ab. Für Bad und Küche zeigen wir auf Wunsch in 3D, wie alles zusammenwirkt. Die Offerte hält die bestätigten Produkte, Masse und Leistungen nachvollziehbar fest.', image: { src: visualisierungImage, alt: '3D-Visualisierung einer Raumplanung', width: 1400, height: 787 }, href: '/referenzen', link: 'Realisierte Projekte ansehen' },
  { id: 'umsetzung', label: 'Lieferung & Umsetzung', title: 'Damit aus dem Plan ein Raum wird.', text: 'Nach Ihrer Freigabe bestellen wir die Produkte und stimmen Liefertermine, Zugang und Montage ab. Benötigt Ihr Projekt weitere Facharbeiten, koordinieren wir die vereinbarten Beteiligten. Zuständigkeiten und erforderliche Vorarbeiten halten wir vor dem Start fest.', image: { src: lieferungImage, alt: 'Montage von Wandplatten auf der Baustelle', width: 1400, height: 998 }, href: '/badumbau-zofingen', link: 'Kompletter Badumbau mit uns' },
];
export default function Services() {
  return <main id="main-content" className="nld-page">
    <SEOHead title="Beratung, Planung & Umsetzung | New Living Design" description="Von der ersten Idee bis zur Umsetzung: persönliche Beratung in Zofingen, 3D-Planung für Bad und Küche sowie koordinierte Lieferung, Montage und Renovation." url="/dienstleistungen" image={`https://newlivingdesign.ch${heroImage}`} type="website" />
    <PageIntro eyebrow="Unsere Leistungen" title="Wir begleiten Ihr Vorhaben." description="Von der ersten Frage bis zur vereinbarten Umsetzung. Gemeinsam legen wir fest, welche Unterstützung Ihr Projekt braucht." image={{ src: heroImage, alt: 'Raumgestaltung und Materialien als Inspiration', width: 1920, height: 728 }}><Link to="/kontakt" className="nld-button">Projekt besprechen</Link></PageIntro>
    <div className="nld-container"><nav className="nld-local-nav" aria-label="Unsere Leistungen"><a href="#beratung">Beratung</a><a href="#planung">Planung & Offerte</a><a href="#umsetzung">Lieferung & Umsetzung</a><Link to="/badumbau-zofingen">Badumbau & Pakete</Link></nav></div>
    <section className="nld-section"><div className="nld-container"><div className="nld-section-head" data-reveal="stagger"><div><p className="nld-eyebrow">Ein abgestimmter Ablauf</p><h2>Vom ersten Gespräch<br />bis zum letzten Detail.</h2></div></div><SceneStory scenes={steps} label="Beratung, Planung und Umsetzung" /></div></section>
    <section className={`${styles.scope} nld-section`}><div className={`nld-container ${styles.scopeInner}`}>
      <h2 data-reveal="text">So viel Begleitung,<br />wie Sie brauchen.</h2><div data-reveal="stagger"><p>Ob einzelne Armatur, neue Küche oder vollständiger Badumbau: Wir beginnen dort, wo Ihr Vorhaben steht. Umfang, Zuständigkeiten und nächste Schritte vereinbaren wir persönlich.</p><p>Das erste Gespräch in der Ausstellung ist kostenlos und unverbindlich. Eine 3D-Visualisierung hilft bei Entscheidungen; verbindlich bleiben die bestätigten Angaben der Offerte.</p><Link to="/booking" className="nld-link">Beratung und Ausstellung kennenlernen →</Link></div>
    </div></section>
    <ProjectInvitation><Link className="nld-button nld-button--light" to="/kontakt">Beratung anfragen</Link></ProjectInvitation>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "provider": {
            "@type": "Organization",
            "name": "New Living Design GmbH",
            "url": "https://newlivingdesign.ch"
          },
          "serviceType": "Innenausbau & Design Services",
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Dienstleistungen von New Living Design",
            "itemListElement": [
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Auswahlberatung",
                  "description": "Auswahlberatung in der Ausstellung in Zofingen. Das erste Gespräch ist kostenlos und unverbindlich."
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "3D-Visualisierung",
                  "description": "3D-Visualisierung als Entscheidungshilfe für Bad und Küche."
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Lieferung & Montage",
                  "description": "Koordinierte Lieferung, Montage und vereinbarte Facharbeiten."
                }
              }
            ]
          }
        }) }} />
  </main>;
}
