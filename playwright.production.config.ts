import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e-production',
  timeout: 30000,
  workers: 1,
  use: {
    ...devices['Desktop Chrome'],
    channel: 'chrome',
    baseURL: 'https://palmarghe.com',
    trace: 'retain-on-failure',
  },
});
