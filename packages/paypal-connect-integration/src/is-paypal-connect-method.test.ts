import { PaymentMethodId } from '@bigcommerce/checkout/payment-integration-api';

import isPaypalConnectMethod from './is-paypal-connect-method';

describe('isPaypalConnectMethod', () => {
    it('returns true if provided methodId is related to PayPal Connect', () => {
        expect(isPaypalConnectMethod(PaymentMethodId.BraintreeAcceleratedCheckout)).toBe(true);
    });

    it('returns false if provided methodId is not related to PayPal Connect', () => {
        expect(isPaypalConnectMethod(PaymentMethodId.AdyenV3)).toBe(false);
    });
});
