import { FormField, LanguageService } from '@bigcommerce/checkout-sdk';
import { memoize } from '@bigcommerce/memoize';
import { object, string, StringSchema } from 'yup';

export default memoize(function getBraintreeTrustlyValidationSchema({
    formFieldData,
    language,
}: {
    formFieldData: FormField[];
    language: LanguageService;
}) {
    return object(
        formFieldData.reduce((schema, { id, required }) => {
            if (required) {
                schema[id] = string()
                    .nullable()
                    .required(language.translate(`payment.errors.phone_number_required_error`));

                if (id === 'phoneNumber') {
                    schema[id] = schema[id].matches(
                        /^[+]?\d{7,12}$/,
                        language.translate('payment.errors.invalid_phone_number'),
                    );
                }
            }

            return schema;
        }, {} as { [key: string]: StringSchema<string | null> }),
    );
});
