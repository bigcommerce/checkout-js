import { Checkout, StoreConfig } from '@bigcommerce/checkout-sdk';

import { getCheckout, getCheckoutPayment, getStoreConfig } from '@bigcommerce/checkout/test-mocks';

import * as getPreselectedPayment from '../payment/getPreselectedPayment';
import { PaymentMethodId } from '../payment/paymentMethod';

import getShippingMethodId from './getShippingMethodId';

describe('getShippingMethodId', () => {
    const checkoutDefault = getCheckout();
    const configDefault = getStoreConfig();

    const mockOptions = (
        providerWithCustomCheckout: string | null = null,
        preselectedPaymentId?: string,
    ): [Checkout, StoreConfig] => {
        const config = {
            ...configDefault,
            checkoutSettings: {
                ...configDefault.checkoutSettings,
                providerWithCustomCheckout,
            }
        }

        jest.spyOn(getPreselectedPayment, 'default').mockReturnValue(
            preselectedPaymentId
                ? {
                    ...getCheckoutPayment(),
                    providerId: preselectedPaymentId,
                }
                : undefined,

        );

        return [checkoutDefault, config];
    }

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('returns no shipping method ID if no preselected payment method and no provider with custom checkout', () => {
        const [checkout, config] = mockOptions();

        expect(getShippingMethodId(checkout, config)).toBeUndefined();
    });

    it('returns shipping method id from provider with custom checkout', () => {
        const [checkout, config] = mockOptions(PaymentMethodId.BraintreeAcceleratedCheckout);

        expect(getShippingMethodId(checkout, config)).toBe(PaymentMethodId.BraintreeAcceleratedCheckout);
    });

    it('returns shipping method id from provider with custom checkout (PayPal Commerce Accelerated Checkout check)', () => {
        const [checkout, config] = mockOptions(PaymentMethodId.PayPalCommerceAcceleratedCheckout);

        expect(getShippingMethodId(checkout, config)).toBe(PaymentMethodId.PayPalCommerceAcceleratedCheckout);
    });

    it('returns shipping method id from preselected payment method', () => {
        const [checkout, config] = mockOptions(
            PaymentMethodId.BraintreeAcceleratedCheckout,
            PaymentMethodId.AmazonPay,
        );

        expect(getShippingMethodId(checkout, config)).toBe(PaymentMethodId.AmazonPay);
    });
});
