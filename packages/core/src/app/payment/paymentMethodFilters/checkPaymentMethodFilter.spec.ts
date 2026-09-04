import { type PaymentMethod } from '@bigcommerce/checkout-sdk';

import { defaultCapabilities } from '@bigcommerce/checkout/contexts';
import { type PaymentMethodFilterContext } from '@bigcommerce/checkout/payment-integration-api';

import { getCheckout } from '../../checkout/checkouts.mock';
import { getStoreConfig } from '../../config/config.mock';
import { getPaymentMethod, getPaypalCreditPaymentMethod } from '../payment-methods.mock';

import { checkPaymentMethodFilter } from './checkPaymentMethodFilter';

describe('checkPaymentMethodFilter', () => {
    let context: PaymentMethodFilterContext;

    it('hides check when capability is true', () => {
        context = {
            capabilities: {
                ...defaultCapabilities,
                payment: {
                    ...defaultCapabilities.payment,
                    hideCheckPaymentMethod: true,
                },
            },
            checkout: getCheckout(),
            checkoutSettings: getStoreConfig().checkoutSettings,
            getPaymentMethod: jest.fn(),
            paymentProviderCustomer: undefined,
        };

        const paypalMethod = getPaypalCreditPaymentMethod();

        const checkVisible: PaymentMethod = {
            ...getPaymentMethod(),
            id: 'cheque',
            initializationData: {},
        };

        expect(checkPaymentMethodFilter.apply([checkVisible, paypalMethod], context)).toEqual([
            paypalMethod,
        ]);
    });

    it('keeps check when capability is false', () => {
        context = {
            capabilities: {
                ...defaultCapabilities,
                payment: {
                    ...defaultCapabilities.payment,
                    hideCheckPaymentMethod: false,
                },
            },
            checkout: getCheckout(),
            checkoutSettings: getStoreConfig().checkoutSettings,
            getPaymentMethod: jest.fn(),
            paymentProviderCustomer: undefined,
        };

        const paypalMethod = getPaypalCreditPaymentMethod();

        const checkVisible: PaymentMethod = {
            ...getPaymentMethod(),
            id: 'cheque',
            initializationData: {},
        };

        expect(checkPaymentMethodFilter.apply([checkVisible, paypalMethod], context)).toEqual([
            checkVisible,
            paypalMethod,
        ]);
    });
});
