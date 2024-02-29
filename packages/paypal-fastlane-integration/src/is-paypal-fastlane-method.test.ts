import { PaymentMethodId } from '@bigcommerce/checkout/payment-integration-api';

import isPayPalFastlaneMethod from './is-paypal-fastlane-method';

describe('isPayPalFastlaneMethod', () => {
    it('returns true if provided methodId is related to PayPal Fastlane', () => {
        expect(isPayPalFastlaneMethod(PaymentMethodId.BraintreeAcceleratedCheckout)).toBe(true);
        expect(isPayPalFastlaneMethod(PaymentMethodId.PayPalCommerceAcceleratedCheckout)).toBe(
            true,
        );
    });

    it('returns false if provided methodId is not related to PayPal Fastlane', () => {
        expect(isPayPalFastlaneMethod(PaymentMethodId.AdyenV3)).toBe(false);
    });
});
