/* eslint-disable @typescript-eslint/no-explicit-any -- keine @types/node im Projekt, Buffer ist deshalb any */
/**
 * Doccetta locale (Colore mit Up+ in Chrom und Dusche, Unterputz): ein Ersatz nur der Handbrause des gezeigten Bildes, wenn
 * eine eigene Frage an das Pruefmodell sie sicher als runde Scheibe auf einem Griff liest. Ein eigener 1K-Auftrag bekommt einen
 * Ausschnitt 3:4 und das Foto RWIT 6BD9 von Treemme; zurueck kommen nur die Pixel in einer Maske aus diesen Rahmen, ohne feste
 * Koordinaten. Grundlage: Lotto T1/T2 vom 13.10.2026 (P2-X6, nur Chrom CC, 2/2 Erstgutachten einig fuer Form und Anschluesse).
 * Nicht belegt (Carla, 14.10.): ob das Pruefmodell die Handbrause und ihre Rahmen richtig findet; Rahmen und Schutzrahmen
 * desselben Modells pruefen sich nicht gegenseitig. Darum nur ein Anhang "nicht bestaetigt", nie das Ideenbild selbst.
 * Aus, solange BADPLANER_DOCCETTA nicht "1" ist; auch dann nur auf der Vorschau mit persoenlicher Pruefung (api/badplaner.ts).
 */
declare const Buffer: any;

type Photo = { mime: string; data: string };
/** [ymin, xmin, ymax, xmax], wie Google die Rahmen liefert: 0-1000 relativ zum Bild. */
type Box = [number, number, number, number];
export type HandShower = { count: number; shape: 'stick' | 'disc' | 'other' | 'none'; box?: Box; holder?: Box; controls: Box[]; avoid: Box[]; certain: boolean };
export type DoccettaPlan = { ok: true; crop: { left: number; top: number; width: number; height: number }; alpha: Uint8Array; pixels: number } | { ok: false; reason: string };

/** Eigene Frage an das Pruefmodell zum gezeigten Bild allein; die Raumpruefung bleibt unveraendert. */
export const HAND_SHOWER_QUESTION = 'Look only at the hand shower in this bathroom image, the one on a hose, not the overhead shower. Report only what you can see. '
  + 'Set count to the number of hand showers you see; '
  + 'shape to "stick" if it is one slim straight cylinder, "disc" if it has a round flat head on a handle, "other" for any other shape and "none" if there is none; '
  + 'box_2d to [ymin, xmin, ymax, xmax] of the hand shower above its holder, from the top of its head down to where it enters the holder, normalized to 0-1000; '
  + 'holder_box_2d to the same kind of box for the wall holder or outlet piece it sits in; '
  + 'controls_box_2d to the boxes of every other shower control, rosette or lever on that wall; '
  + 'avoid_box_2d to the boxes of any glass edge, mirror, reflection, washbasin or tap closer to the hand shower than its own length; '
  + 'certain to true only if you are sure of all of this, otherwise false. '
  + 'Answer with JSON only, no markdown and exactly these keys: '
  + '{"count":0,"shape":"none","box_2d":[0,0,0,0],"holder_box_2d":[0,0,0,0],"controls_box_2d":[],"avoid_box_2d":[],"certain":false}';

/** Der Text des Lotto T1/T2 (Payload 36b7901b), ohne die Einzelheiten von P2-X6 (Marmor, Fuge, Ader, vier Rosetten). */
export const DOCCETTA_PROMPT = 'CLOSE-UP EDIT of image 1, not a new picture: same crop, size, perspective, wall surfaces, joints, light, glass and '
  + 'reflections. Only the hand shower above its wall holder changes. Replace the round disc head and its handle with one straight slim '
  + 'cylindrical stick hand shower in polished chrome, the same chrome as the round controls in image 1. Image 2 is the authentic Treemme '
  + 'chrome hand shower reference. Use only its single cylindrical stick, flat top and upper side jets; do not copy its holder, hose, '
  + 'background or layout. Below the old head, keep exactly the axis and the width of the current handle, entering the holder exactly where '
  + 'the current handle does; the stick keeps that same width over its whole length, with no widening and no step. Normal proportions: the '
  + 'stick may be shorter than the old head and does not have to reach the top of the old disc. Where the round head and its round shadow '
  + 'were, the wall simply continues with the same tiles, joints and pattern, with no new marks; only a narrow straight shadow of the stick '
  + 'on the same side as the shadow of the holder; no round shadow, no halo, no ring or ellipse outline. The holder, the hose, the controls '
  + 'with their levers and everything else stay exactly as in image 1. Exactly one hand shower. No text.';

const box = (value: unknown): Box | undefined => (Array.isArray(value) && value.length === 4
  && value.every((n) => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 1000) && value[0] < value[2] && value[1] < value[3]
  ? value as Box : undefined);
const boxes = (value: unknown): Box[] | undefined => {
  if (!Array.isArray(value) || value.length > 12) return undefined;
  const read = value.map(box);
  return read.every(Boolean) ? read as Box[] : undefined;
};

/**
 * Liest die Antwort zur Handbrause; eine unlesbare Antwort gilt als keine Angabe. Der Platzhalter [0,0,0,0] ist kein Rahmen.
 * Beide Listen der Schutzrahmen muessen da sein (leer nur, wenn ausdruecklich angegeben): fehlt eine, kein Ersatz.
 * ponytail: geprueft werden nur Form und Lage der Rahmen, nicht ob dort wirklich eine Handbrause ist; das zeigt erst die
 * Messung mit fester Toleranz auf 6-8 Bildern (Carla, 14.10.). Pixelfilter koennten hoechstens verdaechtige Faelle aussortieren.
 */
export function readHandShower(value: any): HandShower | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const controls = boxes(value.controls_box_2d);
  const avoid = boxes(value.avoid_box_2d);
  if (!Number.isInteger(value.count) || value.count < 0 || !['stick', 'disc', 'other', 'none'].includes(value.shape)
    || typeof value.certain !== 'boolean' || !controls || !avoid) return undefined;
  return { count: value.count, shape: value.shape, box: box(value.box_2d), holder: box(value.holder_box_2d), controls, avoid, certain: value.certain };
}

/**
 * Ausschnitt und Maske aus den Rahmen (Carla, 14.10.): nur eine Handbrause, sicher eine Scheibe, Halter und Stiel
 * erkennbar; sonst, bei unplausiblen Rahmen, bei Beruehrung von Halter, Armaturen, Glas, Spiegel oder Waschtisch und bei zu
 * grosser Maske: kein Ersatz. Die Maske folgt der Probe auf P2-X6 (fd6fd1ce): Kopf mit Schatten und Stiel, Feder 3 px nur
 * innen, Ueberblendung der letzten Zeilen, Null ab knapp ueber dem Halter. Alles in Pixeln des Ausschnitts.
 */
export function planDoccetta(reading: HandShower, width: number, height: number): DoccettaPlan {
  if (!reading.certain) return { ok: false, reason: 'Pruefung unsicher' };
  if (reading.count !== 1) return { ok: false, reason: `${reading.count} Handbrausen` };
  if (reading.shape !== 'disc') return { ok: false, reason: reading.shape === 'stick' ? 'Handbrause schon ein Stab' : `Form ${reading.shape}` };
  if (!reading.box || !reading.holder) return { ok: false, reason: 'Handbrause oder Halter nicht erkannt' };
  const px = ([y0, x0, y1, x1]: Box): Box => [y0 * height / 1000, x0 * width / 1000, y1 * height / 1000, x1 * width / 1000];
  const [by0, bx0, by1, bx1] = px(reading.box);
  const [sy0, sx0, sy1, sx1] = px(reading.holder);
  const bw = bx1 - bx0;
  const bh = by1 - by0;
  if (bh < 0.015 * height || bh > 0.2 * height || bw > 1.2 * bh) return { ok: false, reason: 'Rahmen der Handbrause unplausibel' };
  if (sy0 < by0 + 0.5 * bh || sy0 > by1 + 0.25 * bh || sx0 >= bx1 || sx1 <= bx0) return { ok: false, reason: 'Halter passt nicht zur Handbrause' };
  // Ausschnitt hochkant 3:4 wie im Lotto, 3.5-mal so hoch wie Kopf bis Unterkante Halter.
  const cropHeight = Math.round(Math.min(height, width * 4 / 3, Math.max(256, 3.5 * (sy1 - by0))));
  const cropWidth = Math.round(cropHeight * 3 / 4);
  const left = Math.round(Math.min(width - cropWidth, Math.max(0, (bx0 + bx1) / 2 - cropWidth / 2)));
  const top = Math.round(Math.min(height - cropHeight, Math.max(0, (by0 + sy1) / 2 - cropHeight / 2)));
  const gap = Math.max(3, Math.round(height / 500));
  const fade = Math.max(8, Math.round(height / 150));
  const stop = Math.round(sy0 - gap) - top;
  const axis = (sx0 + sx1) / 2 - left;
  const stemHalf = Math.max(0.4 * bw, 0.6 * (sx1 - sx0));
  const ex = (bx0 + bx1) / 2 - left;
  // Kopf mit Schatten wie die Maske von root auf P2-X6 (83 px breit bei 53 px Kopf; hier 96 % davon abgedeckt): der Schatten
  // faellt seitlich je nach Licht und bei Licht von oben unter den Kopf, darum die Mitte etwas tiefer.
  const ey = by0 + 0.35 * bh - top;
  const rx = 0.8 * bw;
  const ry = 0.45 * bh;
  const stemTop = by0 + 0.45 * bh - top;
  const trace = new Uint8Array(cropWidth * cropHeight);
  for (let y = 0; y < Math.min(cropHeight, stop); y += 1) {
    for (let x = 0; x < cropWidth; x += 1) {
      if (((x - ex) / rx) ** 2 + ((y - ey) / ry) ** 2 <= 1 || (Math.abs(x - axis) <= stemHalf && y >= stemTop)) trace[y * cropWidth + x] = 1;
    }
  }
  // Feder nur innen: Chebyshev-Abstand zum Rand in vier Stufen (64, 128, 191, 255), wie die Probe; die Maske waechst nie.
  const level = new Uint8Array(trace);
  for (let step = 2; step <= 4; step += 1) {
    const before = new Uint8Array(level);
    for (let y = 1; y < cropHeight - 1; y += 1) {
      for (let x = 1; x < cropWidth - 1; x += 1) {
        const i = y * cropWidth + x;
        if (before[i] !== step - 1) continue;
        let inner = true;
        for (let dy = -1; dy <= 1 && inner; dy += 1) for (let dx = -1; dx <= 1; dx += 1) if (before[i + dy * cropWidth + dx] < step - 1) { inner = false; break; }
        if (inner) level[i] = step;
      }
    }
  }
  const alpha = new Uint8Array(level.length);
  for (let i = 0; i < level.length; i += 1) alpha[i] = Math.round(255 * level[i] / 4);
  // Die letzten Zeilen vor dem Halter blenden weich auf null (smoothstep), darunter bleibt das Bild exakt.
  for (let y = Math.max(0, stop - fade); y < Math.min(cropHeight, stop); y += 1) {
    const t = (y - (stop - fade)) / fade;
    const weight = 1 - (3 * t * t - 2 * t * t * t);
    for (let x = 0; x < cropWidth; x += 1) alpha[y * cropWidth + x] = Math.round(alpha[y * cropWidth + x] * weight);
  }
  let pixels = 0;
  let minX = cropWidth; let minY = cropHeight; let maxX = -1; let maxY = -1;
  for (let y = 0; y < cropHeight; y += 1) {
    for (let x = 0; x < cropWidth; x += 1) {
      if (!alpha[y * cropWidth + x]) continue;
      pixels += 1; minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    }
  }
  if (!pixels) return { ok: false, reason: 'Maske leer' };
  if (pixels > 0.08 * cropWidth * cropHeight) return { ok: false, reason: 'Maske zu gross' };
  if (minX < 8 || minY < 8 || maxX > cropWidth - 9 || maxY > cropHeight - 9) return { ok: false, reason: 'Ausschnitt zu knapp' };
  for (const protectedBox of [reading.holder, ...reading.controls, ...reading.avoid]) {
    const [y0, x0, y1, x1] = px(protectedBox);
    for (let y = Math.max(0, Math.floor(y0 - top - 2)); y <= Math.min(cropHeight - 1, Math.ceil(y1 - top + 2)); y += 1) {
      for (let x = Math.max(0, Math.floor(x0 - left - 2)); x <= Math.min(cropWidth - 1, Math.ceil(x1 - left + 2)); x += 1) {
        if (alpha[y * cropWidth + x]) return { ok: false, reason: 'Maske beruehrt Halter, Armaturen, Glas, Spiegel oder Waschtisch' };
      }
    }
  }
  return { ok: true, crop: { left, top, width: cropWidth, height: cropHeight }, alpha, pixels };
}

/** Der Ausschnitt als PNG fuer den Auftrag; sharp erst hier, damit es ohne Doccetta nie geladen wird. */
export async function cropForDoccetta(image: Photo, plan: Extract<DoccettaPlan, { ok: true }>): Promise<Photo> {
  const sharp = (await import('sharp')).default;
  const png = await sharp(Buffer.from(image.data, 'base64')).removeAlpha().extract(plan.crop).png().toBuffer();
  return { mime: 'image/png', data: png.toString('base64') };
}

/**
 * Wie der Kompositor des Lotto: Ergebnis auf den Ausschnitt (Lanczos3), ganzzahlige Ausrichtung bis 3 px, gemessen
 * ausserhalb der Maske, Minimum am Rand oder knapp vor dem zweitbesten = verworfen; dann nur in der Maske
 * out = Bild*(255-a)/255 + Ergebnis*a/255. PNG, weil ein neues JPEG das ganze Bild veraendern wuerde. Ausserhalb der Maske
 * identisch heisst nur: dort hat sich nichts bewegt. Ob die Handbrause stimmt, sagt erst die persoenliche Pruefung.
 */
export async function composeDoccetta(image: Photo, edited: Photo, plan: Extract<DoccettaPlan, { ok: true }>): Promise<{ ok: true; image: Photo; note: string } | { ok: false; reason: string }> {
  const sharp = (await import('sharp')).default;
  const { left, top, width, height } = plan.crop;
  const raw = (w: number, h: number) => ({ raw: { width: w, height: h, channels: 3 as const } });
  const { data: full, info } = await sharp(Buffer.from(image.data, 'base64')).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const base = await sharp(full, raw(info.width, info.height)).extract(plan.crop).raw().toBuffer();
  const result = await sharp(Buffer.from(edited.data, 'base64')).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  if (Math.abs(result.info.width / result.info.height - width / height) > 0.01) return { ok: false, reason: 'Seitenverhaeltnis des Ergebnisses' };
  const gen = await sharp(result.data, raw(result.info.width, result.info.height)).resize({ width, height, fit: 'fill', kernel: 'lanczos3' }).raw().toBuffer();
  const scores: { dx: number; dy: number; score: number }[] = [];
  for (let dy = -3; dy <= 3; dy += 1) {
    for (let dx = -3; dx <= 3; dx += 1) {
      let sum = 0; let count = 0;
      for (let y = 3; y < height - 3; y += 2) {
        for (let x = 3; x < width - 3; x += 2) {
          if (plan.alpha[y * width + x]) continue;
          const p = (y * width + x) * 3; const q = ((y + dy) * width + x + dx) * 3;
          sum += Math.abs(gen[q] - base[p]) + Math.abs(gen[q + 1] - base[p + 1]) + Math.abs(gen[q + 2] - base[p + 2]); count += 3;
        }
      }
      scores.push({ dx, dy, score: +(sum / count).toFixed(3) });
    }
  }
  scores.sort((a, b) => a.score - b.score);
  const [best, second] = scores;
  if (Math.abs(best.dx) === 3 || Math.abs(best.dy) === 3) return { ok: false, reason: 'Ausrichtung am Rand der Suche' };
  if (second.score <= best.score * 1.1 + 0.01) return { ok: false, reason: 'Ausrichtung nicht eindeutig' };
  const out = Buffer.from(full);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const a = plan.alpha[y * width + x];
      if (!a) continue;
      const gx = Math.min(width - 1, Math.max(0, x + best.dx)); const gy = Math.min(height - 1, Math.max(0, y + best.dy));
      const p = ((top + y) * info.width + left + x) * 3; const q = (gy * width + gx) * 3;
      for (let c = 0; c < 3; c += 1) out[p + c] = Math.round((full[p + c] * (255 - a) + gen[q + c] * a) / 255);
    }
  }
  const png = await sharp(out, raw(info.width, info.height)).png().toBuffer();
  return { ok: true, image: { mime: 'image/png', data: png.toString('base64') }, note: `Ausrichtung ${best.dx},${best.dy}, ${plan.pixels} px in der Maske` };
}
