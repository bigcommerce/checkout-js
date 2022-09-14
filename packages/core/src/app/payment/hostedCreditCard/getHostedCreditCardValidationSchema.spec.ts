import { LanguageService } from '@bigcommerce/checkout-sdk';
import { ObjectSchema } from 'yup';

import { HostedCreditCardFieldsetValues } from '@bigcommerce/checkout/payment-integration-api';

import getHostedCreditCardValidationSchema from './getHostedCreditCardValidationSchema';

describe('getHostedCreditCardValidationSchema', () => {
    let language: Pick<LanguageService, 'translate'>;
    let schema: ObjectSchema;
    let values: HostedCreditCardFieldsetValues;

    beforeEach(() => {
        language = {
            translate: jest.fn((key) => key),
        };

        values = { hostedForm: {} };

        schema = getHostedCreditCardValidationSchema({
            language: language as LanguageService,
        });
    });

    it('does not throw error if data is valid', () => {
        expect(() => schema.validateSync(values)).not.toThrow();
    });

    it('throws error if card code field is missing', () => {
        values.hostedForm.errors = { cardCode: 'required' };

        expect(() => schema.validateSync(values)).toThrow('payment.credit_card_cvv_required_error');
    });

    it('throws error if card code field is invalid', () => {
        values.hostedForm.errors = { cardCode: 'invalid_card_code' };

        expect(() => schema.validateSync(values)).toThrow('payment.credit_card_cvv_invalid_error');
    });

    it('throws error if card expiry field is missing', () => {
        values.hostedForm.errors = { cardExpiry: 'required' };

        expect(() => schema.validateSync(values)).toThrow(
            'payment.credit_card_expiration_required_error',
        );
    });

    it('throws error if card expiry field is invalid', () => {
        values.hostedForm.errors = { cardExpiry: 'invalid_card_expiry' };

        expect(() => schema.validateSync(values)).toThrow(
            'payment.credit_card_expiration_invalid_error',
        );
    });

    it('throws error if card name field is missing', () => {
        values.hostedForm.errors = { cardName: 'required' };

        expect(() => schema.validateSync(values)).toThrow(
            'payment.credit_card_name_required_error',
        );
    });

    it('throws error if card number field is missing', () => {
        values.hostedForm.errors = { cardNumber: 'required' };

        expect(() => schema.validateSync(values)).toThrow(
            'payment.credit_card_number_required_error',
        );
    });

    it('throws error if card number field is invalid', () => {
        values.hostedForm.errors = { cardNumber: 'invalid_card_number' };

        expect(() => schema.validateSync(values)).toThrow(
            'payment.credit_card_number_invalid_error',
        );
    });
});
