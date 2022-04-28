import { Page } from '@playwright/test';
import { MODE, Polly } from '@pollyjs/core';
import FSPersister from '@pollyjs/persister-fs';
import path from 'path';
import { PlaywrightAdapter } from 'polly-adapter-playwright';

interface PollyOptions {
    mode: MODE;
    playwrightContext: Page;
    recordingName: string;
}

async function pollyInitializer(option: PollyOptions): Promise<Polly> {
    const { mode, playwrightContext: page, recordingName } = option;

    Polly.register(PlaywrightAdapter);
    Polly.register(FSPersister);

    const polly = new Polly(recordingName);

    polly.configure({
        mode,
        // logLevel: 'info',
        recordIfMissing: true,
        flushRequestsOnStop: true,
        recordFailedRequests: true,
        adapters: ['playwright'],
        adapterOptions: {
            playwright: {
                context: page,
            },
        },
        persister: 'fs',
        persisterOptions: {
            keepUnusedRequests: false,
            disableSortingHarEntries: true,
            fs: {
                recordingsDir: path.join(__dirname, '../_har/'),
            },
        },
        matchRequestsBy: {
            headers: false,
            method: true,
            body: true,
            order: false,
            url: true,
        },
    });

    return polly;
}

export { pollyInitializer };
