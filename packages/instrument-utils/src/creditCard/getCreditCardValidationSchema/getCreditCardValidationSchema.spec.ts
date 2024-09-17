import { createLanguageService, LanguageService } from '@bigcommerce/checkout-sdk';

import { CreditCardFieldsetValues } from '@bigcommerce/checkout/payment-integration-api';

import { getCreditCardValidationSchema } from '.';

describe('getCreditCardValidationSchema()', () => {
    let language: LanguageService;
    let validData: CreditCardFieldsetValues;

    beforeEach(() => {
        language = createLanguageService();

        jest.spyOn(language, 'translate').mockImplementation((key) => key);

        validData = {
            ccCustomerCode: '123',
            ccCvv: '123',
            ccExpiry: '10 / 25',
            ccName: 'BC',
            ccNumber: '4111 1111 1111 1111',
        };
    });

    it('does not throw error if data is valid', () => {
        const schema = getCreditCardValidationSchema({ isCardCodeRequired: false, language });

        expect(schema.validateSync(validData)).toEqual(validData);
    });

    it('returns error if card number is missing', () => {
        const schema = getCreditCardValidationSchema({ isCardCodeRequired: false, language });

        expect(() => schema.validateSync({ ...validData, ccNumber: '' })).toThrow(
            'payment.credit_card_number_required_error',
        );
    });

    it('returns error if card number is invalid', () => {
        const schema = getCreditCardValidationSchema({ isCardCodeRequired: false, language });

        expect(() =>
            schema.validateSync({ ...validData, ccNumber: '9999 9999 9999 9999' }),
        ).toThrow('payment.credit_card_number_invalid_error');
    });

    it('returns error if card name is missing', () => {
        const schema = getCreditCardValidationSchema({ isCardCodeRequired: false, language });

        expect(() => schema.validateSync({ ...validData, ccName: '' })).toThrow(
            'payment.credit_card_name_required_error',
        );
    });

    it('returns error if expiry date is missing', () => {
        const schema = getCreditCardValidationSchema({ isCardCodeRequired: false, language });

        expect(() => schema.validateSync({ ...validData, ccExpiry: '' })).toThrow(
            'payment.credit_card_expiration_required_error',
        );
    });

    it('returns error if expiry date is invalid', () => {
        const schema = getCreditCardValidationSchema({ isCardCodeRequired: false, language });

        expect(() => schema.validateSync({ ...validData, ccExpiry: '2030 / 12' })).toThrow(
            'payment.credit_card_expiration_invalid_error',
        );
    });

    it('returns error if expiry date is in past', () => {
        const schema = getCreditCardValidationSchema({ isCardCodeRequired: false, language });

        expect(() => schema.validateSync({ ...validData, ccExpiry: '12 / 10' })).toThrow(
            'payment.credit_card_expiration_invalid_error',
        );
    });

    it('returns error if card code is missing when required', () => {
        const schema = getCreditCardValidationSchema({ isCardCodeRequired: true, language });

        expect(() => schema.validateSync({ ...validData, ccCvv: '' })).toThrow(
            'payment.credit_card_cvv_required_error',
        );
    });

    it('returns error if card code is invalid when required', () => {
        const schema = getCreditCardValidationSchema({ isCardCodeRequired: true, language });

        expect(() => schema.validateSync({ ...validData, ccCvv: '99999' })).toThrow(
            'payment.credit_card_cvv_invalid_error',
        );
    });

    it('returns error if card code is invalid for given card number', () => {
        const schema = getCreditCardValidationSchema({ isCardCodeRequired: true, language });

        // Card code for American Express should have 4 digts
        expect(() =>
            schema.validateSync({ ...validData, ccCvv: '123', ccNumber: '378282246310005' }),
        ).toThrow('payment.credit_card_cvv_invalid_error');
    });

    it('does not return error if card code is not required', () => {
        const schema = getCreditCardValidationSchema({ isCardCodeRequired: false, language });

        expect(() => schema.validateSync({ ...validData, ccCvv: '' })).not.toThrow();
    });
});
