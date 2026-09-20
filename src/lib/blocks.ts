import { safeExternalUrl } from './site';

export type Block = { type: string; text?: string; attrs?: Record<string, unknown>; marks?: { type: string; attrs?: Record<string, unknown> }[]; content?: Block[] };
export type Document = { type: 'doc'; content: Block[] };
const blockTypes = new Set(['paragraph','heading','blockquote','bulletList','orderedList','listItem','codeBlock','horizontalRule','text','hardBreak','mediaImage','callout','cta','embed','table','tableRow','tableHeader','tableCell']);
const markTypes = new Set(['bold','italic','strike','code','link']);
const escapeHtml = (text: string) => text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function validNode(node: unknown, depth = 0): node is Block {
  if (!node || typeof node !== 'object' || depth > 24) return false;
  const value = node as Block;
  if (!blockTypes.has(value.type)) return false;
  if (value.text !== undefined && (typeof value.text !== 'string' || value.text.length > 100000)) return false;
  if (value.content !== undefined && (!Array.isArray(value.content) || value.content.length > 1000 || !value.content.every((child) => validNode(child, depth + 1)))) return false;
  if (value.marks !== undefined && (!Array.isArray(value.marks) || !value.marks.every((mark) => markTypes.has(mark.type)))) return false;
  if (value.type === 'heading' && ![2,3].includes(Number(value.attrs?.level))) return false;
  if (value.marks?.some((mark) => mark.type === 'link' && !safeLink(String(mark.attrs?.href ?? '')))) return false;
  if (value.type === 'mediaImage' && (!uuid.test(String(value.attrs?.media_id ?? '')) || typeof value.attrs?.alt !== 'string' || value.attrs.alt.length > 300 || (value.attrs?.caption !== undefined && (typeof value.attrs.caption !== 'string' || value.attrs.caption.length > 300)))) return false;
  if (value.type === 'callout' && (!['note','info','warning'].includes(String(value.attrs?.tone ?? '')) || typeof value.attrs?.title !== 'string' || value.attrs.title.length > 120)) return false;
  if (value.type === 'cta' && (!safeLink(String(value.attrs?.href ?? '')) || typeof value.attrs?.label !== 'string' || !String(value.attrs?.label).trim() || String(value.attrs?.label).length > 120)) return false;
  if (value.type === 'embed' && (!safeExternalUrl(String(value.attrs?.src ?? '')) || (value.attrs?.title !== undefined && (typeof value.attrs.title !== 'string' || value.attrs.title.length > 160)))) return false;
  if (value.type === 'table' && (value.content?.some((child) => child.type !== 'tableRow') ?? true)) return false;
  if (value.type === 'tableRow' && (value.content?.some((child) => !['tableHeader','tableCell'].includes(child.type)) ?? true)) return false;
  if (['tableHeader','tableCell'].includes(value.type) && (value.content?.some((child) => child.type !== 'paragraph') ?? true)) return false;
  return true;
}
export function safeLink(value: string): boolean { return value.startsWith('/') && !value.startsWith('//') || safeExternalUrl(value); }
export function parseDocument(value: string): Document | null {
  if (value.length > 100000) return null;
  try {
    const parsed = JSON.parse(value) as Document;
    if (parsed.type !== 'doc' || !Array.isArray(parsed.content) || parsed.content.length > 1000 || !parsed.content.every((node) => validNode(node))) return null;
    return parsed;
  } catch { return null; }
}
export function renderDocument(doc: Document): string {
  const render = (node: Block): string => {
    const inside = (node.content ?? []).map(render).join('');
    if (node.type === 'text') {
      let text = escapeHtml(node.text ?? '');
      for (const mark of node.marks ?? []) {
        if (mark.type === 'bold') text = `<strong>${text}</strong>`;
        if (mark.type === 'italic') text = `<em>${text}</em>`;
        if (mark.type === 'strike') text = `<s>${text}</s>`;
        if (mark.type === 'code') text = `<code>${text}</code>`;
        if (mark.type === 'link' && safeLink(String(mark.attrs?.href ?? ''))) text = `<a href="${escapeHtml(String(mark.attrs?.href))}" rel="noopener noreferrer">${text}</a>`;
      }
      return text;
    }
    if (node.type === 'hardBreak') return '<br />';
    if (node.type === 'horizontalRule') return '<hr />';
    if (node.type === 'mediaImage') return `<figure class="content-media"><img src="/api/media/${escapeHtml(String(node.attrs?.media_id))}/" alt="${escapeHtml(String(node.attrs?.alt))}" loading="lazy" />${node.attrs?.caption ? `<figcaption>${escapeHtml(String(node.attrs.caption))}</figcaption>` : ''}</figure>`;
    if (node.type === 'callout') return `<aside class="content-callout content-callout--${escapeHtml(String(node.attrs?.tone))}"><strong>${escapeHtml(String(node.attrs?.title))}</strong>${inside}</aside>`;
    if (node.type === 'cta') return `<p class="content-cta"><a class="button" href="${escapeHtml(String(node.attrs?.href))}" rel="noopener noreferrer">${escapeHtml(String(node.attrs?.label))} →</a></p>`;
    if (node.type === 'embed') return `<figure class="content-embed"><iframe src="${escapeHtml(String(node.attrs?.src))}" title="${escapeHtml(String(node.attrs?.title ?? 'Embedded content'))}" loading="lazy" sandbox="allow-scripts allow-same-origin allow-popups" referrerpolicy="strict-origin-when-cross-origin"></iframe></figure>`;
    if (node.type === 'table') return `<div class="content-table-wrap"><table>${inside}</table></div>`;
    if (node.type === 'tableRow') return `<tr>${inside}</tr>`;
    if (node.type === 'tableHeader') return `<th scope="col">${inside}</th>`;
    if (node.type === 'tableCell') return `<td>${inside}</td>`;
    const tag = node.type === 'heading' ? `h${node.attrs?.level}` : ({ paragraph: 'p', blockquote: 'blockquote', bulletList: 'ul', orderedList: 'ol', listItem: 'li', codeBlock: 'pre' } as Record<string,string>)[node.type];
    if (node.type === 'codeBlock') return `<pre><code>${inside}</code></pre>`;
    return `<${tag}>${inside}</${tag}>`;
  };
  return doc.content.map(render).join('');
}
