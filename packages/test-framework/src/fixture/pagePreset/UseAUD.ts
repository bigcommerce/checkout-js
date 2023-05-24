import { Page } from '@playwright/test';

import { ApiRequestsSender } from './ApiRequestsSender';
import { CheckoutPagePreset } from './CheckoutPagePreset';

export class UseAUD implements CheckoutPagePreset {
    private readonly currency: string;

    constructor(currency: string) {
        this.currency = currency;
    }

    async apply(page: Page): Promise<void> {
        const api = new ApiRequestsSender(page);

        await api.addPhysicalItemToCart();
        await api.setCurrency(this.currency);
        await api.dispose(`Checkout is using ${this.currency} now`);
    }
}
