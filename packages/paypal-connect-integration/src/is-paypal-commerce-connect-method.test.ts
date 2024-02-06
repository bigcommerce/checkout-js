import { PaymentMethodId } from '@bigcommerce/checkout/payment-integration-api';

import isPayPalCommerceConnectMethod from './is-paypal-commerce-connect-method';

describe('isPaypalCommerceConnectMethod', () => {
    it('returns true if provided methodId is related to PayPal Connect', () => {
        expect(isPayPalCommerceConnectMethod(PaymentMethodId.PaypalCommerceCreditCards)).toBe(true);
        expect(
            isPayPalCommerceConnectMethod(PaymentMethodId.PayPalCommerceAcceleratedCheckout),
        ).toBe(true);
    });

    it('returns false if provided methodId is not related to PayPal Connect', () => {
        expect(isPayPalCommerceConnectMethod(PaymentMethodId.Braintree)).toBe(false);
    });
});
