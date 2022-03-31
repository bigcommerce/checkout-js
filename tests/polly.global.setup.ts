import { Page } from '@playwright/test';
import { Polly } from '@pollyjs/core';
import FSPersister from '@pollyjs/persister-fs';
import path from 'path';
import { PlaywrightAdapter } from 'polly-adapter-playwright';

function newPolly(recordingName: string, page: Page): Polly {
    Polly.register(PlaywrightAdapter);
    Polly.register(FSPersister);
    const polly = new Polly(recordingName);
    polly.configure({
        mode: 'record',
        // logLevel: 'info',
        adapters: ['playwright'],
        adapterOptions: {
            playwright: {
                context: page,
            },
        },
        persister: 'fs',
        persisterOptions: {
            fs: {
                recordingsDir: path.join(__dirname, '../_har/'),
            },
        },
        matchRequestsBy: {
            headers: false,
            url: true,
            order: false,
        },
    });

    return polly;
}

export default newPolly;
