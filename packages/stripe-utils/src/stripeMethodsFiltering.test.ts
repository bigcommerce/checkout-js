import { type PaymentMethod } from '@bigcommerce/checkout-sdk';

import { defaultCapabilities } from '@bigcommerce/checkout/contexts';
import {
    type PaymentMethodFilterContext,
    PaymentMethodId,
} from '@bigcommerce/checkout/payment-integration-api';
import { getCheckout, getPaymentMethod, getStoreConfig } from '@bigcommerce/checkout/test-mocks';

import stripeMethodsFiltering from './stripeMethodsFiltering';

describe('stripeLinkAuthFilter', () => {
    let context: PaymentMethodFilterContext;
    let stripeUpeCard: PaymentMethod;
    let otherMethod: PaymentMethod;

    describe('stripeLinkAuthenticationState', () => {
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

            expect(stripeMethodsFiltering.apply(methods, context)).toEqual(methods);
        });

        it('returns the original methods when stripeLinkAuthenticationState is false', () => {
            const methods = [stripeUpeCard, otherMethod];

            expect(
                stripeMethodsFiltering.apply(methods, {
                    ...context,
                    paymentProviderCustomer: { stripeLinkAuthenticationState: false },
                }),
            ).toEqual(methods);
        });

        it('keeps only Stripe UPE card method when authenticated and a Stripe UPE card method exists', () => {
            const methods = [stripeUpeCard, otherMethod];

            expect(
                stripeMethodsFiltering.apply(methods, {
                    ...context,
                    paymentProviderCustomer: { stripeLinkAuthenticationState: true },
                }),
            ).toEqual([stripeUpeCard]);
        });

        it('falls back to the original methods when authenticated but no Stripe UPE card is available', () => {
            const methods = [otherMethod];

            expect(
                stripeMethodsFiltering.apply(methods, {
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
                stripeMethodsFiltering.apply(methods, {
                    ...context,
                    paymentProviderCustomer: { stripeLinkAuthenticationState: true },
                }),
            ).toEqual(methods);
        });
    });

    describe('stripeAdaptivePricingCurrencySwitch', () => {
        let stripeOcsCheckoutSession: PaymentMethod;

        beforeEach(() => {
            stripeOcsCheckoutSession = {
                ...getPaymentMethod(),
                id: 'checkout_session',
                gateway: PaymentMethodId.StripeOCS,
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
            const methods = [stripeOcsCheckoutSession, otherMethod];

            expect(stripeMethodsFiltering.apply(methods, context)).toEqual(methods);
        });

        it('returns the original methods when isCustomerCurrencySelected is false', () => {
            const methods = [stripeOcsCheckoutSession, otherMethod];

            expect(
                stripeMethodsFiltering.apply(methods, {
                    ...context,
                    paymentProviderCustomer: { isCustomerCurrencySelected: false },
                }),
            ).toEqual(methods);
        });

        it('keeps only Stripe OCS checkout_session method when currency is selected and a Stripe OCS checkout_session method exists', () => {
            const methods = [stripeOcsCheckoutSession, otherMethod];

            expect(
                stripeMethodsFiltering.apply(methods, {
                    ...context,
                    paymentProviderCustomer: { isCustomerCurrencySelected: true },
                }),
            ).toEqual([stripeOcsCheckoutSession]);
        });

        it('falls back to the original methods when currency is selected but no Stripe OCS checkout_session is available', () => {
            const methods = [otherMethod];

            expect(
                stripeMethodsFiltering.apply(methods, {
                    ...context,
                    paymentProviderCustomer: { isCustomerCurrencySelected: true },
                }),
            ).toEqual(methods);
        });

        it('does not match a Stripe OCS method whose id is not "checkout_session"', () => {
            const stripeOcsNonCheckoutSession = {
                ...getPaymentMethod(),
                id: 'card',
                gateway: PaymentMethodId.StripeOCS,
            };
            const methods = [stripeOcsNonCheckoutSession, otherMethod];

            expect(
                stripeMethodsFiltering.apply(methods, {
                    ...context,
                    paymentProviderCustomer: { isCustomerCurrencySelected: true },
                }),
            ).toEqual(methods);
        });

        it('does not match a checkout_session method whose gateway is not Stripe OCS', () => {
            const nonStripeOcsCheckoutSession = {
                ...getPaymentMethod(),
                id: 'checkout_session',
                gateway: PaymentMethodId.StripeUPE,
            };
            const methods = [nonStripeOcsCheckoutSession, otherMethod];

            expect(
                stripeMethodsFiltering.apply(methods, {
                    ...context,
                    paymentProviderCustomer: { isCustomerCurrencySelected: true },
                }),
            ).toEqual(methods);
        });
    });
});
