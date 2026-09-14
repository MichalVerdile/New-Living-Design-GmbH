/** Deterministic static-output checks. This is not browser/layout QA. */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = path.join(root, 'dist');
const page = (route = '') => readFileSync(path.join(dist, route, 'index.html'), 'utf8');
const home = page();
const main = home.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1];
assert.ok(main, 'Home has a prerendered main landmark');
assert.match(home, /data-prerendered="\/"/);
assert.match(main, /<h1\b[^>]*>Bad, Platten[\s\S]*?Wellness\.[\s\S]*?<\/h1>/);
assert.equal([...main.matchAll(/<h1\b/g)].length, 1);
for (const anchor of ['bad', 'platten', 'wellness']) {
  assert.ok(main.includes(`href="/produkte#${anchor}"`), `Home links to ${anchor}`);
  assert.ok(page('produkte').includes(`id="${anchor}"`), `Product target ${anchor} exists`);
}
const ordered = ['sortiment-title', 'showroom-title', 'references-title', 'planner-title', 'renovation-title', 'contact-title'];
for (let index = 1; index < ordered.length; index += 1) {
  assert.ok(main.indexOf(`id="${ordered[index - 1]}"`) < main.indexOf(`id="${ordered[index]}"`), `Home order: ${ordered[index - 1]} before ${ordered[index]}`);
}
assert.doesNotMatch(main, /Online Buchen|eigene Equipe|Traumhadbad|30 Sekunden|23 Bewertungen|Häufige Fragen|href="\/blog/i);
assert.match(main, /Ausstellungsberatung anfragen/);
assert.match(main, /href="\/badplaner"/);
assert.match(main, /Sortimentsbilder unserer Lieferanten/);
assert.match(main, /wohnraum-boden-marmoroptik/);
assert.doesNotMatch(main, /kueche-insel-messing/);
for (const amount of ["21&#x27;300", "27&#x27;700", "36&#x27;800"]) assert.ok(main.includes(amount), `Existing package amount ${amount} is retained`);

const references = [...main.matchAll(/href="\/referenzen#([^"]+)"/g)].map((match) => match[1]);
assert.equal(references.length, 3);
for (const id of references) assert.ok(page('referenzen').includes(`id="${id}"`), `Reference target ${id} exists`);
const images = [...main.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)].map((match) => match[1]);
assert.equal(images.length, 7, 'One real showroom image, three category images, three reference images');
for (const src of images) {
  assert.ok(src.startsWith('/assets/') || src.startsWith('/referenzen/'));
  assert.ok(existsSync(path.join(dist, decodeURIComponent(src))), `Materialized asset: ${src}`);
}
assert.doesNotMatch(main, /class="[^"]*\bundefined\b/);

const header = home.match(/<header\b[^>]*>([\s\S]*?)<\/header>/)?.[1];
assert.ok(header);
const desktop = header.match(/<nav\b[^>]*class="nav-desktop"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
assert.ok(desktop);
const links = [...desktop.matchAll(/href="([^"]+)"/g)].map((match) => match[1]);
assert.deepEqual(links, ['/produkte#bad', '/produkte#platten', '/produkte#wellness', '/badplaner', '/referenzen', '/ueber-uns']);
assert.match(header, /aria-expanded="false"/);
assert.match(header, /aria-controls="[^"]+"/);
assert.match(header, /aria-label="Menü öffnen"/);
assert.doesNotMatch(header, /Online Buchen/);
assert.match(header, /href="\/kontakt"[^>]*>Beratung anfragen/);
const footer = home.match(/<footer\b[^>]*>([\s\S]*?)<\/footer>/)?.[1];
assert.ok(footer);
assert.doesNotMatch(footer, /eigene Equipe/i);
for (const route of ['badumbau-zofingen', 'dienstleistungen', 'partner', 'blog', 'booking', 'kontakt']) assert.ok(footer.includes(`href="/${route}"`));

const jsonLd = [...home.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]));
assert.ok(jsonLd.length > 0);
assert.doesNotMatch(JSON.stringify(jsonLd), /eigene Equipe/i);
assert.match(JSON.stringify(jsonLd), /Bad, Platten und Wellness/);

const css = readFileSync(path.join(root, 'src/pages/home/Home.module.css'), 'utf8');
const source = readFileSync(path.join(root, 'src/pages/home/Home.tsx'), 'utf8');
for (const [, name] of source.matchAll(/styles\.([A-Za-z][A-Za-z0-9]*)/g)) assert.ok(css.includes(`.${name}`), `CSS module defines ${name}`);
assert.match(css, /prefers-reduced-motion/);
assert.match(readFileSync(path.join(root, 'src/components/header/Header.css'), 'utf8'), /min-width: 1100px/);
console.log('PR2 static checks passed: sales-first order, category/reference anchors, 7 local images, six-link navigation, secondary routes, prices and SEO. Browser/layout QA remains unverified.');
