/**
 * Lädt die Swatch-Bilder des Badplaners (Platten, Keramikfarben, Armaturen)
 * von den Lieferanten nach public/badplaner/swatches/, aber nur, wenn die
 * Datei dort noch fehlt. Läuft vor jedem Build (siehe package.json).
 *
 * Quelle der Liste: scripts/swatches.json (gleiche Daten wie `swatchSources`
 * in src/data/badplaner.ts). Fehler werden nur protokolliert: der Build
 * bricht nie ab, im Browser wird ein fehlendes Bild durch eine farbige Fläche
 * mit Beschriftung ersetzt.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const listFile = path.join(root, 'scripts', 'swatches.json')
const outDir = path.join(root, 'public', 'badplaner', 'swatches')

const TIMEOUT_MS = 15000
const PARALLEL = 6
const USER_AGENT = 'Mozilla/5.0 (compatible; NewLivingDesign-Badplaner/1.0; +https://newlivingdesign.ch)'

let list = []
try {
  list = JSON.parse(fs.readFileSync(listFile, 'utf8'))
} catch (err) {
  console.warn('[swatches] Liste nicht lesbar, überspringe:', err && err.message ? err.message : err)
  process.exit(0)
}

fs.mkdirSync(outDir, { recursive: true })

const missing = list.filter((s) => s.file && s.src && !fs.existsSync(path.join(outDir, s.file)))
if (missing.length === 0) {
  console.log(`[swatches] alle ${list.length} Swatches vorhanden.`)
  process.exit(0)
}
console.log(`[swatches] ${missing.length} von ${list.length} Swatches fehlen, lade herunter …`)

/** Lädt eine Datei; wirft bei HTTP-Fehler, Timeout oder falschem Inhaltstyp. */
async function download(item) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(item.src, {
      signal: controller.signal,
      headers: { 'User-Agent': USER_AGENT, Accept: 'image/*,*/*;q=0.8' },
      redirect: 'follow',
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const type = res.headers.get('content-type') || ''
    if (!type.startsWith('image/')) throw new Error(`kein Bild (${type || 'unbekannter Typ'})`)
    const bytes = new Uint8Array(await res.arrayBuffer())
    if (bytes.length < 200) throw new Error('Datei leer')
    // Zuerst in eine temporäre Datei, damit nie eine halbe Datei liegen bleibt.
    const target = path.join(outDir, item.file)
    const tmp = `${target}.part`
    fs.writeFileSync(tmp, bytes)
    fs.renameSync(tmp, target)
    return bytes.length
  } finally {
    clearTimeout(timer)
  }
}

let ok = 0
let failed = 0
const queue = [...missing]

async function worker() {
  while (queue.length) {
    const item = queue.shift()
    try {
      const size = await download(item)
      ok++
      console.log(`[swatches] ok   ${item.file} (${Math.round(size / 1024)} KB)`)
    } catch (err) {
      failed++
      const reason = err && err.name === 'AbortError' ? 'Timeout' : err && err.message ? err.message : String(err)
      console.warn(`[swatches] FEHLER ${item.file}: ${reason}`)
    }
  }
}

try {
  await Promise.all(Array.from({ length: Math.min(PARALLEL, missing.length) }, worker))
} catch (err) {
  console.warn('[swatches] unerwarteter Fehler:', err && err.message ? err.message : err)
}
console.log(`[swatches] ${ok} geladen, ${failed} fehlgeschlagen.`)
process.exit(0)
