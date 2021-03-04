import { LanguageService } from '@bigcommerce/checkout-sdk';
import { memoize } from '@bigcommerce/memoize';
import { boolean, object, string, ObjectSchema } from 'yup';

export type checkoutcomCustomPaymentMethods = 'fawry' | 'sepa';
export type documentPaymentMethods = 'oxxo' | 'qpay' | 'boleto' | 'ideal';
export type checkoutcomPaymentMethods = documentPaymentMethods | checkoutcomCustomPaymentMethods;
export interface CustomValidationSchemaOptions {
    paymentMethod: checkoutcomPaymentMethods;
    language: LanguageService;
}

export interface DocumentOnlyCustomFormFieldsetValues {
    ccDocument?: string;
}
export interface SepaCustomFormFieldsetValues {
    bic?: string;
    iban: string;
    sepaMandate: boolean;
}

export interface FawryCustomFormFieldsetValues {
    customerMobile?: number;
    customerEmail?: string;
}

const checkoutComShemas: {
    [key in checkoutcomPaymentMethods]: (language: LanguageService) => {}
} = {

    oxxo: (language: LanguageService) => ({
        ccDocument: string()
            .required(language.translate('payment.checkoutcom_document_invalid_error_oxxo'))
            .length(
                18,
                language.translate('payment.checkoutcom_document_invalid_error_oxxo')
            ),
    }),
    qpay: (language: LanguageService) => ({
        ccDocument: string()
            .notRequired()
            .max(
                32,
                language.translate('payment.checkoutcom_document_invalid_error_qpay')
            ),
    }),
    boleto: (language: LanguageService) => ({
        ccDocument: string()
            .required(language.translate('payment.checkoutcom_document_invalid_error_boleto'))
            .min(
                11,
                language.translate('payment.checkoutcom_document_invalid_error_boleto')
            )
            .max(
                14,
                language.translate('payment.checkoutcom_document_invalid_error_boleto')
            ),
    }),
    sepa: (language: LanguageService) => ({
        bic: string()
            .notRequired(),
        iban: string()
            .required(
                language.translate('payment.sepa_account_number_required')
            ),
        sepaMandate: boolean()
            .required(
                language.translate('payment.sepa_mandate_required')
            ),
    }),
    ideal: (language: LanguageService) => ({
        ccDocument: string()
            .required()
            .min(
                8,
                language.translate('payment.checkoutcom_document_invalid_error_ideal')
            )
            .max(
                11,
                language.translate('payment.checkoutcom_document_invalid_error_ideal')
            ),
    }),
    fawry: (language: LanguageService) => ({
        customerMobile: string()
            .required(language.translate('payment.checkoutcom_fawry_customer_mobile_invalid_error'))
            .matches(
                new RegExp(`^\\d{11}$`),
                language.translate('payment.checkoutcom_fawry_customer_mobile_invalid_error')
            ),
        customerEmail: string()
            .required(language.translate('payment.checkoutcom_fawry_customer_email_invalid_error'))
            .email(
                language.translate('payment.checkoutcom_fawry_customer_email_invalid_error')
            ),
    }),
};

export default memoize(function getCheckoutcomValidationSchemas({
    paymentMethod,
    language,
}: CustomValidationSchemaOptions): ObjectSchema<DocumentOnlyCustomFormFieldsetValues | FawryCustomFormFieldsetValues | SepaCustomFormFieldsetValues> {

    return object(checkoutComShemas[paymentMethod](language));
});
