# Katalog Lieferanten V3 (Stand 23.09.2026)

Verbindliche Liste aktiver Marken: Angabe von NLD im Chat vom 23.09.2026.
Umgesetzt in `src/data/catalog.json` (einzige Quelle für Startseite, /produkte, Katalogseiten und /partner).

## Entfernt (nicht mehr geführt)

Fima, Naici, Roberto Cavalli Home Interiors, Lavastone, Dosem Ceramiche, Laminam, Tonino Lamborghini.
Nur aus Code und Seiten entfernt; alle Dateien (Logos, `Dosem_Onyx…jpg`) bleiben in `src/assets/`.

## Struktur

Bereich > Fachgebiet > Marke > Serien > Bilder, Daten in `src/data/catalog.json`:

- `/produkte/<bereich>`: Fachgebiete mit ihren Marken (z. B. `/produkte/bad`)
- `/produkte/<bereich>/<marke>`: Serien der Marke mit Galerie (z. B. `/produkte/bad/edone`)
- Megius und Novellini haben je eine Seite in Bad und in Wellness mit getrennten Serien.
- Alle 40 Seiten werden vorgerendert und stehen in der Sitemap (`scripts/routes.mjs`).

## Aktive Marken, Serien und Bilder

34 Marken, 40 Markenseiten. 21 Seiten mit Serienbildern (23 Serien, 25 Bilder), 15 Seiten ohne Bilder
(13 Marken ohne Bild, dazu Megius und Novellini im Bereich Bad).

| Bereich | Fachgebiet | Marke | Seite | Serien (Bilder) |
|---|---|---|---|---|
| Bad | Badmöbel | Rexa Design | `/produkte/bad/rexa` | — |
| Bad | Badmöbel | Edoné | `/produkte/bad/edone` | Hexis (1) |
| Bad | Badmöbel | Archeda | `/produkte/bad/archeda` | — |
| Bad | Badmöbel | Froidevaux AG | `/produkte/bad/froidevaux` | Auswahl aus dem Medienpaket (1) |
| Bad | Badmöbel | Pirovano Bagni | `/produkte/bad/pirovano` | — |
| Bad | Armaturen | Rubinetterie Treemme | `/produkte/bad/treemme` | — |
| Bad | Armaturen | Newform | `/produkte/bad/newform` | Deltazero (1) |
| Bad | Armaturen | Gessi | `/produkte/bad/gessi` | Jacqueline (1) |
| Bad | Armaturen | Luce Rubinetterie | `/produkte/bad/luce` | — |
| Bad | Sanitärkeramik | Ceramica Cielo | `/produkte/bad/cielo` | Le Giare (1) |
| Bad | Sanitärkeramik | Scarabeo Ceramiche | `/produkte/bad/scarabeo` | — |
| Bad | Sanitärkeramik | Ceramica Galassia | `/produkte/bad/galassia` | — |
| Bad | Sanitärkeramik | Azzurra Ceramica | `/produkte/bad/azzurra` | — |
| Bad | Duschen & Duschabtrennungen | Megius | `/produkte/bad/megius` | — |
| Bad | Duschen & Duschabtrennungen | Novellini | `/produkte/bad/novellini` | — |
| Bad | Duschen & Duschabtrennungen | Vismaravetro | `/produkte/bad/vismaravetro` | Suite (1) |
| Bad | Badaccessoires | Capannoli | `/produkte/bad/capannoli` | Tratto (1) |
| Bad | Designheizkörper | Antrax IT | `/produkte/bad/antrax` | Pypeline (1) |
| Bad | Designheizkörper | Cordivari Design | `/produkte/bad/cordivari` | Auswahl aus dem Medienpaket (1) |
| Bad | Designheizkörper | Caleido | `/produkte/bad/caleido` | — |
| Küchen | Küchenwelten | Febal Casa | `/produkte/kuechen/febal` | Origina (2) |
| Platten | Keramik, Feinsteinzeug & Grossformate | Energieker | `/produkte/platten/energieker` | — |
| Platten | Keramik, Feinsteinzeug & Grossformate | Emilgroup | `/produkte/platten/emilgroup` | Auswahl aus dem Medienpaket (1) |
| Platten | Keramik, Feinsteinzeug & Grossformate | La Fabbrica AVA | `/produkte/platten/lafabbrica` | Venezia (1) |
| Platten | Keramik, Feinsteinzeug & Grossformate | Supergres | `/produkte/platten/supergres` | — |
| Platten | Keramik, Feinsteinzeug & Grossformate | Ariana Ceramiche / Gardenia&Ariana | `/produkte/platten/ariana` | — |
| Platten | Keramik, Feinsteinzeug & Grossformate | Acquario Due | `/produkte/platten/acquario` | — |
| Platten | Mosaik | SICIS | `/produkte/platten/sicis` | Elegance (1) |
| Platten | Mosaik | Mosavit / Trip by Mosavit | `/produkte/platten/mosavit` | Fachaleta Quartz Marfil (1) |
| Platten | Parkett & Holz | Skema | `/produkte/platten/skema` | Villa (1) |
| Platten | SPC & Designböden | Déco | `/produkte/platten/deco` | Clap (1) |
| Platten | SPC & Designböden | Zenon Bath & SPC Surfaces | `/produkte/platten/zenon` | Tempo (1) |
| Platten | Dekorative Wandbeläge & Tapeten | Inkiostro Bianco | `/produkte/platten/inkiostro` | White Paper (1) |
| Wellness | Whirlpool & Minipool | Novellini | `/produkte/wellness/novellini` | Home Oasis (1), Moon (1), Fun (1) |
| Wellness | Whirlpool & Minipool | Albatros Wellness | `/produkte/wellness/albatros` | Soreha (1) |
| Wellness | Hammam & Dampfbad | Megius | `/produkte/wellness/megius` | Zen Combi (2) |

Seriennamen: aus Alt-Text bzw. Dateiname des Medienpakets. «Auswahl aus dem Medienpaket» heisst: Bild
ohne Serienangabe (Froidevaux, Cordivari, Emilgroup). Neue Serien und Bilder werden nur in
`catalog.json` ergänzt (Format siehe `$comment` dort).

## Nicht verwendet (Rechte nicht bestätigt)

- `src/assets/Rexa_mobili_moode_gallery_7.jpg` (Rexa), `src/assets/FebalCasa_…Origina…webp` (Febal)
- Farbmuster Rexa/Edoné in `public/badplaner/swatches/` (klein, Badplaner-Material)
- Armaturenbilder Treemme in `public/badplaner/armaturen/` (Badplaner-Material)

## Websites

Aus dem Quellenregister; aus der Arbeitsumgebung nicht online prüfbar (Netzwerkrichtlinie).

## Bildregeln

- Katalog und Galerie: `object-fit: contain`, Format 16:9 wie die Herstellerbilder, nichts beschnitten.
- Redaktionelle Projektbilder (Hero, Referenzen, Küche): `cover` mit gesetztem Fokuspunkt.
- Keine Vergrösserung über die Originalauflösung (geprüft bei 1440/1024/768/390 px).
