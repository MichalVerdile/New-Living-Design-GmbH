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

async function decode(file: File): Promise<Drawable> {
  // Moderner Weg: dreht das Bild gemäss EXIF selbst richtig.
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      // Fallback unten (ältere Browser oder unbekannte Option)
    }
  }
  // Fallback: <img> (moderne Browser beachten EXIF hier ebenfalls)
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Bild konnte nicht gelesen werden'));
      img.src = url;
    });
  } finally {
    // Erst nach dem Laden freigeben; das Bild bleibt im Speicher, bis es gezeichnet ist.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
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
  // Unzulässige Formate und Dateigrössen vor Lesen und vor Browser-Decodierung abweisen.
  const declaredMime = file.type.trim().toLowerCase();
  if (declaredMime && !['image/jpeg', 'image/png', 'image/webp'].includes(declaredMime)) {
    throw new Error('Dieses Bildformat können wir nicht lesen (zum Beispiel HEIC vom iPhone). Bitte ein JPEG, PNG oder WebP wählen oder das Foto direkt mit der Kamera aufnehmen.');
  }
  if (file.size < 1 || file.size > MAX_SOURCE_IMAGE_BYTES) throw new Error('Das Bild darf höchstens 20 MB gross sein.');
  const bytes = new Uint8Array(await file.arrayBuffer());
  const sourceLimits = { maxBytes: MAX_SOURCE_IMAGE_BYTES, maxPixels: 50_000_000, maxSide: 12_000 };
  validateImageBytes(bytes, declaredMime || sniffImageMime(bytes) || '', sourceLimits);

  let source: Drawable | undefined;
  try {
    source = await decode(file);
    const srcW = 'naturalWidth' in source ? source.naturalWidth : source.width;
    const srcH = 'naturalHeight' in source ? source.naturalHeight : source.height;
    // Erneute Grenze für den tatsächlichen Decoderoutput, auch nach EXIF-Drehung.
    if (!Number.isSafeInteger(srcW) || !Number.isSafeInteger(srcH) || srcW < 1 || srcH < 1) throw new Error('Bild konnte nicht gelesen werden.');
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
