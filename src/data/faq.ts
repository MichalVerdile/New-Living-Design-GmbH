import { bathPackages, business } from '../config/business';

export interface FaqItem {
  question: string;
  answer: string;
}

const [essenza, colore, atelier] = bathPackages;
const orte = business.areaServed;

/** Häufige Fragen zum Badumbau (Text auch für FAQPage-Schema) */
export const badumbauFaq: FaqItem[] = [
  {
    question: 'Was kostet ein Badumbau in der Region Zofingen?',
    answer: `Ein komplettes Bad von 6 bis 8 m² kostet bei uns zwischen CHF ${essenza.priceLabel} und CHF ${atelier.priceLabel}, inklusive Material, Montage und MwSt. Unsere drei Badpakete zeigen den Preis von Anfang an: Essenza ab CHF ${essenza.priceLabel}, Colore ab CHF ${colore.priceLabel}, Atelier ab CHF ${atelier.priceLabel}. Den Fixpreis erhalten Sie nach der Besichtigung vor Ort.`,
  },
  {
    question: 'Wie lange dauert ein kompletter Badumbau?',
    answer: `Von der Demontage bis zur Übergabe rechnen wir mit ${essenza.duration} für ein Standardbad und ${atelier.duration} für ein Bad nach Mass. Vorher braucht es 4 bis 8 Wochen für Planung, Produktwahl und Lieferung. Den Termin legen wir gemeinsam fest und halten ihn.`,
  },
  {
    question: 'Kann ich das Bad während des Umbaus benutzen?',
    answer: 'Während der Bauzeit ist das Bad nicht benutzbar. Wenn Sie ein zweites WC oder eine zweite Dusche haben, spüren Sie den Umbau kaum. Sonst planen wir mit Ihnen eine Zwischenlösung, zum Beispiel ein provisorisches WC. Wir arbeiten in einem Zug, ohne Pausen zwischen den Handwerkern.',
  },
  {
    question: 'Übernehmen Sie auch Sanitär, Elektro und Plattenarbeiten, oder brauche ich eigene Handwerker?',
    answer: 'Sie brauchen keine eigenen Handwerker. Wir führen den Badumbau komplett aus: Demontage, Sanitär, Elektro, Gipser, Plattenleger, Maler, Montage und Entsorgung. Sie haben vom ersten Termin bis zur Übergabe einen einzigen Ansprechpartner.',
  },
  {
    question: 'Was ist im Badpaket enthalten und was nicht?',
    answer: 'Enthalten sind alle Produkte (Platten, WC, Waschtisch, Möbel, Spiegel, Dusche, Armaturen, Zubehör), alle Arbeiten und die Entsorgung, für ein Bad von 6 bis 8 m² mit rund 21 m² Plattenfläche. Nicht enthalten sind das Versetzen von Wänden oder Abwasserleitungen ausserhalb des Bades, Asbestsanierung und Arbeiten an der Statik. Grössere Bäder rechnen wir pro zusätzlichem Quadratmeter Platten ab.',
  },
  {
    question: 'Kann ich Farben, Platten und Armaturen selbst wählen?',
    answer: 'Ja, und das ist der Kern unserer Pakete: Innerhalb der Serie wählen Sie Farbe und Oberfläche der Platten, farbige Waschtische und WCs, Armaturen in Schwarz, Gold oder gebürstet und die Lackfarbe des Möbels ohne Aufpreis. Sie sehen alles in unserer Ausstellung in Zofingen und erhalten vor der Unterschrift ein 3D-Rendering in Ihrer Farbwahl.',
  },
  {
    question: 'Kann ich den Badumbau von den Steuern abziehen?',
    answer: 'Werterhaltende Unterhaltsarbeiten wie ein Badumbau sind in der Schweiz heute von den Einkommenssteuern abziehbar. Mit der Abschaffung des Eigenmietwerts per 1. Januar 2029 fällt dieser Abzug weg; für die Steuerjahre 2026 bis 2028 gilt er noch. Massgebend ist die Praxis Ihres Kantons und Ihre persönliche Situation. Wir liefern die Rechnung mit getrennten Positionen für Unterhalt und wertvermehrende Arbeiten; die steuerliche Beurteilung macht Ihr Treuhänder oder die Steuerbehörde.',
  },
  {
    question: 'In welchen Gemeinden arbeiten Sie?',
    answer: `Wir arbeiten im Umkreis von rund 40 km um unsere Ausstellung in Zofingen: ${orte.join(', ')} und Umgebung. Die Besichtigung vor Ort ist in diesem Gebiet kostenlos.`,
  },
];
