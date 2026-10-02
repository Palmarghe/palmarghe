import { beforeEach, describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({
  user: { id: 'controlled-member', email: 'qa@example.invalid', user_metadata: {} } as object | null,
  result: { data: { id: 'controlled-member' }, error: null } as { data: unknown; error: { code: string } | null },
  update: vi.fn(), eq: vi.fn(), select: vi.fn(), single: vi.fn(), from: vi.fn(), metadata: vi.fn(),
}));
vi.mock('./supabase', () => ({ supabase: () => {
  const query = { update: state.update, eq: state.eq, select: state.select, single: state.single };
  state.update.mockReturnValue(query); state.eq.mockReturnValue(query); state.select.mockReturnValue(query);
  state.single.mockImplementation(async () => state.result); state.from.mockReturnValue(query);
  return { from: state.from, auth: { getUser: async () => ({ data: { user: state.user } }), updateUser: state.metadata } };
} }));
import { GET, POST } from '../pages/api/profile';

function context(method: string, fields: Record<string, string> = {}, origin = 'https://palmarghe.com') {
  return { cookies: {}, request: new Request('https://palmarghe.com/api/profile/', {
    method, headers: { origin }, ...(method === 'POST' ? { body: new URLSearchParams({
      display_name: 'Controlled member', bio: 'Preserved bio', avatar_key: 'avatar-05', author_slug: '', ...fields,
    }) } : {}),
  }) } as Parameters<typeof POST>[0];
}

describe('profile API canonical write and failure boundaries', () => {
  beforeEach(() => {
    vi.clearAllMocks(); state.user = { id: 'controlled-member', email: 'qa@example.invalid', user_metadata: {} };
    state.result = { data: { id: 'controlled-member' }, error: null };
  });
  it('saves all profile fields once, normalizes empty slug to null and does not mutate Auth metadata', async () => {
    expect((await POST(context('POST'))).status).toBe(200);
    expect(state.update).toHaveBeenCalledExactlyOnceWith({ display_name: 'Controlled member', bio: 'Preserved bio', avatar_key: 'avatar-05', author_slug: null, public_profile: false });
    expect(state.eq).toHaveBeenCalledWith('id', 'controlled-member');
    expect(state.metadata).not.toHaveBeenCalled();
  });
  it.each([['23505', 409, 'author_slug_taken'], ['42501', 403, 'profile_forbidden'], ['08006', 503, 'profile_unavailable']])('reports %s without falling back to a partial save', async (code, status, error) => {
    state.result = { data: null, error: { code } };
    const response = await POST(context('POST', { author_slug: 'qa-profile', public_profile: 'on' }));
    expect(response.status).toBe(status); expect(await response.json()).toMatchObject({ error });
    expect(state.update).toHaveBeenCalledOnce(); expect(state.metadata).not.toHaveBeenCalled();
  });
  it('rejects public profiles without an address before any database write', async () => {
    const response = await POST(context('POST', { public_profile: 'on' }));
    expect(response.status).toBe(400); expect(await response.json()).toMatchObject({ error: 'author_slug_required', field: 'author_slug' });
    expect(state.update).not.toHaveBeenCalled();
  });
  it('rejects invalid avatars, cross-origin requests and anonymous requests', async () => {
    expect((await POST(context('POST', { avatar_key: 'uploaded-image' }))).status).toBe(400);
    expect((await POST(context('POST', {}, 'https://other.example'))).status).toBe(403);
    state.user = null;
    expect((await POST(context('POST'))).status).toBe(401);
    expect(state.update).not.toHaveBeenCalled();
  });
  it('does not acknowledge a write that returned no profile row', async () => {
    state.result = { data: null, error: null };
    expect((await POST(context('POST'))).status).toBe(503);
  });
  it('fails closed on a full-profile read failure instead of inventing editable defaults', async () => {
    state.result = { data: null, error: { code: '08006' } };
    expect((await GET(context('GET'))).status).toBe(503);
    expect(state.select).toHaveBeenCalledOnce(); expect(state.update).not.toHaveBeenCalled();
  });
});
