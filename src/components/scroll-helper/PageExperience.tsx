import { useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

/** All content is visible without animation. Only on-screen media receives scroll work. */
export default function PageExperience({ children }: { children: ReactNode }) {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktop = window.matchMedia('(min-width: 960px)');
    const animations = new Set<Animation>();
    const registered = new WeakSet<Element>();
    const visibleMedia = new Set<HTMLElement>();
    const registeredMedia = new WeakSet<Element>();
    let frame = 0;
    const animate = (element: Element, keyframes: Keyframe[], duration: number, delay = 0) => {
      if (!element.animate) return;
      const animation = element.animate(keyframes, { duration, delay, easing: 'cubic-bezier(.2,.7,.2,1)' });
      animations.add(animation);
      animation.onfinish = () => animations.delete(animation);
    };
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        if (motion.matches) continue;
        const mode = entry.target.getAttribute('data-reveal');
        if (mode === 'stagger') {
          Array.from(entry.target.children).forEach((child, index) => animate(child,
            [{ opacity: .25, transform: 'translateY(26px)' }, { opacity: 1, transform: 'none' }], 850, Math.min(index, 3) * 85));
        } else if (mode === 'image') {
          animate(entry.target, [{ clipPath: 'inset(7% 0 7% 0)', opacity: .5 }, { clipPath: 'inset(0)', opacity: 1 }], 1000);
        } else {
          animate(entry.target, [{ opacity: .3, transform: 'translateY(22px)' }, { opacity: 1, transform: 'none' }], 750);
        }
      }
    }, { threshold: .08 });
    const paint = () => {
      frame = 0;
      if (motion.matches || !desktop.matches) return;
      const positions = Array.from(visibleMedia).map(element => ({ element, rect: element.getBoundingClientRect() }));
      positions.forEach(({ element, rect }) => {
        const progress = Math.max(-1, Math.min(1, (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight));
        element.style.setProperty('--nld-pan', `${progress * 16}px`);
      });
    };
    const schedule = () => { if (!frame && visibleMedia.size && !motion.matches && desktop.matches) frame = requestAnimationFrame(paint); };
    const mediaObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) visibleMedia.add(entry.target as HTMLElement); else visibleMedia.delete(entry.target as HTMLElement); });
      schedule();
    });
    const register = () => {
      document.querySelectorAll('main [data-reveal], main h1, main h2').forEach(element => {
        if (registered.has(element) || element.parentElement?.closest('[data-reveal]')) return;
        registered.add(element); observer.observe(element);
      });
      document.querySelectorAll<HTMLElement>('main [data-parallax]').forEach(element => {
        if (registeredMedia.has(element)) return;
        registeredMedia.add(element); mediaObserver.observe(element);
      });
    };
    register();
    if (!motion.matches) document.querySelectorAll('[data-hero-motion] > img').forEach(image => {
      animate(image, [{ transform: 'scale(1.12)' }, { transform: 'scale(1.045)' }], 1800);
    });
    // Newly shown projects and planner panels use the same motion without hiding content.
    const changes = new MutationObserver(register);
    const main = document.querySelector('main');
    if (main) changes.observe(main, { childList: true, subtree: true });
    const stop = () => {
      animations.forEach(animation => animation.cancel()); animations.clear(); cancelAnimationFrame(frame); frame = 0;
      document.querySelectorAll<HTMLElement>('[data-parallax]').forEach(element => element.style.removeProperty('--nld-pan'));
      schedule();
    };
    motion.addEventListener('change', stop); desktop.addEventListener('change', stop);
    window.addEventListener('scroll', schedule, { passive: true }); window.addEventListener('resize', schedule, { passive: true });
    return () => {
      observer.disconnect(); mediaObserver.disconnect(); changes.disconnect(); visibleMedia.clear(); stop();
      motion.removeEventListener('change', stop); desktop.removeEventListener('change', stop);
      window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule);
    };
  }, [pathname]);
  useEffect(() => {
    if (hash) {
      try {
        const target = document.getElementById(decodeURIComponent(hash.slice(1)));
        let disclosure = target?.closest('details');
        while (disclosure) { disclosure.open = true; disclosure = disclosure.parentElement?.closest('details') ?? null; }
        target?.scrollIntoView({ block: 'start', behavior: 'instant' });
      }
      catch { /* Invalid fragments do not block the page. */ }
    }
  }, [pathname, hash]);
  return children;
}
