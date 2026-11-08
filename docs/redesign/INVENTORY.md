# Seiteninventar und Ausgangslage

Stand: 07.11.2026. Basis-Commit: `5798dc701aea85c5e9cc3e95687f78406e82e441`.

55 Routen: 14 feste Seiten, 4 Bereiche, 36 Markenseiten (34 unterschiedliche Marken, manche in mehreren Bereichen) und 1 Blogartikel. Zusätzlich eine echte statische `404.html` für den bestehenden Vercel-Betrieb. Verbindliche Routenquelle bleibt `scripts/routes.mjs` mit `routes.json` und den Markdown-Artikeln.

React 18, TypeScript, React Router 7, Vite 7, CSS Modules und statisches Prerendering. Gemeinsam: Header, Footer, SEOHead, CookieBanner, WhatsAppButton, Tracking nach bestehender Consent-Logik. Inhalte: `src/data/catalog.json`, `suppliers.ts`, `references.ts`, `badplaner.ts`, `src/config/business.ts`, `src/content/blog/`.

## Festgestellte Probleme

- Uneinheitliche Gestaltung: ruhige Grün-/Steintöne auf Katalogseiten, starke Grauverläufe, Schatten und abgerundete Karten auf anderen Seiten.
- Startseite: zentrale Beratung erst spät im ersten Desktop-Bildschirm; schwache Verbindung zwischen Unternehmenspositionierung, Produktauswahl und Umsetzung.
- Kontakt: `noValidate` ohne eigene Pflichtfeldprüfung, Labels ohne Feldzuordnung und keine zuverlässige Inline-Rückmeldung.
- Referenz-Lightbox: eigener Overlay-Container ohne native Fokusbegrenzung und Wiederherstellung. Herstellergalerien ohne Vollbildansicht.
- Buchungsseite: vier fest nebeneinander stehende Bilder auf mobilen Geräten; tatsächlich Kontaktanfrage, kein Terminreservierungssystem.
- Badplaner: komplexe Ausstattungsauswahl, unvollständige Orientierung und pauschal sanftes Scrollen trotz reduzierter Bewegung.
- Hauptbundle lud über Barrel-Imports auch schwere Unterseiten, darunter den Badplaner.
- Prerender-Fehler wurden protokolliert, liessen den Build aber erfolgreich enden; damit konnten leere SPA-Fallbacks unbemerkt veröffentlicht werden.
- Rechtliche Texte enthalten widersprüchliche Hosting-Angaben, einen alten ODR-Verweis und einen Nummerierungssprung in den AGB. Inhaltliche Korrekturen benötigen Sachprüfung.

## Abhängigkeiten pro Route

| Route | Seitenvorlage und besondere Abhängigkeiten |
|---|---|
| `/` | Home |
| `/badumbau-zofingen` | Badumbau + business + FAQ |
| `/referenzen` | Referenzen + ImageLightbox |
| `/badplaner` | Badplaner + bestehende Daten-/API-Helfer |
| `/blog` | blog |
| `/produkte` | Products + SupplierDirectory |
| `/dienstleistungen` | dienstleistungen |
| `/partner` | Partners + SupplierDirectory |
| `/booking` | Booking + Kontaktlinks |
| `/ueber-uns` | ueber-uns |
| `/kontakt` | Contact + Formspree |
| `/datenschutz` | DataSecurity + CookieSettings |
| `/impressum` | impressum |
| `/agb` | agb |
| `/produkte/bad` | CategoryPage + SupplierDirectory |
| `/produkte/bad/rexa` | SupplierPage + Gallery + ImageLightbox |
| `/produkte/bad/edone` | SupplierPage + Gallery + ImageLightbox |
| `/produkte/bad/archeda` | SupplierPage + Gallery + ImageLightbox |
| `/produkte/bad/froidevaux` | SupplierPage + Gallery + ImageLightbox |
| `/produkte/bad/pirovano` | SupplierPage + Gallery + ImageLightbox |
| `/produkte/bad/treemme` | SupplierPage + Gallery + ImageLightbox |
| `/produkte/bad/newform` | SupplierPage + Gallery + ImageLightbox |
| `/produkte/bad/gessi` | SupplierPage + Gallery + ImageLightbox |
| `/produkte/bad/luce` | SupplierPage + Gallery + ImageLightbox |
| `/produkte/bad/cielo` | SupplierPage + Gallery + ImageLightbox |
| `/produkte/bad/scarabeo` | SupplierPage + Gallery + ImageLightbox |
| `/produkte/bad/galassia` | SupplierPage + Gallery + ImageLightbox |
| `/produkte/bad/azzurra` | SupplierPage + Gallery + ImageLightbox |
| `/produkte/bad/megius` | SupplierPage + Gallery + ImageLightbox |
| `/produkte/bad/novellini` | SupplierPage + Gallery + ImageLightbox |
| `/produkte/bad/vismaravetro` | SupplierPage + Gallery + ImageLightbox |
| `/produkte/bad/capannoli` | SupplierPage + Gallery + ImageLightbox |
| `/produkte/bad/antrax` | SupplierPage + Gallery + ImageLightbox |
| `/produkte/bad/cordivari` | SupplierPage + Gallery + ImageLightbox |
| `/produkte/bad/caleido` | SupplierPage + Gallery + ImageLightbox |
| `/produkte/kuechen` | CategoryPage + SupplierDirectory |
| `/produkte/kuechen/febal` | SupplierPage + Gallery + ImageLightbox |
| `/produkte/platten` | CategoryPage + SupplierDirectory |
| `/produkte/platten/energieker` | SupplierPage + Gallery + ImageLightbox |
| `/produkte/platten/emilgroup` | SupplierPage + Gallery + ImageLightbox |
| `/produkte/platten/lafabbrica` | SupplierPage + Gallery + ImageLightbox |
| `/produkte/platten/supergres` | SupplierPage + Gallery + ImageLightbox |
| `/produkte/platten/ariana` | SupplierPage + Gallery + ImageLightbox |
| `/produkte/platten/acquario` | SupplierPage + Gallery + ImageLightbox |
| `/produkte/platten/sicis` | SupplierPage + Gallery + ImageLightbox |
| `/produkte/platten/mosavit` | SupplierPage + Gallery + ImageLightbox |
| `/produkte/platten/skema` | SupplierPage + Gallery + ImageLightbox |
| `/produkte/platten/deco` | SupplierPage + Gallery + ImageLightbox |
| `/produkte/platten/zenon` | SupplierPage + Gallery + ImageLightbox |
| `/produkte/platten/inkiostro` | SupplierPage + Gallery + ImageLightbox |
| `/produkte/wellness` | CategoryPage + SupplierDirectory |
| `/produkte/wellness/novellini` | SupplierPage + Gallery + ImageLightbox |
| `/produkte/wellness/albatros` | SupplierPage + Gallery + ImageLightbox |
| `/produkte/wellness/megius` | SupplierPage + Gallery + ImageLightbox |
| `/blog/badumbau-steuern-abziehen-bis-2028` | BlogPost + Markdown + TableOfContents |

## Schutz bestehender Daten

879 versionierte Dateien in `public/`, `src/assets/`, `api/`, `src/data/`, `src/config/` und `src/content/` wurden gegen die Basis geprüft. Keine davon wurde geändert oder entfernt. Logo, Produkt-/Referenzbilder, Herstellerdaten, Artikel, Unternehmensdaten, Richtpreise und API-Verarbeitung bleiben erhalten. Die drei rechtlichen TSX-Seiten sind inhaltlich unverändert; lediglich ihre Styles und die separat eingebundene Cookie-Einstellungskomponente wurden verbessert.

Das bestehende Build-Skript lädt fehlende Lieferanten-Swatches lokal nach. Diese automatisch erzeugten Dateien gehören nicht zum Redesign-Commit. Quellen, Download-Verhalten und Fallbacks wurden nicht verändert.
