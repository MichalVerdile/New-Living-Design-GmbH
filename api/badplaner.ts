/**
 * Badplaner-API (Vercel Serverless Function, Node-Runtime).
 *
 * POST /api/badplaner mit JSON-Body:
 *   kind: 'render'     Foto + Ausstattung -> Ideenbild (Gemini), Lead per E-Mail
 *   kind: 'grundriss'  Grundriss/m²/Bemerkung zu einem bestehenden Lead per E-Mail
 *
 * Umgebungsvariablen (Vercel > Settings > Environment Variables):
 *   GEMINI_API_KEY       Pflicht. API-Schlüssel von Google AI Studio (Bildmodell).
 *   RESEND_API_KEY       E-Mail-Versand mit Anhängen über Resend. Fehlt er oder
 *                        schlägt der Versand fehl, geht der Lead ohne Bilder an Formspree.
 *   BADPLANER_TO         Empfänger (Default diego.verdile@newlivingdesign.ch)
 *   BADPLANER_CC         Kopie (Default emanuel.verdile@newlivingdesign.ch)
 *   BADPLANER_FROM       Absender (Default "Badplaner <badplaner@newlivingdesign.ch>",
 *                        Domain muss bei Resend verifiziert sein)
 *   BADPLANER_DAILY_CAP  Maximale Ideenbilder pro Tag insgesamt (Default 60)
 *   BADPLANER_MODEL      Gemini-Modell (Default gemini-3.1-flash-image)
 *   BADPLANER_CHECK_MODEL Gemini-Textmodell für die Fensterprüfung (Default gemini-3.6-flash);
 *                        leer lassen = keine Prüfung
 *
 * Fotos und Ideenbilder werden NICHT gespeichert (kein Blob, kein KV): sie gehen
 * nur an Google zur Bilderzeugung und per E-Mail an uns. Siehe /datenschutz#badplaner.
 */
/* eslint-disable @typescript-eslint/no-explicit-any -- keine @vercel/node-Typen im Projekt, req/res sind deshalb any */
import { optionsForPackage, type PackageId } from '../src/data/badplaner.js';
import { business, bathPackages } from '../src/config/business.js';

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

/* ---------- Typen ---------- */

interface RenderBody {
  kind: 'render';
  package: PackageId;
  tile: string;
  furniture: string;
  finish: string;
  sanitary: string;
  wall?: string; // Wandhöhe der Platten (fehlt bei alten Clients → Standard)
  windows?: string; // Fenster auf dem Foto: '0' | '1' | '2' | '3' (3 = drei oder mehr), fehlt bei alten Clients
  shower: string;
  basin: string;
  mirror: string;
  name: string;
  phone: string;
  email?: string;
  place?: string;
  consent: boolean;
  photo: { mime: string; data: string };
  website?: string; // Honeypot, muss leer sein
}

interface GrundrissBody {
  kind: 'grundriss';
  leadId: string;
  name: string;
  phone: string;
  sqm?: string | number;
  note?: string;
  file?: { name: string; mime: string; data: string };
  website?: string;
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
  // 1. Validierung
  const pkg = bathPackages.find((p) => p.id === body.package);
  if (!pkg) return bad(res, 'Bitte wählen Sie ein Paket.');
  const opts = optionsForPackage(pkg.id);
  const tile = opts.tiles.find((t) => t.id === body.tile);
  const furniture = opts.furniture.find((f) => f.id === body.furniture);
  const finish = opts.finishes.find((f) => f.id === body.finish);
  const sanitary = opts.sanitary.find((s) => s.id === body.sanitary);
  const wall = opts.walls.find((w) => w.id === (body.wall || opts.walls[0].id));
  const shower = opts.showers.find((s) => s.id === body.shower);
  const basin = opts.basins.find((b) => b.id === body.basin);
  const mirror = opts.mirrors.find((m) => m.id === body.mirror);
  if (!tile || !furniture || !finish || !sanitary || !wall || !shower || !basin || !mirror) {
    return bad(res, 'Die Ausstattung passt nicht zum gewählten Paket. Bitte Auswahl prüfen.');
  }
  const windows = typeof body.windows === 'string' && /^[0-3]$/.test(body.windows) ? body.windows : '';
  const name = text(body.name, 120);
  const phone = text(body.phone, 60);
  const email = text(body.email, 120);
  const place = text(body.place, 120);
  if (!name || !phone) return bad(res, 'Bitte Name und Telefonnummer angeben.');
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return bad(res, 'Die E-Mail-Adresse sieht nicht richtig aus.');
  if (body.consent !== true) return bad(res, 'Bitte bestätigen Sie die Datenschutzerklärung.');
  const photo = body.photo;
  if (!photo || typeof photo.data !== 'string' || !/^image\/(jpeg|png|webp)$/.test(photo.mime || '')) {
    return bad(res, 'Bitte ein Foto Ihres Bads (JPEG, PNG oder WebP) hochladen.');
  }
  if (photo.data.length < 1000) return bad(res, 'Das Foto ist leer oder beschädigt.');
  if (photo.data.length > MAX_PHOTO_BASE64) return bad(res, 'Das Foto ist zu gross. Bitte ein kleineres Bild wählen.');
  if (!/^[A-Za-z0-9+/=\r\n]+$/.test(photo.data)) return bad(res, 'Das Foto konnte nicht gelesen werden.');
  if (!process.env.GEMINI_API_KEY) {
    console.error('[badplaner] GEMINI_API_KEY fehlt');
    return res.status(503).json({ ok: false, error: 'Der Badplaner ist im Moment nicht verfügbar. Rufen Sie uns an: ' + business.phone.display });
  }

  // 2. Limits
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

  // 3. Swatch (Materialprobe) laden: zuerst unsere Kopie, sonst Lieferant, sonst ohne
  const swatch = await loadSwatch(req, tile.image, tile.src);

  // 4. Prompt (englisch; Vorlage aus dem Test, mit eingesetzten Wahlwerten)
  const prompt = buildPrompt({
    packageName: pkg.name,
    packageId: pkg.id,
    format: tile.format.replace('x', '×'),
    tilePrompt: tile.prompt,
    wallPrompt: wall.prompt,
    showerPrompt: shower.prompt,
    sanitaryPrompt: sanitary.prompt,
    basinPrompt: basin.prompt,
    furniturePrompt: furniture.prompt,
    mirrorPrompt: mirror.prompt,
    finishPrompt: finish.prompt,
    tapSeries: opts.tapSeries,
    withSwatch: !!swatch,
    windows,
  });

  // 5. Bild erzeugen, dann prüfen, ob das Modell Fenster/Türen dazuerfunden hat.
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

  // 6. Lead per E-Mail (Resend mit Anhängen, sonst Formspree ohne Bilder)
  const leadId = newId();
  const details: [string, string][] = [
    ['Name', name],
    ['Telefon / WhatsApp', phone],
    ['E-Mail', email || '–'],
    ['PLZ / Ort', place || '–'],
    ['Paket', `${pkg.name} (ab CHF ${pkg.priceLabel})`],
    ['Platte', `${tile.supplier} ${tile.series} ${tile.color}, ${tile.format} cm`],
    ['Möbelfarbe', `${furniture.label} (${furniture.supplier})`],
    ['Armatur', `${finish.label}, ${opts.tapSeries}`],
    ['Sanitärkeramik', `${sanitary.label} (${sanitary.supplier})`],
    ['Wandplatten', wall.label],
    ['Fenster laut Kunde', windows === '' ? 'keine Angabe' : windows === '0' ? 'keine' : windows === '3' ? '3 oder mehr' : windows],
    ['Fensterprüfung', checkNote],
    ['Dusche / Wanne', shower.label],
    ['Waschtisch', basin.label],
    ['Spiegel', mirror.label],
    ['Zeitpunkt', swissTime()],
    ['Seite', req.headers?.referer || req.headers?.referrer || '/badplaner'],
    ['Lead-ID', leadId],
  ];
  const subject = `Badplaner-Lead: ${name} – Paket ${pkg.name}`;
  await sendLeadMail({
    subject,
    replyTo: email || undefined,
    intro: 'Neuer Lead aus dem Badplaner. Foto und Ideenbild im Anhang.',
    details,
    attachments: [
      { filename: 'foto.jpg', content: photo.data },
      { filename: gen.mime === 'image/png' ? 'ideenbild.png' : 'ideenbild.jpg', content: gen.data },
    ],
  });

  // 7. Antwort mit Tageszähler-Cookie
  res.setHeader('Set-Cookie', counterCookie(cookie + 1, today));
  return res.status(200).json({ ok: true, leadId, image: { mime: gen.mime, data: gen.data } });
}

/* ---------- kind: grundriss ---------- */

async function handleGrundriss(req: any, res: any, body: GrundrissBody) {
  const name = text(body.name, 120);
  const phone = text(body.phone, 60);
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

/* ---------- Prompt ---------- */

function buildPrompt(v: {
  packageName: string;
  packageId: PackageId;
  format: string;
  tilePrompt: string;
  wallPrompt: string;
  showerPrompt: string;
  sanitaryPrompt: string;
  basinPrompt: string;
  furniturePrompt: string;
  mirrorPrompt: string;
  finishPrompt: string;
  tapSeries: string;
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
  return [
    intro,
    `Produce a photorealistic "after renovation" photo of image 1 with these hard constraints: identical camera position, angle and lens; identical walls, ceiling, floor plan and room size; every window, door and roof window stays exactly where it is with the same size; do NOT add any window, door, niche or opening that is not visible in image 1; ${windowRule} The toilet stays exactly where it is, same orientation (the drain cannot be moved); the washbasin stays on the same wall in the same place; radiators stay; the bathtub or shower stays in the same place.`,
    `Changes (package "${v.packageName}"): the floor tiled with ${v.format} cm ${v.tilePrompt} tiles${asSample}; ${v.wallPrompt}; ${v.showerPrompt} where the bathtub/shower is now; wall-hung rimless toilet in ${v.sanitaryPrompt} at the existing position; ${v.basinPrompt} on a wall-hung vanity in ${v.furniturePrompt}; ${v.mirrorPrompt} above the basin; ${v.finishPrompt} fittings (${v.tapSeries}). Remove clutter, towels, bottles, shower curtain and rugs. Natural daylight, no people, no text.`,
  ].join('\n');
}

/* ---------- Swatch laden ---------- */

async function loadSwatch(req: any, image: string, src: string): Promise<{ mime: string; data: string } | null> {
  const host = (req.headers?.['x-forwarded-host'] || req.headers?.host || '').toString().split(',')[0].trim();
  const candidates = [];
  if (host) candidates.push(`https://${host}${image}`);
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

async function generateImage(prompt: string, photo: { mime: string; data: string }, swatch: { mime: string; data: string } | null): Promise<GenResult> {
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
async function checkOpenings(photo: { mime: string; data: string }, gen: { mime: string; data: string }): Promise<{ extra: boolean; reason: string } | null> {
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

/* ---------- E-Mail ---------- */

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
          from: process.env.BADPLANER_FROM || 'Badplaner <badplaner@newlivingdesign.ch>',
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

/* ---------- Hilfen ---------- */

function bad(res: any, error: string) {
  return res.status(400).json({ ok: false, error });
}

function text(v: unknown, max: number): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
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
