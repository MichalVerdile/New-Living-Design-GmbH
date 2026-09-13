/**
 * Badplaner-API (Vercel Serverless Function, Node-Runtime).
 *
 * POST /api/badplaner mit JSON-Body:
 *   kind: 'render'     Foto + Ausstattung -> Ideenbild (Gemini); Lead-Mail an NLD,
 *                      Kundenmail mit dem Ideenbild, auf Wunsch Newsletter-Eintrag
 *   kind: 'grundriss'  Grundriss/m²/Bemerkung zu einem bestehenden Lead per E-Mail
 *
 * Ablauf bei kind: 'render'
 *   1. Felder prüfen (Feldnamen nach Kapitel 10 der Spezifikation). Pflicht sind nur
 *      paket, foto, windows, name, email, telefon und consent. Jede fehlende oder
 *      unbekannte Detailwahl fällt auf die erste Option der jeweiligen Liste zurück,
 *      nie auf einen Fehler. Die alten Feldnamen (package, tile, furniture, phone,
 *      photo{mime,data} …) werden weiterhin akzeptiert.
 *   2. Grenzen prüfen: Cookie 3 Ideenbilder pro Gerät und Tag, 6 pro IP, Tagesdeckel.
 *   3. Musterbild der Wandplatte laden, Prompt bauen, Ideenbild bei Gemini erzeugen.
 *   4. Fensterprüfung; wenn das Modell eine Öffnung dazuerfunden hat, ein zweiter Versuch.
 *   5. Lead-Mail an NLD (Foto und Ideenbild im Anhang), sonst Formspree ohne Bilder.
 *   6. Kundenmail mit dem Ideenbild (customerMail()). Fehler dort blockieren nie die Antwort.
 *   7. Newsletter-Eintrag bei Resend, wenn die Checkbox angehakt war.
 *
 * Umgebungsvariablen (Vercel > Settings > Environment Variables):
 *   GEMINI_API_KEY       Pflicht. API-Schlüssel von Google AI Studio (Bildmodell).
 *   RESEND_API_KEY       E-Mail-Versand mit Anhängen über Resend. Fehlt er oder
 *                        schlägt der Versand fehl, geht der Lead ohne Bilder an
 *                        Formspree; die Kundenmail entfällt dann ersatzlos.
 *   RESEND_AUDIENCE_ID   Audience bei Resend für den Newsletter. Ohne diese Variable
 *                        wird die Einwilligung nur im Lead-Mail vermerkt.
 *   BADPLANER_TO         Empfänger (Default diego.verdile@newlivingdesign.ch)
 *   BADPLANER_CC         Kopie (Default emanuel.verdile@newlivingdesign.ch)
 *   BADPLANER_FROM       Absender für Lead- und Kundenmail (Default
 *                        "Badplaner <badplaner@newlivingdesign.ch>",
 *                        Domain muss bei Resend verifiziert sein)
 *   BADPLANER_DAILY_CAP  Maximale Ideenbilder pro Tag insgesamt (Default 60)
 *   BADPLANER_MODEL      Gemini-Modell (Default gemini-3.1-flash-image)
 *   BADPLANER_CHECK_MODEL Gemini-Textmodell für die Fensterprüfung (Default gemini-3.6-flash);
 *                        leer lassen = keine Prüfung
 *
 * Fotos und Ideenbilder werden NICHT gespeichert (kein Blob, kein KV): sie gehen
 * nur an Google zur Bilderzeugung und per E-Mail an uns und an den Kunden.
 * Siehe /datenschutz#badplaner.
 */
/* eslint-disable @typescript-eslint/no-explicit-any -- keine @vercel/node-Typen im Projekt, req/res sind deshalb any */
import { optionsForPackage, type AccentPlacementId, type PackageId } from '../src/data/badplaner.js';
import { business, bathPackages, individualPackage, packageNote, type BathPackage } from '../src/config/business.js';

// Node-Globals ohne @types/node (api/tsconfig.json ist auf Edge ausgelegt)
declare const process: any;
declare const Buffer: any;

export const config = { maxDuration: 120 };

/* ---------- Grenzen ---------- */

const MAX_PHOTO_BASE64 = 2.5 * 1024 * 1024;   // Foto (base64-Zeichen)
const MAX_FILE_BASE64 = 4 * 1024 * 1024;      // Grundriss (base64-Zeichen)
const PER_DEVICE_PER_DAY = 3;                 // Cookie nldbp
const PER_IP_PER_DAY = 6;                     // In-Memory
const GEMINI_TIMEOUT_MS = 50000;
const CHECK_TIMEOUT_MS = 20000;
const COOKIE_NAME = 'nldbp';

/*
 * Zähler pro IP und global liegen nur im Speicher der laufenden Funktionsinstanz.
 * Vercel startet Instanzen jederzeit neu, daher ist das nur "best effort" gegen
 * Missbrauch. Die harte Grenze ist die Ausgabenobergrenze (Budget) im Google-Konto.
 */
const ipCounter = new Map<string, { date: string; count: number }>();
const globalCounter = { date: '', count: 0 };

/**
 * Die Seite schickt für die Akzentfläche die kurzen Werte 'waschtisch' und 'dusche'
 * (Kapitel 10), die Katalog-Ids heissen 'waschtischwand' und 'duschnische'.
 * Beide Schreibweisen sind gültig; alles andere wird protokolliert.
 */
const PLACEMENT_ALIAS: Record<string, AccentPlacementId> = {
  waschtisch: 'waschtischwand',
  waschtischwand: 'waschtischwand',
  dusche: 'duschnische',
  duschnische: 'duschnische',
};

/* ---------- Typen ---------- */

/** Feldnamen nach Kapitel 10 der Spezifikation, dazu die alten Namen als Fallback. */
interface RenderBody {
  kind: 'render';
  paket?: string;
  package?: string;             // alt
  individuell?: boolean;
  format?: string;
  look?: string;
  platte?: string;
  tile?: string;                // alt
  boden?: string;
  kombination?: string;
  akzentFlaeche?: string;       // 'waschtisch' | 'dusche'
  akzent?: string;
  top?: string;
  unterbau?: string;
  furniture?: string;           // alt
  becken?: string;
  armaturenserie?: string;
  finish?: string;
  keramik?: string;
  sanitary?: string;            // alt
  wall?: string;
  dusche?: string;
  shower?: string;              // alt
  waschtisch?: string;
  basin?: string;               // alt
  spiegel?: string;
  mirror?: string;              // alt
  windows?: string;
  foto?: string;                // data-URL
  photo?: { mime: string; data: string };   // alt
  name?: string;
  email?: string;
  telefon?: string;
  phone?: string;               // alt
  place?: string;
  newsletter?: boolean;
  consent?: boolean;
  website?: string;             // Honeypot, muss leer sein
}

interface GrundrissBody {
  kind: 'grundriss';
  leadId: string;
  name: string;
  phone?: string;
  telefon?: string;
  sqm?: string | number;
  note?: string;
  file?: { name: string; mime: string; data: string };
  website?: string;
}

interface Photo {
  mime: string;
  data: string;
}

/* ---------- Handler ---------- */

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Nur POST erlaubt.' });
  }

  let body: any = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = null;
    }
  }
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ ok: false, error: 'Ungültige Anfrage.' });
  }
  // Honeypot: Bots füllen das versteckte Feld aus. Wir antworten freundlich, tun aber nichts.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return res.status(200).json({ ok: true, leadId: newId() });
  }

  try {
    if (body.kind === 'render') return await handleRender(req, res, body as RenderBody);
    if (body.kind === 'grundriss') return await handleGrundriss(req, res, body as GrundrissBody);
    return res.status(400).json({ ok: false, error: 'Unbekannte Anfrage.' });
  } catch (err: any) {
    console.error('[badplaner] unerwarteter Fehler', err);
    return res.status(500).json({ ok: false, error: 'Das hat nicht geklappt. Bitte versuchen Sie es später noch einmal.' });
  }
}

/* ---------- kind: render ---------- */

async function handleRender(req: any, res: any, body: RenderBody) {
  // 1. Paket (Pflicht) und daraus die zulässigen Listen
  const pkg = bathPackages.find((p) => p.id === text(body.paket ?? body.package, 40).toLowerCase());
  if (!pkg) return bad(res, 'Bitte wählen Sie ein Paket.');
  const opts = optionsForPackage(pkg.id as PackageId);
  const isAtelier = pkg.id === 'atelier';
  const individuell = body.individuell === true;

  // 2. Ausstattung: leere oder unbekannte Werte nehmen die erste Option der Liste
  const tile = pickOption(opts.tiles, body.platte ?? body.tile);
  const floorTile = findOption(opts.tiles, body.boden);
  const base = pickOption(opts.bases, body.unterbau ?? body.furniture);
  const top = pickOption(opts.tops, body.top);
  const basinType = pickOption(opts.basinTypes, body.becken);            // nur Atelier
  const tapSeriesOption = pickOption(opts.tapSeriesOptions, body.armaturenserie); // nur Colore
  const finish = pickOption(opts.finishes, body.finish);
  const sanitary = pickOption(opts.sanitary, body.keramik ?? body.sanitary);
  const wall = pickOption(opts.walls, body.wall);
  const shower = pickOption(opts.showers, body.dusche ?? body.shower);
  const basin = pickOption(opts.basins, body.waschtisch ?? body.basin);
  const mirror = pickOption(opts.mirrors, body.spiegel ?? body.mirror);
  if (!tile || !base || !top || !finish || !sanitary || !wall || !shower || !basin || !mirror) {
    // Kann nur passieren, wenn der Katalog für dieses Paket unvollständig ist.
    console.error('[badplaner] Katalog unvollständig für Paket', pkg.id);
    return bad(res, 'Die Ausstattung passt nicht zum gewählten Paket. Bitte Auswahl prüfen.');
  }

  // Look: die gewählte Platte bestimmt ihn, sonst der gesendete Wert (nur Atelier)
  const look =
    (tile.look ? opts.looks.find((l) => l.id === tile.look) : undefined) ||
    (isAtelier ? pickOption(opts.looks, body.look) : undefined);

  // Format: nur ein im Paket bzw. für die Platte zulässiges Format, sonst das Standardformat
  const wantedFormat = text(body.format, 20);
  const format =
    wantedFormat && (opts.formats.includes(wantedFormat) || (tile.formats || []).includes(wantedFormat))
      ? wantedFormat
      : opts.formats[0] || tile.format;

  // Boden abweichend: wenn möglich im gewählten Format, sonst im Standardformat der Platte
  const floorFormat = floorTile ? ((floorTile.formats || []).includes(format) ? format : floorTile.format) : '';

  // Kombination und Akzentfläche (nur Atelier)
  const accentMode = pickOption(opts.accentModes, body.kombination);
  const isKombi = isAtelier && accentMode?.id === 'kombination';
  const rawPlacement = text(body.akzentFlaeche, 40).toLowerCase();
  if (isKombi && rawPlacement && !PLACEMENT_ALIAS[rawPlacement]) {
    console.warn('[badplaner] unbekannte Akzentfläche, nehme die erste Option:', rawPlacement);
  }
  const placementId: AccentPlacementId = PLACEMENT_ALIAS[rawPlacement] || 'waschtischwand';
  const placement = opts.accentPlacements.find((p) => p.id === placementId) || opts.accentPlacements[0];
  // Nur Materialien, die auf dieser Fläche zulässig sind (Nassbereich der Dusche!)
  const allowedAccents = opts.accents.filter((a) => a.placement.includes(placementId));
  const accent = isKombi ? pickOption(allowedAccents, body.akzent) : undefined;

  // 3. Fenster und Kontakt (Pflichtfelder)
  const windows = text(body.windows, 4);
  if (!/^[0-3]$/.test(windows)) return bad(res, 'Bitte geben Sie an, wie viele Fenster auf dem Foto zu sehen sind.');
  const name = text(body.name, 120);
  const phone = text(body.telefon ?? body.phone, 60);
  const email = text(body.email, 120);
  const place = text(body.place, 120);
  const newsletter = body.newsletter === true;
  if (!name || !phone) return bad(res, 'Bitte Name und Telefonnummer angeben.');
  if (!email) return bad(res, 'Bitte E-Mail-Adresse angeben: wir schicken Ihnen das Ideenbild auch per Mail.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return bad(res, 'Die E-Mail-Adresse sieht nicht richtig aus.');
  if (body.consent !== true) return bad(res, 'Bitte bestätigen Sie die Datenschutzerklärung.');

  // 4. Foto: neu als data-URL im Feld `foto`, alt als { mime, data } im Feld `photo`
  const photo = readPhoto(body);
  if (!photo) return bad(res, 'Bitte ein Foto Ihres Bads (JPEG, PNG oder WebP) hochladen.');
  if (photo.data.length < 1000) return bad(res, 'Das Foto ist leer oder beschädigt.');
  if (photo.data.length > MAX_PHOTO_BASE64) return bad(res, 'Das Foto ist zu gross. Bitte ein kleineres Bild wählen.');
  if (!/^[A-Za-z0-9+/=\r\n]+$/.test(photo.data)) return bad(res, 'Das Foto konnte nicht gelesen werden.');
  if (!process.env.GEMINI_API_KEY) {
    console.error('[badplaner] GEMINI_API_KEY fehlt');
    return res.status(503).json({ ok: false, error: 'Der Badplaner ist im Moment nicht verfügbar. Rufen Sie uns an: ' + business.phone.display });
  }

  // 5. Limits
  const today = new Date().toISOString().slice(0, 10);
  const cookie = readCounterCookie(req.headers?.cookie, today);
  if (cookie >= PER_DEVICE_PER_DAY) {
    return res.status(429).json({
      ok: false,
      error: `Tageslimit erreicht (${PER_DEVICE_PER_DAY} Ideenbilder). Rufen Sie uns an oder kommen Sie in die Ausstellung.`,
    });
  }
  const ip = clientIp(req);
  const ipEntry = ipCounter.get(ip);
  const ipCount = ipEntry && ipEntry.date === today ? ipEntry.count : 0;
  if (ipCount >= PER_IP_PER_DAY) {
    return res.status(429).json({ ok: false, error: 'Tageslimit erreicht. Rufen Sie uns an oder kommen Sie in die Ausstellung.' });
  }
  const dailyCap = Number(process.env.BADPLANER_DAILY_CAP) > 0 ? Number(process.env.BADPLANER_DAILY_CAP) : 60;
  if (globalCounter.date !== today) {
    globalCounter.date = today;
    globalCounter.count = 0;
  }
  if (globalCounter.count >= dailyCap) {
    return res.status(429).json({ ok: false, error: 'Der Badplaner hat heute sein Tageslimit erreicht. Rufen Sie uns an oder versuchen Sie es morgen wieder.' });
  }
  // Versuche zählen (auch wenn das Modell nachher kein Bild liefert)
  ipCounter.set(ip, { date: today, count: ipCount + 1 });
  globalCounter.count++;
  if (ipCounter.size > 5000) ipCounter.clear(); // Speicher der Instanz schonen

  // 6. Swatch (Materialprobe der Wandplatte) laden: zuerst unsere Kopie, sonst Lieferant, sonst ohne
  const swatch = await loadSwatch(req, tile.image, tile.src || '');

  // 7. Armaturen: Essenza Aufputz verchromt, Colore verchromt in der gewählten Serie,
  //    Atelier Unterputz in der gewählten Oberfläche.
  const taps = tapDescription(pkg.id as PackageId, finish, tapSeriesOption, opts.tapSeries);

  // 8. Prompt (englisch; Vorlage aus dem Test, mit eingesetzten Wahlwerten)
  const prompt = buildPrompt({
    packageName: pkg.name,
    lookPrompt: isAtelier ? look?.prompt : undefined,
    format: format.replace('x', '×'),
    tilePrompt: tile.prompt,
    floorFormat: floorTile ? floorFormat.replace('x', '×') : undefined,
    floorPrompt: floorTile ? floorTile.prompt : undefined,
    accentPlacementPrompt: accent ? placement?.prompt : undefined,
    accentPrompt: accent ? accent.prompt : undefined,
    wallPrompt: wall.prompt,
    showerPrompt: shower.prompt,
    sanitaryPrompt: sanitary.prompt,
    basinPrompt: basin.prompt,
    basinTypePrompt: isAtelier ? basinType?.prompt : undefined,
    topPrompt: top.prompt,
    basePrompt: base.prompt,
    mirrorPrompt: mirror.prompt,
    tapPrompt: taps.prompt,
    withSwatch: !!swatch,
    windows,
  });

  // 9. Bild erzeugen, dann prüfen, ob das Modell Fenster/Türen dazuerfunden hat.
  //    Wenn ja: ein zweiter Versuch mit dem Hinweis auf den Fehler.
  let gen = await generateImage(prompt, photo, swatch);
  if (gen.ok === false) return res.status(502).json({ ok: false, error: gen.error });
  let checkNote = 'nicht geprüft';
  const check = await checkOpenings(photo, gen);
  if (check) {
    checkNote = check.extra ? `1. Versuch verworfen (${check.reason})` : 'ok';
    if (check.extra) {
      const retryPrompt = `${prompt}\nIMPORTANT: a previous attempt was rejected because it added an opening that does not exist in image 1 (${check.reason}). Keep every wall exactly as in image 1: no new window, roof window, door or glass opening.`;
      const second = await generateImage(retryPrompt, photo, swatch);
      if (second.ok !== false) {
        gen = second;
        const check2 = await checkOpenings(photo, second);
        checkNote += check2 ? (check2.extra ? `, 2. Versuch ebenfalls auffällig (${check2.reason})` : ', 2. Versuch ok') : ', 2. Versuch nicht geprüft';
      }
    }
  }
  console.log('[badplaner] Fensterprüfung:', checkNote);

  // 10. Auswahl in Klartext: dieselben Zeilen für das Lead-Mail und die Kundenmail
  const packageLabel = individuell
    ? `${individualPackage.name} (Grundlage: ${pkg.name})`
    : `${pkg.name} (ab CHF ${pkg.priceLabel})`;
  const auswahl: [string, string][] = [];
  const row = (label: string, value: string) => auswahl.push([label, value]);
  row('Paket', packageLabel);
  if (look) row('Look', look.label);
  row('Format', `${format.replace('x', '×')} cm`);
  row(floorTile ? 'Platten Wand' : 'Platten', tileName(tile));
  if (floorTile) row('Platten Boden', `${tileName(floorTile)}, ${floorFormat.replace('x', '×')} cm`);
  if (isAtelier && accentMode) row('Kombination', accentMode.label);
  if (accent && placement) {
    row('Akzentfläche', placement.label);
    row('Akzentmaterial', `${accent.supplier} ${accent.label}`);
  }
  row('Wandplatten', wall.label);
  row('Dusche / Wanne', shower.label);
  row('Unterbau', `${base.label} (${base.supplier})`);
  row('Waschtischplatte', `${top.label} (${top.supplier})`);
  if (basinType) row('Waschbecken', basinType.label);
  row('Armatur', taps.label);
  if (tapSeriesOption) row('Armaturenserie', `${tapSeriesOption.label} (${tapSeriesOption.supplier})`);
  row('Sanitärkeramik', `${sanitary.label} (${sanitary.supplier})`);
  row('Waschtisch', basin.label);
  row('Spiegel', mirror.label);

  // 11. Lead-Mail an NLD (Resend mit Anhängen, sonst Formspree ohne Bilder)
  const leadId = newId();
  const imageName = gen.mime === 'image/png' ? 'ideenbild.png' : 'ideenbild.jpg';
  const details: [string, string][] = [
    ['Name', name],
    ['Telefon / WhatsApp', phone],
    ['E-Mail', email],
    ['PLZ / Ort', place || '–'],
    ...auswahl,
    ['Fenster laut Kunde', windows === '0' ? 'keine' : windows === '3' ? '3 oder mehr' : windows],
    ['Fensterprüfung', checkNote],
    ['Newsletter', newsletter ? 'ja' : 'nein'],
    ['Zeitpunkt', swissTime()],
    ['Seite', req.headers?.referer || req.headers?.referrer || '/badplaner'],
    ['Lead-ID', leadId],
  ];
  await sendLeadMail({
    subject: `Badplaner-Lead: ${name} – Paket ${individuell ? individualPackage.name : pkg.name}`,
    replyTo: email,
    intro: 'Neuer Lead aus dem Badplaner. Foto und Ideenbild im Anhang.',
    details,
    attachments: [
      { filename: 'foto.jpg', content: photo.data },
      { filename: imageName, content: gen.data },
    ],
  });

  // 12. Kundenmail mit dem Ideenbild. Ein Fehler darf die Antwort nie verhindern.
  await sendCustomerMail({
    to: email,
    name,
    pkg,
    individuell,
    auswahl,
    image: { mime: gen.mime, data: gen.data, filename: imageName },
  });

  // 13. Newsletter (nur wenn angehakt und RESEND_AUDIENCE_ID gesetzt ist)
  if (newsletter) await subscribeNewsletter(email, name);

  // 14. Antwort mit Tageszähler-Cookie
  res.setHeader('Set-Cookie', counterCookie(cookie + 1, today));
  return res.status(200).json({ ok: true, leadId, image: { mime: gen.mime, data: gen.data } });
}

/* ---------- kind: grundriss ---------- */

async function handleGrundriss(req: any, res: any, body: GrundrissBody) {
  const name = text(body.name, 120);
  const phone = text(body.telefon ?? body.phone, 60);
  const leadId = text(body.leadId, 40);
  const note = text(body.note, 2000);
  const sqm = body.sqm === undefined || body.sqm === null || body.sqm === '' ? '' : String(body.sqm).slice(0, 10);
  if (!name || !phone) return bad(res, 'Bitte Name und Telefonnummer angeben.');
  if (!note && !sqm && !body.file) return bad(res, 'Bitte einen Grundriss, die Grösse oder eine Bemerkung angeben.');

  const attachments: { filename: string; content: string }[] = [];
  if (body.file) {
    const f = body.file;
    if (typeof f.data !== 'string' || f.data.length > MAX_FILE_BASE64) return bad(res, 'Die Datei ist zu gross (max. 4 MB).');
    if (!/^(image\/(jpeg|png|webp)|application\/pdf)$/.test(f.mime || '')) return bad(res, 'Bitte ein Bild (JPEG, PNG, WebP) oder ein PDF hochladen.');
    if (!/^[A-Za-z0-9+/=\r\n]+$/.test(f.data)) return bad(res, 'Die Datei konnte nicht gelesen werden.');
    const ext = f.mime === 'application/pdf' ? 'pdf' : f.mime === 'image/png' ? 'png' : f.mime === 'image/webp' ? 'webp' : 'jpg';
    attachments.push({ filename: `grundriss.${ext}`, content: f.data });
  }

  const details: [string, string][] = [
    ['Name', name],
    ['Telefon / WhatsApp', phone],
    ['Bad-Grösse', sqm ? `${sqm} m²` : '–'],
    ['Bemerkung', note || '–'],
    ['Grundriss', attachments.length ? attachments[0].filename : 'keiner'],
    ['Zeitpunkt', swissTime()],
    ['Lead-ID', leadId || '–'],
  ];
  await sendLeadMail({
    subject: `Badplaner-Grundriss: ${name}`,
    intro: 'Ergänzung zu einem Badplaner-Lead (Grundriss / Grösse / Bemerkung).',
    details,
    attachments,
  });
  return res.status(200).json({ ok: true });
}

/* ---------- Auswahl auflösen ---------- */

/**
 * Erste Option der Liste, wenn die Id fehlt oder unbekannt ist (Kapitel 10 der
 * Spezifikation: keine harten Fehler wegen einer fehlenden Detailwahl).
 * Leere Liste (z. B. Waschbeckenart ausserhalb von Atelier) ergibt undefined.
 */
function pickOption<T extends { id: string }>(list: T[] | undefined, id: unknown): T | undefined {
  if (!list || list.length === 0) return undefined;
  const wanted = typeof id === 'string' ? id.trim() : '';
  return list.find((o) => o.id === wanted) || list[0];
}

/** Lieferant, Serie und Farbe, ohne Doppelung wenn die Serie so heisst wie die Farbe. */
function tileName(t: { supplier: string; series: string; color: string }): string {
  return t.series === t.color ? `${t.supplier} ${t.series}` : `${t.supplier} ${t.series} ${t.color}`;
}

/** Wie pickOption, aber ohne Rückfall: leer bedeutet "nicht gewählt" (z. B. eigener Boden). */
function findOption<T extends { id: string }>(list: T[] | undefined, id: unknown): T | undefined {
  const wanted = typeof id === 'string' ? id.trim() : '';
  if (!list || !wanted) return undefined;
  return list.find((o) => o.id === wanted);
}

/** Foto aus dem neuen Feld `foto` (data-URL) oder aus dem alten Feld `photo`. */
function readPhoto(body: RenderBody): Photo | null {
  if (typeof body.foto === 'string' && body.foto) {
    const m = body.foto.match(/^data:(image\/(?:jpeg|jpg|png|webp));base64,([\s\S]+)$/i);
    if (!m) return null;
    const mime = m[1].toLowerCase() === 'image/jpg' ? 'image/jpeg' : m[1].toLowerCase();
    return { mime, data: m[2].trim() };
  }
  const legacy = body.photo;
  if (legacy && typeof legacy.data === 'string' && /^image\/(jpeg|png|webp)$/.test(legacy.mime || '')) {
    return { mime: legacy.mime, data: legacy.data };
  }
  return null;
}

/**
 * Armaturen je Paket: Essenza Aufputz verchromt (keine Auswahl), Colore verchromt
 * in der gewählten Serie, Atelier Unterputz in der gewählten Oberfläche.
 */
function tapDescription(
  pkg: PackageId,
  finish: { label: string; prompt: string },
  series: { label: string; prompt: string } | undefined,
  seriesText: string,
): { prompt: string; label: string } {
  if (pkg === 'atelier') {
    return {
      prompt: `concealed built-in (Unterputz) fittings in ${finish.prompt}: only the spout and a flat wall control plate are visible, no exposed mixer body`,
      label: `${finish.label}, ${seriesText}`,
    };
  }
  if (pkg === 'colore') {
    return {
      prompt: series
        ? `${series.prompt}, the shower mixer and all controls from the same series and in the same polished chrome`
        : 'taps, shower mixer and controls in polished chrome',
      label: series ? `${series.label}, Chrom` : seriesText,
    };
  }
  return {
    prompt: 'exposed surface-mounted (Aufputz) Treemme Up+ fittings in polished chrome, thermostatic shower mixer visible on the wall',
    label: seriesText,
  };
}

/* ---------- Prompt ---------- */

function buildPrompt(v: {
  packageName: string;
  lookPrompt?: string;
  format: string;
  tilePrompt: string;
  floorFormat?: string;
  floorPrompt?: string;
  accentPlacementPrompt?: string;
  accentPrompt?: string;
  wallPrompt: string;
  showerPrompt: string;
  sanitaryPrompt: string;
  basinPrompt: string;
  basinTypePrompt?: string;
  topPrompt: string;
  basePrompt: string;
  mirrorPrompt: string;
  tapPrompt: string;
  withSwatch: boolean;
  windows: string;
}): string {
  const intro = v.withSwatch
    ? `Photo editing task. Image 1 is the customer's existing bathroom. Image 2 is ONLY a close-up material sample (tile texture and colour); ignore everything else about image 2, it contains no layout information.`
    : `Photo editing task. Image 1 is the customer's existing bathroom.`;
  const asSample = v.withSwatch ? ' as in image 2' : '';
  const windowRule =
    v.windows === '0'
      ? 'Image 1 shows NO window and no roof window: the result must not contain any window or glass opening at all, every wall stays a solid wall.'
      : v.windows
        ? `Image 1 shows exactly ${v.windows === '3' ? 'three or more' : v.windows} window(s) including roof windows: the result must show exactly the same window(s) at the same place and size and no additional window, roof window, glass opening or door anywhere; walls that are solid in image 1 stay solid.`
        : 'The number of windows, roof windows and doors must be identical to image 1: never add an opening that is not visible in image 1; walls that are solid in image 1 stay solid.';

  // Wand- und Bodenmaterial. Bei abweichendem Boden muss klar sein, dass sich
  // "the same tiles" in der Wandhöhen-Regel auf die Wandplatte bezieht.
  const surfaces = v.floorPrompt
    ? `the walls tiled with ${v.format} cm ${v.tilePrompt} tiles${asSample}, and the floor tiled with different ${v.floorFormat} cm ${v.floorPrompt} tiles; ${v.wallPrompt} ("the same tiles" always means the wall tiles, never the floor tiles)`
    : `floor and walls tiled with the same ${v.format} cm ${v.tilePrompt} tiles${asSample}; ${v.wallPrompt}`;
  const look = v.lookPrompt ? ` overall material mood — ${v.lookPrompt};` : '';
  const accent =
    v.accentPrompt && v.accentPlacementPrompt
      ? ` Exactly ONE accent area in a second material: ${v.accentPlacementPrompt}, covered with ${v.accentPrompt}. Every other tiled surface, including the floor and all other walls, keeps the main material; no second accent area anywhere.`
      : '';
  const vanity = `if a washbasin is visible in image 1, ${v.basinPrompt} at its existing place on a wall-hung vanity: front and body in ${v.basePrompt}, countertop in ${v.topPrompt}${v.basinTypePrompt ? `, ${v.basinTypePrompt}` : ''}, with ${v.mirrorPrompt} above it`;

  return [
    intro,
    `Produce a photorealistic "after renovation" photo of image 1 with these hard constraints: identical camera position, angle and lens; identical walls, ceiling, floor plan and room size; every window, door and roof window stays exactly where it is with the same size; do NOT add any window, door, niche or opening that is not visible in image 1; ${windowRule} The toilet stays exactly where it is, same orientation (the drain cannot be moved); the washbasin stays on the same wall in the same place; radiators stay; the bathtub or shower stays in the same place. Only replace what is visible in image 1: do NOT add a toilet, washbasin, bidet, bathtub or shower that is not visible in image 1, and do not remove one that is.`,
    `Changes (package "${v.packageName}"):${look} ${surfaces}; ${v.showerPrompt} where the bathtub/shower is now; if a toilet is visible in image 1, a wall-hung rimless toilet in ${v.sanitaryPrompt} at exactly its existing position; ${vanity}; ${v.tapPrompt}.${accent} Remove clutter, towels, bottles, shower curtain and rugs. Natural daylight, no people, no text.`,
  ].join('\n');
}

/* ---------- Swatch laden ---------- */

async function loadSwatch(req: any, image: string, src: string): Promise<Photo | null> {
  const host = (req.headers?.['x-forwarded-host'] || req.headers?.host || '').toString().split(',')[0].trim();
  const candidates = [];
  if (host && image) candidates.push(`https://${host}${image}`);
  if (src) candidates.push(src);
  for (const url of candidates) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      const r = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'NewLivingDesign-Badplaner/1.0' } });
      clearTimeout(timer);
      if (!r.ok) continue;
      const type = (r.headers.get('content-type') || '').split(';')[0].trim();
      if (!type.startsWith('image/')) continue;
      const bytes = await r.arrayBuffer();
      if (bytes.byteLength < 200) continue;
      const mime = type === 'image/png' || type === 'image/webp' ? type : 'image/jpeg';
      return { mime, data: Buffer.from(bytes).toString('base64') };
    } catch (err: any) {
      console.warn('[badplaner] Swatch nicht geladen:', url, err && err.message);
    }
  }
  return null;
}

/* ---------- Gemini ---------- */

type GenResult = { ok: true; mime: string; data: string } | { ok: false; error: string };

async function generateImage(prompt: string, photo: Photo, swatch: Photo | null): Promise<GenResult> {
  const model = process.env.BADPLANER_MODEL || 'gemini-3.1-flash-image';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const parts: any[] = [{ text: prompt }, { inlineData: { mimeType: photo.mime, data: photo.data } }];
  if (swatch) parts.push({ inlineData: { mimeType: swatch.mime, data: swatch.data } });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);
  try {
    const r = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY, 'content-type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: { responseModalities: ['IMAGE'], imageConfig: { imageSize: '1K' } },
      }),
    });
    const json: any = await r.json().catch(() => null);
    if (!r.ok) {
      const msg = json?.error?.message || `HTTP ${r.status}`;
      console.error('[badplaner] Gemini-Fehler', r.status, msg);
      if (r.status === 429) return { ok: false, error: 'Der Bilddienst ist gerade ausgelastet. Bitte in einer Minute noch einmal versuchen.' };
      return { ok: false, error: 'Das Ideenbild konnte nicht erstellt werden. Bitte später noch einmal versuchen oder rufen Sie uns an.' };
    }
    const candidate = json?.candidates?.[0];
    const imagePart = candidate?.content?.parts?.find((p: any) => p.inlineData?.data);
    if (!imagePart) {
      const reason = candidate?.finishReason || json?.promptFeedback?.blockReason || 'kein Bild';
      console.error('[badplaner] Gemini ohne Bild:', reason);
      return { ok: false, error: 'Aus diesem Foto konnte kein Ideenbild erstellt werden. Bitte ein anderes Foto versuchen: von der Tür aus, das ganze Bad im Bild, Licht an.' };
    }
    const mime = imagePart.inlineData.mimeType || 'image/png';
    return { ok: true, mime: mime === 'image/jpeg' ? 'image/jpeg' : 'image/png', data: imagePart.inlineData.data };
  } catch (err: any) {
    const timeout = err && err.name === 'AbortError';
    console.error('[badplaner] Gemini nicht erreichbar', timeout ? 'Timeout' : err);
    return {
      ok: false,
      error: timeout
        ? 'Das hat zu lange gedauert. Bitte noch einmal versuchen.'
        : 'Der Bilddienst ist im Moment nicht erreichbar. Bitte später noch einmal versuchen.',
    };
  } finally {
    clearTimeout(timer);
  }
}

/* ---------- Prüfung: dazuerfundene Fenster/Türen ---------- */

/**
 * Fragt ein Gemini-Textmodell, ob das Ideenbild eine Öffnung (Fenster, Dachfenster,
 * Tür, Glasfläche) enthält, die im Foto nicht da ist. Liefert null, wenn die Prüfung
 * nicht möglich war (Modell fehlt, Timeout, unlesbare Antwort): dann gilt das Bild.
 */
async function checkOpenings(photo: Photo, gen: { mime: string; data: string }): Promise<{ extra: boolean; reason: string } | null> {
  const model = process.env.BADPLANER_CHECK_MODEL === undefined ? 'gemini-3.6-flash' : process.env.BADPLANER_CHECK_MODEL;
  if (!model) return null;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const question =
    'Image 1 is a photo of a bathroom. Image 2 is an edited "after renovation" version of the same photo, same camera position. ' +
    'Compare the openings in the walls and ceiling: windows, roof windows (skylights), doors, glass openings to the outside. ' +
    'Does image 2 contain any such opening that does not exist at roughly the same place in image 1? A glass shower screen or a mirror is NOT an opening. ' +
    'Answer with JSON only, no markdown: {"extra_openings": true or false, "reason": "short English reason, max 20 words"}';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);
  try {
    const r = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'x-goog-api-key': process.env.GEMINI_API_KEY, 'content-type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: question },
              { inlineData: { mimeType: photo.mime, data: photo.data } },
              { inlineData: { mimeType: gen.mime, data: gen.data } },
            ],
          },
        ],
        generationConfig: { temperature: 0, responseMimeType: 'application/json' },
      }),
    });
    const json: any = await r.json().catch(() => null);
    if (!r.ok) {
      console.error('[badplaner] Fensterprüfung fehlgeschlagen', r.status, json?.error?.message || '');
      return null;
    }
    const textOut: string = json?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || '').join('') || '';
    const m = textOut.match(/\{[\s\S]*\}/);
    if (!m) return null;
    const parsed = JSON.parse(m[0]);
    if (typeof parsed.extra_openings !== 'boolean') return null;
    return { extra: parsed.extra_openings, reason: String(parsed.reason || '').slice(0, 160) };
  } catch (err: any) {
    console.error('[badplaner] Fensterprüfung nicht möglich', err && err.name === 'AbortError' ? 'Timeout' : err);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/* ---------- Lead-Mail an NLD ---------- */

interface LeadMail {
  subject: string;
  intro: string;
  details: [string, string][];
  attachments: { filename: string; content: string }[];
  replyTo?: string;
}

/**
 * Schickt den Lead per Resend (mit Anhängen). Ohne RESEND_API_KEY oder bei
 * einem Fehler geht er ohne Bilder an Formspree, damit er nie verloren geht.
 */
async function sendLeadMail(mail: LeadMail): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (key) {
    try {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          from: mailFrom(),
          to: [process.env.BADPLANER_TO || business.email],
          cc: [process.env.BADPLANER_CC || business.emailSecondary],
          reply_to: mail.replyTo,
          subject: mail.subject,
          html: leadHtml(mail),
          text: leadText(mail),
          attachments: mail.attachments,
        }),
      });
      if (r.ok) return;
      console.error('[badplaner] Resend-Fehler', r.status, await r.text().catch(() => ''));
    } catch (err: any) {
      console.error('[badplaner] Resend nicht erreichbar', err && err.message);
    }
  } else {
    console.warn('[badplaner] RESEND_API_KEY fehlt, Lead geht an Formspree (ohne Bilder)');
  }

  // Fallback: Formspree ohne Anhänge. Das Formular xdklvgpb verlangt firstName,
  // lastName und message (sonst 422 "Validation errors"), also füllen wir sie.
  try {
    const fullName = (mail.details.find(([k]) => k === 'Name') || ['', ''])[1].trim();
    const [firstName, ...rest] = fullName.split(/\s+/);
    const fields: Record<string, string> = {
      _subject: mail.subject,
      firstName: firstName || 'Badplaner',
      lastName: rest.join(' ') || '–',
      message: leadText(mail),
      quelle: 'Badplaner',
      hinweis: 'Bilder konnten nicht angehängt werden',
    };
    for (const [label, value] of mail.details) fields[label] = value;
    if (mail.replyTo) {
      fields._replyto = mail.replyTo;
      fields.email = mail.replyTo;
    }
    const r = await fetch(business.formspreeEndpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(fields),
    });
    if (!r.ok) console.error('[badplaner] Formspree-Fehler', r.status, await r.text().catch(() => ''));
  } catch (err: any) {
    console.error('[badplaner] Formspree nicht erreichbar', err && err.message);
  }
}

function leadHtml(mail: LeadMail): string {
  const rows = mail.details
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#555;white-space:nowrap;vertical-align:top">${esc(k)}</td><td style="padding:4px 0">${esc(v).replace(/\n/g, '<br>')}</td></tr>`)
    .join('');
  return `<div style="font-family:Arial,sans-serif;font-size:14px;color:#111"><p>${esc(mail.intro)}</p><table cellspacing="0" cellpadding="0">${rows}</table></div>`;
}

function leadText(mail: LeadMail): string {
  return [mail.intro, '', ...mail.details.map(([k, v]) => `${k}: ${v}`)].join('\n');
}

/* ---------- Kundenmail ---------- */

interface CustomerMailInput {
  name: string;
  pkg: BathPackage;
  individuell: boolean;
  auswahl: [string, string][];
  imageCid: string;
}

/**
 * Text und Gestaltung der Bestätigungsmail an den Kunden (Deutsch, Schweiz: "ss",
 * Preise mit Apostroph). Absichtlich als eigene Funktion, damit der Text ohne
 * Eingriff in die Logik geändert werden kann.
 *
 * TODO: Die Kurztexte "enthalten / nicht enthalten" stehen noch nicht als eigene
 * Felder in src/config/business.ts; sie werden hier – wie auf der Seite – aus
 * `includes`, `extraPerSqm` und `packageNote` gebildet.
 */
function customerMail(v: CustomerMailInput): { subject: string; html: string; text: string } {
  const subject = 'Ihre Bad-Idee von New Living Design';
  const anrede = v.name ? `Guten Tag ${v.name}` : 'Guten Tag';
  const adresse = `${business.address.street}, ${business.address.zip} ${business.address.city}`;
  const zeiten = business.openingHours.map((h) => `${h.days}: ${h.opens} – ${h.closes} Uhr`).join(' · ');
  const whatsappUrl = `https://wa.me/${business.whatsapp.e164.replace('+', '')}`;
  const preisZeile = v.individuell
    ? `${individualPackage.name}: ${individualPackage.claim} Als Grundlage für das Ideenbild haben Sie das Paket ${v.pkg.name} gewählt (Richtpreis ab CHF ${v.pkg.priceLabel}).`
    : `Paket ${v.pkg.name}: Richtpreis ab CHF ${v.pkg.priceLabel}, ${v.pkg.duration} Bauzeit.`;
  const enthalten = 'Enthalten: Material, Montage und 8.1 % MwSt.';
  const nichtEnthalten = `Nicht enthalten: Plattenfläche über ca. 21 m² (CHF ${chf(v.pkg.extraPerSqm)}.– pro zusätzlichem m²), Bauarbeiten ausserhalb des Bads und Sonderwünsche, die wir nach der Besichtigung separat offerieren.`;
  const referenz = 'Referenzfläche: Bad ca. 6 m², ca. 21 m² Platten.';
  const ideenbildSatz =
    'Das ist ein Ideenbild, kein Plan: Es zeigt Stimmung, Farben und Materialien, aber keine Masse, keine Leitungen und keine verbindliche Ausführung. Was in Ihrem Bad wirklich möglich ist, klären wir bei der Besichtigung vor Ort.';
  const loeschung = `Ihr Foto und das Ideenbild liegen nur in dieser E-Mail und in unserem Postfach. Möchten Sie, dass wir beides löschen? Eine kurze Nachricht an ${business.email} genügt. Ohne Auftrag löschen wir Foto und Ideenbild spätestens 30 Tage nach der Anfrage.`;

  const rows = v.auswahl
    .map(
      ([k, val]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#666;white-space:nowrap;vertical-align:top;border-bottom:1px solid #eee">${esc(k)}</td><td style="padding:6px 0;border-bottom:1px solid #eee">${esc(val)}</td></tr>`,
    )
    .join('');
  const leistungen = v.pkg.includes.map((i) => `<li style="margin:2px 0">${esc(i)}</li>`).join('');

  const html = `<div style="margin:0;padding:24px 12px;background:#f6f5f3">
<div style="max-width:640px;margin:0 auto;background:#fff;padding:28px 24px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#1a1a1a">
  <p style="margin:0 0 14px">${esc(anrede)}</p>
  <p style="margin:0 0 18px">vielen Dank für Ihre Anfrage im Badplaner. So könnte Ihr Bad mit den von Ihnen gewählten Materialien aussehen:</p>
  <img src="cid:${esc(v.imageCid)}" alt="Ihr Ideenbild" width="592" style="width:100%;max-width:592px;height:auto;display:block;border:0;border-radius:4px;margin:0 0 8px">
  <p style="margin:0 0 22px;font-size:13px;color:#666">Das Ideenbild liegt dieser E-Mail auch als Datei bei.</p>
  <p style="margin:0 0 22px;padding:12px 14px;background:#f6f5f3;border-left:3px solid #b99b6b">${esc(ideenbildSatz)}</p>

  <h2 style="font-size:17px;margin:26px 0 10px">Ihre Auswahl</h2>
  <table cellspacing="0" cellpadding="0" style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>

  <h2 style="font-size:17px;margin:26px 0 10px">${esc(v.individuell ? individualPackage.name : `Paket ${v.pkg.name}`)}</h2>
  <p style="margin:0 0 10px"><strong>${esc(preisZeile)}</strong></p>
  <p style="margin:0 0 6px">${esc(enthalten)}</p>
  <ul style="margin:0 0 10px;padding-left:20px;font-size:14px;color:#333">${leistungen}</ul>
  <p style="margin:0 0 6px">${esc(nichtEnthalten)}</p>
  <p style="margin:0 0 10px">${esc(referenz)}</p>
  <p style="margin:0 0 22px;font-size:12px;color:#777">${esc(packageNote)}</p>

  <h2 style="font-size:17px;margin:26px 0 10px">Schauen Sie vorbei</h2>
  <p style="margin:0 0 10px">Materialien muss man anfassen. In unserer Ausstellung in Zofingen sehen Sie die Platten, Möbelfarben und Armaturen im Original – und wir sagen Ihnen, was in Ihrem Bad machbar ist.</p>
  <p style="margin:0 0 10px">${esc(adresse)}<br>${esc(zeiten)}<br>${esc(business.openingHoursNote)}</p>
  <p style="margin:0 0 22px">
    <a href="tel:${esc(business.phone.e164)}" style="display:inline-block;padding:11px 18px;background:#1a1a1a;color:#fff;text-decoration:none;border-radius:3px;margin:0 8px 8px 0">Anrufen ${esc(business.phone.display)}</a>
    <a href="${esc(whatsappUrl)}" style="display:inline-block;padding:11px 18px;background:#25d366;color:#fff;text-decoration:none;border-radius:3px;margin:0 8px 8px 0">WhatsApp ${esc(business.whatsapp.display)}</a>
  </p>
  <p style="margin:0 0 22px">Wir melden uns in den nächsten Tagen bei Ihnen. Sie erreichen uns auch direkt unter ${esc(business.phone.display)} oder per WhatsApp unter ${esc(business.whatsapp.display)}.</p>

  <p style="margin:0 0 6px;font-size:12px;color:#777">${esc(loeschung)}</p>
  <p style="margin:0;font-size:12px;color:#777">${esc(business.legalName)} · ${esc(adresse)} · <a href="${esc(business.siteUrl)}/datenschutz#badplaner" style="color:#777">Datenschutz</a></p>
</div>
</div>`;

  const text = [
    anrede + ',',
    '',
    'vielen Dank für Ihre Anfrage im Badplaner. Ihr Ideenbild liegt dieser E-Mail als Datei bei.',
    '',
    ideenbildSatz,
    '',
    'IHRE AUSWAHL',
    ...v.auswahl.map(([k, val]) => `${k}: ${val}`),
    '',
    (v.individuell ? individualPackage.name : `PAKET ${v.pkg.name.toUpperCase()}`).toUpperCase(),
    preisZeile,
    enthalten,
    ...v.pkg.includes.map((i) => `- ${i}`),
    nichtEnthalten,
    referenz,
    packageNote,
    '',
    'SCHAUEN SIE VORBEI',
    adresse,
    zeiten,
    business.openingHoursNote,
    `Telefon: ${business.phone.display} · WhatsApp: ${business.whatsapp.display} (${whatsappUrl})`,
    '',
    loeschung,
    `${business.legalName} · ${adresse} · ${business.siteUrl}/datenschutz#badplaner`,
  ].join('\n');

  return { subject, html, text };
}

/**
 * Schickt die Kundenmail über Resend. Ohne RESEND_API_KEY wird sie übersprungen,
 * und ein Fehler beim Versand darf die Antwort an den Kunden nie verhindern.
 */
async function sendCustomerMail(v: {
  to: string;
  name: string;
  pkg: BathPackage;
  individuell: boolean;
  auswahl: [string, string][];
  image: { mime: string; data: string; filename: string };
}): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn('[badplaner] RESEND_API_KEY fehlt, Kundenmail wird übersprungen');
    return;
  }
  const imageCid = 'ideenbild';
  const mail = customerMail({ name: v.name, pkg: v.pkg, individuell: v.individuell, auswahl: v.auswahl, imageCid });
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from: mailFrom(),
        to: [v.to],
        reply_to: process.env.BADPLANER_TO || business.email,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        attachments: [
          // einmal eingebettet (grosses Bild im Text) und einmal als Datei zum Behalten
          { filename: v.image.filename, content: v.image.data, content_type: v.image.mime, content_id: imageCid },
          { filename: v.image.filename, content: v.image.data, content_type: v.image.mime },
        ],
      }),
    });
    if (!r.ok) {
      console.error('[badplaner] Kundenmail nicht versendet', r.status, await r.text().catch(() => ''));
      return;
    }
    console.log('[badplaner] Kundenmail versendet');
  } catch (err: any) {
    console.error('[badplaner] Kundenmail nicht möglich', err && err.message);
  }
}

/* ---------- Newsletter (Resend Audience) ---------- */

/**
 * Legt den Kontakt in der Resend-Audience an. Ohne RESEND_AUDIENCE_ID passiert
 * nichts; jeder Fehler wird nur protokolliert und blockiert die Antwort nie.
 */
async function subscribeNewsletter(email: string, name: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const audience = process.env.RESEND_AUDIENCE_ID;
  if (!key || !audience) {
    console.log('[badplaner] Newsletter angehakt, aber RESEND_AUDIENCE_ID fehlt: nur im Lead-Mail vermerkt');
    return;
  }
  try {
    const parts = name.split(/\s+/).filter(Boolean);
    const r = await fetch(`https://api.resend.com/audiences/${encodeURIComponent(audience)}/contacts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        email,
        first_name: parts[0] || '',
        last_name: parts.slice(1).join(' '),
        unsubscribed: false,
      }),
    });
    if (!r.ok) {
      console.log('[badplaner] Newsletter-Eintrag nicht möglich', r.status);
      return;
    }
    console.log('[badplaner] Newsletter-Eintrag angelegt');
  } catch (err: any) {
    console.log('[badplaner] Newsletter-Eintrag fehlgeschlagen', err && err.message);
  }
}

/* ---------- Hilfen ---------- */

function mailFrom(): string {
  return process.env.BADPLANER_FROM || 'Badplaner <badplaner@newlivingdesign.ch>';
}

function bad(res: any, error: string) {
  return res.status(400).json({ ok: false, error });
}

function text(v: unknown, max: number): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

/** Zahl mit Schweizer Tausendertrennzeichen: 36800 -> 36'800 */
function chf(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "'");
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);
}

function newId(): string {
  return `bp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function swissTime(): string {
  try {
    return new Intl.DateTimeFormat('de-CH', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Zurich' }).format(new Date());
  } catch {
    return new Date().toISOString();
  }
}

function clientIp(req: any): string {
  const fwd = (req.headers?.['x-forwarded-for'] || '').toString().split(',')[0].trim();
  return fwd || req.socket?.remoteAddress || 'unbekannt';
}

/** Liest den Tageszähler aus dem Cookie "nldbp=count:YYYY-MM-DD" (0, wenn der Tag nicht stimmt). */
function readCounterCookie(header: unknown, today: string): number {
  if (typeof header !== 'string') return 0;
  const m = header.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`));
  if (!m) return 0;
  const [count, date] = decodeURIComponent(m[1]).split(':');
  if (date !== today) return 0;
  const n = parseInt(count, 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function counterCookie(count: number, today: string): string {
  return `${COOKIE_NAME}=${count}:${today}; Path=/api/badplaner; Max-Age=86400; HttpOnly; Secure; SameSite=Lax`;
}
