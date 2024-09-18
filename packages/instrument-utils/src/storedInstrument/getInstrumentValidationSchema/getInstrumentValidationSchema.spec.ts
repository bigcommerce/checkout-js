import { createLanguageService, LanguageService } from '@bigcommerce/checkout-sdk';

import { CardInstrumentFieldsetValues } from '@bigcommerce/checkout/payment-integration-api';

import getInstrumentValidationSchema from './getInstrumentValidationSchema';

describe('getInstrumentValidationSchema()', () => {
    let language: LanguageService;
    let validData: CardInstrumentFieldsetValues & { ccCvv: string; ccNumber: string };

    beforeEach(() => {
        language = createLanguageService();

        jest.spyOn(language, 'translate').mockImplementation((key) => key);

        validData = {
            ccCvv: '123',
            ccNumber: '4111 1111 1111 1111',
            instrumentId: 'abc123',
        };
    });

    it('does not throw error if data is valid', () => {
        const state = {
            instrumentBrand: 'visa',
            instrumentLast4: '1111',
            isCardCodeRequired: true,
            isCardNumberRequired: true,
            language,
        };
        const schema = getInstrumentValidationSchema(state);

        expect(schema.validateSync(validData)).toEqual(validData);
    });

    it('throws error if card number is required but missing', () => {
        const state = {
            instrumentBrand: 'visa',
            instrumentLast4: '1111',
            isCardCodeRequired: false,
            isCardNumberRequired: true,
            language,
        };
        const schema = getInstrumentValidationSchema(state);

        expect(() => schema.validateSync({ ...validData, ccNumber: '' })).toThrow(
            'payment.credit_card_number_required_error',
        );
    });

    it('throws error if card number does not match with last 4 digit of instrument', () => {
        const state = {
            instrumentBrand: 'visa',
            instrumentLast4: '1234',
            isCardCodeRequired: true,
            isCardNumberRequired: true,
            language,
        };
        const schema = getInstrumentValidationSchema(state);

        expect(() => schema.validateSync(validData)).toThrow(
            'payment.credit_card_number_mismatch_error',
        );
    });

    it('throws error if card code is required but missing', () => {
        const state = {
            instrumentBrand: 'visa',
            instrumentLast4: '1111',
            isCardCodeRequired: true,
            isCardNumberRequired: false,
            language,
        };
        const schema = getInstrumentValidationSchema(state);

        expect(() => schema.validateSync({ ...validData, ccCvv: '' })).toThrow(
            'payment.credit_card_cvv_required_error',
        );
    });

    it('throws error if card code does not match with requirement of card type', () => {
        const state = {
            instrumentBrand: 'american_express',
            instrumentLast4: '1111',
            isCardCodeRequired: true,
            isCardNumberRequired: false,
            language,
        };
        const schema = getInstrumentValidationSchema(state);

        expect(() => schema.validateSync({ ...validData, ccCvv: '123' })).toThrow(
            'payment.credit_card_cvv_invalid_error',
        );

        expect(() => schema.validateSync({ ...validData, ccCvv: '1234' })).not.toThrow(
            'payment.credit_card_cvv_invalid_error',
        );
    });
});
