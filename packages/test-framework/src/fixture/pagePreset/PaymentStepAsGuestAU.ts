import { Page } from '@playwright/test';

import { ApiRequestsSender } from './ApiRequestsSender';
import { CheckoutPagePreset } from './CheckoutPagePreset';
import { Locales } from './types';

export class PaymentStepAsGuestAU implements CheckoutPagePreset {
    async apply(page: Page): Promise<void> {
        const api = new ApiRequestsSender(page, Locales.AU);

        await api.addPhysicalItemToCart();
        await api.setCurrency('AUD');
        await api.completeCustomerStepAsGuest();
        await api.completeSingleShippingAndSkipToPaymentStep('AU');
        await api.dispose('You should be able to see checkout at the payment step now');
    }
}
