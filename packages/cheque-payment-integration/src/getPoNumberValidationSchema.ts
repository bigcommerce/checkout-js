import { type LanguageService } from '@bigcommerce/checkout-sdk';
import { memoize } from '@bigcommerce/memoize';
import { object, type ObjectSchema, string } from 'yup';

export default memoize(function getPoNumberValidationSchema(
    language: LanguageService,
    isRequired: boolean,
): ObjectSchema {
    if (!isRequired) {
        return object({});
    }

    return object({
        poNumber: string().trim().required(language.translate('payment.po_number_required_error')),
    });
});
