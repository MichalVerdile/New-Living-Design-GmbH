/**
 * Verkleinert ein Foto im Browser, bevor es an die API geht:
 * längste Seite maximal `maxSide` Pixel, JPEG mit Qualität `quality`.
 * Die EXIF-Ausrichtung (Handyfotos im Hochformat) wird beachtet.
 *
 * Nur aus Event-Handlern aufrufen (braucht Browser-APIs, nicht beim Prerendering).
 */

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

export async function resizeImageFile(file: File, maxSide = 1280, quality = 0.82): Promise<ResizedImage> {
  const source = await decode(file);
  const srcW = 'naturalWidth' in source ? source.naturalWidth : source.width;
  const srcH = 'naturalHeight' in source ? source.naturalHeight : source.height;
  if (!srcW || !srcH) throw new Error('Bild konnte nicht gelesen werden');

  const scale = Math.min(1, maxSide / Math.max(srcW, srcH));
  const width = Math.max(1, Math.round(srcW * scale));
  const height = Math.max(1, Math.round(srcH * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas nicht verfügbar');
  ctx.fillStyle = '#ffffff'; // PNG mit Transparenz wird auf Weiss gelegt
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(source, 0, 0, width, height);
  if ('close' in source) source.close();

  const dataUrl = canvas.toDataURL('image/jpeg', quality);
  const base64 = dataUrl.split(',')[1] || '';
  if (base64.length < 1000) throw new Error('Bild konnte nicht verarbeitet werden');
  return { dataUrl, base64, mime: 'image/jpeg', width, height };
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
