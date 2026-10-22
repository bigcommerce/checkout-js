import { createLanguageService, type PaymentMethod } from '@bigcommerce/checkout-sdk';

import { FALLBACK_TRANSLATIONS } from '@bigcommerce/checkout/locale';
import { getPaymentMethod } from '@bigcommerce/checkout/test-mocks';

import { getAutoVaultingMethodNames } from './getAutoVaultingMethodNames';

describe('getAutoVaultingMethodNames', () => {
    const language = createLanguageService({ defaultTranslations: FALLBACK_TRANSLATIONS });

    const createMethod = (
        id: string,
        method: string,
        shouldVaultAllPayments?: boolean,
    ): PaymentMethod => ({
        ...getPaymentMethod(),
        id,
        method,
        config: { ...getPaymentMethod().config, displayName: '', shouldVaultAllPayments },
    });

    it('returns translated names of requested auto-vaulting methods in button order', () => {
        const paymentMethods = [
            createMethod('googlepaystripeocs', 'googlepay', true),
            createMethod('paypalcommerce', 'paypal'),
            createMethod('applepay', 'credit-card', true),
        ];

        expect(
            getAutoVaultingMethodNames(
                language,
                ['applepay', 'paypalcommerce', 'googlepaystripeocs'],
                paymentMethods,
            ),
        ).toBe('Apple Pay or Google Pay');
    });

    it('joins names using the shopper locale', () => {
        const germanLanguage = createLanguageService({
            locale: 'de',
            defaultTranslations: FALLBACK_TRANSLATIONS,
            translations: { payment: { apple_pay_name_text: 'Apple Pay' } },
        });
        const paymentMethods = [
            createMethod('applepay', 'credit-card', true),
            createMethod('googlepaystripeocs', 'googlepay', true),
        ];

        expect(
            getAutoVaultingMethodNames(
                germanLanguage,
                ['applepay', 'googlepaystripeocs'],
                paymentMethods,
            ),
        ).toBe('Apple Pay oder Google Pay');
    });

    it('ignores auto-vaulting methods that are not requested', () => {
        const paymentMethods = [
            createMethod('paypalcommerce', 'paypal'),
            createMethod('stripeupe', 'card', true),
        ];

        expect(getAutoVaultingMethodNames(language, ['paypalcommerce'], paymentMethods)).toBe('');
    });

    it('returns each name once', () => {
        const paymentMethods = [
            createMethod('googlepaystripeocs', 'googlepay', true),
            createMethod('googlepaybraintree', 'googlepay', true),
        ];

        expect(
            getAutoVaultingMethodNames(
                language,
                ['googlepaystripeocs', 'googlepaybraintree'],
                paymentMethods,
            ),
        ).toBe('Google Pay');
    });

    it('returns no names when payment methods are not loaded', () => {
        expect(getAutoVaultingMethodNames(language, ['applepay'])).toBe('');
    });
});
