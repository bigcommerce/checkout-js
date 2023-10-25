import { Page } from '@playwright/test';
import { MODE, Polly } from '@pollyjs/core';
import { API } from '@pollyjs/node-server';
import FSPersister from '@pollyjs/persister-fs';
import { includes, isObject } from 'lodash';
import { PlaywrightAdapter } from 'polly-adapter-playwright';

import { getStoreUrl } from '../../';

import { CustomFSPersister } from './CustomFSPersister';
import { ignoredHeaders, ignoredPayloads } from './senstiveDataConfig';

interface PollyOptions {
    har: string;
    harFolder: string;
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
    private readonly genericStoreUrl: string = 'https://4241.project';

    constructor(mode: MODE) {
        this.mode = mode;
        this.baseUrl = `http://localhost:${process.env.PORT || ''}`;
    }

    start(option: PollyOptions): void {
        const { page, har, devMode, harFolder } = option;

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
                // eslint-disable-next-line @typescript-eslint/naming-convention
                CustomFSPersister: {
                    recordingsDir: harFolder,
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

        this.polly.server.any().on('request', (req) => {
            // To ensure that requests match HAR entries, ignore sensitive and constantly changing headers/payloads
            req.headers = Object.fromEntries(
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                Object.entries(req.headers).filter(([key, _]) => !includes(ignoredHeaders, key)),
            );

            req.url = req.url
                .replace('%2ClineItems.physicalItems.categories', '')
                .replace('%2ClineItems.digitalItems.categories', '');

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

    stop(): Promise<void> | undefined {
        return this.polly?.stop();
    }

    enableRecord(): void {
        const storeUrl = getStoreUrl();

        this.polly?.server.any().on('request', (req) => {
            req.url = req.url.replace(storeUrl, this.genericStoreUrl);
        });
    }

    enableReplay(): void {
        if (this.polly) {
            this.polly.server
                .get(`${this.baseUrl}/api/storefront/checkout-settings`)
                .on('beforeResponse', (_, res) => {
                    const response = res.jsonBody();

                    // bigpayBaseUrl must be the exact URL of the local environment in order for
                    // Bigpay iframes to work.
                    response.storeConfig.paymentSettings.bigpayBaseUrl = this.baseUrl;

                    // If the return of checkout settings is altered, provide the default values for
                    // the previous HAR recordings.
                    if (!response.storeConfig.checkoutSettings.checkoutUserExperienceSettings) {
                        response.storeConfig.checkoutSettings.checkoutUserExperienceSettings = {
                            walletButtonsOnTop: false,
                            floatingLabelEnabled: false,
                        };
                    }

                    res.send(response);
                });

            // To ensure that requests match HAR entries, convert local URLs to production URLs.
            // HAR may not contain any bigpay request.
            const bigpayBaseUrl = this.getBigpayBaseUrl();

            this.polly.server.any().on('request', (req) => {
                if (bigpayBaseUrl && includes(req.url, this.bigpayBaseUrlIdentifier)) {
                    req.url = req.url.replace(this.baseUrl, bigpayBaseUrl);
                } else {
                    req.url = req.url.replace(this.baseUrl, this.genericStoreUrl);
                }
            });
        }
    }

    getCartAndOrderIDs(): { checkoutId: string; orderId?: number } {
        let checkoutIdString = '';
        const entries = this.getEntries();

        for (const entry of entries) {
            if (
                includes(entry.request.url, '/api/storefront/checkout-settings') &&
                entry.response.content.text
            ) {
                const {
                    context: { checkoutId },
                } = JSON.parse(entry.response.content.text);

                checkoutIdString = checkoutId;
            }

            if (
                includes(entry.request.url, 'api/storefront/orders') &&
                entry.response.content.text
            ) {
                const { orderId, cartId } = JSON.parse(entry.response.content.text);

                if (orderId && cartId) {
                    return { checkoutId: cartId, orderId };
                }
            }
        }

        if (checkoutIdString && checkoutIdString.length > 0) {
            return { checkoutId: checkoutIdString };
        }

        // Critical error
        throw new Error(
            "Unable to find checkoutId from the '/api/storefront/checkout-settings' recording.",
        );
    }

    private getBigpayBaseUrl(): string | void {
        const entries = this.getEntries();

        for (const entry of entries) {
            if (includes(entry.request.url, this.bigpayBaseUrlIdentifier)) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
                return entry.request.url.replace(this.bigpayBaseUrlIdentifier, '');
            }
        }
    }

    private getEntries(): any {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const { recordingsDir } = this.polly?.persister?.options as { recordingsDir: string };

        if (this.polly && recordingsDir) {
            const api = new API({ recordingsDir });
            // PollyJS type bug: The type definition does not match with the actual implementation.
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            const entries = api.getRecording(this.polly.recordingId).body?.log?.entries;

            if (entries) {
                return entries;
            }

            throw new Error('Unable to find any recording from the HAR file.');
        } else {
            throw new Error('Unable to locate the HAR file folder.');
        }
    }

    private sortPayload(object: { [key: string]: any }): { [key: string]: any } {
        const keys = Object.keys(object);
        const sortedKeys = keys.sort();

        return sortedKeys.reduce((previous, current) => {
            if (isObject(object[current])) {
                return this.sortPayload(object[current]);
            }

            return {
                ...previous,
                [current]: includes(ignoredPayloads, current) ? '*' : object[current],
            };
        }, {});
    }
}
