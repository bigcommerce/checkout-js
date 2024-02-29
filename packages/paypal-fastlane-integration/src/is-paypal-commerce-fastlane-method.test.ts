import { PaymentMethodId } from '@bigcommerce/checkout/payment-integration-api';

import isPayPalCommerceFastlaneMethod from './is-paypal-commerce-fastlane-method';

describe('isPayPalCommerceFastlaneMethod', () => {
    it('returns true if provided methodId is related to PayPal Fastlane', () => {
        expect(isPayPalCommerceFastlaneMethod(PaymentMethodId.PaypalCommerceCreditCards)).toBe(
            true,
        );
        expect(
            isPayPalCommerceFastlaneMethod(PaymentMethodId.PayPalCommerceAcceleratedCheckout),
        ).toBe(true);
    });

    it('returns false if provided methodId is not related to PayPal Fastlane', () => {
        expect(isPayPalCommerceFastlaneMethod(PaymentMethodId.Braintree)).toBe(false);
    });
});
