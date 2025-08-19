import { type Page } from '@playwright/test';

import { ApiRequestsSender } from './ApiRequestsSender';
import { type CheckoutPagePreset } from './CheckoutPagePreset';
import { Locales } from './types';

export class PaymentStepAsGuest implements CheckoutPagePreset {
    constructor(
        private currency = 'USD',
        private countryCode?: string,
        private locale: string = Locales.US,
    ) {}
    async apply(page: Page): Promise<void> {
        const api = new ApiRequestsSender(page, this.locale);

        await api.addPhysicalItemToCart();
        await api.setCurrency(this.currency);
        await api.completeCustomerStepAsGuest();
        await api.completeSingleShippingAndSkipToPaymentStep(this.countryCode);
        await api.dispose('You should be able to see checkout at the payment step now');
    }
}
