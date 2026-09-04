import { type PaymentMethod } from '@bigcommerce/checkout-sdk';

import { defaultCapabilities } from '@bigcommerce/checkout/contexts';

import { getCheckout, getCheckoutPayment } from '../../checkout/checkouts.mock';
import { getStoreConfig } from '../../config/config.mock';
import { getPaymentMethod } from '../payment-methods.mock';
import { PaymentMethodId } from '../paymentMethod';

import { getFilteredPaymentMethodsWithDefault } from './getFilteredPaymentMethodsWithDefault';

describe('getFilteredPaymentMethodsWithDefault', () => {
    const checkoutSettings = getStoreConfig().checkoutSettings;

    const buildMethod = (overrides: Partial<PaymentMethod>): PaymentMethod => ({
        ...getPaymentMethod(),
        ...overrides,
    });

    it('applies the filter pipeline and returns the filtered list', () => {
        const braintreeLocal = buildMethod({ id: PaymentMethodId.BraintreeLocalPaymentMethod });
        const authorizenet = buildMethod({ id: 'authorizenet' });

        const { filteredMethods } = getFilteredPaymentMethodsWithDefault({
            capabilities: defaultCapabilities,
            checkout: getCheckout(),
            checkoutSettings,
            getPaymentMethod: jest.fn(),
            methods: [braintreeLocal, authorizenet],
        });

        expect(filteredMethods).toEqual([authorizenet]);
    });

    it('selects the first filtered method as default when nothing else qualifies', () => {
        const first = buildMethod({ id: 'authorizenet' });
        const second = buildMethod({ id: 'paypalexpress' });

        const { defaultMethod } = getFilteredPaymentMethodsWithDefault({
            capabilities: defaultCapabilities,
            checkout: getCheckout(),
            checkoutSettings,
            getPaymentMethod: jest.fn(),
            methods: [first, second],
        });

        expect(defaultMethod).toEqual(first);
    });

    it('selects the method with a default stored instrument as default', () => {
        const plain = buildMethod({ id: 'authorizenet' });
        const withDefault = buildMethod({
            id: 'paypalexpress',
            config: { ...getPaymentMethod().config, hasDefaultStoredInstrument: true },
        });

        const { defaultMethod } = getFilteredPaymentMethodsWithDefault({
            capabilities: defaultCapabilities,
            checkout: getCheckout(),
            checkoutSettings,
            getPaymentMethod: jest.fn(),
            methods: [plain, withDefault],
        });

        expect(defaultMethod).toEqual(withDefault);
    });

    it('returns the selected hosted method as both the only option and the default', () => {
        const amazon = buildMethod({ id: 'amazonpay' });
        const checkout = {
            ...getCheckout(),
            payments: [getCheckoutPayment('amazonpay')],
        };

        const { defaultMethod, filteredMethods } = getFilteredPaymentMethodsWithDefault({
            capabilities: defaultCapabilities,
            checkout,
            checkoutSettings,
            getPaymentMethod: jest.fn().mockReturnValue(amazon),
            methods: [amazon, buildMethod({ id: 'authorizenet' })],
        });

        expect(filteredMethods).toEqual([amazon]);
        expect(defaultMethod).toEqual(amazon);
    });

    it('prefers the selected hosted method over a method with hasDefaultStoredInstrument', () => {
        const amazon = buildMethod({ id: 'amazonpay' });
        const cardWithDefault = buildMethod({
            id: 'authorizenet',
            config: { ...getPaymentMethod().config, hasDefaultStoredInstrument: true },
        });
        const checkout = {
            ...getCheckout(),
            payments: [getCheckoutPayment('amazonpay')],
        };

        const { defaultMethod } = getFilteredPaymentMethodsWithDefault({
            capabilities: defaultCapabilities,
            checkout,
            checkoutSettings,
            getPaymentMethod: jest.fn().mockReturnValue(amazon),
            methods: [amazon, cardWithDefault],
        });

        expect(defaultMethod).toEqual(amazon);
    });

    it('honours stripe link authentication by collapsing to Stripe UPE card method', () => {
        const stripeUpeCard = buildMethod({
            id: 'card',
            gateway: PaymentMethodId.StripeUPE,
        });
        const other = buildMethod({ id: 'authorizenet' });

        const { defaultMethod, filteredMethods } = getFilteredPaymentMethodsWithDefault({
            capabilities: defaultCapabilities,
            checkout: getCheckout(),
            checkoutSettings,
            getPaymentMethod: jest.fn(),
            methods: [stripeUpeCard, other],
            paymentProviderCustomer: { stripeLinkAuthenticationState: true },
        });

        expect(filteredMethods).toEqual([stripeUpeCard]);
        expect(defaultMethod).toEqual(stripeUpeCard);
    });

    it('returns an undefined defaultMethod when filtering produces no methods', () => {
        const braintreeLocal = buildMethod({ id: PaymentMethodId.BraintreeLocalPaymentMethod });

        const { defaultMethod, filteredMethods } = getFilteredPaymentMethodsWithDefault({
            capabilities: defaultCapabilities,
            checkout: getCheckout(),
            checkoutSettings,
            getPaymentMethod: jest.fn(),
            methods: [braintreeLocal],
        });

        expect(filteredMethods).toEqual([]);
        expect(defaultMethod).toBeUndefined();
    });

    it('groups facilypay_* methods when PAYMENTS-5142.payment_method_grouping is enabled', () => {
        const facilypay3 = buildMethod({
            id: 'facilypay_3',
            config: { ...getPaymentMethod().config, displayName: '3x Oney' },
        });
        const facilypay6 = buildMethod({
            id: 'facilypay_6',
            config: { ...getPaymentMethod().config, displayName: '6x Oney' },
        });
        const card = buildMethod({
            id: 'card',
            config: { ...getPaymentMethod().config, displayName: 'Card' },
        });
        const checkoutSettingsWithGrouping = {
            ...checkoutSettings,
            features: {
                ...checkoutSettings.features,
                'PAYMENTS-5142.payment_method_grouping': true,
            },
        };

        const { defaultMethod, filteredMethods } = getFilteredPaymentMethodsWithDefault({
            capabilities: defaultCapabilities,
            checkout: getCheckout(),
            checkoutSettings: checkoutSettingsWithGrouping,
            getPaymentMethod: jest.fn(),
            methods: [card, facilypay6, facilypay3],
        });

        expect(filteredMethods.map((m) => m.id)).toEqual(['card', 'facilypay_3']);

        const grouped = filteredMethods.find((m) => m.id === 'facilypay_3');

        expect(grouped?.initializationData).toEqual(
            expect.objectContaining({
                groupedMethods: [facilypay3, facilypay6],
            }),
        );
        expect(defaultMethod).toEqual(card);
    });

    it('does not group facilypay_* methods when PAYMENTS-5142.payment_method_grouping is disabled', () => {
        const facilypay3 = buildMethod({
            id: 'facilypay_3',
            config: { ...getPaymentMethod().config, displayName: '3x Oney' },
        });
        const facilypay6 = buildMethod({
            id: 'facilypay_6',
            config: { ...getPaymentMethod().config, displayName: '6x Oney' },
        });
        const checkoutSettingsWithoutGrouping = {
            ...checkoutSettings,
            features: {
                ...checkoutSettings.features,
                'PAYMENTS-5142.payment_method_grouping': false,
            },
        };

        const { filteredMethods } = getFilteredPaymentMethodsWithDefault({
            capabilities: defaultCapabilities,
            checkout: getCheckout(),
            checkoutSettings: checkoutSettingsWithoutGrouping,
            getPaymentMethod: jest.fn(),
            methods: [facilypay6, facilypay3],
        });

        expect(filteredMethods).toEqual([facilypay6, facilypay3]);
    });
});
