import { describe, expect, it } from 'vitest';
import { parseDocument, renderDocument } from './blocks';
describe('controlled blocks', () => {
  it('renders headings and marks', () => {
    const doc = parseDocument(JSON.stringify({ type: 'doc', content: [{ type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Hello', marks: [{ type: 'bold' }] }] }] }));
    expect(doc && renderDocument(doc)).toBe('<h2><strong>Hello</strong></h2>');
  });
  it('rejects scripts and unsafe links', () => {
    expect(parseDocument('{"type":"doc","content":[{"type":"script"}]}')).toBeNull();
    expect(parseDocument('{"type":"doc","content":[{"type":"text","text":"go","marks":[{"type":"link","attrs":{"href":"javascript:alert(1)"}}]}]}')).toBeNull();
  });
  it('escapes text', () => {
    const doc = parseDocument('{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"<img>"}]}]}');
    expect(doc && renderDocument(doc)).toContain('&lt;img&gt;');
  });
  it('renders controlled rich blocks and rejects unsafe attributes', () => {
    const id = '123e4567-e89b-42d3-a456-426614174000';
    const doc = parseDocument(JSON.stringify({ type: 'doc', content: [
      { type: 'mediaImage', attrs: { media_id: id, alt: 'Portal' } },
      { type: 'mediaGallery', attrs: { media_ids: [id] } },
      { type: 'callout', attrs: { tone: 'note', title: 'Not' }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Açıklama' }] }] },
      { type: 'cta', attrs: { href: '/contact/', label: 'İletişim' } },
      { type: 'table', content: [{ type: 'tableRow', content: [{ type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Başlık' }] }] }] }] },
    ] }));
    expect(doc && renderDocument(doc)).toContain(`/api/media/${id}/`);
    expect(doc && renderDocument(doc)).toContain('<table>');
    expect(doc && renderDocument(doc)).toContain('content-gallery');
    expect(parseDocument(JSON.stringify({ type: 'doc', content: [{ type: 'mediaGallery', attrs: { media_ids: ['not-a-uuid'] } }] }))).toBeNull();
    expect(parseDocument(JSON.stringify({ type: 'doc', content: [{ type: 'cta', attrs: { href: 'javascript:alert(1)', label: 'X' } }] }))).toBeNull();
    expect(parseDocument(JSON.stringify({ type: 'doc', content: [{ type: 'embed', attrs: { src: 'https://www.youtube.com/embed/example', title: 'Video' } }] }))).not.toBeNull();
    expect(parseDocument(JSON.stringify({ type: 'doc', content: [{ type: 'embed', attrs: { src: 'https://www.youtube.com/watch?v=example', title: 'Video' } }] }))).toBeNull();
    expect(parseDocument(JSON.stringify({ type: 'doc', content: [{ type: 'embed', attrs: { src: 'https://untrusted.example/embed', title: 'X' } }] }))).toBeNull();
    expect(parseDocument(JSON.stringify({ type: 'doc', content: [{ type: 'mediaImage', attrs: { media_id: id, alt: 'A', caption: 7 } }] }))).toBeNull();
  });
});
