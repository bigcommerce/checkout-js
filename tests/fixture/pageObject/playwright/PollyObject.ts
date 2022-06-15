import { Page } from '@playwright/test';
import { MODE, Polly } from '@pollyjs/core';
import { API } from '@pollyjs/node-server';
import FSPersister from '@pollyjs/persister-fs';
import { includes, isObject } from 'lodash';
import path from 'path';
import { PlaywrightAdapter } from 'polly-adapter-playwright';

import { ignoredHeaders, ignoredPayloads } from './senstiveDataConfig';
import { CustomFSPersister } from './CustomFSPersister';

interface PollyOptions {
    har: string;
    page: Page;
    devMode: boolean;
}

/**
 * @internal
 * This file is only accessible to PlaywrightHelper.
 */
export class PollyObject {
    private polly: Polly | undefined;
    private readonly mode: MODE;
    private readonly baseUrl: string;
    private readonly bigpayBaseUrlIdentifier: string = '/api/public/v1/orders/payments';

    constructor(mode: MODE) {
        this.mode = mode;
        this.baseUrl = 'http://localhost:' + process.env.PORT;
    }

    start(option: PollyOptions): void {
        const { page, har, devMode } = option;

        Polly.register(PlaywrightAdapter);
        Polly.register(FSPersister);

        this.polly = new Polly(har);
        this.polly.configure({
            mode: this.mode,
            logLevel: devMode ? 'INFO' : 'SILENT',
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
                method: true,
                url: true,
                order: true,
                headers: false,
                body: true,
            },
        });

        this.polly.server.any().on('request', req => {
            // To ensure that requests match HAR entries, ignore sensitive and constantly changing headers/payloads
            req.headers = Object.fromEntries(
                Object.entries(req.headers).filter(([key, _]) => !includes(ignoredHeaders, key))
            );

            if (req.body && req.body.length > 0) {
                req.body = JSON.stringify(this.sortPayload(req.jsonBody()));
            }
        });
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

    enableReplay(storeUrl: string): void {
        if (this.polly) {
            // bigpayBaseUrl must be the exact URL of the local environment in order for Bigpay iframes to work.
            this.polly.server.get(this.baseUrl + '/api/storefront/checkout-settings').on('beforeResponse', (_, res) => {
                const response = res.jsonBody();
                response.storeConfig.paymentSettings.bigpayBaseUrl = this.baseUrl;
                res.send(response);
            });

            // To ensure that requests match HAR entries, convert local URLs to production URLs.
            // HAR may not contain any bigpay request.
            const bigpayBaseUrl = this.getBigpayBaseUrl();
            this.polly.server.any().on('request', req => {
                if (bigpayBaseUrl && includes(req.url, this.bigpayBaseUrlIdentifier)) {
                    req.url = req.url.replace(this.baseUrl, bigpayBaseUrl);
                } else {
                    req.url = req.url.replace(this.baseUrl, storeUrl);
                }
            });
        }
    }

    getCartAndOrderIDs(): { checkoutId: string; orderId?: number} {
        let checkoutIdString: string = '';
        const entries = this.getEntries();

        for (const entry of entries) {
            if (includes(entry.request.url, '/api/storefront/checkout-settings') && entry.response.content.text) {
                const { context: { checkoutId } } = JSON.parse(entry.response.content.text);
                checkoutIdString = checkoutId;
            }
            if (includes(entry.request.url, 'api/storefront/orders') && entry.response.content.text) {
                const {orderId, cartId} = JSON.parse(entry.response.content.text);
                if (orderId && cartId) {
                    return {checkoutId: cartId, orderId};
                }
            }
        }

        if (checkoutIdString) {
            return { checkoutId: checkoutIdString };
        }

        // Critical error
        throw new Error('Unable to find checkoutId from the \'/api/storefront/checkout-settings\' recording.');
    }

    private getBigpayBaseUrl(): string | void {
        const entries = this.getEntries();
        for (const entry of entries) {
            if (includes(entry.request.url, this.bigpayBaseUrlIdentifier)) {
                return entry.request.url.replace(this.bigpayBaseUrlIdentifier, '');
            }
        }
    }

    private getEntries(): any {
        const { recordingsDir } = this.polly?.persister?.options as {recordingsDir: string};
        if (this.polly && recordingsDir) {
            const api = new API({recordingsDir});
            // PollyJS type bug: The type definition does not match with the actual implementation.
            // @ts-ignore
            const entries = api.getRecording(this.polly.recordingId).body?.log?.entries;
            if (entries) {
                return entries;
            }

            throw new Error('Unable to find any recording from the HAR file.');
        } else {
            throw new Error('Unable to locate the HAR file folder.');
        }
    }

    private sortPayload(object: { [ key: string ]: any }): { [ key: string ]: any } {
        const keys = Object.keys(object);
        const sortedKeys = keys.sort();

        return sortedKeys.reduce((previous, current) => {
            if (isObject(object[current])) {
                return this.sortPayload(object[current]);
            }

            return {...previous, [current]: (includes(ignoredPayloads, current)) ? '*' : object[current]};
        }, {});
    }
}
