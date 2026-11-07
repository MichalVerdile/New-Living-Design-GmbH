import React, { useRef, useState } from 'react';
import type { SupplierImage } from '../../data/suppliers';
import ImageLightbox from '../gallery/ImageLightbox';
import styles from './Gallery.module.css';

/**
 * Bildergalerie einer Serie: Wischen, Pfeile, Pfeiltasten, Zähler; ohne sichtbare Scrollleiste.
 * Bilder vollständig (contain), nie beschnitten.
 */
const Gallery: React.FC<{ images: SupplierImage[]; label: string; eager?: boolean }> = ({ images, label, eager }) => {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [expanded, setExpanded] = useState<number | null>(null);
  const n = images.length;
  // Blättert im Kreis: die Knöpfe werden nie deaktiviert, damit der Tastaturfokus nicht verloren geht.
  const step = (dir: number) => {
    const el = track.current;
    if (!el || !n) return;
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
        aria-label={n > 1 ? `${label}, ${n} Bilder, mit Pfeiltasten blättern` : label}
        onScroll={(e) => setIndex(Math.min(n - 1, Math.max(0, Math.round(e.currentTarget.scrollLeft / Math.max(1, e.currentTarget.clientWidth)))))}
        onKeyDown={(e) => {
          if (n > 1 && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) { e.preventDefault(); step(e.key === 'ArrowLeft' ? -1 : 1); }
        }}
      >
        {images.map((img, i) => (
          <figure key={img.src} className={styles.slide}>
            <button type="button" className={styles.open} tabIndex={i === index ? 0 : -1} onClick={() => setExpanded(i)} aria-label={`${label}: Bild ${i + 1} vergrössern`}>
            <img {...img} sizes="(max-width: 1280px) calc(100vw - 2.5rem), 1152px" loading={eager && i === 0 ? 'eager' : 'lazy'} decoding="async" />
            <span className={styles.expandHint} aria-hidden="true">Bild öffnen ↗</span></button>
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
      {expanded !== null && <ImageLightbox images={images} initialIndex={expanded} label={label} onClose={() => setExpanded(null)} />}
    </div>
  );
};

export default Gallery;
