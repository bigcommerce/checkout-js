import { type PaymentMethod } from '@bigcommerce/checkout-sdk';

import { defaultCapabilities } from '@bigcommerce/checkout/contexts';
import { type PaymentMethodFilterContext } from '@bigcommerce/checkout/payment-integration-api';

import { getCheckout, getCheckoutPayment } from '../../checkout/checkouts.mock';
import { getStoreConfig } from '../../config/config.mock';
import { getConsignment } from '../../shipping/consignment.mock';
import { getPaymentMethod } from '../payment-methods.mock';
import { PaymentMethodId } from '../paymentMethod';

import { applyPaymentMethodFilters } from './applyPaymentMethodFilters';

describe('applyPaymentMethodFilters', () => {
    const amazon: PaymentMethod = { ...getPaymentMethod(), id: PaymentMethodId.AmazonPay };
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
    const stripeUpeCard: PaymentMethod = {
        ...getPaymentMethod(),
        id: 'card',
        gateway: PaymentMethodId.StripeUPE,
    };
    const authorizenet: PaymentMethod = { ...getPaymentMethod(), id: 'authorizenet' };

    const baseContext = (): PaymentMethodFilterContext => ({
        capabilities: defaultCapabilities,
        checkout: getCheckout(),
        checkoutSettings: getStoreConfig().checkoutSettings,
        getPaymentMethod: jest.fn(),
        paymentProviderCustomer: undefined,
    });

    it('removes Braintree local methods and hidden Bolt by default', () => {
        const result = applyPaymentMethodFilters(
            [boltHidden, braintreeLocal, authorizenet],
            baseContext(),
        );

        expect(result).toEqual([authorizenet]);
    });

    it('keeps a visible Bolt and unrelated methods', () => {
        const result = applyPaymentMethodFilters([boltVisible, authorizenet], baseContext());

        expect(result).toEqual([boltVisible, authorizenet]);
    });

    it('runs the multi-shipping filter when there is more than one consignment', () => {
        const context: PaymentMethodFilterContext = {
            ...baseContext(),
            checkout: {
                ...getCheckout(),
                consignments: [getConsignment(), getConsignment()],
            },
        };

        const result = applyPaymentMethodFilters([amazon, authorizenet], context);

        expect(result).toEqual([authorizenet]);
    });

    it('runs the stripe link auth filter when authenticated', () => {
        const context: PaymentMethodFilterContext = {
            ...baseContext(),
            paymentProviderCustomer: { stripeLinkAuthenticationState: true },
        };

        const result = applyPaymentMethodFilters([stripeUpeCard, authorizenet], context);

        expect(result).toEqual([stripeUpeCard]);
    });

    it('returns only the selected hosted method when one is already on the checkout', () => {
        const context: PaymentMethodFilterContext = {
            ...baseContext(),
            checkout: {
                ...getCheckout(),
                payments: [getCheckoutPayment('amazonpay')],
            },
            getPaymentMethod: jest.fn().mockReturnValue(amazon),
        };

        const result = applyPaymentMethodFilters([amazon, authorizenet], context);

        expect(result).toEqual([amazon]);
        expect(context.getPaymentMethod).toHaveBeenCalledWith('amazonpay', undefined);
    });

    it('returns the input untouched when no filter conditions apply', () => {
        const result = applyPaymentMethodFilters([authorizenet], baseContext());

        expect(result).toEqual([authorizenet]);
    });

    it('returns an empty list when given an empty list', () => {
        expect(applyPaymentMethodFilters([], baseContext())).toEqual([]);
    });
});
