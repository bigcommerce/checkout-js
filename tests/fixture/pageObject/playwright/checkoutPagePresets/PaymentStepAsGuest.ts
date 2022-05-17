import { Page } from '@playwright/test';

import ApiRequestsSender from './ApiRequestsSender';
import CheckoutPagePreset from './CheckoutPagePreset';

export default class PaymentStepAsGuestPreset implements CheckoutPagePreset {
    private readonly api: ApiRequestsSender;

    constructor(page: Page, storeURL: string) {
        this.api = new ApiRequestsSender(page, storeURL);
    }

    async apply(): Promise<void> {
        await this.api.addPhysicalItemToCart();
        await this.api.completeCustomerStepAsGuest();
        await this.api.completeShippingStepAndSkipBilling();
    }
}
