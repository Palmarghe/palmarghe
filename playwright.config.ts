import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : [['list']],
  use: { ...devices['Desktop Chrome'], channel: process.env.CI ? undefined : 'chrome', baseURL: 'http://127.0.0.1:4322', trace: 'retain-on-failure' },
  webServer: {
    command: 'node scripts/e2e-server.mjs',
    url: 'http://127.0.0.1:4322/',
    reuseExistingServer: false,
    timeout: 60000,
    env: { LOCAL_TEST_MODE: 'true', ASTRO_TELEMETRY_DISABLED: '1' },
  },
});
