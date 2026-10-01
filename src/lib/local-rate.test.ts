import { afterEach, expect, it, vi } from 'vitest';
import { localAuthAllowed } from './local-adapter';
afterEach(() => vi.useRealTimers());
it('uses a 60-second measurement window while retaining the 15-minute auth default', () => {
  vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-01T00:00:00Z'));
  expect(localAuthAllowed('measurement-window-qa', 1, 60)).toBe(true);
  expect(localAuthAllowed('measurement-window-qa', 1, 60)).toBe(false);
  expect(localAuthAllowed('auth-window-qa', 1)).toBe(true);
  vi.advanceTimersByTime(61000);
  expect(localAuthAllowed('measurement-window-qa', 1, 60)).toBe(true);
  expect(localAuthAllowed('auth-window-qa', 1)).toBe(false);
  vi.advanceTimersByTime(900000);
  expect(localAuthAllowed('auth-window-qa', 1)).toBe(true);
});
