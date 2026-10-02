import { localMode } from './supabase';
import { localDeleteMedia } from './local-adapter';

/** Retry only a server-recorded receipt; never accept a browser-supplied path. */
export async function cleanDeletedMedia(db: any, mediaId: string): Promise<boolean> {
  try {
  const { data: tasks, error } = await db.rpc('pending_media_cleanup', { p_media_id: mediaId });
  if (error || !Array.isArray(tasks) || tasks.length !== 1) return false;
  const task = tasks[0];
  if (!task || task.media_id !== mediaId || typeof task.id !== 'string' || typeof task.path !== 'string') return false;
    if (localMode) localDeleteMedia(task.path);
    else {
      const { error: removeError } = await db.storage.from('media').remove([task.path]);
      if (removeError) return false;
    }
    const completed = await db.rpc('complete_media_cleanup', { p_task_id: task.id });
    return !completed.error && completed.data === true;
  } catch { return false; }
}
