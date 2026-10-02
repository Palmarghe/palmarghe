import { describe, expect, it, vi } from 'vitest';
import { canManageMedia } from './media-permission';
import type { supabase } from './supabase';

function database(profile: unknown, group: unknown, profileError: unknown = null, groupError: unknown = null) {
  const from = vi.fn((table: string) => {
    const query = { select: vi.fn(), eq: vi.fn(), single: vi.fn(async () => table === 'profiles'
      ? { data: profile, error: profileError } : { data: group, error: groupError }) };
    query.select.mockReturnValue(query); query.eq.mockReturnValue(query); return query;
  });
  return { from } as unknown as NonNullable<ReturnType<typeof supabase>>;
}

describe('verified media permission', () => {
  it('permits an admin without an extra permission group query', async () => {
    const db = database({ role: 'admin' }, null);
    expect(await canManageMedia(db, 'qa')).toBe(true);
    expect(db.from).toHaveBeenCalledOnce();
  });
  it('permits an editor only with explicit boolean media permission', async () => {
    expect(await canManageMedia(database({ role: 'editor', permission_group_id: 'qa-group' }, { permissions: { media: true } }), 'qa')).toBe(true);
  });
  it.each([null, { permissions: {} }, { permissions: { media: false } }, { permissions: { media: 'true' } }])('denies absent or unverified permission: %j', async group => {
    expect(await canManageMedia(database({ role: 'editor', permission_group_id: 'qa-group' }, group), 'qa')).toBe(false);
  });
  it('denies a group read failure even if a stale data object accompanies it', async () => {
    expect(await canManageMedia(database({ role: 'editor', permission_group_id: 'qa-group' }, { permissions: { media: true } }, null, { code: '08006' }), 'qa')).toBe(false);
  });
  it.each([null, { role: 'member', permission_group_id: 'qa-group' }, { role: 'editor' }])('denies missing profile/group or member roles: %j', async profile => {
    expect(await canManageMedia(database(profile, { permissions: { media: true } }), 'qa')).toBe(false);
  });
  it('denies a profile read error even when stale admin data accompanies it', async () => {
    expect(await canManageMedia(database({ role: 'admin' }, null, { code: '08006' }), 'qa')).toBe(false);
  });
});
