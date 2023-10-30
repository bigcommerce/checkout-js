import { Page } from '@playwright/test';

import { ApiRequestsSender } from './ApiRequestsSender';
import { CheckoutPagePreset } from './CheckoutPagePreset';

export class CustomerStepAsGuest implements CheckoutPagePreset {
    private readonly quantity: number;
    private readonly setShippingQuote: boolean;

    constructor(quantity = 1, setShippingQuote = true) {
        this.quantity = quantity;
        this.setShippingQuote = setShippingQuote;
    }

    async apply(page: Page): Promise<void> {
        const api = new ApiRequestsSender(page);

        await api.addPhysicalItemToCart(this.quantity);

        if (this.setShippingQuote) {
            await api.setShippingQuote();
        }

        await api.dispose('You should be able to see checkout at the customer step now');
    }
}
