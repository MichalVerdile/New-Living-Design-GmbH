import React from 'react';
import { Link, useParams } from 'react-router-dom';
import SEOHead from '../../components/seo/SEOHead';
import { SupplierList } from '../../components/suppliers/SupplierDirectory';
import { areaById, areaHref, areas, groupSlug, imageOf, supplierByKey, type AreaId, type SupplierKey } from '../../data/suppliers';
import NotFound from '../not-found/NotFound';
import { generateBreadcrumbStructuredData } from '../../utils/structuredData';
import styles from './Catalog.module.css';

// Einstiegsbild je Bereich (Medienpaket, Originalformat 16:9).
const heroOf: Record<AreaId, SupplierKey> = { bad: 'edone', kuechen: 'febal', platten: 'lafabbrica', wellness: 'novellini' };

/** Bereichsseite: Fachgebiete mit ihren Marken, jede Marke führt zu ihren Serien. */
const CategoryPage: React.FC = () => {
  const { area: areaId = '' } = useParams();
  const area = areaById(areaId);
  if (!area) return <NotFound />;
  const hero = imageOf(heroOf[area.id]);
  return (
    <main id="main-content" className={styles.page}>
      <SEOHead
        title={`${area.title}: Beratung, Planung & Inspiration | New Living Design`}
        description={area.text}
        url={areaHref(area.id)}
        type="website"
        image={`https://newlivingdesign.ch${hero.src}`}
        structuredData={generateBreadcrumbStructuredData([{ name: 'Home', url: '/' }, { name: 'Inspiration', url: '/produkte' }, { name: area.title, url: areaHref(area.id) }])}
      />
      <div className={styles.container}>
        <nav aria-label="Brotkrumen" className={styles.crumbs}>
          <ol><li><Link to="/produkte">Inspiration</Link></li><li aria-current="page">{area.title}</li></ol>
        </nav>
        <header className={styles.intro}>
          <div data-reveal="stagger">
            <p className={styles.eyebrow}>{area.label}</p>
            <h1>{area.title}</h1>
            <p className={styles.lead}>{area.text}</p>
            <div className="nld-actions"><Link to="/kontakt" className="nld-button">Ihr Vorhaben besprechen</Link><Link to="/dienstleistungen" className="nld-link">Unsere Leistungen →</Link></div>
          </div>
          <figure data-reveal="image" className={styles.introFigure}>
            <img {...hero} sizes="(max-width: 900px) 100vw, 640px" {...{ fetchpriority: 'high' }} />
            <figcaption>Marke: <Link to={`${areaHref(area.id)}/${heroOf[area.id]}`}>{supplierByKey(heroOf[area.id]).name}</Link></figcaption>
          </figure>
        </header>
        <section className={styles.approach} aria-labelledby="approach-title">
          <div><p className={styles.eyebrow}>Mit New Living Design</p><h2 id="approach-title">Von Ihren Wünschen<br />zur passenden Lösung.</h2></div>
          <p>Wir klären zuerst Ihren Raum, die Nutzung und das Budget. Danach stimmen wir Materialien und Ausstattung aufeinander ab. Planung, Lieferung und Umsetzung vereinbaren wir passend zu Ihrem Projekt.</p>
        </section>
        <div className={styles.selectionIntro}><h2>Materialien und Marken zur Inspiration</h2><p>Diese Auswahl hilft beim ersten Orientieren. Was zu Ihrem Vorhaben passt und verfügbar ist, besprechen wir persönlich.</p></div>
        <nav aria-label="Fachgebiete" className={styles.groupIndex}>
          <ul>{area.groups.map((g) => <li key={g.title}><a href={`#${groupSlug(g.title)}`}>{g.title}<span>{g.brands.length}</span></a></li>)}</ul>
        </nav>
        {area.groups.map((g) => (
          <section key={g.title} id={groupSlug(g.title)} className={styles.group} aria-labelledby={`${groupSlug(g.title)}-title`}>
            <h2 id={`${groupSlug(g.title)}-title`}>{g.title}</h2>
            <SupplierList items={g.brands.map(supplierByKey)} area={area.id} />
          </section>
        ))}
        <aside className={styles.consultation}><h2>Was passt zu Ihrem Raum?</h2><p>Vergleichen Sie die Materialien und Produkte persönlich in unserer Ausstellung in Zofingen.</p><Link className="nld-button" to="/kontakt">{area.title}-Beratung anfragen ↗</Link></aside>
        <nav aria-label="Weitere Bereiche" className={styles.otherAreas}>
          <p>Weitere Bereiche</p>
          <ul>{areas.filter((a) => a.id !== area.id).map((a) => <li key={a.id}><Link to={areaHref(a.id)}>{a.title}</Link></li>)}</ul>
        </nav>
      </div>
    </main>
  );
};

export default CategoryPage;
