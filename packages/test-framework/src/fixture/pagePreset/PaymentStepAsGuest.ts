import { Page } from '@playwright/test';

import { ApiRequestsSender } from './ApiRequestsSender';
import { CheckoutPagePreset } from './CheckoutPagePreset';

export class PaymentStepAsGuest implements CheckoutPagePreset {
    private readonly couponCode: string | undefined;

    constructor(couponCode: string) {
        this.couponCode = couponCode;
    }

    async apply(page: Page, args): Promise<void> {
        const api = new ApiRequestsSender(page);

        await api.addPhysicalItemToCart();

        if (this.couponCode) {
            await api.applyCouponCodeToCart();
            await api.dispose('You should be able to see coupon applied to cart now');
        }

        await api.completeCustomerStepAsGuest();
        await api.completeSingleShippingAndSkipToPaymentStep();
        await api.dispose('You should be able to see checkout at the payment step now');
    }
}
