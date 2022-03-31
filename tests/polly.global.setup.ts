import { Page } from '@playwright/test';
import { MODE, Polly } from '@pollyjs/core';
import FSPersister from '@pollyjs/persister-fs';
import path from 'path';
import { PlaywrightAdapter } from 'polly-adapter-playwright';

import { checkout, checkoutConfig, formFields, order } from './paymentIntegrations/api.mock';

interface PollyRecordOptions {
    playwrightContext: Page;
    recordingName: string;
}

interface PollyReplayOptions extends PollyRecordOptions {
    storeURL: string;
}

async function recordInitializer(option: PollyRecordOptions): Promise<Polly> {
    return await pollyInitializer('record', option);
}

async function replayInitializer(option: PollyReplayOptions): Promise<Polly> {
    return await pollyInitializer('replay', option);
}

async function pollyInitializer(mode: MODE, option: PollyOptions): Promise<Polly> {
    const { playwrightContext: page, recordingName, storeURL } = option;

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
            disableSortingHarEntries: true,
            fs: {
                recordingsDir: path.join(__dirname, './_har/'),
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

    if (mode === 'record') {
        // dirty hack for root certificate issue during recording HAR
        // https://stackoverflow.com/questions/31673587/error-unable-to-verify-the-first-certificate-in-nodejs
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

        polly.server.any().on('beforePersist', (req, recording) => {
            // recording.request.headers = recording.request.headers.map((header: { name: string; value: string }) => {
            //     switch (header.name) {
            //         case 'authorization':
            //             return {...header, value: dummyData};
            //
            //         case 'cookie':
            //             return {...header, value: dummyData};
            //
            //         case 'x-xsrf-token':
            //             return {...header, value: dummyData};
            //
            //         default:
            //             return header;
            //     }
            // });
            // recording.response.headers = recording.response.headers.map((header: { name: string; value: string }) => {
            //     switch (header.name) {
            //         case 'set-cookie':
            //             return {...header, value: dummyData};
            //
            //         case 'token':
            //             return {...header, value: dummyData};
            //
            //         case 'x-session-hash':
            //             return {...header, value: dummyData};
            //
            //         default:
            //             return header;
            //     }
            // });

            const removeSensitiveHeaders = (headers: []): {} => {
                const dummyData = '😃';
                const sensitiveHeaderNames = [
                    'authorization',
                    'cookie',
                    'set-cookie',
                    'token',
                    'x-session-hash',
                    'x-xsrf-token',
                ];

                return headers.map((header: { name: string; value: string }) => {
                    if (sensitiveHeaderNames.includes(header.name)) {
                        return { ...header, value: dummyData };
                    }

                    return header;
                });
            };

            recording.request.headers = removeSensitiveHeaders(recording.request.headers);
            recording.response.headers = removeSensitiveHeaders(recording.response.headers);
        });
    }

    if (mode === 'replay') {
        // Serving static files
        await page.route('/', route => route.fulfill( {status: 200, path: './tests/_support/index.html' } ));
        await page.route('**/order-confirmation', route => route.fulfill( {status: 200, path: './tests/_support/orderConfirmation.html' } ));
        await page.route('**/ablebrewingsystem4.1647253530.190.285.jpg?c=1', route => route.fulfill( {status: 200, path: './tests/_support/product.gif' } ));

        // API mockups managed by checkout team
        await page.route('**/api/storefront/checkout/**', route => route.fulfill( {status: 200, contentType: 'application/json', body: JSON.stringify(checkout) } ));
        await page.route('**/api/storefront/form-fields', route => route.fulfill( {status: 200, contentType: 'application/json', body: JSON.stringify(formFields) } ));
        await page.route('**/api/storefront/checkout-settings', route => route.fulfill( {status: 200, contentType: 'application/json', body: JSON.stringify(checkoutConfig) } ));
        await page.route('**/api/storefront/orders/**', route => route.fulfill( {status: 200, contentType: 'application/json', body: JSON.stringify(order) } ));

        // This is for matching HAR entries
        polly.server.any().on('request', req => {
            req.url = req.url.replace('http://localhost:8080', storeURL);
            console.log('😃 REPLAY:: ' + req.url);
        });
    }

    return polly;
}

export { recordInitializer, replayInitializer };
