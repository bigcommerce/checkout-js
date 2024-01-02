import { PaymentMethodId } from '@bigcommerce/checkout/payment-integration-api';

import isBraintreeConnectMethod from './is-braintree-connect-method';

describe('isBraintreeConnectMethod', () => {
    it('returns true if provided methodId is related to PayPal Connect', () => {
        expect(isBraintreeConnectMethod(PaymentMethodId.Braintree)).toBe(true);
        expect(isBraintreeConnectMethod(PaymentMethodId.BraintreeAcceleratedCheckout)).toBe(true);
    });

    it('returns false if provided methodId is not related to PayPal Connect', () => {
        expect(isBraintreeConnectMethod(PaymentMethodId.PayPalCommerceAcceleratedCheckout)).toBe(
            false,
        );
    });
});
