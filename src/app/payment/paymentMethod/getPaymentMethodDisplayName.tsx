import { LanguageService, PaymentMethod } from '@bigcommerce/checkout-sdk';

import PaymentMethodId from './PaymentMethodId';

export default function getPaymentMethodDisplayName(
    language: LanguageService
): (method: PaymentMethod) => string {
    return method => {
        const { displayName } = method.config;

        const isCreditCard = displayName?.toLowerCase() === 'credit card';

        if (isCreditCard && method.id === PaymentMethodId.AdyenV2) {
            return language.translate('payment.adyen_credit_debit_card_text');
        }

        if (isCreditCard) {
            return language.translate('payment.credit_card_text');
        }

        return displayName || '';
    };
}
