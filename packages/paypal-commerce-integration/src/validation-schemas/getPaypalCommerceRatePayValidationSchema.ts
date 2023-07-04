import { FormField, LanguageService } from '@bigcommerce/checkout-sdk';
import { memoize } from '@bigcommerce/memoize';
import {object, string, StringSchema} from 'yup';

export default memoize(function getPaypalCommerceRatePayValidationSchema({
    formFieldData,
    language,
}: {
    formFieldData: FormField[];
    language: LanguageService;
}) {
    const requiredFieldErrorTranslationIds: { [fieldName: string]: string } = {
        ['ratepay_phone_country_code']: 'payment.ratepay.phone_country_code',
    };

    return object(
        formFieldData.reduce((schema, { id, required }) => {
            if (required) {
                if (requiredFieldErrorTranslationIds[id]) {
                    schema[id] = string().required(
                        language.translate(
                            `${requiredFieldErrorTranslationIds[id]}_required_error`,
                        ),
                    );

                    if (id === 'ratepay_phone_country_code') {
                        schema[id] = schema[id].matches(
                            /^\d{2}$/,
                            language.translate('payment.ratepay.errors.isInvalid', {
                                label: language.translate('payment.ratepay.phone_country_code'),
                            }),
                        );
                    }
                }
            }

            return schema;
        }, {} as { [key: string]: StringSchema })
    );
});
