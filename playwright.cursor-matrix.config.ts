import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e-production',
  testMatch: 'cursor.spec.ts',
  timeout: 30000,
  workers: 1,
  reporter: 'list',
  use: { baseURL: 'https://palmarghe.com', trace: 'retain-on-failure' },
  projects: [
    { name: 'Chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
    { name: 'Edge', use: { ...devices['Desktop Chrome'], channel: 'msedge' } },
    { name: 'Firefox', use: { ...devices['Desktop Chrome'], browserName: 'firefox' } },
    { name: 'WebKit (Safari engine)', use: { ...devices['Desktop Chrome'], browserName: 'webkit' } },
  ],
});
