import { beforeEach, describe, expect, it, vi } from 'vitest';

const { signUp } = vi.hoisted(() => ({ signUp: vi.fn(async (_input: { options: { data: Record<string, string> } }) => ({ error: null })) }));
vi.mock('./supabase', () => ({ supabase: () => ({ auth: { signUp } }), localTestRequest: () => true }));
vi.mock('./local-adapter', () => ({ localAuthAllowed: () => true }));
vi.mock('./runtime-secrets', () => ({ runtimeSecret: () => undefined }));
import { POST } from '../pages/api/auth';

async function signup(notices: Record<string, string>) {
  const request = new Request('https://palmarghe.com/api/auth/', {
    method: 'POST', headers: { origin: 'https://palmarghe.com' },
    body: new URLSearchParams({ action: 'signup', locale: 'tr', email: 'notice-qa@example.invalid', password: 'LocalTest123!', ...notices }),
  });
  return POST({ request, cookies: {} } as Parameters<typeof POST>[0]);
}

describe('signup notice acknowledgement boundary', () => {
  beforeEach(() => { signUp.mockClear(); });
  const missingNotices: Record<string, string>[] = [
    {}, { privacy_acknowledgement: 'on' }, { kvkk_acknowledgement: 'on' },
    { privacy_consent: 'on', kvkk_consent: 'on' },
  ];
  it.each(missingNotices)('does not call Auth when either notice acknowledgement is missing: %j', async notices => {
    const response = await signup(notices);
    expect(response.status).toBe(400);
    expect(signUp).not.toHaveBeenCalled();
  });
  it('records notice acknowledgement rather than a general processing consent', async () => {
    const response = await signup({ privacy_acknowledgement: 'on', kvkk_acknowledgement: 'on' });
    expect(response.status).toBe(303);
    expect(signUp).toHaveBeenCalledOnce();
    const metadata = signUp.mock.calls[0][0].options.data;
    expect(metadata.privacy_notice_acknowledged_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(metadata.kvkk_notice_acknowledged_at).toBe(metadata.privacy_notice_acknowledged_at);
    expect(metadata.notice_ui_version).toBe('2026-10-01');
    expect(metadata).not.toHaveProperty('privacy_consent_at');
    expect(metadata).not.toHaveProperty('kvkk_consent_at');
  });
});
