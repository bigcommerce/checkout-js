import getProviderWithCustomCheckout from './getProviderWithCustomCheckout';
import { PaymentMethodId } from './paymentMethod';

describe('getProviderWithCustomCheckout', () => {
    it('returns provided method id', () => {
        const providerWithCustomCheckout = getProviderWithCustomCheckout(PaymentMethodId.StripeUPE);

        expect(providerWithCustomCheckout).toEqual(PaymentMethodId.StripeUPE);
    });

    it('returns undefined if method id is null or it is not provided', () => {
        expect(getProviderWithCustomCheckout(null)).toBeUndefined();
        expect(getProviderWithCustomCheckout()).toBeUndefined();
    });

    it('returns mapped method id', () => {
        const providerWithCustomCheckout = getProviderWithCustomCheckout(PaymentMethodId.PaypalCommerce);

        expect(providerWithCustomCheckout).toEqual(PaymentMethodId.PayPalCommerceAcceleratedCheckout);
    });
});
