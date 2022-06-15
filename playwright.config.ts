import dotenv from 'dotenv';
import { devices, PlaywrightTestConfig } from '@playwright/test';

dotenv.config();

/**
 * See https://playwright.dev/docs/test-configuration.
 * All timeout settings are default values now. 14/04/2022
 */
const config: PlaywrightTestConfig = {
  webServer: {
    command: 'http-server build --port=' + process.env.PORT,
    port: Number(process.env.PORT),
    timeout: 3 * 1000,
  },
  timeout: 60 * 1000,
  expect: {
    // timeout: 25 * 1000,
  },
  testDir: './tests/',
  testIgnore: './tests/sampleTests/**',
  outputDir: 'tests/screenshots',
  fullyParallel: true,
  /* TODO: Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* TODO: Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* TODO: Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  // reporter: 'line',
  reporter: [ ['html', { outputFolder: './tests/report' }] ],
  // Shared settings for all the projects below.
  use: {
    baseURL: 'http://localhost:' + process.env.PORT,
    screenshot: 'only-on-failure',
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    // actionTimeout: 30 * 1000,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
};
export default config;
