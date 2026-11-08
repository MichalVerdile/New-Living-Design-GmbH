import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './ImageLightbox.module.css';

type Image = { src: string; alt: string; width?: number; height?: number };
type Props = { images: Image[]; initialIndex: number; label: string; onClose: () => void };

/** Native modal provides focus containment, Escape and an inert background. */
export default function ImageLightbox({ images, initialIndex, label, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const [index, setIndex] = useState(Math.min(initialIndex, images.length - 1));
  const [zoom, setZoom] = useState(false);
  const [failed, setFailed] = useState(false);
  const move = (direction: number) => { setIndex(i => (i + direction + images.length) % images.length); setZoom(false); setFailed(false); };
  useEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    element?.showModal();
    document.body.style.overflow = 'hidden';
    return () => { element?.close(); document.body.style.overflow = overflow; if (previous?.isConnected) previous.focus({ preventScroll: true }); };
  }, []);
  if (!images[index]) return null;
  return (
    <dialog ref={dialog} className={styles.dialog} aria-label={label}
      onCancel={e => { e.preventDefault(); onClose(); }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      onKeyDown={e => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); move(e.key === 'ArrowRight' ? 1 : -1); }
      }}>
      <div className={styles.toolbar}>
        <span>{label}</span>
        <button type="button" onClick={() => setZoom(v => !v)} aria-pressed={zoom}>{zoom ? 'Gesamtbild' : 'Vergrössern'}</button>
        <button type="button" onClick={onClose} aria-label="Galerie schliessen" autoFocus>Schliessen ×</button>
      </div>
      <div className={`${styles.viewport} ${zoom ? styles.zoomed : ''}`}
        onTouchStart={e => { touch.current = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY }; }}
        onTouchEnd={e => {
          if (!touch.current || zoom) return;
          const dx = e.changedTouches[0].clientX - touch.current.x;
          const dy = e.changedTouches[0].clientY - touch.current.y;
          if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) move(dx < 0 ? 1 : -1);
          touch.current = null;
        }}>
        {failed ? <p role="alert">Das Bild konnte nicht geladen werden. <button type="button" onClick={() => setFailed(false)}>Erneut laden</button></p>
          : <img key={images[index].src} src={images[index].src} alt={images[index].alt} onError={() => setFailed(true)} />}
      </div>
      <div className={styles.caption}>
        <p>{images[index].alt}</p>
        <div className={styles.controls}>
          {images.length > 1 && <button type="button" onClick={() => move(-1)} aria-label="Vorheriges Bild">←</button>}
          <span role="status" aria-live="polite">{index + 1} / {images.length}</span>
          {images.length > 1 && <button type="button" onClick={() => move(1)} aria-label="Nächstes Bild">→</button>}
        </div>
        <Link to="/kontakt" onClick={onClose}>Zu diesem Raum beraten lassen ↗</Link>
      </div>
    </dialog>
  );
}
