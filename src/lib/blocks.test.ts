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
});
