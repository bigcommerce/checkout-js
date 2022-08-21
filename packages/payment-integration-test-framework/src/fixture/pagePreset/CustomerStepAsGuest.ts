import { Page } from '@playwright/test';

import { ApiRequestsSender } from './ApiRequestsSender';
import { CheckoutPagePreset } from './CheckoutPagePreset';

export class CustomerStepAsGuest implements CheckoutPagePreset {
    async apply(page: Page): Promise<void> {
        const api = new ApiRequestsSender(page);
        await api.addPhysicalItemToCart();
        await api.setShippingQuote();
        await api.dispose();
    }
}
