/**
 * Badplaner-API (Vercel Serverless Function, Node-Runtime).
 *
 * POST /api/badplaner mit JSON-Body:
 *   kind: 'render'     Foto + Ausstattung -> Ideenbild (Gemini); Lead-Mail an NLD,
 *                      Kundenmail mit dem Ideenbild, auf Wunsch Newsletter-Eintrag
 *   kind: 'grundriss'  Grundriss/m²/Bemerkung zu einem bestehenden Lead per E-Mail
 *
 * Ablauf bei kind: 'render'
 *   1. Pflichtfelder, alle aktiven Ausstattungs-IDs und Bildheader streng prüfen.
 *      Bekannte Legacy-Feldnamen bleiben gültig; widersprüchliche Auswahl-IDs nicht.
 *   2. Grenzen prüfen: Cookie 3 Ideenbilder pro Gerät und Tag, 6 pro IP, Tagesdeckel.
 *   3. Musterbild der Wandplatte laden, Prompt bauen, Ideenbild bei Gemini erzeugen.
 *   4. Fensterprüfung: abgelehnte Bilder werden verworfen. Ist der Prüfdienst auch
 *      nach einem kurzen Retry nicht erreichbar, wird das Bild mit Warnhinweis zugestellt.
 *   5. Lead-Mail an NLD; bei eindeutigem HTTP-Fehler Formspree ohne Bilder.
 *      Ohne bestätigte Provider-Annahme kein Erfolg. Unklare Zustellung nicht blind wiederholen.
 *   6. Kundenmail/Newsletter mit separatem Zustellstatus, kein falsches Versandversprechen.
 *   Alle Netzwerkaufrufe einschliesslich Body-Lesen unter einer 105-Sekunden-Deadline.
 *
 * Umgebungsvariablen (Vercel > Settings > Environment Variables):
 *   GEMINI_API_KEY       Pflicht. API-Schlüssel von Google AI Studio (Bildmodell).
 *   RESEND_API_KEY       E-Mail-Versand mit Anhängen über Resend. Fehlt er oder
 *                        wird der Versand eindeutig abgelehnt, geht der Lead ohne Bilder
 *                        an Formspree. Fehlende Kundenmail wird im Ergebnis ausgewiesen.
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
 *                        leer lassen = Prüfung bewusst deaktiviert
 *
 * Fotos und Ideenbilder werden NICHT gespeichert (kein Blob, kein KV): sie gehen
 * nur an Google zur Bilderzeugung und per E-Mail an uns und an den Kunden.
 * Diese synchrone Zwischenlösung bietet KEINE durable Speicherung oder Idempotenz.
 * Provider-Annahme ist kein Nachweis der Postfachzustellung. Siehe docs/BADPLANER_PR1.md.
 * Siehe /datenschutz#badplaner.
 */
/* eslint-disable @typescript-eslint/no-explicit-any -- keine @vercel/node-Typen im Projekt, req/res sind deshalb any */
import { type PackageId } from '../src/data/badplaner.js';
import { business, individualPackage, packageNote, type BathPackage } from '../src/config/business.js';
import { Budget, TimeoutError, type Clock } from '../server/badplaner/budget.js';
import { normalizeSelection, ValidationError } from '../server/badplaner/validation.js';
import { normalizeBase64, validateImageBytes, MAX_PHOTO_BASE64, MAX_PLAN_BASE64 } from '../src/pages/badplaner/imageValidation.js';

// Node-Globals ohne @types/node (api/tsconfig.json ist auf Edge ausgelegt)
declare const process: any;
declare const Buffer: any;

export const config = { maxDuration: 120 };

/* ---------- Grenzen ---------- */

const MAX_FILE_BASE64 = MAX_PLAN_BASE64;
const MAX_REQUEST_BYTES = 4 * 1024 * 1024;
const MAX_RESPONSE_BASE64 = 3.5 * 1024 * 1024;
const MAX_SWATCH_BYTES = 5 * 1024 * 1024; // current catalog originals include files >4 MiB
const TOTAL_TIMEOUT_MS = 105000; // 15 seconds below the platform limit
const DELIVERY_RESERVE_MS = 25000;
const PER_DEVICE_PER_DAY = 3;                 // Cookie nldbp
const PER_IP_PER_DAY = 6;                     // In-Memory
const GEMINI_TIMEOUT_MS = 50000;
const CHECK_TIMEOUT_MS = 20000;
const CHECK_RETRY_DELAY_MS = 750;
const COOKIE_NAME = 'nldbp';

/* ---------- Typen ---------- */

/** Feldnamen nach Kapitel 10 der Spezifikation, dazu die alten Namen als Fallback. */
interface RenderBody {
  kind: 'render';
  raum?: string;
  room?: string;
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
  badewanne?: string;
  bathtub?: string;
  waschtisch?: string;
  basin?: string;               // alt
  spiegel?: string;
  mirror?: string;              // alt
  windows?: string;
  cistern?: string;
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

interface BeratungBody {
  kind: 'beratung';
  raum?: string;
  priorities?: string;
  measurements?: string;
  style?: string;
  budget?: string;
  imageWanted?: boolean;
  file?: { name: string; mime: string; data: string };
  name?: string;
  email?: string;
  telefon?: string;
  phone?: string;
  newsletter?: boolean;
  consent?: boolean;
  website?: string;
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

export interface BadplanerDependencies {
  fetch: typeof fetch;
  env: Record<string, string | undefined>;
  clock: Clock;
  sleep: (milliseconds: number) => Promise<void>;
  newId: () => string;
}

type DeliveryStatus = 'accepted' | 'failed' | 'unknown' | 'skipped';
interface MailResult { status: DeliveryStatus; provider?: 'resend' | 'formspree'; attachments?: boolean }
interface RequestContext { budget: Budget }
interface CheckFlags {
  extra_openings: boolean;
  toilet_moved: boolean;
  layout_changed: boolean;
  view_changed: boolean;
  shower_present: boolean;
  bathtub_present: boolean;
}
type CheckResult = { status: 'approved' } | { status: 'rejected'; reason: string; flags: CheckFlags } | { status: 'unavailable' } | { status: 'disabled' };

/** Each factory owns its best-effort counters. Tests inject HTTP, clock and IDs. */
export function createHandler(overrides: Partial<BadplanerDependencies> = {}) {
  const dependencies: BadplanerDependencies = {
    fetch: globalThis.fetch.bind(globalThis),
    env: process.env,
    clock: { now: () => Date.now(), setTimeout: (fn, ms) => setTimeout(fn, ms), clearTimeout: (timer) => clearTimeout(timer) },
    sleep: (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)),
    newId: () => `bp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    ...overrides,
  };
  const env = dependencies.env;
  const ipCounter = new Map<string, { date: string; count: number }>();
  const globalCounter = { date: '', count: 0 };

async function request(ctx: RequestContext, url: string, init: RequestInit = {}, timeout = 8000, bytes = false) {
  return ctx.budget.run(timeout, async (signal) => {
    const response = await dependencies.fetch(url, { ...init, signal, redirect: 'error' });
    // Keep the timeout active while consuming the response body, not only headers.
    if (signal.aborted) { void response.body?.cancel(); throw new TimeoutError(); }
    const limit = bytes ? MAX_SWATCH_BYTES : 6 * 1024 * 1024;
    const length = Number(response.headers.get('content-length'));
    if (length > limit) { void response.body?.cancel(); throw new Error('Provider response too large'); }
    const chunks: Uint8Array[] = [];
    let total = 0;
    const reader = response.body?.getReader();
    if (reader) {
      const cancel = () => { void reader.cancel().catch(() => undefined); };
      signal.addEventListener('abort', cancel, { once: true });
      try {
        while (true) {
          const part = await reader.read();
          if (part.done) break;
          total += part.value.byteLength;
          if (total > limit) { await reader.cancel(); throw new Error('Provider response too large'); }
          chunks.push(part.value);
        }
      } finally { signal.removeEventListener('abort', cancel); reader.releaseLock(); }
    }
    const body = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.length; }
    let json: any = null;
    if (!bytes) { try { json = JSON.parse(new TextDecoder().decode(body)); } catch { /* malformed provider response */ } }
    return { ok: response.ok, status: response.status, headers: response.headers, bytes: body, json };
  });
}

async function handler(req: any, res: any) {
  const ctx: RequestContext = { budget: new Budget(dependencies.clock, TOTAL_TIMEOUT_MS) };
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Nur POST erlaubt.' });
  }

  let body: any = req.body;
  let rawSize: number;
  try { rawSize = typeof body === 'string' ? Buffer.byteLength(body, 'utf8') : Buffer.byteLength(JSON.stringify(body ?? null), 'utf8'); }
  catch { return res.status(400).json({ ok: false, error: 'Ungültige Anfrage.' }); }
  if (rawSize > MAX_REQUEST_BYTES) return res.status(413).json({ ok: false, code: 'INPUT_TOO_LARGE', error: 'Die Anfrage ist zu gross. Bitte eine kleinere Datei wählen.' });
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = null;
    }
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ ok: false, error: 'Ungültige Anfrage.' });
  }
  // Honeypot: Bots füllen das versteckte Feld aus. Wir antworten freundlich, tun aber nichts.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return res.status(200).json({ ok: true, leadId: newId() });
  }

  try {
    if (body.kind === 'render') return await handleRender(req, res, body as RenderBody, ctx);
    if (body.kind === 'beratung') return await handleBeratung(req, res, body as BeratungBody, ctx);
    if (body.kind === 'grundriss') return await handleGrundriss(req, res, body as GrundrissBody, ctx);
    return res.status(400).json({ ok: false, error: 'Unbekannte Anfrage.' });
  } catch (err: any) {
    if (err instanceof ValidationError) return res.status(400).json({ ok: false, code: 'INVALID_SELECTION', field: err.field, error: err.message });
    if (err instanceof TimeoutError) return res.status(504).json({ ok: false, code: 'TIMEOUT', error: 'Das hat zu lange gedauert. Bitte versuchen Sie es später noch einmal.' });
    console.error('[badplaner] unerwarteter Fehler', err?.name || 'Error');
    return res.status(500).json({ ok: false, error: 'Das hat nicht geklappt. Bitte versuchen Sie es später noch einmal.' });
  }
}

/* ---------- kind: render ---------- */

async function handleRender(req: any, res: any, body: RenderBody, ctx: RequestContext) {
  const { room, isGuestWc, cistern, pkg, opts, isAtelier, individuell, tile, floorTile, base, top, basinType,
    tapSeriesOption, finish, sanitary, wall, shower, bathtub, basin, mirror, look, format,
    floorFormat, accentMode, placement, accent, requiresQuote } = normalizeSelection(body as unknown as Record<string, unknown>);

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
  if (!place) return bad(res, 'Bitte PLZ und Ort angeben.');
  if (body.consent !== true) return bad(res, 'Bitte bestätigen Sie die Datenschutzerklärung.');

  // 4. Foto: neu als data-URL im Feld `foto`, alt als { mime, data } im Feld `photo`
  const photo = readPhoto(body);
  if (!photo) return bad(res, 'Bitte ein Foto Ihres Bads (JPEG, PNG oder WebP) hochladen.');
  try {
    photo.data = normalizeBase64(photo.data, MAX_PHOTO_BASE64);
    validateImageBytes(Buffer.from(photo.data, 'base64'), photo.mime);
  } catch { return bad(res, 'Das Foto ist ungültig oder zu gross. Bitte JPEG, PNG oder WebP wählen.'); }
  if (!env.GEMINI_API_KEY) {
    console.error('[badplaner] Bilddienst nicht konfiguriert');
    return res.status(503).json({ ok: false, code: 'SERVICE_UNAVAILABLE', error: 'Der Badplaner ist im Moment nicht verfügbar. Rufen Sie uns an: ' + business.phone.display });
  }

  // 5. Limits
  const today = new Date(dependencies.clock.now()).toISOString().slice(0, 10);
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
  const dailyCap = Number(env.BADPLANER_DAILY_CAP) > 0 ? Number(env.BADPLANER_DAILY_CAP) : 60;
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

  let delivered = false;
  try {

  // 6. Swatch (Materialprobe der Wandplatte) laden: zuerst unsere Kopie, sonst Lieferant, sonst ohne
  const swatch = await loadSwatch(tile.image, tile.src || '', ctx);

  // 7. Armaturen: Essenza Aufputz verchromt, Colore in der gewählten Serie und Oberfläche,
  //    Atelier Unterputz in der gewählten Oberfläche.
  const taps = tapDescription(pkg.id as PackageId, finish, tapSeriesOption, opts.tapSeries);

  // 8. Prompt (englisch; Vorlage aus dem Test, mit eingesetzten Wahlwerten)
  const prompt = buildPrompt({
    packageName: pkg.name,
    room,
    lookPrompt: isAtelier ? look?.prompt : undefined,
    format: format.replace('x', '×'),
    tilePrompt: tile.prompt,
    floorFormat: floorTile ? floorFormat.replace('x', '×') : undefined,
    floorPrompt: floorTile ? floorTile.prompt : undefined,
    accentPlacementPrompt: accent ? placement?.prompt : undefined,
    accentPrompt: accent ? accent.prompt : undefined,
    wallPrompt: wall.prompt,
    showerPrompt: shower?.prompt,
    bathtubPrompt: bathtub?.prompt,
    wantsShower: shower ? shower.id !== 'keine' : false,
    wantsBathtub: bathtub ? bathtub.id !== 'keine' : false,
    sanitaryPrompt: sanitary.prompt,
    basinPrompt: basin.prompt,
    basinTypePrompt: basinType?.prompt,
    topPrompt: top.prompt,
    basePrompt: base.prompt,
    mirrorPrompt: mirror.prompt,
    tapPrompt: isGuestWc ? `washbasin tap in ${finish.prompt}; no shower mixer, bath filler or shower controls` : taps.prompt,
    withSwatch: !!swatch,
    windows,
    cistern,
  });

  // 9. Auswahl in Klartext: dieselben Zeilen für Lead- und Kundenmail. Sie
  // werden vor der Prüfung aufgebaut, damit NLD den bereits erfassten Lead
  // auch dann erhält, wenn kein Ideenbild sicher angezeigt werden darf.
  const packageLabel = requiresQuote
    ? `${pkg.name} – Individuelle Offerte`
    : `${pkg.name} (ab CHF ${pkg.priceLabel})`;
  const auswahl: [string, string][] = [];
  const row = (label: string, value: string) => auswahl.push([label, value]);
  row('Raum', isGuestWc ? 'Gäste-WC' : 'Badezimmer');
  row(isGuestWc ? 'Stilrichtung' : 'Paket', packageLabel);
  if (look) row('Look', look.label);
  row('Format', `${format.replace('x', '×')} cm`);
  row(floorTile ? 'Platten Wand' : 'Platten', tileName(tile));
  if (floorTile) row('Platten Boden', `${tileName(floorTile)}, ${floorFormat.replace('x', '×')} cm`);
  if (isAtelier && accentMode) row('Kombination', accentMode.label);
  if (accent && placement) {
    row('Akzentfläche', placement.label);
    row('Akzentmaterial', `${accent.supplier} ${accent.label}`);
  }
  row('Wandplatten', isGuestWc && wall.id === 'halbhoch'
    ? 'Wände bis ca. 120 cm, oberhalb weiss gestrichen'
    : wall.label);
  if (shower) row('Dusche', shower.label);
  if (bathtub) row('Badewanne', bathtub.label);
  row('Unterbau', `${base.label} (${base.supplier})`);
  row('Waschtischplatte', `${top.label} (${top.supplier})`);
  if (basinType) row('Waschbecken', basinType.label);
  row('Armatur', taps.label);
  row('Sanitärkeramik', `${sanitary.label} (${sanitary.supplier})`);
  row('Waschtisch', basin.label);
  row('Spiegel', mirror.label);

  const leadId = newId();
  const photoName = photo.mime === 'image/png' ? 'foto.png' : photo.mime === 'image/webp' ? 'foto.webp' : 'foto.jpg';
  const leadDetails = (checkStatus: string, imageStatus?: string): [string, string][] => [
    ['Name', name],
    ['Telefon / WhatsApp', phone],
    ['E-Mail', email],
    ['PLZ / Ort', place || '–'],
    ...auswahl,
    ['Fenster laut Kunde', windows === '0' ? 'keine' : windows === '3' ? '3 oder mehr' : windows],
    ['WC / Spülkasten', cistern === 'aufputz'
      ? 'Aufputz, ersetzt durch Sanitärmodul (im Fixpreis enthalten)'
      : 'Unterputz'],
    ['Muster', swatch ? 'geladen' : 'nicht geladen'],
    ['Fensterprüfung', checkStatus],
    ...(imageStatus ? [['Ideenbild', imageStatus] as [string, string]] : []),
    ['Newsletter', newsletter ? 'ja' : 'nein'],
    ['Zeitpunkt', swissTime()],
    ['Seite', req.headers?.referer || req.headers?.referrer || '/badplaner'],
    ['Lead-ID', leadId],
  ];

  // A full retry needs 50s generation + 20s check + 25s delivery. With a 105s
  // deadline it is intentionally possible only after a first pass under 10s.
  let gen = await generateImage(prompt, photo, swatch, ctx);
  if (gen.ok === false) return res.status(502).json({ ok: false, error: gen.error });
  let checkNote = 'ok';
  const wantedFixtures = { room, shower: shower ? shower.id !== 'keine' : false, bathtub: bathtub ? bathtub.id !== 'keine' : false, cistern };
  const checkWithUnavailableRetry = async (image: { mime: string; data: string }): Promise<CheckResult> => {
    let result = await checkOpenings(photo, image, wantedFixtures, ctx);
    if (result.status === 'unavailable'
      && ctx.budget.remaining() >= CHECK_RETRY_DELAY_MS + CHECK_TIMEOUT_MS + DELIVERY_RESERVE_MS) {
      await dependencies.sleep(CHECK_RETRY_DELAY_MS);
      result = await checkOpenings(photo, image, wantedFixtures, ctx);
    }
    return result;
  };
  let check = await checkWithUnavailableRetry(gen);
  let checkAttempt = 1;
  if (check.status === 'rejected') logRejectedCheck(check, checkAttempt);
  if (check.status === 'rejected' && ctx.budget.remaining() >= GEMINI_TIMEOUT_MS + CHECK_TIMEOUT_MS + DELIVERY_RESERVE_MS) {
    // The rejected image never becomes a fallback if the retry/check fails.
    const retryPrompt = `${prompt}\nIMPORTANT: a previous attempt failed the structural and fixture check: ${check.reason}. Correct that exact issue. Keep the original layout, every opening and toilet position, and show exactly the requested shower and bathtub state.`;
    const second = await generateImage(retryPrompt, photo, swatch, ctx);
    if (second.ok === false) return res.status(502).json({ ok: false, code: 'RENDER_FAILED', error: second.error });
    check = await checkWithUnavailableRetry(second);
    gen = second;
    checkAttempt = 2;
    if (check.status === 'rejected') logRejectedCheck(check, checkAttempt);
    if (check.status === 'approved') checkNote = '1. Versuch verworfen, 2. Versuch ok';
  }
  if (check.status === 'rejected') {
    const rejectedNote = `abgelehnt: ${check.reason}`;
    const leadDelivery = await sendLeadMail({
      subject: `Badplaner-Lead: ${name} – ${isGuestWc ? 'Gäste-WC' : pkg.name} – Ideenbild abgelehnt`,
      replyTo: email,
      intro: 'Neuer Lead aus dem Badplaner. Das Ideenbild wurde von der automatischen Prüfung abgelehnt und dem Kunden nicht angezeigt. Das Originalfoto ist im Anhang.',
      details: leadDetails(rejectedNote, 'abgelehnt (Prüfung), nicht angezeigt'),
      attachments: [{ filename: photoName, content: photo.data }],
    }, ctx);
    return res.status(502).json({
      ok: false, code: 'RENDER_REJECTED',
      delivery: { lead: leadDelivery.status, leadProvider: leadDelivery.provider, leadAttachments: leadDelivery.attachments },
      error: 'Das Ideenbild konnte nicht sicher bestätigt werden und wird nicht angezeigt. Bitte später erneut versuchen oder uns direkt kontaktieren.',
    });
  }
  if (check.status === 'unavailable') checkNote = 'nicht möglich (Prüfdienst nicht erreichbar)';
  if (check.status === 'disabled') checkNote = 'deaktiviert';
  console.log('[badplaner] Fensterprüfung:', checkNote);

  // 11. Lead-Mail an NLD (Resend mit Anhängen, sonst Formspree ohne Bilder)
  const imageName = gen.mime === 'image/png' ? 'ideenbild.png' : 'ideenbild.jpg';
  const details = leadDetails(checkNote);
  const leadDelivery = await sendLeadMail({
    subject: `Badplaner-Lead: ${name} – ${isGuestWc ? 'Gäste-WC' : pkg.name}`,
    replyTo: email,
    intro: 'Neuer Lead aus dem Badplaner. Foto und Ideenbild im Anhang.',
    details,
    attachments: [
      { filename: photoName, content: photo.data },
      { filename: imageName, content: gen.data },
    ],
  }, ctx);
  if (leadDelivery.status !== 'accepted') return res.status(502).json({
    ok: false, code: 'LEAD_DELIVERY_FAILED', delivery: { lead: leadDelivery.status },
    error: 'Ihre Anfrage konnte nicht bestätigt werden. Bitte kontaktieren Sie uns telefonisch; die Zustellung ist möglicherweise unklar.',
  });

  // Customer mail failure preserves the approved image, with an explicit warning.
  const customerDelivery = await sendCustomerMail({
    to: email,
    name,
    pkg,
    individuell,
    auswahl,
    image: { mime: gen.mime, data: gen.data, filename: imageName },
  }, ctx);

  // 13. Newsletter (nur wenn angehakt und RESEND_AUDIENCE_ID gesetzt ist)
  const newsletterDelivery = newsletter ? await subscribeNewsletter(email, name, ctx) : { status: 'skipped' as const };

  // 14. Antwort mit Tageszähler-Cookie
  res.setHeader('Set-Cookie', counterCookie(cookie + 1, today));
  delivered = true;
  return res.status(200).json({ ok: true, leadId, image: { mime: gen.mime, data: gen.data }, delivery: {
    lead: leadDelivery.status, leadProvider: leadDelivery.provider, leadAttachments: leadDelivery.attachments,
    customer: customerDelivery.status, newsletter: newsletterDelivery.status,
  } });
  } finally {
    if (!delivered) {
      const current = ipCounter.get(ip);
      if (current?.date === today) {
        if (current.count <= 1) ipCounter.delete(ip);
        else ipCounter.set(ip, { date: today, count: current.count - 1 });
      }
      if (globalCounter.date === today) globalCounter.count = Math.max(0, globalCounter.count - 1);
    }
  }
}

/* ---------- kind: beratung ---------- */

async function handleBeratung(req: any, res: any, body: BeratungBody, ctx: RequestContext) {
  const room = text(body.raum, 20);
  if (room !== 'badezimmer' && room !== 'gaeste-wc') return bad(res, 'Bitte Badezimmer oder Gäste-WC wählen.');
  const priorities = text(body.priorities, 3000);
  const measurements = text(body.measurements, 1000);
  const style = text(body.style, 120);
  const budget = text(body.budget, 120);
  const name = text(body.name, 120);
  const phone = text(body.telefon ?? body.phone, 60);
  const email = text(body.email, 120);
  const imageWanted = body.imageWanted === true;
  const newsletter = body.newsletter === true;
  if (!priorities) return bad(res, 'Bitte beschreiben Sie kurz, was Sie verändern möchten und was Ihnen wichtig ist.');
  if (!name || !phone || !email) return bad(res, 'Bitte Name, Telefonnummer und E-Mail-Adresse angeben.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return bad(res, 'Die E-Mail-Adresse sieht nicht richtig aus.');
  if (body.consent !== true) return bad(res, 'Bitte bestätigen Sie die Datenschutzerklärung.');

  const attachments: { filename: string; content: string }[] = [];
  let fileLabel = 'keine Datei';
  if (body.file) {
    const f = body.file;
    if (typeof f.data !== 'string' || f.data.length > MAX_FILE_BASE64) return bad(res, 'Die Datei ist zu gross (übertragen max. 3 MB).');
    if (!/^(image\/(jpeg|png|webp)|application\/pdf)$/.test(f.mime || '')) return bad(res, 'Bitte ein Bild (JPEG, PNG, WebP) oder ein PDF hochladen.');
    try {
      f.data = normalizeBase64(f.data, MAX_FILE_BASE64);
      const bytes = Buffer.from(f.data, 'base64');
      if (f.mime === 'application/pdf') {
        if (bytes.length < 8 || bytes.subarray(0, 5).toString('ascii') !== '%PDF-') throw new Error('Invalid PDF');
      } else validateImageBytes(bytes, f.mime);
    } catch { return bad(res, 'Die Datei ist ungültig oder zu gross.'); }
    if (imageWanted && !f.mime.startsWith('image/')) return bad(res, 'Für ein Ideenbild benötigen wir ein Foto des Raums.');
    const ext = f.mime === 'application/pdf' ? 'pdf' : f.mime === 'image/png' ? 'png' : f.mime === 'image/webp' ? 'webp' : 'jpg';
    fileLabel = `beratung.${ext}`;
    attachments.push({ filename: fileLabel, content: f.data });
  }
  if (imageWanted && attachments.length === 0) return bad(res, 'Für ein Ideenbild benötigen wir ein Foto des Raums.');

  const leadId = newId();
  const details: [string, string][] = [
    ['Name', name],
    ['Telefon / WhatsApp', phone],
    ['E-Mail', email],
    ['Raum', room === 'gaeste-wc' ? 'Gäste-WC' : 'Badezimmer'],
    ['Wünsche und Prioritäten', priorities],
    ['Masse oder Angaben zum Raum', measurements || 'nicht angegeben'],
    ['Stilpräferenz', style || 'offen'],
    ['Budgetrahmen', budget || 'nicht angegeben'],
    ['Foto, Masse oder Plan', fileLabel],
    ['Ideenbild gewünscht', imageWanted ? 'ja, nach persönlicher Prüfung' : 'nein'],
    ['Newsletter', newsletter ? 'ja' : 'nein'],
    ['Zeitpunkt', swissTime()],
    ['Seite', req.headers?.referer || req.headers?.referrer || '/badplaner'],
    ['Lead-ID', leadId],
  ];
  const delivery = await sendLeadMail({
    subject: `Individuelle Beratung: ${name} – ${room === 'gaeste-wc' ? 'Gäste-WC' : 'Badezimmer'}`,
    replyTo: email,
    intro: 'Neue Anfrage für eine individuelle Beratung oder Besichtigung. Bitte zuerst anhand der Angaben, der Datei oder telefonisch beurteilen und danach bei Bedarf einen Besichtigungstermin vereinbaren.',
    details,
    attachments,
  }, ctx);
  if (delivery.status !== 'accepted') return res.status(502).json({ ok: false, code: 'LEAD_DELIVERY_FAILED', error: 'Ihre Anfrage konnte nicht bestätigt werden. Bitte kontaktieren Sie uns telefonisch.' });
  if (attachments.length && !delivery.attachments) return res.status(502).json({ ok: false, code: 'ATTACHMENT_NOT_DELIVERED', error: 'Die Angaben wurden weitergeleitet, aber der Anhang konnte nicht zugestellt werden. Bitte senden Sie die Datei per WhatsApp.' });
  const newsletterDelivery = newsletter ? await subscribeNewsletter(email, name, ctx) : { status: 'skipped' as const };
  return res.status(200).json({ ok: true, leadId, delivery: { lead: delivery.status, newsletter: newsletterDelivery.status } });
}

/* ---------- kind: grundriss ---------- */

async function handleGrundriss(req: any, res: any, body: GrundrissBody, ctx: RequestContext) {
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
    if (typeof f.data !== 'string' || f.data.length > MAX_FILE_BASE64) return bad(res, 'Die Datei ist zu gross (übertragen max. 3 MB).');
    if (!/^(image\/(jpeg|png|webp)|application\/pdf)$/.test(f.mime || '')) return bad(res, 'Bitte ein Bild (JPEG, PNG, WebP) oder ein PDF hochladen.');
    try {
      f.data = normalizeBase64(f.data, MAX_FILE_BASE64);
      const bytes = Buffer.from(f.data, 'base64');
      if (f.mime === 'application/pdf') {
        if (bytes.length < 8 || bytes.subarray(0, 5).toString('ascii') !== '%PDF-') throw new Error('Invalid PDF');
      } else validateImageBytes(bytes, f.mime);
    } catch { return bad(res, 'Die Datei ist ungültig oder zu gross.'); }
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
  const delivery = await sendLeadMail({
    subject: `Badplaner-Grundriss: ${name}`,
    intro: 'Ergänzung zu einem Badplaner-Lead (Grundriss / Grösse / Bemerkung).',
    details,
    attachments,
  }, ctx);
  if (delivery.status !== 'accepted') return res.status(502).json({ ok: false, code: 'LEAD_DELIVERY_FAILED', error: 'Die Ergänzung konnte nicht bestätigt werden. Bitte kontaktieren Sie uns direkt.' });
  if (attachments.length && !delivery.attachments) return res.status(502).json({
    ok: false, code: 'ATTACHMENT_NOT_DELIVERED', delivery: { lead: delivery.status, leadAttachments: false },
    error: 'Die Angaben wurden weitergeleitet, aber der Anhang konnte nicht zugestellt werden. Bitte senden Sie die Datei per WhatsApp oder kontaktieren Sie uns direkt.',
  });
  return res.status(200).json({ ok: true, delivery: { lead: delivery.status, leadAttachments: delivery.attachments } });
}

/* ---------- Auswahl auflösen ---------- */

/** Lieferant, Serie und Farbe, ohne Doppelung wenn die Serie so heisst wie die Farbe. */
function tileName(t: { supplier: string; series: string; color: string }): string {
  return t.series === t.color ? `${t.supplier} ${t.series}` : `${t.supplier} ${t.series} ${t.color}`;
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
 * Armaturen je Paket: Essenza Aufputz verchromt (keine Auswahl), Colore mit gewählter Oberfläche
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
        ? `${series.prompt.replace('in polished chrome', `in ${finish.prompt}`)}, all fittings for the requested fixtures from the same series and in the same ${finish.prompt} finish`
        : `fittings for the requested fixtures in ${finish.prompt}`,
      label: series ? `${series.label}, ${finish.label}` : `${seriesText}, ${finish.label}`,
    };
  }
  return {
    prompt: 'exposed surface-mounted (Aufputz) Treemme Up+ fittings in polished chrome for the requested fixtures only',
    label: seriesText,
  };
}

/* ---------- Prompt ---------- */

function buildPrompt(v: {
  packageName: string;
  room: 'badezimmer' | 'gaeste-wc';
  lookPrompt?: string;
  format: string;
  tilePrompt: string;
  floorFormat?: string;
  floorPrompt?: string;
  accentPlacementPrompt?: string;
  accentPrompt?: string;
  wallPrompt: string;
  showerPrompt?: string;
  bathtubPrompt?: string;
  wantsShower: boolean;
  wantsBathtub: boolean;
  sanitaryPrompt: string;
  basinPrompt: string;
  basinTypePrompt?: string;
  topPrompt: string;
  basePrompt: string;
  mirrorPrompt: string;
  tapPrompt: string;
  withSwatch: boolean;
  windows: string;
  cistern: 'aufputz' | 'unterputz';
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
  const fixtures = v.room === 'gaeste-wc'
    ? 'This is a guest WC: the result must contain NO shower, shower tray, shower enclosure, shower controls, bathtub or bath filler. Do not convert any visible area into a shower or bathtub.'
    : [
        v.wantsShower ? `${v.showerPrompt} inside the original wet-area footprint` : 'NO shower, shower tray, shower enclosure or shower controls',
        v.wantsBathtub ? `${v.bathtubPrompt} inside the original wet-area footprint` : 'NO bathtub and no bath filler',
      ].join('; ');
  const toilet = v.cistern === 'aufputz'
    ? `the visible surface-mounted cistern above the toilet is removed; in its place a slim sanitary module stands in front of the existing wall: tempered glass front, about 10 cm deep and about 110 cm high, with a flush button integrated at the top; the toilet is wall-hung, rimless, in ${v.sanitaryPrompt}, mounted on that module at exactly the same position as the existing toilet; the wall behind is neither moved nor opened and no new partition wall is built`
    : `the cistern is concealed inside the wall and stays concealed; no visible cistern and no sanitary module in front of the wall; the toilet is wall-hung, rimless, in ${v.sanitaryPrompt}, at exactly its existing position`;

  return [
    intro,
    `Produce a photorealistic "after renovation" photo of image 1 with these hard constraints: identical camera position, angle and lens; identical walls, ceiling, floor plan and room size; every window, door and roof window stays exactly where it is with the same size; do NOT add, remove, resize or move any window, door, niche or opening; ${windowRule} The toilet stays exactly where it is with the same orientation because its drain cannot be moved. The washbasin stays on the same wall in the same place. Radiators stay. Never create extra floor area. A bathtub-to-shower transformation must use only the original bathtub footprint.`,
    `Requested result for this ${v.room === 'gaeste-wc' ? 'guest WC' : 'bathroom'} (style "${v.packageName}"):${look} ${surfaces}; ${fixtures}; if a toilet is visible in image 1, ${toilet}; ${vanity}; ${v.tapPrompt}.${accent} Remove clutter, towels, bottles, shower curtain and rugs. Natural daylight, no people, no text.`,
  ].join('\n');
}

/* ---------- Swatch laden ---------- */

async function loadSwatch(image: string, src: string, ctx: RequestContext): Promise<Photo | null> {
  // Never derive a server-side URL from request Host / x-forwarded-host.
  const candidates = image.startsWith('/badplaner/swatches/') ? [new URL(image, business.siteUrl).href] : [];
  if (src.startsWith('https://')) candidates.push(src); // source comes only from the server-owned catalog
  const started = dependencies.clock.now();
  for (const url of candidates) {
    let status: number | 'keine Antwort' = 'keine Antwort';
    let contentType = '–';
    let byteLength = 0;
    try {
      const remaining = 8000 - (dependencies.clock.now() - started);
      if (remaining <= 0) break;
      const r = await request(ctx, url, { headers: { 'User-Agent': 'NewLivingDesign-Badplaner/1.0' } }, remaining, true);
      status = r.status;
      contentType = (r.headers.get('content-type') || '').split(';')[0].trim() || '–';
      byteLength = r.bytes.length;
      if (!r.ok || !contentType.startsWith('image/')) {
        console.warn('[badplaner] Swatch nicht geladen', url, `status=${status}`, `type=${contentType}`, `bytes=${byteLength}`);
        continue;
      }
      const bytes = r.bytes;
      const metadata = validateImageBytes(bytes, contentType, { maxBytes: MAX_SWATCH_BYTES, maxPixels: 50000000, maxSide: 12000 });
      const fileName = new URL(url).pathname.split('/').pop() || 'Muster';
      console.info('[badplaner] Swatch geladen', fileName, `${Math.ceil(bytes.length / 1024)} kB`);
      return { mime: metadata.mime, data: Buffer.from(bytes).toString('base64') };
    } catch (err: any) {
      const errorName = typeof err?.name === 'string' ? err.name : 'Error';
      const errorMessage = typeof err?.message === 'string' ? err.message.replace(/\s+/g, ' ').slice(0, 180) : 'unbekannter Fehler';
      console.warn('[badplaner] Swatch nicht geladen', url, `status=${status}`, `type=${contentType}`, `bytes=${byteLength}`, `${errorName}: ${errorMessage}`);
    }
  }
  return null;
}

/* ---------- Gemini ---------- */

type GenResult = { ok: true; mime: string; data: string } | { ok: false; error: string };

async function generateImage(prompt: string, photo: Photo, swatch: Photo | null, ctx: RequestContext): Promise<GenResult> {
  const model = env.BADPLANER_MODEL || 'gemini-3.1-flash-image';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const parts: any[] = [{ text: prompt }, { inlineData: { mimeType: photo.mime, data: photo.data } }];
  if (swatch) parts.push({ inlineData: { mimeType: swatch.mime, data: swatch.data } });

  try {
    const r = await request(ctx, url, {
      method: 'POST',
      headers: { 'x-goog-api-key': env.GEMINI_API_KEY || '', 'content-type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: { responseModalities: ['IMAGE'], imageConfig: { imageSize: '1K' } },
      }),
    }, Math.min(GEMINI_TIMEOUT_MS, Math.max(0, ctx.budget.remaining() - CHECK_TIMEOUT_MS - DELIVERY_RESERVE_MS)));
    const json = r.json;
    if (!r.ok) {
      console.error('[badplaner] Gemini-Fehler', r.status);
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
    const mime = imagePart.inlineData.mimeType;
    if (mime !== 'image/png' && mime !== 'image/jpeg') throw new Error('Unsupported generated image');
    const data = normalizeBase64(imagePart.inlineData.data, MAX_RESPONSE_BASE64);
    validateImageBytes(Buffer.from(data, 'base64'), mime);
    return { ok: true, mime, data };
  } catch (err: any) {
    const timeout = err && (err.name === 'AbortError' || err.name === 'TimeoutError');
    console.error('[badplaner] Gemini nicht erreichbar', timeout ? 'Timeout' : 'invalid response');
    return {
      ok: false,
      error: timeout
        ? 'Das hat zu lange gedauert. Bitte noch einmal versuchen.'
        : 'Der Bilddienst ist im Moment nicht erreichbar. Bitte später noch einmal versuchen.',
    };
  }
}

/* ---------- Prüfung: dazuerfundene Fenster/Türen ---------- */

/**
 * Fragt ein Gemini-Textmodell, ob das Ideenbild eine Öffnung (Fenster, Dachfenster,
 * Tür, Glasfläche) enthält, die im Foto nicht da ist. Nicht verfügbare oder
 * unlesbare Prüfungen werden vom Aufrufer separat behandelt.
 * Prüft zusätzlich, dass Kamera, Bildausschnitt und sichtbare Raumgrenzen erhalten bleiben.
 */
async function checkOpenings(
  photo: Photo,
  gen: { mime: string; data: string },
  wanted: { room: 'badezimmer' | 'gaeste-wc'; shower: boolean; bathtub: boolean; cistern: 'aufputz' | 'unterputz' },
  ctx: RequestContext,
): Promise<CheckResult> {
  const model = env.BADPLANER_CHECK_MODEL === undefined ? 'gemini-3.6-flash' : env.BADPLANER_CHECK_MODEL;
  if (!model?.trim()) return { status: 'disabled' };
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const question =
    'Image 1 is the original room. Image 2 is an edited renovation result. Compare them strictly. ' +
    'Set extra_openings true if any window, roof window, door, niche or outside opening was added, removed, resized or moved. ' +
    'Set toilet_moved true if the toilet position or orientation changed. Set layout_changed true if walls, room size, floor area or fixed fixture footprint moved. ' +
    'Set view_changed true if camera position, angle, lens, framing, perspective or visible room boundaries changed, or if image 2 reveals invented floor or wall area outside image 1. Judge only the shared visible field of view; an edited result must remain pixel-comparable to image 1. ' +
    (wanted.cistern === 'aufputz' ? 'A slim sanitary module in front of an existing wall, replacing a surface-mounted cistern, is expected in this renovation: it must NOT be reported as layout_changed, and a toilet mounted on that module at the same place must NOT be reported as toilet_moved. ' : '') +
    `The requested result is a ${wanted.room === 'gaeste-wc' ? 'guest WC' : 'bathroom'} with shower_present=${wanted.shower} and bathtub_present=${wanted.bathtub}. ` +
    'Report whether image 2 visibly contains a shower (including tray/enclosure) and a bathtub. A mirror or glass shower screen is not an opening. ' +
    'Answer with JSON only, no markdown and exactly these keys: {"extra_openings":false,"toilet_moved":false,"layout_changed":false,"view_changed":false,"shower_present":false,"bathtub_present":false,"reason":"short English reason, max 30 words"}';
  try {
    const r = await request(ctx, url, {
      method: 'POST',
      headers: { 'x-goog-api-key': env.GEMINI_API_KEY || '', 'content-type': 'application/json' },
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
    }, Math.min(CHECK_TIMEOUT_MS, Math.max(0, ctx.budget.remaining() - DELIVERY_RESERVE_MS)));
    const json = r.json;
    if (!r.ok) {
      console.error('[badplaner] Fensterprüfung fehlgeschlagen', r.status);
      return { status: 'unavailable' };
    }
    const textOut: string = json?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || '').join('') || '';
    if (json?.candidates?.[0]?.finishReason !== 'STOP') return { status: 'unavailable' };
    const parsed = JSON.parse(textOut);
    const keys = ['extra_openings', 'toilet_moved', 'layout_changed', 'view_changed', 'shower_present', 'bathtub_present'];
    if (!parsed || Array.isArray(parsed) || keys.some((key) => typeof parsed[key] !== 'boolean') || typeof parsed.reason !== 'string'
      || !parsed.reason.trim() || parsed.reason.length > 200
      || Object.keys(parsed).some((key) => ![...keys, 'reason'].includes(key))) return { status: 'unavailable' };
    const flags: CheckFlags = {
      extra_openings: parsed.extra_openings,
      toilet_moved: parsed.toilet_moved,
      layout_changed: parsed.layout_changed,
      view_changed: parsed.view_changed,
      shower_present: parsed.shower_present,
      bathtub_present: parsed.bathtub_present,
    };
    const rejected = flags.extra_openings || flags.toilet_moved || flags.layout_changed || flags.view_changed
      || flags.shower_present !== wanted.shower || flags.bathtub_present !== wanted.bathtub;
    return rejected ? { status: 'rejected', reason: parsed.reason.slice(0, 200), flags } : { status: 'approved' };
  } catch {
    console.error('[badplaner] Fensterprüfung nicht möglich');
    return { status: 'unavailable' };
  }
}

function logRejectedCheck(check: Extract<CheckResult, { status: 'rejected' }>, attempt: number) {
  console.warn('[badplaner] Fensterprüfung abgelehnt', {
    attempt,
    reason: check.reason,
    flags: check.flags,
  });
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
 * einer eindeutigen Ablehnung geht er ohne Bilder an Formspree. Es gibt noch
 * keine persistente Lead-Ablage; ein unklarer Versand wird nicht automatisch wiederholt.
 */
async function sendLeadMail(mail: LeadMail, ctx: RequestContext): Promise<MailResult> {
  const key = env.RESEND_API_KEY;
  if (key) {
    try {
      const r = await request(ctx, 'https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          from: mailFrom(),
          to: [env.BADPLANER_TO || business.email],
          cc: [env.BADPLANER_CC || business.emailSecondary],
          reply_to: mail.replyTo,
          subject: mail.subject,
          html: leadHtml(mail),
          text: leadText(mail),
          attachments: mail.attachments,
        }),
      });
      if (r.ok && typeof r.json?.id === 'string' && r.json.id) return { status: 'accepted', provider: 'resend', attachments: true };
      if (r.ok) return { status: 'unknown', provider: 'resend' };
      console.error('[badplaner] Resend-Fehler', r.status);
    } catch {
      // A timeout/network error can occur after acceptance; do not duplicate it blindly.
      console.error('[badplaner] Resend-Zustellung unklar');
      return { status: 'unknown', provider: 'resend' };
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
    const r = await request(ctx, business.formspreeEndpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(fields),
    });
    if (r.ok && r.json?.ok === true) return { status: 'accepted', provider: 'formspree', attachments: false };
    if (r.ok) return { status: 'unknown', provider: 'formspree' };
    console.error('[badplaner] Formspree-Fehler', r.status);
    return { status: 'failed', provider: 'formspree' };
  } catch {
    console.error('[badplaner] Formspree-Zustellung unklar');
    return { status: 'unknown', provider: 'formspree' };
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
 * und der Status wird separat vom freigegebenen Bild an den Client zurückgegeben.
 */
async function sendCustomerMail(v: {
  to: string;
  name: string;
  pkg: BathPackage;
  individuell: boolean;
  auswahl: [string, string][];
  image: { mime: string; data: string; filename: string };
}, ctx: RequestContext): Promise<MailResult> {
  const key = env.RESEND_API_KEY;
  if (!key) {
    console.warn('[badplaner] RESEND_API_KEY fehlt, Kundenmail wird übersprungen');
    return { status: 'skipped' };
  }
  const imageCid = 'ideenbild';
  const mail = customerMail({ name: v.name, pkg: v.pkg, individuell: v.individuell, auswahl: v.auswahl, imageCid });
  try {
    const r = await request(ctx, 'https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from: mailFrom(),
        to: [v.to],
        reply_to: env.BADPLANER_TO || business.email,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        attachments: [
          // einmal eingebettet (grosses Bild im Text) und einmal als Datei zum Behalten
          { filename: v.image.filename, content: v.image.data, content_type: v.image.mime, content_id: imageCid },
          { filename: v.image.filename, content: v.image.data, content_type: v.image.mime },
        ],
      }),
    }, 6000);
    if (!r.ok) {
      console.error('[badplaner] Kundenmail nicht versendet', r.status);
      return { status: 'failed', provider: 'resend' };
    }
    if (typeof r.json?.id !== 'string' || !r.json.id) return { status: 'unknown', provider: 'resend' };
    return { status: 'accepted', provider: 'resend' };
  } catch {
    console.error('[badplaner] Kundenmail-Zustellung unklar');
    return { status: 'unknown', provider: 'resend' };
  }
}

/* ---------- Newsletter (Resend Audience) ---------- */

/**
 * Legt den Kontakt in der Resend-Audience an. Ohne RESEND_AUDIENCE_ID passiert
 * nichts; Fehler werden als eigener Status gemeldet und blockieren das Bild nicht.
 */
async function subscribeNewsletter(email: string, name: string, ctx: RequestContext): Promise<MailResult> {
  const key = env.RESEND_API_KEY;
  const audience = env.RESEND_AUDIENCE_ID;
  if (!key || !audience) {
    console.log('[badplaner] Newsletter angehakt, aber RESEND_AUDIENCE_ID fehlt: nur im Lead-Mail vermerkt');
    return { status: 'skipped' };
  }
  try {
    const parts = name.split(/\s+/).filter(Boolean);
    const r = await request(ctx, `https://api.resend.com/audiences/${encodeURIComponent(audience)}/contacts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        email,
        first_name: parts[0] || '',
        last_name: parts.slice(1).join(' '),
        unsubscribed: false,
      }),
    }, 2000);
    if (!r.ok) {
      console.log('[badplaner] Newsletter-Eintrag nicht möglich', r.status);
      return { status: 'failed', provider: 'resend' };
    }
    return { status: typeof r.json?.id === 'string' && r.json.id ? 'accepted' : 'unknown', provider: 'resend' };
  } catch {
    return { status: 'unknown', provider: 'resend' };
  }
}

/* ---------- Hilfen ---------- */

function mailFrom(): string {
  return env.BADPLANER_FROM || 'Badplaner <badplaner@newlivingdesign.ch>';
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
  return dependencies.newId();
}

function swissTime(): string {
  try {
    return new Intl.DateTimeFormat('de-CH', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Zurich' }).format(new Date(dependencies.clock.now()));
  } catch {
    return new Date(dependencies.clock.now()).toISOString();
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
  let value: string;
  try { value = decodeURIComponent(m[1]); } catch { return 0; }
  const [count, date] = value.split(':');
  if (date !== today) return 0;
  const n = parseInt(count, 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function counterCookie(count: number, today: string): string {
  return `${COOKIE_NAME}=${count}:${today}; Path=/api/badplaner; Max-Age=86400; HttpOnly; Secure; SameSite=Lax`;
}

return handler;
}

export default createHandler();
