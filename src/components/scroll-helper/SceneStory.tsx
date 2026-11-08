import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { SupplierImage } from '../../data/suppliers';

export type Scene = { id: string; label: string; title: string; text: string; image: SupplierImage; href: string; link: string; credit?: string };

/** Native scrolling; the unenhanced and reduced-motion version is a normal sequence. */
export default function SceneStory({ scenes, label }: { scenes: Scene[]; label: string }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = root.current;
    if (!element || !('IntersectionObserver' in window)) return;
    const desktopMotion = window.matchMedia('(min-width: 960px) and (prefers-reduced-motion: no-preference)');
    const steps = Array.from(element.querySelectorAll<HTMLElement>('[data-scene-step]'));
    const frames = Array.from(element.querySelectorAll<HTMLElement>('[data-scene-frame]'));
    let visible = false;
    let frame = 0;
    const paint = () => {
      frame = 0;
      if (!visible || !desktopMotion.matches) return;
      const middle = window.innerHeight * .56;
      // Read all positions before writing styles. Only the visible story runs.
      const positions = steps.map(step => step.getBoundingClientRect());
      let active = 0;
      positions.forEach((position, index) => { if (position.top <= middle) active = index; });
      const progress = Math.max(0, Math.min(1, (middle - positions[active].top) / positions[active].height));
      const blend = active < frames.length - 1 ? Math.max(0, (progress - .72) / .28) : 0;
      frames.forEach((item, index) => {
        item.style.opacity = String(index === active ? 1 : index === active + 1 ? blend : 0);
        item.style.transform = `scale(${index === active ? 1.045 - progress * .045 : 1.045})`;
      });
    };
    const schedule = () => { if (!frame && visible && desktopMotion.matches) frame = requestAnimationFrame(paint); };
    const configure = () => {
      if (desktopMotion.matches) element.dataset.enhanced = 'true';
      else { delete element.dataset.enhanced; frames.forEach(item => { item.style.opacity = ''; item.style.transform = ''; }); }
      schedule();
    };
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; schedule(); }, { rootMargin: '100px' });
    observer.observe(element);
    configure();
    desktopMotion.addEventListener('change', configure);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    return () => {
      observer.disconnect(); cancelAnimationFrame(frame); delete element.dataset.enhanced;
      desktopMotion.removeEventListener('change', configure);
      window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule);
    };
  }, [scenes]);
  return <div ref={root} className="nld-story" aria-label={label}>
    <div className="nld-story__stage" aria-hidden="true">
      {scenes.map(scene => <img key={scene.id} data-scene-frame {...scene.image} alt="" sizes="60vw" loading="lazy" decoding="async" />)}
    </div>
    <div className="nld-story__chapters">{scenes.map((scene, index) => <article key={scene.id} id={scene.id} className="nld-story__step" data-scene-step>
      <figure className="nld-story__mobile" data-reveal="image"><img {...scene.image} sizes="100vw" loading="lazy" decoding="async" /></figure>
      <div className="nld-story__copy" data-reveal="stagger">
        <p className="nld-eyebrow"><span aria-hidden="true">0{index + 1} / </span>{scene.label}</p>
        <h3>{scene.title}</h3><p>{scene.text}</p>
        <Link className="nld-link" to={scene.href}>{scene.link}<span aria-hidden="true"> →</span></Link>
        {scene.credit && <small>{scene.credit}</small>}
      </div>
    </article>)}</div>
  </div>;
}
