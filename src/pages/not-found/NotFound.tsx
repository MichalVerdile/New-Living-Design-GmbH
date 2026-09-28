import React from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '../../components';
import styles from '../blog/BlogPost.module.css';

/** Seite für unbekannte Adressen. Vercel liefert sie als dist/404.html mit Status 404. */
const NotFound: React.FC = () => (
  <main id="main-content" className={styles.page}>
    <SEOHead title="Seite nicht gefunden | New Living Design" description="Diese Seite gibt es nicht (mehr)." noindex />
    <section className={styles.hero}>
      <div className={styles.heroInner}>
        <h1 className={styles.title}>Diese Seite gibt es nicht</h1>
        <p className={styles.lede}>Vielleicht ist der Link veraltet. Unser Angebot finden Sie auf der Startseite.</p>
        <Link to="/" className={styles.ctaPrimary}>Zur Startseite</Link>
      </div>
    </section>
  </main>
);

export default NotFound;
