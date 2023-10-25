import 'dotenv/config';
import { devices, PlaywrightTestConfig } from '@playwright/test';

// Essential environment variables check
if (!process.env.MODE) {
    throw new Error('MODE is undefined. Please set MODE environment variable.');
}

if (!process.env.PORT) {
    throw new Error('PORT is undefined. Please set PORT environment variable.');
}

const recordingSettings = process.env.WEBM
    ? {
          contextOptions: {
              recordVideo: { dir: './packages/test-framework/videos' },
          },
          launchOptions: { slowMo: 800 },
          viewport: { width: 1280, height: 1080 },
      }
    : null;

const config: PlaywrightTestConfig = {
    webServer: {
        command: `http-server dist --port=${process.env.PORT}`,
        port: Number(process.env.PORT),
        timeout: 3 * 1000,
        reuseExistingServer: true,
    },
    timeout: 60 * 1000,
    expect: {
        // timeout: 25 * 1000,
    },
    testDir: './packages',
    testMatch: /e2e\/.*\.spec\.ts/,
    outputDir: './packages/test-framework/screenshots',
    fullyParallel: true,
    forbidOnly: true,
    retries: 3,
    workers: process.env.IS_CI ? 3 : undefined,
    reporter: [
        [
            'html',
            { outputFolder: './packages/test-framework/report', open: 'never' },
        ],
    ],
    use: {
        baseURL: `http://localhost:${process.env.PORT}`,
        screenshot: 'only-on-failure',
        trace: 'retain-on-failure',
    },
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                ...recordingSettings,
            },
        },
    ],
};

export default config;
