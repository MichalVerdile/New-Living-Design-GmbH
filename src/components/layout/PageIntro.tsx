import type { ReactNode } from 'react';
import type { SupplierImage } from '../../data/suppliers';

/** One page introduction for company, project and service pages. */
export default function PageIntro({ eyebrow, title, description, image, children }: {
  eyebrow: string; title: string; description: string; image?: SupplierImage; children?: ReactNode;
}) {
  return <section className={`nld-intro${image ? ' nld-intro--image' : ''}`}>
    <div className="nld-container nld-intro__inner">
      <div className="nld-intro__copy" data-reveal="stagger">
        <p className="nld-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="nld-lead">{description}</p>
        {children && <div className="nld-actions">{children}</div>}
      </div>
      {image && <figure className="nld-intro__image" data-reveal="image" data-parallax>
        <img {...image} sizes="(max-width: 900px) 100vw, 50vw" {...{ fetchpriority: 'high' }} />
      </figure>}
    </div>
  </section>;
}

export function ProjectInvitation({ title = 'Erzählen Sie uns von Ihrem Vorhaben.', children }: { title?: string; children?: ReactNode }) {
  return <section className="nld-invitation"><div className="nld-container" data-reveal="stagger">
    <p className="nld-eyebrow">Der erste Schritt ist ein Gespräch.</p><h2>{title}</h2>
    <p>Ein Foto, ein Grundriss oder eine erste Idee genügt. Gemeinsam klären wir, wie wir Sie unterstützen können.</p>
    <div className="nld-actions">{children}</div>
  </div></section>;
}
