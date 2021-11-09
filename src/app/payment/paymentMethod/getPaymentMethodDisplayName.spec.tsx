import { createLanguageService, LanguageService } from '@bigcommerce/checkout-sdk';

import { FALLBACK_TRANSLATIONS } from '../../locale/translations';
import { getPaymentMethod } from '../payment-methods.mock';

import getPaymentMethodDisplayName from './getPaymentMethodDisplayName';
import PaymentMethodId from './PaymentMethodId';

describe('getPaymentMethodDisplayName()', () => {
    let language: LanguageService;

    beforeEach(() => {
        language = createLanguageService({ defaultTranslations: FALLBACK_TRANSLATIONS });
    });

    it('returns configured display name', () => {
        const method = getPaymentMethod();

        expect(getPaymentMethodDisplayName(language)(method))
            .toEqual(method.config.displayName);
    });

    it('returns translated "Credit card" display name', () => {
        const method = { ...getPaymentMethod(), config: { displayName: 'Credit Card' } };

        expect(getPaymentMethodDisplayName(language)(method))
            .toEqual(language.translate('payment.credit_card_text'));
    });

    it('returns translated display name for AdyenV2 if the value is "Credit card"', () => {
        const method = { ...getPaymentMethod(), id: PaymentMethodId.AdyenV2, config: { displayName: 'Credit Card' } };

        expect(getPaymentMethodDisplayName(language)(method))
            .toEqual(language.translate('payment.adyen_credit_debit_card_text'));
    });
});
