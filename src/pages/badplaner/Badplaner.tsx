import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Badplaner.module.css';
import { SEOHead } from '../../components';
import { business, bathPackages, individualPackage } from '../../config/business';
import {
  accentsForPlacement,
  badplanerFaq,
  optionsForPackage,
  tilesForLook,
  type AccentPlacementId,
  type PackageId,
} from '../../data/badplaner';
import { photoUrl } from '../../data/references';
import { generateFAQStructuredData, generateBreadcrumbStructuredData } from '../../utils/structuredData';
import { trackLead } from '../../utils/tracking';
import { resizeImageFile, fileToBase64, type ResizedImage } from './resizeImage';
import { MAX_PLAN_BASE64, MAX_SOURCE_IMAGE_BYTES } from './imageValidation';

/*
 * Badplaner: Paket wählen, Ausstattung wählen, Foto machen, Kontakt angeben,
 * Ideenbild erhalten. Die Bilderzeugung und der E-Mail-Versand laufen in
 * api/badplaner.ts. Beim Prerendering (ohne Browser) wird nur der Startzustand
 * gerendert; alles mit Datei, Kamera oder Fenster passiert in Handlern.
 *
 * Schritt 2 zeigt zuerst die wichtigsten Auswahlen. Umfangreiche Materialfamilien
 * und die optionalen Details sind einklappbar; alle Werte bleiben vorbelegt und
 * jede bisherige Option bleibt erreichbar.
 */

const PAGE_URL = `${business.siteUrl}/badplaner`;
const WINDOW_OPTIONS = [
  { id: '0', label: 'Keins' },
  { id: '1', label: '1 Fenster' },
  { id: '2', label: '2 Fenster' },
  { id: '3', label: '3 oder mehr' },
];
const API_URL = '/api/badplaner';
const MAX_PLAN_PDF_BYTES = 3_000_000; // Base64 + JSON remains below the API request cap.
const RENDER_TIMEOUT_MS = 115_000;
const TILE_HINT = 'Nur eine kleine Auswahl. Alle Serien und Farben sehen Sie in unserer Ausstellung in Zofingen.';
const NEWSLETTER_TEXT =
  'Ja, ich möchte gelegentlich Ideen und Neuigkeiten von New Living Design per E-Mail erhalten (jederzeit abbestellbar).';

/** Fläche im Vertrag mit der API (Kapitel 10 der Spezifikation). */
const PLACEMENT_FIELD: Record<AccentPlacementId, string> = {
  waschtischwand: 'waschtisch',
  duschnische: 'dusche',
};

type Step = 1 | 2 | 3 | 4;

interface Selection {
  format: string;               // Plattenformat (leer bei Atelier)
  look: string;                 // Look-Id (nur Atelier)
  tile: string;                 // Platte Wand (bzw. alles)
  floorDifferent: boolean;      // Boden anders als die Wand
  floor: string;                // Platte Boden
  accentMode: string;           // einheitlich | kombination (nur Atelier)
  accentPlacement: AccentPlacementId;
  accent: string;               // Akzentmaterial
  base: string;                 // Unterbau
  top: string;                  // Waschtischplatte
  basinType: string;            // integriertes Becken oder Aufsatzbecken (Atelier)
  tapSeries: string;            // Armaturenserie (Colore)
  finish: string;               // Armaturen-Oberfläche (Atelier)
  sanitary: string;             // Keramikfarbe
  wall: string;                 // Wandhöhe
  shower: string;
  basin: string;
  mirror: string;
}

interface Result {
  leadId: string;
  dataUrl: string;
  mime: string;
  delivery: {
    lead: 'accepted';
    customer: 'accepted' | 'failed' | 'unknown' | 'skipped';
    newsletter?: 'accepted' | 'failed' | 'unknown' | 'skipped';
  };
}

const firstId = (list: { id: string }[]): string => (list.length > 0 ? list[0].id : '');

/** Erste Option jeder Gruppe als Vorgabe: nichts ist Pflicht, alles ist vorbelegt. */
function defaultSelection(pkg: PackageId): Selection {
  const o = optionsForPackage(pkg);
  const look = firstId(o.looks);
  const tileList = pkg === 'atelier' ? tilesForLook(look) : o.tiles;
  const tile = firstId(tileList);
  return {
    format: o.formats[0] ?? '',
    look,
    tile,
    floorDifferent: false,
    floor: tile,
    accentMode: firstId(o.accentModes),
    accentPlacement: 'waschtischwand',
    accent: firstId(accentsForPlacement('waschtischwand')),
    base: firstId(o.bases),
    top: firstId(o.tops),
    basinType: firstId(o.basinTypes),
    tapSeries: firstId(o.tapSeriesOptions),
    finish: firstId(o.finishes),
    sanitary: firstId(o.sanitary),
    wall: firstId(o.walls),
    shower: firstId(o.showers),
    basin: firstId(o.basins),
    mirror: firstId(o.mirrors),
  };
}

/** Liste in Gruppen (Serie, Familie, Lieferant) zerlegen, Reihenfolge bleibt. */
function groupBy<T>(items: T[], key: (item: T) => string): { key: string; items: T[] }[] {
  const out: { key: string; items: T[] }[] = [];
  const index = new Map<string, { key: string; items: T[] }>();
  for (const item of items) {
    const k = key(item);
    let group = index.get(k);
    if (!group) {
      group = { key: k, items: [] };
      index.set(k, group);
      out.push(group);
    }
    group.items.push(item);
  }
  return out;
}

const howSteps = [
  { n: '1', title: 'Paket und Ausstattung wählen', text: 'Essenza, Colore, Atelier oder eine individuelle Lösung. Dann Platte, Möbelfarbe und, je nach Paket, Armatur und Keramik: eine kleine Auswahl aus unserer Ausstellung.' },
  { n: '2', title: 'Foto vom Bad machen', text: 'Am Handy neu aufnehmen oder ein Foto aus der Galerie wählen. Von der Tür aus, das ganze Bad im Bild, Licht an. Das Foto wird vor dem Senden verkleinert.' },
  { n: '3', title: 'Ideenbild erhalten und besprechen', text: 'Nach der automatischen Erstellung und Prüfung sehen Sie Ihr Bad mit den gewählten Materialien. Wir melden uns und laden Sie in die Ausstellung ein.' },
];

/** Musterbild; fehlt es (noch nicht geladen), zeigt es eine farbige Fläche. */
const Swatch: React.FC<{ image?: string | null; hex?: string; label: string; cover?: boolean; diagram?: boolean }> = ({ image, hex, label, cover, diagram }) => {
  const [broken, setBroken] = useState(false);
  // diagram: Strichzeichnung auf hellem Grund – ganz zeigen statt quadratisch beschneiden
  const coverClass = diagram ? `${styles.cardImg} ${styles.cardImgDiagram}` : styles.cardImg;
  if (!image || broken) {
    return (
      <span
        className={cover ? `${coverClass} ${styles.coverFallback}` : styles.swatchFallback}
        style={hex ? { background: hex } : undefined}
        aria-hidden="true"
      >
        {hex ? '' : label.slice(0, 3)}
      </span>
    );
  }
  return (
    <img
      src={image}
      alt=""
      loading="lazy"
      className={cover ? coverClass : styles.swatchImg}
      width={cover ? (diagram ? 520 : 480) : 72}
      height={cover ? (diagram ? 390 : 320) : 72}
      onError={() => setBroken(true)}
    />
  );
};

interface PickItem {
  id: string;
  label: string;
  image?: string | null;
  hex?: string;
  meta?: string;
  note?: string;
}

/** Muster mit Bild (Platten, Möbel, Akzente). */
const SwatchPicker: React.FC<{ name: string; items: PickItem[]; value: string; onChange: (id: string) => void }> = ({ name, items, value, onChange }) => (
  <div className={styles.swatches}>
    {items.map((o) => (
      <label key={o.id} className={`${styles.option} ${value === o.id ? styles.optionSelected : ''}`}>
        <input type="radio" name={name} value={o.id} checked={value === o.id} onChange={() => onChange(o.id)} />
        <Swatch image={o.image} hex={o.hex} label={o.label} />
        <span className={styles.optionLabel}>
          {o.label}
          {o.meta && <span className={styles.optionMeta}>{o.meta}</span>}
        </span>
      </label>
    ))}
  </div>
);

/** Eine Materialfamilie: nur die bereits gewählte Familie ist anfangs geöffnet. */
const SwatchGroup: React.FC<{
  name: string;
  title: string;
  meta?: string;
  items: PickItem[];
  value: string;
  onChange: (id: string) => void;
  note?: string;
}> = ({ name, title, meta, items, value, onChange, note }) => {
  const selected = items.find((item) => item.id === value);
  const [open, setOpen] = useState(Boolean(selected));

  return (
    <details className={styles.swatchGroup} open={open} onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary className={styles.swatchGroupSummary}>
        <span className={styles.swatchGroupHeading}>
          <span className={styles.swatchGroupTitle}>{title}</span>
          {meta && <span className={styles.swatchGroupMeta}>{meta}</span>}
        </span>
        <span className={styles.swatchGroupStatus}>
          {selected ? `${selected.label} · ` : ''}{items.length} {items.length === 1 ? 'Option' : 'Optionen'}
        </span>
      </summary>
      <div className={styles.swatchGroupBody}>
        <SwatchPicker name={name} items={items} value={value} onChange={onChange} />
        {note && <p className={styles.hint}>{note}</p>}
      </div>
    </details>
  );
};

/** Kleine runde Auswahl (Keramikfarbe, Oberfläche, Format, Fenster). */
const ChipPicker: React.FC<{ name: string; items: PickItem[]; value: string; onChange: (id: string) => void }> = ({ name, items, value, onChange }) => (
  <div className={styles.chips}>
    {items.map((o) => (
      <label key={o.id} className={`${styles.option} ${styles.chip} ${value === o.id ? styles.optionSelected : ''}`}>
        <input type="radio" name={name} value={o.id} checked={value === o.id} onChange={() => onChange(o.id)} />
        {(o.image || o.hex) && <Swatch image={o.image} hex={o.hex} label={o.label} />}
        <span className={styles.optionLabel}>{o.label}</span>
      </label>
    ))}
  </div>
);

/** Reine Textauswahl (Wandhöhe, Dusche, Waschtisch, Spiegel). */
const ChoicePicker: React.FC<{ name: string; items: PickItem[]; value: string; onChange: (id: string) => void }> = ({ name, items, value, onChange }) => (
  <div className={styles.choices}>
    {items.map((o) => (
      <label key={o.id} className={`${styles.option} ${styles.choice} ${value === o.id ? styles.optionSelected : ''}`}>
        <input type="radio" name={name} value={o.id} checked={value === o.id} onChange={() => onChange(o.id)} />
        <span className={styles.optionLabel}>
          {o.label}
          {o.meta && <span className={styles.optionMeta}>{o.meta}</span>}
        </span>
      </label>
    ))}
  </div>
);

/** Karten mit Foto (Looks, Armaturenserien, Waschbeckenart). */
const CardPicker: React.FC<{ name: string; items: PickItem[]; value: string; onChange: (id: string) => void; large?: boolean; diagram?: boolean }> = ({ name, items, value, onChange, large, diagram }) => (
  <div className={large ? styles.lookCards : styles.photoCards}>
    {items.map((o) => (
      <label key={o.id} className={`${styles.card} ${value === o.id ? styles.cardSelected : ''}`}>
        <input type="radio" name={name} value={o.id} checked={value === o.id} onChange={() => onChange(o.id)} />
        <Swatch image={o.image} label={o.label} cover diagram={diagram} />
        <span className={styles.cardText}>
          <span className={styles.cardLabel}>{o.label}</span>
          {o.meta && <span className={styles.cardMeta}>{o.meta}</span>}
          {o.note && <span className={styles.cardNote}>{o.note}</span>}
        </span>
      </label>
    ))}
  </div>
);

const Badplaner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [pkg, setPkg] = useState<PackageId | null>(null);
  const [individuell, setIndividuell] = useState(false);
  const [sel, setSel] = useState<Selection | null>(null);

  const [photo, setPhoto] = useState<ResizedImage | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [windows, setWindows] = useState(''); // Fenster auf dem Foto: '0' | '1' | '2' | '3'

  const [contact, setContact] = useState({ name: '', phone: '', email: '', consent: false, newsletter: false });
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [result, setResult] = useState<Result | null>(null);

  const [plan, setPlan] = useState({ sqm: '', note: '' });
  const [planFile, setPlanFile] = useState<File | null>(null);
  const [planStatus, setPlanStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const [planError, setPlanError] = useState('');

  const resultRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<Record<number, HTMLElement | null>>({});
  const renderSubmittingRef = useRef(false);
  const planSubmittingRef = useRef(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Zum Ergebnis scrollen, sobald es da ist
  useEffect(() => {
    if (result) resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [result]);

  const options = pkg ? optionsForPackage(pkg) : null;
  const pkgInfo = pkg ? bathPackages.find((p) => p.id === pkg) : undefined;
  const isAtelier = pkg === 'atelier';
  const canOpenStep4 = !!pkg && !!sel && !!photo && /^[0-3]$/.test(windows) && !photoBusy;

  // Platten des gewählten Looks (Atelier) bzw. des Pakets
  const tileList = useMemo(() => {
    if (!options || !sel) return [];
    return isAtelier ? tilesForLook(sel.look) : options.tiles;
  }, [options, sel, isAtelier]);

  const tileGroups = useMemo(() => groupBy(tileList, (t) => t.series), [tileList]);
  const baseGroups = useMemo(() => groupBy(options ? options.bases : [], (b) => b.family || b.collection), [options]);
  const topGroups = useMemo(() => groupBy(options ? options.tops : [], (t) => t.material), [options]);
  const accentList = useMemo(() => (sel ? accentsForPlacement(sel.accentPlacement) : []), [sel]);
  const accentGroups = useMemo(() => groupBy(accentList, (a) => a.supplier), [accentList]);

  const goTo = (next: Step) => {
    if (renderSubmittingRef.current) return;
    if (next === 4 && !canOpenStep4) return;
    setStep(next);
    // kurz warten, bis der Schritt aufgeklappt ist, dann hinscrollen
    setTimeout(() => stepRefs.current[next]?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };

  const choosePackage = (id: PackageId, custom: boolean) => {
    setIndividuell(custom);
    setPkg(id);
    setSel(defaultSelection(id));
    goTo(2);
  };

  /** Vierte Karte: erst danach das nächstgelegene Paket als Grundlage wählen. */
  const chooseIndividual = () => {
    setIndividuell(true);
    setPkg(null);
    setSel(null);
    setStep(1);
  };

  const choose = <K extends keyof Selection>(key: K, value: Selection[K]) =>
    setSel((s) => (s ? { ...s, [key]: value } : s));

  /** Look wechseln: die Platten des neuen Looks werden neu vorbelegt. */
  const chooseLook = (id: string) => {
    const tile = firstId(tilesForLook(id));
    setSel((s) => (s ? { ...s, look: id, tile, floor: tile } : s));
  };

  /** Fläche wechseln: nur Materialien zeigen, die dort zulässig sind (Nassbereich). */
  const choosePlacement = (id: AccentPlacementId) => {
    const allowed = accentsForPlacement(id);
    setSel((s) => (s ? { ...s, accentPlacement: id, accent: allowed.some((a) => a.id === s.accent) ? s.accent : firstId(allowed) } : s));
  };

  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // gleiche Datei darf erneut gewählt werden
    if (!file) return;
    setPhotoError('');
    setPhotoBusy(true);
    try {
      const resized = await resizeImageFile(file, 1280, 0.82);
      setPhoto(resized);
      setWindows(''); // neues Foto, Fenster neu angeben
    } catch (error) {
      setPhoto(null);
      setPhotoError(error instanceof Error ? error.message : 'Das Bild konnte nicht gelesen werden. Bitte JPEG, PNG oder WebP wählen.');
    } finally {
      setPhotoBusy(false);
    }
  };

  const submitRender = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (renderSubmittingRef.current) return;
    if (!pkg || !sel || !photo || !canOpenStep4) {
      setStatus('error');
      setErrorMsg('Bitte wählen Sie ein Paket, ein Foto und die Anzahl sichtbarer Fenster.');
      return;
    }
    const form = new FormData(e.currentTarget);
    const gotcha = (form.get('_gotcha') || '').toString();
    if (gotcha.trim() !== '') return; // Honeypot
    if (contact.phone.replace(/\D/g, '').length < 7) {
      setStatus('error');
      setErrorMsg('Bitte eine gültige Telefonnummer angeben.');
      return;
    }
    renderSubmittingRef.current = true;
    setStatus('sending');
    setErrorMsg('');
    const kombination = isAtelier && sel.accentMode === 'kombination';
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), RENDER_TIMEOUT_MS);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'content-type': 'application/json', Accept: 'application/json' },
        // Feldnamen nach Kapitel 10 der Spezifikation (Vertrag mit api/badplaner.ts)
        body: JSON.stringify({
          kind: 'render',
          paket: pkg,
          individuell,
          format: isAtelier ? '' : sel.format,
          look: isAtelier ? sel.look : '',
          platte: sel.tile,
          boden: sel.floorDifferent ? sel.floor : '',
          kombination: isAtelier ? sel.accentMode : '',
          akzentFlaeche: kombination ? PLACEMENT_FIELD[sel.accentPlacement] : '',
          akzent: kombination ? sel.accent : '',
          top: sel.top,
          unterbau: sel.base,
          becken: sel.basinType,
          armaturenserie: pkg === 'colore' ? sel.tapSeries : '',
          finish: isAtelier ? sel.finish : '',
          keramik: sel.sanitary,
          wall: sel.wall,
          dusche: sel.shower,
          waschtisch: sel.basin,
          spiegel: sel.mirror,
          windows,
          foto: photo.dataUrl,
          name: contact.name.trim(),
          email: contact.email.trim(),
          telefon: contact.phone.trim(),
          newsletter: contact.newsletter,
          consent: contact.consent,
          website: gotcha,
        }),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.ok && json.image?.data && json.delivery?.lead === 'accepted') {
        const mime = json.image.mime || 'image/png';
        const customerDelivery = ['accepted', 'failed', 'unknown', 'skipped'].includes(json.delivery?.customer)
          ? json.delivery.customer
          : 'unknown';
        const newsletterDelivery = ['accepted', 'failed', 'unknown', 'skipped'].includes(json.delivery?.newsletter)
          ? json.delivery.newsletter
          : undefined;
        setResult({
          leadId: json.leadId || '',
          mime,
          dataUrl: `data:${mime};base64,${json.image.data}`,
          delivery: {
            lead: 'accepted',
            customer: customerDelivery,
            newsletter: newsletterDelivery,
          },
        });
        setStatus('idle');
        trackLead('form', 'badplaner');
      } else {
        setStatus('error');
        setErrorMsg(json?.error || friendlyHttpError(res.status));
      }
    } catch (error) {
      setStatus('error');
      setErrorMsg(
        error instanceof DOMException && error.name === 'AbortError'
          ? 'Die Erstellung hat zu lange gedauert und wurde abgebrochen. Bitte versuchen Sie es noch einmal.'
          : 'Keine Verbindung. Bitte prüfen Sie Ihr Netz und versuchen Sie es noch einmal.',
      );
    } finally {
      window.clearTimeout(timeout);
      renderSubmittingRef.current = false;
    }
  };

  const submitPlan = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!result || planSubmittingRef.current) return;
    setPlanError('');
    if (!planFile && !plan.sqm && !plan.note.trim()) {
      setPlanStatus('error');
      setPlanError('Bitte einen Grundriss, die Grösse oder eine Bemerkung angeben.');
      return;
    }
    planSubmittingRef.current = true;
    setPlanStatus('sending');
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), RENDER_TIMEOUT_MS);
    try {
      let file: { name: string; mime: string; data: string } | undefined;
      if (planFile) {
        if (planFile.type === 'application/pdf') {
          file = { name: planFile.name, mime: 'application/pdf', data: await fileToBase64(planFile) };
        } else {
          // Bilder werden wie das Foto verkleinert (Grundriss darf etwas grösser sein)
          const img = await resizeImageFile(planFile, 1800, 0.85, MAX_PLAN_BASE64 - 64 * 1024);
          file = { name: planFile.name, mime: img.mime, data: img.base64 };
        }
      }
      const res = await fetch(API_URL, {
        method: 'POST',
        signal: controller.signal,
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
      setPlanError('Die Zustellung konnte nicht bestätigt werden. Bitte senden Sie die Datei per WhatsApp oder kontaktieren Sie uns direkt.');
    } finally {
      window.clearTimeout(timeout);
      planSubmittingRef.current = false;
    }
  };

  const onPlanFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setPlanError('');
    const isPdf = file?.type === 'application/pdf';
    if (file && file.size > (isPdf ? MAX_PLAN_PDF_BYTES : MAX_SOURCE_IMAGE_BYTES)) {
      setPlanFile(null);
      e.target.value = '';
      setPlanError(isPdf ? 'Das PDF ist zu gross (max. 3 MB).' : 'Das Bild ist zu gross (max. 20 MB).');
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

  // Gewählte Optionen (für Zusammenfassung, WhatsApp-Text und Kurztexte)
  const chosen = options && sel
    ? {
        look: options.looks.find((l) => l.id === sel.look),
        tile: tileList.find((t) => t.id === sel.tile),
        floor: sel.floorDifferent ? tileList.find((t) => t.id === sel.floor) : undefined,
        accentMode: options.accentModes.find((a) => a.id === sel.accentMode),
        accentPlacement: options.accentPlacements.find((a) => a.id === sel.accentPlacement),
        accent: accentList.find((a) => a.id === sel.accent),
        base: options.bases.find((b) => b.id === sel.base),
        top: options.tops.find((t) => t.id === sel.top),
        basinType: options.basinTypes.find((b) => b.id === sel.basinType),
        tapSeries: options.tapSeriesOptions.find((t) => t.id === sel.tapSeries),
        finish: options.finishes.find((f) => f.id === sel.finish),
        sanitary: options.sanitary.find((s) => s.id === sel.sanitary),
        wall: options.walls.find((w) => w.id === sel.wall),
        shower: options.showers.find((s) => s.id === sel.shower),
        basin: options.basins.find((b) => b.id === sel.basin),
        mirror: options.mirrors.find((m) => m.id === sel.mirror),
      }
    : null;

  const packageLabel = pkgInfo
    ? individuell
      ? `Individuelle Lösung (Grundlage: ${pkgInfo.name})`
      : `${pkgInfo.name}, ab CHF ${pkgInfo.priceLabel}`
    : '';

  /** Nur die Zeilen, die wirklich gewählt wurden – mit den offiziellen Namen. */
  const summaryRows: { label: string; value: string }[] = [];
  if (chosen && options && sel && pkgInfo) {
    summaryRows.push({ label: 'Paket', value: packageLabel });
    if (isAtelier && chosen.look) summaryRows.push({ label: 'Look', value: chosen.look.label });
    if (!isAtelier && sel.format) summaryRows.push({ label: 'Format', value: `${sel.format.replace('x', '×')} cm` });
    if (chosen.tile) {
      summaryRows.push({
        label: sel.floorDifferent ? 'Platten Wand' : 'Platten',
        value: `${chosen.tile.supplier} ${chosen.tile.series} ${chosen.tile.color}`,
      });
    }
    if (chosen.floor) {
      summaryRows.push({ label: 'Platten Boden', value: `${chosen.floor.supplier} ${chosen.floor.series} ${chosen.floor.color}` });
    }
    if (isAtelier && chosen.accentMode) {
      summaryRows.push({ label: 'Materialbild', value: chosen.accentMode.label });
      if (sel.accentMode === 'kombination' && chosen.accent && chosen.accentPlacement) {
        summaryRows.push({ label: 'Akzentfläche', value: chosen.accentPlacement.label });
        summaryRows.push({ label: 'Akzentmaterial', value: `${chosen.accent.supplier} ${chosen.accent.label}` });
      }
    }
    if (chosen.wall) summaryRows.push({ label: 'Wandhöhe', value: chosen.wall.label });
    if (chosen.shower) summaryRows.push({ label: 'Dusche / Wanne', value: chosen.shower.label });
    if (chosen.base) summaryRows.push({ label: 'Unterbau', value: `${chosen.base.supplier} ${chosen.base.label}` });
    if (chosen.top) summaryRows.push({ label: 'Waschtischplatte', value: `${chosen.top.supplier} ${chosen.top.label}` });
    if (chosen.basinType && options.basinTypes.length > 1) {
      summaryRows.push({ label: 'Waschbeckenart', value: chosen.basinType.label });
    }
    if (pkg === 'colore' && chosen.tapSeries) {
      summaryRows.push({ label: 'Armaturen', value: `${chosen.tapSeries.label}, Chrom` });
    } else if (isAtelier && chosen.finish) {
      summaryRows.push({ label: 'Armaturen', value: `${chosen.finish.label}, ${options.tapSeries}` });
    } else if (options.tapSeries) {
      summaryRows.push({ label: 'Armaturen', value: options.tapSeries });
    }
    if (chosen.sanitary) summaryRows.push({ label: 'Keramik', value: chosen.sanitary.label });
    if (chosen.basin) summaryRows.push({ label: 'Waschtisch', value: chosen.basin.label });
    if (chosen.mirror) summaryRows.push({ label: 'Spiegel', value: chosen.mirror.label });
  }

  const whatsappText = `Guten Tag, ich habe im Badplaner ein Ideenbild erstellt (${packageLabel || 'Badplaner'}${chosen?.tile ? `, Platte ${chosen.tile.label}` : ''}). Können wir das besprechen?`;
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
  const stepEnabled = (n: Step) => (n === 1 ? true : n === 4 ? canOpenStep4 : !!pkg);

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

  /** Die drei Paketkarten – auch als Grundlage für die individuelle Lösung. */
  const renderPackageCards = (custom: boolean) => (
    <div className={styles.packages} role="radiogroup" aria-label={custom ? 'Nächstgelegenes Paket' : 'Badpaket'}>
      {bathPackages.map((p) => (
        <button
          type="button"
          key={p.id}
          role="radio"
          aria-checked={pkg === p.id && individuell === custom}
          className={`${styles.package} ${pkg === p.id && individuell === custom ? styles.packageSelected : ''}`}
          onClick={() => choosePackage(p.id, custom)}
        >
          {p.highlight && <span className={styles.packageBadge}>Meistgewählt</span>}
          <span className={styles.packageName}>{p.name}</span>
          <span className={styles.packagePrice}>ab CHF {p.priceLabel}</span>
          <span className={styles.packageClaim}>{p.claim}</span>
          {/* TODO: Kurztexte "enthalten / nicht enthalten" gehören später als eigene
              Felder in src/config/business.ts; hier aus packageNote und extraPerSqm. */}
          <ul className={styles.packageFacts}>
            <li>Enthalten: Material, Montage und 8.1 % MwSt.</li>
            <li>Nicht enthalten: Platten über ca. 21 m² (CHF {p.extraPerSqm}.– pro m²)</li>
            <li>Referenzfläche: Bad ca. 6 m², ca. 21 m² Platten</li>
          </ul>
        </button>
      ))}
    </div>
  );

  return (
    <main className={styles.page}>
      <SEOHead
        title="Badplaner: Ihr Bad als persönliches Ideenbild | New Living Design"
        description="Paket wählen, Foto vom Bad machen, Ideenbild erhalten. Der Badplaner von New Living Design zeigt Ihr Bad mit neuen Platten, Farben und Armaturen. Kostenlos, unverbindlich, aus Zofingen."
        keywords="Badplaner, Bad planen online, Badumbau Ideen, Badezimmer Visualisierung, Bad Ideenbild, Badumbau Zofingen, Badplaner kostenlos"
        url="/badplaner"
        type="website"
        structuredData={structuredData}
        image={`${business.siteUrl}${photoUrl('bad-travertin-gold-01.webp')}`}
      />

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <div className={styles.heroOverlay} />
          <img src={photoUrl('bad-travertin-gold-01.webp')} alt="Bad von New Living Design mit Platten in Travertin-Optik" className={styles.heroImage} fetchPriority="high" />
        </div>
        <div className={`${styles.heroContent} ${isVisible ? styles.visible : ''}`}>
          <p className={styles.eyebrow}>Neu · Badplaner</p>
          <h1 className={styles.heroTitle}>Ihr Bad als persönliches Ideenbild</h1>
          <p className={styles.heroText}>Paket wählen, Foto vom Bad machen, Ideenbild erhalten. Kostenlos, unverbindlich, aus Zofingen.</p>
          <div className={styles.heroActions}>
            <a href="#planer" className={styles.ctaPrimary}>Jetzt starten</a>
            <a href="#ablauf" className={styles.ctaSecondary}>So funktioniert's</a>
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
              {renderStepHead(1, 'Paket wählen', packageLabel || undefined)}
              {step === 1 && (
                <div id="schritt-1-inhalt" className={styles.stepBody}>
                  {renderPackageCards(false)}
                  <div className={styles.packagesFull}>
                    <button
                      type="button"
                      className={`${styles.package} ${styles.packageCustom} ${individuell ? styles.packageSelected : ''}`}
                      aria-pressed={individuell}
                      onClick={chooseIndividual}
                    >
                      <span className={styles.packageName}>{individualPackage.name}</span>
                      <span className={styles.packageClaim}>{individualPackage.claim}</span>
                    </button>
                  </div>
                  {individuell && (
                    <div className={styles.subQuestion}>
                      <h3>{individualPackage.question}</h3>
                      <p className={styles.hint}>Das gewählte Paket ist die Grundlage für das Ideenbild und für die Auswahl der Materialien.</p>
                      {renderPackageCards(true)}
                    </div>
                  )}
                  <p className={styles.hint}>
                    Richtpreise inkl. Material, Montage und MwSt. Details zu den Paketen auf der Seite <Link to="/badumbau-zofingen#pakete">Badumbau</Link>.
                  </p>
                </div>
              )}
            </article>

            {/* Schritt 2: Ausstattung (Basis + Details) */}
            <article id="schritt-2" className={stepClass(2)} ref={(el) => { stepRefs.current[2] = el; }}>
              {renderStepHead(
                2,
                'Ausstattung wählen',
                chosen?.tile ? `${isAtelier && chosen.look ? `${chosen.look.label} · ` : ''}${chosen.tile.label} · ${chosen.base?.label ?? ''}` : 'Platten, Möbel, Armaturen',
              )}
              {step === 2 && options && sel && chosen && (
                <div id="schritt-2-inhalt" className={styles.stepBody}>
                  <h3 className={styles.blockTitle}>Basis</h3>

                  {isAtelier ? (
                    <>
                      <fieldset className={styles.group}>
                        <legend>Look <span className={styles.groupMeta}>· die Stimmung im Raum</span></legend>
                        <CardPicker
                          name="look"
                          large
                          value={sel.look}
                          onChange={chooseLook}
                          items={options.looks.map((l) => ({ id: l.id, label: l.label, image: l.image, meta: l.description }))}
                        />
                      </fieldset>
                      <fieldset className={styles.group}>
                        <legend>
                          Material <span className={styles.groupMeta}>· im Look {chosen.look?.label ?? ''}</span>
                        </legend>
                        {tileGroups.map((g) => (
                          <SwatchGroup
                            key={`${sel.look}:${g.key}`}
                            name="platte"
                            title={g.key}
                            meta={g.items[0].supplier}
                            value={sel.tile}
                            onChange={(id) => choose('tile', id)}
                            items={g.items.map((t) => ({ id: t.id, label: t.color, image: t.image, meta: 'Grossformat' }))}
                            note={g.items.find((t) => t.note)?.note}
                          />
                        ))}
                        <p className={styles.hint}>{TILE_HINT}</p>
                      </fieldset>
                    </>
                  ) : (
                    <>
                      {options.formats.length > 1 && (
                        <fieldset className={styles.group}>
                          <legend>Plattenformat</legend>
                          <ChipPicker
                            name="format"
                            value={sel.format}
                            onChange={(id) => choose('format', id)}
                            items={options.formats.map((f) => ({ id: f, label: `${f.replace('x', '×')} cm` }))}
                          />
                        </fieldset>
                      )}
                      <fieldset className={styles.group}>
                        <legend>Platten <span className={styles.groupMeta}>· Serie und Farbe</span></legend>
                        {tileGroups.map((g) => (
                          <SwatchGroup
                            key={g.key}
                            name="platte"
                            title={g.key}
                            meta={g.items[0].supplier}
                            value={sel.tile}
                            onChange={(id) => choose('tile', id)}
                            items={g.items.map((t) => ({ id: t.id, label: t.color, image: t.image }))}
                            note={g.items.find((t) => t.note)?.note}
                          />
                        ))}
                        <p className={styles.hint}>{TILE_HINT}</p>
                      </fieldset>
                    </>
                  )}

                  {baseGroups.length > 0 && (
                    <fieldset className={styles.group}>
                      <legend>Unterbau <span className={styles.groupMeta}>· {options.bases[0]?.supplier}</span></legend>
                      {baseGroups.map((g) => (
                        <SwatchGroup
                          key={g.key}
                          name="unterbau"
                          title={g.key}
                          value={sel.base}
                          onChange={(id) => choose('base', id)}
                          items={g.items.map((b) => ({ id: b.id, label: b.label, image: b.image, hex: b.hex }))}
                        />
                      ))}
                    </fieldset>
                  )}

                  {options.showers.length > 1 ? (
                    <fieldset className={styles.group}>
                      <legend>Dusche oder Badewanne</legend>
                      <ChoicePicker
                        name="dusche"
                        value={sel.shower}
                        onChange={(id) => choose('shower', id)}
                        items={options.showers.map((o) => ({ id: o.id, label: o.label }))}
                      />
                    </fieldset>
                  ) : (
                    chosen.shower && <p className={styles.hint}>Dusche: {chosen.shower.label}. In diesem Paket ohne weitere Auswahl.</p>
                  )}

                  {options.walls.length > 1 && (
                    <fieldset className={styles.group}>
                      <legend>Wandhöhe <span className={styles.groupMeta}>· wie hoch werden die Platten?</span></legend>
                      <ChoicePicker
                        name="wall"
                        value={sel.wall}
                        onChange={(id) => choose('wall', id)}
                        items={options.walls.map((o) => ({ id: o.id, label: o.label }))}
                      />
                    </fieldset>
                  )}

                  {/* Zweite Ebene: alles Weitere. Alles ist vorbelegt, nichts ist Pflicht. */}
                  <details className={styles.detailsDisclosure}>
                    <summary className={styles.detailsSummary}>
                      <span>
                        <span className={styles.detailsTitle}>Details verfeinern</span>
                        <span className={styles.detailsHint}>Optional · alles ist sinnvoll vorbelegt</span>
                      </span>
                      <span className={styles.detailsAction} aria-hidden="true" />
                    </summary>
                    <div className={styles.detailsBody}>
                  {isAtelier && (
                    <>
                      <fieldset className={styles.group}>
                        <legend>Materialbild <span className={styles.groupMeta}>· einheitlich oder mit Akzent</span></legend>
                        <ChoicePicker
                          name="kombination"
                          value={sel.accentMode}
                          onChange={(id) => choose('accentMode', id)}
                          items={options.accentModes.map((a) => ({
                            id: a.id,
                            label: a.label,
                            meta: a.id === 'einheitlich' ? 'Ein Material im ganzen Raum' : 'Eine Akzentfläche in einem zweiten Material',
                          }))}
                        />
                      </fieldset>
                      {sel.accentMode === 'kombination' && (
                        <>
                          <fieldset className={styles.group}>
                            <legend>Akzentfläche</legend>
                            <ChoicePicker
                              name="akzentflaeche"
                              value={sel.accentPlacement}
                              onChange={(id) => choosePlacement(id as AccentPlacementId)}
                              items={options.accentPlacements.map((a) => ({ id: a.id, label: a.label }))}
                            />
                          </fieldset>
                          {accentGroups.length > 0 && (
                            <fieldset className={styles.group}>
                              <legend>Akzentmaterial</legend>
                              {accentGroups.map((g) => (
                                <SwatchGroup
                                  key={g.key}
                                  name="akzent"
                                  title={g.key}
                                  value={sel.accent}
                                  onChange={(id) => choose('accent', id)}
                                  items={g.items.map((a) => ({ id: a.id, label: a.label, image: a.image }))}
                                  note={g.items.find((a) => a.note)?.note}
                                />
                              ))}
                            </fieldset>
                          )}
                        </>
                      )}
                    </>
                  )}

                  {topGroups.length > 0 && (
                    <fieldset className={styles.group}>
                      <legend>Waschtischplatte <span className={styles.groupMeta}>· {options.tops[0]?.supplier}</span></legend>
                      {topGroups.map((g) => (
                        <SwatchGroup
                          key={g.key}
                          name="top"
                          title={g.key}
                          value={sel.top}
                          onChange={(id) => choose('top', id)}
                          items={g.items.map((t) => ({ id: t.id, label: t.color, image: t.image }))}
                        />
                      ))}
                    </fieldset>
                  )}

                  {options.basinTypes.length > 1 && (
                    <fieldset className={styles.group}>
                      <legend>Waschbeckenart <span className={styles.groupMeta}>· wie sitzt das Becken auf der Platte?</span></legend>
                      <CardPicker
                        name="becken"
                        diagram
                        value={sel.basinType}
                        onChange={(id) => choose('basinType', id)}
                        items={options.basinTypes.map((b) => ({
                          id: b.id,
                          label: b.label,
                          image: b.image,
                          meta: [b.supplier, b.example].filter(Boolean).join(' · '),
                        }))}
                      />
                    </fieldset>
                  )}

                  <fieldset className={styles.group}>
                    <legend>Boden</legend>
                    <label className={styles.checkbox} htmlFor="boden-anders">
                      <input
                        type="checkbox"
                        id="boden-anders"
                        checked={sel.floorDifferent}
                        onChange={(e) => choose('floorDifferent', e.target.checked)}
                      />
                      <span>Boden anders wählen</span>
                    </label>
                    <p className={styles.hint}>Standard: Boden und Wand mit derselben Platte.</p>
                    {sel.floorDifferent && (
                      <div className={styles.subGroup}>
                        {tileGroups.map((g) => (
                          <SwatchGroup
                            key={g.key}
                            name="boden"
                            title={g.key}
                            meta={g.items[0].supplier}
                            value={sel.floor}
                            onChange={(id) => choose('floor', id)}
                            items={g.items.map((t) => ({ id: t.id, label: t.color, image: t.image }))}
                          />
                        ))}
                      </div>
                    )}
                  </fieldset>

                  {pkg === 'colore' && options.tapSeriesOptions.length > 1 && (
                    <fieldset className={styles.group}>
                      <legend>Armaturenserie <span className={styles.groupMeta}>· Chrom</span></legend>
                      <CardPicker
                        name="armaturenserie"
                        value={sel.tapSeries}
                        onChange={(id) => choose('tapSeries', id)}
                        items={options.tapSeriesOptions.map((t) => ({ id: t.id, label: t.label, image: t.image, meta: t.shape }))}
                      />
                      {options.tapSeriesOptions[0]?.note && <p className={styles.hint}>{options.tapSeriesOptions[0].note}</p>}
                    </fieldset>
                  )}
                  {isAtelier && options.finishes.length > 1 && (
                    <fieldset className={styles.group}>
                      <legend>Armaturen-Oberfläche <span className={styles.groupMeta}>· {options.tapSeries}</span></legend>
                      <ChipPicker
                        name="finish"
                        value={sel.finish}
                        onChange={(id) => choose('finish', id)}
                        items={options.finishes.map((f) => ({ id: f.id, label: f.label, image: f.image }))}
                      />
                    </fieldset>
                  )}
                  {pkg === 'essenza' && <p className={styles.hint}>Armaturen: {options.tapSeries}. Im Paket enthalten, keine Auswahl nötig.</p>}

                  {options.sanitary.length > 1 ? (
                    <fieldset className={styles.group}>
                      <legend>Keramikfarbe <span className={styles.groupMeta}>· WC und Waschtisch</span></legend>
                      <ChipPicker
                        name="keramik"
                        value={sel.sanitary}
                        onChange={(id) => choose('sanitary', id)}
                        items={options.sanitary.map((s) => ({ id: s.id, label: s.label, image: s.image, hex: s.hex }))}
                      />
                    </fieldset>
                  ) : (
                    chosen.sanitary && <p className={styles.hint}>Keramik: {chosen.sanitary.label}. In diesem Paket ohne weitere Auswahl.</p>
                  )}

                  {options.basins.length > 1 && (
                    <fieldset className={styles.group}>
                      <legend>Waschtisch <span className={styles.groupMeta}>· einzeln oder doppelt</span></legend>
                      <ChoicePicker
                        name="waschtisch"
                        value={sel.basin}
                        onChange={(id) => choose('basin', id)}
                        items={options.basins.map((o) => ({ id: o.id, label: o.label }))}
                      />
                    </fieldset>
                  )}

                  {options.mirrors.length > 1 && (
                    <fieldset className={styles.group}>
                      <legend>Spiegel</legend>
                      <ChoicePicker
                        name="spiegel"
                        value={sel.mirror}
                        onChange={(id) => choose('mirror', id)}
                        items={options.mirrors.map((o) => ({ id: o.id, label: o.label }))}
                      />
                    </fieldset>
                  )}
                    </div>
                  </details>

                  <div className={styles.stepActions}>
                    <button type="button" className={styles.ctaDark} onClick={() => goTo(3)}>Weiter zum Foto</button>
                  </div>
                </div>
              )}
            </article>

            {/* Schritt 3: Foto */}
            <article id="schritt-3" className={stepClass(3)} ref={(el) => { stepRefs.current[3] = el; }}>
              {renderStepHead(3, 'Foto vom Bad', photo ? 'Foto bereit' : 'Aufnehmen oder aus der Galerie wählen')}
              {step === 3 && (
                <div id="schritt-3-inhalt" className={styles.stepBody}>
                  {photo ? (
                    <img src={photo.dataUrl} alt="Ihr Foto" className={styles.preview} />
                  ) : (
                    <div className={styles.upload}>
                      <p className={styles.uploadTitle}>
                        {photoBusy ? 'Foto wird vorbereitet…' : 'Foto aufnehmen oder aus der Galerie wählen'}
                      </p>
                      <div className={styles.uploadActions}>
                        <span className={styles.uploadAction}>
                          <input
                            type="file"
                            id="bp-foto-kamera"
                            className={styles.fileInput}
                            accept="image/*"
                            capture="environment"
                            onChange={onPhoto}
                            disabled={photoBusy}
                          />
                          <label className={styles.ctaDark} htmlFor="bp-foto-kamera">Foto aufnehmen</label>
                        </span>
                        <span className={styles.uploadAction}>
                          <input
                            type="file"
                            id="bp-foto-galerie"
                            className={styles.fileInput}
                            accept="image/*"
                            onChange={onPhoto}
                            disabled={photoBusy}
                          />
                          <label className={styles.ctaLight} htmlFor="bp-foto-galerie">Aus der Galerie wählen</label>
                        </span>
                      </div>
                      <span className={styles.hint}>
                        Jetzt neu aufnehmen oder ein Foto nehmen, das Sie schon haben. Am besten von der Tür aus, das ganze Bad im Bild, Licht an.
                      </span>
                    </div>
                  )}
                  {photoError && <p className={styles.error}>{photoError}</p>}
                  {photo && (
                    <>
                      <p className={styles.hint}>Am besten von der Tür aus, das ganze Bad im Bild, Licht an. Das Foto wurde auf {photo.width}×{photo.height} Pixel verkleinert.</p>
                      <fieldset className={styles.group}>
                        <legend>Wie viele Fenster sind auf dem Foto? <span className={styles.groupMeta}>· Dachfenster zählen mit</span></legend>
                        <ChipPicker name="windows" items={WINDOW_OPTIONS} value={windows} onChange={setWindows} />
                        <p className={styles.hint}>Damit das Ideenbild kein Fenster dazuerfindet: Fenster, Türen und Wände bleiben, wie sie sind.</p>
                      </fieldset>
                      <div className={styles.stepActions}>
                        <button type="button" className={styles.ctaDark} onClick={() => goTo(4)} disabled={!windows}>Weiter zu Kontakt</button>
                        {!windows && <span className={styles.hint}>Bitte die Fenster angeben.</span>}
                      </div>
                      <div className={`${styles.uploadActions} ${styles.changePhoto}`}>
                        <span className={styles.uploadAction}>
                          <input
                            type="file"
                            id="bp-foto-kamera-neu"
                            className={styles.fileInput}
                            accept="image/*"
                            capture="environment"
                            onChange={onPhoto}
                            disabled={photoBusy}
                          />
                          <label className={styles.ctaLight} htmlFor="bp-foto-kamera-neu">Neues Foto aufnehmen</label>
                        </span>
                        <span className={styles.uploadAction}>
                          <input
                            type="file"
                            id="bp-foto-galerie-neu"
                            className={styles.fileInput}
                            accept="image/*"
                            onChange={onPhoto}
                            disabled={photoBusy}
                          />
                          <label className={styles.ctaLight} htmlFor="bp-foto-galerie-neu">Anderes Foto aus der Galerie</label>
                        </span>
                      </div>
                      {photoBusy && <p className={styles.hint}>Foto wird vorbereitet…</p>}
                    </>
                  )}
                </div>
              )}
            </article>

            {/* Schritt 4: Kontakt + Ideenbild */}
            <article id="schritt-4" className={stepClass(4)} ref={(el) => { stepRefs.current[4] = el; }}>
              {renderStepHead(4, 'Kontakt und Ideenbild', result ? 'Ideenbild erstellt' : 'Name, E-Mail und Telefon, dann Bild erstellen')}
              {step === 4 && (
                <form id="schritt-4-inhalt" className={styles.stepBody} onSubmit={submitRender}>
                  {summaryRows.length > 0 && (
                    <div className={styles.summaryBox}>
                      <h3 className={styles.blockTitle}>Ihre Auswahl</h3>
                      <ul className={`${styles.summary} ${styles.summaryLight}`}>
                        {summaryRows.map((row) => (
                          <li key={row.label}><span>{row.label}</span><span>{row.value}</span></li>
                        ))}
                      </ul>
                      <button type="button" className={styles.linkButton} onClick={() => goTo(2)}>Auswahl ändern</button>
                    </div>
                  )}
                  <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className={styles.honeypot} aria-hidden="true" />
                  <div className={styles.formRow}>
                    <label className={styles.field} htmlFor="bp-name">
                      <span>Vorname und Name</span>
                      <input type="text" id="bp-name" name="name" required autoComplete="name" placeholder="Vorname und Name" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} />
                    </label>
                    <label className={styles.field} htmlFor="bp-email">
                      <span>E-Mail</span>
                      <input type="email" id="bp-email" name="email" required autoComplete="email" placeholder="name@beispiel.ch" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} />
                    </label>
                  </div>
                  <div className={styles.formRow}>
                    <label className={styles.field} htmlFor="bp-phone">
                      <span>Telefon oder WhatsApp</span>
                      <input type="tel" id="bp-phone" name="telefon" required autoComplete="tel" placeholder="+41 ..." value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} />
                    </label>
                  </div>
                  <label className={styles.consent} htmlFor="bp-consent">
                    <input type="checkbox" id="bp-consent" name="consent" required checked={contact.consent} onChange={(e) => setContact({ ...contact, consent: e.target.checked })} />
                    <span>
                      Ich habe die <Link to="/datenschutz#badplaner" target="_blank" rel="noopener noreferrer">Datenschutzerklärung</Link> gelesen. Mein Foto wird zur
                      Erstellung des Ideenbilds an Google (Gemini API) übermittelt und uns per E-Mail zugestellt.
                    </span>
                  </label>
                  <label className={styles.consent} htmlFor="bp-newsletter">
                    <input type="checkbox" id="bp-newsletter" name="newsletter" checked={contact.newsletter} onChange={(e) => setContact({ ...contact, newsletter: e.target.checked })} />
                    <span>{NEWSLETTER_TEXT}</span>
                  </label>
                  <div className={styles.stepActions}>
                    <button type="submit" className={styles.ctaDark} disabled={status === 'sending' || !canOpenStep4}>
                      {status === 'sending' ? 'Wird erstellt…' : 'Ideenbild erstellen'}
                    </button>
                  </div>
                  {status === 'sending' && (
                    <div className={styles.progress} role="status" aria-live="polite">
                      <div className={styles.progressBar}><span /></div>
                      <p className={styles.progressText}>Wir gestalten Ihr Bad und prüfen das Bild. Das kann einen Moment dauern; bitte lassen Sie die Seite offen.</p>
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
      {result && pkgInfo && (
        <section id="ergebnis" className={`${styles.section} ${styles.dark}`}>
          <div className={styles.container}>
            <div className={styles.result} ref={resultRef}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionLabel}>Ihr Ideenbild</span>
                <h2 className={styles.sectionTitle}>So könnte Ihr Bad aussehen</h2>
              </div>
              <img src={result.dataUrl} alt={`Ideenbild Ihres Bads im Paket ${pkgInfo.name}`} className={styles.resultImage} />
              <span className={styles.badge}>Ideenbild, kein Plan</span>
              {result.delivery.customer !== 'accepted' && (
                <p className={styles.resultNote} role="status">
                  <strong>Hinweis:</strong> Ihre Anfrage wurde an uns weitergeleitet, aber Ihre E-Mail-Kopie konnte nicht bestätigt werden. Bitte speichern Sie das Ideenbild jetzt mit „Bild speichern“.
                </p>
              )}
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
                {summaryRows.map((row) => (
                  <li key={row.label}><span>{row.label}</span><span>{row.value}</span></li>
                ))}
              </ul>
              <div className={styles.resultActions}>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={styles.ctaPrimary} data-lead="badplaner-ergebnis">Per WhatsApp besprechen</a>
                <a href={result.dataUrl} download={`ideenbild-${pkgInfo.id}.${result.mime === 'image/jpeg' ? 'jpg' : 'png'}`} className={styles.ctaSecondary}>Bild speichern</a>
                <Link to="/kontakt" className={styles.ctaSecondary}>Termin in der Ausstellung</Link>
              </div>
              <p className={styles.resultNote}>
                Ihre Angaben wurden an uns weitergeleitet. Wir melden uns innerhalb eines Arbeitstages. Das Ideenbild zeigt eine Stimmung mit den gewählten Materialien;
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
                    <label className={styles.field} htmlFor="bp-plan-file">
                      <span>Grundriss (JPEG, PNG, WebP bis 20 MB; PDF bis 3 MB)</span>
                      <input type="file" id="bp-plan-file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={onPlanFile} />
                    </label>
                    <label className={styles.field} htmlFor="bp-plan-sqm">
                      <span>Bad-Grösse in m²</span>
                      <input type="number" id="bp-plan-sqm" inputMode="decimal" min="1" max="200" step="0.5" placeholder="z. B. 6.5" value={plan.sqm} onChange={(e) => setPlan({ ...plan, sqm: e.target.value })} />
                    </label>
                  </div>
                  <label className={styles.field} htmlFor="bp-plan-note">
                    <span>Bemerkung</span>
                    <textarea id="bp-plan-note" rows={3} placeholder="Alter des Bads, Wünsche, Zeitpunkt" value={plan.note} onChange={(e) => setPlan({ ...plan, note: e.target.value })} />
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
