import { Page } from '@playwright/test';
import { MODE, Polly } from '@pollyjs/core';
import FSPersister from '@pollyjs/persister-fs';
import path from 'path';
import { PlaywrightAdapter } from 'polly-adapter-playwright';

import CustomFSPersister from './CustomFSPersister';

interface PollyOptions {
    harName: string;
    mode: MODE;
    page: Page;
    storeURL: string;
}

export default class PollyObject {
    /**
     * @internal
     * This file is only accessible to PlaywrightHelper, and it is the only place to
     * manage the mutable state of a PollyJS object.
     */
    private polly: Polly | undefined;
    private readonly mode: MODE;

    constructor(mode: MODE) {
        this.mode = mode;
    }

    start(option: PollyOptions): void {
        const { mode, page, harName, storeURL } = option;

        Polly.register(PlaywrightAdapter);
        Polly.register(FSPersister);

        this.polly = new Polly(harName);
        this.polly.configure({
            mode: this.mode,
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
            persister: CustomFSPersister,
            persisterOptions: {
                keepUnusedRequests: false,
                disableSortingHarEntries: true,
                CustomFSPersister: {
                    recordingsDir: path.join(__dirname, '../../../har/'),
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

        if (mode === 'replay') {
            this.polly.server.any().on('request', req => {
                req.url = req.url.replace('http://localhost:' + process.env.PORT, storeURL);
                // console.log('😃REPLAY ' + req.url);
            });
        }
    }

    pause(): void {
        this.polly?.pause();
    }

    play(): void {
        this.polly?.play();
    }

    stop(): void {
        this.polly?.stop();
    }
}
