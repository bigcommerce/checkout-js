import { Page } from '@playwright/test';

import { ApiRequestsSender } from './ApiRequestsSender';
import { CheckoutPagePreset } from './CheckoutPagePreset';

export class CustomerStepAsGuest implements CheckoutPagePreset {
    private readonly api: ApiRequestsSender;

    constructor(page: Page, storeURL: string) {
        this.api = new ApiRequestsSender(page, storeURL);
    }

    async apply(): Promise<void> {
        await this.api.addPhysicalItemToCart();
    }
}
