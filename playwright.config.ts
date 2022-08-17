import 'dotenv/config'
import { devices, PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  webServer: {
    command: 'http-server dist --port=' + process.env.PORT,
    port: Number(process.env.PORT),
    timeout: 3 * 1000,
    reuseExistingServer: true,
  },
  timeout: 60 * 1000,
  expect: {
    // timeout: 25 * 1000,
  },
  testDir: './packages/e2e/src',
  outputDir: './packages/payment-integration-test-framework/screenshots',
  fullyParallel: true,
  forbidOnly: true,
  retries: 1,
  workers: process.env.IS_CI ? 3 : undefined,
  reporter: process.env.IS_CI ? 'line' : [ ['html', { outputFolder: './packages/payment-integration-test-framework/report' }] ],
  use: {
    baseURL: 'http://localhost:' + process.env.PORT,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    // actionTimeout: 30 * 1000, // Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
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
