import { LanguageService } from '@bigcommerce/checkout-sdk';
import { boolean, BooleanSchema, object, ObjectSchema } from 'yup';

export interface TermsConditionValidationSchemaOptions {
    isTermsConditionsRequired: boolean;
    language: LanguageService;
}

export default function getTermsConditionsValidationSchema({
    isTermsConditionsRequired,
    language,
}: TermsConditionValidationSchemaOptions): ObjectSchema<{ terms?: boolean }> {
    const schemaFields: {
        terms?: BooleanSchema;
    } = {};

    if (isTermsConditionsRequired) {
        schemaFields.terms = boolean().oneOf(
            [true],
            language.translate('terms_and_conditions.agreement_required_error'),
        );
    }

    return object(schemaFields);
}
