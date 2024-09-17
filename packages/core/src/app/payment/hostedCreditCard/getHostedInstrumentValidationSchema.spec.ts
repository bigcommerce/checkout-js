import { LanguageService } from '@bigcommerce/checkout-sdk';
import { ObjectSchema } from 'yup';

import { HostedCreditCardValidationValues } from '@bigcommerce/checkout/payment-integration-api';

import getHostedInstrumentValidationSchema from './getHostedInstrumentValidationSchema';

describe('getHostedInstrumentValidationSchema', () => {
    let language: Pick<LanguageService, 'translate'>;
    let schema: ObjectSchema;
    let values: HostedCreditCardValidationValues & { instrumentId: string };

    beforeEach(() => {
        language = {
            translate: jest.fn((key) => key),
        };

        values = {
            instrumentId: '123',
            hostedForm: {},
        };

        schema = getHostedInstrumentValidationSchema({
            language: language as LanguageService,
        });
    });

    it('does not throw error if data is valid', () => {
        expect(() => schema.validateSync(values)).not.toThrow();
    });

    it('throws error if instrument ID is missing', () => {
        values.instrumentId = '';

        expect(() => schema.validateSync(values)).toThrow('required');
    });

    it('throws error if card code field is missing', () => {
        values.hostedForm.errors = { cardCodeVerification: 'required' };

        expect(() => schema.validateSync(values)).toThrow('payment.credit_card_cvv_required_error');
    });

    it('throws error if card code field is invalid', () => {
        values.hostedForm.errors = { cardCodeVerification: 'invalid_card_code' };

        expect(() => schema.validateSync(values)).toThrow('payment.credit_card_cvv_invalid_error');
    });

    it('throws error if card number field is missing', () => {
        values.hostedForm.errors = { cardNumberVerification: 'required' };

        expect(() => schema.validateSync(values)).toThrow(
            'payment.credit_card_number_required_error',
        );
    });

    it('throws error if card number field is invalid', () => {
        values.hostedForm.errors = { cardNumberVerification: 'invalid_card_number' };

        expect(() => schema.validateSync(values)).toThrow(
            'payment.credit_card_number_invalid_error',
        );
    });

    it('throws error if card number field does not match with stored instrument', () => {
        values.hostedForm.errors = { cardNumberVerification: 'mismatched_card_number' };

        expect(() => schema.validateSync(values)).toThrow(
            'payment.credit_card_number_mismatch_error',
        );
    });

    it('does not throw error if data is valid and cardExpiry is required', () => {
        schema = getHostedInstrumentValidationSchema({
            language: language as LanguageService,
            isCardExpiryRequired: true,
        });

        expect(() => schema.validateSync(values)).not.toThrow();
    });

    it('throws error if card expiry field is missing', () => {
        schema = getHostedInstrumentValidationSchema({
            language: language as LanguageService,
            isCardExpiryRequired: true,
        });
        values.hostedForm.errors = { cardExpiryVerification: 'required' };

        expect(() => schema.validateSync(values)).toThrow('payment.credit_card_expiration_required_error');
    });

    it('throws error if card number field is invalid', () => {
        schema = getHostedInstrumentValidationSchema({
            language: language as LanguageService,
            isCardExpiryRequired: true,
        });

        values.hostedForm.errors = { cardExpiryVerification: 'invalid_card_expiry' };

        expect(() => schema.validateSync(values)).toThrow(
            'payment.credit_card_expiration_invalid_error',
        );
    });
});
