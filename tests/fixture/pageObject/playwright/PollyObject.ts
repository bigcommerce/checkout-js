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
    mode: MODE;
    page: Page;
    storeUrl: string;
    devMode: boolean;
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
            let checkoutIdString: string = '';
            const api = new API({recordingsDir});
            // PollyJS type bug: The type definition does not match with the actual implementation.
            // @ts-ignore
            const entries = api.getRecording(this.polly.recordingId).body?.log?.entries;

            if (entries) {
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
                throw new Error('Unable to find checkoutId from the \'/api/storefront/checkout-settings\' request recording.');
            } else {
                throw new Error('Unable to find any recording from the located HAR file.');
            }
        } else {
            throw new Error('Unable to locate the HAR file folder.');
        }
    }

    start(option: PollyOptions): void {
        const { mode, page, har, storeUrl, devMode } = option;

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

        if (mode === 'replay') {
            this.polly.server.get(this.baseUrl + '/api/storefront/checkout-settings').on('beforeResponse', (_, res) => {
                // bigpayBaseUrl must be the exact URL of the local environment in order for Bigpay iframes to work.
                const response = res.jsonBody();
                response.storeConfig.paymentSettings.bigpayBaseUrl = this.baseUrl;
                res.send(response);
            });
            this.polly.server.any().on('request', req => {
                // To ensure that requests match HAR entries, change local URLs to production URLs.
                if (includes(req.url, '/api/public/v1/orders/payments')) {
                    req.url = req.url.replace(this.baseUrl, 'https://bigpay.service.bcdev');
                } else {
                    req.url = req.url.replace(this.baseUrl, storeUrl);
                }
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

    private sortPayload(object: { [ key: string ]: any }): { [ key: string ]: any } {
        const keys = Object.keys(object);
        const sortedKeys = keys.sort();

        return sortedKeys.reduce((previous, current) => {
            if (isObject(object[current])) {
                return this.sortPayload(object[current]);
            } else {
                return {...previous, [current]: (includes(ignoredPayloads, current)) ? '*' : object[current]};
            }
        }, {});
    }
}
