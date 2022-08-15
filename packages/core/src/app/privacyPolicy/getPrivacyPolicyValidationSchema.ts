import { LanguageService } from '@bigcommerce/checkout-sdk';
import { boolean, BooleanSchema, object, ObjectSchema } from 'yup';

export interface PrivacyPolicyValidatonSchemaProps {
    isRequired: boolean;
    language: LanguageService;
}

export default function getPrivacyPolicyValidationSchema({
    isRequired,
    language,
}: PrivacyPolicyValidatonSchemaProps): ObjectSchema<{ privacyPolicy?: boolean }> {
    const schemaFields: {
        privacyPolicy?: BooleanSchema;
    } = {};

    if (isRequired) {
        schemaFields.privacyPolicy = boolean().oneOf(
            [true],
            language.translate('privacy_policy.required_error'),
        );
    }

    return object(schemaFields);
}
