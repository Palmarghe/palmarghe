import { Editor, Node, mergeAttributes, type JSONContent } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { BubbleMenu } from '@tiptap/extension-bubble-menu';

const mediaImage = Node.create({
  name: 'mediaImage', group: 'block', atom: true,
  addAttributes: () => ({ media_id: { default: '' }, alt: { default: '' }, caption: { default: '' } }),
  parseHTML: () => [{ tag: 'img[data-media-id]' }],
  renderHTML: ({ HTMLAttributes }) => ['img', mergeAttributes(HTMLAttributes, { 'data-media-id': HTMLAttributes.media_id, src: `/api/media/${HTMLAttributes.media_id}/`, alt: HTMLAttributes.alt })],
});
const mediaGallery = Node.create({ name: 'mediaGallery', group: 'block', atom: true, addAttributes: () => ({ media_ids: { default: [] } }), parseHTML: () => [{ tag: 'section[data-media-gallery]' }], renderHTML: ({ HTMLAttributes }) => ['section', mergeAttributes(HTMLAttributes, { 'data-media-gallery': '', class: 'content-gallery' }), 'Galeri'] });
const callout = Node.create({ name: 'callout', group: 'block', content: 'block+', addAttributes: () => ({ tone: { default: 'note' }, title: { default: '' } }), parseHTML: () => [{ tag: 'aside[data-callout]' }], renderHTML: ({ HTMLAttributes }) => ['aside', mergeAttributes(HTMLAttributes, { 'data-callout': '', class: `content-callout content-callout--${HTMLAttributes.tone}` }), 0] });
const cta = Node.create({ name: 'cta', group: 'block', atom: true, addAttributes: () => ({ href: { default: '' }, label: { default: '' }, style: { default: 'primary' } }), parseHTML: () => [{ tag: 'a[data-content-cta]' }], renderHTML: ({ HTMLAttributes }) => ['a', mergeAttributes(HTMLAttributes, { 'data-content-cta': '', class: `button content-cta--${HTMLAttributes.style}`, href: HTMLAttributes.href }), HTMLAttributes.label] });
const embed = Node.create({ name: 'embed', group: 'block', atom: true, addAttributes: () => ({ src: { default: '' }, title: { default: '' } }), parseHTML: () => [{ tag: 'iframe[data-content-embed]' }], renderHTML: ({ HTMLAttributes }) => ['iframe', mergeAttributes(HTMLAttributes, { 'data-content-embed': '', src: HTMLAttributes.src, title: HTMLAttributes.title, sandbox: 'allow-scripts allow-same-origin allow-popups' })] });
const table = Node.create({ name: 'table', group: 'block', content: 'tableRow+', parseHTML: () => [{ tag: 'table' }], renderHTML: () => ['table', ['tbody', 0]] });
const tableRow = Node.create({ name: 'tableRow', content: '(tableHeader|tableCell)+', parseHTML: () => [{ tag: 'tr' }], renderHTML: () => ['tr', 0] });
const tableHeader = Node.create({ name: 'tableHeader', content: 'paragraph+', parseHTML: () => [{ tag: 'th' }], renderHTML: () => ['th', { scope: 'col' }, 0] });
const tableCell = Node.create({ name: 'tableCell', content: 'paragraph+', parseHTML: () => [{ tag: 'td' }], renderHTML: () => ['td', 0] });
type StudioMedia = { id: string; alt_tr?: string | null; alt_en?: string | null; path?: string };
type Command = [label: string, command: string, hint?: string];

const element = document.querySelector<HTMLElement>('#block-editor');
const output = document.querySelector<HTMLTextAreaElement>('#body-json');
if (element && output) {
  let initial: unknown = { type: 'doc', content: [{ type: 'paragraph' }] };
  try { initial = JSON.parse(element.dataset.content ?? ''); } catch { /* keep empty document */ }
  let media: StudioMedia[] = [];
  try { media = JSON.parse(element.dataset.media ?? '[]') as StudioMedia[]; } catch { /* keep empty media collection */ }
  let dirty = false;
  const statusBar = document.createElement('p');
  statusBar.className = 'editor-status'; statusBar.setAttribute('aria-live', 'polite');
  element.parentElement?.append(statusBar);
  const bubbleMenu = document.createElement('div');
  bubbleMenu.className = 'editor-bubble-menu'; bubbleMenu.setAttribute('aria-label', 'Seçili metin araçları');
  bubbleMenu.innerHTML = '<button type="button" data-editor="bold" aria-label="Kalın" title="Kalın">B</button><button type="button" data-editor="italic" aria-label="İtalik" title="İtalik">I</button><button type="button" data-editor="link" title="Bağlantı ekle">Bağlantı</button>';
  document.body.append(bubbleMenu);
  const editor = new Editor({
    element,
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] } }), Link.configure({ openOnClick: false, autolink: true, linkOnPaste: true, protocols: ['http', 'https', 'mailto'] }), BubbleMenu.configure({ element: bubbleMenu, shouldShow: ({ editor, state }) => editor.isEditable && !state.selection.empty }), mediaImage, mediaGallery, callout, cta, embed, table, tableRow, tableHeader, tableCell],
    editorProps: { attributes: { 'aria-label': 'İçerik blok editörü' } },
    content: initial as object,
    onUpdate: ({ editor }) => { output.value = JSON.stringify(editor.getJSON()); dirty = true; updateStatus('Kaydedilmedi'); updateToolbar(); },
    onSelectionUpdate: () => updateToolbar(),
  });
  const updateStatus = (state = 'Kaydedildi') => { const words = editor.getText().trim().split(/\s+/).filter(Boolean).length; const minutes = Math.max(1, Math.ceil(words / 200)); statusBar.textContent = `${state} · ${words} kelime · yaklaşık ${minutes} dk okuma`; document.querySelectorAll<HTMLElement>('[data-editor-save-state]').forEach((item) => { item.textContent = state; }); };
  const updateToolbar = () => {
    const active: Record<string, boolean> = { bold: editor.isActive('bold'), italic: editor.isActive('italic'), paragraph: editor.isActive('paragraph'), heading2: editor.isActive('heading', { level: 2 }), heading3: editor.isActive('heading', { level: 3 }), bullet: editor.isActive('bulletList'), ordered: editor.isActive('orderedList'), quote: editor.isActive('blockquote'), code: editor.isActive('codeBlock'), link: editor.isActive('link') };
    document.querySelectorAll<HTMLButtonElement>('.editor-toolbar [data-editor], .editor-bubble-menu [data-editor]').forEach((button) => { const isActive = Boolean(active[button.dataset.editor ?? '']); button.classList.toggle('is-active', isActive); button.setAttribute('aria-pressed', String(isActive)); });
    document.querySelectorAll<HTMLButtonElement>('[data-editor="undo"]').forEach((button) => { button.disabled = !editor.can().undo(); });
    document.querySelectorAll<HTMLButtonElement>('[data-editor="redo"]').forEach((button) => { button.disabled = !editor.can().redo(); });
  };
  const sync = () => { output.value = JSON.stringify(editor.getJSON()); updateToolbar(); };

  const blockControls = document.createElement('div');
  blockControls.className = 'editor-block-controls';
  blockControls.setAttribute('role', 'toolbar');
  blockControls.setAttribute('aria-label', 'Seçili blok işlemleri');
  blockControls.innerHTML = '<span>Blok</span><button type="button" data-block-action="insert-above" title="Üste boş blok ekle">Üste ekle</button><button type="button" data-block-action="move-up" title="Bloğu yukarı taşı">Yukarı</button><button type="button" data-block-action="move-down" title="Bloğu aşağı taşı">Aşağı</button><button type="button" data-block-action="duplicate" title="Bloğu çoğalt">Çoğalt</button><button type="button" data-block-action="insert-below" title="Alta boş blok ekle">Alta ekle</button><button type="button" data-block-action="delete" title="Bloğu sil">Sil</button>';
  element.parentElement?.insertBefore(blockControls, element);
  const selectedBlockIndex = () => Math.max(0, Math.min(editor.state.doc.childCount - 1, editor.state.selection.$from.index(0)));
  blockControls.addEventListener('click', (event) => {
    const action = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-block-action]')?.dataset.blockAction;
    if (!action) return;
    const documentJson = editor.getJSON();
    const blocks: JSONContent[] = [...(documentJson.content ?? [])];
    const index = Math.min(selectedBlockIndex(), Math.max(0, blocks.length - 1));
    const paragraph: JSONContent = { type: 'paragraph' };
    if (action === 'insert-above') blocks.splice(index, 0, paragraph);
    if (action === 'insert-below') blocks.splice(index + 1, 0, paragraph);
    if (action === 'duplicate' && blocks[index]) blocks.splice(index + 1, 0, structuredClone(blocks[index]));
    if (action === 'delete') blocks.splice(index, 1);
    if (action === 'move-up' && index > 0) [blocks[index - 1], blocks[index]] = [blocks[index], blocks[index - 1]];
    if (action === 'move-down' && index < blocks.length - 1) [blocks[index], blocks[index + 1]] = [blocks[index + 1], blocks[index]];
    editor.commands.setContent({ ...documentJson, content: blocks.length ? blocks : [paragraph] });
    editor.commands.focus('end');
    dirty = true;
    updateStatus('Kaydedilmedi');
    sync();
  });

  const slashMenu = document.createElement('div');
  slashMenu.className = 'editor-slash-menu'; slashMenu.setAttribute('role', 'menu'); slashMenu.setAttribute('aria-label', 'Blok ekle'); slashMenu.hidden = true;
  const commands: Command[] = [['Metin','paragraph','P'],['Başlık','heading2','H2'],['Alt başlık','heading3','H3'],['Görsel','media'],['Galeri','gallery'],['Not','callout'],['CTA','cta'],['YouTube / Vimeo','embed'],['Tablo','table'],['Alıntı','quote'],['Kod','code'],['Ayırıcı','divider']];
  const renderSlashMenu = (query = '') => { const term = query.toLocaleLowerCase('tr'); const matches = commands.filter(([label, command]) => `${label} ${command}`.toLocaleLowerCase('tr').includes(term)); slashMenu.innerHTML = `<p class="editor-slash-query">${query ? `“${query}” için bloklar` : 'Blok ara veya seç'}</p>${matches.length ? matches.map(([label, command, hint]) => `<button type="button" role="menuitem" data-editor="${command}"><span>${label}</span>${hint ? `<small>${hint}</small>` : ''}</button>`).join('') : '<p class="editor-slash-empty">Eşleşen blok yok.</p>'}`; };
  renderSlashMenu(); element.parentElement?.append(slashMenu);
  let slashPosition = 0;
  let slashFilter = '';
  const visibleSlashButtons = () => [...slashMenu.querySelectorAll<HTMLButtonElement>('button:not([hidden])')];
  const applySlashCommand = (command?: string) => { if (!command) return; slashMenu.hidden = true; const to = editor.state.selection.from; editor.chain().focus().deleteRange({ from: slashPosition - 1, to }).run(); document.querySelector<HTMLButtonElement>(`.editor-toolbar [data-editor="${command}"]`)?.click(); slashPosition = 0; slashFilter = ''; };
  element.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openDialog('link'); return; }
    if (!slashMenu.hidden) {
      if (event.key === 'Escape') { event.preventDefault(); slashMenu.hidden = true; slashPosition = 0; slashFilter = ''; return; }
      if (event.key === 'Enter') { event.preventDefault(); applySlashCommand(visibleSlashButtons()[0]?.dataset.editor); return; }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); const buttons = visibleSlashButtons(); const index = buttons.indexOf(document.activeElement as HTMLButtonElement); buttons[(index + (event.key === 'ArrowDown' ? 1 : buttons.length - 1)) % buttons.length]?.focus(); return; }
      if (event.key === 'Backspace') { slashFilter = slashFilter.slice(0, -1); window.setTimeout(() => renderSlashMenu(slashFilter)); return; }
      if (event.key.length === 1 && !event.metaKey && !event.ctrlKey) { if (/\s/.test(event.key)) { slashMenu.hidden = true; slashPosition = 0; slashFilter = ''; return; } slashFilter += event.key; window.setTimeout(() => renderSlashMenu(slashFilter)); return; }
    }
    if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey) { slashPosition = editor.state.selection.from + 1; slashFilter = ''; renderSlashMenu(); slashMenu.hidden = false; }
  });
  slashMenu.addEventListener('mousedown', (event) => event.preventDefault());
  slashMenu.addEventListener('click', (event) => applySlashCommand((event.target as HTMLElement).closest<HTMLButtonElement>('button')?.dataset.editor));

  const dialog = document.createElement('dialog');
  dialog.className = 'editor-block-dialog'; dialog.setAttribute('aria-labelledby', 'editor-dialog-title');
  dialog.innerHTML = '<form method="dialog"><header><strong id="editor-dialog-title"></strong><button value="cancel" aria-label="Kapat">×</button></header><div class="editor-dialog-fields"></div><footer><button value="cancel" type="button" data-dialog-cancel>Vazgeç</button><button value="confirm">Ekle</button></footer></form>';
  document.body.append(dialog);
  const fields = dialog.querySelector<HTMLElement>('.editor-dialog-fields')!;
  const dialogTitle = dialog.querySelector<HTMLElement>('#editor-dialog-title')!;
  const normalizeEmbed = (value: string) => { try { const url = new URL(value); if (url.hostname.includes('youtu')) { const id = url.searchParams.get('v') || url.pathname.split('/').filter(Boolean).pop(); return id ? `https://www.youtube-nocookie.com/embed/${id}` : value; } if (url.hostname === 'vimeo.com') { const id = url.pathname.split('/').filter(Boolean).pop(); return id ? `https://player.vimeo.com/video/${id}` : value; } return value; } catch { return value; } };
  const escapeText = (value: unknown) => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('\"', '&quot;').replaceAll("'", '&#39;');
  const openDialog = (kind: 'media' | 'gallery' | 'callout' | 'cta' | 'embed' | 'link' | 'table') => {
    const mediaPicker = media.map((item, index) => `<label data-media-label><input type="radio" name="media_id" value="${escapeText(item.id)}" ${index === 0 ? 'checked' : ''} required><img src="/api/media/${escapeText(item.id)}/" alt="" loading="lazy"><span>${escapeText(item.alt_tr || item.alt_en || item.path || 'Görsel')}</span></label>`).join('');
    dialogTitle.textContent = ({ media: 'Görsel ekle', gallery: 'Galeri ekle', callout: 'Not ekle', cta: 'Buton ekle', embed: 'Video ekle', link: 'Bağlantı ekle', table: 'Tablo ekle' })[kind];
    fields.innerHTML = kind === 'table' ? '<label>Satır<input name="rows" type="number" min="1" max="10" value="3" required></label><label>Sütun<input name="columns" type="number" min="1" max="8" value="2" required></label>' : kind === 'media' ? `<label>Medya ara<input type="search" name="media_search" placeholder="Görsellerde ara"></label><div class="editor-gallery-picker editor-media-picker">${mediaPicker}</div><a class="text-link" href="/studio/?section=media">Medya kütüphanesini aç →</a><label>Alternatif metin<input name="alt" maxlength="300" required></label><label>Açıklama<input name="caption" maxlength="300"></label>` : kind === 'gallery' ? `<p>Yayına alınan görseller ziyaretçiler için tıklanabilir bir galeride açılır.</p><div class="editor-gallery-picker">${media.map((item) => `<label><input type="checkbox" name="media_ids" value="${item.id}"><img src="/api/media/${item.id}/" alt="" loading="lazy"><span>${item.alt_tr || item.alt_en || item.path || 'Görsel'}</span></label>`).join('')}</div>` : kind === 'callout' ? '<label>Tür<select name="tone"><option value="note">Not</option><option value="info">Bilgi</option><option value="warning">Uyarı</option></select></label><label>Başlık<input name="title" maxlength="120" required value="Not"></label>' : kind === 'cta' ? '<label>Buton metni<input name="label" maxlength="120" required></label><label>Bağlantı<input name="href" placeholder="/iletisim/ veya https://" required></label><label>Stil<select name="style"><option value="primary">Vurgu</option><option value="secondary">İkincil</option><option value="text">Metin bağlantısı</option></select></label>' : kind === 'link' ? '<label>Bağlantı<input name="href" placeholder="/sayfa/ veya https://" required></label>' : '<label>YouTube veya Vimeo URL<input name="src" type="url" required placeholder="https://www.youtube.com/watch?v=..."></label><label>Başlık<input name="title" maxlength="160" required value="Video"></label>';
    const form = dialog.querySelector('form')!;
    form.onsubmit = (event) => { event.preventDefault(); const data = new FormData(form); if (kind === 'media') { const selected = media.find((item) => item.id === data.get('media_id')); if (!selected) return; editor.chain().focus().insertContent({ type: 'mediaImage', attrs: { media_id: selected.id, alt: String(data.get('alt') || selected.alt_tr || selected.alt_en || ''), caption: String(data.get('caption') || '') } }).run(); } if (kind === 'gallery') { const mediaIds = data.getAll('media_ids').map(String); if (!mediaIds.length) return; editor.chain().focus().insertContent({ type: 'mediaGallery', attrs: { media_ids: mediaIds } }).run(); } if (kind === 'callout') editor.chain().focus().insertContent({ type: 'callout', attrs: { tone: String(data.get('tone')), title: String(data.get('title')) }, content: [{ type: 'paragraph' }] }).run(); if (kind === 'cta') editor.chain().focus().insertContent({ type: 'cta', attrs: { label: String(data.get('label')), href: String(data.get('href')), style: String(data.get('style')) } }).run(); if (kind === 'link') { const href = String(data.get('href') ?? '').trim(); if (!(/^(https?:|mailto:)/i.test(href) || href.startsWith('/'))) return; editor.chain().focus().extendMarkRange('link').setLink({ href }).run(); } if (kind === 'embed') editor.chain().focus().insertContent({ type: 'embed', attrs: { src: normalizeEmbed(String(data.get('src'))), title: String(data.get('title')) } }).run(); if (kind === 'table') { const rows = Math.max(1, Math.min(10, Number(data.get('rows')) || 3)); const columns = Math.max(1, Math.min(8, Number(data.get('columns')) || 2)); editor.chain().focus().insertContent({ type: 'table', content: Array.from({ length: rows }, (_, row) => ({ type: 'tableRow', content: Array.from({ length: columns }, () => ({ type: row === 0 ? 'tableHeader' : 'tableCell', content: [{ type: 'paragraph' }] })) })) }).run(); } dialog.close(); sync(); };
    dialog.querySelector<HTMLInputElement>('input[name="media_search"]')?.addEventListener('input', (event) => { const term = ((event.currentTarget as HTMLInputElement).value || '').toLocaleLowerCase('tr'); dialog.querySelectorAll<HTMLElement>('[data-media-label]').forEach((label) => { label.hidden = !label.textContent?.toLocaleLowerCase('tr').includes(term); }); });
    dialog.querySelector<HTMLButtonElement>('[data-dialog-cancel]')!.onclick = () => dialog.close(); dialog.showModal(); dialog.querySelector<HTMLElement>('input,select')?.focus();
  };
  document.querySelectorAll<HTMLButtonElement>('[data-editor]').forEach((button) => button.addEventListener('click', () => {
    switch (button.dataset.editor) {
      case 'paragraph': editor.chain().focus().setParagraph().run(); break; case 'heading2': editor.chain().focus().toggleHeading({ level: 2 }).run(); break; case 'heading3': editor.chain().focus().toggleHeading({ level: 3 }).run(); break; case 'bold': editor.chain().focus().toggleBold().run(); break; case 'italic': editor.chain().focus().toggleItalic().run(); break; case 'link': openDialog('link'); break; case 'undo': editor.chain().focus().undo().run(); break; case 'redo': editor.chain().focus().redo().run(); break; case 'ordered': editor.chain().focus().toggleOrderedList().run(); break; case 'bullet': editor.chain().focus().toggleBulletList().run(); break; case 'quote': editor.chain().focus().toggleBlockquote().run(); break; case 'code': editor.chain().focus().toggleCodeBlock().run(); break; case 'divider': editor.chain().focus().setHorizontalRule().run(); break; case 'gallery': if (media.length) openDialog('gallery'); else window.alert('Önce Medya bölümünden görsel yükleyin.'); break; case 'media': if (media.length) openDialog('media'); else window.alert('Önce Medya bölümünden bir görsel yükleyin.'); break; case 'callout': openDialog('callout'); break; case 'cta': openDialog('cta'); break; case 'embed': openDialog('embed'); break; case 'table': openDialog('table'); break; case 'focus': element.closest('.content-editor-form')?.classList.toggle('editor-focus-mode'); break;
    } sync();
  }));
  document.querySelectorAll<HTMLButtonElement>('[data-publish-action]').forEach((button) => button.addEventListener('click', () => {
    const status = button.dataset.publishAction;
    const select = output.form?.querySelector<HTMLSelectElement>('select[name="status"]');
    if (!select || !status) return;
    if (status === 'scheduled' && !output.form?.querySelector<HTMLInputElement>('input[name="publish_at"]')?.value) { window.alert('Zamanlamak için sağdaki yayın tarihinde bir tarih ve saat seçin.'); return; }
    select.value = status;
    dirty = false; updateStatus(status === 'published' ? 'Yayınlanıyor…' : status === 'scheduled' ? 'Zamanlanıyor…' : 'Kaydediliyor…');
    output.form?.requestSubmit();
  }));
  sync(); updateStatus();
  output.form?.addEventListener('submit', () => { sync(); dirty = false; updateStatus('Kaydediliyor…'); });
  window.addEventListener('beforeunload', (event) => { if (dirty) event.preventDefault(); });
}

const studioEditorForm = document.querySelector<HTMLFormElement>('.content-editor-form');
if (studioEditorForm) {
  const simpleLabels: Record<string,string> = {
    'Etiketler (çoklu seçim)': 'Etiketler',
    'Kapak görseli': 'Kapak resmi',
    'Zamanlı yayın (UTC)': 'Yayın tarihi ve saati',
    'Arama motoruna açık': 'Google ve site aramasında göster',
    'SEO başlığı': 'Google başlığı',
    'SEO açıklaması': 'Google açıklaması',
    'Canonical URL': 'Yazının asıl adresi (varsa)',
    'Sosyal paylaşım görseli': 'Paylaşım resmi',
    'Uyumluluk': 'Çalıştığı sürüm',
    'Mod sürümü': 'Paket sürümü',
    'Değişiklikler': 'Bu sürümde neler değişti?',
    'Kurulum': 'Nasıl kurulur?',
    'İndirme URL': 'İndirme bağlantısı',
    'Kaynak URL': 'Kaynak bağlantısı',
    'Dosya boyutu bilgisi': 'Dosya boyutu',
    'Uyumluluk notu': 'Kullanım notu',
    'Proje URL': 'Proje bağlantısı',
    'Video/Prototip URL': 'Video veya prototip bağlantısı',
  };
  studioEditorForm.querySelectorAll<HTMLLabelElement>('label').forEach((label) => {
    const textNode = [...label.childNodes].find((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim());
    if (!textNode) return;
    const replacement = simpleLabels[textNode.textContent?.trim() ?? ''];
    if (replacement) textNode.textContent = `${replacement} `;
  });
  const advancedSummary = studioEditorForm.querySelector<HTMLElement>('.advanced-content summary');
  if (advancedSummary) advancedSummary.textContent = 'Google ve paylaşım ayarları';
}
