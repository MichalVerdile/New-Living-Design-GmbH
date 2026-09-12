/**
 * Kleiner Markdown-Renderer für die Blogartikel, ohne zusätzliche Abhängigkeit.
 * Läuft identisch im Browser und beim statischen Prerendering.
 *
 * Unterstützt:
 *   ## / ### Überschriften (mit Anker-ID)     - Liste, 1. Liste
 *   Absätze, **fett**, *kursiv*                > Hinweis-Kasten
 *   [Text](/interner-link) und externe Links   ![Alt](/bild.webp "Bildunterschrift")
 *   | Tabellen | mit Kopfzeile |               --- Trennlinie
 */
import React from 'react';
import { Link } from 'react-router-dom';

type Block =
  | { type: 'heading'; level: 2 | 3; text: string; id: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'quote'; text: string }
  | { type: 'image'; src: string; alt: string; caption?: string }
  | { type: 'table'; header: string[]; rows: string[][] }
  | { type: 'hr' };

/** "Was gilt ab 2029?" -> "was-gilt-ab-2029" */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function splitCells(line: string): string[] {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
}

function parseBlocks(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === '') { i++; continue; }

    if (/^---+$/.test(trimmed)) { blocks.push({ type: 'hr' }); i++; continue; }

    const heading = trimmed.match(/^(#{1,3})\s+(.+?)\s*#*$/);
    if (heading) {
      const level = heading[1].length <= 2 ? 2 : 3; // "#" wird wie "##" behandelt, H1 ist der Titel
      blocks.push({ type: 'heading', level, text: heading[2], id: slugify(heading[2]) });
      i++;
      continue;
    }

    const image = trimmed.match(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/);
    if (image) {
      blocks.push({ type: 'image', alt: image[1], src: image[2], caption: image[3] });
      i++;
      continue;
    }

    if (trimmed.startsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) { tableLines.push(lines[i]); i++; }
      const header = splitCells(tableLines[0]);
      const rows = tableLines
        .slice(1)
        .filter((l) => !/^\|?\s*:?-{2,}/.test(l.trim()))
        .map(splitCells);
      blocks.push({ type: 'table', header, rows });
      continue;
    }

    if (trimmed.startsWith('>')) {
      const quote: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quote.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      blocks.push({ type: 'quote', text: quote.join('\n') });
      continue;
    }

    const listItem = trimmed.match(/^([-*]|\d+\.)\s+(.*)$/);
    if (listItem) {
      const ordered = /^\d+\./.test(listItem[1]);
      const items: string[] = [];
      while (i < lines.length) {
        const m = lines[i].trim().match(/^([-*]|\d+\.)\s+(.*)$/);
        if (!m) break;
        items.push(m[2]);
        i++;
        // Fortsetzungszeilen (eingerückt) an den letzten Punkt anhängen
        while (i < lines.length && /^\s{2,}\S/.test(lines[i]) && !/^\s*([-*]|\d+\.)\s/.test(lines[i])) {
          items[items.length - 1] += ' ' + lines[i].trim();
          i++;
        }
      }
      blocks.push({ type: 'list', ordered, items });
      continue;
    }

    // Absatz: bis zur nächsten Leerzeile oder zum nächsten Blockanfang
    const para: string[] = [trimmed];
    i++;
    while (i < lines.length) {
      const t = lines[i].trim();
      if (t === '' || /^(#{1,3}\s|[-*]\s|\d+\.\s|>|\||!\[|---)/.test(t)) break;
      para.push(t);
      i++;
    }
    blocks.push({ type: 'paragraph', text: para.join(' ') });
  }

  return blocks;
}

const INLINE = /(\*\*[^*]+\*\*|\*[^*\n]+\*|\[[^\]]+\]\([^)\s]+\))/g;

/** Fett, kursiv und Links innerhalb einer Zeile. */
function renderInline(text: string, keyPrefix = 'i'): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const parts = text.split(INLINE);
  parts.forEach((part, idx) => {
    if (!part) return;
    const key = `${keyPrefix}-${idx}`;
    if (part.startsWith('**') && part.endsWith('**')) {
      out.push(<strong key={key}>{renderInline(part.slice(2, -2), key)}</strong>);
      return;
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      out.push(<em key={key}>{renderInline(part.slice(1, -1), key)}</em>);
      return;
    }
    const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (link) {
      const [, label, href] = link;
      if (href.startsWith('/')) {
        out.push(<Link key={key} to={href}>{renderInline(label, key)}</Link>);
      } else if (href.startsWith('#') || href.startsWith('tel:') || href.startsWith('mailto:')) {
        out.push(<a key={key} href={href}>{renderInline(label, key)}</a>);
      } else {
        out.push(<a key={key} href={href} target="_blank" rel="noopener noreferrer">{renderInline(label, key)}</a>);
      }
      return;
    }
    out.push(part);
  });
  return out;
}

interface MarkdownProps {
  source: string;
  className?: string;
}

/** Rendert den Markdown-Text eines Artikels als HTML-Elemente. */
export const Markdown: React.FC<MarkdownProps> = ({ source, className }) => {
  const blocks = parseBlocks(source);
  return (
    <div className={className}>
      {blocks.map((b, idx) => {
        const key = `b${idx}`;
        switch (b.type) {
          case 'heading':
            return b.level === 2
              ? <h2 key={key} id={b.id}>{renderInline(b.text, key)}</h2>
              : <h3 key={key} id={b.id}>{renderInline(b.text, key)}</h3>;
          case 'paragraph':
            return <p key={key}>{renderInline(b.text, key)}</p>;
          case 'list':
            return b.ordered
              ? <ol key={key}>{b.items.map((it, j) => <li key={j}>{renderInline(it, `${key}-${j}`)}</li>)}</ol>
              : <ul key={key}>{b.items.map((it, j) => <li key={j}>{renderInline(it, `${key}-${j}`)}</li>)}</ul>;
          case 'quote':
            return (
              <aside key={key} role="note">
                {b.text.split('\n').filter(Boolean).map((l, j) => <p key={j}>{renderInline(l, `${key}-${j}`)}</p>)}
              </aside>
            );
          case 'image':
            return (
              <figure key={key}>
                <img src={b.src} alt={b.alt} loading="lazy" />
                {b.caption && <figcaption>{b.caption}</figcaption>}
              </figure>
            );
          case 'table':
            return (
              <div key={key} data-table-wrap="">
                <table>
                  <thead>
                    <tr>{b.header.map((h, j) => <th key={j} scope="col">{renderInline(h, `${key}-h${j}`)}</th>)}</tr>
                  </thead>
                  <tbody>
                    {b.rows.map((r, ri) => (
                      <tr key={ri}>{r.map((c, ci) => <td key={ci}>{renderInline(c, `${key}-${ri}-${ci}`)}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case 'hr':
            return <hr key={key} />;
          default:
            return null;
        }
      })}
    </div>
  );
};

export default Markdown;
