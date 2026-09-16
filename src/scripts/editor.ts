import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';

const element = document.querySelector<HTMLElement>('#block-editor');
const output = document.querySelector<HTMLTextAreaElement>('#body-json');
if (element && output) {
  let initial: unknown = { type: 'doc', content: [{ type: 'paragraph' }] };
  try { initial = JSON.parse(element.dataset.content ?? ''); } catch { /* keep empty document */ }
  let dirty = false;
  const editor = new Editor({
    element,
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] } })],
    editorProps: { attributes: { 'aria-label': 'İçerik blok editörü' } },
    content: initial as object,
    onUpdate: ({ editor }) => { output.value = JSON.stringify(editor.getJSON()); dirty = true; },
  });
  output.value = JSON.stringify(editor.getJSON());
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
      }
      output.value = JSON.stringify(editor.getJSON());
    });
  });
  output.form?.addEventListener('submit', () => { output.value = JSON.stringify(editor.getJSON()); dirty = false; });
  window.addEventListener('beforeunload', (event) => { if (dirty) event.preventDefault(); });
}
