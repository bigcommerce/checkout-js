import { type PaymentMethod } from '@bigcommerce/checkout-sdk';

import { defaultCapabilities } from '@bigcommerce/checkout/contexts';
import { type PaymentMethodFilterContext } from '@bigcommerce/checkout/payment-integration-api';

import { getCheckout, getCheckoutPayment } from '../../checkout/checkouts.mock';
import { getStoreConfig } from '../../config/config.mock';
import { getPaymentMethod } from '../payment-methods.mock';
import { PaymentMethodProviderType } from '../paymentMethod';

import { selectedHostedPaymentFilter } from './selectedHostedPaymentFilter';

describe('selectedHostedPaymentFilter', () => {
    const amazon: PaymentMethod = { ...getPaymentMethod(), id: 'amazonpay' };
    const other: PaymentMethod = { ...getPaymentMethod(), id: 'authorizenet' };

    it('returns the original methods when no payments are present on the checkout', () => {
        const context: PaymentMethodFilterContext = {
            capabilities: defaultCapabilities,
            checkout: { ...getCheckout(), payments: undefined },
            checkoutSettings: getStoreConfig().checkoutSettings,
            getPaymentMethod: jest.fn(),
            paymentProviderCustomer: undefined,
        };
        const methods = [amazon, other];

        expect(selectedHostedPaymentFilter.apply(methods, context)).toEqual(methods);
    });

    it('returns the original methods when only non-hosted payments are on the checkout', () => {
        const context: PaymentMethodFilterContext = {
            capabilities: defaultCapabilities,
            checkout: {
                ...getCheckout(),
                payments: [
                    {
                        ...getCheckoutPayment(),
                        providerType: PaymentMethodProviderType.Api,
                    },
                ],
            },
            checkoutSettings: getStoreConfig().checkoutSettings,
            getPaymentMethod: jest.fn(),
            paymentProviderCustomer: undefined,
        };
        const methods = [amazon, other];

        expect(selectedHostedPaymentFilter.apply(methods, context)).toEqual(methods);
    });

    it('returns only the selected hosted method when it is resolvable from the registry', () => {
        const getPaymentMethodMock = jest.fn().mockReturnValue(amazon);
        const context: PaymentMethodFilterContext = {
            capabilities: defaultCapabilities,
            checkout: {
                ...getCheckout(),
                payments: [getCheckoutPayment('amazonpay')],
            },
            checkoutSettings: getStoreConfig().checkoutSettings,
            getPaymentMethod: getPaymentMethodMock,
            paymentProviderCustomer: undefined,
        };

        expect(selectedHostedPaymentFilter.apply([amazon, other], context)).toEqual([amazon]);
        expect(getPaymentMethodMock).toHaveBeenCalledWith('amazonpay', undefined);
    });

    it('returns the original methods when the selected hosted method cannot be resolved', () => {
        const context: PaymentMethodFilterContext = {
            capabilities: defaultCapabilities,
            checkout: {
                ...getCheckout(),
                payments: [getCheckoutPayment('amazonpay')],
            },
            checkoutSettings: getStoreConfig().checkoutSettings,
            getPaymentMethod: jest.fn().mockReturnValue(undefined),
            paymentProviderCustomer: undefined,
        };
        const methods = [amazon, other];

        expect(selectedHostedPaymentFilter.apply(methods, context)).toEqual(methods);
    });
});
