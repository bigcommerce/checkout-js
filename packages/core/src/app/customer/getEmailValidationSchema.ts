import { LanguageService } from '@bigcommerce/checkout-sdk';
import { object, ObjectSchema, string } from 'yup';

import { EMAIL_REGEXP } from './validationPatterns';

export interface EmailValidationSchemaOptions {
    language: LanguageService;
}

export default function getEmailValidationSchema({
    language,
}: EmailValidationSchemaOptions): ObjectSchema<{ email: string }> {
    return object({
        email: string()
            .max(256)
            .matches(EMAIL_REGEXP, language.translate('customer.email_invalid_error'))
            .required(language.translate('customer.email_required_error')),
    });
}
