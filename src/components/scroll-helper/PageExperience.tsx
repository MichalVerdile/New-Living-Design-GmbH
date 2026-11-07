import { useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

/** Visible before JS; an interrupted animation never leaves content hidden. */
export default function PageExperience({ children }: { children: ReactNode }) {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const animations = new Set<Animation>();
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        if (motion.matches || !entry.target.animate) continue;
        const image = entry.target.getAttribute('data-reveal') === 'image';
        const animation = entry.target.animate(image
          ? [{ clipPath: 'inset(5% 0 5% 0)', opacity: .6, transform: 'translateY(16px)' }, { clipPath: 'inset(0)', opacity: 1, transform: 'none' }]
          : [{ opacity: .35, transform: 'translateY(20px)' }, { opacity: 1, transform: 'none' }],
        { duration: image ? 850 : 650, easing: 'cubic-bezier(.2,.7,.2,1)' });
        animations.add(animation);
        animation.onfinish = () => animations.delete(animation);
      }
    }, { threshold: .08 });
    document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
    const stop = () => { animations.forEach(a => a.cancel()); animations.clear(); };
    motion.addEventListener('change', stop);
    return () => { observer.disconnect(); motion.removeEventListener('change', stop); stop(); };
  }, [pathname]);
  useEffect(() => {
    // Executed after lazy content commits: preserve direct links into every page.
    if (hash) {
      try { document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ block: 'start', behavior: 'instant' }); }
      catch { /* malformed URLs remain usable */ }
    }
  }, [pathname, hash]);
  return children;
}
