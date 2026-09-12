# Blog: neuer Artikel

Ein Artikel = eine Markdown-Datei in `src/content/blog/<slug>.md`.
Der Dateiname ist die Adresse: `badumbau-kosten-aargau.md` → `https://newlivingdesign.ch/blog/badumbau-kosten-aargau`.
Sonst ist nichts zu tun: Route, Übersicht, Startseite, Sitemap und statisches HTML entstehen beim Build (`scripts/routes.mjs`, `src/lib/blog.ts`).

## Kopf der Datei

```
---
title: Überschrift des Artikels (H1, auch Titel bei Google)
seoTitle: kürzere Variante für den Browser-Tab (optional, max. ca. 40 Zeichen)
description: Ein bis zwei Sätze. Erscheint bei Google und in der Übersicht.
date: 2026-09-14
updated: 2026-10-01          (optional, letzte Änderung)
image: /referenzen/bad-marmor-beige-01.webp
imageAlt: Was auf dem Bild zu sehen ist
category: Kosten             (Steuern, Kosten, Material, Referenz ...)
keywords: Badumbau Kosten, Badumbau Aargau
draft: true                  (optional: Artikel bleibt unsichtbar)
---
```

## Text

Normales Markdown, ohne weitere Werkzeuge:

- `## Zwischentitel` und `### Untertitel`
- `**fett**`, `*kursiv*`
- `[Link](/badumbau-zofingen)` für Seiten der Website, `[Link](https://...)` für externe Seiten (öffnen in neuem Tab)
- `- Punkt` oder `1. Punkt` für Listen
- `> Text` für einen grauen Hinweis-Kasten
- `![Bildbeschreibung](/referenzen/foto.webp "Bildunterschrift")` für ein Foto, allein auf einer Zeile
- Tabellen mit `| Spalte | Spalte |`, zweite Zeile `|---|---|`

Fotos kommen aus `public/referenzen/` (WebP, 1600 px). Neue Fotos zuerst dort ablegen.

Unter jedem Artikel stehen automatisch der Kontakt-Kasten (Telefon, WhatsApp), die drei Badpakete aus `src/config/business.ts` und die weiteren Beiträge.

## Schreibregeln

Deutsch (Schweiz): `ss` statt `ß`, Preise mit Apostroph (`21'300`). 500 bis 900 Wörter. Titel so, wie jemand bei Google sucht. Konkrete Wörter, Sätze unterschiedlicher Länge, keine Floskeln.
