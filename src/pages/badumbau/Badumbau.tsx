import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Badumbau.module.css';
import { SEOHead } from '../../components';
import { business, bathPackages, packageNote, localBusinessJsonLd } from '../../config/business';
import { badumbauFaq } from '../../data/faq';
import { references, photoUrl } from '../../data/references';
import { generateFAQStructuredData, generateBreadcrumbStructuredData } from '../../utils/structuredData';
import { trackLead } from '../../utils/tracking';

const PAGE_URL = `${business.siteUrl}/badumbau-zofingen`;

const steps = [
  { n: '1', title: 'Beratung in der Ausstellung', text: 'Sie sehen Platten, Möbel, Armaturen und die drei Pakete in echt. Eine Stunde, kostenlos, mit Termin.' },
  { n: '2', title: 'Besichtigung vor Ort', text: 'Wir messen Ihr Bad aus, prüfen Leitungen und Anschlüsse und klären, was möglich ist.' },
  { n: '3', title: 'Planung mit 3D-Rendering und Fixpreis', text: 'Sie erhalten Ihr Bad als 3D-Bild in der gewählten Farbe und eine Offerte mit Fixpreis, 30 Tage gültig.' },
  { n: '4', title: 'Umbau in 3 bis 5 Wochen', text: 'Unsere eigene Equipe baut um: Demontage, Sanitär, Elektro, Gips, Platten, Maler, Montage. Ein Ansprechpartner.' },
  { n: '5', title: 'Übergabe', text: 'Wir übergeben Ihnen das fertige Bad, erklären die Technik und bleiben erreichbar.' },
];

const Badumbau: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const referenceProjects = references.filter((r) => r.category === 'bad').slice(0, 3);

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${PAGE_URL}#service`,
    name: 'Badumbau in Zofingen und im Aargau',
    serviceType: 'Badumbau, Badsanierung, Badplanung',
    description: 'Kompletter Badumbau aus einer Hand: Beratung in der Ausstellung, Planung mit 3D-Rendering, Sanitär, Plattenarbeiten, Möbel und Montage. Drei Badpakete mit Fixpreis.',
    url: PAGE_URL,
    provider: { '@id': `${business.siteUrl}/#organization` },
    areaServed: business.areaServed.map((name) => ({ '@type': 'City', name })),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Badpakete',
      itemListElement: bathPackages.map((p) => ({
        '@type': 'Offer',
        name: `Badpaket ${p.name}`,
        description: p.description,
        price: String(p.price),
        priceCurrency: 'CHF',
        url: `${PAGE_URL}#paket-${p.id}`,
        priceSpecification: {
          '@type': 'PriceSpecification',
          price: String(p.price),
          priceCurrency: 'CHF',
          valueAddedTaxIncluded: true,
        },
        itemOffered: { '@type': 'Service', name: `Badumbau Paket ${p.name}`, serviceType: 'Badumbau' },
      })),
    },
  };

  const structuredData = [
    localBusinessJsonLd,
    serviceJsonLd,
    generateFAQStructuredData(badumbauFaq),
    generateBreadcrumbStructuredData([
      { name: 'Home', url: '/' },
      { name: 'Badumbau Zofingen', url: '/badumbau-zofingen' },
    ]),
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    if ((data.get('_gotcha') || '').toString().trim() !== '') return; // Honeypot
    const name = (data.get('name') || '').toString().trim();
    data.append('_subject', `Badumbau-Anfrage: ${name}`);
    data.append('quelle', 'Seite Badumbau Zofingen');
    setStatus('sending');
    try {
      const res = await fetch(business.formspreeEndpoint, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        setStatus('ok');
        form.reset();
        trackLead('form', 'badumbau-formular');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <main className={styles.page}>
      <SEOHead
        title="Badumbau Zofingen und Aargau, komplett aus einer Hand | New Living Design"
        description={`Badumbau in Zofingen, Aarau, Olten, Sursee und Umgebung: Beratung in der Ausstellung, 3D-Planung, Fixpreis. Drei Badpakete ab CHF ${bathPackages[0].priceLabel} inkl. Material und Montage. Farbe ohne Aufpreis.`}
        keywords="Badumbau Zofingen, Badsanierung Aargau, Badumbau Kosten Schweiz, Badezimmer renovieren Zofingen, Badplanung 3D, Badpaket Fixpreis, Bad umbauen Aarau Olten Sursee"
        url="/badumbau-zofingen"
        type="website"
        structuredData={structuredData}
        image={`${business.siteUrl}${photoUrl('bad-marmor-grau-01.webp')}`}
      />

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <div className={styles.heroOverlay} />
          <img
            src={photoUrl('bad-marmor-grau-02.webp')}
            alt="Badumbau von New Living Design: Bad in grauer Marmoroptik mit schwarzen Armaturen"
            className={styles.heroImage}
            fetchPriority="high"
          />
        </div>
        <div className={`${styles.heroContent} ${isVisible ? styles.visible : ''}`}>
          <p className={styles.eyebrow}>Badumbau · Zofingen · Aargau</p>
          <h1 className={styles.heroTitle}>
            Badumbau in Zofingen und im Aargau,
            <span> komplett aus einer Hand</span>
          </h1>
          <p className={styles.heroText}>
            Beratung in unserer Ausstellung, Planung mit 3D-Rendering, Umbau durch die eigene Equipe.
            Drei Badpakete mit Fixpreis ab CHF {bathPackages[0].priceLabel}. Farbe kostet bei uns nichts extra.
          </p>
          <div className={styles.heroActions}>
            <a href={`tel:${business.phone.e164}`} data-lead="badumbau-hero" className={styles.ctaPrimary}>
              {business.phone.display} anrufen
            </a>
            <a href="#anfrage" className={styles.ctaSecondary}>
              Kostenlose Beratung anfragen
            </a>
          </div>
          <p className={styles.heroMeta}>
            Ausstellung {business.address.street}, {business.address.zip} {business.address.city} ·{' '}
            {business.openingHours[0].days} {business.openingHours[0].opens}–{business.openingHours[0].closes},{' '}
            {business.openingHours[1].days} {business.openingHours[1].opens}–{business.openingHours[1].closes}
          </p>
        </div>
      </section>

      {/* Preise / Pakete */}
      <section id="pakete" className={`${styles.section} ${styles.light}`}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Was kostet ein Badumbau?</span>
            <h2 className={styles.sectionTitle}>Drei Badpakete, ein Fixpreis</h2>
            <p className={styles.sectionIntro}>
              Aus über 20 Bädern, die wir im letzten Jahr geplant haben, haben wir drei Pakete gemacht.
              Innerhalb der Serie wählen Sie Farben und Oberflächen frei, ohne dass sich der Preis ändert.
            </p>
          </div>

          <div className={styles.packages}>
            {bathPackages.map((p) => (
              <article key={p.id} id={`paket-${p.id}`} className={`${styles.package} ${p.highlight ? styles.packageHighlight : ''}`}>
                {p.highlight && <span className={styles.packageBadge}>Meistgewählt</span>}
                <h3 className={styles.packageName}>{p.name}</h3>
                <p className={styles.packageClaim}>{p.claim}</p>
                <p className={styles.packagePrice}>
                  <span className={styles.packagePriceLabel}>ab CHF</span> {p.priceLabel}
                  <span className={styles.packagePriceNote}>inkl. MwSt.</span>
                </p>
                <p className={styles.packageText}>{p.description}</p>
                <ul className={styles.packageList}>
                  {p.includes.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className={styles.packageFoot}>
                  Bauzeit {p.duration} · über 21 m² Platten: + CHF {p.extraPerSqm} pro m²
                </p>
                <a href="#anfrage" className={styles.packageCta}>Paket {p.name} anfragen</a>
              </article>
            ))}
          </div>
          <p className={styles.note}>{packageNote}</p>

          {/* Hinweis auf den Badplaner */}
          <aside className={styles.plannerBox}>
            <div>
              <span className={styles.plannerEyebrow}>Neu</span>
              <h3>Badplaner – Ihr Bad als Ideenbild</h3>
              <p>Paket wählen, Foto vom Bad machen, in 30 Sekunden ein Ideenbild mit den gewählten Platten und Farben erhalten. Kostenlos und unverbindlich.</p>
            </div>
            <Link to="/badplaner" className={styles.ctaDark}>Badplaner starten</Link>
          </aside>
        </div>
      </section>

      {/* Ablauf */}
      <section id="ablauf" className={`${styles.section} ${styles.dark}`}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>So läuft es ab</span>
            <h2 className={styles.sectionTitle}>Vom ersten Termin bis zur Übergabe</h2>
          </div>
          <ol className={styles.steps}>
            {steps.map((s) => (
              <li key={s.n} className={styles.step}>
                <span className={styles.stepNumber}>{s.n}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Referenzen */}
      <section id="referenzen" className={`${styles.section} ${styles.light}`}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Referenzen</span>
            <h2 className={styles.sectionTitle}>Bäder, die wir gebaut haben</h2>
          </div>
          <div className={styles.refGrid}>
            {referenceProjects.map((r) => (
              <Link key={r.id} to={`/referenzen#${r.id}`} className={styles.refCard}>
                <img src={photoUrl(r.photos[0].file, true)} alt={r.photos[0].alt} loading="lazy" width="640" height="853" />
                <div className={styles.refCardBody}>
                  <h3>{r.title}</h3>
                  <p>{r.summary}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className={styles.center}>
            <Link to="/referenzen" className={styles.ctaDark}>Alle Referenzen ansehen</Link>
          </div>
        </div>
      </section>

      {/* Gebiet */}
      <section id="gebiet" className={`${styles.section} ${styles.dark}`}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Wir arbeiten in</span>
            <h2 className={styles.sectionTitle}>Rund 40 km um Zofingen</h2>
          </div>
          <ul className={styles.places}>
            {business.areaServed.map((ort) => (
              <li key={ort}>{ort}</li>
            ))}
          </ul>
          <p className={styles.placesNote}>
            Und in den Gemeinden dazwischen. Besichtigung vor Ort in diesem Gebiet kostenlos.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className={`${styles.section} ${styles.light}`}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Häufige Fragen</span>
            <h2 className={styles.sectionTitle}>Was Kunden uns vor dem Badumbau fragen</h2>
          </div>
          <div className={styles.faq}>
            {badumbauFaq.map((item) => (
              <details key={item.question} className={styles.faqItem}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Anfrage */}
      <section id="anfrage" className={`${styles.section} ${styles.dark}`}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Kostenlose Beratung</span>
            <h2 className={styles.sectionTitle}>Sagen Sie uns, wann Sie starten möchten</h2>
            <p className={styles.sectionIntroLight}>
              Wir rufen Sie innerhalb eines Arbeitstages zurück und vereinbaren den Termin in der Ausstellung oder bei Ihnen zu Hause.
              Oder direkt: <a href={`tel:${business.phone.e164}`} data-lead="badumbau-formtext">{business.phone.display}</a>, WhatsApp{' '}
              <a href={`https://wa.me/${business.whatsapp.e164.replace('+', '')}`} data-lead="badumbau-formtext" target="_blank" rel="noopener noreferrer">{business.whatsapp.display}</a>.
            </p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className={styles.honeypot} aria-hidden="true" />
            <div className={styles.formRow}>
              <label className={styles.field}>
                <span>Name</span>
                <input type="text" name="name" placeholder="Vor- und Nachname" required autoComplete="name" />
              </label>
              <label className={styles.field}>
                <span>Telefon</span>
                <input type="tel" name="phone" placeholder="+41 ..." required autoComplete="tel" />
              </label>
            </div>
            <div className={styles.formRow}>
              <label className={styles.field}>
                <span>E-Mail</span>
                <input type="email" name="email" placeholder="name@beispiel.ch" autoComplete="email" />
              </label>
              <label className={styles.field}>
                <span>Wann möchten Sie starten?</span>
                <select name="start" defaultValue="">
                  <option value="" disabled>Bitte wählen</option>
                  <option value="Innerhalb von 3 Monaten">Innerhalb von 3 Monaten</option>
                  <option value="In 3 bis 6 Monaten">In 3 bis 6 Monaten</option>
                  <option value="Später / noch offen">Später, noch offen</option>
                </select>
              </label>
            </div>
            <div className={styles.formRow}>
              <label className={styles.field}>
                <span>Wohnort (PLZ, Ort)</span>
                <input type="text" name="ort" placeholder="z. B. 4800 Zofingen" autoComplete="postal-code" />
              </label>
              <label className={styles.field}>
                <span>Interessiert an</span>
                <select name="paket" defaultValue="">
                  <option value="">Noch offen</option>
                  {bathPackages.map((p) => (
                    <option key={p.id} value={p.name}>Paket {p.name}, ab CHF {p.priceLabel}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className={`${styles.field} ${styles.fieldFull}`}>
              <span>Ihr Bad (optional)</span>
              <textarea name="message" rows={4} placeholder="Grösse, Alter, was Sie sich wünschen" />
            </label>
            <div className={styles.formActions}>
              <button type="submit" className={styles.ctaPrimary} disabled={status === 'sending'}>
                {status === 'sending' ? 'Wird gesendet…' : 'Rückruf anfordern'}
              </button>
              {status === 'ok' && <p className={styles.success}>Danke, wir melden uns innerhalb eines Arbeitstages.</p>}
              {status === 'error' && (
                <p className={styles.error}>
                  Das hat nicht geklappt. Rufen Sie uns an: <a href={`tel:${business.phone.e164}`} data-lead="badumbau-fehler">{business.phone.display}</a>
                </p>
              )}
            </div>
            <p className={styles.formNote}>
              Mit dem Absenden stimmen Sie der Verarbeitung Ihrer Angaben zur Beantwortung der Anfrage zu. <Link to="/datenschutz">Datenschutz</Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
};

export default Badumbau;
