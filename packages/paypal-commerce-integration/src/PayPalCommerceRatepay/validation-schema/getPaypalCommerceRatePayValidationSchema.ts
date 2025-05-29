import { FormField, LanguageService } from '@bigcommerce/checkout-sdk';
import { memoize } from '@bigcommerce/memoize';
import { object, string, StringSchema } from 'yup';

export default memoize(function getPaypalCommerceRatePayValidationSchema({
    formFieldData,
    language,
}: {
    formFieldData: FormField[];
    language: LanguageService;
}) {
    const requiredFieldErrorTranslationIds: { [fieldName: string]: string } = {
        ratepayPhoneCountryCode: 'payment.ratepay.phone_country_code',
        ratepayPhoneNumber: 'payment.ratepay.phone_number',
        ratepayBirthDate: 'payment.ratepay.birth_date',
    };

    return object(
        formFieldData.reduce((schema, { id, required }) => {
            if (required) {
                if (requiredFieldErrorTranslationIds[id]) {
                    schema[id] = string()
                        .nullable()
                        .required(
                            language.translate(`payment.ratepay.errors.isRequired`, {
                                fieldName: language.translate(requiredFieldErrorTranslationIds[id]),
                            }),
                        );

                    if (id === 'ratepayPhoneCountryCode') {
                        schema[id] = schema[id].matches(
                            /^\+\d{2,}$/,
                            language.translate('payment.ratepay.errors.isInvalid', {
                                fieldName: language.translate('payment.ratepay.phone_country_code'),
                            }),
                        );
                    }

                    if (id === 'ratepayPhoneNumber') {
                        schema[id] = schema[id].matches(
                            /^\d{7,11}$/,
                            language.translate('payment.ratepay.errors.isInvalid', {
                                fieldName: language.translate('payment.ratepay.phone_number'),
                            }),
                        );
                    }
                }
            }

            return schema;
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        }, {} as { [key: string]: StringSchema<string | null> }),
    );
});
