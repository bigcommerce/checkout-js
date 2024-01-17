import isPayPalConnectAcceleratedCheckoutCustomer from './is-paypal-connect-payment-provider-customer';

describe('isPayPalConnectAcceleratedCheckoutCustomer', () => {
    it('returns true if payment provider customer is PayPalCommerce related', () => {
        const paymentProviderCustomer = {
            authenticationState: 'success',
            addresses: [],
            instruments: [],
        };

        expect(isPayPalConnectAcceleratedCheckoutCustomer(paymentProviderCustomer)).toBe(true);
    });

    it('returns false if payment provider customer is not PayPal Connect related', () => {
        const paymentProviderCustomer = {};

        expect(isPayPalConnectAcceleratedCheckoutCustomer(paymentProviderCustomer)).toBe(false);
    });
});
