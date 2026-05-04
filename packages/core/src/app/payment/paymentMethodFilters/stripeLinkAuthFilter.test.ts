import { type PaymentMethod } from '@bigcommerce/checkout-sdk';

import { defaultCapabilities } from '@bigcommerce/checkout/contexts';

import { getCheckout } from '../../checkout/checkouts.mock';
import { getStoreConfig } from '../../config/config.mock';
import { getPaymentMethod } from '../payment-methods.mock';
import { PaymentMethodId } from '../paymentMethod';

import { stripeLinkAuthFilter } from './stripeLinkAuthFilter';
import { type PaymentMethodFilterContext } from './types';

describe('stripeLinkAuthFilter', () => {
    let context: PaymentMethodFilterContext;
    let stripeUpeCard: PaymentMethod;
    let otherMethod: PaymentMethod;

    beforeEach(() => {
        stripeUpeCard = {
            ...getPaymentMethod(),
            id: 'card',
            gateway: PaymentMethodId.StripeUPE,
        };
        otherMethod = {
            ...getPaymentMethod(),
            id: PaymentMethodId.Bolt,
        };

        context = {
            capabilities: defaultCapabilities,
            checkout: getCheckout(),
            checkoutSettings: getStoreConfig().checkoutSettings,
            getPaymentMethod: jest.fn(),
            paymentProviderCustomer: undefined,
        };
    });

    it('returns the original methods when no payment provider customer is set', () => {
        const methods = [stripeUpeCard, otherMethod];

        expect(stripeLinkAuthFilter.apply(methods, context)).toEqual(methods);
    });

    it('returns the original methods when stripeLinkAuthenticationState is false', () => {
        const methods = [stripeUpeCard, otherMethod];

        expect(
            stripeLinkAuthFilter.apply(methods, {
                ...context,
                paymentProviderCustomer: { stripeLinkAuthenticationState: false },
            }),
        ).toEqual(methods);
    });

    it('keeps only Stripe UPE card method when authenticated and a Stripe UPE card method exists', () => {
        const methods = [stripeUpeCard, otherMethod];

        expect(
            stripeLinkAuthFilter.apply(methods, {
                ...context,
                paymentProviderCustomer: { stripeLinkAuthenticationState: true },
            }),
        ).toEqual([stripeUpeCard]);
    });

    it('falls back to the original methods when authenticated but no Stripe UPE card is available', () => {
        const methods = [otherMethod];

        expect(
            stripeLinkAuthFilter.apply(methods, {
                ...context,
                paymentProviderCustomer: { stripeLinkAuthenticationState: true },
            }),
        ).toEqual(methods);
    });

    it('does not match a Stripe UPE method whose id is not "card"', () => {
        const stripeUpeNonCard = {
            ...getPaymentMethod(),
            id: 'ideal',
            gateway: PaymentMethodId.StripeUPE,
        };
        const methods = [stripeUpeNonCard, otherMethod];

        expect(
            stripeLinkAuthFilter.apply(methods, {
                ...context,
                paymentProviderCustomer: { stripeLinkAuthenticationState: true },
            }),
        ).toEqual(methods);
    });
});
