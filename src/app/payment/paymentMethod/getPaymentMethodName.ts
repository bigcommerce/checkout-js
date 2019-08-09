import { LanguageService, PaymentMethod } from '@bigcommerce/checkout-sdk';
import { capitalize, get } from 'lodash';

import PaymentMethodId from './PaymentMethodId';
import PaymentMethodType from './PaymentMethodType';

/**
 * Always return the translated name of a payment method unless it is a
 * multi-option payment method or it doesn't have any translation. It's possible
 * to translate the gateway name of multi-option methods, i.e.: AfterPay.
 * However, because the options provided by the gateway can vary a lot, i.e.:
 * "Pay by Installment", therefore it's not feasible to do the translation on
 * the UI level.
 */
export default function getPaymentMethodName(
    language: LanguageService
): (method: Partial<PaymentMethod> & Pick<PaymentMethod, 'id'>) => string {
    return method => {
        let name = getTranslatedPaymentMethodName(language)(method);

        if (!name || method.method === PaymentMethodType.MultiOption) {
            name = method.config && method.config.displayName;
        }

        if (!name) {
            name = capitalize(
                // FIXME: I'm not entirely sure why we have to do this. But for some
                // reason this is required for Masterpass provided by Square.
                get(method, 'initializationData.paymentData.cardData.digital_wallet_type') ||
                method.method ||
                method.id
            );
        }

        return name;
    };
}

export function getTranslatedPaymentMethodName(
    language: LanguageService
): (method: Partial<PaymentMethod> & Pick<PaymentMethod, 'id'>) => string | undefined {
    return method => {
        if (method.id === PaymentMethodId.Affirm) {
            return language.translate('payment.affirm_name_text');
        }

        if (method.id === PaymentMethodId.Afterpay) {
            return language.translate('payment.afterpay_name_text');
        }

        if (method.id === PaymentMethodId.Amazon) {
            return language.translate('payment.amazon_name_text');
        }

        if (method.id === PaymentMethodId.Klarna) {
            return language.translate('payment.klarna_name_text');
        }

        if (method.method === PaymentMethodType.Paypal) {
            return language.translate('payment.paypal_name_text');
        }

        if (method.method === PaymentMethodType.PaypalCredit) {
            return language.translate('payment.paypal_credit_name_text');
        }

        if (method.method === PaymentMethodType.Chasepay) {
            return language.translate('payment.chasepay_name_text');
        }

        if (method.method === PaymentMethodType.VisaCheckout) {
            return language.translate('payment.vco_name_text');
        }

        if (method.method === PaymentMethodType.GooglePay) {
            return language.translate('payment.google_pay_name_text');
        }
    };
}
