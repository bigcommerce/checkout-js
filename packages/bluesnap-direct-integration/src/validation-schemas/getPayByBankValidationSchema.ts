import { type LanguageService } from '@bigcommerce/checkout-sdk';
import { memoize } from '@bigcommerce/memoize';
import { object, type ObjectSchema, string } from 'yup';

export default memoize(
  (language: LanguageService): ObjectSchema =>
    object({
      iban: string()
        .matches(
          /^[a-zA-Z0-9]+$/i,
          language.translate(`address.invalid_characters_error`, { label: 'IBAN' }),
        )
        .required(language.translate('payment.pay_by_bank_iban_required')),
    }),
);
