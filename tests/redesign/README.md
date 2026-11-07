# Reproduzierbare Redesign-Prüfung

1. `npm ci`
2. `npm run lint && npm test && npm run typecheck:api && npm run check:catalog`
3. `npm run build && npm run check:redesign`
4. `npm run dev` und lokal `/tests/redesign/index.html` öffnen. In verwalteten Umgebungen den dort vorgesehenen Preview-Befehl verwenden.
5. «Seiten und Breiten prüfen» prüft alle 55 Routen auf 320, 375, 390, 430, 768, 1024, 1280, 1440 und 1920 CSS-Pixeln sowie 844×390 (Querformat) und 640×450 (Reflow entsprechend einer halbierten Desktopbreite). Mit «Nur gewählte Seite» lässt sich eine einzelne Korrektur nachprüfen.
6. «Interaktionen prüfen» prüft Pflichtfelder, E-Mail, HTTP-Fehler, Datenerhalt, Erfolg, Doppelklick-Schutz, Referenz-Lightbox, Fokus und gesperrte Badplaner-Schritte. `fetch` wird im Formular-Test durch lokale Antworten ersetzt. Keine E-Mail oder KI-Generierung wird ausgelöst.

Die vollständigen JSON-Ergebnisse stehen im Ergebnisfeld. Die geprüfte Fassung liegt unter `docs/redesign/`. Die Testseite und axe-core werden nicht in den Produktions-Build eingebunden; axe-core ist nur eine Entwicklungsabhängigkeit.

## Grenzen und manuelle Ergänzung

Der Rahmen simuliert CSS-Viewports, kein echtes Smartphone. Browser im Hintergrund können Animationen drosseln. Für die Kontrastmessung werden deshalb endliche Animationen gezielt bis zu ihrem Endzustand abgespielt. Der eigentliche Animationsablauf wird zusätzlich im sichtbaren Browser geprüft. axe prüft WCAG-2-A/AA-, WCAG-2.1-AA- und WCAG-2.2-AA-Regeln; `incomplete` ist ausdrücklich kein bestandener manueller Test.

Zusätzlich manuell: Menü mit Enter/Escape, Tab-Reihenfolge und sichtbarer Fokus; Lightbox mit Pfeilen/Escape/Zoom; Filter; Paketvergleich und Vorauswahl; Badplaner Raum/Paket/Ausstattung/Fotoschritt, Zustandsbeibehaltung und Datenschutztext. Auf echten Geräten noch Touch/Pinch, Safari/Firefox, Screenreader, OS-Einstellung «Bewegung reduzieren» und Browser-Zoom prüfen. Die CSS-Reflow-Simulation ersetzt keinen echten Zoomtest.

Für einen Live-End-to-End-Test von Formspree, Resend und Gemini müssen freigegebene Testdaten und die vorhandene Serverkonfiguration verwendet werden. Solche Tests senden tatsächlich Nachrichten bzw. verbrauchen KI-Kontingent und sind im lokalen Test bewusst nicht enthalten.
