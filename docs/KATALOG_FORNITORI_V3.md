# Katalog Lieferanten V3 (Stand 23.09.2026)

Verbindliche Liste aktiver Marken: Angabe von NLD im Chat vom 23.09.2026.
Umgesetzt in `src/data/suppliers.ts` (einzige Quelle für Startseite, /produkte und /partner).

## Entfernt (nicht mehr geführt)

Fima, Naici, Roberto Cavalli Home Interiors, Lavastone, Dosem Ceramiche, Laminam, Tonino Lamborghini.
Nur aus Code und Seiten entfernt; alle Dateien (Logos, `Dosem_Onyx…jpg`) bleiben in `src/assets/`.

## Aktive Marken und Bildabdeckung

34 Marken, 21 mit Galerie (25 Bilder), 13 ohne freigegebenes Bild.

| Marke | Kategorie (NLD-Liste) | Bilder | Quelle |
|---|---|---|---|
| Rexa Design | Badmöbel | 0 | fehlt |
| Edoné | Badmöbel | 1 | Medienpaket |
| Archeda | Badmöbel | 0 | fehlt |
| Froidevaux AG | Badmöbel | 1 | Medienpaket |
| Pirovano Bagni | Badmöbel | 0 | fehlt |
| Rubinetterie Treemme | Armaturen | 0 | fehlt |
| Newform | Armaturen | 1 | `Newform_Deltazero_P2.webp` (bereits veröffentlicht) |
| Gessi | Armaturen | 1 | Medienpaket |
| Luce Rubinetterie | Armaturen | 0 | fehlt |
| Ceramica Cielo | Sanitärkeramik | 1 | Medienpaket |
| Scarabeo Ceramiche | Sanitärkeramik | 0 | fehlt |
| Ceramica Galassia | Sanitärkeramik | 0 | fehlt |
| Azzurra Ceramica | Sanitärkeramik | 0 | fehlt |
| Megius | Duschen; Wellness | 2 | Medienpaket + `Zen_Combi_duo_Linear_6` (Serie laut Manifest) |
| Novellini | Duschen; Wellness | 3 | Medienpaket |
| Vismaravetro | Duschen | 1 | Medienpaket |
| Capannoli | Badaccessoires | 1 | Medienpaket |
| Antrax IT | Designheizkörper | 1 | Medienpaket |
| Cordivari Design | Designheizkörper | 1 | Medienpaket |
| Caleido | Designheizkörper | 0 | fehlt |
| Febal Casa | Küchen | 2 | Medienpaket |
| Energieker | Keramik, Feinsteinzeug & Grossformate | 0 | fehlt |
| Emilgroup | Keramik, Feinsteinzeug & Grossformate | 1 | Medienpaket |
| La Fabbrica AVA | Keramik, Feinsteinzeug & Grossformate | 1 | Medienpaket |
| Supergres | Keramik, Feinsteinzeug & Grossformate | 0 | fehlt |
| Ariana Ceramiche / Gardenia&Ariana | Keramik, Feinsteinzeug & Grossformate | 0 | fehlt |
| Acquario Due | Keramik, Feinsteinzeug & Grossformate | 0 | fehlt |
| SICIS | Mosaik | 1 | Medienpaket |
| Mosavit / Trip by Mosavit | Mosaik | 1 | Medienpaket |
| Skema | Parkett & Holz | 1 | Medienpaket |
| Déco | SPC & Designböden | 1 | Medienpaket |
| Zenon Bath & SPC Surfaces | SPC & Designböden | 1 | Medienpaket |
| Inkiostro Bianco | Dekorative Wandbeläge & Tapeten | 1 | Medienpaket |
| Albatros Wellness | Wellness | 1 | Medienpaket |

Wellness-Fachgebiete je Marke (Whirlpool, Sauna, Hammam, Wellness-Duschen, Badewannen) aus dem
Quellenregister des Medienpakets vom 22.09.2026.

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
