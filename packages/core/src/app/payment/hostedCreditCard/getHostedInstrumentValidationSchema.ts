import { LanguageService } from '@bigcommerce/checkout-sdk';
import { memoize } from '@bigcommerce/memoize';
import { object, ObjectSchema, string } from 'yup';

export interface HostedInstrumentValidationSchemaOptions {
    language: LanguageService;
}

export interface HostedInstrumentValidationSchemaShape {
    hostedForm: {
        errors: {
            cardCodeVerification: string;
            cardNumberVerification: string;
        };
    };
    instrumentId: string;
}

export default memoize(function getHostedInstrumentValidationSchema({
    language,
}: HostedInstrumentValidationSchemaOptions): ObjectSchema<HostedInstrumentValidationSchemaShape> {
    return object({
        instrumentId: string().required(),

        hostedForm: object({
            errors: object({
                cardCodeVerification: string()
                    .test({
                        message: language.translate('payment.credit_card_cvv_required_error'),
                        test: (value) => value !== 'required',
                    })
                    .test({
                        message: language.translate('payment.credit_card_cvv_invalid_error'),
                        test: (value) => value !== 'invalid_card_code',
                    }),

                cardNumberVerification: string()
                    .test({
                        message: language.translate('payment.credit_card_number_required_error'),
                        test: (value) => value !== 'required',
                    })
                    .test({
                        message: language.translate('payment.credit_card_number_invalid_error'),
                        test: (value) => value !== 'invalid_card_number',
                    })
                    .test({
                        message: language.translate('payment.credit_card_number_mismatch_error'),
                        test: (value) => value !== 'mismatched_card_number',
                    }),
            }),
        }),
    });
});
