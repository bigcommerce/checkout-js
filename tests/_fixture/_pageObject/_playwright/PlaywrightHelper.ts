import { Page } from '@playwright/test';
import { MODE } from '@pollyjs/core';

import ApiRequestsSender from './_ApiRequestsSender';
import PollyObject from './_PollyObject';
import ServerSideRender from "./_ServerSideRender";

export enum CheckoutPresets {
    PaymentStepAsGuest = 'paymentStepAsGuest',
}

export default class PlaywrightHelper {
    private readonly _isReplay: boolean;
    private readonly _mode: MODE;
    private readonly _page: Page;
    private readonly _polly: PollyObject;
    private _harName: string;
    private _storeURL: string;

    constructor(page: Page) {
        this._page = page;
        this._mode = process.env.MODE?.toLowerCase() === 'record'  ? 'record' : 'replay';
        this._isReplay = this._mode === 'replay';
        this._polly = new PollyObject(this._mode);
        this._storeURL = '';
        this._harName = '';
    }

    async goto({ storeURL, harName, preset }: { storeURL: string; harName: string; preset: CheckoutPresets }): Promise<void> {
        const page = this._page;
        this._storeURL = storeURL;
        this._harName = harName;

        await this._polly.start({
            page,
            mode: this._mode,
            harName: this._harName,
            storeURL: this._storeURL,
        });

        if (this._isReplay) {
            // TODO: Server-side rendering
            const server = new ServerSideRender(this._page);
            await server.renderCheckoutAndOrderConfirmation();
            await page.goto('/');
        } else {
            // TODO: Use direct API calls to create a cart
            this._polly.pause();
            const api = new ApiRequestsSender(this._page, storeURL);
            switch (preset) {
                // TODO: more presets
                case CheckoutPresets.PaymentStepAsGuest:
                    await api.addPhysicalItemToCart();
                    await api.completeCustomerStepAsGuest();
                    await api.completeShippingStepAndSkipBilling();
                    break;
                default:
                    await api.addPhysicalItemToCart();
            }
            this._polly.play();
            await page.goto(this._storeURL + '/checkout');
        }
    }

    async stopAll(): Promise<void> {
        await this._polly.stop();
        await this._page.close();
    }
}
