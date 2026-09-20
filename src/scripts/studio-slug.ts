import { slugFromTitle } from '../lib/slug';

const form = document.querySelector<HTMLFormElement>('form:has(input[name="entity"][value="content"])');
const title = form?.querySelector<HTMLInputElement>('input[name="title"]');
const slug = form?.querySelector<HTMLInputElement>('input[name="slug"]');
if (title && slug) {
  let edited = Boolean(slug.value);
  slug.addEventListener('input', () => { edited = true; });
  title.addEventListener('input', () => { if (!edited) slug.value = slugFromTitle(title.value); });
}
