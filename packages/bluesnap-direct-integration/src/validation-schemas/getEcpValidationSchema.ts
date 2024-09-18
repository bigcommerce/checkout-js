import { LanguageService } from '@bigcommerce/checkout-sdk';
import { memoize } from '@bigcommerce/memoize';
import { object, ObjectSchema, string } from 'yup';

export default memoize(function getEcpValidationSchema(
    language: LanguageService,
    shouldRenderFields: boolean,
): ObjectSchema {
    const schema = {
        ...(!shouldRenderFields ? { instrumentId: string().required() } : {}),
        ...(shouldRenderFields
            ? {
                  accountNumber: string()
                      .required(
                          language.translate('payment.bluesnap_direct_account_number.is_required'),
                      )
                      .matches(
                          /^\d+$/,
                          language.translate('payment.bluesnap_direct_account_number.only_numbers'),
                      )
                      .min(4, language.translate('payment.bluesnap_direct_account_number.length'))
                      .max(
                          17,
                          language.translate('payment.bluesnap_direct_account_number.length_max'),
                      ),
                  routingNumber: string()
                      .required(
                          language.translate('payment.bluesnap_direct_routing_number.is_required'),
                      )
                      .matches(
                          /^\d+$/,
                          language.translate('payment.bluesnap_direct_routing_number.only_numbers'),
                      )
                      .length(
                          9,
                          language.translate('payment.bluesnap_direct_routing_number.length'),
                      ),
                  accountType: string().required(
                      language.translate('payment.bluesnap_direct_account_type.is_required'),
                  ),
              }
            : {}),
    };

    return object(schema);
});
