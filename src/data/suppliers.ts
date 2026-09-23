/**
 * Marken: eine Quelle für Register, Fachgebiete und Bildzuordnung (Startseite, /produkte, /partner).
 *
 * Aktive Marken und Kategorien: verbindliche Liste von NLD (Stand 23.09.2026).
 * Offizielle Websites aus dem Quellenregister des NLD-Medienpakets vom 22.09.2026.
 * Bilder: Medienpaket (Alt-Texte exakt aus media-manifest.json) sowie bereits veröffentlichte
 * Dateien, deren Name die Marke oder eine laut Manifest zugehörige Serie trägt.
 * Nicht mehr geführte Marken sind hier entfernt; ihre Dateien bleiben in src/assets.
 * Zuordnung und Lücken: docs/KATALOG_FORNITORI_V3.md.
 */
import newformDeltazero from '../assets/Newform_Deltazero_P2.webp';
import megiusZenCombiDuo from '../assets/Zen_Combi_duo_Linear_6-1030x1030.webp';

export type AreaId = 'bad' | 'kuechen' | 'platten' | 'wellness';

export type SupplierImage = { src: string; srcSet?: string; width: number; height: number; alt: string };

// Medienpaket: grösste WebP-Datei als src, 960w-Variante für kleinere Viewports.
export const media = (path: string, width: number, height: number, alt: string): SupplierImage => ({
  src: `/images/${path}-${width}w.webp`,
  srcSet: `/images/${path}-960w.webp 960w, /images/${path}-${width}w.webp ${width}w`,
  width,
  height,
  alt,
});

export const packImages = {
  edone: media('bad/bad-hero-edone-hexis', 1600, 900, 'Edoné Hexis Badmöbel in einem grosszügigen, modern gestalteten Badezimmer'),
  froidevaux: media('bad/bad-badmoebel-froidevaux-massarbeit', 1600, 900, 'Froidevaux Waschtischmöbel aus Holz mit zwei Aufsatzbecken'),
  gessi: media('bad/bad-armaturen-gessi-jacqueline', 1136, 639, 'Gessi Designarmaturen in Bronze an dunklen Aufsatzwaschbecken'),
  cielo: media('bad/bad-sanitaerkeramik-cielo-le-giare', 1600, 900, 'Weisse Le Giare Sanitärkeramik von Ceramica Cielo vor blauem Hintergrund'),
  vismaravetro: media('bad/bad-duschen-vismaravetro-suite', 1600, 900, 'Vismaravetro Dusch- und Trennwandsystem in einem modernen Bad'),
  capannoli: media('bad/bad-accessoires-capannoli-tratto', 1600, 900, 'Capannoli Badaccessoires in verschiedenen Metalloberflächen an einer hellen Wand'),
  antrax: media('bad/bad-designheizkoerper-antrax-pypeline', 1600, 900, 'Antrax IT Pypeline Designheizkörper in einem schwarzen Badezimmer mit freistehender Badewanne'),
  cordivari: media('bad/bad-designheizkoerper-cordivari', 1552, 873, 'Cordivari Designheizkörper in Spiegeloptik über einer Holzkonsole'),
  febalHero: media('kuechen/kuechen-hero-febal-origina', 1600, 900, 'Offene Febal Casa Origina Küche mit Insel und raumhohen Schränken'),
  febalCard: media('kuechen/kuechen-card-febal-origina', 1008, 567, 'Febal Casa Origina Küche mit farbigem Inseltisch und Holzfronten'),
  novelliniOasis: media('wellness/wellness-hero-novellini-home-oasis', 1600, 900, 'Novellini Home Oasis mit Sauna, Dusche und Spa in einem hellen Wellnessraum'),
  novelliniMoon: media('wellness/wellness-whirlpool-novellini-moon', 1600, 900, 'Novellini Moon Whirlpool im Freien mit integrierter Beleuchtung'),
  novelliniFun: media('wellness/wellness-sauna-novellini-fun', 1600, 900, 'Novellini Fun Sauna mit Glasfront in einem warm gestalteten Wohnbereich'),
  albatros: media('wellness/wellness-whirlpool-albatros-soreha', 1024, 576, 'Albatros Soreha Whirlpool mit Holzverkleidung und sprudelndem Wasser'),
  megius: media('wellness/wellness-hammam-megius-zen-combi', 1600, 900, 'Megius Zen Combi Sauna und Hammam mit Dusche in einem modernen Wellnessraum'),
  emilgroup: media('platten/platten-hero-emilgroup-feinsteinzeug', 1600, 900, 'Emilgroup Feinsteinzeug in Holzoptik in einem hellen Badezimmer'),
  lafabbrica: media('platten/platten-grossformat-lafabbrica-venezia', 1600, 900, 'La Fabbrica AVA Venezia Platten in schwarzer Marmoroptik in einem eleganten Wohnraum'),
  sicis: media('platten/platten-mosaik-sicis-elegance', 1600, 900, 'Künstlerische SICIS Mosaikwand mit abstrahiertem Gesicht in einem Wohnraum'),
  skema: media('platten/platten-parkett-skema-villa', 1408, 792, 'Skema Villa Parkettboden aus heller Eiche in einem modernen Interieur'),
  zenon: media('platten/platten-spc-zenon-tempo', 1600, 900, 'Zenon Tempo SPC-Boden in heller Holzoptik in einem Schlafzimmer'),
  deco: media('platten/platten-spc-deco-clap', 1600, 900, 'Déco Clap Designboden in Holzoptik in einem warm beleuchteten Interieur'),
  inkiostro: media('platten/platten-wandbelag-inkiostro-white-paper', 1600, 900, 'Inkiostro Bianco Wandverkleidung mit geometrischem Muster und farbigen Sesseln'),
  mosavit: media('platten/platten-naturstein-mosavit-fachaleta-quartz-marfil', 1520, 855, 'Mosavit Fachaleta Quartz Marfil Natursteinverkleidung an einer hellen Aussenwand'),
};

const p = packImages;

type RegistryEntry = { name: string; url: string; images?: SupplierImage[] };

export const registry = {
  rexa: { name: 'Rexa Design', url: 'https://rexadesign.it/' },
  edone: { name: 'Edoné', url: 'https://www.edonedesign.it/en', images: [p.edone] },
  archeda: { name: 'Archeda', url: 'https://www.archeda.eu/' },
  froidevaux: { name: 'Froidevaux AG', url: 'https://www.froidevaux.ch/de/', images: [p.froidevaux] },
  pirovano: { name: 'Pirovano Bagni', url: 'https://pirovanobagni.it/' },
  treemme: { name: 'Rubinetterie Treemme', url: 'https://www.rubinetterie3m.it/it' },
  newform: { name: 'Newform', url: 'https://www.newform.it/it', images: [{ src: newformDeltazero, width: 1400, height: 989, alt: 'Schwarze Wannenarmatur mit Handbrause auf einer dunklen Steinfläche' }] },
  gessi: { name: 'Gessi', url: 'https://www.gessi.com/en/bath', images: [p.gessi] },
  luce: { name: 'Luce Rubinetterie', url: 'https://www.lucerubinetterie.it/rubinetteria/' },
  cielo: { name: 'Ceramica Cielo', url: 'https://www.ceramicacielo.it/en', images: [p.cielo] },
  scarabeo: { name: 'Scarabeo Ceramiche', url: 'https://scarabeoceramiche.it/collezioni/collezione-ceramica/' },
  galassia: { name: 'Ceramica Galassia', url: 'https://www.ceramicagalassia.it/catalogue' },
  azzurra: { name: 'Azzurra Ceramica', url: 'https://www.azzurraceramica.it/' },
  megius: { name: 'Megius', url: 'https://www.megius.com/', images: [p.megius, { src: megiusZenCombiDuo, width: 1030, height: 1030, alt: 'Wellness-Kabine aus dem Produktsortiment' }] },
  novellini: { name: 'Novellini', url: 'https://novellini.com/', images: [p.novelliniOasis, p.novelliniMoon, p.novelliniFun] },
  vismaravetro: { name: 'Vismaravetro', url: 'https://www.vismaravetro.it/en/shower-enclosure-collections', images: [p.vismaravetro] },
  capannoli: { name: 'Capannoli', url: 'https://www.capannoli.it/', images: [p.capannoli] },
  antrax: { name: 'Antrax IT', url: 'https://www.antrax.com/', images: [p.antrax] },
  cordivari: { name: 'Cordivari Design', url: 'https://www.cordivaridesign.it/it/', images: [p.cordivari] },
  caleido: { name: 'Caleido', url: 'https://www.caleido.it/' },
  febal: { name: 'Febal Casa', url: 'https://www.febalcasa.com/en/kind/kitchens/', images: [p.febalHero, p.febalCard] },
  energieker: { name: 'Energieker', url: 'https://www.energieker.it/en/collections/' },
  emilgroup: { name: 'Emilgroup', url: 'https://www.emilgroup.it/EN/', images: [p.emilgroup] },
  lafabbrica: { name: 'La Fabbrica AVA', url: 'https://www.lafabbrica.it/en/', images: [p.lafabbrica] },
  supergres: { name: 'Supergres', url: 'https://www.supergres.com/en/' },
  ariana: { name: 'Ariana Ceramiche / Gardenia&Ariana', url: 'https://www.gardenia.it/en/collections' },
  acquario: { name: 'Acquario Due', url: 'https://en.acquariodue.com/collezioni' },
  sicis: { name: 'SICIS', url: 'https://www.sicis.com/en/mosaic', images: [p.sicis] },
  mosavit: { name: 'Mosavit / Trip by Mosavit', url: 'https://mosavit.com/en/', images: [p.mosavit] },
  skema: { name: 'Skema', url: 'https://skema.eu/en/collections/wooden-floors/', images: [p.skema] },
  deco: { name: 'Déco', url: 'https://www.decodecking.it/it/indoor/clap/', images: [p.deco] },
  zenon: { name: 'Zenon Bath & SPC Surfaces', url: 'https://zenonsurfaces.com/en/collections/Z_PD_FLOOR_PANELS_SPC_TEMPO/', images: [p.zenon] },
  inkiostro: { name: 'Inkiostro Bianco', url: 'https://www.inkiostrobianco.com/en/', images: [p.inkiostro] },
  albatros: { name: 'Albatros Wellness', url: 'https://albatroswellness.it/en/', images: [p.albatros] },
} satisfies Record<string, RegistryEntry>;

export type SupplierKey = keyof typeof registry;

// Kategorien exakt nach der Liste von NLD (Stand 23.09.2026).
export const areas: { id: AreaId; title: string; groups: { title: string; brands: SupplierKey[] }[] }[] = [
  {
    id: 'bad',
    title: 'Bad',
    groups: [
      { title: 'Badmöbel', brands: ['rexa', 'edone', 'archeda', 'froidevaux', 'pirovano'] },
      { title: 'Armaturen', brands: ['treemme', 'newform', 'gessi', 'luce'] },
      { title: 'Sanitärkeramik', brands: ['cielo', 'scarabeo', 'galassia', 'azzurra'] },
      { title: 'Duschen & Duschabtrennungen', brands: ['megius', 'novellini', 'vismaravetro'] },
      { title: 'Badaccessoires', brands: ['capannoli'] },
      { title: 'Designheizkörper', brands: ['antrax', 'cordivari', 'caleido'] },
    ],
  },
  { id: 'kuechen', title: 'Küchen', groups: [{ title: 'Küchenwelten', brands: ['febal'] }] },
  {
    id: 'platten',
    title: 'Platten',
    groups: [
      { title: 'Keramik, Feinsteinzeug & Grossformate', brands: ['energieker', 'emilgroup', 'lafabbrica', 'supergres', 'ariana', 'acquario'] },
      { title: 'Mosaik', brands: ['sicis', 'mosavit'] },
      { title: 'Parkett & Holz', brands: ['skema'] },
      { title: 'SPC & Designböden', brands: ['deco', 'zenon'] },
      { title: 'Dekorative Wandbeläge & Tapeten', brands: ['inkiostro'] },
    ],
  },
  {
    id: 'wellness',
    title: 'Wellness',
    // Marken laut NLD-Liste (Megius, Novellini, Albatros Wellness); Fachgebiete je Marke aus dem Quellenregister.
    groups: [
      { title: 'Whirlpool & Minipool', brands: ['novellini', 'albatros'] },
      { title: 'Sauna', brands: ['novellini', 'albatros'] },
      { title: 'Hammam & Dampfbad', brands: ['novellini', 'megius'] },
      { title: 'Wellness-Duschen', brands: ['novellini', 'megius'] },
      { title: 'Badewannen', brands: ['novellini', 'albatros'] },
    ],
  },
];

export type Supplier = {
  key: SupplierKey;
  id: string; // Sprungmarke auf /partner
  name: string;
  url: string;
  images: SupplierImage[];
  /** Bereiche mit Fachgebieten laut NLD-Liste */
  areas: { id: AreaId; title: string; specialties: string[] }[];
};

const toSupplier = (key: SupplierKey): Supplier => {
  const entry: RegistryEntry = registry[key];
  return {
    key,
    id: `marke-${key}`,
    name: entry.name,
    url: entry.url,
    images: entry.images ?? [],
    areas: areas.flatMap((area) => {
      const specialties = area.groups.filter((g) => g.brands.includes(key)).map((g) => g.title);
      return specialties.length ? [{ id: area.id, title: area.title, specialties }] : [];
    }),
  };
};

/** Alle aktiven Marken in Listenreihenfolge (Bad, Küchen, Platten, Wellness). */
export const suppliers: Supplier[] = (Object.keys(registry) as SupplierKey[]).map(toSupplier);

export const supplierByKey = (key: SupplierKey): Supplier => suppliers.find((s) => s.key === key)!;

export const suppliersInArea = (area: AreaId): Supplier[] => suppliers.filter((s) => s.areas.some((a) => a.id === area));

export const supplierHref = (key: SupplierKey) => `/partner#marke-${key}`;
