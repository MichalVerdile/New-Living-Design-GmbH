/**
 * Blogartikel: eine Markdown-Datei pro Artikel in src/content/blog/<slug>.md.
 *
 * Frontmatter (zwischen den beiden `---`-Zeilen):
 *   title        Überschrift (H1) und Titel für Google
 *   seoTitle     optional, kürzerer Titel für den <title>-Tag
 *   description  1–2 Sätze: Meta-Description, Vorschau in der Übersicht
 *   date         Veröffentlichung, JJJJ-MM-TT
 *   updated      optional, letzte Änderung, JJJJ-MM-TT
 *   image        Titelbild, z. B. /referenzen/bad-marmor-beige-01.webp
 *   imageAlt     Bildbeschreibung
 *   category     z. B. Kosten, Steuern, Material, Referenz
 *   keywords     kommagetrennt
 *   draft        true = nirgends sichtbar (Übersicht, Route, Sitemap)
 *
 * Die Route /blog/<slug> ergibt sich aus dem Dateinamen; scripts/routes.mjs liest
 * dieselben Dateien für Sitemap und Prerendering.
 */
import { business } from '../config/business';

export interface BlogPost {
  slug: string;
  url: string;          // relativ, z. B. /blog/steuerabzug-badumbau-bis-2028
  absoluteUrl: string;
  title: string;
  seoTitle: string;
  description: string;
  date: string;         // JJJJ-MM-TT
  updated: string;      // JJJJ-MM-TT
  image: string;        // relativ zu /
  imageAlt: string;
  category: string;
  keywords: string[];
  draft: boolean;
  body: string;         // Markdown ohne Frontmatter
  wordCount: number;
  readingMinutes: number;
}

const files = import.meta.glob('../content/blog/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: raw };
  const data: Record<string, string> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    data[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, '');
  }
  return { data, body: m[2] };
}

function countWords(markdown: string): number {
  const text = markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#*>|`_-]+/g, ' ');
  return text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

function toPost(path: string, raw: string): BlogPost {
  const slug = path.replace(/^.*\//, '').replace(/\.md$/, '');
  const { data, body } = parseFrontmatter(raw);
  const date = data.date || '1970-01-01';
  const wordCount = countWords(body);
  const url = `/blog/${slug}`;
  return {
    slug,
    url,
    absoluteUrl: `${business.siteUrl}${url}`,
    title: data.title || slug,
    seoTitle: data.seoTitle || data.title || slug,
    description: data.description || '',
    date,
    updated: data.updated || date,
    image: data.image || '/og-image.jpg',
    imageAlt: data.imageAlt || data.title || '',
    category: data.category || 'Badumbau',
    keywords: (data.keywords || '').split(',').map((k) => k.trim()).filter(Boolean),
    draft: data.draft === 'true',
    body,
    wordCount,
    readingMinutes: Math.max(1, Math.round(wordCount / 200)),
  };
}

/** Alle veröffentlichten Artikel, neueste zuerst. */
export const posts: BlogPost[] = Object.entries(files)
  .map(([path, raw]) => toPost(path, raw))
  .filter((p) => !p.draft)
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug)));

export const getPost = (slug: string): BlogPost | undefined => posts.find((p) => p.slug === slug);

const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

/** "2026-09-14" -> "14. September 2026" (fest kodiert, damit Server und Browser dasselbe ausgeben) */
export function formatDate(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return iso;
  return `${parseInt(m[3], 10)}. ${months[parseInt(m[2], 10) - 1]} ${m[1]}`;
}

export const BLOG_NAME = 'Blog von New Living Design';
export const BLOG_URL = `${business.siteUrl}/blog`;
