import { Page } from '@playwright/test';

import { ApiRequestsSender } from './ApiRequestsSender';
import { CheckoutPagePreset } from './CheckoutPagePreset';

export class PaymentStepAsGuest implements CheckoutPagePreset {
    async apply(page: Page): Promise<void> {
        const api = new ApiRequestsSender(page);

        await api.addPhysicalItemToCart();
        await api.completeCustomerStepAsGuest();
        await api.completeSingleShippingAndSkipToPaymentStep();
        await api.dispose('You should be able to see checkout at the payment step now');
    }
}
