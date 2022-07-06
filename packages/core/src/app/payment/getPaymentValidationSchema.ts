import { LanguageService } from '@bigcommerce/checkout-sdk';
import { object, string, ObjectSchema, StringSchema } from 'yup';

import { getTermsConditionsValidationSchema } from '../termsConditions';

import { PaymentFormValues } from './PaymentForm';

export interface PaymentValidationSchemaOptions {
    additionalValidation?: ObjectSchema<Partial<PaymentFormValues>>;
    isTermsConditionsRequired: boolean;
    language: LanguageService;
}

export default function getPaymentValidationSchema({
    additionalValidation,
    isTermsConditionsRequired,
    language,
}: PaymentValidationSchemaOptions): ObjectSchema<PaymentFormValues> {
    const schemaFields: {
        paymentProviderRadio: StringSchema;
    } = {
        paymentProviderRadio: string().required(),
    };

    const schemaFieldsWithTerms = object(schemaFields)
        .concat(getTermsConditionsValidationSchema({ isTermsConditionsRequired, language }));

    return additionalValidation ?
        schemaFieldsWithTerms.concat(additionalValidation as any) :
        schemaFieldsWithTerms;
}
