import { LanguageService } from '@bigcommerce/checkout-sdk';
import { memoize } from '@bigcommerce/memoize';
import { object, ObjectSchema, string } from 'yup';

export interface HostedCreditCardValidationSchemaOptions {
    language: LanguageService;
}

export interface HostedCreditCardValidationSchemaShape {
    hostedForm: {
        errors: {
            cardCode: string;
            cardExpiry: string;
            cardName: string;
            cardNumber: string;
        };
    };
}

export default memoize(function getHostedCreditCardValidationSchema({
    language,
}: HostedCreditCardValidationSchemaOptions): ObjectSchema<HostedCreditCardValidationSchemaShape> {
    return object({
        hostedForm: object({
            errors: object({
                cardCode: string()
                    .test({
                        message: language.translate('payment.credit_card_cvv_required_error'),
                        test: (value) => value !== 'required',
                    })
                    .test({
                        message: language.translate('payment.credit_card_cvv_invalid_error'),
                        test: (value) => value !== 'invalid_card_code',
                    }),

                cardExpiry: string()
                    .test({
                        message: language.translate(
                            'payment.credit_card_expiration_required_error',
                        ),
                        test: (value) => value !== 'required',
                    })
                    .test({
                        message: language.translate('payment.credit_card_expiration_invalid_error'),
                        test: (value) => value !== 'invalid_card_expiry',
                    }),

                cardName: string().test({
                    message: language.translate('payment.credit_card_name_required_error'),
                    test: (value) => value !== 'required',
                }),

                cardNumber: string()
                    .test({
                        message: language.translate('payment.credit_card_number_required_error'),
                        test: (value) => value !== 'required',
                    })
                    .test({
                        message: language.translate('payment.credit_card_number_invalid_error'),
                        test: (value) => value !== 'invalid_card_number',
                    }),
            }),
        }),
    });
});
