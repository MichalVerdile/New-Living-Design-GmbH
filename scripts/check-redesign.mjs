/** Run after npm run build. Checks the actual crawlable, prerendered output. */
import fs from 'node:fs';
import path from 'node:path';
import { getRoutes } from './routes.mjs';
const routes = getRoutes();
const routeSet = new Set(routes);
const failures = [];
const pages = new Map();
const check = (condition, message) => { if (!condition) failures.push(message); };
const attrs = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(m => [m[1], m[2]]));
const decode = text => text.replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"');
for (const route of routes) {
  const file = path.join('dist', route === '/' ? '' : route, 'index.html');
  check(fs.existsSync(file), `${route}: missing HTML`);
  if (!fs.existsSync(file)) continue;
  const html = fs.readFileSync(file, 'utf8');
  const tags = [...html.matchAll(/<[^!][^>]*>/g)].map(m => m[0]);
  const ids = tags.map(attrs).map(a => a.id).filter(Boolean);
  check(html.includes(`data-prerendered="${route}"`), `${route}: missing prerender marker`);
  check((html.match(/<h1\b/g) || []).length === 1, `${route}: expected one H1`);
  check(ids.length === new Set(ids).size, `${route}: duplicate IDs`);
  const canonicals = tags.filter(t => t.startsWith('<link') && attrs(t).rel === 'canonical');
  check(canonicals.length === 1 && attrs(canonicals[0]).href === `https://newlivingdesign.ch${route === '/' ? '/' : route}`, `${route}: canonical missing, duplicated or incorrect`);
  check(tags.some(t => t.startsWith('<meta') && attrs(t).name === 'description' && attrs(t).content?.length > 40), `${route}: missing description`);
  check(!tags.some(t => t.startsWith('<meta') && attrs(t).name === 'robots' && attrs(t).content?.includes('noindex')), `${route}: accidental noindex`);
  check(!html.includes('The server did not finish this Suspense boundary'), `${route}: unfinished lazy content`);
  for (const json of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(json[1]); } catch { failures.push(`${route}: invalid JSON-LD`); }
  }
  for (const image of tags.filter(t => t.startsWith('<img'))) {
    const a = attrs(image);
    check('alt' in a, `${route}: image without alt: ${a.src}`);
    if (a.src?.startsWith('/')) check(fs.existsSync(path.join('dist', decodeURIComponent(a.src))), `${route}: missing image ${a.src}`);
  }
  pages.set(route, { html, ids: new Set(ids), tags });
}
for (const [route, page] of pages) {
  for (const tag of page.tags.filter(t => /^<a\b/.test(t))) {
    const href = decode(attrs(tag).href || '');
    if (!href.startsWith('/') && !href.startsWith('#')) continue;
    if (href.startsWith('//')) continue;
    const url = new URL(href, `https://newlivingdesign.ch${route}`);
    if (path.extname(url.pathname)) continue;
    check(routeSet.has(url.pathname), `${route}: broken internal route ${href}`);
    if (url.hash && pages.has(url.pathname)) check(pages.get(url.pathname).ids.has(decodeURIComponent(url.hash.slice(1))), `${route}: missing fragment ${href}`);
  }
}
const notFound = fs.readFileSync('dist/404.html', 'utf8');
check(/noindex/.test(notFound), '404 must be noindex');
const sitemap = new Set([...fs.readFileSync('dist/sitemap.xml', 'utf8').matchAll(/<loc>\s*([^<]*?)\s*<\/loc>/g)].map(m => m[1]));
for (const route of routes) check(sitemap.has(`https://newlivingdesign.ch${route === '/' ? '/' : route}`), `Sitemap missing ${route}`);
check(fs.readFileSync('dist/robots.txt', 'utf8').includes('Sitemap:'), 'robots.txt has no sitemap');
fs.mkdirSync('tests/redesign', { recursive: true });
fs.writeFileSync('tests/redesign/routes.json', JSON.stringify(routes, null, 2) + '\n');
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
else console.log(`PASS: ${routes.length} prerendered routes, titles/descriptions/canonicals, H1/IDs, JSON-LD, local images, links/fragments, sitemap and 404.`);
