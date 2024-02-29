import { PaymentMethodId } from '@bigcommerce/checkout/payment-integration-api';

import isBraintreeFastlaneMethod from './is-braintree-fastlane-method';

describe('isBraintreeConnectMethod', () => {
    it('returns true if provided methodId is related to PayPal Connect', () => {
        expect(isBraintreeFastlaneMethod(PaymentMethodId.Braintree)).toBe(true);
        expect(isBraintreeFastlaneMethod(PaymentMethodId.BraintreeAcceleratedCheckout)).toBe(true);
    });

    it('returns false if provided methodId is not related to PayPal Connect', () => {
        expect(isBraintreeFastlaneMethod(PaymentMethodId.PayPalCommerceAcceleratedCheckout)).toBe(
            false,
        );
    });
});
