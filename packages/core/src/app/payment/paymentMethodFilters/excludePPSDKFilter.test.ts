import { type PaymentMethod } from '@bigcommerce/checkout-sdk';

import { defaultCapabilities } from '@bigcommerce/checkout/contexts';
import { type PaymentMethodFilterContext } from '@bigcommerce/checkout/payment-integration-api';

import { getCheckout } from '../../checkout/checkouts.mock';
import { getStoreConfig } from '../../config/config.mock';
import { getPaymentMethod } from '../payment-methods.mock';
import { PaymentMethodProviderType } from '../paymentMethod';

import { excludePPSDKFilter } from './excludePPSDKFilter';

describe('excludePPSDKFilter', () => {
    const ppsdkMethod: PaymentMethod = {
        ...getPaymentMethod(),
        id: 'ppsdk-provider',
        type: PaymentMethodProviderType.PPSDK,
    };
    const apiMethod: PaymentMethod = {
        ...getPaymentMethod(),
        id: 'authorizenet',
        type: PaymentMethodProviderType.Api,
    };

    const buildContext = (excludePPSDK: boolean): PaymentMethodFilterContext => ({
        capabilities: {
            ...defaultCapabilities,
            payment: { ...defaultCapabilities.payment, excludePPSDK },
        },
        checkout: getCheckout(),
        checkoutSettings: getStoreConfig().checkoutSettings,
        getPaymentMethod: jest.fn(),
        paymentProviderCustomer: undefined,
    });

    it('returns the original methods when capabilities.payment.excludePPSDK is false', () => {
        const methods = [ppsdkMethod, apiMethod];

        expect(excludePPSDKFilter.apply(methods, buildContext(false))).toEqual(methods);
    });

    it('removes PPSDK methods when capabilities.payment.excludePPSDK is true', () => {
        const methods = [ppsdkMethod, apiMethod];

        expect(excludePPSDKFilter.apply(methods, buildContext(true))).toEqual([apiMethod]);
    });
});
