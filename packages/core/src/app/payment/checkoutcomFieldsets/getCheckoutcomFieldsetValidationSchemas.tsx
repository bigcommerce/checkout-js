import { LanguageService } from '@bigcommerce/checkout-sdk';
import { memoize } from '@bigcommerce/memoize';
import { boolean, object, ObjectSchema, string } from 'yup';

import {
    DocumentOnlyCustomFormFieldsetValues,
    FawryCustomFormFieldsetValues,
    IdealCustomFormFieldsetValues,
    SepaCustomFormFieldsetValues,
} from './CheckoutcomFormValues';

export type checkoutcomCustomPaymentMethods = 'fawry' | 'sepa';
export type documentPaymentMethods = 'oxxo' | 'qpay' | 'boleto' | 'ideal';
export type checkoutcomPaymentMethods = documentPaymentMethods | checkoutcomCustomPaymentMethods;
export interface CustomValidationSchemaOptions {
    paymentMethod: checkoutcomPaymentMethods;
    language: LanguageService;
}

const checkoutComShemas: {
    [key in checkoutcomPaymentMethods]: (language: LanguageService) => any;
} = {
    oxxo: (language: LanguageService) => ({
        ccDocument: string()
            .required(language.translate('payment.checkoutcom_document_invalid_error_oxxo'))
            .length(18, language.translate('payment.checkoutcom_document_invalid_error_oxxo')),
    }),
    qpay: (language: LanguageService) => ({
        ccDocument: string()
            .notRequired()
            .max(32, language.translate('payment.checkoutcom_document_invalid_error_qpay')),
    }),
    boleto: (language: LanguageService) => ({
        ccDocument: string()
            .required(language.translate('payment.checkoutcom_document_invalid_error_boleto'))
            .min(11, language.translate('payment.checkoutcom_document_invalid_error_boleto'))
            .max(14, language.translate('payment.checkoutcom_document_invalid_error_boleto')),
    }),
    sepa: (language: LanguageService) => ({
        iban: string().required(language.translate('payment.sepa_account_number_required')),
        sepaMandate: boolean().required(language.translate('payment.sepa_mandate_required')),
    }),
    ideal: (language: LanguageService) => ({
        bic: string().required(language.translate('payment.ideal_bic_required')),
    }),
    fawry: (language: LanguageService) => ({
        customerMobile: string()
            .required(language.translate('payment.checkoutcom_fawry_customer_mobile_invalid_error'))
            .matches(
                new RegExp(`^\\d{11}$`),
                language.translate('payment.checkoutcom_fawry_customer_mobile_invalid_error'),
            ),
        customerEmail: string()
            .required(language.translate('payment.checkoutcom_fawry_customer_email_invalid_error'))
            .email(language.translate('payment.checkoutcom_fawry_customer_email_invalid_error')),
    }),
};

export default memoize(function getCheckoutcomValidationSchemas({
    paymentMethod,
    language,
}: CustomValidationSchemaOptions): ObjectSchema<
    | DocumentOnlyCustomFormFieldsetValues
    | FawryCustomFormFieldsetValues
    | IdealCustomFormFieldsetValues
    | SepaCustomFormFieldsetValues
> {
    return object(checkoutComShemas[paymentMethod](language));
});
