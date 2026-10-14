/**
 * Doccetta locale (server/badplaner/doccetta.ts), ohne Modell und ohne Netz: Lesen der Antwort, Halt-Bedingungen,
 * Maske aus den Rahmen und Kompositor auf kuenstlichen Bildern. Die Rahmen sind hier von Hand gesetzt: das prueft die
 * Rasterung, nicht, ob das Pruefmodell die Handbrause findet.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';

assert.ok(process.env.BADPLANER_TEST_BUILD, 'BADPLANER_TEST_BUILD must point to the compiled test tree');
const { HAND_SHOWER_QUESTION, readHandShower, planDoccetta, composeDoccetta } = await import(pathToFileURL(path.join(process.env.BADPLANER_TEST_BUILD, 'server/badplaner/doccetta.js')));

const W = 768; const H = 1024;
// Scheibe mit Griff ueber dem Halter, eine Rosette rechts daneben; 0-1000 wie bei Google [ymin, xmin, ymax, xmax].
const reading = (changes = {}) => ({ count: 1, shape: 'disc', box: [400, 480, 520, 540], holder: [500, 495, 560, 525], controls: [[480, 560, 540, 620]], avoid: [], certain: true, ...changes });
const raw = (width, height) => ({ raw: { width, height, channels: 3 } });
// Feines Muster mit Rauschen: jede Verschiebung um 1 px faellt auf.
function texture(width, height, seed = 1) {
  const data = Buffer.alloc(width * height * 3);
  let state = seed;
  for (let i = 0; i < width * height; i += 1) {
    state = (state * 1103515245 + 12345) % 2147483648;
    const x = i % width; const y = (i - x) / width;
    const v = 128 + 60 * Math.sin(x / 3) * Math.cos(y / 4) + (state % 41) - 20;
    data.set([v, 255 - v, (v + 64) % 256], i * 3);
  }
  return data;
}
const png = async (data, width, height) => ({ mime: 'image/png', data: (await sharp(data, raw(width, height)).png().toBuffer()).toString('base64') });
const pixels = async (photo) => sharp(Buffer.from(photo.data, 'base64')).removeAlpha().raw().toBuffer({ resolveWithObject: true });

test('Doccetta: Antwort der Pruefung lesen, der Platzhalter [0,0,0,0] ist kein Rahmen', () => {
  const answer = { count: 1, shape: 'disc', box_2d: [400, 480, 520, 540], holder_box_2d: [0, 0, 0, 0], controls_box_2d: [[480, 560, 540, 620]], avoid_box_2d: [], certain: true };
  assert.deepEqual(readHandShower(answer), { count: 1, shape: 'disc', box: [400, 480, 520, 540], holder: undefined, controls: [[480, 560, 540, 620]], avoid: [], certain: true });
  for (const wrong of [undefined, 'disc', { ...answer, shape: 'round' }, { ...answer, certain: 'yes' }, { ...answer, count: 1.5 },
    { ...answer, controls_box_2d: [[1, 2, 3]] }, { ...answer, avoid_box_2d: [[0, 0, 2000, 10]] }]) assert.equal(readHandShower(wrong), undefined);
  // Schutzrahmen weggelassen statt leer angegeben: keine Angabe, auch wenn certain true ist.
  const { controls_box_2d: controls, avoid_box_2d: avoid, ...withoutLists } = answer;
  for (const missing of [{ ...withoutLists, avoid_box_2d: avoid }, { ...withoutLists, controls_box_2d: controls }, withoutLists]) assert.equal(readHandShower(missing), undefined);
  // Die Vorlage am Ende der Frage ist selbst eine gueltige Antwort ohne Handbrause: Frage und Leser passen zusammen.
  const template = JSON.parse(HAND_SHOWER_QUESTION.slice(HAND_SHOWER_QUESTION.indexOf('{')));
  assert.deepEqual(readHandShower(template), { count: 0, shape: 'none', box: undefined, holder: undefined, controls: [], avoid: [], certain: false });
});

test('Doccetta: Maske aus den Rahmen, Kopf voll, Feder innen, Null ab knapp ueber dem Halter und auf allen Schutzrahmen', () => {
  const plan = planDoccetta(reading(), W, H);
  assert.equal(plan.ok, true, plan.reason);
  const { left, top, width, height } = plan.crop;
  assert.ok(left >= 0 && top >= 0 && left + width <= W && top + height <= H, 'Ausschnitt im Bild');
  assert.ok(Math.abs(width / height - 3 / 4) < 0.01, 'hochkant 3:4');
  const at = (x, y) => plan.alpha[(y - top) * width + (x - left)];
  // Mitte des Kopfes (Scheibe oben im Rahmen): voll ersetzt.
  assert.equal(at(Math.round(0.51 * W), Math.round(0.436 * H)), 255);
  // Ab 3 px ueber dem Halter und im Halter selbst: nichts.
  for (let y = Math.round(0.5 * H) - 3; y < top + height; y += 1) for (let x = left; x < left + width; x += 1) assert.equal(at(x, y), 0, `y ${y}`);
  // Rosette rechts, um 2 px erweitert: nichts.
  for (let y = Math.floor(0.48 * H) - 2; y <= Math.ceil(0.54 * H) + 2; y += 1) for (let x = Math.floor(0.56 * W) - 2; x <= Math.ceil(0.62 * W) + 2; x += 1) assert.equal(at(x, y), 0);
  // Feder nur innen, vier Stufen (ueber den letzten 8 Zeilen vor dem Halter); dort senkt die Ueberblendung die Werte.
  const levels = new Set(plan.alpha.subarray(0, (Math.round(0.5 * H) - 3 - 8 - top) * width));
  assert.deepEqual([...levels].sort((a, b) => a - b), [0, 64, 128, 191, 255]);
  const axis = Math.round(0.51 * W);
  assert.ok(at(axis, Math.round(0.5 * H) - 4) < at(axis, Math.round(0.5 * H) - 14) && at(axis, Math.round(0.5 * H) - 14) === 255);
  assert.ok(plan.pixels > 1000 && plan.pixels < 0.08 * width * height);
});

test('Doccetta: Halt bei unsicherer, mehrdeutiger oder zu naher Handbrause (Carla, 14.10.)', () => {
  const reason = (changes, width = W, height = H) => planDoccetta(reading(changes), width, height).reason;
  assert.equal(reason({ certain: false }), 'Pruefung unsicher');
  assert.equal(reason({ count: 2 }), '2 Handbrausen');
  assert.equal(reason({ count: 0, shape: 'none' }), '0 Handbrausen');
  assert.equal(reason({ shape: 'stick' }), 'Handbrause schon ein Stab');
  assert.equal(reason({ shape: 'other' }), 'Form other');
  assert.equal(reason({ holder: undefined }), 'Handbrause oder Halter nicht erkannt');
  assert.equal(reason({ box: [400, 300, 520, 700] }), 'Rahmen der Handbrause unplausibel');
  assert.equal(reason({ box: [400, 480, 403, 482] }), 'Rahmen der Handbrause unplausibel');
  assert.equal(reason({ holder: [300, 495, 380, 525] }), 'Halter passt nicht zur Handbrause');
  assert.equal(reason({ holder: [500, 700, 560, 760] }), 'Halter passt nicht zur Handbrause');
  const touching = 'Maske beruehrt Halter, Armaturen, Glas, Spiegel oder Waschtisch';
  assert.equal(reason({ controls: [[420, 530, 470, 600]] }), touching);
  assert.equal(reason({ avoid: [[300, 470, 700, 485]] }), touching, 'Glaskante durch den Kopf');
  assert.equal(reason({ box: [400, 0, 520, 50], holder: [500, 10, 560, 40], controls: [] }), 'Ausschnitt zu knapp');
  // Breiter Halter: der Stiel wird so breit, dass die Maske mehr als 8 % des Ausschnitts nimmt.
  assert.equal(reason({ box: [300, 400, 480, 600], holder: [470, 330, 520, 670], controls: [] }), 'Maske zu gross');
});

test('Doccetta: Kompositor aendert nur die Maske, verwirft verschobene, unklare und falsch geformte Ergebnisse', async () => {
  const plan = planDoccetta(reading(), W, H);
  const baseRaw = texture(W, H);
  const base = await png(baseRaw, W, H);
  const { left, top, width, height } = plan.crop;
  const crop = await sharp(baseRaw, raw(W, H)).extract(plan.crop).raw().toBuffer();
  // Wie ein 1K-Ergebnis: der Ausschnitt doppelt so gross; in der Maske eine Signalfarbe.
  const result = async (edit = () => {}) => {
    const data = Buffer.from(crop);
    edit(data);
    const big = await sharp(data, raw(width, height)).resize({ width: width * 2, height: height * 2, kernel: 'lanczos3' }).raw().toBuffer();
    return png(big, width * 2, height * 2);
  };
  const red = (data) => { for (let i = 0; i < plan.alpha.length; i += 1) if (plan.alpha[i]) data.set([255, 0, 0], i * 3); };

  const composed = await composeDoccetta(base, await result(red), plan);
  assert.equal(composed.ok, true, composed.reason);
  assert.match(composed.note, /^Ausrichtung 0,0, \d+ px in der Maske$/);
  assert.equal(composed.image.mime, 'image/png');
  const out = await pixels(composed.image);
  assert.deepEqual([out.info.width, out.info.height], [W, H]);
  let changedOutside = 0;
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      const inside = x >= left && x < left + width && y >= top && y < top + height && plan.alpha[(y - top) * width + x - left];
      const p = (y * W + x) * 3;
      if (!inside && (out.data[p] !== baseRaw[p] || out.data[p + 1] !== baseRaw[p + 1] || out.data[p + 2] !== baseRaw[p + 2])) changedOutside += 1;
    }
  }
  assert.equal(changedOutside, 0, 'ausserhalb der Maske Pixel fuer Pixel wie vorher');
  const centre = (Math.round(0.436 * H) * W + Math.round(0.51 * W)) * 3;
  assert.ok(out.data[centre] > 240 && out.data[centre + 1] < 16 && out.data[centre + 2] < 16, 'Mitte des Kopfes ersetzt');

  // Ohne Aenderung im Ergebnis (no-op, ohne Vergroesserung): das ganze Bild bleibt gleich.
  const same = await composeDoccetta(base, await png(crop, width, height), plan);
  assert.equal(same.ok, true);
  assert.ok((await pixels(same.image)).data.equals(baseRaw));

  // Um 5 px verschoben: das Minimum liegt am Rand der Suche, kein Bild.
  const shifted = await composeDoccetta(base, await result((data) => { data.copyWithin(5 * 3, 0, data.length - 5 * 3); }), plan);
  assert.deepEqual(shifted, { ok: false, reason: 'Ausrichtung am Rand der Suche' });
  // Ohne Struktur ist keine Ausrichtung eindeutig.
  const flat = await png(Buffer.alloc(W * H * 3, 128), W, H);
  assert.equal((await composeDoccetta(flat, await png(Buffer.alloc(width * height * 3, 128), width, height), plan)).ok, false);
  // Quadratisch statt 3:4.
  assert.deepEqual(await composeDoccetta(base, await png(Buffer.alloc(300 * 300 * 3, 128), 300, 300), plan), { ok: false, reason: 'Seitenverhaeltnis des Ergebnisses' });
});
