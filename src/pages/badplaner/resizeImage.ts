/**
 * Verkleinert ein Foto im Browser, bevor es an die API geht:
 * längste Seite maximal `maxSide` Pixel, JPEG mit Qualität `quality`.
 * Die EXIF-Ausrichtung (Handyfotos im Hochformat) wird beachtet.
 *
 * Nur aus Event-Handlern aufrufen (braucht Browser-APIs, nicht beim Prerendering).
 */
import { MAX_PHOTO_BASE64, MAX_PLAN_BASE64, MAX_SOURCE_IMAGE_BYTES, normalizeBase64, sniffImageMime, validateImageBytes } from './imageValidation.js';

export interface ResizedImage {
  dataUrl: string;  // "data:image/jpeg;base64,..." für die Vorschau und den Download
  base64: string;   // nur der Base64-Teil für die API
  mime: 'image/jpeg';
  width: number;
  height: number;
}

type Drawable = ImageBitmap | HTMLImageElement;

const UNREADABLE = 'Dieses Foto konnte der Browser nicht lesen. Bitte ein anderes Foto wählen oder es mit «Foto aufnehmen» neu aufnehmen.';

/**
 * Kurzcode am Ende der Meldung: welche Leseversuche woran gescheitert sind.
 * Für den Kunden belanglos, für uns der einzige Hinweis, warum ein Foto auf
 * einem fremden Gerät nicht aufgeht — ein Screenshot der Meldung genügt dann.
 */
function failureCode(log: string[]): string {
  const seen: string[] = [];
  for (const entry of log) if (entry && !seen.includes(entry)) seen.push(entry);
  return seen.length ? ` (Code ${seen.join('/').slice(0, 60)})` : '';
}

function noteFailure(log: string[], step: string, error: unknown): void {
  const name = error instanceof Error && error.name ? error.name : 'Fehler';
  log.push(`${step}:${name}`);
}

/** Decodiert über ein <img>-Element; nimmt File oder Blob. */
function decodeViaImg(source: Blob): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(source);
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(UNREADABLE));
    img.src = url;
  }).finally(() => {
    // Erst nach dem Laden freigeben; das Bild bleibt im Speicher, bis es gezeichnet ist.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
}

/**
 * Liest die Datei als Bytes. Android liefert für manche Dateien aus dem
 * Dateiwähler bei `arrayBuffer()` einen NotReadableError, während der ältere
 * FileReader dieselbe Datei noch hergibt — darum beide Wege.
 */
async function readBytes(file: Blob, log: string[] = []): Promise<Uint8Array> {
  try {
    return new Uint8Array(await file.arrayBuffer());
  } catch (error) {
    noteFailure(log, 'buf', error);
    return await new Promise<Uint8Array>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
      reader.onerror = () => { noteFailure(log, 'fr', reader.error); reject(new Error(UNREADABLE)); };
      reader.readAsArrayBuffer(file);
    });
  }
}

/** Wie readBytes, gibt aber null zurueck, statt zu werfen. */
async function tryReadBytes(file: Blob, log: string[] = []): Promise<Uint8Array | null> {
  try {
    return await readBytes(file, log);
  } catch {
    return null;
  }
}

/**
 * Jeder Weg, das Bild zu öffnen, wird der Reihe nach versucht: Die Wege gehen
 * im Browser durch verschiedene Leseroutinen, und ein Foto, das der eine nicht
 * hergibt, öffnet der nächste oft doch.
 */
async function decodeOnce(file: File, known: Uint8Array | null, log: string[]): Promise<Drawable> {
  if (known) {
    // Die Bytes sind schon geprüft: daraus einen eigenen Blob bauen und diesen
    // decodieren, damit die Datei kein zweites Mal aus dem Dateiwähler kommt.
    const checked = new Blob([known], { type: file.type || 'image/jpeg' });
    if (typeof createImageBitmap === 'function') {
      try {
        return await createImageBitmap(checked, { imageOrientation: 'from-image' });
      } catch (error) { noteFailure(log, 'bmpX', error); }
      try {
        return await createImageBitmap(checked);
      } catch (error) { noteFailure(log, 'bmp', error); }
    }
    return await decodeViaImg(checked);
  }
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch (error) { noteFailure(log, 'bmpX', error); }
    try {
      return await createImageBitmap(file);
    } catch (error) { noteFailure(log, 'bmp', error); }
  }
  try {
    return await decodeViaImg(file);
  } catch (error) { noteFailure(log, 'img', error); }
  // Letzter Weg: Bytes holen und daraus einen frischen Blob bauen. Der ist vom
  // Dateiwähler losgelöst und lässt sich auch dann noch decodieren, wenn die
  // Originaldatei zwischendurch nicht mehr lesbar ist.
  const blob = new Blob([await readBytes(file, log)], { type: file.type || 'image/jpeg' });
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(blob, { imageOrientation: 'from-image' });
    } catch (error) { noteFailure(log, 'bmpB', error); }
  }
  return await decodeViaImg(blob);
}

async function decode(file: File, known: Uint8Array | null, log: string[]): Promise<Drawable> {
  try {
    return await decodeOnce(file, known, log);
  } catch (error) {
    noteFailure(log, 'lauf1', error);
    // Eine Datei aus der Cloud wird auf dem Gerät teils erst beim zweiten
    // Zugriff bereitgestellt: einmal kurz warten und alles nochmals versuchen.
    await new Promise((resolve) => setTimeout(resolve, 400));
    try {
      return await decodeOnce(file, known, log);
    } catch (second) {
      noteFailure(log, 'lauf2', second);
      throw new Error(UNREADABLE + failureCode(log));
    }
  }
}

export async function resizeImageFile(
  file: File,
  maxSide = 1280,
  quality = 0.82,
  maxBase64 = maxSide > 1280 ? MAX_PLAN_BASE64 : MAX_PHOTO_BASE64,
): Promise<ResizedImage> {
  if (!Number.isInteger(maxSide) || maxSide < 1 || maxSide > 1800 || !Number.isFinite(quality) || quality <= 0 || quality > 1) {
    throw new Error('Ungültige Einstellungen für die Bildverarbeitung.');
  }
  // Formate, die kein Browser zeichnen kann, gleich mit klarer Meldung abweisen.
  const declaredMime = file.type.trim().toLowerCase();
  if (declaredMime && !['image/jpeg', 'image/png', 'image/webp'].includes(declaredMime)) {
    throw new Error('Dieses Bildformat können wir nicht lesen (zum Beispiel HEIC vom iPhone). Bitte ein JPEG, PNG oder WebP wählen oder das Foto direkt mit der Kamera aufnehmen.');
  }
  if (file.size < 1 || file.size > MAX_SOURCE_IMAGE_BYTES) throw new Error('Das Bild darf höchstens 20 MB gross sein.');

  const sourceLimits = { maxBytes: MAX_SOURCE_IMAGE_BYTES, maxPixels: 50_000_000, maxSide: 12_000 };
  // Normalfall: Bytes lesen und prüfen, bevor der Browser überhaupt decodiert.
  // Das hält ein absichtlich riesiges Bild vom Decoder fern.
  const log: string[] = [];
  const bytes = await tryReadBytes(file, log);
  if (bytes) validateImageBytes(bytes, declaredMime || sniffImageMime(bytes) || '', sourceLimits);

  let source: Drawable | undefined;
  try {
    // Lassen sich die Bytes nicht lesen, ist das Foto nicht zwangsläufig kaputt:
    // der Decoder öffnet dieselbe Datei oft trotzdem. Die Grenzen unten greifen
    // dann auf dem decodierten Bild.
    source = await decode(file, bytes, log);
    const srcW = 'naturalWidth' in source ? source.naturalWidth : source.width;
    const srcH = 'naturalHeight' in source ? source.naturalHeight : source.height;
    if (!Number.isSafeInteger(srcW) || !Number.isSafeInteger(srcH) || srcW < 1 || srcH < 1) throw new Error(UNREADABLE + failureCode([...log, 'masse:0']));
    if (srcW > sourceLimits.maxSide || srcH > sourceLimits.maxSide || srcW * srcH > sourceLimits.maxPixels) {
      throw new Error('Die Bildauflösung ist zu gross. Bitte wählen Sie ein kleineres Bild.');
    }
    const scale = Math.min(1, maxSide / Math.max(srcW, srcH));
    const width = Math.max(1, Math.round(srcW * scale));
    const height = Math.max(1, Math.round(srcH * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas nicht verfügbar.');
    ctx.fillStyle = '#ffffff'; // PNG mit Transparenz wird auf Weiss gelegt.
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(source, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/jpeg', quality);
    if (!dataUrl.startsWith('data:image/jpeg;base64,')) throw new Error('Bild konnte nicht verarbeitet werden.');
    const base64 = normalizeBase64(dataUrl.slice('data:image/jpeg;base64,'.length), maxBase64);
    return { dataUrl, base64, mime: 'image/jpeg', width, height };
  } finally {
    // Insbesondere bei Canvas-/Grössenfehlern keine ImageBitmap-Ressourcen behalten.
    if (source && 'close' in source) source.close();
  }
}

/** Liest eine Datei (z. B. PDF) als Base64 ohne data:-Prefix. */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = () => reject(new Error('Datei konnte nicht gelesen werden'));
    reader.readAsDataURL(file);
  });
}
