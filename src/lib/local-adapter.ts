/** Development-only, in-memory Supabase-shaped adapter for browser and E2E tests. */
type Row = Record<string, any>;
type TableName = 'profiles' | 'categories' | 'tags' | 'content_items' | 'content_categories' | 'contact_messages' | 'site_settings' | 'navigation' | 'media' | 'redirects' | 'audit_logs' | 'account_deletion_requests';
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
  profiles: users.map(({ id, role }) => ({ id, role })), categories: initialCategories,
  tags: [], content_items: [], content_categories: [], contact_messages: [],
  site_settings: [], navigation: [], media: [], redirects: [], audit_logs: [], account_deletion_requests: [],
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
    if (this.table === 'content_items') return this.user?.role === 'admin' || this.user?.role === 'editor' || (row.status === 'published' && row.published_at && row.published_at <= new Date().toISOString());
    if (this.table === 'content_categories') return this.user?.role === 'admin' || this.user?.role === 'editor' || tables.content_items.some((item) => item.id === row.content_id && item.status === 'published');
    if (this.table === 'profiles') return Boolean(this.user && (this.user.id === row.id || this.user.role === 'admin'));
    if (this.table === 'account_deletion_requests') return Boolean(this.user && (this.user.id === row.user_id || this.user.role === 'admin'));
    if (this.table === 'media') return this.user?.role === 'admin' || this.user?.role === 'editor' || tables.content_items.some((item) => item.cover_media_id === row.id && item.status === 'published');
    if (this.table === 'contact_messages') return this.user?.role === 'admin' || this.user?.role === 'editor';
    if (this.table === 'audit_logs') return this.user?.role === 'admin';
    return true;
  }
  private canWrite(): boolean {
    if (!this.user) return false;
    if (this.table === 'profiles') return this.action === 'update';
    if (this.table === 'account_deletion_requests') return this.action === 'insert' || this.user.role === 'admin';
    if (['site_settings','navigation','redirects'].includes(this.table)) return this.user.role === 'admin';
    return ['admin','editor'].includes(this.user.role);
  }
  private execute() {
    const rows = tables[this.table];
    if (this.action !== 'read' && !this.canWrite()) return { data: null, error: { code: '42501', message: 'permission denied' } };
    let selected = rows.filter((row) => this.visible(row) && this.filters.every((filter) => filter(row)));
    if (this.table === 'profiles' && this.action === 'update') {
      if ('role' in this.values || selected.some((row) => row.id !== this.user?.id)) return { data: null, error: { code: '42501', message: 'permission denied' } };
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
      if (this.table === 'tags' && selected.some((row) => tables.content_items.some((item) => item.tag_id === row.id))) return { data: null, error: { code: '23503', message: 'linked tag' } };
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
      updateUser: async ({ password }: { password: string }) => { const user = getUser(); if (!user) return { error: { message: 'Unauthorized' } }; user.password = password; return { error: null }; },
    },
  };
}

export function localInsertContact(data: Row) { tables.contact_messages.push({ id: uid(), status: 'unread', created_at: new Date().toISOString(), ...data }); }
const localContactRate = new Map<string, { start: number; count: number }>();
export function localContactAllowed(key: string) {
  const now = Date.now();
  const current = localContactRate.get(key);
  const next = !current || now-current.start > 15*60*1000 ? { start: now, count: 1 } : { start: current.start, count: current.count+1 };
  localContactRate.set(key,next);
  return next.count <= 5;
}
export function localStoreMedia(path: string, bytes: Uint8Array) { mediaFiles.set(path, bytes); }
export function localReadMedia(path: string) { return mediaFiles.get(path) ?? null; }
export function localDeleteMedia(path: string) { mediaFiles.delete(path); }
