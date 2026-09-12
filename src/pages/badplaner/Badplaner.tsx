import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Badplaner.module.css';
import { SEOHead } from '../../components';
import { business, bathPackages } from '../../config/business';
import { badplanerFaq, optionsForPackage, type PackageId } from '../../data/badplaner';
import { generateFAQStructuredData, generateBreadcrumbStructuredData } from '../../utils/structuredData';
import { trackLead } from '../../utils/tracking';
import { resizeImageFile, fileToBase64, type ResizedImage } from './resizeImage';

/*
 * Badplaner: Paket wählen, Ausstattung wählen, Foto machen, Kontakt angeben,
 * Ideenbild erhalten. Die Bilderzeugung und der E-Mail-Versand laufen in
 * api/badplaner.ts. Beim Prerendering (ohne Browser) wird nur der Startzustand
 * gerendert; alles mit Datei, Kamera oder Fenster passiert in Handlern.
 */

const PAGE_URL = `${business.siteUrl}/badplaner`;
const API_URL = '/api/badplaner';
const MAX_PLAN_FILE = 4 * 1024 * 1024; // Grundriss: 4 MB

type Step = 1 | 2 | 3 | 4;

interface Selection {
  tile: string;
  furniture: string;
  finish: string;
  sanitary: string;
  wall: string;
  shower: string;
  basin: string;
  mirror: string;
}

/** Erste Option jeder Gruppe als Vorgabe */
function defaultSelection(pkg: PackageId): Selection {
  const o = optionsForPackage(pkg);
  return {
    tile: o.tiles[0].id,
    furniture: o.furniture[0].id,
    finish: o.finishes[0].id,
    sanitary: o.sanitary[0].id,
    wall: o.walls[0].id,
    shower: o.showers[0].id,
    basin: o.basins[0].id,
    mirror: o.mirrors[0].id,
  };
}

interface Result {
  leadId: string;
  dataUrl: string;
  mime: string;
}

const howSteps = [
  { n: '1', title: 'Paket und Ausstattung wählen', text: 'Essenza, Colore oder Atelier. Dann Platte, Möbelfarbe, Armatur und Keramik: eine kleine Auswahl aus unserer Ausstellung.' },
  { n: '2', title: 'Foto vom Bad machen', text: 'Am Handy öffnet sich die Kamera. Von der Tür aus, das ganze Bad im Bild, Licht an. Das Foto wird vor dem Senden verkleinert.' },
  { n: '3', title: 'Ideenbild erhalten und besprechen', text: 'Nach etwa 20 Sekunden sehen Sie Ihr Bad mit den gewählten Materialien. Wir melden uns und laden Sie in die Ausstellung ein.' },
];

const examples = [
  { id: 1, pkg: 'Colore', before: '/badplaner/beispiele/beispiel-1-vorher.jpg', after: '/badplaner/beispiele/beispiel-1-nachher.jpg' },
  { id: 2, pkg: 'Essenza', before: '/badplaner/beispiele/beispiel-2-vorher.jpg', after: '/badplaner/beispiele/beispiel-2-nachher.jpg' },
];

/** Swatch-Bild; fehlt es (noch nicht geladen), zeigt es eine farbige Fläche. */
const Swatch: React.FC<{ image?: string | null; hex?: string; label: string }> = ({ image, hex, label }) => {
  const [broken, setBroken] = useState(false);
  if (!image || broken) {
    return (
      <span className={styles.swatchFallback} style={hex ? { background: hex } : undefined} aria-hidden="true">
        {hex ? '' : label.slice(0, 3)}
      </span>
    );
  }
  return <img src={image} alt="" width={72} height={72} loading="lazy" className={styles.swatchImg} onError={() => setBroken(true)} />;
};

const Badplaner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [pkg, setPkg] = useState<PackageId | null>(null);
  const [sel, setSel] = useState<Selection | null>(null);

  const [photo, setPhoto] = useState<ResizedImage | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState('');

  const [contact, setContact] = useState({ name: '', phone: '', email: '', place: '', consent: false });
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState<Result | null>(null);

  const [plan, setPlan] = useState({ sqm: '', note: '' });
  const [planFile, setPlanFile] = useState<File | null>(null);
  const [planStatus, setPlanStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const [planError, setPlanError] = useState('');

  const resultRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<Record<number, HTMLElement | null>>({});

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Zum Ergebnis scrollen, sobald es da ist
  useEffect(() => {
    if (result) resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [result]);

  const options = pkg ? optionsForPackage(pkg) : null;
  const pkgInfo = pkg ? bathPackages.find((p) => p.id === pkg) : undefined;

  const goTo = (next: Step) => {
    setStep(next);
    // kurz warten, bis der Schritt aufgeklappt ist, dann hinscrollen
    setTimeout(() => stepRefs.current[next]?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const choosePackage = (id: PackageId) => {
    setPkg(id);
    setSel(defaultSelection(id));
    goTo(2);
  };

  const choose = (key: keyof Selection, id: string) => setSel((s) => (s ? { ...s, [key]: id } : s));

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // gleiche Datei darf erneut gewählt werden
    if (!file) return;
    setPhotoError('');
    setPhotoBusy(true);
    try {
      const resized = await resizeImageFile(file, 1280, 0.82);
      setPhoto(resized);
    } catch {
      setPhoto(null);
      setPhotoError('Das Bild konnte nicht gelesen werden. Bitte ein Foto im JPEG-Format wählen.');
    } finally {
      setPhotoBusy(false);
    }
  };

  const submitRender = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!pkg || !sel || !photo) return;
    const form = new FormData(e.currentTarget);
    const gotcha = (form.get('_gotcha') || '').toString();
    if (gotcha.trim() !== '') return; // Honeypot
    if (contact.phone.replace(/\D/g, '').length < 7) {
      setStatus('error');
      setErrorMsg('Bitte eine gültige Telefonnummer angeben.');
      return;
    }
    setStatus('sending');
    setErrorMsg('');
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          kind: 'render',
          package: pkg,
          ...sel,
          name: contact.name.trim(),
          phone: contact.phone.trim(),
          email: contact.email.trim() || undefined,
          place: contact.place.trim() || undefined,
          consent: contact.consent,
          photo: { mime: photo.mime, data: photo.base64 },
          website: gotcha,
        }),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.ok && json.image?.data) {
        const mime = json.image.mime || 'image/png';
        setResult({ leadId: json.leadId || '', mime, dataUrl: `data:${mime};base64,${json.image.data}` });
        setStatus('idle');
        trackLead('form', 'badplaner');
      } else {
        setStatus('error');
        setErrorMsg(json?.error || friendlyHttpError(res.status));
      }
    } catch {
      setStatus('error');
      setErrorMsg('Keine Verbindung. Bitte prüfen Sie Ihr Netz und versuchen Sie es noch einmal.');
    }
  };

  const submitPlan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!result) return;
    setPlanError('');
    if (!planFile && !plan.sqm && !plan.note.trim()) {
      setPlanStatus('error');
      setPlanError('Bitte einen Grundriss, die Grösse oder eine Bemerkung angeben.');
      return;
    }
    setPlanStatus('sending');
    try {
      let file: { name: string; mime: string; data: string } | undefined;
      if (planFile) {
        if (planFile.type === 'application/pdf') {
          file = { name: planFile.name, mime: 'application/pdf', data: await fileToBase64(planFile) };
        } else {
          // Bilder werden wie das Foto verkleinert (Grundriss darf etwas grösser sein)
          const img = await resizeImageFile(planFile, 1800, 0.85);
          file = { name: planFile.name, mime: img.mime, data: img.base64 };
        }
      }
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          kind: 'grundriss',
          leadId: result.leadId,
          name: contact.name.trim(),
          phone: contact.phone.trim(),
          sqm: plan.sqm || undefined,
          note: plan.note.trim() || undefined,
          file,
        }),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.ok) {
        setPlanStatus('ok');
      } else {
        setPlanStatus('error');
        setPlanError(json?.error || friendlyHttpError(res.status));
      }
    } catch {
      setPlanStatus('error');
      setPlanError('Das hat nicht geklappt. Bitte noch einmal versuchen oder per WhatsApp schicken.');
    }
  };

  const onPlanFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPlanError('');
    if (file && file.size > MAX_PLAN_FILE) {
      setPlanFile(null);
      e.target.value = '';
      setPlanError('Die Datei ist zu gross (max. 4 MB).');
      return;
    }
    setPlanFile(file);
  };

  const startOver = () => {
    setResult(null);
    setStatus('idle');
    setPlanStatus('idle');
    setPlanFile(null);
    goTo(2);
  };

  // Für Zusammenfassung und WhatsApp-Text
  const chosen = options && sel
    ? {
        tile: options.tiles.find((t) => t.id === sel.tile),
        furniture: options.furniture.find((f) => f.id === sel.furniture),
        finish: options.finishes.find((f) => f.id === sel.finish),
        sanitary: options.sanitary.find((s) => s.id === sel.sanitary),
        wall: options.walls.find((w) => w.id === sel.wall),
        shower: options.showers.find((s) => s.id === sel.shower),
        basin: options.basins.find((b) => b.id === sel.basin),
        mirror: options.mirrors.find((m) => m.id === sel.mirror),
      }
    : null;

  const whatsappText = `Guten Tag, ich habe im Badplaner ein Ideenbild erstellt (Paket ${pkgInfo?.name ?? ''}${chosen?.tile ? `, Platte ${chosen.tile.label}` : ''}). Können wir das besprechen?`;
  const whatsappUrl = `https://wa.me/${business.whatsapp.e164.replace('+', '')}?text=${encodeURIComponent(whatsappText)}`;

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      '@id': `${PAGE_URL}#app`,
      name: 'Badplaner von New Living Design',
      url: PAGE_URL,
      applicationCategory: 'DesignApplication',
      operatingSystem: 'Web',
      description: 'Paket wählen, Foto vom Bad machen, Ideenbild erhalten: kostenlos und unverbindlich, aus Zofingen.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'CHF' },
      provider: { '@id': `${business.siteUrl}/#organization` },
    },
    generateFAQStructuredData(badplanerFaq),
    generateBreadcrumbStructuredData([
      { name: 'Home', url: '/' },
      { name: 'Badplaner', url: '/badplaner' },
    ]),
  ];

  const stepDone = (n: Step) => (n === 1 ? !!pkg : n === 2 ? !!pkg : n === 3 ? !!photo : !!result);
  const stepEnabled = (n: Step) => (n === 1 ? true : n === 4 ? !!pkg && !!photo : !!pkg);

  const renderStepHead = (n: Step, title: string, summary?: string) => (
    <button
      type="button"
      className={styles.stepHead}
      onClick={() => goTo(n)}
      disabled={!stepEnabled(n)}
      aria-expanded={step === n}
      aria-controls={`schritt-${n}-inhalt`}
    >
      <span className={styles.stepNumber}>{stepDone(n) && step !== n ? '✓' : n}</span>
      <span>
        <span className={styles.stepTitle}>{title}</span>
        {summary && step !== n && <span className={styles.stepSummary}>{summary}</span>}
      </span>
      <span className={styles.stepChevron} aria-hidden="true">⌄</span>
    </button>
  );

  const stepClass = (n: Step) => `${styles.step} ${step === n ? styles.stepOpen : ''} ${stepDone(n) ? styles.stepDone : ''}`;

  return (
    <main className={styles.page}>
      <SEOHead
        title="Badplaner: Ihr Bad als Ideenbild in 30 Sekunden | New Living Design"
        description="Paket wählen, Foto vom Bad machen, Ideenbild erhalten. Der Badplaner von New Living Design zeigt Ihr Bad mit neuen Platten, Farben und Armaturen. Kostenlos, unverbindlich, aus Zofingen."
        keywords="Badplaner, Bad planen online, Badumbau Ideen, Badezimmer Visualisierung, Bad Ideenbild, Badumbau Zofingen, Badplaner kostenlos"
        url="/badplaner"
        type="website"
        structuredData={structuredData}
        image={`${business.siteUrl}/badplaner/beispiele/beispiel-1-nachher.jpg`}
      />

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <div className={styles.heroOverlay} />
          <img src="/badplaner/beispiele/beispiel-1-nachher.jpg" alt="Ideenbild aus dem Badplaner: Bad mit Platten in Steinoptik und farbiger Keramik" className={styles.heroImage} fetchPriority="high" />
        </div>
        <div className={`${styles.heroContent} ${isVisible ? styles.visible : ''}`}>
          <p className={styles.eyebrow}>Neu · Badplaner</p>
          <h1 className={styles.heroTitle}>Ihr Bad als Ideenbild – in 30 Sekunden</h1>
          <p className={styles.heroText}>Paket wählen, Foto vom Bad machen, Ideenbild erhalten. Kostenlos, unverbindlich, aus Zofingen.</p>
          <div className={styles.heroActions}>
            <a href="#planer" className={styles.ctaPrimary}>Jetzt starten</a>
            <a href="#beispiele" className={styles.ctaSecondary}>Beispiele ansehen</a>
          </div>
          <p className={styles.heroNote}>
            Ideenbild, kein Plan: Das Bild zeigt eine Stimmung mit den gewählten Materialien. Masse, Leitungen und Details klären wir vor Ort.
          </p>
        </div>
      </section>

      {/* Planer: Schritte 1 bis 4 */}
      <section id="planer" className={`${styles.section} ${styles.light}`}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Badplaner</span>
            <h2 className={styles.sectionTitle}>Vier Schritte bis zum Ideenbild</h2>
          </div>

          <div className={styles.steps}>
            {/* Schritt 1: Paket */}
            <article id="schritt-1" className={stepClass(1)} ref={(el) => { stepRefs.current[1] = el; }}>
              {renderStepHead(1, 'Paket wählen', pkgInfo ? `Paket ${pkgInfo.name}, ab CHF ${pkgInfo.priceLabel}` : undefined)}
              {step === 1 && (
                <div id="schritt-1-inhalt" className={styles.stepBody}>
                  <div className={styles.packages} role="radiogroup" aria-label="Badpaket">
                    {bathPackages.map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        role="radio"
                        aria-checked={pkg === p.id}
                        className={`${styles.package} ${pkg === p.id ? styles.packageSelected : ''}`}
                        onClick={() => choosePackage(p.id)}
                      >
                        {p.highlight && <span className={styles.packageBadge}>Meistgewählt</span>}
                        <span className={styles.packageName}>{p.name}</span>
                        <span className={styles.packagePrice}>ab CHF {p.priceLabel}</span>
                        <span className={styles.packageClaim}>{p.claim}</span>
                        <ul className={styles.packageList}>
                          {p.includes.slice(0, 3).map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </button>
                    ))}
                  </div>
                  <p className={styles.hint}>
                    Richtpreise inkl. Material, Montage und MwSt. Details zu den Paketen auf der Seite <Link to="/badumbau-zofingen#pakete">Badumbau</Link>.
                  </p>
                </div>
              )}
            </article>

            {/* Schritt 2: Ausstattung */}
            <article id="schritt-2" className={stepClass(2)} ref={(el) => { stepRefs.current[2] = el; }}>
              {renderStepHead(2, 'Ausstattung wählen', chosen?.tile ? `${chosen.tile.label} · ${chosen.furniture?.label} · ${chosen.finish?.label}` : 'Platten, Farben, Armaturen')}
              {step === 2 && options && sel && (
                <div id="schritt-2-inhalt" className={styles.stepBody}>
                  <fieldset className={styles.group}>
                    <legend>Platten <span className={styles.groupMeta}>· {options.tiles[0].format.replace('x', '×')} cm</span></legend>
                    <div className={styles.swatches}>
                      {options.tiles.map((t) => (
                        <label key={t.id} className={`${styles.option} ${sel.tile === t.id ? styles.optionSelected : ''}`}>
                          <input type="radio" name="tile" value={t.id} checked={sel.tile === t.id} onChange={() => choose('tile', t.id)} />
                          <Swatch image={t.image} label={t.label} />
                          <span className={styles.optionLabel}>
                            {t.label}
                            <span className={styles.optionMeta}>{t.supplier} · {t.series}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                    <p className={styles.hint}>Nur eine kleine Auswahl. Alle Serien und Farben sehen Sie in unserer Ausstellung in Zofingen.</p>
                  </fieldset>

                  <fieldset className={styles.group}>
                    <legend>Wandplatten <span className={styles.groupMeta}>· wie hoch?</span></legend>
                    <div className={styles.choices}>
                      {options.walls.map((o) => (
                        <label key={o.id} className={`${styles.option} ${styles.choice} ${sel.wall === o.id ? styles.optionSelected : ''}`}>
                          <input type="radio" name="wall" value={o.id} checked={sel.wall === o.id} onChange={() => choose('wall', o.id)} />
                          <span className={styles.optionLabel}>{o.label}</span>
                        </label>
                      ))}
                    </div>
                    <p className={styles.hint}>Meist reichen die Platten bis ca. 120 cm, nur in Dusche und Badewanne bis zur Decke. Das spart Material und wirkt ruhiger.</p>
                  </fieldset>

                  <fieldset className={styles.group}>
                    <legend>Möbelfarbe <span className={styles.groupMeta}>· {options.furniture[0].supplier}</span></legend>
                    <div className={styles.chips}>
                      {options.furniture.map((f) => (
                        <label key={f.id} className={`${styles.option} ${styles.chip} ${sel.furniture === f.id ? styles.optionSelected : ''}`}>
                          <input type="radio" name="furniture" value={f.id} checked={sel.furniture === f.id} onChange={() => choose('furniture', f.id)} />
                          <Swatch hex={f.hex} label={f.label} />
                          <span className={styles.optionLabel}>{f.label}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <fieldset className={styles.group}>
                    <legend>Armaturen <span className={styles.groupMeta}>· Serie {options.tapSeries}</span></legend>
                    <div className={styles.chips}>
                      {options.finishes.map((f) => (
                        <label key={f.id} className={`${styles.option} ${styles.chip} ${sel.finish === f.id ? styles.optionSelected : ''}`}>
                          <input type="radio" name="finish" value={f.id} checked={sel.finish === f.id} onChange={() => choose('finish', f.id)} />
                          <Swatch image={f.image} label={f.label} />
                          <span className={styles.optionLabel}>{f.label}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <fieldset className={styles.group}>
                    <legend>Sanitärkeramik <span className={styles.groupMeta}>· WC und Waschtisch</span></legend>
                    <div className={styles.chips}>
                      {options.sanitary.map((s) => (
                        <label key={s.id} className={`${styles.option} ${styles.chip} ${sel.sanitary === s.id ? styles.optionSelected : ''}`}>
                          <input type="radio" name="sanitary" value={s.id} checked={sel.sanitary === s.id} onChange={() => choose('sanitary', s.id)} />
                          <Swatch image={s.image} hex={s.hex} label={s.label} />
                          <span className={styles.optionLabel}>{s.label}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <fieldset className={styles.group}>
                    <legend>Dusche oder Badewanne</legend>
                    <div className={styles.choices}>
                      {options.showers.map((o) => (
                        <label key={o.id} className={`${styles.option} ${styles.choice} ${sel.shower === o.id ? styles.optionSelected : ''}`}>
                          <input type="radio" name="shower" value={o.id} checked={sel.shower === o.id} onChange={() => choose('shower', o.id)} />
                          <span className={styles.optionLabel}>{o.label}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <fieldset className={styles.group}>
                    <legend>Waschtisch</legend>
                    <div className={styles.choices}>
                      {options.basins.map((o) => (
                        <label key={o.id} className={`${styles.option} ${styles.choice} ${sel.basin === o.id ? styles.optionSelected : ''}`}>
                          <input type="radio" name="basin" value={o.id} checked={sel.basin === o.id} onChange={() => choose('basin', o.id)} />
                          <span className={styles.optionLabel}>{o.label}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <fieldset className={styles.group}>
                    <legend>Spiegel</legend>
                    <div className={styles.choices}>
                      {options.mirrors.map((o) => (
                        <label key={o.id} className={`${styles.option} ${styles.choice} ${sel.mirror === o.id ? styles.optionSelected : ''}`}>
                          <input type="radio" name="mirror" value={o.id} checked={sel.mirror === o.id} onChange={() => choose('mirror', o.id)} />
                          <span className={styles.optionLabel}>{o.label}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <div className={styles.stepActions}>
                    <button type="button" className={styles.ctaDark} onClick={() => goTo(3)}>Weiter zum Foto</button>
                  </div>
                </div>
              )}
            </article>

            {/* Schritt 3: Foto */}
            <article id="schritt-3" className={stepClass(3)} ref={(el) => { stepRefs.current[3] = el; }}>
              {renderStepHead(3, 'Foto vom Bad', photo ? 'Foto bereit' : 'Kamera oder Bild auswählen')}
              {step === 3 && (
                <div id="schritt-3-inhalt" className={styles.stepBody}>
                  {photo ? (
                    <img src={photo.dataUrl} alt="Ihr Foto" className={styles.preview} />
                  ) : (
                    <label className={styles.upload}>
                      <input type="file" accept="image/*" capture="environment" onChange={onPhoto} disabled={photoBusy} />
                      <span className={styles.ctaDark}>{photoBusy ? 'Foto wird vorbereitet…' : 'Foto aufnehmen oder wählen'}</span>
                      <span className={styles.hint}>Am besten von der Tür aus, das ganze Bad im Bild, Licht an.</span>
                    </label>
                  )}
                  {photoError && <p className={styles.error}>{photoError}</p>}
                  {photo && (
                    <>
                      <p className={styles.hint}>Am besten von der Tür aus, das ganze Bad im Bild, Licht an. Das Foto wurde auf {photo.width}×{photo.height} Pixel verkleinert.</p>
                      <div className={styles.stepActions}>
                        <button type="button" className={styles.ctaDark} onClick={() => goTo(4)}>Weiter zu Kontakt</button>
                        <label className={styles.ctaLight}>
                          <input type="file" accept="image/*" capture="environment" onChange={onPhoto} style={{ display: 'none' }} />
                          Anderes Foto
                        </label>
                      </div>
                    </>
                  )}
                </div>
              )}
            </article>

            {/* Schritt 4: Kontakt + Ideenbild */}
            <article id="schritt-4" className={stepClass(4)} ref={(el) => { stepRefs.current[4] = el; }}>
              {renderStepHead(4, 'Kontakt und Ideenbild', result ? 'Ideenbild erstellt' : 'Name und Telefon, dann Bild erstellen')}
              {step === 4 && (
                <form id="schritt-4-inhalt" className={styles.stepBody} onSubmit={submitRender}>
                  <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className={styles.honeypot} aria-hidden="true" />
                  <div className={styles.formRow}>
                    <label className={styles.field}>
                      <span>Name</span>
                      <input type="text" name="name" required autoComplete="name" placeholder="Vor- und Nachname" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} />
                    </label>
                    <label className={styles.field}>
                      <span>Telefon / WhatsApp</span>
                      <input type="tel" name="phone" required autoComplete="tel" placeholder="+41 ..." value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
                    </label>
                  </div>
                  <div className={styles.formRow}>
                    <label className={styles.field}>
                      <span>E-Mail (optional)</span>
                      <input type="email" name="email" autoComplete="email" placeholder="name@beispiel.ch" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
                    </label>
                    <label className={styles.field}>
                      <span>PLZ / Ort (optional)</span>
                      <input type="text" name="place" autoComplete="postal-code" placeholder="z. B. 4800 Zofingen" value={contact.place} onChange={(e) => setContact({ ...contact, place: e.target.value })} />
                    </label>
                  </div>
                  <label className={styles.consent}>
                    <input type="checkbox" name="consent" required checked={contact.consent} onChange={(e) => setContact({ ...contact, consent: e.target.checked })} />
                    <span>
                      Ich habe die <Link to="/datenschutz#badplaner" target="_blank" rel="noopener noreferrer">Datenschutzerklärung</Link> gelesen. Mein Foto wird zur
                      Erstellung des Ideenbilds an Google (Gemini API) übermittelt und uns per E-Mail zugestellt.
                    </span>
                  </label>
                  <div className={styles.stepActions}>
                    <button type="submit" className={styles.ctaDark} disabled={status === 'sending' || !photo}>
                      {status === 'sending' ? 'Wird erstellt…' : 'Ideenbild erstellen'}
                    </button>
                  </div>
                  {status === 'sending' && (
                    <div className={styles.progress} role="status" aria-live="polite">
                      <div className={styles.progressBar}><span /></div>
                      <p className={styles.progressText}>Wir gestalten Ihr Bad … das dauert etwa 20 Sekunden. Bitte die Seite offen lassen.</p>
                    </div>
                  )}
                  {status === 'error' && (
                    <p className={styles.error} role="alert">
                      {errorMsg} Oder rufen Sie uns an: <a href={`tel:${business.phone.e164}`} data-lead="badplaner-fehler">{business.phone.display}</a>
                    </p>
                  )}
                </form>
              )}
            </article>
          </div>
        </div>
      </section>

      {/* Ergebnis + Schritt 5 */}
      {result && pkgInfo && chosen && (
        <section id="ergebnis" className={`${styles.section} ${styles.dark}`}>
          <div className={styles.container}>
            <div className={styles.result} ref={resultRef}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionLabel}>Ihr Ideenbild</span>
                <h2 className={styles.sectionTitle}>So könnte Ihr Bad aussehen</h2>
              </div>
              <img src={result.dataUrl} alt={`Ideenbild Ihres Bads im Paket ${pkgInfo.name}`} className={styles.resultImage} />
              <span className={styles.badge}>Ideenbild, kein Plan</span>
              <div className={styles.compare}>
                <figure>
                  <img src={photo?.dataUrl} alt="Ihr Foto (vorher)" />
                  <figcaption>Vorher: Ihr Foto</figcaption>
                </figure>
                <figure>
                  <img src={result.dataUrl} alt="Ideenbild (nachher)" />
                  <figcaption>Nachher: Ideenbild</figcaption>
                </figure>
              </div>
              <ul className={styles.summary}>
                <li><span>Paket</span><span>{pkgInfo.name}, ab CHF {pkgInfo.priceLabel}</span></li>
                <li><span>Platte</span><span>{chosen.tile?.supplier} {chosen.tile?.series} {chosen.tile?.color}, {chosen.tile?.format.replace('x', '×')} cm</span></li>
                <li><span>Wandplatten</span><span>{chosen.wall?.label}</span></li>
                <li><span>Möbelfarbe</span><span>{chosen.furniture?.label}</span></li>
                <li><span>Armaturen</span><span>{chosen.finish?.label}, {options?.tapSeries}</span></li>
                <li><span>Keramik</span><span>{chosen.sanitary?.label}</span></li>
                <li><span>Dusche / Wanne</span><span>{chosen.shower?.label}</span></li>
                <li><span>Waschtisch</span><span>{chosen.basin?.label} · {chosen.mirror?.label}</span></li>
              </ul>
              <div className={styles.resultActions}>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={styles.ctaPrimary} data-lead="badplaner-ergebnis">Per WhatsApp besprechen</a>
                <a href={result.dataUrl} download={`ideenbild-${pkgInfo.id}.${result.mime === 'image/jpeg' ? 'jpg' : 'png'}`} className={styles.ctaSecondary}>Bild speichern</a>
                <Link to="/kontakt" className={styles.ctaSecondary}>Termin in der Ausstellung</Link>
              </div>
              <p className={styles.resultNote}>
                Wir haben Ihre Angaben erhalten und melden uns innerhalb eines Arbeitstages. Das Ideenbild zeigt eine Stimmung mit den gewählten Materialien;
                Masse, Leitungen und Details klären wir vor Ort.{' '}
                <button type="button" onClick={startOver}>Andere Farben oder ein anderes Paket probieren</button> (bis zu drei Ideenbilder pro Tag).
              </p>
            </div>

            {/* Schritt 5: Grundriss (optional) */}
            <form className={styles.extra} onSubmit={submitPlan}>
              <h3>Für eine genauere Einschätzung</h3>
              <p>Optional: Grundriss, Grösse und Wünsche. Damit können wir den Richtpreis vor der Besichtigung besser einschätzen.</p>
              {planStatus === 'ok' ? (
                <p className={styles.success}>Danke, wir melden uns innerhalb eines Arbeitstages.</p>
              ) : (
                <>
                  <div className={styles.formRow}>
                    <label className={styles.field}>
                      <span>Grundriss (Bild oder PDF, max. 4 MB)</span>
                      <input type="file" accept="image/*,application/pdf" onChange={onPlanFile} />
                    </label>
                    <label className={styles.field}>
                      <span>Bad-Grösse in m²</span>
                      <input type="number" inputMode="decimal" min="1" max="200" step="0.5" placeholder="z. B. 6.5" value={plan.sqm} onChange={(e) => setPlan({ ...plan, sqm: e.target.value })} />
                    </label>
                  </div>
                  <label className={styles.field}>
                    <span>Bemerkung</span>
                    <textarea rows={3} placeholder="Alter des Bads, Wünsche, Zeitpunkt" value={plan.note} onChange={(e) => setPlan({ ...plan, note: e.target.value })} />
                  </label>
                  <div className={styles.stepActions}>
                    <button type="submit" className={styles.ctaPrimary} disabled={planStatus === 'sending'}>
                      {planStatus === 'sending' ? 'Wird gesendet…' : 'Senden'}
                    </button>
                  </div>
                  {planStatus === 'error' && <p className={styles.error} role="alert">{planError}</p>}
                </>
              )}
            </form>
          </div>
        </section>
      )}

      {/* Beispiele */}
      <section id="beispiele" className={`${styles.section} ${styles.light}`}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Beispiele</span>
            <h2 className={styles.sectionTitle}>Vorher und nachher</h2>
            <p className={styles.sectionIntro}>Zwei Kundenfotos und die Ideenbilder, die der Badplaner daraus gemacht hat.</p>
          </div>
          <div className={styles.examples}>
            {examples.map((ex) => (
              <figure key={ex.id} className={styles.example}>
                <div className={styles.examplePair}>
                  <div>
                    <img src={ex.before} alt={`Beispiel ${ex.id}: Kundenfoto des bestehenden Bads`} loading="lazy" width="600" height="750" />
                    <span className={styles.exampleTag}>Vorher</span>
                  </div>
                  <div>
                    <img src={ex.after} alt={`Beispiel ${ex.id}: Ideenbild im Paket ${ex.pkg}`} loading="lazy" width="600" height="750" />
                    <span className={styles.exampleTag}>Ideenbild</span>
                  </div>
                </div>
                <figcaption>Kundenfoto · Ideenbild Paket {ex.pkg}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* So funktioniert's */}
      <section id="ablauf" className={`${styles.section} ${styles.dark}`}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>So funktioniert's</span>
            <h2 className={styles.sectionTitle}>Drei Schritte, ein Ideenbild</h2>
          </div>
          <ol className={styles.how}>
            {howSteps.map((s) => (
              <li key={s.n} className={styles.howStep}>
                <span className={styles.stepNumber}>{s.n}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className={styles.center}>
            <a href="#planer" className={styles.ctaPrimary}>Jetzt starten</a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className={`${styles.section} ${styles.light}`}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Häufige Fragen</span>
            <h2 className={styles.sectionTitle}>Fragen zum Badplaner</h2>
          </div>
          <div className={styles.faq}>
            {badplanerFaq.map((item) => (
              <details key={item.question} className={styles.faqItem}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
          <p className={styles.hint} style={{ textAlign: 'center', marginTop: '2rem' }}>
            Lieber direkt sprechen? <a href={`tel:${business.phone.e164}`} data-lead="badplaner-faq">{business.phone.display}</a> oder{' '}
            <a href={`https://wa.me/${business.whatsapp.e164.replace('+', '')}`} target="_blank" rel="noopener noreferrer" data-lead="badplaner-faq">WhatsApp</a>.
          </p>
        </div>
      </section>
    </main>
  );
};

/** Verständliche Meldung, wenn die API keinen Text liefert. */
function friendlyHttpError(status: number): string {
  if (status === 413) return 'Das Bild ist zu gross für den Upload. Bitte ein kleineres Foto wählen.';
  if (status === 429) return 'Tageslimit erreicht (3 Ideenbilder). Rufen Sie uns an oder kommen Sie in die Ausstellung.';
  if (status === 503) return 'Der Badplaner ist im Moment nicht verfügbar.';
  return 'Das hat nicht geklappt. Bitte in einer Minute noch einmal versuchen.';
}

export default Badplaner;
