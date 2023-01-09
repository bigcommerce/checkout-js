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
    language: LanguageService,
): (method: PaymentMethod) => string {
    return (method) => {
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
                    method.id,
            );
        }

        return name;
    };
}

export function getTranslatedPaymentMethodName(
    language: LanguageService,
): (method: PaymentMethod) => string | undefined {
    return (method) => {
        const translations: { [key: string]: string } = {
            [PaymentMethodId.Affirm]: language.translate('payment.affirm_name_text'),
            [PaymentMethodId.Afterpay]: language.translate('payment.afterpay_name_text'),
            [PaymentMethodId.AmazonPay]: language.translate('payment.amazon_name_text'),
            [PaymentMethodId.Bolt]: language.translate('payment.bolt_name_text'),
            [PaymentMethodType.Chasepay]: language.translate('payment.chasepay_name_text'),
            [PaymentMethodId.Clearpay]: language.translate('payment.clearpay_name_text'),
            [PaymentMethodType.GooglePay]: language.translate('payment.google_pay_name_text'),
            [PaymentMethodId.Klarna]: language.translate('payment.klarna_name_text'),
            [PaymentMethodType.Paypal]: language.translate('payment.paypal_name_text'),
            [PaymentMethodType.PaypalCredit]: language.translate('payment.paypal_credit_name_text'),
            [PaymentMethodType.VisaCheckout]: language.translate('payment.vco_name_text'),
        };

        return translations[method.id] || translations[method.method];
    };
}
