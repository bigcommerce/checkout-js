import { LanguageService } from '@bigcommerce/checkout-sdk';
import { memoize } from '@bigcommerce/memoize';
import { object, ObjectSchema, string } from 'yup';

export interface HostedInstrumentValidationSchemaOptions {
    language: LanguageService;
    isCardExpiryRequired?: boolean;
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
    isCardExpiryRequired = false,
}: HostedInstrumentValidationSchemaOptions): ObjectSchema<HostedInstrumentValidationSchemaShape> {
    return object().shape<HostedInstrumentValidationSchemaShape>({
        instrumentId: string().required(),

        hostedForm: object()
            .required()
            .shape<HostedInstrumentValidationSchemaShape['hostedForm']>({
                errors: object()
                    .required()
                    .shape<HostedInstrumentValidationSchemaShape['hostedForm']['errors']>({
                        cardCodeVerification: string()
                            .test({
                                message: language.translate(
                                    'payment.credit_card_cvv_required_error',
                                ),
                                test: (value) => value !== 'required',
                            })
                            .test({
                                message: language.translate(
                                    'payment.credit_card_cvv_invalid_error',
                                ),
                                test: (value) => value !== 'invalid_card_code',
                            }),

                        cardNumberVerification: string()
                            .test({
                                message: language.translate(
                                    'payment.credit_card_number_required_error',
                                ),
                                test: (value) => value !== 'required',
                            })
                            .test({
                                message: language.translate(
                                    'payment.credit_card_number_invalid_error',
                                ),
                                test: (value) => value !== 'invalid_card_number',
                            })
                            .test({
                                message: language.translate(
                                    'payment.credit_card_number_mismatch_error',
                                ),
                                test: (value) => value !== 'mismatched_card_number',
                            }),
                        ...(isCardExpiryRequired
                            ? {
                                  cardExpiryVerification: string()
                                      .test({
                                          message: language.translate(
                                              'payment.credit_card_expiration_required_error',
                                          ),
                                          test: (value) => value !== 'required',
                                      })
                                      .test({
                                          message: language.translate(
                                              'payment.credit_card_expiration_invalid_error',
                                          ),
                                          test: (value) => value !== 'invalid_card_expiry',
                                      }),
                              }
                            : {}),
                    }),
            }),
    });
});
