import type { APIRoute } from 'astro';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { sameOrigin, errorResponse, redirectTo } from '../../lib/security';
import { parseDocument } from '../../lib/blocks';
import { safeExternalUrl } from '../../lib/site';
import { createClient } from '@supabase/supabase-js';
import { runtimeSecret } from '../../lib/runtime-secrets';
import { localAdminCreateUser, localAdminDeleteUser } from '../../lib/local-adapter';
import { localTestRequest } from '../../lib/supabase';

const category = z.object({ slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/), name_tr: z.string().min(1).max(100), name_en: z.string().min(1).max(100), description_tr: z.string().max(500).nullable(), description_en: z.string().max(500).nullable(), seo: z.object({ title_tr: z.string().max(120), title_en: z.string().max(120), description_tr: z.string().max(300), description_en: z.string().max(300) }), parent_id: z.uuid().nullable(), active: z.boolean(), sort_order: z.number().int().min(0).max(1000) });
const content = z.object({ id: z.uuid().optional(), category_id: z.uuid().nullable(), cover_media_id: z.uuid().nullable(), og_media_id: z.uuid().nullable(), canonical_override: z.url().max(500).nullable(), translation_group: z.uuid().nullable(), featured: z.boolean(), indexable: z.boolean(), title: z.string().min(1).max(200), slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*(\/[a-z0-9]+(-[a-z0-9]+)*)*$/), locale: z.enum(['tr','en']), type: z.enum(['article','project','fm_mod','gallery','lab_entry']), status: z.enum(['draft','scheduled','published','archived']), excerpt: z.string().max(500).nullable(), body: z.string().max(100000), seo_title: z.string().max(200).nullable(), seo_description: z.string().max(300).nullable() });
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
  if (entity === 'comment') {
    if (!['admin','editor'].includes(profile?.role ?? '')) return errorResponse('Forbidden',403);
    const id=z.uuid().safeParse(form.get('id'));
    if(!id.success) return errorResponse('Invalid comment',400);
    if(operation==='delete') {
      const {error}=await db.from('comments').delete().eq('id',id.data);
      if(error) return errorResponse('Delete failed',400);
    } else {
      const status=z.enum(['published','hidden']).safeParse(form.get('status'));
      if(!status.success) return errorResponse('Invalid status',400);
      const {error}=await db.from('comments').update({status:status.data,updated_at:new Date().toISOString()}).eq('id',id.data);
      if(error) return errorResponse('Update failed',400);
    }
    return redirectTo(request,'/studio/?section=comments');
  }
  if (entity === 'permission_group') {
    if (profile?.role !== 'admin') return errorResponse('Forbidden',403);
    const id=z.uuid().safeParse(form.get('id'));
    if(operation==='delete'){
      if(!id.success) return errorResponse('Invalid group',400);
      const {data:group}=await db.from('permission_groups').select('protected').eq('id',id.data).single();
      if(group?.protected) return errorResponse('System groups cannot be deleted',409);
      const {data:used}=await db.from('profiles').select('id').eq('permission_group_id',id.data).limit(1);
      if(used?.length) return errorResponse('Group is in use',409);
      const {error}=await db.from('permission_groups').delete().eq('id',id.data); if(error) return errorResponse('Delete failed',400);
      return redirectTo(request,'/studio/?section=access');
    }
    const permissionNames=['comment','content','taxonomy','media','messages','appearance','navigation','members','permissions','audit'];
    const parsed=z.object({name:z.string().trim().min(2).max(80),description:z.string().trim().max(300),base_role:z.enum(['member','editor','admin'])}).safeParse({name:form.get('name'),description:form.get('description')??'',base_role:form.get('base_role')});
    if(!parsed.success) return errorResponse('Invalid group',400);
    const value={...parsed.data,permissions:Object.fromEntries(permissionNames.map((name)=>[name,form.get(`permission_${name}`)==='on'])),updated_at:new Date().toISOString()};
    const result=operation==='update'&&id.success?await db.from('permission_groups').update(value).eq('id',id.data):await db.from('permission_groups').insert(value);
    if(result.error) return errorResponse('Save failed',400);
    return redirectTo(request,'/studio/?section=access');
  }
  if (entity === 'member_group') {
    if(profile?.role!=='admin') return errorResponse('Forbidden',403);
    const id=z.uuid().safeParse(form.get('id')); const group=z.uuid().safeParse(form.get('group_id'));
    if(!id.success||!group.success) return errorResponse('Invalid assignment',400);
    const {error}=await db.rpc('assign_permission_group',{p_user_id:id.data,p_group_id:group.data}); if(error) return errorResponse('Assignment failed',400);
    return redirectTo(request,'/studio/?section=members');
  }
  if (entity === 'member_account') {
    if(profile?.role!=='admin') return errorResponse('Forbidden',403);
    const serviceKey=runtimeSecret('SUPABASE_SERVICE_ROLE_KEY'); const serviceUrl=import.meta.env.PUBLIC_SUPABASE_URL;
    if(operation==='create'){
      const parsed=z.object({email:z.email().max(254),password:z.string().min(10).max(128),display_name:z.string().trim().min(2).max(100),group_id:z.uuid()}).safeParse({email:form.get('email'),password:form.get('password'),display_name:form.get('display_name'),group_id:form.get('group_id')});
      if(!parsed.success) return errorResponse('Invalid member',400);
      let createdId:string|undefined;
      if(localTestRequest(request)) createdId=localAdminCreateUser(parsed.data.email,parsed.data.password,parsed.data.display_name)?.id;
      else if(serviceKey&&serviceUrl){ const service=createClient(serviceUrl,serviceKey,{auth:{persistSession:false}}); const {data,error}=await service.auth.admin.createUser({email:parsed.data.email,password:parsed.data.password,email_confirm:true}); if(error) return errorResponse('Create failed',400); createdId=data.user?.id; }
      if(!createdId) return errorResponse('Account service unavailable',503);
      const update=await db.from('profiles').update({display_name:parsed.data.display_name}).eq('id',createdId); if(update.error) return errorResponse('Profile setup failed',400);
      const assigned=await db.rpc('assign_permission_group',{p_user_id:createdId,p_group_id:parsed.data.group_id}); if(assigned.error) return errorResponse('Group setup failed',400);
      return redirectTo(request,'/studio/?section=members');
    }
    if(operation==='delete'){
      const id=z.uuid().safeParse(form.get('id')); if(!id.success||id.data===user.id) return errorResponse('Invalid deletion',400);
      const {data:target}=await db.from('profiles').select('role').eq('id',id.data).single();
      if(target?.role==='admin'){ const {data:admins}=await db.from('profiles').select('id').eq('role','admin'); if((admins?.length??0)<=1) return errorResponse('Last admin cannot be deleted',409); }
      let deleted=false; if(localTestRequest(request)) deleted=localAdminDeleteUser(id.data); else if(serviceKey&&serviceUrl){ const service=createClient(serviceUrl,serviceKey,{auth:{persistSession:false}}); deleted=!(await service.auth.admin.deleteUser(id.data)).error; }
      if(!deleted) return errorResponse('Delete failed',400);
      return redirectTo(request,'/studio/?section=members');
    }
  }
  if (entity === 'translation') {
    const source = z.uuid().safeParse(form.get('id'));
    if (!source.success) return errorResponse('Invalid content',400);
    if (operation === 'unlink') {
      const { error } = await db.rpc('unlink_content_translation',{ p_content_id: source.data });
      if (error) return errorResponse('Translation unlink failed',400);
    } else if (operation === 'pair') {
      const target = z.uuid().safeParse(form.get('target_id'));
      if (!target.success) return errorResponse('Choose a translation',400);
      const { error } = await db.rpc('set_content_translation_pair',{ p_source_id: source.data, p_target_id: target.data });
      if (error) return errorResponse('Translation pairing failed',400);
    } else return errorResponse('Invalid operation',400);
    return redirectTo(request, `/studio/?section=content&edit=${source.data}`);
  }
  if (entity === 'member_role') {
    if (profile?.role !== 'admin') return errorResponse('Forbidden',403);
    const id = z.uuid().safeParse(form.get('id'));
    const role = z.enum(['member','editor','admin']).safeParse(form.get('role'));
    if (!id.success || !role.success || id.data === user.id) return errorResponse('Invalid role change',400);
    const { error } = await db.rpc('set_member_role',{ p_user_id: id.data, p_role: role.data });
    if (error) return errorResponse('Role change failed',400);
    return redirectTo(request,'/studio/?section=users');
  }
  if (entity === 'deletion_request') {
    if (profile?.role !== 'admin') return errorResponse('Forbidden',403);
    const id = z.uuid().safeParse(form.get('id'));
    const status = z.enum(['pending','processing','completed','rejected']).safeParse(form.get('status'));
    if (!id.success || !status.success) return errorResponse('Invalid request',400);
    const { error } = await db.from('account_deletion_requests').update({ status: status.data }).eq('id',id.data);
    if (error) return errorResponse('Update failed',400);
    return redirectTo(request,'/studio/?section=users');
  }
  if (entity === 'appearance') {
    if (profile?.role !== 'admin') return errorResponse('Forbidden', 403);
    const accent = z.enum(['violet','blue','amber']).safeParse(form.get('accent'));
    const radius = z.enum(['sharp','subtle']).safeParse(form.get('radius'));
    if (!accent.success || !radius.success) return errorResponse('Invalid appearance');
    const { error } = await db.from('site_settings').upsert({ key: 'appearance', value: { accent: accent.data, radius: radius.data }, updated_at: new Date().toISOString() });
    if (error) return errorResponse('Save failed', 400);
    return redirectTo(request, '/studio/?section=appearance');
  }
  if (entity === 'homepage') {
    if (profile?.role !== 'admin') return errorResponse('Forbidden',403);
    const names = ['now','featured','categories','latest','fm_spotlight','lab_notes','visual_reel','archive_cta'];
    const order = Object.fromEntries(names.map((name) => [name, name === 'visual_reel' && !form.has(`${name}_order`) ? 7 : Number(form.get(`${name}_order`))]));
    if (!form.has('visual_reel_order')) order.archive_cta = 8;
    if (new Set(Object.values(order)).size !== names.length || Object.values(order).some((value) => !Array.from({ length: names.length }, (_, index) => index + 1).includes(value))) return errorResponse('Invalid section order');
    const visible = Object.fromEntries(names.map((name) => [name, name === 'visual_reel' && !form.has(`${name}_visible`) ? true : form.get(`${name}_visible`) === 'on']));
    const { error } = await db.from('site_settings').upsert({ key: 'homepage', value: { order, visible }, updated_at: new Date().toISOString() });
    if (error) return errorResponse('Save failed',400);
    return redirectTo(request,'/studio/?section=homepage');
  }
  if (entity === 'social') {
    if (profile?.role !== 'admin') return errorResponse('Forbidden',403);
    const links = Object.fromEntries(['github','youtube','instagram','x'].map((name) => [name, String(form.get(name) ?? '').trim()]));
    if (Object.values(links).some((url) => url && !safeExternalUrl(url))) return errorResponse('Invalid social URL',400);
    const { error } = await db.from('site_settings').upsert({ key: 'social', value: links, updated_at: new Date().toISOString() });
    if (error) return errorResponse('Save failed',400);
    return redirectTo(request,'/studio/?section=settings');
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
  if (entity === 'redirect') {
    if (profile?.role !== 'admin') return errorResponse('Forbidden',403);
    const id = z.uuid().safeParse(form.get('id'));
    const route = z.string().regex(/^\/(?:[a-z0-9-]+\/)*$/).max(500);
    const parsed = z.object({ source_path: route, target_path: route }).safeParse({ source_path: form.get('source_path'), target_path: form.get('target_path') });
    if (!parsed.success || parsed.data.source_path === parsed.data.target_path) return errorResponse('Invalid redirect');
    const { data: all } = await db.from('redirects').select('source_path,target_path');
    const rows: { source_path: string; target_path: string }[] = all ?? [];
    const map = new Map<string,string>(rows.filter((row) => row.source_path !== parsed.data.source_path).map((row) => [row.source_path,row.target_path]));
    let cursor = parsed.data.target_path;
    for (let hops=0;hops<20;hops++) {
      if (cursor === parsed.data.source_path) return errorResponse('Redirect loop',400);
      const next = map.get(cursor);
      if (!next) break;
      cursor = next;
      if (hops === 19) return errorResponse('Redirect chain too long',400);
    }
    const { error } = operation === 'update' && id.success ? await db.from('redirects').update(parsed.data).eq('id',id.data) : await db.from('redirects').insert({ ...parsed.data, status_code: 301 });
    if (error) return errorResponse('Save failed',400);
    return redirectTo(request, '/studio/?section=redirects');
  }
  if (entity === 'category' || entity === 'tag') {
    const id = z.uuid().safeParse(form.get('id'));
    if (operation === 'delete') {
      if (!id.success) return errorResponse('Invalid id');
      const { error } = await db.from(entity === 'tag' ? 'tags' : 'categories').delete().eq('id', id.data);
      if (error) return errorResponse('Delete blocked: item may be in use', 409);
      return redirectTo(request, `/studio/?section=${entity === 'tag' ? 'tags' : 'categories'}`);
    }
    const parsed = category.safeParse({ slug: form.get('slug'), name_tr: form.get('name_tr'), name_en: form.get('name_en'), description_tr: form.get('description_tr') || null, description_en: form.get('description_en') || null, seo: { title_tr: String(form.get('seo_title_tr') ?? ''), title_en: String(form.get('seo_title_en') ?? ''), description_tr: String(form.get('seo_description_tr') ?? ''), description_en: String(form.get('seo_description_en') ?? '') }, parent_id: form.get('parent_id') || null, active: entity === 'tag' || form.get('active') === 'on', sort_order: Number(form.get('sort_order') ?? 0) });
    if (!parsed.success) return errorResponse('Invalid data');
    if (entity === 'category' && id.success && parsed.data.parent_id) {
      let parent: string | null = parsed.data.parent_id;
      for (let depth=0;parent && depth<20;depth++) {
        if (parent === id.data || depth === 19) return errorResponse('Category cycle',400);
        const result: { data: { parent_id: string | null } | null } = await db.from('categories').select('parent_id').eq('id',parent).single();
        parent = result.data?.parent_id ?? null;
      }
    }
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
    const parsed = content.safeParse({ id: form.get('id') || undefined, category_id: form.get('category_id') || null, cover_media_id: form.get('cover_media_id') || null, og_media_id: form.get('og_media_id') || null, canonical_override: form.get('canonical_override') || null, translation_group: form.get('translation_group') || null, featured: form.get('featured') === 'on', indexable: !form.has('indexable') || form.getAll('indexable').includes('on'), title: form.get('title'), slug: form.get('slug'), locale: form.get('locale'), type: form.get('type'), status: form.get('status'), excerpt: form.get('excerpt') || null, body: form.get('body'), seo_title: form.get('seo_title') || null, seo_description: form.get('seo_description') || null });
    if (!parsed.success) return errorResponse('Invalid data');
    const tagIds = form.getAll('tag_ids').map(String);
    if (tagIds.some((tagId) => !z.uuid().safeParse(tagId).success) || tagIds.length > 20) return errorResponse('Invalid tags');
    if (tagIds.length) {
      const { data: known } = await db.from('tags').select('id').in('id',[...new Set(tagIds)]);
      if (known?.length !== new Set(tagIds).size) return errorResponse('Unknown tag',400);
    }
    const { id, category_id, cover_media_id, og_media_id, ...values } = parsed.data;
    const body = parseDocument(values.body);
    if (!body) return errorResponse('Invalid content blocks', 400);
    const field = (key: string, max = 5000) => String(form.get(key) ?? '').trim().slice(0,max);
    const urlField = (key: string) => { const value = field(key,500); return value && safeExternalUrl(value) ? value : null; };
    const unsafeUrl = ['download_url','source_url','project_url','experiment_url'].some((key) => field(key) && !urlField(key));
    if (unsafeUrl) return errorResponse('Invalid external URL',400);
    const galleryMediaIds = [...new Set(form.getAll('gallery_media_ids').map(String))].sort((a,b) => {
      const orderA = Number(form.get(`gallery_order_${a}`) ?? 0);
      const orderB = Number(form.get(`gallery_order_${b}`) ?? 0);
      return (Number.isFinite(orderA) ? orderA : 0) - (Number.isFinite(orderB) ? orderB : 0);
    });
    if (galleryMediaIds.length > 24 || galleryMediaIds.some((mediaId) => !z.uuid().safeParse(mediaId).success)) return errorResponse('Invalid gallery media',400);
    if (values.type === 'gallery' && galleryMediaIds.length) {
      const { data: known } = await db.from('media').select('id').in('id',galleryMediaIds);
      if (known?.length !== galleryMediaIds.length) return errorResponse('Unknown gallery media',400);
    }
    const type_data = values.type === 'fm_mod' ? { compatibility: field('compatibility',100), mod_version: field('mod_version',50), changelog: field('changelog'), installation: field('installation'), download_url: urlField('download_url'), source_url: urlField('source_url'), size_label: field('size_label',50), compatibility_notes: field('compatibility_notes') }
      : values.type === 'project' ? { project_url: urlField('project_url') }
      : values.type === 'lab_entry' ? { experiment_note: field('experiment_note'), experiment_url: urlField('experiment_url') }
      : values.type === 'gallery' ? { gallery_media_ids: galleryMediaIds }
      : {};
    if (cover_media_id || og_media_id) { const mediaIds = [cover_media_id, og_media_id].filter((mediaId): mediaId is string => Boolean(mediaId)); const { data: knownMedia } = await db.from('media').select('id').in('id', mediaIds); if (knownMedia?.length !== new Set(mediaIds).size) return errorResponse('Invalid media',400); }
    const publishInput = String(form.get('publish_at') ?? '');
    let scheduledAt: string | null = null;
    if (values.status === 'scheduled') {
      if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(publishInput)) return errorResponse('Schedule time required',400);
      const date = new Date(`${publishInput}:00Z`);
      if (!Number.isFinite(date.getTime()) || date.getTime() <= Date.now()) return errorResponse('Schedule must be in the future',400);
      scheduledAt = date.toISOString();
    }
    const previous = id ? (await db.from('content_items').select('published_at').eq('id',id).single()).data : null;
    const published_at = values.status === 'published' ? previous?.published_at ?? new Date().toISOString() : values.status === 'scheduled' ? scheduledAt : values.status === 'archived' ? previous?.published_at ?? null : null;
    if (values.canonical_override && !safeExternalUrl(values.canonical_override)) return errorResponse('Invalid canonical URL',400);
    const payload = { ...values, body, type_data, cover_media_id, og_media_id, cover_url: cover_media_id ? `/api/media/${cover_media_id}/` : null, published_at, updated_at: new Date().toISOString() };
    const { error } = await db.rpc('save_content_with_relations', {
      p_content_id: id ?? null, p_payload: payload, p_category_id: category_id, p_tag_ids: [...new Set(tagIds)],
    });
    if (error) return errorResponse(error.code === '23505' ? 'Bu dilde bu URL yolu zaten kullanılıyor.' : 'İçerik kaydedilemedi.', 400);
    return redirectTo(request, '/studio/?section=content');
  }
  return errorResponse('Invalid entity');
};
