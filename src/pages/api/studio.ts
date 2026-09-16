import type { APIRoute } from 'astro';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { sameOrigin, errorResponse, redirectTo } from '../../lib/security';
import { parseDocument } from '../../lib/blocks';
import { safeExternalUrl } from '../../lib/site';

const category = z.object({ slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/), name_tr: z.string().min(1).max(100), name_en: z.string().min(1).max(100), parent_id: z.uuid().nullable() });
const content = z.object({ id: z.uuid().optional(), category_id: z.uuid().nullable(), cover_media_id: z.uuid().nullable(), title: z.string().min(1).max(200), slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*(\/[a-z0-9]+(-[a-z0-9]+)*)*$/), locale: z.enum(['tr','en']), type: z.enum(['article','project','fm_mod','gallery','lab_entry']), status: z.enum(['draft','scheduled','published','archived']), excerpt: z.string().max(500).nullable(), body: z.string().max(100000), seo_title: z.string().max(200).nullable(), seo_description: z.string().max(300).nullable() });
export const POST: APIRoute = async ({ request, cookies }) => {
  if (!sameOrigin(request)) return errorResponse('Invalid origin', 403);
  const db = supabase(cookies, request);
  if (!db) return errorResponse('Service unavailable', 503);
  const { data: { user } } = await db.auth.getUser();
  if (!user) return errorResponse('Unauthorized', 401);
  const { data: profile } = await db.from('profiles').select('role').eq('id', user.id).single();
  if (!['editor','admin'].includes(profile?.role ?? '')) return errorResponse('Forbidden', 403);
  const form = await request.formData();
  const entity = form.get('entity');
  const operation = String(form.get('operation') ?? 'create');
  if (entity === 'appearance') {
    if (profile?.role !== 'admin') return errorResponse('Forbidden', 403);
    const accent = z.enum(['violet','blue','amber']).safeParse(form.get('accent'));
    const radius = z.enum(['sharp','subtle']).safeParse(form.get('radius'));
    if (!accent.success || !radius.success) return errorResponse('Invalid appearance');
    const { error } = await db.from('site_settings').upsert({ key: 'appearance', value: { accent: accent.data, radius: radius.data }, updated_at: new Date().toISOString() });
    if (error) return errorResponse('Save failed', 400);
    return redirectTo(request, '/studio/?section=appearance');
  }
  if (entity === 'navigation') {
    if (profile?.role !== 'admin') return errorResponse('Forbidden', 403);
    const id = z.uuid().safeParse(form.get('id'));
    if (operation === 'delete') {
      if (!id.success) return errorResponse('Invalid id');
      const { error } = await db.from('navigation').delete().eq('id',id.data);
      if (error) return errorResponse('Delete failed',400);
      return redirectTo(request, '/studio/?section=navigation');
    }
    const input = z.object({ locale: z.enum(['tr','en']), label: z.string().trim().min(1).max(50), href: z.string().trim().max(500), sort_order: z.coerce.number().int().min(0).max(1000), active: z.boolean() }).safeParse({ locale: form.get('locale'), label: form.get('label'), href: form.get('href'), sort_order: form.get('sort_order'), active: form.get('active') === 'on' });
    if (!input.success || !(input.data.href.startsWith('/') && !input.data.href.startsWith('//') || safeExternalUrl(input.data.href))) return errorResponse('Invalid navigation link');
    const { error } = operation === 'update' && id.success ? await db.from('navigation').update(input.data).eq('id',id.data) : await db.from('navigation').insert(input.data);
    if (error) return errorResponse('Save failed',400);
    return redirectTo(request, '/studio/?section=navigation');
  }
  if (entity === 'category' || entity === 'tag') {
    const id = z.uuid().safeParse(form.get('id'));
    if (operation === 'delete') {
      if (!id.success) return errorResponse('Invalid id');
      const { error } = await db.from(entity === 'tag' ? 'tags' : 'categories').delete().eq('id', id.data);
      if (error) return errorResponse('Delete blocked: item may be in use', 409);
      return redirectTo(request, `/studio/?section=${entity === 'tag' ? 'tags' : 'categories'}`);
    }
    const parsed = category.safeParse({ slug: form.get('slug'), name_tr: form.get('name_tr'), name_en: form.get('name_en'), parent_id: form.get('parent_id') || null });
    if (!parsed.success) return errorResponse('Invalid data');
    const value = entity === 'tag' ? { slug: parsed.data.slug, name_tr: parsed.data.name_tr, name_en: parsed.data.name_en } : parsed.data;
    const result = operation === 'update' && id.success
      ? await db.from(entity === 'tag' ? 'tags' : 'categories').update(value).eq('id', id.data)
      : entity === 'tag' ? await db.from('tags').insert(value) : await db.from('categories').insert(parsed.data);
    const { error } = result;
    if (error) return errorResponse('Save failed', 400);
    return redirectTo(request, `/studio/?section=${entity === 'tag' ? 'tags' : 'categories'}`);
  }
  if (entity === 'message') {
    const id = z.uuid().safeParse(form.get('id'));
    const status = z.enum(['unread','read','archived','spam']).safeParse(form.get('status'));
    if (!id.success || !status.success) return errorResponse('Invalid data');
    const { error } = await db.from('contact_messages').update({ status: status.data }).eq('id', id.data);
    if (error) return errorResponse('Save failed', 400);
    return redirectTo(request, '/studio/?section=messages');
  }
  if (entity === 'content') {
    if (operation === 'delete') {
      const id = z.uuid().safeParse(form.get('id'));
      if (!id.success) return errorResponse('Invalid id');
      const { error } = await db.from('content_items').delete().eq('id',id.data);
      if (error) return errorResponse('Delete failed',400);
      return redirectTo(request, '/studio/?section=content');
    }
    const parsed = content.safeParse({ id: form.get('id') || undefined, category_id: form.get('category_id') || null, cover_media_id: form.get('cover_media_id') || null, title: form.get('title'), slug: form.get('slug'), locale: form.get('locale'), type: form.get('type'), status: form.get('status'), excerpt: form.get('excerpt') || null, body: form.get('body'), seo_title: form.get('seo_title') || null, seo_description: form.get('seo_description') || null });
    if (!parsed.success) return errorResponse('Invalid data');
    const { id, category_id, cover_media_id, ...values } = parsed.data;
    const body = parseDocument(values.body);
    if (!body) return errorResponse('Invalid content blocks', 400);
    if (cover_media_id) { const { data: cover } = await db.from('media').select('id').eq('id',cover_media_id).single(); if (!cover) return errorResponse('Invalid cover',400); }
    const payload = { ...values, body, cover_media_id, cover_url: cover_media_id ? `/api/media/${cover_media_id}/` : null, published_at: values.status === 'published' ? new Date().toISOString() : null, updated_at: new Date().toISOString() };
    const result = id ? await db.from('content_items').update(payload).eq('id', id).select('id').single() : await db.from('content_items').insert({ ...payload, author_id: user.id }).select('id').single();
    const { error } = result;
    if (error) return errorResponse('Save failed', 400);
    const contentId = result.data?.id;
    if (contentId && category_id) {
      const { error: linkError } = await db.from('content_categories').upsert({ content_id: contentId, category_id });
      if (linkError) return errorResponse('Category assignment failed', 400);
    }
    return redirectTo(request, '/studio/?section=content');
  }
  return errorResponse('Invalid entity');
};
