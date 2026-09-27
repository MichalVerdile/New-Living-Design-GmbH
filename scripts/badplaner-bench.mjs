/**
 * Pruefstand des Badplaners (Diego, 27.09.: "misurare invece di indovinare"). Ruft den echten Handler auf, mit echten
 * Aufrufen an Gemini, aber ohne Mails: jede Mail, jedes erzeugte Bild und jede Antwort der Pruefung landet in einem
 * Ordner. So laesst sich dieselbe Probe mehrmals laufen lassen und zaehlen, wie oft ein Punkt gelingt.
 *
 *   GEMINI_API_KEY=... node scripts/badplaner-bench.mjs <faelle.json> <ausgabe> [--runs 3] [--only P1,P5] [--parallel 3]
 *     [--env BADPLANER_MODEL=...] [--list-models] [--dry]
 *
 * faelle.json: [{ "name": "P1", "photo": "fotos/P1.jpg", "paket": "atelier", "fields": { "dusche": "walk-in", ... } }]
 * Die Proben P1 bis P10 der siebten Probe stehen in scripts/badplaner-bench-faelle.json; die Fotos dazu legt man als
 * fotos/P1.jpg usw. neben eine Kopie dieser Datei, ausserhalb des Repositorys. Die Pfade gelten relativ zur Datei. Fotos und Ergebnisse gehoeren nie ins Repository: sie zeigen echte Baeder.
 * Die Muster der Platten kommen aus public/badplaner/swatches, wie nach dem Merge von der Website.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 ? args[index + 1] : fallback;
};
// --dry: ohne Gemini, mit einem festen Bild und einer leeren Pruefung; nur um den Pruefstand selbst zu pruefen.
const dry = args.includes('--dry');
const key = dry ? 'dry' : process.env.GEMINI_API_KEY;
if (!key) throw new Error('GEMINI_API_KEY fehlt: in den Umgebungsvariablen der Arbeitsumgebung setzen, nie im Code.');
const DRY_PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAIAAAB7QOjdAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAD0lEQVQImWM4ISd3Qk4OAAh3Agn/2+PxAAAAAElFTkSuQmCC';
const dryFetch = async (url, init) => {
  const request = JSON.parse(init.body);
  const parts = request.generationConfig?.responseModalities ? [{ inlineData: { mimeType: 'image/png', data: DRY_PNG } }] : [{ text: '{}' }];
  return json({ candidates: [{ content: { parts }, finishReason: 'STOP' }] });
};

if (args.includes('--list-models')) {
  const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200', { headers: { 'x-goog-api-key': key } });
  const json = await r.json();
  for (const model of json.models ?? []) console.log(model.name.replace('models/', ''), '|', (model.supportedGenerationMethods ?? []).join(','));
  process.exit(0);
}

const [casesFile, outDir] = args.filter((arg, index) => !arg.startsWith('--') && !args[index - 1]?.startsWith('--'));
if (!casesFile || !outDir) throw new Error('Aufruf: node scripts/badplaner-bench.mjs <faelle.json> <ausgabe> [--runs 3] [--only P1,P5]');
const runs = Number(flag('runs', '1'));
const only = flag('only', '')?.split(',').filter(Boolean) ?? [];
const parallel = Number(flag('parallel', '3'));
const extraEnv = Object.fromEntries(args.flatMap((arg, index) => (arg === '--env' ? [args[index + 1].split(/=(.*)/s).slice(0, 2)] : [])));

// Derselbe Build wie fuer die Tests.
const build = fs.mkdtempSync(path.join(os.tmpdir(), 'badplaner-bench-'));
const compile = spawnSync(process.execPath, [path.join(root, 'node_modules/typescript/bin/tsc'), '-p', 'tsconfig.badplaner.json', '--noEmit', 'false', '--outDir', build], { cwd: root, stdio: 'inherit' });
if (compile.status !== 0) process.exit(compile.status || 1);
fs.writeFileSync(path.join(build, 'package.json'), '{"type":"module"}\n');
const load = (file) => import(pathToFileURL(path.join(build, file)).href);
const { createHandler } = await load('api/badplaner.js');
const { optionsForPackage } = await load('src/data/badplaner.js');

/** Die Auswahl wie auf der Seite: die erste Option jeder Gruppe, dazu die Felder des Falls. */
function body(pkg, fields, photo) {
  const o = optionsForPackage(pkg);
  const first = (list) => (list && list.length ? list[0].id : '');
  const tile = fields.platte || first(o.tiles);
  const tileEntry = o.tiles.find((entry) => entry.id === tile);
  return {
    kind: 'render', stage: 'vorschau', raum: 'badezimmer', paket: pkg, consent: true,
    format: pkg === 'atelier' ? (tileEntry?.format ?? '') : (o.formats?.[0] ?? ''), look: pkg === 'atelier' ? (tileEntry?.look ?? '') : '',
    kombination: pkg === 'atelier' ? first(o.accentModes) : '', platte: tile, unterbau: first(o.bases), top: first(o.tops),
    becken: first(o.basinTypes), finish: first(o.finishes), armaturenserie: pkg === 'colore' ? first(o.tapSeriesOptions) : '',
    keramik: first(o.sanitary), wall: first(o.walls), dusche: 'keine', badewanne: 'keine', waschtisch: first(o.basins), spiegel: first(o.mirrors),
    windows: '0', cistern: 'unterputz', ...fields,
    foto: `data:${photo.mime};base64,${photo.data}`, fotoInfo: { quelle: 'galerie', breite: photo.width, hoehe: photo.height, bytes: photo.bytes },
  };
}

/** Wie die Seite: laengste Seite 1280 px, JPEG 82. */
async function readPhoto(file) {
  const input = fs.readFileSync(file);
  const { data, info } = await sharp(input).rotate().resize({ width: 1280, height: 1280, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer({ resolveWithObject: true });
  return { mime: 'image/jpeg', data: data.toString('base64'), width: info.width, height: info.height, bytes: input.length };
}

const swatches = path.join(root, 'public/badplaner/swatches');
const json = (value, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json' } });

async function runOnce(testCase, run, dir) {
  fs.mkdirSync(dir, { recursive: true });
  const photo = await readPhoto(path.resolve(path.dirname(casesFile), testCase.photo));
  const images = [];
  const checks = [];
  const mails = [];
  let generation = 0;
  const fetch = async (url, init = {}) => {
    if (url.startsWith('https://generativelanguage.googleapis.com/')) {
      const request = init.body ? JSON.parse(init.body) : {};
      const parts = request.contents?.[0]?.parts ?? [];
      const prompt = parts.find((part) => part.text)?.text ?? '';
      const started = Date.now();
      const response = dry ? await dryFetch(url, init) : await globalThis.fetch(url, { ...init, headers: { ...init.headers, 'x-goog-api-key': key } });
      const text = await response.text();
      const ms = Date.now() - started;
      if (request.generationConfig?.responseModalities) {
        generation += 1;
        const number = generation;
        const kind = prompt.startsWith('PRODUCT EDIT') ? 'produkte' : 'bild';
        fs.writeFileSync(path.join(dir, `prompt-${number}-${kind}.txt`), prompt);
        try {
          const part = JSON.parse(text).candidates?.[0]?.content?.parts?.find((entry) => entry.inlineData?.data);
          if (part) {
            const file = `bild-${number}-${kind}.${part.inlineData.mimeType === 'image/png' ? 'png' : 'jpg'}`;
            fs.writeFileSync(path.join(dir, file), Buffer.from(part.inlineData.data, 'base64'));
            images.push({ number, kind, file, ms, data: part.inlineData.data });
          } else images.push({ number, kind, file: null, ms, status: response.status, text: text.slice(0, 300) });
        } catch { images.push({ number, kind, file: null, ms, status: response.status, text: text.slice(0, 300) }); }
      } else {
        const inline = parts.filter((part) => part.inlineData);
        const answer = (() => { try { return JSON.parse(text).candidates?.[0]?.content?.parts?.map((part) => part.text || '').join(''); } catch { return text.slice(0, 300); } })();
        // Welches Bild die Pruefung ansah: das zweite Bild der Anfrage (das erste ist das Foto).
        const checked = inline[1] ? images.find((image) => image.data === inline[1].inlineData.data)?.number ?? '?' : 'foto';
        checks.push({ checked, ms, status: response.status, answer });
      }
      return new Response(text, { status: response.status, headers: { 'content-type': 'application/json' } });
    }
    if (url === 'https://api.resend.com/emails') {
      const mail = JSON.parse(init.body);
      mails.push(mail);
      for (const attachment of mail.attachments ?? []) fs.writeFileSync(path.join(dir, `mail-${mails.length}-${attachment.filename}`), Buffer.from(attachment.content, 'base64'));
      return json({ id: `bench-${mails.length}` });
    }
    if (url.startsWith('https://formspree.io/') || url.includes('/audiences/')) return json({ ok: true });
    const swatch = url.match(/^https:\/\/newlivingdesign\.ch\/badplaner\/swatches\/([^/?#]+)$/);
    if (swatch && fs.existsSync(path.join(swatches, swatch[1]))) {
      const ext = path.extname(swatch[1]).slice(1).replace('jpg', 'jpeg');
      return new Response(fs.readFileSync(path.join(swatches, swatch[1])), { status: 200, headers: { 'content-type': `image/${ext}` } });
    }
    return new Response('not in bench', { status: 404 });
  };
  const handler = createHandler({ fetch, env: { GEMINI_API_KEY: key, RESEND_API_KEY: 'bench', VERCEL_ENV: 'preview', ...extraEnv } });
  const res = { headers: {}, statusCode: 200, body: null, setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; }, json(value) { this.body = value; return this; } };
  const started = Date.now();
  await handler({ method: 'POST', headers: {}, body: body(testCase.paket, testCase.fields ?? {}, photo) }, res);
  const ms = Date.now() - started;
  const lead = mails[0];
  const rows = Object.fromEntries((lead?.text ?? '').split('\n').map((line) => line.split(/: (.*)/s)).filter((pair) => pair.length > 1));
  const shown = res.body?.image?.data ? images.find((image) => image.data === res.body.image.data)?.number ?? '?' : null;
  const summary = {
    case: testCase.name, run, status: res.statusCode, code: res.body?.code ?? null, seconds: Math.round(ms / 100) / 10, shown,
    fensterpruefung: rows['Fensterprüfung'] ?? null, vorpruefung: rows['Vorprüfung'] ?? null, duscheImBild: rows['Dusche im Bild'] ?? null,
    error: res.body?.error ?? null, images: images.map(({ number, kind, file, ms: time }) => ({ number, kind, file, seconds: Math.round(time / 100) / 10 })), checks,
    subject: lead?.subject ?? null,
  };
  fs.writeFileSync(path.join(dir, 'ergebnis.json'), JSON.stringify(summary, null, 2));
  await contactSheet(dir, photo, images, shown);
  console.log(`${testCase.name}#${run}`, res.statusCode, `${summary.seconds} s`, `gezeigt: Bild ${shown ?? '-'}`, '|', summary.fensterpruefung ?? summary.error ?? '');
  return summary;
}

/** Foto und alle Bilder nebeneinander, das gezeigte rot umrandet: zum Anschauen in einem Blick. */
async function contactSheet(dir, photo, images, shown) {
  const tiles = [{ label: 'Foto', data: Buffer.from(photo.data, 'base64') }, ...images.filter((image) => image.file)
    .map((image) => ({ label: `Bild ${image.number}${image.kind === 'produkte' ? ' (Produkte)' : ''}${image.number === shown ? ' GEZEIGT' : ''}`, data: Buffer.from(image.data, 'base64'), shown: image.number === shown }))];
  const height = 640;
  const rendered = await Promise.all(tiles.map(async (tile) => {
    const resized = await sharp(tile.data).resize({ height, fit: 'inside' }).toBuffer({ resolveWithObject: true });
    const label = Buffer.from(`<svg width="${resized.info.width}" height="40"><rect width="100%" height="40" fill="${tile.shown ? '#b00020' : '#222'}"/><text x="10" y="28" font-size="24" font-family="sans-serif" fill="#fff">${tile.label}</text></svg>`);
    return { image: await sharp(resized.data).extend({ top: 40, background: '#222' }).composite([{ input: label, top: 0, left: 0 }]).toBuffer(), width: resized.info.width };
  }));
  const width = rendered.reduce((sum, tile) => sum + tile.width + 10, 0);
  let left = 0;
  const composite = rendered.map((tile) => { const entry = { input: tile.image, top: 0, left }; left += tile.width + 10; return entry; });
  await sharp({ create: { width, height: height + 40, channels: 3, background: '#fff' } }).composite(composite).jpeg({ quality: 80 }).toFile(path.join(dir, 'uebersicht.jpg'));
}

const cases = JSON.parse(fs.readFileSync(casesFile, 'utf8')).filter((testCase) => !only.length || only.includes(testCase.name));
const jobs = cases.flatMap((testCase) => Array.from({ length: runs }, (_, index) => ({ testCase, run: index + 1 })));
const results = [];
let next = 0;
await Promise.all(Array.from({ length: Math.min(parallel, jobs.length) }, async () => {
  while (next < jobs.length) {
    const { testCase, run } = jobs[next++];
    try { results.push(await runOnce(testCase, run, path.join(outDir, testCase.name, String(run)))); }
    catch (err) { console.error(`${testCase.name}#${run}`, 'Fehler', err?.message ?? err); results.push({ case: testCase.name, run, failed: String(err?.message ?? err) }); }
  }
}));
fs.writeFileSync(path.join(outDir, 'ergebnisse.json'), JSON.stringify(results.sort((a, b) => a.case.localeCompare(b.case) || a.run - b.run), null, 2));
fs.rmSync(build, { recursive: true, force: true });
