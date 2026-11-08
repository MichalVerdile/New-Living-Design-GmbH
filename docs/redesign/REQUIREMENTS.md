# Anforderungsabgleich – 08.11.2026

Grundlage: ursprünglicher Auftrag «Eingefügter Text(20261107-185028).txt» und die anschliessende Korrektur: Unternehmen vor Produktkatalog, klare Struktur, einheitlicher Stil auf allen Seiten, Apple-inspirierte Animationen und Schrift, keine Tests. Der neuere Auftrag ersetzt die ursprüngliche Forderung, Testläufe auszuführen.

**Status:** Im Quellcode umgesetzt oder aus der ersten Revision beibehalten. Dies ist eine Zuordnung zu Anforderungen, kein Test- oder Konformitätsnachweis. Die persönliche Abnahme steht aus.

| Anforderung | Umsetzung / Umfang | Abgrenzung |
|---|---|---|
| Unternehmen vorstellen | Startseite, Über uns, Leistungen, Ausstellung und Projektseiten erzählen Beratung, Planung und Umsetzung. | Keine erfundenen Mitarbeitenden, Zahlen oder Projektangaben. |
| Klare Orientierung | Fünf Hauptlinks, sichtbare Beratung, gegliederter Footer, lokale Navigation, Breadcrumbs und eindeutige Rückwege aus Marken/Serien. | Bestehende URLs bleiben bestehen. |
| Weniger Katalogcharakter | Unternehmensgeschichte und Arbeitsweise vor Produktinformationen; Marken im vertiefenden Bereich, Details aufklappbar. | Alle vier Fachbereiche und ihre Marken bleiben erreichbar. |
| Einheitlicher Stil auf ALLEN Seiten | Gemeinsame globale Tokens und Schrift; gemeinsame Intro-Komponente; sämtliche Seiten-Styles überarbeitet, inklusive Kategorien, 36 Markenseiten, Artikel, Rechtliches und 404 über die Artikelvorlage. Cookie-Oberflächen, WhatsApp und Galerien angeglichen. | Die 55 vorhandenen Routen sind in INVENTORY.md aufgelistet. Keine neue Seite muss die alte Serifengestaltung verwenden. |
| Apple-artige Typografie | Native Apple-Systemschrift, semibold Überschriften, klare Sans-Serif, ruhige Grössenhierarchie. | SF Pro ist nur auf entsprechend ausgestatteten Geräten verfügbar. Helvetica Neue/Arial sind der plattformabhängige Ersatz. Keine unerlaubte Webfont-Kopie. |
| Eigenständiges, nicht generisch wirkendes Design | Echte NLD-Projektfotos, bestehende Markenfarben, konkrete Unternehmenstexte, reduzierte Dekoration. | Der ästhetische Eindruck wird durch den Auftraggeber beurteilt. |
| Bestehende Bilder/Logo erhalten | Vorhandene Assets, Daten und Bildquellen unverändert. Neu angeordnete Bilder mit intrinsischen Abmessungen und responsiven Varianten, soweit vorhanden. | Zuschnitte betreffen nur die Darstellung; Hersteller-Galerien zeigen die vollständigen Bilder. Keine generierten/neu beschafften Ersatzbilder. |
| Markenidentität | Grün-, Papier-, Stein- und Messingtöne bleiben erhalten. Einheitliche Buttons, Fokus, Formularzustände und Abstände. | Keine Übernahme von Apple-Logo, -Produktbildern oder Webfont-Dateien. |
| Cinematischer Einstieg | Grosses echtes Projektfoto, einmaliger Hero-Zoom, gestaffelte Texte und sofort nutzbare Aktionen. | Kein Autoplay-Video und keine künstliche Wartezeit. |
| Scroll-Storytelling | SceneStory auf Startseite und Leistungen: Sticky-Medien, kontinuierliche Bildtransformation, Überblendungen, normale native Scrollposition. | Kein Scroll-Hijacking. Kleine Bildschirme/reduzierte Bewegung zeigen die reguläre Abfolge. |
| Bewegung auf Unterseiten | PageExperience auf allen Routen, Text-/Bild-Reveals, Stagger und Parallaxe bei geeigneten Bildflächen. | Dokumente und Formulare bleiben auf Lesen/Bedienen ausgerichtet. Nicht jedes Element erhält denselben Effekt. |
| Motion-Performance | IntersectionObserver begrenzt Arbeit auf sichtbare Bereiche; requestAnimationFrame bündelt Layoutlesen und Stiländerungen; überwiegend opacity/transform, Cleanup. | Reale Bildrate, LCP, INP und CLS wurden in dieser Revision nicht gemessen. |
| Reduzierte Bewegung / ohne JS | Systempräferenz beendet Animationen; Basisausgabe bleibt sichtbar; statisches HTML/SSR-Verfahren erhalten. | Kein aktueller Browser- oder Buildlauf. |
| Homepage-Inhalte | Unternehmen, Arbeitsweise, Projekte, vier Fachbereiche, Badumbau, Badplaner, Partner und Ausstellung kontextuell verbunden. | Preise/Markenlisten sind bewusst auf den entsprechenden Unterseiten statt auf der Startseite. |
| Inspiration & Kategorien | Vier Fachbereiche, übersichtliche Themen, Beratung zuerst, Materialdetails und vollständige Markenverknüpfungen. | Vorhandene alte Unterthemen-Anker werden beim Aufruf geöffnet. |
| Alle Marken und Serien | Gemeinsame Kategorie-/Markenvorlage, Bildgalerien, offizielle Herstellerlinks, Rückwege, Beratung. | Keine Marke oder Serie aus der Datenbasis entfernt. |
| Galerie | Bestehende Lightbox mit Pfeilen, Tastatur, Escape, Fokus-Rückgabe, Swipe, Zoom, Bildzähler und Fehlerzustand bleibt. | Keine erneuten Interaktionstests. |
| Referenzen | Echte Projekte, Filter, Projekttexte und Materialdetails aus den unveränderten Daten, grosse Bilder und Anfrageweg pro Projekt. | Keine erfundenen Referenzen oder Kundenbewertungen. |
| Dienstleistungen | Beratung → Planung/Offerte → Lieferung/Umsetzung; eigener visueller Ablauf und klarer nächster Schritt. | Leistungsumfang weiterhin projektabhängig vereinbart. |
| Badumbau & Pakete | Ablauf vor Preisen, Essenza/Colore/Atelier aus der unveränderten Geschäftskonfiguration, Vergleich und Anfragemöglichkeit. | Preise, Leistungslisten, Voraussetzungen und Zusatzkosten bleiben erhalten. |
| Badplaner | Vorhandene Schritte, Auswahl, Upload, Fortschritt, Status, Ergebnis und Datenschutz-Hinweise erhalten; Stil vereinheitlicht. | Kein API-, Modell-, Limit-, Retry-, Kosten- oder Datenflusswechsel; keine kostenpflichtige Generierung ausgelöst. |
| Über uns | Bestehende Unternehmensgeschichte, 2023-Angabe, Arbeitsweise, Emanuel Verdile und Ausstellung. | Keine neuen Teammitglieder, Bewertungen oder Zertifikate. |
| Kontakt & Termin | Bestehende Formulare, Validierung, Datenerhalt, Doppelklickschutz und Erfolgs-/Fehlerzustände; klare Anfrage statt bestätigter Reservation. | Formspree-Endpunkt unverändert. Keine Testnachricht gesendet. |
| Blog & Artikel | Übersicht ruhig, Artikel mit lesbarer Breite, TOC, responsive Tabellen, Metadaten und vorhandenen Inhalten. | Artikeldateien und fachliche Aussagen unverändert. |
| Rechtliches | Gemeinsame lesbare Dokumentgestaltung; Impressum, Datenschutz und AGB nicht inhaltlich umgeschrieben. | Bereits bekannte fachliche Widersprüche bleiben im REPORT.md dokumentiert; keine erfundene Rechtsfreigabe. |
| ISO 9241-110: Aufgabenangemessenheit | Unternehmens-/Leistungswege und passend zugeordnete nächste Schritte. | Keine ISO-Zertifizierung. |
| Selbstbeschreibungsfähigkeit | Deutliche Seitentitel, Links, Formularlabels, Planerschritte und Statusmeldungen. | Fachliche und nutzerbasierte Abnahme offen. |
| Erwartungskonformität | Gleiche Navigation, Typografie, Buttons, Galerie- und Formularmuster. | Keine automatische Konformitätsbehauptung. |
| Erlernbarkeit | Wenige primäre Bereiche, vertiefende Details, schrittweiser Planer. | Keine neue Usability-Studie. |
| Steuerbarkeit | Native Scrollposition, Tastaturbedienung, Escape, reduzierte Bewegung, unveränderte Rückwege. | Keine neue Prüfung auf physischen Geräten. |
| Fehlerrobustheit | Bestehende Eingabeprüfung, Fehlertexte, Datenerhalt, Bildfehlerbehandlung und Doppelklickschutz. | Bestehende Testergebnisse gelten nur für den früheren Stand. |
| Benutzerbindung | Persönliche Unternehmensdarstellung, echte Referenzen, gezielte hochwertige Bewegung. | Subjektive Designfreigabe offen. |
| ISO 9241-210/-115 und WCAG | Semantik, Labels, Fokus, native Details/Dialoge, reduzierte Bewegung und vorhandene barrierearme Komponenten berücksichtigt. | Ohne vollständige Evaluation keine Konformitäts- oder Zertifizierungszusage. |
| Responsive Darstellung | Fluide Typografie/Abstände, mobile Navigation, abgestufte Raster, vertikale Stories, scrollbare Galerien/Tabellen. | Keine aktuellen Tests für die ursprünglich genannten 320–1920 px, Zoom oder Querformat. |
| Performance | Keine neue Produktionsabhängigkeit, Systemfonts ohne Netzdownload, vorhandenes Lazy Loading/Code Splitting/SSR erhalten. | Keine neuen Messwerte; ursprüngliche Zielwerte sind noch abzunehmen. |
| SEO | URLs, Sitemap-/robots-Verfahren und 404-Verhalten erhalten; individuelle Seitentitel, Beschreibungen, H1, Canonicals, Breadcrumbs und vorhandene Daten. | Aktuelle Auslieferung/Indexierung nicht getestet. |
| Technik & Sicherheit | Bestehendes React/Vite-Projekt; keine API-/Server-/Daten-/Secret-Änderung. | Keine neue Dienstintegration oder Kostenfreigabe nötig. |
| Branch / Veröffentlichung | Bestehender separater Branch und Draft-PR #69 werden aktualisiert. | Kein Merge nach main, keine ausdrückliche Produktionseinführung. Eine vorhandene Preview-Automation liegt bei GitHub/Vercel. |
| Keine Tests | Für diese Revision keine Tests, kein Build, kein Lint, keine Website-Vorschau oder automatische Qualitätsläufe ausgeführt. | Quellcode und Übertragung werden gelesen/abgeglichen; dies ersetzt keine Abnahme. |

Referenz für Gestaltung: https://www.apple.com/chde/ipad-pro/ . Schriftquelle und Lizenzhinweise: https://developer.apple.com/fonts/ . Es wurden keine Apple-Assets übernommen.
