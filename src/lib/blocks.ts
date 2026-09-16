import { safeExternalUrl } from './site';

export type Block = { type: string; text?: string; attrs?: Record<string, unknown>; marks?: { type: string; attrs?: Record<string, unknown> }[]; content?: Block[] };
export type Document = { type: 'doc'; content: Block[] };
const blockTypes = new Set(['paragraph','heading','blockquote','bulletList','orderedList','listItem','codeBlock','horizontalRule','text','hardBreak']);
const markTypes = new Set(['bold','italic','strike','code','link']);
const escapeHtml = (text: string) => text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
function validNode(node: unknown, depth = 0): node is Block {
  if (!node || typeof node !== 'object' || depth > 24) return false;
  const value = node as Block;
  if (!blockTypes.has(value.type)) return false;
  if (value.text !== undefined && (typeof value.text !== 'string' || value.text.length > 100000)) return false;
  if (value.content !== undefined && (!Array.isArray(value.content) || value.content.length > 1000 || !value.content.every((child) => validNode(child, depth + 1)))) return false;
  if (value.marks !== undefined && (!Array.isArray(value.marks) || !value.marks.every((mark) => markTypes.has(mark.type)))) return false;
  if (value.type === 'heading' && ![2,3].includes(Number(value.attrs?.level))) return false;
  if (value.marks?.some((mark) => mark.type === 'link' && !safeLink(String(mark.attrs?.href ?? '')))) return false;
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
    const tag = node.type === 'heading' ? `h${node.attrs?.level}` : ({ paragraph: 'p', blockquote: 'blockquote', bulletList: 'ul', orderedList: 'ol', listItem: 'li', codeBlock: 'pre' } as Record<string,string>)[node.type];
    if (node.type === 'codeBlock') return `<pre><code>${inside}</code></pre>`;
    return `<${tag}>${inside}</${tag}>`;
  };
  return doc.content.map(render).join('');
}
