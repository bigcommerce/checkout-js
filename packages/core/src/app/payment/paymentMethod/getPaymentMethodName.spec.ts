import { createLanguageService, LanguageService } from '@bigcommerce/checkout-sdk';

import { FALLBACK_TRANSLATIONS } from '@bigcommerce/checkout/locale';

import { getPaymentMethod } from '../payment-methods.mock';

import getPaymentMethodName from './getPaymentMethodName';
import PaymentMethodId from './PaymentMethodId';

describe('getPaymentMethodName()', () => {
    let language: LanguageService;

    beforeEach(() => {
        language = createLanguageService({ defaultTranslations: FALLBACK_TRANSLATIONS });
    });

    it('returns configured display name if method does not have specific translated name', () => {
        const method = getPaymentMethod();

        expect(getPaymentMethodName(language)(method)).toEqual(method.config.displayName);
    });

    it('does not return specific translated name if method is multi-option method', () => {
        const method = {
            ...getPaymentMethod(),
            id: PaymentMethodId.Afterpay,
            method: 'multi-option',
        };

        expect(getPaymentMethodName(language)(method)).toEqual(method.config.displayName);
    });

    it('returns specific translated name for Amazon', () => {
        const method = {
            ...getPaymentMethod(),
            id: 'amazonpay',
            method: 'widget',
            config: { displayName: '' },
        };

        expect(getPaymentMethodName(language)(method)).toEqual(
            language.translate('payment.amazon_name_text'),
        );
    });

    it('returns specific display name for Clearpay', () => {
        const method = {
            ...getPaymentMethod(),
            id: PaymentMethodId.Clearpay,
            method: 'multi-option',
        };

        expect(getPaymentMethodName(language)(method)).toEqual(method.config.displayName);
    });

    it('returns specific translated name for Klarna', () => {
        const method = {
            ...getPaymentMethod(),
            id: 'klarna',
            method: 'widget',
            config: { displayName: '' },
        };

        expect(getPaymentMethodName(language)(method)).toEqual(
            language.translate('payment.klarna_name_text'),
        );
    });

    it('returns specific translated name for PayPal', () => {
        const method = {
            ...getPaymentMethod(),
            id: 'paypalexpress',
            method: 'paypal',
            config: { displayName: '' },
        };

        expect(getPaymentMethodName(language)(method)).toEqual(
            language.translate('payment.paypal_name_text'),
        );
    });

    it('returns specific translated name for PayPal Credit', () => {
        const method = {
            ...getPaymentMethod(),
            id: 'paypalexpresscredit',
            method: 'paypal-credit',
            config: { displayName: '' },
        };

        expect(getPaymentMethodName(language)(method)).toEqual(
            language.translate('payment.paypal_credit_name_text'),
        );
    });

    it('returns specific translated name for ChasePay', () => {
        const method = {
            ...getPaymentMethod(),
            id: 'chasepay',
            method: 'chasepay',
            config: { displayName: '' },
        };

        expect(getPaymentMethodName(language)(method)).toEqual(
            language.translate('payment.chasepay_name_text'),
        );
    });

    it('returns specific translated name for Visa Checkout', () => {
        const method = {
            ...getPaymentMethod(),
            id: 'braintreevisacheckout',
            method: 'visa-checkout',
            config: { displayName: '' },
        };

        expect(getPaymentMethodName(language)(method)).toEqual(
            language.translate('payment.vco_name_text'),
        );
    });

    it('returns specific translated name for Google Pay', () => {
        const method = {
            ...getPaymentMethod(),
            id: 'googlepaybraintree',
            method: 'googlepay',
            config: { displayName: '' },
        };

        expect(getPaymentMethodName(language)(method)).toEqual(
            language.translate('payment.google_pay_name_text'),
        );
    });
});
