import { Page } from '@playwright/test';

import { ApiRequestsSender } from './ApiRequestsSender';
import { CheckoutPagePreset } from './CheckoutPagePreset';

export class UseAUD implements CheckoutPagePreset {
    private readonly storeURL: string;

    constructor(storeURL: string) {
        this.storeURL = storeURL;
    }

    async apply(page: Page): Promise<void> {
        const api = new ApiRequestsSender(page, this.storeURL);
        await api.addPhysicalItemToCart();
        await api.setCurrency('AUD');
        await api.dispose();
    }
}
