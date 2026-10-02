import type { supabase } from './supabase';

/** Media writes require positively verified staff permissions. */
export async function canManageMedia(db: NonNullable<ReturnType<typeof supabase>>, userId: string): Promise<boolean> {
  const { data: profile, error } = await db.from('profiles').select('role,permission_group_id').eq('id', userId).single();
  if (error || !profile) return false;
  if (profile.role === 'admin') return true;
  if (profile.role !== 'editor' || !profile.permission_group_id) return false;
  const { data: group, error: groupError } = await db.from('permission_groups').select('permissions').eq('id', profile.permission_group_id).single();
  return !groupError && group?.permissions?.media === true;
}
