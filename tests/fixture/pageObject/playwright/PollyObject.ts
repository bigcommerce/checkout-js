import { Page } from '@playwright/test';
import { MODE, Polly } from '@pollyjs/core';
import { API } from '@pollyjs/node-server';
import FSPersister from '@pollyjs/persister-fs';
import { includes } from 'lodash';
import path from 'path';
import { PlaywrightAdapter } from 'polly-adapter-playwright';

import { CustomFSPersister } from './CustomFSPersister';

interface PollyOptions {
    harName: string;
    mode: MODE;
    page: Page;
    storeURL: string;
}

export class PollyObject {
    /**
     * @internal
     * This file is only accessible to PlaywrightHelper.
     */
    private polly: Polly | undefined;
    private readonly mode: MODE;
    private readonly baseUrl: string;

    constructor(mode: MODE) {
        this.mode = mode;
        this.baseUrl = 'http://localhost:' + process.env.PORT;
    }

    getCartAndOrderIDs(): { checkoutId: string; orderId?: number} {
        const { recordingsDir } = this.polly?.persister?.options as {recordingsDir: string};

        if (this.polly && recordingsDir) {
            const api = new API({recordingsDir});
            // PollyJS bug: The type definition does not match with the actual implementation.
            // @ts-ignore
            const entries = api.getRecording(this.polly.recordingId).body?.log?.entries;
            if (entries) {
                // Search for orderID and cartID.
                for (const entry of entries) {
                    if (includes(entry.request.url, 'api/storefront/orders') && entry.response.content.text) {
                        const {orderId, cartId} = JSON.parse(entry.response.content.text);
                        if (orderId && cartId) {
                            return {checkoutId: cartId, orderId};
                        }
                    }
                }

                // This should be an unfinished order, look for cartID instead.
                for (const entry of entries) {
                    if (includes(entry.request.url, '/api/storefront/checkout-settings') && entry.response.content.text) {
                        const { context: { checkoutId } } = JSON.parse(entry.response.content.text);
                        if (checkoutId) {
                            return { checkoutId };
                        }
                    }
                }

                // Critical error
                throw new Error('Unable to find checkoutId from the \'/api/storefront/checkout-settings\' request recording.');
            } else {
                throw new Error('Unable to find any recording from the located HAR file.');
            }
        } else {
            throw new Error('Unable to locate the HAR file folder.');
        }
    }

    start(option: PollyOptions): void {
        const { mode, page, harName, storeURL } = option;

        Polly.register(PlaywrightAdapter);
        Polly.register(FSPersister);

        this.polly = new Polly(harName);
        this.polly.configure({
            mode: this.mode,
            logLevel: 'SILENT', // change this to have detailed report for unmatched requests
            recordIfMissing: false,
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
                body: false,
                order: true,
                url: true,
            },
        });

        if (mode === 'replay') {
            this.polly.server.get(this.baseUrl + '/api/storefront/checkout-settings').on('beforeResponse', (_, res) => {
                const response = res.jsonBody();
                response.storeConfig.paymentSettings.bigpayBaseUrl = this.baseUrl;
                res.send(response);
            });
            this.polly.server.any().on('request', req => {
                if (includes(req.url, '/api/public/v1/orders/payments')) {
                    req.url = req.url.replace(this.baseUrl, 'https://bigpay.service.bcdev');
                } else {
                    req.url = req.url.replace(this.baseUrl, storeURL);
                }
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
