import { LanguageService } from '@bigcommerce/checkout-sdk';
import { memoize } from '@bigcommerce/memoize';
import { object, ObjectSchema, string } from 'yup';

export default memoize(function getSepaValidationSchema(
    language: LanguageService,
    shouldRenderFields: boolean,
): ObjectSchema {
    const schema = {
        ...(!shouldRenderFields ? { instrumentId: string().required() } : {}),
        ...(shouldRenderFields
            ? {
                  iban: string()
                      .matches(
                          /^[a-zA-Z0-9]+$/i,
                          language.translate(`address.invalid_characters_error`, { label: 'IBAN' }),
                      )
                      .required(language.translate('payment.sepa_account_number_required')),
                  firstName: string().required(
                      language.translate('address.first_name_required_error'),
                  ),
                  lastName: string().required(
                      language.translate('address.last_name_required_error'),
                  ),
              }
            : {}),
    };

    return object(schema);
});
