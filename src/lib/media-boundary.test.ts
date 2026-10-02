import { describe, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({ storage: vi.fn(), from: vi.fn() }));
vi.mock('./supabase', () => ({ localMode: false, supabase: () => {
  const query = { select: vi.fn(), eq: vi.fn(), single: vi.fn(async () => ({ data: null, error: { code: '08006' } })) };
  query.select.mockReturnValue(query); query.eq.mockReturnValue(query); state.from.mockReturnValue(query);
  return { auth: { getUser: async () => ({ data: { user: { id: 'controlled-editor' } } }) }, from: state.from, storage: { from: state.storage } };
} }));
import { POST as upload } from '../pages/api/media/index';
import { POST as manage } from '../pages/api/media/manage';

describe('media endpoint permission boundary', () => {
  it.each([['upload', upload], ['manage', manage]] as const)('%s denies unavailable permission before parsing a body or accessing Storage', async (_, endpoint) => {
    vi.clearAllMocks();
    // This is deliberately not a multipart body: reaching formData would throw.
    const request = new Request('https://studio.palmarghe.com/api/media/', { method: 'POST', headers: { origin: 'https://studio.palmarghe.com' }, body: 'not-form-data' });
    const response = await endpoint({ request, cookies: {} } as Parameters<typeof endpoint>[0]);
    expect(response.status).toBe(403); expect(await response.text()).toBe('Forbidden');
    expect(state.storage).not.toHaveBeenCalled(); expect(state.from).toHaveBeenCalledOnce();
  });
});
