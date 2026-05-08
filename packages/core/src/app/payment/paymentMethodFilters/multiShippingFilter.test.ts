import { type PaymentMethod } from '@bigcommerce/checkout-sdk';

import { defaultCapabilities } from '@bigcommerce/checkout/contexts';
import { type PaymentMethodFilterContext } from '@bigcommerce/checkout/payment-integration-api';

import { getCheckout } from '../../checkout/checkouts.mock';
import { getStoreConfig } from '../../config/config.mock';
import { getConsignment } from '../../shipping/consignment.mock';
import { getPaymentMethod } from '../payment-methods.mock';
import { PaymentMethodId } from '../paymentMethod';

import { multiShippingFilter } from './multiShippingFilter';

describe('multiShippingFilter', () => {
    const amazonPay: PaymentMethod = { ...getPaymentMethod(), id: PaymentMethodId.AmazonPay };
    const otherMethod: PaymentMethod = { ...getPaymentMethod(), id: 'authorizenet' };

    const buildContext = (consignmentCount: number): PaymentMethodFilterContext => ({
        capabilities: defaultCapabilities,
        checkout: {
            ...getCheckout(),
            consignments: Array.from({ length: consignmentCount }, () => getConsignment()),
        },
        checkoutSettings: getStoreConfig().checkoutSettings,
        getPaymentMethod: jest.fn(),
        paymentProviderCustomer: undefined,
    });

    it('returns the original methods when there are no consignments', () => {
        const methods = [amazonPay, otherMethod];

        expect(multiShippingFilter.apply(methods, buildContext(0))).toEqual(methods);
    });

    it('returns the original methods when there is exactly one consignment', () => {
        const methods = [amazonPay, otherMethod];

        expect(multiShippingFilter.apply(methods, buildContext(1))).toEqual(methods);
    });

    it('removes incompatible methods (e.g. Amazon Pay) when there are multiple consignments', () => {
        const methods = [amazonPay, otherMethod];

        expect(multiShippingFilter.apply(methods, buildContext(2))).toEqual([otherMethod]);
    });

    it('returns the original methods when checkout.consignments is undefined', () => {
        const context: PaymentMethodFilterContext = {
            capabilities: defaultCapabilities,
            checkout: { ...getCheckout(), consignments: undefined as never },
            checkoutSettings: getStoreConfig().checkoutSettings,
            getPaymentMethod: jest.fn(),
            paymentProviderCustomer: undefined,
        };
        const methods = [amazonPay, otherMethod];

        expect(multiShippingFilter.apply(methods, context)).toEqual(methods);
    });
});
