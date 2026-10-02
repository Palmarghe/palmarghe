/** Local/test counterpart of migration 036's structural JSON reference parser. */
export function mediaReferences(body: unknown, data: unknown, cover?: unknown, og?: unknown): Set<string> {
  const ids = new Set<string>();
  const add = (value: unknown) => {
    if (typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) ids.add(value.toLowerCase());
  };
  add(cover); add(og);
  const queue: unknown[] = [body];
  const seen = new Set<object>();
  while (queue.length) {
    const node = queue.pop();
    if (!node || typeof node !== 'object' || seen.has(node)) continue;
    seen.add(node);
    if (Array.isArray(node)) { queue.push(...node); continue; }
    const block = node as { type?: unknown; attrs?: { media_id?: unknown; media_ids?: unknown }; content?: unknown };
    if (block.type === 'mediaImage') add(block.attrs?.media_id);
    if (block.type === 'mediaGallery' && Array.isArray(block.attrs?.media_ids)) block.attrs.media_ids.forEach(add);
    if (Array.isArray(block.content)) queue.push(...block.content);
  }
  const gallery = (data as { gallery_media_ids?: unknown } | null)?.gallery_media_ids;
  if (Array.isArray(gallery)) gallery.forEach(add);
  return ids;
}
