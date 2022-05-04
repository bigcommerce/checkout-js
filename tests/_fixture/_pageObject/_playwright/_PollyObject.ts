import { Page } from '@playwright/test';
import { MODE, Polly } from '@pollyjs/core';
import FSPersister from '@pollyjs/persister-fs';
import path from 'path';
import { PlaywrightAdapter } from 'polly-adapter-playwright';

import CustomFSPersister from './_CustomFSPersister';

interface PollyOptions {
    harName: string;
    mode: MODE;
    page: Page;
    storeURL: string;
}

export default class PollyObject {
    private _polly: Polly | undefined;
    private readonly _mode: MODE;

    constructor(mode: MODE) {
        this._mode = mode;
    }

    start(option: PollyOptions): void {
        const { mode, page, harName, storeURL } = option;

        Polly.register(PlaywrightAdapter);
        Polly.register(FSPersister);

        this._polly = new Polly(harName);
        this._polly.configure({
            mode: this._mode,
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
                    recordingsDir: path.join(__dirname, '../../../_har/'),
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
            // console.log(this._polly);
            this._polly.server.any().on('request', req => {
                req.url = req.url.replace('http://localhost:' + process.env.PORT, storeURL);
                // console.log('😃REPLAY ' + req.url);
            });
        }
    }

    pause(): void {
        this._polly?.pause();
    }

    play(): void {
        this._polly?.play();
    }

    stop(): void {
        this._polly?.stop();
    }
}
