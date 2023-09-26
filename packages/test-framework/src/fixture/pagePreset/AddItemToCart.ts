import { Page } from '@playwright/test';

import { ApiRequestsSender } from './ApiRequestsSender';
import { CheckoutPagePreset } from './CheckoutPagePreset';

export class AddItemToCart implements CheckoutPagePreset {
    private readonly quantity: number;

    constructor(quantity: number) {
        this.quantity = quantity || 1;
    }

    async apply(page: Page): Promise<void> {
        const api = new ApiRequestsSender(page);

        await api.addPhysicalItemToCart(this.quantity);
        await api.dispose(`Item(s) is added to cart now`);
    }
}
