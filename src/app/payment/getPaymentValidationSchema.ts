import { LanguageService } from '@bigcommerce/checkout-sdk';
import { boolean, object, string, BooleanSchema, ObjectSchema, StringSchema } from 'yup';

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
        terms?: BooleanSchema;
    } = {
        paymentProviderRadio: string().required(),
    };

    if (isTermsConditionsRequired) {
        schemaFields.terms = boolean()
            .oneOf([true], language.translate('terms_and_conditions.agreement_required_error'));
    }

    if (additionalValidation) {
        return object(schemaFields).concat(additionalValidation as any);
    }

    return object(schemaFields);
}
