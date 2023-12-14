import { LanguageService } from '@bigcommerce/checkout-sdk';
import { memoize } from '@bigcommerce/memoize';
import { object, ObjectSchema, string } from 'yup';

export default memoize(function getIdealValidationSchema(language: LanguageService): ObjectSchema {
    return object({
        bic: string().required(language.translate('payment.ideal_bic_required')),
    });
});
