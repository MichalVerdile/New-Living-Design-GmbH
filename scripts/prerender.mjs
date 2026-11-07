/**
 * Statisches Prerendering nach `vite build`.
 *
 * 1. Baut src/entry-server.tsx mit vite.config.ssr.ts nach dist-ssr/.
 * 2. Rendert jede Route aus scripts/routes.mjs (routes.json + Blogartikel) mit React.
 * 3. Schreibt das HTML in dist/<route>/index.html (Home: dist/index.html),
 *    mit den Head-Tags von react-helmet-async (Titel, Meta, Canonical, JSON-LD).
 *
 * 4. Schreibt dist/404.html (NotFound-Seite): ohne Catch-all-Rewrite liefert Vercel
 *    sie für unbekannte Adressen mit Status 404.
 *
 * Fällt eine Route aus, bekommt sie das normale SPA-HTML (sie bleibt erreichbar),
 * Fehler lassen den Build fehlschlagen, damit keine unbemerkt leeren SEO-Seiten veröffentlicht werden.
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { getRoutes } from './routes.mjs'

process.env.NODE_ENV ||= 'production'

const root = process.cwd()
const dist = path.join(root, 'dist')
const templatePath = path.join(dist, 'index.html')
const routes = getRoutes()
const manifest = JSON.parse(fs.readFileSync(path.join(dist, '.vite/manifest.json'), 'utf8'))
// Match the existing lazy page templates; include their static imports (e.g. galleries).
// No unrelated planner/booking CSS is needed on the home page.
const pageModules = {
  '/badumbau-zofingen': 'badumbau/Badumbau', '/referenzen': 'referenzen/Referenzen',
  '/badplaner': 'badplaner/Badplaner', '/blog': 'blog/Blog', '/produkte': 'products/Products',
  '/dienstleistungen': 'services/Services', '/partner': 'partners/Partners',
  '/booking': 'book-online/Booking', '/ueber-uns': 'about/About', '/kontakt': 'contact/Contact',
  '/datenschutz': 'data-security/DataSecurity', '/impressum': 'impressum/Impressum',
  '/agb': 'agb/Agb',
}
function routeCss(route) {
  const css = new Set()
  const visited = new Set()
  function visit(key) {
    if (visited.has(key)) return
    visited.add(key)
    const entry = manifest[key]
    if (!entry) throw new Error(`CSS manifest entry missing: ${key}`)
    for (const file of entry.css || []) css.add(file)
    for (const dependency of entry.imports || []) visit(dependency)
  }
  visit('index.html')
  const page = pageModules[route] || (route.startsWith('/blog/') ? 'blog/BlogPost' : route.startsWith('/produkte/') ? (route.split('/').length === 3 ? 'catalog/CategoryPage' : 'catalog/SupplierPage') : null)
  if (page) visit(`src/pages/${page}.tsx`)
  else if (route !== '/' && route !== '/404') throw new Error(`No page template for ${route}`)
  return [...css]
}


if (!fs.existsSync(templatePath)) {
  console.warn('[prerender] dist/index.html fehlt, nichts zu tun.')
  process.exit(1)
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
  process.exit(1)
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
    .replace(/\s*<(title|script)(?=[^>]*data-rh="true")[^>]*>[\s\S]*?<\/\1>/g, '')
    .replace(/\s*<(meta|link)(?=[^>]*data-rh="true")[^>]*>/g, '')
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
  process.exit(1)
}

/* ---------- 2./3. Routen rendern und schreiben ---------- */
let ok = 0
let failed = 0
for (const route of [...routes, '/404']) {
  const outFile =
    route === '/' ? templatePath : route === '/404' ? path.join(dist, '404.html') : path.join(dist, route.replace(/^\//, ''), 'index.html')
  try {
    const { html, head } = await render(route)
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
    for (const css of routeCss(route)) if (!page.includes(`/${css}`)) page = page.replace('</head>', `<link rel="stylesheet" href="/${css}">\n</head>`)

    const title = ((head.match(/<title[^>]*>([^<]*)<\/title>/) || [])[1] || '').replace(/&[#\w]+;/g, '_')
    if (title.length > 65) console.warn(`[prerender] ${route}: Titel hat ${title.length} Zeichen (max. 65, Google kürzt): ${title}`)

    fs.mkdirSync(path.dirname(outFile), { recursive: true })
    fs.writeFileSync(outFile, page)
    if (route !== '/404') ok++
    console.log(`[prerender] ${route} -> ${path.relative(root, outFile)} (${Math.round(page.length / 1024)} KB)`)
  } catch (err) {
    failed++
    console.warn(`[prerender] ${route} übersprungen, bleibt SPA:`, err && err.message ? err.message : err)
    if (route !== '/' && route !== '/404') {
      fs.mkdirSync(path.dirname(outFile), { recursive: true })
      fs.writeFileSync(outFile, template)
    }
  }
}

console.log(`[prerender] ${ok}/${routes.length} Routen statisch gerendert.`)

if (failed) process.exitCode = 1
