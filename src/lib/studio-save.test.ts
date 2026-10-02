import { afterEach, describe, expect, it, vi } from 'vitest';
import { STUDIO_SAVE_TIMEOUT_MS, StudioSaveError, submitStudioForm, studioSaveMessage } from './studio-save';

const action = 'https://studio.palmarghe.com/api/studio/';
function response(status: number, url = 'https://studio.palmarghe.com/studio/?section=content', redirected = true) {
  const result = new Response(null, { status });
  Object.defineProperties(result, { url: { value: url }, redirected: { value: redirected } });
  return result;
}
afterEach(() => { vi.useRealTimers(); });
describe('bounded Studio save transport', () => {
  it('sends captured fields and follows only the expected same-origin Studio redirect', async () => {
    const body = new FormData(); body.set('title', 'Controlled QA');
    const transport = vi.fn<typeof fetch>(async () => response(200));
    expect(await submitStudioForm(action, body, 'content', transport)).toBe('https://studio.palmarghe.com/studio/?section=content');
    expect(transport).toHaveBeenCalledWith(action, expect.objectContaining({ method: 'POST', body, credentials: 'same-origin', signal: expect.any(AbortSignal) }));
    expect(body.get('title')).toBe('Controlled QA');
  });
  it.each([[400, 'validation'], [422, 'validation'], [401, 'authentication'], [403, 'permission'], [409, 'conflict'], [500, 'server'], [503, 'server']] as const)('classifies HTTP%s without reflecting a server body', async (status, reason) => {
    await expect(submitStudioForm(action, new FormData(), 'content', async () => response(status))).rejects.toMatchObject({ reason });
  });
  it.each([
    ['https://attacker.example/studio/?section=content', true],
    ['https://studio.palmarghe.com/account/', true],
    ['https://studio.palmarghe.com/studio/?section=media', true],
    ['https://studio.palmarghe.com/studio/?section=content', false],
    ['', false],
  ])('does not treat an unexpected 200 as a confirmed save: %s', async (url, redirected) => {
    await expect(submitStudioForm(action, new FormData(), 'content', async () => response(200, String(url), Boolean(redirected)))).rejects.toMatchObject({ reason: 'response' });
  });
  it('accepts the editor-panel media redirect', async () => {
    const destination = 'https://studio.palmarghe.com/studio/?panel=editor&section=media';
    expect(await submitStudioForm(action, new FormData(), 'media', async () => response(200, destination))).toBe(destination);
  });
  it('reports a connection failure without leaking internal transport details', async () => {
    await expect(submitStudioForm(action, new FormData(), 'content', async () => { throw new Error('private internal detail'); })).rejects.toMatchObject({ reason: 'network' });
    expect(studioSaveMessage(new Error('private internal detail'))).not.toContain('private internal');
  });
  it('aborts a hung request, distinguishes uncertain outcome, and clears its timer', async () => {
    vi.useFakeTimers();
    let signal: AbortSignal | undefined;
    const transport: typeof fetch = async (_, options) => new Promise((_, reject) => {
      signal = options?.signal ?? undefined;
      signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
    });
    const result = expect(submitStudioForm(action, new FormData(), 'content', transport)).rejects.toMatchObject({ reason: 'timeout' });
    await vi.advanceTimersByTimeAsync(STUDIO_SAVE_TIMEOUT_MS);
    await result;
    expect(signal?.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
    expect(studioSaveMessage(new StudioSaveError('timeout'))).toContain('sonucu doğrulanamadı');
  });
});
