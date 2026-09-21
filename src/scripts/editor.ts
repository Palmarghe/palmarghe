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
  const dialog = document.createElement('dialog');
  dialog.className = 'editor-block-dialog';
  dialog.innerHTML = '<form method="dialog"><header><strong id="editor-dialog-title"></strong><button value="cancel" aria-label="Kapat">×</button></header><div class="editor-dialog-fields"></div><footer><button value="cancel" type="button" data-dialog-cancel>Vazgeç</button><button value="confirm">Ekle</button></footer></form>';
  document.body.append(dialog);
  const fields = dialog.querySelector<HTMLElement>('.editor-dialog-fields')!;
  const dialogTitle = dialog.querySelector<HTMLElement>('#editor-dialog-title')!;
  const openDialog = (kind: 'media' | 'callout' | 'cta' | 'embed') => {
    const mediaOptions = media.map((item) => `<option value="${item.id}">${item.alt_tr || item.alt_en || item.path || 'Görsel'}</option>`).join('');
    dialogTitle.textContent = ({ media: 'Görsel ekle', callout: 'Not ekle', cta: 'Buton ekle', embed: 'Video ekle' })[kind];
    fields.innerHTML = kind === 'media' ? `<label>Medya<select name="media_id" required>${mediaOptions}</select></label><label>Alternatif metin<input name="alt" maxlength="300" required></label><label>Açıklama<input name="caption" maxlength="300"></label>` : kind === 'callout' ? '<label>Tür<select name="tone"><option value="note">Not</option><option value="info">Bilgi</option><option value="warning">Uyarı</option></select></label><label>Başlık<input name="title" maxlength="120" required value="Not"></label>' : kind === 'cta' ? '<label>Buton metni<input name="label" maxlength="120" required></label><label>Bağlantı<input name="href" placeholder="/iletisim/ veya https://" required></label>' : '<label>YouTube veya Vimeo URL<input name="src" type="url" required placeholder="https://www.youtube.com/watch?v=..."></label><label>Başlık<input name="title" maxlength="160" required value="Video"></label>';
    const form = dialog.querySelector('form')!;
    form.onsubmit = (event) => { event.preventDefault(); const data = new FormData(form); if (kind === 'media') { const selected = media.find((item) => item.id === data.get('media_id')); if (!selected) return; editor.chain().focus().insertContent({ type: 'mediaImage', attrs: { media_id: selected.id, alt: String(data.get('alt') || selected.alt_tr || selected.alt_en || ''), caption: String(data.get('caption') || '') } }).run(); } if (kind === 'callout') editor.chain().focus().insertContent({ type: 'callout', attrs: { tone: String(data.get('tone')), title: String(data.get('title')) }, content: [{ type: 'paragraph' }] }).run(); if (kind === 'cta') editor.chain().focus().insertContent({ type: 'cta', attrs: { label: String(data.get('label')), href: String(data.get('href')) } }).run(); if (kind === 'embed') editor.chain().focus().insertContent({ type: 'embed', attrs: { src: normalizeEmbed(String(data.get('src'))), title: String(data.get('title')) } }).run(); dialog.close(); sync(); };
    dialog.querySelector<HTMLButtonElement>('[data-dialog-cancel]')!.onclick = () => dialog.close();
    dialog.showModal();
    dialog.querySelector<HTMLElement>('input,select')?.focus();
  };
  const normalizeEmbed = (value: string) => { try { const url = new URL(value); if (url.hostname.includes('youtu')) { const id = url.searchParams.get('v') || url.pathname.split('/').filter(Boolean).pop(); return id ? `https://www.youtube-nocookie.com/embed/${id}` : value; } if (url.hostname === 'vimeo.com') { const id = url.pathname.split('/').filter(Boolean).pop(); return id ? `https://player.vimeo.com/video/${id}` : value; } return value; } catch { return value; } };
  document.querySelectorAll<HTMLButtonElement>('[data-editor]').forEach((button) => {
    button.addEventListener('click', () => {
      switch (button.dataset.editor) {
        case 'paragraph': editor.chain().focus().setParagraph().run(); break;
        case 'heading2': editor.chain().focus().toggleHeading({ level: 2 }).run(); break;
        case 'heading3': editor.chain().focus().toggleHeading({ level: 3 }).run(); break;
        case 'bold': editor.chain().focus().toggleBold().run(); break;
        case 'italic': editor.chain().focus().toggleItalic().run(); break;
        case 'ordered': editor.chain().focus().toggleOrderedList().run(); break;
        case 'bullet': editor.chain().focus().toggleBulletList().run(); break;
        case 'quote': editor.chain().focus().toggleBlockquote().run(); break;
        case 'code': editor.chain().focus().toggleCodeBlock().run(); break;
        case 'divider': editor.chain().focus().setHorizontalRule().run(); break;
        case 'media': if (media.length) openDialog('media'); else window.alert('Önce Medya bölümünden bir görsel yükleyin.'); break;
        case 'callout': openDialog('callout'); break;
        case 'cta': openDialog('cta'); break;
        case 'embed': openDialog('embed'); break;
        case 'table': editor.chain().focus().insertContent({ type: 'table', content: [{ type: 'tableRow', content: [{ type: 'tableHeader', content: [{ type: 'paragraph' }] }, { type: 'tableHeader', content: [{ type: 'paragraph' }] }] }, { type: 'tableRow', content: [{ type: 'tableCell', content: [{ type: 'paragraph' }] }, { type: 'tableCell', content: [{ type: 'paragraph' }] }] }] }).run(); break;
      }
      sync();
    });
  });
  sync();
  output.form?.addEventListener('submit', () => { sync(); dirty = false; });
  window.addEventListener('beforeunload', (event) => { if (dirty) event.preventDefault(); });
}
