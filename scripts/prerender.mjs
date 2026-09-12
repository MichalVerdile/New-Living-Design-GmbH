/**
 * Statisches Prerendering nach `vite build`.
 *
 * 1. Baut src/entry-server.tsx mit vite.config.ssr.ts nach dist-ssr/.
 * 2. Rendert jede Route aus routes.json mit React (renderToString).
 * 3. Schreibt das HTML in dist/<route>/index.html (Home: dist/index.html),
 *    mit den Head-Tags von react-helmet-async (Titel, Meta, Canonical, JSON-LD).
 *
 * Fällt eine Route oder der Server-Build aus, bleibt für sie das normale
 * SPA-HTML aus dist/index.html erhalten: der Build schlägt dadurch nie fehl.
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

process.env.NODE_ENV ||= 'production'

const root = process.cwd()
const dist = path.join(root, 'dist')
const templatePath = path.join(dist, 'index.html')
const routes = JSON.parse(fs.readFileSync(path.join(root, 'routes.json'), 'utf8'))

if (!fs.existsSync(templatePath)) {
  console.warn('[prerender] dist/index.html fehlt, nichts zu tun.')
  process.exit(0)
}
const template = fs.readFileSync(templatePath, 'utf8')

/* ---------- 1. Server-Build ---------- */
let render
try {
  const viteBin = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js')
  execFileSync(process.execPath, [viteBin, 'build', '--config', 'vite.config.ssr.ts'], {
    stdio: 'inherit',
    cwd: root,
    env: { ...process.env, NODE_ENV: 'production' },
  })
  const mod = await import(pathToFileURL(path.join(root, 'dist-ssr', 'entry-server.js')).href)
  render = mod.render
  if (typeof render !== 'function') throw new Error('entry-server.js exportiert keine render()-Funktion')
} catch (err) {
  console.warn('[prerender] Server-Build fehlgeschlagen, Seiten bleiben SPA:', err && err.message ? err.message : err)
  process.exit(0)
}

/* ---------- Hilfen ---------- */

/** Findet <div id="root"...> und das passende </div> im Template. */
function findRoot(html) {
  const open = html.search(/<div\s+id="root"[^>]*>/)
  if (open < 0) return null
  const openEnd = html.indexOf('>', open) + 1
  const tag = /<div\b[^>]*>|<\/div>/g
  tag.lastIndex = openEnd
  let depth = 1
  let m
  while ((m = tag.exec(html))) {
    depth += m[0].startsWith('</') ? -1 : 1
    if (depth === 0) return { start: open, innerStart: openEnd, innerEnd: m.index, end: m.index + m[0].length }
  }
  return null
}

/** Entfernt Titel und Description des Templates (Helmet liefert die richtigen). */
function stripTemplateHead(html) {
  return html
    .replace(/\s*<title>[^<]*<\/title>/, '')
    .replace(/\s*<meta\s+name="description"[^>]*>/, '')
}

/** Prüft, ob alle /assets/-Verweise im HTML in dist/ existieren. */
function missingAssets(html) {
  const missing = new Set()
  const re = /(?:src|href|content|srcset)="(\/assets\/[^"\s,]+)/g
  let m
  while ((m = re.exec(html))) {
    const file = path.join(dist, decodeURIComponent(m[1].split('?')[0].split('#')[0]))
    if (!fs.existsSync(file)) missing.add(m[1])
  }
  return [...missing]
}

const rootPos = findRoot(template)
if (!rootPos) {
  console.warn('[prerender] <div id="root"> im Template nicht gefunden, Seiten bleiben SPA.')
  process.exit(0)
}

/* ---------- 2./3. Routen rendern und schreiben ---------- */
let ok = 0
for (const route of routes) {
  try {
    const { html, head } = render(route)
    if (!html || html.length < 500) throw new Error(`leeres Ergebnis (${html ? html.length : 0} Zeichen)`)

    const missing = missingAssets(html + head)
    if (missing.length) throw new Error('Assets fehlen in dist/: ' + missing.join(', '))

    let page = stripTemplateHead(template)
    const pos = findRoot(page)
    page =
      page.slice(0, pos.start) +
      `<div id="root" data-prerendered="${route}">` +
      html +
      '</div>' +
      page.slice(pos.end)
    if (head) page = page.replace('</head>', `    ${head}\n  </head>`)

    const outFile = route === '/' ? templatePath : path.join(dist, route.replace(/^\//, ''), 'index.html')
    fs.mkdirSync(path.dirname(outFile), { recursive: true })
    fs.writeFileSync(outFile, page)
    ok++
    console.log(`[prerender] ${route} -> ${path.relative(root, outFile)} (${Math.round(page.length / 1024)} KB)`)
  } catch (err) {
    console.warn(`[prerender] ${route} übersprungen, bleibt SPA:`, err && err.message ? err.message : err)
  }
}

console.log(`[prerender] ${ok}/${routes.length} Routen statisch gerendert.`)
