import { Page } from '@playwright/test';

import { ApiRequestsSender } from './ApiRequestsSender';
import { CheckoutPagePreset } from './CheckoutPagePreset';

export class PaymentStepAsGuest implements CheckoutPagePreset {
    private readonly storeUrl: string;

    constructor(storeUrl: string) {
        this.storeUrl = storeUrl;
    }

    async apply(page: Page): Promise<void> {
        const api = new ApiRequestsSender(page, this.storeUrl);
        await api.addPhysicalItemToCart();
        await api.completeCustomerStepAsGuest();
        await api.completeSingleShippingAndSkipToPaymentStep();
        await api.dispose();
    }
}
