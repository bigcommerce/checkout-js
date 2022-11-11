import { LanguageService } from '@bigcommerce/checkout-sdk';
import { memoize } from '@bigcommerce/memoize';
import { cvv, expirationDate, number } from 'card-validator';
import { object, ObjectSchema, string } from 'yup';

import { CreditCardFieldsetValues } from '@bigcommerce/checkout/payment-integration-api';

export interface CreditCardValidationSchemaOptions {
    isCardCodeRequired: boolean;
    language: LanguageService;
}

export default memoize(function getCreditCardValidationSchema({
    isCardCodeRequired,
    language,
}: CreditCardValidationSchemaOptions): ObjectSchema<CreditCardFieldsetValues> {
    const schema = {
        ccCustomerCode: string(),
        ccCvv: string(),
        ccExpiry: string()
            .required(language.translate('payment.credit_card_expiration_required_error'))
            .test({
                message: language.translate('payment.credit_card_expiration_invalid_error'),
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                test: (value) => expirationDate(value).isValid,
            }),
        ccName: string()
            .max(200)
            .required(language.translate('payment.credit_card_name_required_error')),
        ccNumber: string()
            .required(language.translate('payment.credit_card_number_required_error'))
            .test({
                message: language.translate('payment.credit_card_number_invalid_error'),
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                test: (value) => number(value).isValid,
            }),
    };

    if (isCardCodeRequired) {
        schema.ccCvv = string()
            .required(language.translate('payment.credit_card_cvv_required_error'))
            .test({
                message: language.translate('payment.credit_card_cvv_invalid_error'),
                test(value) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
                    const { card } = number(this.parent.ccNumber);

                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unnecessary-condition
                    return cvv(value, card && card.code ? card.code.size : undefined).isValid;
                },
            });
    }

    return object(schema);
});
