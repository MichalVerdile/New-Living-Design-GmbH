# PR 62 – Gestaltung V2: Startseite, Marken, Produkte

## Entscheid (vor der Umsetzung)

**Warum V1 unverändert wirkte.** V1 hat dieselbe Vorlage nur retuschiert: gleiche Abfolge
(50/50-Hero → vier gleich grosse Karten → Ausstellung → Referenzen → Badplaner → Umbau → Kontakt),
gleiche Proportionen, gleiche Bilder. Farben und Abstände wurden feiner, die Struktur blieb.
Marken kamen auf der Startseite gar nicht vor, auf /produkte nur als Bildunterschrift und auf
/partner als reine Textliste mit externen Links.

**Was V2 strukturell anders macht.**

1. *Hero:* kein Split mehr. Vollflächiges Foto einer realisierten Küche, darüber ein dunkles
   Typografie-Panel, das in den nächsten Abschnitt hineinragt. Die Kernzeile
   «Nicht einzeln ausgesucht. Als Raum gedacht.» ist die grösste Schrift der Seite.
2. *Vier Bereiche als Reise statt Kartenraster:* nummerierter Index, danach vier versetzte
   Bildgeschichten mit unterschiedlichen Formaten (breit, hoch, überlappend) und Bildnachweis
   der Marke, der direkt zur Marke führt.
3. *Marken auf der Startseite:* redaktioneller Markenindex (alle Marken nach Bereich, jede
   klickbar) mit Bildvorschau der Marken, die mehrere Bilder haben.
4. *Ausstellung:* das echte Ausstellungsbild steht jetzt dort, wo es hingehört (Abschnitt
   Ausstellung, dunkel), statt im Hero. /produkte bekommt ein anderes echtes Projektbild.
5. *Markenverzeichnis (/partner):* eine einzige Datenquelle (`src/data/suppliers.ts`) für
   Register, Fachgebiete und Bildzuordnung. Filter nach Bereich, Karten in drei Formen
   (Bildstapel bei mehreren Bildern, Einzelbild, typografisch ohne Bild). Klick öffnet ein
   Inline-Panel (natives `<details>`) mit allen Bildern der Marke, Bereich/Fachgebiet und
   offizieller Website. Funktioniert ohne JavaScript; Escape und «Schliessen» per Tastatur.
6. *Produkte:* jede Markenangabe ist ein Link ins Verzeichnis; pro Bereich eine vollständige
   Markenzeile.

## Bildregeln

- Nur lokale Dateien. Zugeordnet wird eine Marke nur, wenn das Medienpaket (Alt-Text aus
  `media-manifest.json`) sie nennt oder der Dateiname die Marke/Serie eindeutig trägt **und**
  das Bild bereits auf der Website veröffentlicht ist.
- Unveröffentlichte Dateien mit Markennamen (Rechte nicht bestätigt) werden nicht verwendet,
  sondern unten als offene Frage gelistet.
- Keine Logos ausser den bereits veröffentlichten Partnerlogos (Register-Hinweis: Logos erst
  mit freigegebenen Vektordateien).

## Abdeckung Marke → Bilder

41 Marken: 34 aus dem Quellenregister vom 22.09.2026 und 7 bisherige Logo-Partner.
22 mit lokaler Galerie (26 Bilder), 19 ohne Bilder (Detailansicht mit Fachgebiet und Website).

| Marke | Bereich / Fachgebiet | Bilder | Quelle |
|---|---|---|---|
| Rexa Design | Bad: Badmöbel | 0 | – (Kandidat `Rexa_mobili_moode_gallery_7.jpg`, unveröffentlicht) |
| Edoné | Bad: Badmöbel | 1 | Medienpaket `bad-hero-edone-hexis` |
| Archeda | Bad: Badmöbel | 0 | – |
| Froidevaux AG | Bad: Badmöbel | 1 | Medienpaket `bad-badmoebel-froidevaux-massarbeit` |
| Pirovano Bagni | Bad: Badmöbel | 0 | – |
| Rubinetterie Treemme | Bad: Armaturen | 0 | – |
| Newform | Bad: Armaturen | 1 | `Newform_Deltazero_P2.webp` (bereits auf /produkte) |
| Gessi | Bad: Armaturen | 1 | Medienpaket `bad-armaturen-gessi-jacqueline` |
| Luce Rubinetterie | Bad: Armaturen | 0 | – |
| Ceramica Cielo | Bad: Sanitärkeramik | 1 | Medienpaket `bad-sanitaerkeramik-cielo-le-giare` |
| Scarabeo Ceramiche | Bad: Sanitärkeramik | 0 | – (nur unveröffentlichte Logos) |
| Ceramica Galassia | Bad: Sanitärkeramik | 0 | – |
| Azzurra Ceramica | Bad: Sanitärkeramik | 0 | – |
| Megius | Bad: Duschen; Wellness: Hammam, Wellness-Duschen | 2 | Medienpaket `wellness-hammam-megius-zen-combi`; `Zen_Combi_duo_Linear_6` (Serie Zen Combi laut Manifest, bereits auf der Startseite) |
| Novellini | Bad: Duschen; Wellness: alle fünf Fachgebiete | 3 | Medienpaket `wellness-hero-novellini-home-oasis`, `wellness-whirlpool-novellini-moon`, `wellness-sauna-novellini-fun` |
| Vismaravetro | Bad: Duschen | 1 | Medienpaket `bad-duschen-vismaravetro-suite` |
| Capannoli | Bad: Badaccessoires | 1 | Medienpaket `bad-accessoires-capannoli-tratto` |
| Antrax IT | Bad: Designheizkörper | 1 | Medienpaket `bad-designheizkoerper-antrax-pypeline` |
| Cordivari Design | Bad: Designheizkörper | 1 | Medienpaket `bad-designheizkoerper-cordivari` |
| Caleido | Bad: Designheizkörper | 0 | – |
| Febal Casa | Küchen: Küchenwelten | 2 | Medienpaket `kuechen-hero-febal-origina`, `kuechen-card-febal-origina` (Kandidat `FebalCasa_…Origina…webp`, unveröffentlicht) |
| Energieker | Platten: Keramik & Grossformate | 0 | – |
| Emilgroup | Platten: Keramik & Grossformate | 1 | Medienpaket `platten-hero-emilgroup-feinsteinzeug` |
| La Fabbrica AVA | Platten: Keramik & Grossformate | 1 | Medienpaket `platten-grossformat-lafabbrica-venezia` |
| Supergres | Platten: Keramik & Grossformate | 0 | – |
| Ariana Ceramiche / Gardenia&Ariana | Platten: Keramik & Grossformate | 0 | – |
| Acquario Due | Platten: Keramik & Grossformate | 0 | – (nur unveröffentlichtes Logo) |
| SICIS | Platten: Mosaik | 1 | Medienpaket `platten-mosaik-sicis-elegance` |
| Mosavit / Trip by Mosavit | Platten: Naturstein | 1 | Medienpaket `platten-naturstein-mosavit-fachaleta-quartz-marfil` |
| Skema | Platten: Parkett & Holz | 1 | Medienpaket `platten-parkett-skema-villa` |
| Déco | Platten: Parkett & Holz, SPC | 1 | Medienpaket `platten-spc-deco-clap` |
| Zenon Bath & SPC Surfaces | Platten: SPC | 1 | Medienpaket `platten-spc-zenon-tempo` |
| Inkiostro Bianco | Platten: Wandbeläge | 1 | Medienpaket `platten-wandbelag-inkiostro-white-paper` |
| Albatros Wellness | Wellness: Whirlpool, Sauna, Badewannen | 1 | Medienpaket `wellness-whirlpool-albatros-soreha` |
| Dosem Ceramiche | Weitere Marken (kein Registerbereich) | 1 | `Dosem_Onyx_WhiteBlue…jpg` (bereits auf der Startseite) + Logo |
| Fima | Weitere Marken | 0 | Logo |
| Lavastone | Weitere Marken | 0 | Logo |
| Laminam | Weitere Marken | 0 | Logo (Kandidat `Laminam_Slate_02…jpg`, unveröffentlicht) |
| Naici | Weitere Marken | 0 | Logo |
| Roberto Cavalli Home Interiors | Weitere Marken | 0 | Logo |
| Tonino Lamborghini | Weitere Marken | 0 | Logo |

**Nicht zugeordnet** (Marke nicht belegbar, bleibt ohne Markennachweis): `PRIME_mobili_generale.webp`,
`Ambiente-Set-5.webp`, `Inediti_05_HP_desktop.webp`, `image.avif`, `BEAM_STICK_family_color_edited.avif`,
`viv-au2420bmset5_5.avif`, `ixycxivw.avif`, `Trinidad-A-AMB1-3.jpg.webp`, `22-Private-House-Club-Room.jpg.webp`,
`Deluxe_cover.jpg`, `devon-devon_CELINEPTWH_04.jpg` (Devon&Devon ist nicht im Register), Stockbilder.

## Offene Medienfragen an NLD

- Rechte für die unveröffentlichten Markendateien bestätigen (Rexa, Febal, Laminam), dann
  können sie in die Galerien.
- Für 19 Marken fehlen Bilder; am dringendsten Bad-Armaturen (Treemme, Luce), Sanitärkeramik
  (Scarabeo, Galassia, Azzurra) und Platten (Energieker, Supergres, Ariana, Acquario Due).
- Die drei 380×347-Bilder auf /produkte (Heizkörper, Leuchten, Accessoires) bleiben zu klein
  für Retina-Bildschirme.
