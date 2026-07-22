import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : [['html', { open: 'never' }]],
  globalSetup: './e2e/global-setup.ts',
  timeout: process.env.CI ? 60_000 : 30_000,
  expect: {
    timeout: process.env.CI ? 15_000 : 5_000,
  },
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    // Setup project — genera las sesiones
    {
      name: 'setup',
      testMatch: /global-setup\.ts/,
    },
    // Tests que requieren sesión de admin
    {
      name: 'admin — chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/admin.json',
      },
      dependencies: ['setup'],
      testMatch: /checkout\.spec\.ts/,
    },
    // Tests que requieren sesión de clienta
    {
      name: 'customer — chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/customer.json',
      },
      dependencies: ['setup'],
      testMatch: /\/(booking-flow|cancellation-flow)\.spec\.ts/,
    },
    // Tests públicos (sin sesión)
    {
      name: 'public — chromium',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /\/(registro|guest-booking|onboarding)\.spec\.ts/,
    },
    {
      name: 'public — mobile',
      use: { ...devices['Pixel 5'] },
      testMatch: /\/(registro|onboarding)\.spec\.ts/,
    },
  ],
  webServer: {
    // In CI the app is pre-built (artifact downloaded from build job) — use `start`
    // (production server, ~3s startup). Locally use `dev` for HMR.
    command: process.env.CI ? 'npm run start' : 'npm run dev',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
