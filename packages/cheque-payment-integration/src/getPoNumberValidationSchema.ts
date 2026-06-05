import { type LanguageService } from '@bigcommerce/checkout-sdk';
import { memoize } from '@bigcommerce/memoize';
import { object, type ObjectSchema, string } from 'yup';

export default memoize(function getPoNumberValidationSchema(
    language: LanguageService,
    isRequired: boolean,
    label: string,
): ObjectSchema {
    if (!isRequired) {
        return object({});
    }

    return object({
        poNumber: string()
            .trim()
            .required(language.translate('payment.errors.field_required_error', { label })),
    });
});
