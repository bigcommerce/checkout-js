import { type PaymentMethod, type PaymentProviderCustomer } from '@bigcommerce/checkout-sdk';

import stripeMethodsFiltering from './StripeMethodsFiltering';

describe('stripeMethodsFiltering', () => {
    const offlineMethod = {
        id: 'instore',
        gateway: undefined,
        config: { displayName: 'Pay in Store' },
    } as unknown as PaymentMethod;

    const stripeUpeCard = {
        id: 'card',
        gateway: 'stripeupe',
        config: { displayName: 'Stripe Card' },
    } as unknown as PaymentMethod;

    const stripeOcsCheckoutSession = {
        id: 'checkout_session',
        gateway: 'stripeocs',
        config: { displayName: 'Stripe OCS' },
    } as unknown as PaymentMethod;

    it('returns methods unchanged when paymentProviderCustomer is undefined', () => {
        const methods = [offlineMethod, stripeUpeCard, stripeOcsCheckoutSession];

        expect(stripeMethodsFiltering(methods)).toEqual(methods);
    });

    it('returns methods unchanged when paymentProviderCustomer has no stripe flags', () => {
        const methods = [offlineMethod, stripeUpeCard, stripeOcsCheckoutSession];
        const providerCustomer = {} as PaymentProviderCustomer;

        expect(stripeMethodsFiltering(methods, providerCustomer)).toEqual(methods);
    });

    it('filters to only Stripe UPE card method when stripeLinkAuthenticationState is set', () => {
        const methods = [offlineMethod, stripeUpeCard, stripeOcsCheckoutSession];
        const providerCustomer = {
            stripeLinkAuthenticationState: true,
        } as unknown as PaymentProviderCustomer;

        expect(stripeMethodsFiltering(methods, providerCustomer)).toEqual([stripeUpeCard]);
    });

    it('returns all methods when stripeLinkAuthenticationState is set but no Stripe UPE card exists', () => {
        const methods = [offlineMethod, stripeOcsCheckoutSession];
        const providerCustomer = {
            stripeLinkAuthenticationState: true,
        } as unknown as PaymentProviderCustomer;

        expect(stripeMethodsFiltering(methods, providerCustomer)).toEqual(methods);
    });

    it('filters to only Stripe OCS checkout_session method when isCustomerCurrencySelected is set', () => {
        const methods = [offlineMethod, stripeUpeCard, stripeOcsCheckoutSession];
        const providerCustomer = {
            isCustomerCurrencySelected: true,
        } as unknown as PaymentProviderCustomer;

        expect(stripeMethodsFiltering(methods, providerCustomer)).toEqual([
            stripeOcsCheckoutSession,
        ]);
    });

    it('returns all methods when isCustomerCurrencySelected is set but no Stripe OCS method exists', () => {
        const methods = [offlineMethod, stripeUpeCard];
        const providerCustomer = {
            isCustomerCurrencySelected: true,
        } as unknown as PaymentProviderCustomer;

        expect(stripeMethodsFiltering(methods, providerCustomer)).toEqual(methods);
    });

    it('filters to Stripe UPE card when both flags are set since stripeLinkAuthenticationState is applied first', () => {
        const methods = [offlineMethod, stripeUpeCard, stripeOcsCheckoutSession];
        const providerCustomer = {
            stripeLinkAuthenticationState: true,
            isCustomerCurrencySelected: true,
        } as unknown as PaymentProviderCustomer;

        expect(stripeMethodsFiltering(methods, providerCustomer)).toEqual([stripeUpeCard]);
    });

    it('returns empty array when given empty methods', () => {
        expect(stripeMethodsFiltering([])).toEqual([]);
    });
});
