import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { areas, suppliers, type AreaId, type Supplier } from '../../data/suppliers';
import styles from './SupplierDirectory.module.css';

type Filter = 'alle' | AreaId;

const filters: { id: Filter; title: string }[] = [
  { id: 'alle', title: 'Alle' },
  ...areas.map((a) => ({ id: a.id, title: a.title })),
];

const inFilter = (s: Supplier, f: Filter) => f === 'alle' || s.areas.some((a) => a.id === f);

const areaOrder = (s: Supplier) => areas.findIndex((a) => a.id === s.areas[0]?.id);
// Je Bereich zuerst die Marken mit Bildern, damit Bild- und Textkarten ruhige Gruppen bilden.
const ordered = [...suppliers].sort((a, b) => areaOrder(a) - areaOrder(b) || Number(b.images.length > 0) - Number(a.images.length > 0));

const countLabel = (n: number) => (n === 0 ? 'Ohne Bild' : n === 1 ? '1 Bild' : `${n} Bilder`);

const Gallery: React.FC<{ supplier: Supplier }> = ({ supplier }) => {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const n = supplier.images.length;
  // Blättert im Kreis: die Knöpfe werden nie deaktiviert, damit der Tastaturfokus nicht verloren geht.
  const step = (dir: number) => {
    const el = track.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollTo({ left: ((index + dir + n) % n) * el.clientWidth, behavior: reduce ? 'auto' : 'smooth' });
  };
  return (
    <div className={styles.gallery}>
      <div
        ref={track}
        className={styles.track}
        tabIndex={0}
        role="region"
        aria-label={`Bilder von ${supplier.name}, mit Pfeiltasten blättern`}
        onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        onKeyDown={(e) => {
          if (n > 1 && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) { e.preventDefault(); step(e.key === 'ArrowLeft' ? -1 : 1); }
        }}
      >
        {supplier.images.map((img) => (
          <figure key={img.src} className={styles.slide}>
            <img {...img} sizes="(max-width: 767px) calc(100vw - 2.5rem), 820px" loading="lazy" decoding="async" />
            <figcaption>{img.alt}</figcaption>
          </figure>
        ))}
      </div>
      {n > 1 && (
        <div className={styles.controls}>
          <button type="button" onClick={() => step(-1)} aria-label="Vorheriges Bild">←</button>
          <span aria-live="polite">{index + 1} / {n}</span>
          <button type="button" onClick={() => step(1)} aria-label="Nächstes Bild">→</button>
        </div>
      )}
    </div>
  );
};

const Visual: React.FC<{ supplier: Supplier }> = ({ supplier }) => {
  const [first, ...rest] = supplier.images;
  if (!first) {
    return (
      <span className={styles.typeVisual}>
        <span className={styles.typeName}>{supplier.name}</span>
        <span className={styles.typeSpecs}>{supplier.areas.flatMap((a) => a.specialties).join(' · ')}</span>
      </span>
    );
  }
  return (
    <span className={styles.visual}>
      {rest.slice(0, 2).reverse().map((img) => (
        <img key={img.src} src={img.src} srcSet={img.srcSet} sizes="300px" width={img.width} height={img.height} alt="" className={styles.behind} loading="lazy" decoding="async" />
      ))}
      <img src={first.src} srcSet={first.srcSet} sizes="(max-width: 767px) 100vw, 600px" width={first.width} height={first.height} alt="" className={styles.front} loading="lazy" decoding="async" />
    </span>
  );
};

const SupplierCard: React.FC<{ supplier: Supplier; hidden: boolean }> = ({ supplier, hidden }) => {
  const details = useRef<HTMLDetailsElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const close = () => {
    const el = details.current;
    if (!el) return;
    el.open = false;
    el.querySelector('summary')?.focus();
  };
  const n = supplier.images.length;
  const variant = n > 1 ? styles.stack : n === 1 ? styles.single : styles.text;
  return (
    <details
      ref={details}
      id={supplier.id}
      name="marken"
      className={`${styles.card} ${variant}`}
      hidden={hidden}
      // Die Karte wird beim Öffnen zum Panel: Fokus auf dessen Titel, damit er nicht verloren geht.
      onToggle={() => { if (details.current?.open) heading.current?.focus(); }}
      onKeyDown={(e) => { if (e.key === 'Escape' && details.current?.open) { e.preventDefault(); close(); } }}
    >
      <summary className={styles.summary} aria-label={`${supplier.name}, ${countLabel(n)}, Details öffnen`}>
        <Visual supplier={supplier} />
        <span className={styles.caption}>
          <span className={styles.name}>{supplier.name}</span>
          <span className={styles.meta}>
            {supplier.areas.map((a) => a.title).join(' · ')}
            <span className={styles.count}>{countLabel(n)}</span>
          </span>
        </span>
      </summary>
      <div className={styles.panel}>
        <div className={styles.info}>
          <h3 ref={heading} tabIndex={-1}>{supplier.name}</h3>
          <dl>
            {supplier.areas.map((a) => (
              <div key={a.id}><dt>{a.title}</dt><dd>{a.specialties.join(', ')}</dd></div>
            ))}
          </dl>
          <div className={styles.actions}>
            <a href={supplier.url} target="_blank" rel="noopener noreferrer">Offizielle Website<span className={styles.srOnly}> von {supplier.name} (öffnet in neuem Fenster)</span></a>
            <Link to="/kontakt">Beratung anfragen</Link>
            <button type="button" onClick={close}>Schliessen</button>
          </div>
        </div>
        {n ? <Gallery supplier={supplier} /> : (
          <div className={styles.empty}>
            <p>Für diese Marke liegen noch keine freigegebenen Bilder vor.</p>
            <p>Welche Serien verfügbar oder in Zofingen zu sehen sind, klären wir persönlich mit Ihnen.</p>
          </div>
        )}
      </div>
    </details>
  );
};

/** Markenverzeichnis mit Bereichsfilter; jede Marke öffnet inline ihre Bilder und Angaben. */
const SupplierDirectory: React.FC = () => {
  const [filter, setFilter] = useState<Filter>('alle');
  const { hash } = useLocation();

  // Sprungmarken: #bad usw. setzen den Filter, #marke-… öffnet die Marke.
  useEffect(() => {
    let id = '';
    try { id = decodeURIComponent(hash.slice(1)); } catch { return; }
    if (filters.some((f) => f.id === id)) setFilter(id as Filter);
    const el = id ? document.getElementById(id) : null;
    if (el instanceof HTMLDetailsElement) {
      setFilter('alle');
      el.open = true;
    }
  }, [hash]);

  const visible = suppliers.filter((s) => inFilter(s, filter)).length;
  return (
    <div className={styles.directory}>
      <div className={styles.filterBar} role="group" aria-label="Marken nach Bereich filtern">
        {filters.map((f) => (
          <button key={f.id} id={f.id === 'alle' ? undefined : f.id} type="button" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.title}<span>{suppliers.filter((s) => inFilter(s, f.id)).length}</span>
          </button>
        ))}
        <p className={styles.status} aria-live="polite">{visible} Marken</p>
      </div>
      <div className={styles.grid}>
        {ordered.map((s) => <SupplierCard key={s.key} supplier={s} hidden={!inFilter(s, filter)} />)}
      </div>
    </div>
  );
};

export default SupplierDirectory;
