import { Page } from '@playwright/test';

import { ApiRequestsSender } from './ApiRequestsSender';
import { CheckoutPagePreset } from './CheckoutPagePreset';

export class UseAUD implements CheckoutPagePreset {
    private readonly api: ApiRequestsSender;

    constructor(page: Page, storeURL: string) {
        this.api = new ApiRequestsSender(page, storeURL);
    }

    async apply(): Promise<void> {
        await this.api.addPhysicalItemToCart();
        await this.api.setCurrency('AUD');
        await this.api.dispose();
    }
}
