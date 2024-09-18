import { LanguageService } from '@bigcommerce/checkout-sdk';
import { memoize } from '@bigcommerce/memoize';
import { cvv, number } from 'card-validator';
import creditCardType from 'credit-card-type';
import { object, ObjectSchema, string, StringSchema } from 'yup';

import { CardInstrumentFieldsetValues } from '@bigcommerce/checkout/payment-integration-api';

import { mapFromInstrumentCardType } from '../';

export interface InstrumentValidationSchemaOptions {
    instrumentBrand: string;
    instrumentLast4: string;
    isCardCodeRequired: boolean;
    isCardNumberRequired: boolean;
    language: LanguageService;
}

interface InstrumentValidationSchema {
    ccCvv?: StringSchema;
    ccNumber?: StringSchema;
    instrumentId: StringSchema;
}

export default memoize(function getInstrumentValidationSchema({
    instrumentBrand,
    instrumentLast4,
    isCardCodeRequired,
    isCardNumberRequired,
    language,
}: InstrumentValidationSchemaOptions): ObjectSchema<CardInstrumentFieldsetValues> {
    const schema: InstrumentValidationSchema = {
        instrumentId: string().required(),
    };

    if (isCardCodeRequired) {
        schema.ccCvv = string()
            .required(language.translate('payment.credit_card_cvv_required_error'))
            .test({
                message: language.translate('payment.credit_card_cvv_invalid_error'),
                test(value = '') {
                    const cardType = mapFromInstrumentCardType(instrumentBrand);
                    const cardInfo = creditCardType.getTypeInfo(cardType);

                    return cvv(value, cardInfo && cardInfo.code ? cardInfo.code.size : undefined)
                        .isValid;
                },
            });
    }

    if (isCardNumberRequired) {
        schema.ccNumber = string()
            .required(language.translate('payment.credit_card_number_required_error'))
            .test({
                message: language.translate('payment.credit_card_number_invalid_error'),
                test: (value = '') => number(value).isValid,
            })
            .test({
                message: language.translate('payment.credit_card_number_mismatch_error'),
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                test: (value = '') => value.slice(-instrumentLast4.length) === instrumentLast4,
            });
    }

    return object(schema);
});
