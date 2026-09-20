import { Editor, Node, mergeAttributes } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';

const mediaImage = Node.create({
  name: 'mediaImage', group: 'block', atom: true,
  addAttributes: () => ({ media_id: { default: '' }, alt: { default: '' }, caption: { default: '' } }),
  parseHTML: () => [{ tag: 'img[data-media-id]' }],
  renderHTML: ({ HTMLAttributes }) => ['img', mergeAttributes(HTMLAttributes, { 'data-media-id': HTMLAttributes.media_id, src: `/api/media/${HTMLAttributes.media_id}/`, alt: HTMLAttributes.alt })],
});
const callout = Node.create({ name: 'callout', group: 'block', content: 'block+', addAttributes: () => ({ tone: { default: 'note' }, title: { default: '' } }), parseHTML: () => [{ tag: 'aside[data-callout]' }], renderHTML: ({ HTMLAttributes }) => ['aside', mergeAttributes(HTMLAttributes, { 'data-callout': '', class: `content-callout content-callout--${HTMLAttributes.tone}` }), 0] });
const cta = Node.create({ name: 'cta', group: 'block', atom: true, addAttributes: () => ({ href: { default: '' }, label: { default: '' } }), parseHTML: () => [{ tag: 'a[data-content-cta]' }], renderHTML: ({ HTMLAttributes }) => ['a', mergeAttributes(HTMLAttributes, { 'data-content-cta': '', class: 'button', href: HTMLAttributes.href }), HTMLAttributes.label] });
const embed = Node.create({ name: 'embed', group: 'block', atom: true, addAttributes: () => ({ src: { default: '' }, title: { default: '' } }), parseHTML: () => [{ tag: 'iframe[data-content-embed]' }], renderHTML: ({ HTMLAttributes }) => ['iframe', mergeAttributes(HTMLAttributes, { 'data-content-embed': '', src: HTMLAttributes.src, title: HTMLAttributes.title, sandbox: 'allow-scripts allow-same-origin allow-popups' })] });
const table = Node.create({ name: 'table', group: 'block', content: 'tableRow+', parseHTML: () => [{ tag: 'table' }], renderHTML: () => ['table', ['tbody', 0]] });
const tableRow = Node.create({ name: 'tableRow', content: '(tableHeader|tableCell)+', parseHTML: () => [{ tag: 'tr' }], renderHTML: () => ['tr', 0] });
const tableHeader = Node.create({ name: 'tableHeader', content: 'paragraph+', parseHTML: () => [{ tag: 'th' }], renderHTML: () => ['th', { scope: 'col' }, 0] });
const tableCell = Node.create({ name: 'tableCell', content: 'paragraph+', parseHTML: () => [{ tag: 'td' }], renderHTML: () => ['td', 0] });
type StudioMedia = { id: string; alt_tr?: string | null; alt_en?: string | null; path?: string };

const element = document.querySelector<HTMLElement>('#block-editor');
const output = document.querySelector<HTMLTextAreaElement>('#body-json');
if (element && output) {
  let initial: unknown = { type: 'doc', content: [{ type: 'paragraph' }] };
  try { initial = JSON.parse(element.dataset.content ?? ''); } catch { /* keep empty document */ }
  let media: StudioMedia[] = [];
  try { media = JSON.parse(element.dataset.media ?? '[]') as StudioMedia[]; } catch { /* keep empty media collection */ }
  let dirty = false;
  const editor = new Editor({
    element,
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] } }), mediaImage, callout, cta, embed, table, tableRow, tableHeader, tableCell],
    editorProps: { attributes: { 'aria-label': 'İçerik blok editörü' } },
    content: initial as object,
    onUpdate: ({ editor }) => { output.value = JSON.stringify(editor.getJSON()); dirty = true; },
  });
  const sync = () => { output.value = JSON.stringify(editor.getJSON()); };
  const promptText = (label: string, initialValue = '') => window.prompt(label, initialValue)?.trim();
  document.querySelectorAll<HTMLButtonElement>('[data-editor]').forEach((button) => {
    button.addEventListener('click', () => {
      switch (button.dataset.editor) {
        case 'paragraph': editor.chain().focus().setParagraph().run(); break;
        case 'heading2': editor.chain().focus().toggleHeading({ level: 2 }).run(); break;
        case 'heading3': editor.chain().focus().toggleHeading({ level: 3 }).run(); break;
        case 'bold': editor.chain().focus().toggleBold().run(); break;
        case 'italic': editor.chain().focus().toggleItalic().run(); break;
        case 'bullet': editor.chain().focus().toggleBulletList().run(); break;
        case 'quote': editor.chain().focus().toggleBlockquote().run(); break;
        case 'code': editor.chain().focus().toggleCodeBlock().run(); break;
        case 'divider': editor.chain().focus().setHorizontalRule().run(); break;
        case 'media': {
          if (!media.length) { window.alert('Önce Medya bölümünden bir görsel yükleyin.'); break; }
          const options = media.map((item, index) => `${index + 1}. ${item.alt_tr || item.alt_en || item.path || 'Görsel'}`).join('\n');
          const selected = media[Number(promptText(`Görsel seçin:\n${options}`, '1')) - 1];
          if (!selected) break;
          const alt = promptText('Alternatif metin', selected.alt_tr || selected.alt_en || '') ?? '';
          const caption = promptText('Açıklama (isteğe bağlı)', '') ?? '';
          editor.chain().focus().insertContent({ type: 'mediaImage', attrs: { media_id: selected.id, alt, caption } }).run(); break;
        }
        case 'callout': {
          const title = promptText('Not başlığı', 'Not'); const tone = promptText('Ton: note, info veya warning', 'note');
          if (!title || !['note', 'info', 'warning'].includes(tone ?? '')) break;
          editor.chain().focus().insertContent({ type: 'callout', attrs: { title, tone }, content: [{ type: 'paragraph' }] }).run(); break;
        }
        case 'cta': { const label = promptText('Buton metni'); const href = promptText('Güvenli bağlantı (/... veya https://...)'); if (label && href) editor.chain().focus().insertContent({ type: 'cta', attrs: { label, href } }).run(); break; }
        case 'embed': { const src = promptText('YouTube veya Vimeo gömme URL’si'); const title = promptText('Gömülü içeriğin başlığı', 'Gömülü içerik') || 'Gömülü içerik'; if (src) editor.chain().focus().insertContent({ type: 'embed', attrs: { src, title } }).run(); break; }
        case 'table': editor.chain().focus().insertContent({ type: 'table', content: [{ type: 'tableRow', content: [{ type: 'tableHeader', content: [{ type: 'paragraph' }] }, { type: 'tableHeader', content: [{ type: 'paragraph' }] }] }, { type: 'tableRow', content: [{ type: 'tableCell', content: [{ type: 'paragraph' }] }, { type: 'tableCell', content: [{ type: 'paragraph' }] }] }] }).run(); break;
      }
      sync();
    });
  });
  sync();
  output.form?.addEventListener('submit', () => { sync(); dirty = false; });
  window.addEventListener('beforeunload', (event) => { if (dirty) event.preventDefault(); });
}
