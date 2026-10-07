/** Development-only, in-memory Supabase-shaped adapter for browser and E2E tests. */
import { mediaReferences } from './media-references';
import {detectImage} from './media';
type Row = Record<string, any>;
type TableName = 'profiles' | 'permission_groups' | 'comments' | 'categories' | 'tags' | 'content_items' | 'content_categories' | 'content_tags' | 'contact_messages' | 'site_settings' | 'navigation' | 'media' | 'redirects' | 'audit_logs' | 'account_deletion_requests' | 'traffic_daily' | 'traffic_qualified_daily' | 'content_likes' | 'content_bookmarks' | 'content_follows' | 'content_notifications' | 'editorial_collections' | 'editorial_collection_items' | 'newsletter_subscribers' | 'content_revisions' | 'media_renditions' | 'media_rendition_jobs';
type Filter = (row: Row) => boolean;
const uid = () => crypto.randomUUID();
const initialCategories: Row[] = [
  { id: '00000000-0000-4000-8000-000000000001', slug: 'ai', name_tr: 'Yapay zekâ', name_en: 'AI', parent_id: null, active: true, sort_order: 0 },
  { id: '00000000-0000-4000-8000-000000000002', slug: 'gaming', name_tr: 'Oyunlar', name_en: 'Gaming', parent_id: null, active: true, sort_order: 1 },
  { id: '00000000-0000-4000-8000-000000000003', slug: 'fm', name_tr: 'Football Manager', name_en: 'Football Manager', parent_id: null, active: true, sort_order: 2 },
  { id: '00000000-0000-4000-8000-000000000004', slug: 'lab', name_tr: 'Lab', name_en: 'Lab', parent_id: null, active: true, sort_order: 3 },
  { id: '00000000-0000-4000-8000-000000000005', slug: 'fm26', name_tr: 'FM26', name_en: 'FM26', parent_id: '00000000-0000-4000-8000-000000000003', active: true, sort_order: 0 },
];
const initialUsers: Row[] = [
  { id: '00000000-0000-4000-8000-100000000001', email: 'admin@example.test', password: 'LocalTest123!', role: 'admin' },
  { id: '00000000-0000-4000-8000-100000000002', email: 'editor@example.test', password: 'LocalTest123!', role: 'editor' },
  { id: '00000000-0000-4000-8000-100000000003', email: 'member@example.test', password: 'LocalTest123!', role: 'member' },
];
const initialTables: Record<TableName, Row[]> = {
  profiles: initialUsers.map(({ id, role },index) => ({ id, role, display_name:role === 'admin' ? 'Yerel Yönetici' : null, bio:null, avatar_key:`avatar-${String(index+1).padStart(2,'0')}`, permission_group_id:`00000000-0000-4000-9000-00000000000${role === 'member' ? 1 : role === 'editor' ? 2 : 3}` })),
  permission_groups: [
    { id:'00000000-0000-4000-9000-000000000001',name:'Üye',description:'Yorum yapabilir.',base_role:'member',permissions:{comment:true},protected:true },
    { id:'00000000-0000-4000-9000-000000000002',name:'Editör',description:'İçerik yönetebilir.',base_role:'editor',permissions:{comment:true,content:true,taxonomy:true,media:true,messages:true},protected:true },
    { id:'00000000-0000-4000-9000-000000000003',name:'Yönetici',description:'Tam erişim.',base_role:'admin',permissions:{comment:true,content:true,taxonomy:true,media:true,messages:true,appearance:true,navigation:true,members:true,permissions:true,audit:true},protected:true },
  ], comments: [], categories: initialCategories,
  tags: [], content_items: [], content_categories: [], content_tags: [], contact_messages: [],
  site_settings: [], navigation: [], media: [], redirects: [], audit_logs: [], account_deletion_requests: [], traffic_daily: [], traffic_qualified_daily: [], content_likes: [], content_bookmarks: [], content_follows: [], content_notifications: [], editorial_collections: [], editorial_collection_items: [], newsletter_subscribers: [], content_revisions: [], media_renditions: [], media_rendition_jobs: [],
};
type LocalStore={users:Row[];tables:Record<TableName,Row[]>;mediaFiles:Map<string,Uint8Array>;mediaCleanupTasks:Row[];commentDeliveries:Map<string,{content:string;body:string;id:string}>};
const fresh:LocalStore={users:initialUsers,tables:initialTables,mediaFiles:new Map(),mediaCleanupTasks:[],commentDeliveries:new Map()};
// Vite can reload an SSR dependency after warming a new route. Preserve one store per
// local QA server process so uploaded files and their rows never belong to different generations.
// Production does not register or read this development-only state.
const storeKey=Symbol.for('palmarghe.local-qa-store.v1');
const registry=globalThis as typeof globalThis & {[key:symbol]:LocalStore|undefined};
const store=import.meta.env.DEV&&import.meta.env.LOCAL_TEST_MODE==='true'?(registry[storeKey]??=fresh):fresh;
const {users,tables,mediaFiles,mediaCleanupTasks,commentDeliveries}=store;
const isTable = (name: string): name is TableName => name in tables;

class Query implements PromiseLike<{ data: any; error: { code: string; message: string } | null }> {
  private filters: Filter[] = [];
  private columns = '*';
  private action: 'read' | 'insert' | 'update' | 'delete' | 'upsert' = 'read';
  private values: Row | Row[] = {};
  private sortField: string | null = null;
  private ascending = true;
  private max = Infinity;
  private expectSingle = false;
  private ignoreDuplicates = false;
  constructor(private table: TableName, private user: Row | null) {}
  select(columns = '*') { this.columns = columns; return this; }
  eq(field: string, value: any) { this.filters.push((row) => row[field] === value); return this; }
  in(field: string, values: any[]) { this.filters.push((row) => values.includes(row[field])); return this; }
  lte(field: string, value: any) { this.filters.push((row) => row[field] <= value); return this; }
  gte(field: string, value: any) { this.filters.push((row) => row[field] >= value); return this; }
  is(field: string, value: any) { this.filters.push((row) => row[field] === value); return this; }
  or(filter: string) {
    const terms = filter.split(',').map((part) => { const match = part.match(/^([a-z_]+)\.ilike\.%(.*)%$/); return match ? { field: match[1], value: match[2].toLowerCase() } : null; }).filter(Boolean) as { field: string; value: string }[];
    this.filters.push((row) => terms.some((term) => String(row[term.field] ?? '').toLowerCase().includes(term.value)));
    return this;
  }
  order(field: string, options?: { ascending?: boolean }) { this.sortField = field; this.ascending = options?.ascending ?? true; return this; }
  limit(value: number) { this.max = value; return this; }
  single() { this.expectSingle = true; return this; }
  insert(values: Row | Row[]) { this.action = 'insert'; this.values = values; return this; }
  update(values: Row) { this.action = 'update'; this.values = values; return this; }
  delete() { this.action = 'delete'; return this; }
  upsert(values: Row | Row[],options?:{ignoreDuplicates?:boolean}) { this.action = 'upsert'; this.values = values; this.ignoreDuplicates=options?.ignoreDuplicates===true;return this; }
  private contentPermission(): boolean {
    const profile=this.user&&tables.profiles.find(entry=>entry.id===this.user!.id);
    return profile?.role==='admin'||Boolean(profile&&['admin','editor'].includes(profile.role)&&tables.permission_groups.find(group=>group.id===profile.permission_group_id)?.permissions?.content);
  }
  private visible(row: Row): boolean {
    if (this.table === 'content_items') return this.user?.role === 'admin' || this.user?.role === 'editor' || (['published','scheduled'].includes(row.status) && row.published_at && row.published_at <= new Date().toISOString());
    if (this.table === 'content_categories') return this.user?.role === 'admin' || this.user?.role === 'editor' || tables.content_items.some((item) => item.id === row.content_id && ['published','scheduled'].includes(item.status) && item.published_at <= new Date().toISOString());
    if (this.table === 'content_tags') return this.user?.role === 'admin' || this.user?.role === 'editor' || tables.content_items.some((item) => item.id === row.content_id && ['published','scheduled'].includes(item.status) && item.published_at <= new Date().toISOString());
    if (this.table === 'profiles') return Boolean(this.user && (this.user.id === row.id || this.user.role === 'admin'));
    if (this.table === 'permission_groups') return Boolean(this.user && ['editor','admin'].includes(this.user.role));
    if (this.table === 'comments') return row.status === 'published' || this.user?.role === 'admin' || this.user?.role === 'editor';
    if (this.table === 'content_likes' || this.table === 'content_bookmarks' || this.table === 'content_follows' || this.table === 'content_notifications') return Boolean(this.user && row.user_id === this.user.id);
    if (this.table === 'editorial_collections') return row.published || this.contentPermission();
    if (this.table === 'editorial_collection_items') return this.contentPermission() || tables.editorial_collections.some(collection=>collection.id===row.collection_id&&collection.published&&tables.content_items.some(item=>item.id===row.content_id&&['published','scheduled'].includes(item.status)&&item.published_at&&item.published_at<=new Date().toISOString()));
    if (this.table === 'account_deletion_requests') return Boolean(this.user && (this.user.id === row.user_id || this.user.role === 'admin'));
    if(this.table==='media_rendition_jobs')return false;
    if(this.table==='media_renditions')return new Query('media',this.user).select('id').eq('id',row.media_id).execute().data?.length>0;
    if (this.table === 'media') return this.user?.role === 'admin' || this.user?.role === 'editor' || tables.content_items.some((item) => mediaReferences(item.body,item.type==='gallery'?item.type_data:null,item.cover_media_id,item.og_media_id).has(row.id) && ['published','scheduled'].includes(item.status) && item.published_at <= new Date().toISOString());
    if (this.table === 'contact_messages') return this.user?.role === 'admin' || this.user?.role === 'editor';
    if (this.table === 'audit_logs') return this.user?.role === 'admin';
    return true;
  }
  private canWrite(): boolean {
    if (!this.user) return false;
    if(this.table==='media_renditions'||this.table==='media_rendition_jobs')return false;
    if (this.table === 'profiles') return this.action === 'update';
    if (this.table === 'permission_groups') return this.user.role === 'admin';
    if (this.table === 'comments') return this.action === 'insert' || this.user.role === 'admin' || this.user.role === 'editor';
    if (this.table === 'content_likes' || this.table === 'content_bookmarks' || this.table === 'content_follows') return true;
    if (this.table === 'content_notifications') return this.action === 'update';
    if (this.table === 'editorial_collections' || this.table === 'editorial_collection_items') return this.contentPermission();
    if (this.table === 'account_deletion_requests') return this.action === 'insert' || this.user.role === 'admin';
    if (['site_settings','navigation','redirects'].includes(this.table)) return this.user.role === 'admin';
    return ['admin','editor'].includes(this.user.role);
  }
  private execute() {
    const rows = tables[this.table];
    if (this.action !== 'read' && !this.canWrite()) return { data: null, error: { code: '42501', message: 'permission denied' } };
    let selected = rows.filter((row) => this.visible(row) && this.filters.every((filter) => filter(row)));
    if (this.table === 'profiles' && this.action === 'update') {
      if ('role' in this.values || this.user?.role !== 'admin' && selected.some((row) => row.id !== this.user?.id)) return { data: null, error: { code: '42501', message: 'permission denied' } };
    }
    if (this.table === 'account_deletion_requests' && this.action === 'insert' && (this.values as Row).user_id !== this.user?.id) return { data: null, error: { code: '42501', message: 'permission denied' } };
    if (this.action === 'insert' || this.action === 'upsert') {
      const inputs = Array.isArray(this.values) ? this.values : [this.values];
      if (['content_likes','content_bookmarks','content_follows'].includes(this.table) && inputs.some(input=>input.user_id!==this.user?.id)) return {data:null,error:{code:'42501',message:'permission denied'}};
      selected = inputs.map((input) => {
        if (this.action === 'upsert') {
          const existing = rows.find((row) => (input.id!==undefined && row.id === input.id) || (this.table === 'site_settings' && row.key === input.key) || (this.table === 'content_categories' && row.content_id === input.content_id && row.category_id === input.category_id) || (['content_likes','content_bookmarks'].includes(this.table) && row.user_id===input.user_id && row.content_id===input.content_id) || (this.table==='content_follows' && row.user_id===input.user_id && row.target_kind===input.target_kind && row.target_id===input.target_id));
          if (existing) return this.ignoreDuplicates ? existing : Object.assign(existing, input);
        }
        const row = { id: uid(), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), ...input };
        rows.push(row); return row;
      });
    } else if (this.action === 'update') selected.forEach((row) => {
      const changed=this.table==='content_items'&&['title','excerpt','body','type_data','status'].some(key=>key in this.values&&JSON.stringify(row[key])!==JSON.stringify((this.values as Row)[key]));
      Object.assign(row,this.values);
      if(changed){
        const revision=tables.content_revisions.filter(entry=>entry.content_id===row.id).reduce((maximum,entry)=>Math.max(maximum,Number(entry.revision)||0),0)+1;
        tables.content_revisions.push({id:uid(),content_id:row.id,revision,title:row.title,excerpt:row.excerpt??null,body:row.body??null,type_data:row.type_data??null,status:row.status,changed_by:this.user?.id,created_at:new Date().toISOString()});
      }
    });
    else if (this.action === 'delete') {
      if (this.table === 'media' && selected.some((row) => localMediaReferenced(row.id))) return { data:null,error:{code:'23503',message:'media in use'} };
      if (this.table === 'media') for (const row of selected){
        const derived_paths=[...new Set([...tables.media_renditions.filter(r=>r.media_id===row.id).map(r=>r.path),...tables.media_rendition_jobs.filter(j=>j.media_id===row.id).flatMap(j=>j.descriptors.map((d:Row)=>d.path))])];
        mediaCleanupTasks.push({id:uid(),media_id:row.id,path:row.path,derived_paths,created_at:new Date().toISOString()});
        for(const name of ['media_renditions','media_rendition_jobs'] as const)for(let i=tables[name].length-1;i>=0;i--)if(tables[name][i].media_id===row.id)tables[name].splice(i,1);
      }
      if (this.table === 'content_items') for (const row of selected) {
        for (let index=tables.content_revisions.length-1;index>=0;index--) if(tables.content_revisions[index].content_id===row.id) tables.content_revisions.splice(index,1);
      }
      if (this.table === 'categories' && selected.some((row) => tables.content_categories.some((link) => link.category_id === row.id) || tables.categories.some((child) => child.parent_id === row.id))) return { data: null, error: { code: '23503', message: 'linked category' } };
      if (this.table === 'tags' && selected.some((row) => tables.content_tags.some((link) => link.tag_id === row.id))) return { data: null, error: { code: '23503', message: 'linked tag' } };
      if(this.table==='editorial_collections') for(let i=tables.editorial_collection_items.length-1;i>=0;i--) if(selected.some(row=>row.id===tables.editorial_collection_items[i].collection_id)) tables.editorial_collection_items.splice(i,1);
      selected.forEach((row) => rows.splice(rows.indexOf(row), 1));
    }
    if (this.sortField) { const field = this.sortField; selected.sort((a,b) => String(a[field] ?? '').localeCompare(String(b[field] ?? '')) * (this.ascending ? 1 : -1)); }
    selected = selected.slice(0, this.max);
    const projection = this.columns === '*' ? selected : selected.map((row) => Object.fromEntries(this.columns.split(',').map((field) => field.trim()).map((field) => [field, row[field]])));
    return { data: this.expectSingle ? projection[0] ?? null : projection, error: this.expectSingle && !projection.length ? { code: 'PGRST116', message: 'no rows' } : null };
  }
  then<TResult1 = { data: any; error: { code: string; message: string } | null }, TResult2 = never>(onfulfilled?: ((value: { data: any; error: { code: string; message: string } | null }) => TResult1 | PromiseLike<TResult1>) | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null): Promise<TResult1 | TResult2> {
    return Promise.resolve(this.execute()).then(onfulfilled, onrejected);
  }
}

function localMediaReferenced(id: string): boolean {
  return tables.content_items.some(item => mediaReferences(item.body,item.type==='gallery'?item.type_data:null,item.cover_media_id,item.og_media_id).has(id))
    || tables.content_revisions.some(item => mediaReferences(item.body,item.type_data).has(id));
}
export function localSupabase(cookies: import('astro').AstroCookies) {
  const getUser = () => users.find((user) => user.id === cookies.get('pg_mock_user')?.value) ?? null;
  return {
    from: (name: string) => { if (!isTable(name)) throw new Error('Unknown table'); return new Query(name, getUser()); },
    rpc: async (name: string, args: Row) => {
      const actor = getUser();
      if(['prepare_media_renditions','complete_media_renditions'].includes(name)){
        const profile=actor&&tables.profiles.find(p=>p.id===actor.id),group=profile&&tables.permission_groups.find(g=>g.id===profile.permission_group_id);
        if(!profile||!(profile.role==='admin'||profile.role==='editor'&&group?.permissions?.media===true))return {data:null,error:{code:'42501',message:'media permission required'}};
        if(name==='prepare_media_renditions'){
          const source=tables.media.find(m=>m.id===args.p_media_id),values=args.p_descriptors;
          if(!source||source.path!==args.p_source_path||!source.width||!source.height||!source.bytes||!Array.isArray(values)||values.length<1||values.length>3||new Set(values.map(d=>d?.width)).size!==values.length||values.some(d=>!d||![320,640,960].includes(d.width)||d.width>=source.width||d.height!==Math.max(1,Math.round(source.height*d.width/source.width))||!Number.isSafeInteger(d.bytes)||d.bytes<1||d.bytes>2097152||d.bytes>=source.bytes))return {data:null,error:{code:'22023',message:'invalid renditions'}};
          if(tables.media_rendition_jobs.filter(j=>j.media_id===source.id&&!j.completed).length>=16)return {data:null,error:{code:'54000',message:'pending rendition limit'}};
          const id=uid(),descriptors=values.map(d=>({...d,path:`renditions/${source.id}/${id}/${d.width}.webp`}));
          tables.media_rendition_jobs.push({id,media_id:source.id,source_path:source.path,descriptors,created_by:actor!.id,completed:false});
          return {data:{id,descriptors},error:null};
        }
        const job=tables.media_rendition_jobs.find(j=>j.id===args.p_job_id&&j.created_by===actor!.id);
        if(!job||!tables.media.some(m=>m.id===job.media_id&&m.path===job.source_path))return {data:false,error:null};
        if(job.completed)return {data:true,error:null};
        if(job.descriptors.some((d:Row)=>{const bytes=mediaFiles.get(d.path);return !bytes||bytes.length!==d.bytes||detectImage(bytes)!=='image/webp';}))return {data:false,error:null};
        for(const d of job.descriptors)if(!tables.media_renditions.some(r=>r.media_id===job.media_id&&r.width===d.width))tables.media_renditions.push({...d,media_id:job.media_id});
        job.completed=true;return {data:true,error:null};
      }
      if(name==='save_editorial_collection'){
        const profile=actor&&tables.profiles.find(entry=>entry.id===actor.id),group=profile&&tables.permission_groups.find(entry=>entry.id===profile.permission_group_id);
        if(!profile||(profile.role!=='admin'&&(!['admin','editor'].includes(profile.role)||group?.permissions?.content!==true)))return {data:null,error:{code:'42501',message:'content permission required'}};
        const value=args.p_value,ids=args.p_content_ids??[],existing=args.p_collection_id?tables.editorial_collections.find(entry=>entry.id===args.p_collection_id):null;
        if(!value||typeof value.published!=='boolean'||typeof value.title!=='string'||value.title.trim().length<2||value.title.trim().length>120||!['tr','en'].includes(value.locale)||typeof value.slug!=='string'||!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(value.slug)||typeof value.description!=='string'||value.description.length>500||!Number.isInteger(value.sort_order)||value.sort_order<0||value.sort_order>1000||!Array.isArray(ids)||ids.length>50||new Set(ids).size!==ids.length||ids.some((id:string)=>!tables.content_items.some(item=>item.id===id&&item.status==='published'&&item.published_at&&item.published_at<=new Date().toISOString()))||args.p_collection_id&&!existing)return {data:null,error:{code:'22023',message:'invalid collection'}};
        if(tables.editorial_collections.some(entry=>entry.id!==existing?.id&&entry.slug===value.slug&&entry.locale===value.locale))return {data:null,error:{code:'23505',message:'duplicate collection'}};
        const now=new Date().toISOString(),saved={...(existing??{id:uid(),created_by:actor!.id,created_at:now}),...value,updated_at:now};
        if(existing)Object.assign(existing,saved);else tables.editorial_collections.push(saved);
        for(let i=tables.editorial_collection_items.length-1;i>=0;i--)if(tables.editorial_collection_items[i].collection_id===saved.id)tables.editorial_collection_items.splice(i,1);
        ids.forEach((content_id:string,sort_order:number)=>tables.editorial_collection_items.push({collection_id:saved.id,content_id,sort_order}));
        return {data:saved,error:null};
      }
      if (name === 'content_like_count') {
        const item = tables.content_items.find(row => row.id === args.p_content_id && ['published','scheduled'].includes(row.status) && row.published_at <= new Date().toISOString());
        return { data: item ? tables.content_likes.filter(row => row.content_id === item.id).length : 0, error: null };
      }
      if (['media_has_references','pending_media_cleanup','complete_media_cleanup'].includes(name)) {
        const profile = actor && tables.profiles.find(entry=>entry.id===actor.id);
        const group = profile && tables.permission_groups.find(entry=>entry.id===profile.permission_group_id);
        if (!actor || (actor.role!=='admin' && group?.permissions?.media!==true)) return {data:null,error:{code:'42501',message:'media permission required'}};
        if (name === 'pending_media_cleanup') return {data:mediaCleanupTasks.filter(task=>!args.p_media_id || task.media_id===args.p_media_id).slice(0,20),error:null};
        if (name === 'complete_media_cleanup') {
          const index=mediaCleanupTasks.findIndex(task=>task.id===args.p_task_id);
          const task=mediaCleanupTasks[index];
          if (!task || mediaFiles.has(task.path) || (task.derived_paths??[]).some((path:string)=>mediaFiles.has(path)) || tables.media.some(row=>row.path===task.path)) return {data:false,error:null};
          mediaCleanupTasks.splice(index,1); return {data:true,error:null};
        }
        return {data:localMediaReferenced(args.p_media_id),error:null};
      }
      if (name === 'subscribe_newsletter') {
        const email = String(args.p_email ?? '').trim().toLowerCase();
        const locale = String(args.p_locale ?? '');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || !['tr','en'].includes(locale) || args.p_source !== 'site') return { data:null,error:{message:'invalid newsletter request'} };
        const existing = tables.newsletter_subscribers.find((entry) => String(entry.email).toLowerCase() === email);
        if (existing) Object.assign(existing,{locale,source:'site',status:'active',consented_at:new Date().toISOString()});
        else tables.newsletter_subscribers.push({id:uid(),email,locale,source:'site',status:'active',consented_at:new Date().toISOString()});
        return { data:null,error:null };
      }
      if (name === 'dispatch_due_author_follow_notifications') {
        let count = 0;
        for (const item of tables.content_items.filter((entry) => entry.status === 'scheduled' && entry.published_at && entry.published_at <= new Date().toISOString() && entry.author_id)) {
          for (const follow of tables.content_follows.filter((entry) => entry.target_kind === 'author' && entry.target_id === item.author_id && entry.user_id !== item.author_id)) {
            const href = `/${item.slug}/`;
            const exists = tables.content_notifications.some((entry) => entry.user_id === follow.user_id && entry.kind === 'followed_content' && entry.href === href);
            if (!exists) { tables.content_notifications.push({ id:tables.content_notifications.length+1,user_id:follow.user_id,kind:'followed_content',title:item.title,href,created_at:new Date().toISOString(),read_at:null }); count += 1; }
          }
        }
        return { data: count, error: null };
      }
if (name === 'get_public_author') {
        const profile=tables.profiles.find((entry)=>entry.public_profile && entry.author_slug===args.p_slug);
        return { data:profile?[{id:profile.id,author_slug:profile.author_slug,display_name:profile.display_name||'Palmarghe',bio:profile.bio??null,avatar_key:profile.avatar_key??null}]:[],error:null };
      }
      if (name === 'get_public_author_content') {
        const profile=tables.profiles.find((entry)=>entry.public_profile && entry.author_slug===args.p_slug);
        const data=profile?tables.content_items.filter((entry)=>entry.author_id===profile.id&&['published','scheduled'].includes(entry.status)&&entry.published_at&&entry.published_at<=new Date().toISOString()).slice(0,Math.min(Number(args.p_limit)||20,50)):[];
        return {data,error:null};
      }
      if(name==='deliver_comment'){
        if(!actor)return {data:null,error:{message:'authentication required'}};
        const body=String(args.p_body??'').trim(),content=tables.content_items.find(row=>row.id===args.p_content_id&&row.status==='published'&&row.published_at&&row.published_at<=new Date().toISOString());
        if(!content||body.length<2||body.length>2000||!args.p_request_id)return {data:null,error:{message:'invalid comment'}};
        const key=actor.id+':'+args.p_request_id,existing=commentDeliveries.get(key);
        if(existing){if(existing.content!==args.p_content_id||existing.body!==body)return {data:null,error:{message:'delivery key reused'}};const present=tables.comments.some(row=>row.id===existing.id);return {data:{id:present?existing.id:null,created:false,removed:!present},error:null};}
        const id=uid(),now=new Date().toISOString();tables.comments.push({id,content_id:args.p_content_id,user_id:actor.id,body,status:'published',created_at:now,updated_at:now});commentDeliveries.set(key,{content:args.p_content_id,body,id});return {data:{id,created:true,removed:false},error:null};
      }
      if (name === 'get_public_comments') {
        const data = tables.comments.filter((comment) => comment.content_id === args.p_content_id && comment.status === 'published').map((comment) => {
          const author = tables.profiles.find((profile) => profile.id === comment.user_id);
          return { id:comment.id,body:comment.body,created_at:comment.created_at,display_name:author?.display_name || 'Palmarghe üyesi',avatar_key:author?.avatar_key ?? null };
        });
        return { data, error:null };
      }
      if (name === 'assign_permission_group') {
        if (actor?.role !== 'admin' || actor.id === args.p_user_id) return { data:null,error:{ message:'permission denied' } };
        const group = tables.permission_groups.find((entry) => entry.id === args.p_group_id);
        const target = users.find((entry) => entry.id === args.p_user_id);
        const targetProfile = tables.profiles.find((entry) => entry.id === args.p_user_id);
        if (!group || !target || !targetProfile) return { data:null,error:{ message:'invalid group' } };
        target.role=group.base_role; targetProfile.role=group.base_role; targetProfile.permission_group_id=group.id;
        return { data:null,error:null };
      }
      if (name === 'set_content_translation_pair') {
        if (!actor || !['admin','editor'].includes(actor.role)) return { data: null, error: { message: 'permission denied' } };
        const source = tables.content_items.find((item) => item.id === args.p_source_id);
        const target = tables.content_items.find((item) => item.id === args.p_target_id);
        if (!source || !target || source.id === target.id || source.locale === target.locale || source.translation_group && target.translation_group && source.translation_group !== target.translation_group) return { data: null, error: { message: 'invalid translation pair' } };
        const group = source.translation_group ?? target.translation_group ?? uid();
        if (tables.content_items.some((item) => item.translation_group === group && item.id !== source.id && item.id !== target.id)) return { data: null, error: { message: 'group already in use' } };
        source.translation_group = group;
        target.translation_group = group;
        return { data: group, error: null };
      }
      if (name === 'unlink_content_translation') {
        if (!actor || !['admin','editor'].includes(actor.role)) return { data: null, error: { message: 'permission denied' } };
        const source = tables.content_items.find((item) => item.id === args.p_content_id);
        if (!source) return { data: null, error: { message: 'content not found' } };
        if (source.translation_group) for (const item of tables.content_items) if (item.translation_group === source.translation_group) item.translation_group = null;
        return { data: null, error: null };
      }
      if (name === 'save_content_with_relations') {
        if (!actor || !['admin','editor'].includes(actor.role)) return { data: null, error: { message: 'permission denied' } };
        const existing = args.p_content_id ? tables.content_items.find((item) => item.id === args.p_content_id) : null;
        if (args.p_content_id && !existing) return { data: null, error: { message: 'content not found' } };
        const category = args.p_category_id ? tables.categories.find((item) => item.id === args.p_category_id) : null;
        if (args.p_category_id && !category) return { data: null, error: { message: 'unknown category' } };
        const tagIds: string[] = args.p_tag_ids ?? [];
        if (tagIds.length > 20 || new Set(tagIds).size !== tagIds.length || tagIds.some((id) => !tables.tags.some((tag) => tag.id === id))) return { data: null, error: { message: 'unknown or duplicate tag' } };
        const refs=mediaReferences(args.p_payload.body,args.p_payload.type==='gallery'?args.p_payload.type_data:null,args.p_payload.cover_media_id,args.p_payload.og_media_id);
        if([...refs].some(id=>!tables.media.some(row=>row.id===id))) return {data:null,error:{code:'23503',message:'unknown media'}};
        const contentId = existing?.id ?? uid();
        const wasPublished = existing?.status === 'published';
        if (existing) {
          const changed = ['title','excerpt','body','type_data','status'].some((key) => JSON.stringify(existing[key]) !== JSON.stringify(args.p_payload[key]));
          Object.assign(existing,args.p_payload,{ updated_at:new Date().toISOString() });
          if (changed) {
            const revision = tables.content_revisions.filter((entry) => entry.content_id === contentId).reduce((maximum,entry) => Math.max(maximum, Number(entry.revision) || 0), 0) + 1;
            tables.content_revisions.push({ id:uid(), content_id:contentId, revision, title:existing.title, excerpt:existing.excerpt ?? null, body:existing.body ?? null, type_data:existing.type_data ?? null, status:existing.status, changed_by:actor.id, created_at:new Date().toISOString() });
          }
        } else {
          const created = { id:contentId,author_id:actor.id,created_at:new Date().toISOString(),...args.p_payload };
          tables.content_items.push(created);
          tables.content_revisions.push({ id:uid(), content_id:contentId, revision:1, title:created.title, excerpt:created.excerpt ?? null, body:created.body ?? null, type_data:created.type_data ?? null, status:created.status, changed_by:actor.id, created_at:new Date().toISOString() });
        }
        const publishedItem=tables.content_items.find((item)=>item.id===contentId);
        if (publishedItem?.status==='published' && publishedItem.author_id && (!existing || !wasPublished)) for (const follow of tables.content_follows.filter((entry)=>entry.target_kind==='author'&&entry.target_id===publishedItem.author_id&&entry.user_id!==publishedItem.author_id)) tables.content_notifications.push({id:tables.content_notifications.length+1,user_id:follow.user_id,kind:'followed_content',title:publishedItem.title,href:`/${publishedItem.slug}/`,created_at:new Date().toISOString(),read_at:null});
        tables.content_categories = tables.content_categories.filter((item) => item.content_id !== contentId);
        tables.content_tags = tables.content_tags.filter((item) => item.content_id !== contentId);
        if (category) tables.content_categories.push({ content_id:contentId,category_id:category.id });
        for (const tag_id of tagIds) tables.content_tags.push({ content_id:contentId,tag_id });
        return { data: contentId, error: null };
      }
      if (name === 'record_traffic_visit') {
        const day = new Date().toISOString().slice(0,10); const path = String(args.p_path ?? '');
        if (!/^\/[a-z0-9/-]*$/.test(path)) return { data:null,error:{message:'invalid path'} };
        const row = tables.traffic_daily.find((entry)=>entry.day===day&&entry.path===path);
        if (row) row.pageviews += 1; else tables.traffic_daily.push({day,path,pageviews:1,visitors:1});
        return { data:null,error:null };
      }
      if (name === 'record_qualified_traffic_visit') {
        const day = new Date().toISOString().slice(0,10); const path = String(args.p_path ?? ''); const source = String(args.p_source ?? '');
        if (!/^\/[a-z0-9/-]*$/.test(path) || !['organic_search','referral','direct'].includes(source)) return { data:null,error:{message:'invalid traffic event'} };
        const row = tables.traffic_qualified_daily.find((entry)=>entry.day===day&&entry.path===path&&entry.source===source);
        if (row) row.pageviews += 1; else tables.traffic_qualified_daily.push({day,path,source,pageviews:1,visitors:1});
        return { data:null,error:null };
      }
      if (name !== 'set_member_role' || actor?.role !== 'admin' || actor.id === args.p_user_id || !['member','editor','admin'].includes(args.p_role)) return { data: null, error: { message: 'permission denied' } };
      const target = users.find((entry) => entry.id === args.p_user_id);
      if (!target || (target.role === 'admin' && args.p_role !== 'admin' && users.filter((entry) => entry.role === 'admin').length <= 1)) return { data: null, error: { message: 'invalid role change' } };
      target.role = args.p_role;
      const profile = tables.profiles.find((entry) => entry.id === target.id);
      if (profile) profile.role = args.p_role;
      tables.audit_logs.push({ actor_id: actor.id, action: 'ROLE_CHANGE', entity: 'profiles', entity_id: target.id, created_at: new Date().toISOString() });
      return { data: null, error: null };
    },
    auth: {
      getUser: async () => ({ data: { user: getUser() }, error: null }),
      signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
        const user = users.find((entry) => entry.email === email && entry.password === password);
        if (!user) return { error: { message: 'Invalid credentials' } };
        cookies.set('pg_mock_user', user.id, { path: '/', httpOnly: true, sameSite: 'lax' });
        return { data: { user }, error: null };
      },
      signOut: async () => { cookies.delete('pg_mock_user', { path: '/' }); return { error: null }; },
      signUp: async ({ email, password, options }: { email: string; password: string; options?: { data?: Row } }) => {
        if (!users.some((user) => user.email === email)) { const user = { id: uid(), email, password, role: 'member', user_metadata: options?.data ?? {} }; users.push(user); tables.profiles.push({ id: user.id, role: 'member' }); }
        return { error: null };
      },
      resetPasswordForEmail: async () => ({ error: null }),
      exchangeCodeForSession: async () => ({ error: { message: 'Local mode does not send email' } }),
      updateUser: async ({ password, data }: { password?: string; data?: Row }) => { const user = getUser(); if (!user) return { error: { message: 'Unauthorized' } }; if (password) user.password = password; if (data) user.user_metadata = { ...(user.user_metadata ?? {}), ...data }; return { error: null }; },
    },
  };
}

export function localInsertContact(data: Row) { tables.contact_messages.push({ id: uid(), status: 'unread', created_at: new Date().toISOString(), ...data }); }
export function localAdminCreateUser(email:string,password:string,displayName:string){
  if(users.some((user)=>user.email===email)) return null;
  const user={id:uid(),email,password,role:'member'}; users.push(user);
  tables.profiles.push({id:user.id,role:'member',display_name:displayName,bio:null,avatar_key:'avatar-01',permission_group_id:'00000000-0000-4000-9000-000000000001',created_at:new Date().toISOString(),updated_at:new Date().toISOString()});
  return user;
}
export function localAdminDeleteUser(id:string){
  const index=users.findIndex((user)=>user.id===id); if(index<0||users[index].role==='admin') return false;
  for(const key of commentDeliveries.keys())if(key.startsWith(id+':'))commentDeliveries.delete(key);
  users.splice(index,1); for(const table of ['profiles','comments'] as const) tables[table]=tables[table].filter((row)=>row.id!==id&&row.user_id!==id); return true;
}
const localContactRate = new Map<string, { start: number; count: number }>();
export function localContactAllowed(key: string) {
  const now = Date.now();
  const current = localContactRate.get(key);
  const next = !current || now-current.start > 15*60*1000 ? { start: now, count: 1 } : { start: current.start, count: current.count+1 };
  localContactRate.set(key,next);
  return next.count <= 5;
}
const localAuthRate = new Map<string, { start: number; count: number }>();
export function localAuthAllowed(key: string, max: number, windowSeconds = 900) {
  const now = Date.now();
  const current = localAuthRate.get(key);
  const next = !current || now-current.start > windowSeconds*1000 ? { start: now, count: 1 } : { start: current.start, count: current.count+1 };
  localAuthRate.set(key,next);
  return next.count <= max;
}
export function localStoreMedia(path: string, bytes: Uint8Array) { mediaFiles.set(path, bytes); }
export function localReadMedia(path: string) { return mediaFiles.get(path) ?? null; }
export function localDeleteMedia(path: string) { mediaFiles.delete(path); }
