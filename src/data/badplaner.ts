/**
 * Katalog für den Badplaner (/badplaner).
 *
 * Platten, Möbelfarben, Armaturen-Oberflächen und Keramikfarben je Badpaket.
 * Jede Option hat einen englischen `prompt`-Text, den die API (api/badplaner.ts)
 * in die Anweisung an das Bildmodell einsetzt. `image` ist der Pfad des
 * Swatch-Bildes unter public/, `src` die Quelle beim Lieferanten
 * (scripts/fetch-swatches.mjs lädt fehlende Swatches beim Build herunter).
 *
 * Die Datei wird sowohl von der Seite als auch von der Serverless-Funktion
 * importiert: hier deshalb nur Konstanten und reine Funktionen, keine
 * Browser-APIs.
 */

export type PackageId = 'essenza' | 'colore' | 'atelier';

export interface TileOption {
  id: string;
  label: string;
  supplier: string;
  series: string;
  color: string;
  format: string;        // z. B. "60x120" (cm)
  packages: PackageId[];
  image: string;         // Pfad unter public/
  src: string;           // Originalbild beim Lieferanten
  url: string;           // Produktseite
  prompt: string;        // englische Beschreibung für das Bildmodell
}

export interface ColorOption {
  id: string;
  label: string;
  supplier: string;
  hex: string;
  image?: string | null;
  src?: string | null;
  prompt: string;
  packages: PackageId[];
}

export interface FinishOption {
  id: string;
  label: string;
  supplier: string;
  image?: string | null;
  src?: string | null;
  prompt: string;
  packages: PackageId[];
}

export interface ChoiceOption {
  id: string;
  label: string;
  prompt: string;
  packages?: PackageId[]; // fehlt = in allen Paketen
}

/* ---------- Platten ---------- */

export const tiles: TileOption[] = [
  { id: 'energieker-loft-white', label: 'Loft White', supplier: 'Energieker', series: 'Loft', color: 'White', format: '30x60', packages: ['essenza'], image: '/badplaner/swatches/energieker-loft-white.jpg', src: 'https://www.energieker.it/wp-content/uploads/2025/04/LOFT-White.jpg', url: 'https://www.energieker.it/it/collezioni/loft/', prompt: 'soft concrete-look porcelain tile (White)' },
  { id: 'energieker-loft-cream', label: 'Loft Cream', supplier: 'Energieker', series: 'Loft', color: 'Cream', format: '30x60', packages: ['essenza'], image: '/badplaner/swatches/energieker-loft-cream.jpg', src: 'https://www.energieker.it/wp-content/uploads/2025/04/LOFT-Cream.jpg', url: 'https://www.energieker.it/it/collezioni/loft/', prompt: 'soft concrete-look porcelain tile (Cream)' },
  { id: 'energieker-loft-taupe', label: 'Loft Taupe', supplier: 'Energieker', series: 'Loft', color: 'Taupe', format: '30x60', packages: ['essenza'], image: '/badplaner/swatches/energieker-loft-taupe.jpg', src: 'https://www.energieker.it/wp-content/uploads/2025/04/LOFT-Taupe.jpg', url: 'https://www.energieker.it/it/collezioni/loft/', prompt: 'soft concrete-look porcelain tile (Taupe)' },
  { id: 'energieker-loft-grey', label: 'Loft Grey', supplier: 'Energieker', series: 'Loft', color: 'Grey', format: '30x60', packages: ['essenza'], image: '/badplaner/swatches/energieker-loft-grey.jpg', src: 'https://www.energieker.it/wp-content/uploads/2025/04/LOFT-Grey.jpg', url: 'https://www.energieker.it/it/collezioni/loft/', prompt: 'soft concrete-look porcelain tile (Grey)' },
  { id: 'energieker-select-bianco', label: 'Select Bianco', supplier: 'Energieker', series: 'Select', color: 'Bianco', format: '30x60', packages: ['essenza'], image: '/badplaner/swatches/energieker-select-bianco.jpg', src: 'https://www.energieker.it/wp-content/uploads/2025/04/SELECT-Bianco.jpg', url: 'https://www.energieker.it/it/collezioni/select/', prompt: 'fine stone-look porcelain tile (Bianco)' },
  { id: 'energieker-select-nebbia', label: 'Select Nebbia', supplier: 'Energieker', series: 'Select', color: 'Nebbia', format: '30x60', packages: ['essenza'], image: '/badplaner/swatches/energieker-select-nebbia.jpg', src: 'https://www.energieker.it/wp-content/uploads/2025/04/SELECT-Nebbia.jpg', url: 'https://www.energieker.it/it/collezioni/select/', prompt: 'fine stone-look porcelain tile (Nebbia)' },
  { id: 'energieker-select-fumo', label: 'Select Fumo', supplier: 'Energieker', series: 'Select', color: 'Fumo', format: '30x60', packages: ['essenza'], image: '/badplaner/swatches/energieker-select-fumo.jpg', src: 'https://www.energieker.it/wp-content/uploads/2025/04/SELECT-Fumo.jpg', url: 'https://www.energieker.it/it/collezioni/select/', prompt: 'fine stone-look porcelain tile (Fumo)' },
  { id: 'energieker-massive-snow', label: 'Massive Snow', supplier: 'Energieker', series: 'Massive', color: 'Snow', format: '30x60', packages: ['essenza'], image: '/badplaner/swatches/energieker-massive-snow.jpg', src: 'https://www.energieker.it/wp-content/uploads/2025/04/MASSIVE-Snow.jpg', url: 'https://www.energieker.it/it/collezioni/massive/', prompt: 'natural stone-look porcelain tile (Snow)' },
  { id: 'energieker-massive-cloud', label: 'Massive Cloud', supplier: 'Energieker', series: 'Massive', color: 'Cloud', format: '30x60', packages: ['essenza'], image: '/badplaner/swatches/energieker-massive-cloud.jpg', src: 'https://www.energieker.it/wp-content/uploads/2025/04/MASSIVE-Cloud.jpg', url: 'https://www.energieker.it/it/collezioni/massive/', prompt: 'natural stone-look porcelain tile (Cloud)' },
  { id: 'energieker-rushmore-sand', label: 'Rushmore Sand', supplier: 'Energieker', series: 'Rushmore', color: 'Sand', format: '30x60', packages: ['essenza'], image: '/badplaner/swatches/energieker-rushmore-sand.jpg', src: 'https://www.energieker.it/wp-content/uploads/2025/05/RUSHMORE-Sand.jpg', url: 'https://www.energieker.it/it/collezioni/rushmore/', prompt: 'quartzite stone-look porcelain tile (Sand)' },
  { id: 'energieker-rushmore-grey', label: 'Rushmore Grey', supplier: 'Energieker', series: 'Rushmore', color: 'Grey', format: '30x60', packages: ['essenza'], image: '/badplaner/swatches/energieker-rushmore-grey.jpg', src: 'https://www.energieker.it/wp-content/uploads/2025/05/RUSHMORE-Grey.jpg', url: 'https://www.energieker.it/it/collezioni/rushmore/', prompt: 'quartzite stone-look porcelain tile (Grey)' },
  { id: 'energieker-calacatta-calacatta', label: 'Calacatta', supplier: 'Energieker', series: 'Calacatta', color: 'Calacatta', format: '60x120', packages: ['colore'], image: '/badplaner/swatches/energieker-calacatta-calacatta.jpg', src: 'https://www.energieker.it/wp-content/uploads/2025/04/CALACATTA.jpg', url: 'https://www.energieker.it/it/collezioni/calacatta/', prompt: 'Calacatta marble look, white with grey veins (Calacatta)' },
  { id: 'energieker-dolomite-dolomite', label: 'Dolomite', supplier: 'Energieker', series: 'Dolomite', color: 'Dolomite', format: '60x120', packages: ['colore'], image: '/badplaner/swatches/energieker-dolomite-dolomite.jpg', src: 'https://www.energieker.it/wp-content/uploads/2025/05/Dolomite.jpg', url: 'https://www.energieker.it/it/collezioni/dolomite/', prompt: 'Dolomite marble look, light grey (Dolomite)' },
  { id: 'energieker-pietragrey-white', label: 'Pietragrey White', supplier: 'Energieker', series: 'Pietragrey', color: 'White', format: '60x120', packages: ['colore'], image: '/badplaner/swatches/energieker-pietragrey-white.jpg', src: 'https://www.energieker.it/wp-content/uploads/2025/05/PIETRAGREY-White.jpg', url: 'https://www.energieker.it/it/collezioni/pietragrey/', prompt: 'grey stone look (White)' },
  { id: 'energieker-pietragrey-taupe', label: 'Pietragrey Taupe', supplier: 'Energieker', series: 'Pietragrey', color: 'Taupe', format: '60x120', packages: ['colore'], image: '/badplaner/swatches/energieker-pietragrey-taupe.jpg', src: 'https://www.energieker.it/wp-content/uploads/2025/05/PIETRAGREY-Taupe.jpg', url: 'https://www.energieker.it/it/collezioni/pietragrey/', prompt: 'grey stone look (Taupe)' },
  { id: 'energieker-pietragrey-fog', label: 'Pietragrey Fog', supplier: 'Energieker', series: 'Pietragrey', color: 'Fog', format: '60x120', packages: ['colore'], image: '/badplaner/swatches/energieker-pietragrey-fog.jpg', src: 'https://www.energieker.it/wp-content/uploads/2025/05/PIETRAGREY-Fog.jpg', url: 'https://www.energieker.it/it/collezioni/pietragrey/', prompt: 'grey stone look (Fog)' },
  { id: 'energieker-marquina-white', label: 'Marquiña White', supplier: 'Energieker', series: 'Marquiña', color: 'White', format: '60x120', packages: ['colore'], image: '/badplaner/swatches/energieker-marquina-white.jpg', src: 'https://www.energieker.it/wp-content/uploads/2025/05/MARQUINA-WHITE.jpg', url: 'https://www.energieker.it/it/collezioni/marquina/', prompt: 'Marquina marble look (White)' },
  { id: 'energieker-marquina-black', label: 'Marquiña Black', supplier: 'Energieker', series: 'Marquiña', color: 'Black', format: '60x120', packages: ['colore'], image: '/badplaner/swatches/energieker-marquina-black.jpg', src: 'https://www.energieker.it/wp-content/uploads/2025/05/MARQUINA-BLACK.jpg', url: 'https://www.energieker.it/it/collezioni/marquina/', prompt: 'Marquina marble look (Black)' },
  { id: 'energieker-city-plaster-white', label: 'City Plaster White', supplier: 'Energieker', series: 'City Plaster', color: 'White', format: '60x120', packages: ['colore'], image: '/badplaner/swatches/energieker-city-plaster-white.jpg', src: 'https://www.energieker.it/wp-content/uploads/2025/04/CITY-PLASTER-White.jpg', url: 'https://www.energieker.it/it/collezioni/city-plaster/', prompt: 'plaster / microcement look (White)' },
  { id: 'energieker-city-plaster-grey', label: 'City Plaster Grey', supplier: 'Energieker', series: 'City Plaster', color: 'Grey', format: '60x120', packages: ['colore'], image: '/badplaner/swatches/energieker-city-plaster-grey.jpg', src: 'https://www.energieker.it/wp-content/uploads/2025/04/CITY-PLASTER-Grey.jpg', url: 'https://www.energieker.it/it/collezioni/city-plaster/', prompt: 'plaster / microcement look (Grey)' },
  { id: 'energieker-city-plaster-beige', label: 'City Plaster Beige', supplier: 'Energieker', series: 'City Plaster', color: 'Beige', format: '60x120', packages: ['colore'], image: '/badplaner/swatches/energieker-city-plaster-beige.jpg', src: 'https://www.energieker.it/wp-content/uploads/2025/04/CITY-PLASTER-Beige.jpg', url: 'https://www.energieker.it/it/collezioni/city-plaster/', prompt: 'plaster / microcement look (Beige)' },
  { id: 'la-fabbrica-imperial-alabastrino', label: 'Imperial Alabastrino', supplier: 'La Fabbrica', series: 'Imperial', color: 'Alabastrino', format: '60x120', packages: ['colore'], image: '/badplaner/swatches/la-fabbrica-imperial-alabastrino.jpg', src: 'https://lafabbrica-static.devhoop.com/wp-content/uploads/2023/07/1_Imperial_Alabastrino_500x500.jpg', url: 'https://www.lafabbrica.it/collezioni/imperial/', prompt: 'travertine look (Alabastrino)' },
  { id: 'la-fabbrica-imperial-navona', label: 'Imperial Navona', supplier: 'La Fabbrica', series: 'Imperial', color: 'Navona', format: '60x120', packages: ['colore'], image: '/badplaner/swatches/la-fabbrica-imperial-navona.jpg', src: 'https://lafabbrica-static.devhoop.com/wp-content/uploads/2023/07/3_Imperial_Navona_500x500.jpg', url: 'https://www.lafabbrica.it/collezioni/imperial/', prompt: 'travertine look (Navona)' },
  { id: 'la-fabbrica-imperial-tivoli', label: 'Imperial Tivoli', supplier: 'La Fabbrica', series: 'Imperial', color: 'Tivoli', format: '60x120', packages: ['colore'], image: '/badplaner/swatches/la-fabbrica-imperial-tivoli.jpg', src: 'https://lafabbrica-static.devhoop.com/wp-content/uploads/2023/07/4_Imperial_Tivoli_500x500.jpg', url: 'https://www.lafabbrica.it/collezioni/imperial/', prompt: 'travertine look (Tivoli)' },
  { id: 'la-fabbrica-skyline-antracite', label: 'Skyline Antracite', supplier: 'La Fabbrica', series: 'Skyline', color: 'Antracite', format: '60x120', packages: ['colore'], image: '/badplaner/swatches/la-fabbrica-skyline-antracite.jpg', src: 'https://lafabbrica-static.devhoop.com/wp-content/uploads/2023/07/1_Skyline_Antracite_500x500.jpg', url: 'https://www.lafabbrica.it/collezioni/skyline/', prompt: 'resin / concrete look (Antracite)' },
  { id: 'la-fabbrica-skyline-ghiaccio', label: 'Skyline Ghiaccio', supplier: 'La Fabbrica', series: 'Skyline', color: 'Ghiaccio', format: '60x120', packages: ['colore'], image: '/badplaner/swatches/la-fabbrica-skyline-ghiaccio.jpg', src: 'https://lafabbrica-static.devhoop.com/wp-content/uploads/2023/07/3_Skyline_Ghiaccio_500x500.jpg', url: 'https://www.lafabbrica.it/collezioni/skyline/', prompt: 'resin / concrete look (Ghiaccio)' },
  { id: 'la-fabbrica-skyline-beige', label: 'Skyline Beige', supplier: 'La Fabbrica', series: 'Skyline', color: 'Beige', format: '60x120', packages: ['colore'], image: '/badplaner/swatches/la-fabbrica-skyline-beige.jpg', src: 'https://lafabbrica-static.devhoop.com/wp-content/uploads/2023/07/4_Skyline_Beige_500x500.jpg', url: 'https://www.lafabbrica.it/collezioni/skyline/', prompt: 'resin / concrete look (Beige)' },
  { id: 'la-fabbrica-chianca-ostuni', label: 'Chianca Ostuni', supplier: 'La Fabbrica', series: 'Chianca', color: 'Ostuni', format: '60x120', packages: ['colore'], image: '/badplaner/swatches/la-fabbrica-chianca-ostuni.jpg', src: 'https://lafabbrica-static.devhoop.com/wp-content/uploads/2023/07/2_Chianca_Ostuni_500x500.jpg', url: 'https://www.lafabbrica.it/collezioni/chianca/', prompt: 'limestone look (Ostuni)' },
  { id: 'la-fabbrica-bolgheri-stone-beige', label: 'Bolgheri Stone Beige', supplier: 'La Fabbrica', series: 'Bolgheri Stone', color: 'Beige', format: '60x120', packages: ['colore'], image: '/badplaner/swatches/la-fabbrica-bolgheri-stone-beige.jpg', src: 'https://lafabbrica-static.devhoop.com/wp-content/uploads/2023/07/1_Bolgheri-Stone_Beige_500x500.jpg', url: 'https://www.lafabbrica.it/collezioni/bolgheri-stone/', prompt: 'natural stone look (Beige)' },
  { id: 'emilgroup-tele-di-marmo-precious-crystal-white', label: 'Tele di Marmo Precious Crystal White', supplier: 'Emil', series: 'Tele di Marmo Precious', color: 'Crystal White', format: '120x120', packages: ['atelier'], image: '/badplaner/swatches/emilgroup-tele-di-marmo-precious-crystal-white.jpg', src: 'https://www.emilgroup.it/emil/prodotti/immaginiarticoli_emil/TeM%20PRECIUS_MOSAICO%205X5_30x30%20CRYSTAL%20WHITE.jpg', url: 'https://www.emilgroup.it/collezioni/piastrelle/emilceramica-tele-di-marmo-precious/', prompt: 'precious marble look with fine veins (Crystal White)' },
  { id: 'emilgroup-tele-di-marmo-precious-agate-black', label: 'Tele di Marmo Precious Agate Black', supplier: 'Emil', series: 'Tele di Marmo Precious', color: 'Agate Black', format: '120x120', packages: ['atelier'], image: '/badplaner/swatches/emilgroup-tele-di-marmo-precious-agate-black.jpg', src: 'https://www.emilgroup.it/emil/prodotti/immaginiarticoli_emil/TeM%20PRECIUS_MOSAICO%205X5_30x30%20AGATA%20BLACK.jpg', url: 'https://www.emilgroup.it/collezioni/piastrelle/emilceramica-tele-di-marmo-precious/', prompt: 'precious marble look with fine veins (Agate Black)' },
  { id: 'emilgroup-dual-travertine-poro-aperto-beige', label: 'Dual Travertine Poro Aperto Beige', supplier: 'Emil', series: 'Dual Travertine', color: 'Poro Aperto Beige', format: '120x120', packages: ['atelier'], image: '/badplaner/swatches/emilgroup-dual-travertine-poro-aperto-beige.jpg', src: 'https://www.emilgroup.it/emil/prodotti/immaginiarticoli_emil/Dual%20Travertine_PORO%20APERTO%20BEIGE_MOSAICO%205X5_30x30.jpg', url: 'https://www.emilgroup.it/collezioni/piastrelle/emilceramica-dual-travertine/', prompt: 'travertine look with open pores (Poro Aperto Beige)' },
  { id: 'emilgroup-dual-travertine-poro-aperto-white', label: 'Dual Travertine Poro Aperto White', supplier: 'Emil', series: 'Dual Travertine', color: 'Poro Aperto White', format: '120x120', packages: ['atelier'], image: '/badplaner/swatches/emilgroup-dual-travertine-poro-aperto-white.jpg', src: 'https://www.emilgroup.it/emil/prodotti/immaginiarticoli_emil/Dual%20Travertine_PORO%20APERTO%20WHITE_MOSAICO%205X5_30x30%204.jpg', url: 'https://www.emilgroup.it/collezioni/piastrelle/emilceramica-dual-travertine/', prompt: 'travertine look with open pores (Poro Aperto White)' },
  { id: 'emilgroup-unique-marble-paonazzetto', label: 'Unique Marble Paonazzetto', supplier: 'Emil', series: 'Unique Marble', color: 'Paonazzetto', format: '120x120', packages: ['atelier'], image: '/badplaner/swatches/emilgroup-unique-marble-paonazzetto.jpg', src: 'https://www.emilgroup.it/_next/image/?url=https%3A%2F%2Fwww.emilgroup.it%2Femil%2Fprodotti%2Fimmaginiarticoli_emil%2FEL63_UM%20PAONAZZETTO_MOSAICO%203x3%20copy.jpg', url: 'https://www.emilgroup.it/collezioni/piastrelle/provenza-unique-marble/', prompt: 'marble look (Paonazzetto)' },
  { id: 'emilgroup-unique-marble-calacatta-regale', label: 'Unique Marble Calacatta Regale', supplier: 'Emil', series: 'Unique Marble', color: 'Calacatta Regale', format: '120x120', packages: ['atelier'], image: '/badplaner/swatches/emilgroup-unique-marble-calacatta-regale.jpg', src: 'https://www.emilgroup.it/_next/image/?url=https%3A%2F%2Fwww.emilgroup.it%2Femil%2Fprodotti%2Fimmaginiarticoli_emil%2FEL65_UM%20CALACATTA%20REGALE_MOSAICO%203x3%20copy.jpg', url: 'https://www.emilgroup.it/collezioni/piastrelle/provenza-unique-marble/', prompt: 'marble look (Calacatta Regale)' },
  { id: 'emilgroup-unique-marble-sahara-noir', label: 'Unique Marble Sahara Noir', supplier: 'Emil', series: 'Unique Marble', color: 'Sahara Noir', format: '120x120', packages: ['atelier'], image: '/badplaner/swatches/emilgroup-unique-marble-sahara-noir.jpg', src: 'https://www.emilgroup.it/_next/image/?url=https%3A%2F%2Fwww.emilgroup.it%2Femil%2Fprodotti%2Fimmaginiarticoli_emil%2FEL67_UM%20SAHARA%20NOIR_MOSAICO%203x3.jpg', url: 'https://www.emilgroup.it/collezioni/piastrelle/provenza-unique-marble/', prompt: 'marble look (Sahara Noir)' },
  { id: 'emilgroup-cornerstone-evolution-slate-sand', label: 'Cornerstone Evolution Slate Sand', supplier: 'Emil', series: 'Cornerstone Evolution', color: 'Slate Sand', format: '60x120', packages: ['atelier'], image: '/badplaner/swatches/emilgroup-cornerstone-evolution-slate-sand.jpg', src: 'https://www.emilgroup.it/emil/prodotti/immaginiarticoli_emil/ENGK_Cornerstone_Slate_Sand_MOS%20LIST%20SFALSATI%2030X60%202.jpg', url: 'https://www.emilgroup.it/collezioni/piastrelle/ergon-cornerstone-evolution/', prompt: 'slate stone look (Slate Sand)' },
  { id: 'emilgroup-cornerstone-evolution-slate-greige', label: 'Cornerstone Evolution Slate Greige', supplier: 'Emil', series: 'Cornerstone Evolution', color: 'Slate Greige', format: '60x120', packages: ['atelier'], image: '/badplaner/swatches/emilgroup-cornerstone-evolution-slate-greige.jpg', src: 'https://www.emilgroup.it/emil/prodotti/immaginiarticoli_emil/ENGL_Cornerstone_Slate_Greige_MOS%20LIST%20SFALSATI%2030X60%202%202.jpg', url: 'https://www.emilgroup.it/collezioni/piastrelle/ergon-cornerstone-evolution/', prompt: 'slate stone look (Slate Greige)' },
  { id: 'laminam-i-naturali-travertino-avorio', label: 'I Naturali Travertino Avorio', supplier: 'Laminam', series: 'I Naturali', color: 'Travertino Avorio', format: '120x278', packages: ['atelier'], image: '/badplaner/swatches/laminam-i-naturali-travertino-avorio.jpg', src: 'https://laminam-cdn.thron.com/delivery/public/image/laminam/2ed0637e-dd9e-4bda-a9f2-1d202be39f96/miwtpa/std/768x1536/travertino-avorio-natural-0.webp', url: 'https://www.laminam.com/it/collezioni/i-naturali/', prompt: 'marble / travertine look large slab (Travertino Avorio)' },
  { id: 'laminam-i-naturali-calacatta-viola', label: 'I Naturali Calacatta Viola', supplier: 'Laminam', series: 'I Naturali', color: 'Calacatta Viola', format: '120x278', packages: ['atelier'], image: '/badplaner/swatches/laminam-i-naturali-calacatta-viola.jpg', src: 'https://laminam-cdn.thron.com/delivery/public/image/laminam/648aa583-294b-4caa-972c-374d0611d6f7/miwtpa/std/768x1536/calacatta-viola-polished-0.webp', url: 'https://www.laminam.com/it/collezioni/i-naturali/', prompt: 'marble / travertine look large slab (Calacatta Viola)' },
  { id: 'laminam-i-naturali-verde-alpi', label: 'I Naturali Verde Alpi', supplier: 'Laminam', series: 'I Naturali', color: 'Verde Alpi', format: '120x278', packages: ['atelier'], image: '/badplaner/swatches/laminam-i-naturali-verde-alpi.jpg', src: 'https://laminam-cdn.thron.com/delivery/public/image/laminam/ebe257d1-7616-45a0-9fd0-0534d092cbf7/miwtpa/std/768x1536/verde-alpi-polished-0.webp', url: 'https://www.laminam.com/it/collezioni/i-naturali/', prompt: 'marble / travertine look large slab (Verde Alpi)' },
  { id: 'laminam-i-naturali-noir-desir', label: 'I Naturali Noir Desir', supplier: 'Laminam', series: 'I Naturali', color: 'Noir Desir', format: '120x278', packages: ['atelier'], image: '/badplaner/swatches/laminam-i-naturali-noir-desir.jpg', src: 'https://laminam-cdn.thron.com/delivery/public/image/laminam/7537dfb0-a126-47e9-b39b-297b8b49d7dc/miwtpa/std/768x1536/noir-desir-natural-0.webp', url: 'https://www.laminam.com/it/collezioni/i-naturali/', prompt: 'marble / travertine look large slab (Noir Desir)' },
  { id: 'laminam-hado-travertino-bianco', label: 'Hado Travertino Bianco', supplier: 'Laminam', series: 'Hado', color: 'Travertino Bianco', format: '120x278', packages: ['atelier'], image: '/badplaner/swatches/laminam-hado-travertino-bianco.jpg', src: 'https://laminam-cdn.thron.com/delivery/public/image/laminam/73a0002b-1cab-4231-be97-43002a53c513/miwtpa/std/768x1536/travertino-bianco-rain-0.webp', url: 'https://www.laminam.com/it/collezioni/hado/', prompt: 'travertine look large slab (Travertino Bianco)' },
  { id: 'laminam-hado-travertino-noce', label: 'Hado Travertino Noce', supplier: 'Laminam', series: 'Hado', color: 'Travertino Noce', format: '120x278', packages: ['atelier'], image: '/badplaner/swatches/laminam-hado-travertino-noce.jpg', src: 'https://laminam-cdn.thron.com/delivery/public/image/laminam/6833c881-6073-438f-9a87-3a81e50afa81/miwtpa/std/768x1536/travertino-noce-rain-0.webp', url: 'https://www.laminam.com/it/collezioni/hado/', prompt: 'travertine look large slab (Travertino Noce)' },
  { id: 'laminam-rare-taj-mahal', label: 'Rare Taj Mahal', supplier: 'Laminam', series: 'Rare', color: 'Taj Mahal', format: '120x278', packages: ['atelier'], image: '/badplaner/swatches/laminam-rare-taj-mahal.jpg', src: 'https://laminam-cdn.thron.com/delivery/public/image/laminam/b1cea929-9c24-41c0-ac39-5b1c5aee4ce3/miwtpa/std/768x1536/taj-mahal-dna-0.webp', url: 'https://www.laminam.com/it/collezioni/rare/', prompt: 'quartzite look large slab (Taj Mahal)' },
];

/* ---------- Sanitärkeramik (WC, Waschtisch) ---------- */

export const sanitaryColors: ColorOption[] = [
  { id: 'weiss', label: 'Weiss', supplier: 'Galassia / Scarabeo / Cielo', hex: '#f4f4f2', image: null, src: null, prompt: 'white', packages: ['essenza', 'colore', 'atelier'] },
  { id: 'scarabeo-antique-pink', label: 'Antique Pink', supplier: 'Scarabeo', hex: '#c9a3a0', image: '/badplaner/swatches/scarabeo-antique-pink.jpg', src: 'https://www.scarabeosrl.com/public/_resized/antique-pink-(3)_350X350_90_C.jpg', prompt: 'antique pink matte ceramic', packages: ['colore'] },
  { id: 'scarabeo-ardesia', label: 'Ardesia', supplier: 'Scarabeo', hex: '#4d5560', image: '/badplaner/swatches/scarabeo-ardesia.jpg', src: 'https://www.scarabeosrl.com/public/_resized/ardesia_350X350_90_C.jpg', prompt: 'slate grey matte ceramic', packages: ['colore'] },
  { id: 'scarabeo-lava', label: 'Lava', supplier: 'Scarabeo', hex: '#6b6b6b', image: '/badplaner/swatches/scarabeo-lava.jpg', src: 'https://www.scarabeosrl.com/public/_resized/LAVA_350X350_90_C.jpg', prompt: 'dark grey matte ceramic', packages: ['colore'] },
  { id: 'scarabeo-musk', label: 'Musk', supplier: 'Scarabeo', hex: '#8a8f78', image: '/badplaner/swatches/scarabeo-musk.jpg', src: 'https://www.scarabeosrl.com/public/_resized/MUSK_350X350_90_C.jpg', prompt: 'muted moss green matte ceramic', packages: ['colore'] },
  { id: 'scarabeo-night', label: 'Night', supplier: 'Scarabeo', hex: '#2b2f36', image: '/badplaner/swatches/scarabeo-night.jpg', src: 'https://www.scarabeosrl.com/public/_resized/nigth_350X350_90_C.jpg', prompt: 'anthracite black matte ceramic', packages: ['colore'] },
  { id: 'scarabeo-ocean', label: 'Ocean', supplier: 'Scarabeo', hex: '#3f6f7a', image: '/badplaner/swatches/scarabeo-ocean.jpg', src: 'https://www.scarabeosrl.com/public/_resized/Ocean_350X350_90_C.jpg', prompt: 'petrol blue matte ceramic', packages: ['colore'] },
  { id: 'scarabeo-pearl', label: 'Pearl', supplier: 'Scarabeo', hex: '#d8d2c6', image: '/badplaner/swatches/scarabeo-pearl.jpg', src: 'https://www.scarabeosrl.com/public/_resized/PEARL_350X350_90_C.jpg', prompt: 'light pearl grey-beige matte ceramic', packages: ['colore'] },
  { id: 'scarabeo-sand', label: 'Sand', supplier: 'Scarabeo', hex: '#c9b79c', image: '/badplaner/swatches/scarabeo-sand.jpg', src: 'https://www.scarabeosrl.com/public/_resized/sand_350X350_90_C.jpg', prompt: 'sand beige matte ceramic', packages: ['colore'] },
  { id: 'scarabeo-tobacco', label: 'Tobacco', supplier: 'Scarabeo', hex: '#8b5a3c', image: '/badplaner/swatches/scarabeo-tobacco.jpg', src: 'https://www.scarabeosrl.com/public/_resized/TOBACCO_350X350_90_C.jpg', prompt: 'tobacco brown matte ceramic', packages: ['colore'] },
  { id: 'cielo-talco', label: 'Talco (Terre di Cielo)', supplier: 'Ceramica Cielo', hex: '#ece8df', image: '/badplaner/swatches/cielo-talco.jpg', src: 'https://img.ceramicacielo.it/finiture/20231124-7294-TL.jpg', prompt: 'talc white matte ceramic', packages: ['atelier'] },
  { id: 'cielo-pomice', label: 'Pomice (Terre di Cielo)', supplier: 'Ceramica Cielo', hex: '#d6d1c6', image: '/badplaner/swatches/cielo-pomice.jpg', src: 'https://img.ceramicacielo.it/finiture/20231124-7295-PM.jpg', prompt: 'pumice grey matte ceramic', packages: ['atelier'] },
  { id: 'cielo-cemento', label: 'Cemento (Terre di Cielo)', supplier: 'Ceramica Cielo', hex: '#9c9c96', image: '/badplaner/swatches/cielo-cemento.jpg', src: 'https://img.ceramicacielo.it/finiture/20231124-7297-CM.jpg', prompt: 'cement grey matte ceramic', packages: ['atelier'] },
  { id: 'cielo-basalto', label: 'Basalto (Terre di Cielo)', supplier: 'Ceramica Cielo', hex: '#5b5c5a', image: '/badplaner/swatches/cielo-basalto.jpg', src: 'https://img.ceramicacielo.it/finiture/20231124-7298-BA.jpg', prompt: 'basalt dark grey matte ceramic', packages: ['atelier'] },
  { id: 'cielo-fango', label: 'Fango (Terre di Cielo)', supplier: 'Ceramica Cielo', hex: '#8f857a', image: '/badplaner/swatches/cielo-fango.jpg', src: 'https://img.ceramicacielo.it/finiture/20231124-7300-FN.jpg', prompt: 'mud greige matte ceramic', packages: ['atelier'] },
  { id: 'cielo-arenaria', label: 'Arenaria (Terre di Cielo)', supplier: 'Ceramica Cielo', hex: '#c8b59b', image: '/badplaner/swatches/cielo-arenaria.jpg', src: 'https://img.ceramicacielo.it/finiture/20231124-7302-AN.jpg', prompt: 'sandstone beige matte ceramic', packages: ['atelier'] },
  { id: 'cielo-muschio', label: 'Muschio (Terre di Cielo)', supplier: 'Ceramica Cielo', hex: '#7f8a6c', image: '/badplaner/swatches/cielo-muschio.jpg', src: 'https://img.ceramicacielo.it/finiture/20231124-7304-MU.jpg', prompt: 'moss green matte ceramic', packages: ['atelier'] },
  { id: 'cielo-cipria', label: 'Cipria (Terre di Cielo)', supplier: 'Ceramica Cielo', hex: '#dcc0b5', image: '/badplaner/swatches/cielo-cipria.jpg', src: 'https://img.ceramicacielo.it/finiture/20231124-7308-CP.jpg', prompt: 'powder pink matte ceramic', packages: ['atelier'] },
];

/* ---------- Armaturen-Oberflächen (Treemme) ---------- */

export const tapFinishes: FinishOption[] = [
  { id: 'treemme-cromo', label: 'Cromo', supplier: 'Treemme', image: '/badplaner/swatches/treemme-cromo.png', src: 'https://cdn.rubinetterie3m.it/storage/finiture/619cb0d495809.png', prompt: 'polished chrome', packages: ['essenza', 'colore', 'atelier'] },
  { id: 'treemme-nero-opaco', label: 'Nero Opaco', supplier: 'Treemme', image: '/badplaner/swatches/treemme-nero-opaco.png', src: 'https://cdn.rubinetterie3m.it/storage/finiture/619cb3763a7f3.png', prompt: 'matte black', packages: ['essenza', 'colore', 'atelier'] },
  { id: 'treemme-bianco-opaco', label: 'Bianco Opaco', supplier: 'Treemme', image: '/badplaner/swatches/treemme-bianco-opaco.png', src: 'https://cdn.rubinetterie3m.it/storage/finiture/619cb0879e006.png', prompt: 'matte white', packages: ['essenza', 'colore'] },
  { id: 'treemme-oro-spazzolato', label: 'Oro Spazzolato', supplier: 'Treemme', image: '/badplaner/swatches/treemme-oro-spazzolato.png', src: 'https://cdn.rubinetterie3m.it/storage/finiture/619cb1b1a4c2b.png', prompt: 'brushed gold', packages: ['essenza', 'colore', 'atelier'] },
  { id: 'treemme-nichel-spazzolato', label: 'Nichel Spazzolato', supplier: 'Treemme', image: '/badplaner/swatches/treemme-nichel-spazzolato.png', src: 'https://cdn.rubinetterie3m.it/storage/finiture/619cb2fb9ea8a.png', prompt: 'brushed nickel', packages: ['essenza', 'colore', 'atelier'] },
  { id: 'treemme-inox-spazzolato', label: 'Inox Spazzolato', supplier: 'Treemme', image: '/badplaner/swatches/treemme-inox-spazzolato.png', src: 'https://cdn.rubinetterie3m.it/storage/finiture/619cb200a25ff.png', prompt: 'brushed stainless steel', packages: ['colore', 'atelier'] },
  { id: 'treemme-gun-metal-pvd', label: 'Gun Metal-PVD', supplier: 'Treemme', image: '/badplaner/swatches/treemme-gun-metal-pvd.png', src: 'https://cdn.rubinetterie3m.it/storage/finiture/619cb81778620.png', prompt: 'gun metal PVD', packages: ['colore', 'atelier'] },
  { id: 'treemme-bronze-pvd', label: 'Bronze-PVD', supplier: 'Treemme', image: '/badplaner/swatches/treemme-bronze-pvd.png', src: 'https://cdn.rubinetterie3m.it/storage/finiture/619cb8ce565c0.png', prompt: 'bronze PVD', packages: ['atelier'] },
  { id: 'treemme-oro-rosa-spazzolato', label: 'Oro Rosa Spazzolato', supplier: 'Treemme', image: '/badplaner/swatches/treemme-oro-rosa-spazzolato.png', src: 'https://cdn.rubinetterie3m.it/storage/finiture/619cb914c110f.png', prompt: 'brushed rose gold', packages: ['atelier'] },
  { id: 'treemme-ottone-spazzolato', label: 'Ottone Spazzolato', supplier: 'Treemme', image: '/badplaner/swatches/treemme-ottone-spazzolato.png', src: 'https://cdn.rubinetterie3m.it/storage/finiture/651151fb24349.png', prompt: 'brushed brass', packages: ['colore', 'atelier'] },
];

/* ---------- Möbelfarben ---------- */

export const furnitureColors: ColorOption[] = [
  { id: 'gb-group-europa-bianco-opaco', label: 'Bianco opaco', supplier: 'GB Group Europa', hex: '#f2f2f0', prompt: 'matte white', packages: ['essenza'] },
  { id: 'gb-group-europa-grigio', label: 'Grigio', supplier: 'GB Group Europa', hex: '#9a9a9a', prompt: 'grey', packages: ['essenza'] },
  { id: 'gb-group-europa-salvia', label: 'Salvia', supplier: 'GB Group Europa', hex: '#9fae95', prompt: 'sage green', packages: ['essenza'] },
  { id: 'gb-group-europa-rovere', label: 'Rovere', supplier: 'GB Group Europa', hex: '#b89a72', prompt: 'light oak wood', packages: ['essenza'] },
  { id: 'gb-group-europa-antracite', label: 'Antracite', supplier: 'GB Group Europa', hex: '#3f4145', prompt: 'anthracite', packages: ['essenza'] },
  { id: 'edone-panna', label: 'Panna', supplier: 'Edoné', hex: '#f1ebdf', prompt: 'cream', packages: ['colore'] },
  { id: 'edone-lino', label: 'Lino', supplier: 'Edoné', hex: '#d9cfba', prompt: 'linen beige', packages: ['colore'] },
  { id: 'edone-talpa', label: 'Talpa', supplier: 'Edoné', hex: '#8a7f74', prompt: 'taupe', packages: ['colore'] },
  { id: 'edone-peltro', label: 'Peltro', supplier: 'Edoné', hex: '#6e6f70', prompt: 'pewter grey', packages: ['colore'] },
  { id: 'edone-edera', label: 'Edera', supplier: 'Edoné', hex: '#5a6b4d', prompt: 'ivy green', packages: ['colore'] },
  { id: 'edone-foresta', label: 'Foresta', supplier: 'Edoné', hex: '#2f4a3a', prompt: 'forest green', packages: ['colore'] },
  { id: 'edone-denim', label: 'Denim', supplier: 'Edoné', hex: '#4c6480', prompt: 'denim blue', packages: ['colore'] },
  { id: 'edone-ruggine', label: 'Ruggine', supplier: 'Edoné', hex: '#a35a3b', prompt: 'rust', packages: ['colore'] },
  { id: 'edone-nero-china', label: 'Nero China', supplier: 'Edoné', hex: '#1e1e1e', prompt: 'ink black', packages: ['colore'] },
  { id: 'rexa-corian-glacier-white', label: 'Corian Glacier White', supplier: 'Rexa', hex: '#f5f5f3', prompt: 'white Corian', packages: ['atelier'] },
  { id: 'rexa-corian-dune-prima', label: 'Corian Dune Prima', supplier: 'Rexa', hex: '#c9bfae', prompt: 'dune beige Corian', packages: ['atelier'] },
  { id: 'rexa-corian-elegant-gray', label: 'Corian Elegant Gray', supplier: 'Rexa', hex: '#8d8d8b', prompt: 'elegant grey Corian', packages: ['atelier'] },
  { id: 'rexa-corian-deep-nocturne', label: 'Corian Deep Nocturne', supplier: 'Rexa', hex: '#2a2b2e', prompt: 'deep black Corian', packages: ['atelier'] },
  { id: 'rexa-marmo-carrara', label: 'Marmo Carrara', supplier: 'Rexa', hex: '#e6e6e4', prompt: 'Carrara marble top', packages: ['atelier'] },
  { id: 'rexa-marmo-grigio-carnico', label: 'Marmo Grigio Carnico', supplier: 'Rexa', hex: '#6e7276', prompt: 'Grigio Carnico marble top', packages: ['atelier'] },
];

/* ---------- Armaturen-Serie je Paket ---------- */

export const tapSeries: Record<PackageId, string> = {
  essenza: 'Treemme Up',
  colore: 'Treemme 5mm',
  atelier: 'Treemme Aurelia',
};

/* ---------- Dusche / Badewanne, Waschtisch, Spiegel ---------- */

export const showerOptions: ChoiceOption[] = [
  { id: 'duschwanne', label: 'Dusche mit Duschwanne', prompt: 'shower with a low shower tray, fixed glass panel' },
  { id: 'gefaelle', label: 'Bodenebene Dusche, gefliest (Gefälledusche)', prompt: 'floor-level walk-in shower tiled with the same tiles, linear drain, fixed glass panel' },
  { id: 'badewanne', label: 'Badewanne', prompt: 'built-in bathtub in the same place as the existing bathtub or shower, with a glass screen' },
  { id: 'freistehend', label: 'Freistehende Badewanne', prompt: 'freestanding bathtub (only if there is room, otherwise a floor-level walk-in shower)', packages: ['atelier'] },
];

export const basinOptions: ChoiceOption[] = [
  { id: 'einzel', label: 'Einzelwaschtisch', prompt: 'single washbasin' },
  { id: 'doppel', label: 'Doppelwaschtisch', prompt: 'double washbasin on a wider vanity' },
];

export const mirrorOptions: ChoiceOption[] = [
  { id: 'spiegelschrank', label: 'Spiegelschrank', prompt: 'mirror cabinet with LED light' },
  { id: 'spiegel', label: 'Spiegel mit LED-Licht', prompt: 'large mirror with integrated LED light' },
];

/* ---------- Hilfen ---------- */

/** Nur die Optionen, die für das gewählte Paket gelten (ohne `packages` = überall). */
const forPackage = <T extends { packages?: PackageId[] }>(list: T[], pkg: PackageId): T[] =>
  list.filter((o) => !o.packages || o.packages.includes(pkg));

/** Alle Auswahllisten für ein Paket, in der Reihenfolge der Schritte auf der Seite. */
export function optionsForPackage(pkg: PackageId) {
  return {
    tiles: forPackage(tiles, pkg),
    furniture: forPackage(furnitureColors, pkg),
    finishes: forPackage(tapFinishes, pkg),
    sanitary: forPackage(sanitaryColors, pkg),
    showers: forPackage(showerOptions, pkg),
    basins: forPackage(basinOptions, pkg),
    mirrors: forPackage(mirrorOptions, pkg),
    tapSeries: tapSeries[pkg],
  };
}

/**
 * Flache Liste aller Swatch-Bilder (Datei unter public/badplaner/swatches/ und
 * Quelle beim Lieferanten). Dieselben Daten liegen als scripts/swatches.json,
 * damit scripts/fetch-swatches.mjs sie ohne TypeScript lesen kann.
 */
export const swatchSources: { file: string; src: string }[] = [...tiles, ...sanitaryColors, ...tapFinishes]
  .filter((o) => o.image && o.src)
  .map((o) => ({ file: (o.image as string).replace('/badplaner/swatches/', ''), src: o.src as string }));

/* ---------- FAQ (Text auch für das FAQPage-Schema) ---------- */

export const badplanerFaq: { question: string; answer: string }[] = [
  {
    question: 'Kostet der Badplaner etwas?',
    answer: 'Nein. Das Ideenbild ist kostenlos und unverbindlich. Pro Gerät sind drei Ideenbilder pro Tag möglich.',
  },
  {
    question: 'Wie genau ist das Ideenbild?',
    answer: 'Es ist ein Ideenbild, kein Plan. Das Bild zeigt eine Stimmung mit den gewählten Platten, Farben und Armaturen in Ihrem Bad. Masse, Leitungen, Anschlüsse und Details klären wir bei der Besichtigung vor Ort und in der Planung mit 3D-Rendering.',
  },
  {
    question: 'Was passiert mit meinem Foto?',
    answer: 'Ihr Foto wird zur Erstellung des Ideenbilds an Google (Gemini API) übermittelt und zusammen mit dem Ergebnis per E-Mail an uns geschickt. Wir speichern die Fotos nicht auf unseren Servern und löschen Foto und Ideenbild spätestens 30 Tage nach Abschluss der Anfrage, wenn kein Auftrag zustande kommt. Details stehen in der Datenschutzerklärung.',
  },
  {
    question: 'Was passiert danach?',
    answer: 'Wir rufen Sie an oder melden uns per WhatsApp, besprechen das Ideenbild und laden Sie in unsere Ausstellung in Zofingen ein. Nach der Besichtigung bei Ihnen zu Hause erhalten Sie eine Offerte mit Fixpreis.',
  },
];
