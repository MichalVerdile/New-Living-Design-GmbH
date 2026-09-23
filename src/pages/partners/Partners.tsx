import React from "react";
import styles from "./Partners.module.css";
import heroImg from "../../assets/shutterstock_2580645597.webp";

import fimaLogo from "../../assets/logo.svg";
import lavastoneLogo from "../../assets/LAVASTONE.avif";
import dosemLogo from "../../assets/logo.png";
import laminamLogo from "../../assets/laminam.avif";
import naiciLogo from "../../assets/logoNaici-2024-450x144_2vy550ra.png";
import cavalliLogo from "../../assets/robertocavallihomeinteriors-logo.e54c5509.svg";
import lamborghiniLogo from "../../assets/cropped-lamborghini-logo-total-living-negative.png";
import { Helmet } from "react-helmet-async";

type Partner = {
  name: string;
  logo: string;
  url: string;
};

// Marken aus dem Quellenregister des NLD-Medienpakets vom 22.09.2026, nach Bereich und Fachgebiet.
// Nur Name, Fachgebiet und offizielle Website; Logos erst mit freigegebenen Vektordateien.
type Brand = { name: string; url: string };

const b = {
  rexa: { name: "Rexa Design", url: "https://rexadesign.it/" },
  edone: { name: "Edoné", url: "https://www.edonedesign.it/en" },
  archeda: { name: "Archeda", url: "https://www.archeda.eu/" },
  froidevaux: { name: "Froidevaux AG", url: "https://www.froidevaux.ch/de/" },
  pirovano: { name: "Pirovano Bagni", url: "https://pirovanobagni.it/" },
  treemme: { name: "Rubinetterie Treemme", url: "https://www.rubinetterie3m.it/it" },
  newform: { name: "Newform", url: "https://www.newform.it/it" },
  gessi: { name: "Gessi", url: "https://www.gessi.com/en/bath" },
  luce: { name: "Luce Rubinetterie", url: "https://www.lucerubinetterie.it/rubinetteria/" },
  cielo: { name: "Ceramica Cielo", url: "https://www.ceramicacielo.it/en" },
  scarabeo: { name: "Scarabeo Ceramiche", url: "https://scarabeoceramiche.it/collezioni/collezione-ceramica/" },
  galassia: { name: "Ceramica Galassia", url: "https://www.ceramicagalassia.it/catalogue" },
  azzurra: { name: "Azzurra Ceramica", url: "https://www.azzurraceramica.it/" },
  megius: { name: "Megius", url: "https://www.megius.com/" },
  novellini: { name: "Novellini", url: "https://novellini.com/" },
  vismaravetro: { name: "Vismaravetro", url: "https://www.vismaravetro.it/en/shower-enclosure-collections" },
  capannoli: { name: "Capannoli", url: "https://www.capannoli.it/" },
  antrax: { name: "Antrax IT", url: "https://www.antrax.com/" },
  cordivari: { name: "Cordivari Design", url: "https://www.cordivaridesign.it/it/" },
  caleido: { name: "Caleido", url: "https://www.caleido.it/" },
  febal: { name: "Febal Casa", url: "https://www.febalcasa.com/en/kind/kitchens/" },
  energieker: { name: "Energieker", url: "https://www.energieker.it/en/collections/" },
  emilgroup: { name: "Emilgroup", url: "https://www.emilgroup.it/EN/" },
  lafabbrica: { name: "La Fabbrica AVA", url: "https://www.lafabbrica.it/en/" },
  supergres: { name: "Supergres", url: "https://www.supergres.com/en/" },
  ariana: { name: "Ariana Ceramiche / Gardenia&Ariana", url: "https://www.gardenia.it/en/collections" },
  acquario: { name: "Acquario Due", url: "https://en.acquariodue.com/collezioni" },
  sicis: { name: "SICIS", url: "https://www.sicis.com/en/mosaic" },
  mosavit: { name: "Mosavit / Trip by Mosavit", url: "https://mosavit.com/en/" },
  skema: { name: "Skema", url: "https://skema.eu/en/collections/wooden-floors/" },
  deco: { name: "Déco", url: "https://www.decodecking.it/it/indoor/clap/" },
  zenon: { name: "Zenon Bath & SPC Surfaces", url: "https://zenonsurfaces.com/en/collections/Z_PD_FLOOR_PANELS_SPC_TEMPO/" },
  inkiostro: { name: "Inkiostro Bianco", url: "https://www.inkiostrobianco.com/en/" },
  albatros: { name: "Albatros Wellness", url: "https://albatroswellness.it/en/" },
} satisfies Record<string, Brand>;

type Area = {
  id: string;
  title: string;
  image: { src: string; width: number; height: number; alt: string };
  groups: { title: string; brands: Brand[] }[];
};

const areas: Area[] = [
  {
    id: "bad",
    title: "Bad",
    image: { src: "/images/bad/bad-designheizkoerper-antrax-pypeline-960w.webp", width: 960, height: 540, alt: "Antrax IT Pypeline Designheizkörper in einem schwarzen Badezimmer mit freistehender Badewanne" },
    groups: [
      { title: "Badmöbel", brands: [b.rexa, b.edone, b.archeda, b.froidevaux, b.pirovano] },
      { title: "Armaturen", brands: [b.treemme, b.newform, b.gessi, b.luce] },
      { title: "Sanitärkeramik", brands: [b.cielo, b.scarabeo, b.galassia, b.azzurra] },
      { title: "Duschen & Duschabtrennungen", brands: [b.megius, b.novellini, b.vismaravetro] },
      { title: "Badaccessoires", brands: [b.capannoli] },
      { title: "Designheizkörper", brands: [b.antrax, b.cordivari, b.caleido] },
    ],
  },
  {
    id: "kuechen",
    title: "Küchen",
    image: { src: "/images/kuechen/kuechen-hero-febal-origina-960w.webp", width: 960, height: 540, alt: "Offene Febal Casa Origina Küche mit Insel und raumhohen Schränken" },
    groups: [{ title: "Küchenwelten", brands: [b.febal] }],
  },
  {
    id: "platten",
    title: "Platten",
    image: { src: "/images/platten/platten-hero-emilgroup-feinsteinzeug-960w.webp", width: 960, height: 540, alt: "Emilgroup Feinsteinzeug in Holzoptik in einem hellen Badezimmer" },
    groups: [
      { title: "Keramik, Feinsteinzeug & Grossformate", brands: [b.energieker, b.emilgroup, b.lafabbrica, b.supergres, b.ariana, b.acquario] },
      { title: "Mosaik", brands: [b.sicis] },
      { title: "Naturstein & Wandverkleidungen", brands: [b.mosavit] },
      { title: "Parkett & Holz", brands: [b.skema, b.deco] },
      { title: "SPC & Designböden", brands: [b.zenon, b.deco] },
      { title: "Dekorative Wandbeläge & Teppiche", brands: [b.inkiostro] },
    ],
  },
  {
    id: "wellness",
    title: "Wellness",
    image: { src: "/images/wellness/wellness-hammam-megius-zen-combi-960w.webp", width: 960, height: 540, alt: "Megius Zen Combi Sauna und Hammam mit Dusche in einem modernen Wellnessraum" },
    groups: [
      { title: "Whirlpool & Minipool", brands: [b.novellini, b.albatros] },
      { title: "Sauna", brands: [b.novellini, b.albatros] },
      { title: "Hammam & Dampfbad", brands: [b.novellini, b.megius] },
      { title: "Wellness-Duschen", brands: [b.novellini, b.megius] },
      { title: "Badewannen", brands: [b.novellini, b.albatros] },
    ],
  },
];

// Bisherige Logo-Partner, die im Quellenregister keinem Bereich zugeordnet sind (unverändert übernommen).
const partners: Partner[] = [
  { name: "Fima", logo: fimaLogo, url: "https://fimacf.com/" },
  { name: "Lavastone", logo: lavastoneLogo, url: "https://www.lavastone-official.com/" },
  { name: "Dosem Ceramiche", logo: dosemLogo, url: "https://www.dosemceramiche.it/" },
  { name: "Laminam", logo: laminamLogo, url: "https://www.laminam.com/de/" },
  { name: "Naici", logo: naiciLogo, url: "https://www.naici.it/" },
  { name: "Roberto Cavalli Home Interiors", logo: cavalliLogo, url: "https://robertocavallihomeinteriors.onirogroup.it/" },
  { name: "Tonino Lamborghini", logo: lamborghiniLogo, url: "https://lamborghini-surfaces.com/" },
];

const allBrands: { name: string; url: string; logo?: string }[] = [...Object.values(b), ...partners];

const Partners: React.FC = () => {
  return (
    <main id="main-content" className={styles["partners-page"]}>
      <Helmet>
        <title>Marken & Partner | New Living Design Zofingen</title>
        <link rel="canonical" href="https://newlivingdesign.ch/partner" />
        <meta
          name="description"
          content="Ausgewählte Marken für Bad, Armaturen, Platten, Oberflächen und Interior Design. Verfügbarkeit und passende Produkte klären wir persönlich."
        />
        <meta property="og:title" content="Marken & Partner – New Living Design GmbH" />
        <meta property="og:description" content="Marken und Sortimente, aus denen wir eine passende Auswahl für Ihr Projekt zusammenstellen." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://newlivingdesign.ch/partner" />
        <meta property="og:image" content={`https://newlivingdesign.ch${heroImg}`} />
      </Helmet>

      {/* Hero */}
      <section className={styles["partners-hero"]}>
        <div className={styles["hero-background"]}>
          <img
            src={heroImg}
            alt="Showroom – Partner & Marken"
            className={styles["hero-bg-image"]}
          />
        </div>
        <div className={styles["hero-overlay"]} />

        <div className={styles["partners-hero-container"]}>
          <h1 className={styles["partners-title"]}>
            <span className={styles["title-line"]}>Marken, aus denen</span>
            <span>eine stimmige Auswahl wird.</span>
          </h1>
          <p className={styles["partners-subtitle"]}>
            Nicht jedes Produkt passt zu jedem Raum. Wir nutzen die Sortimente unserer Partner, um Materialien,
            Funktionen und Oberflächen passend zu Ihrem Projekt zusammenzustellen. Welche Serien verfügbar oder in
            Zofingen zu sehen sind, klären wir persönlich mit Ihnen.
          </p>
          <div className={styles["hero-scroll-indicator"]}>
            <div className={styles["scroll-dot"]}></div>
            <span>Scrollen Sie nach unten</span>
          </div>
        </div>
      </section>

      {/* Marken nach Bereich */}
      <section className={styles["partners-section"]} aria-label="Marken nach Bereich">
        <div className={styles["partners-container"]}>
          <nav className={styles["area-nav"]} aria-label="Bereiche">
            {areas.map((a) => (
              <a key={a.id} href={`#${a.id}`}>{a.title}</a>
            ))}
          </nav>
          {areas.map((a) => (
            <section key={a.id} id={a.id} className={styles["area"]} aria-labelledby={`${a.id}-title`}>
              <h2 id={`${a.id}-title`} className={styles["area-title"]}>{a.title}</h2>
              <img {...a.image} className={styles["area-image"]} loading="lazy" decoding="async" />
              <div className={styles["area-groups"]}>
                {a.groups.map((g) => (
                  <div key={g.title}>
                    <h3 className={styles["group-title"]}>{g.title}</h3>
                    <ul className={styles["brand-list"]}>
                      {g.brands.map((brand) => (
                        <li key={brand.name}>
                          <a href={brand.url} target="_blank" rel="noopener noreferrer" aria-label={`${brand.name} – Website öffnen`}>
                            {brand.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          ))}

          <h2 className={styles["area-title"]}>Weitere Marken</h2>
          <div className={styles["partners-grid"]}>
            {partners.map((p) => (
              <article key={p.name} className={styles["partner-card"]} title={p.name}>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles["partner-link"]}
                  aria-label={`${p.name} – Website öffnen`}
                >
                  <div className={styles["partner-logo-wrap"]}>
                    <img
                      src={p.logo}
                      alt={p.name}
                      className={styles["partner-logo"]}
                      loading="lazy"
                    />
                  </div>
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "Partner & Marken von New Living Design",
          "itemListElement": allBrands.map((p, i) => ({
            "@type": "Organization",
            "position": i + 1,
            "name": p.name,
            "url": p.url,
            "logo": !p.logo || p.logo.startsWith("data:") ? undefined : `https://newlivingdesign.ch${p.logo}`
          }))
        }) }} />
    </main>
  );
};

export default Partners;
