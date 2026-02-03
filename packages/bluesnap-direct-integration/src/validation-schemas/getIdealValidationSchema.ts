import { type LanguageService } from '@bigcommerce/checkout-sdk';
import { memoize } from '@bigcommerce/memoize';
import { object, type ObjectSchema, string } from 'yup';

export default memoize(
  (language: LanguageService): ObjectSchema =>
    object({
      bic: string().required(language.translate('payment.ideal_bic_required')),
    }),
);
