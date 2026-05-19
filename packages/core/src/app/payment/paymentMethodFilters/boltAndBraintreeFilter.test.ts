import { type PaymentMethod } from '@bigcommerce/checkout-sdk';

import { defaultCapabilities } from '@bigcommerce/checkout/contexts';
import { type PaymentMethodFilterContext } from '@bigcommerce/checkout/payment-integration-api';

import { getCheckout } from '../../checkout/checkouts.mock';
import { getStoreConfig } from '../../config/config.mock';
import { getPaymentMethod } from '../payment-methods.mock';
import { PaymentMethodId } from '../paymentMethod';

import { boltAndBraintreeFilter } from './boltAndBraintreeFilter';

describe('boltAndBraintreeFilter', () => {
    let context: PaymentMethodFilterContext;

    beforeEach(() => {
        context = {
            capabilities: defaultCapabilities,
            checkout: getCheckout(),
            checkoutSettings: getStoreConfig().checkoutSettings,
            getPaymentMethod: jest.fn(),
            paymentProviderCustomer: undefined,
        };
    });

    it('keeps Bolt when initializationData.showInCheckout is true', () => {
        const boltVisible: PaymentMethod = {
            ...getPaymentMethod(),
            id: PaymentMethodId.Bolt,
            initializationData: { showInCheckout: true },
        };

        expect(boltAndBraintreeFilter.apply([boltVisible], context)).toEqual([boltVisible]);
    });

    it('removes Bolt when initializationData.showInCheckout is false', () => {
        const boltHidden: PaymentMethod = {
            ...getPaymentMethod(),
            id: PaymentMethodId.Bolt,
            initializationData: { showInCheckout: false },
        };

        expect(boltAndBraintreeFilter.apply([boltHidden], context)).toEqual([]);
    });

    it('keeps Bolt when no initializationData is present', () => {
        const boltWithoutInitData: PaymentMethod = {
            ...getPaymentMethod(),
            id: PaymentMethodId.Bolt,
            initializationData: undefined,
        };

        expect(boltAndBraintreeFilter.apply([boltWithoutInitData], context)).toEqual([
            boltWithoutInitData,
        ]);
    });

    it('removes Braintree local payment methods', () => {
        const braintreeLocal: PaymentMethod = {
            ...getPaymentMethod(),
            id: PaymentMethodId.BraintreeLocalPaymentMethod,
        };

        expect(boltAndBraintreeFilter.apply([braintreeLocal], context)).toEqual([]);
    });

    it('keeps unrelated payment methods untouched', () => {
        const other: PaymentMethod = { ...getPaymentMethod(), id: 'authorizenet' };

        expect(boltAndBraintreeFilter.apply([other], context)).toEqual([other]);
    });

    it('filters a mixed list correctly', () => {
        const boltVisible: PaymentMethod = {
            ...getPaymentMethod(),
            id: PaymentMethodId.Bolt,
            initializationData: { showInCheckout: true },
        };
        const boltHidden: PaymentMethod = {
            ...getPaymentMethod(),
            id: PaymentMethodId.Bolt,
            initializationData: { showInCheckout: false },
        };
        const braintreeLocal: PaymentMethod = {
            ...getPaymentMethod(),
            id: PaymentMethodId.BraintreeLocalPaymentMethod,
        };
        const other: PaymentMethod = { ...getPaymentMethod(), id: 'authorizenet' };

        expect(
            boltAndBraintreeFilter.apply([boltVisible, boltHidden, braintreeLocal, other], context),
        ).toEqual([boltVisible, other]);
    });
});
