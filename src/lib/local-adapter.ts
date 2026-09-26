/** Development-only, in-memory Supabase-shaped adapter for browser and E2E tests. */
type Row = Record<string, any>;
type TableName = 'profiles' | 'permission_groups' | 'comments' | 'categories' | 'tags' | 'content_items' | 'content_categories' | 'content_tags' | 'contact_messages' | 'site_settings' | 'navigation' | 'media' | 'redirects' | 'audit_logs' | 'account_deletion_requests' | 'traffic_daily' | 'traffic_qualified_daily';
type Filter = (row: Row) => boolean;
const uid = () => crypto.randomUUID();
const initialCategories: Row[] = [
  { id: '00000000-0000-4000-8000-000000000001', slug: 'ai', name_tr: 'Yapay zekâ', name_en: 'AI', parent_id: null, active: true, sort_order: 0 },
  { id: '00000000-0000-4000-8000-000000000002', slug: 'gaming', name_tr: 'Oyunlar', name_en: 'Gaming', parent_id: null, active: true, sort_order: 1 },
  { id: '00000000-0000-4000-8000-000000000003', slug: 'fm', name_tr: 'Football Manager', name_en: 'Football Manager', parent_id: null, active: true, sort_order: 2 },
  { id: '00000000-0000-4000-8000-000000000004', slug: 'lab', name_tr: 'Lab', name_en: 'Lab', parent_id: null, active: true, sort_order: 3 },
  { id: '00000000-0000-4000-8000-000000000005', slug: 'fm26', name_tr: 'FM26', name_en: 'FM26', parent_id: '00000000-0000-4000-8000-000000000003', active: true, sort_order: 0 },
];
const users: Row[] = [
  { id: '00000000-0000-4000-8000-100000000001', email: 'admin@example.test', password: 'LocalTest123!', role: 'admin' },
  { id: '00000000-0000-4000-8000-100000000002', email: 'editor@example.test', password: 'LocalTest123!', role: 'editor' },
  { id: '00000000-0000-4000-8000-100000000003', email: 'member@example.test', password: 'LocalTest123!', role: 'member' },
];
const tables: Record<TableName, Row[]> = {
  profiles: users.map(({ id, role },index) => ({ id, role, display_name:role === 'admin' ? 'Yerel Yönetici' : null, bio:null, avatar_key:`avatar-${String(index+1).padStart(2,'0')}`, permission_group_id:`00000000-0000-4000-9000-00000000000${role === 'member' ? 1 : role === 'editor' ? 2 : 3}` })),
  permission_groups: [
    { id:'00000000-0000-4000-9000-000000000001',name:'Üye',description:'Yorum yapabilir.',base_role:'member',permissions:{comment:true},protected:true },
    { id:'00000000-0000-4000-9000-000000000002',name:'Editör',description:'İçerik yönetebilir.',base_role:'editor',permissions:{comment:true,content:true,taxonomy:true,media:true,messages:true},protected:true },
    { id:'00000000-0000-4000-9000-000000000003',name:'Yönetici',description:'Tam erişim.',base_role:'admin',permissions:{comment:true,content:true,taxonomy:true,media:true,messages:true,appearance:true,navigation:true,members:true,permissions:true,audit:true},protected:true },
  ], comments: [], categories: initialCategories,
  tags: [], content_items: [], content_categories: [], content_tags: [], contact_messages: [],
  site_settings: [], navigation: [], media: [], redirects: [], audit_logs: [], account_deletion_requests: [], traffic_daily: [], traffic_qualified_daily: [],
};
const mediaFiles = new Map<string, Uint8Array>();
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
  constructor(private table: TableName, private user: Row | null) {}
  select(columns = '*') { this.columns = columns; return this; }
  eq(field: string, value: any) { this.filters.push((row) => row[field] === value); return this; }
  in(field: string, values: any[]) { this.filters.push((row) => values.includes(row[field])); return this; }
  lte(field: string, value: any) { this.filters.push((row) => row[field] <= value); return this; }
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
  upsert(values: Row | Row[]) { this.action = 'upsert'; this.values = values; return this; }
  private visible(row: Row): boolean {
    if (this.table === 'content_items') return this.user?.role === 'admin' || this.user?.role === 'editor' || (['published','scheduled'].includes(row.status) && row.published_at && row.published_at <= new Date().toISOString());
    if (this.table === 'content_categories') return this.user?.role === 'admin' || this.user?.role === 'editor' || tables.content_items.some((item) => item.id === row.content_id && ['published','scheduled'].includes(item.status) && item.published_at <= new Date().toISOString());
    if (this.table === 'content_tags') return this.user?.role === 'admin' || this.user?.role === 'editor' || tables.content_items.some((item) => item.id === row.content_id && ['published','scheduled'].includes(item.status) && item.published_at <= new Date().toISOString());
    if (this.table === 'profiles') return Boolean(this.user && (this.user.id === row.id || this.user.role === 'admin'));
    if (this.table === 'permission_groups') return Boolean(this.user && ['editor','admin'].includes(this.user.role));
    if (this.table === 'comments') return row.status === 'published' || this.user?.role === 'admin' || this.user?.role === 'editor';
    if (this.table === 'account_deletion_requests') return Boolean(this.user && (this.user.id === row.user_id || this.user.role === 'admin'));
    if (this.table === 'media') return this.user?.role === 'admin' || this.user?.role === 'editor' || tables.content_items.some((item) => (item.cover_media_id === row.id || item.type === 'gallery' && Array.isArray(item.type_data?.gallery_media_ids) && item.type_data.gallery_media_ids.includes(row.id)) && ['published','scheduled'].includes(item.status) && item.published_at <= new Date().toISOString());
    if (this.table === 'contact_messages') return this.user?.role === 'admin' || this.user?.role === 'editor';
    if (this.table === 'audit_logs') return this.user?.role === 'admin';
    return true;
  }
  private canWrite(): boolean {
    if (!this.user) return false;
    if (this.table === 'profiles') return this.action === 'update';
    if (this.table === 'permission_groups') return this.user.role === 'admin';
    if (this.table === 'comments') return this.action === 'insert' || this.user.role === 'admin' || this.user.role === 'editor';
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
      selected = inputs.map((input) => {
        if (this.action === 'upsert') {
          const existing = rows.find((row) => row.id === input.id || (this.table === 'site_settings' && row.key === input.key) || (this.table === 'content_categories' && row.content_id === input.content_id && row.category_id === input.category_id));
          if (existing) return Object.assign(existing, input);
        }
        const row = { id: uid(), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), ...input };
        rows.push(row); return row;
      });
    } else if (this.action === 'update') selected.forEach((row) => Object.assign(row, this.values));
    else if (this.action === 'delete') {
      if (this.table === 'categories' && selected.some((row) => tables.content_categories.some((link) => link.category_id === row.id) || tables.categories.some((child) => child.parent_id === row.id))) return { data: null, error: { code: '23503', message: 'linked category' } };
      if (this.table === 'tags' && selected.some((row) => tables.content_tags.some((link) => link.tag_id === row.id))) return { data: null, error: { code: '23503', message: 'linked tag' } };
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

export function localSupabase(cookies: import('astro').AstroCookies) {
  const getUser = () => users.find((user) => user.id === cookies.get('pg_mock_user')?.value) ?? null;
  return {
    from: (name: string) => { if (!isTable(name)) throw new Error('Unknown table'); return new Query(name, getUser()); },
    rpc: async (name: string, args: Row) => {
      const actor = getUser();
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
        const contentId = existing?.id ?? uid();
        if (existing) Object.assign(existing,args.p_payload,{ updated_at:new Date().toISOString() });
        else tables.content_items.push({ id:contentId,author_id:actor.id,created_at:new Date().toISOString(),...args.p_payload });
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
        return { error: null };
      },
      signOut: async () => { cookies.delete('pg_mock_user', { path: '/' }); return { error: null }; },
      signUp: async ({ email, password }: { email: string; password: string }) => {
        if (!users.some((user) => user.email === email)) { const user = { id: uid(), email, password, role: 'member' }; users.push(user); tables.profiles.push({ id: user.id, role: 'member' }); }
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
export function localAuthAllowed(key: string, max: number) {
  const now = Date.now();
  const current = localAuthRate.get(key);
  const next = !current || now-current.start > 15*60*1000 ? { start: now, count: 1 } : { start: current.start, count: current.count+1 };
  localAuthRate.set(key,next);
  return next.count <= max;
}
export function localStoreMedia(path: string, bytes: Uint8Array) { mediaFiles.set(path, bytes); }
export function localReadMedia(path: string) { return mediaFiles.get(path) ?? null; }
export function localDeleteMedia(path: string) { mediaFiles.delete(path); }
