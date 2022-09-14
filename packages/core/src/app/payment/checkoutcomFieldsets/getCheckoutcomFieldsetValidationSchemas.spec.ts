import { ObjectSchema, ValidationError } from 'yup';

import { TranslateValidationErrorFunction } from '../../formFields';

import getCheckoutcomFieldsetValidationSchemas from './getCheckoutcomFieldsetValidationSchemas';

const getFormfields = {
    ideal: () => ({
        bic: 'INGBNL2A',
    }),
    oxxo: () => ({
        ccDocument: 'DOJH010199HJLZQQ01',
    }),
    sepa: () => ({
        iban: 'testiban',
        sepaMandate: true,
    }),
};

describe('getCheckoutcomFieldsetValidationSchemas', () => {
    let translate: TranslateValidationErrorFunction;

    beforeEach(() => {
        translate = jest.fn();
    });

    describe('sepa validation schema', () => {
        let sepaValidationSchema: ObjectSchema;

        beforeEach(() => {
            sepaValidationSchema = getCheckoutcomFieldsetValidationSchemas({
                paymentMethod: 'sepa',
                language: { translate },
            });
        });

        it('resolves if valid value', async () => {
            const spy = jest.fn();

            await sepaValidationSchema
                .validate({
                    ...getFormfields.sepa(),
                })
                .then(spy);

            expect(spy).toHaveBeenCalled();
        });

        it('throws error if iban is not present', async () => {
            const errors = await sepaValidationSchema
                .validate({
                    ...getFormfields.sepa(),
                    iban: '',
                })
                .catch((error: ValidationError) => error.message);

            expect(errors).toBe('iban is a required field');
        });

        it('throws error if sepaMandate is false', async () => {
            const errors = await sepaValidationSchema
                .validate({
                    ...getFormfields.sepa(),
                    sepaMandate: undefined,
                })
                .catch((error: ValidationError) => error.message);

            expect(errors).toBe('sepaMandate is a required field');
        });
    });

    describe('ccDocument validation schema', () => {
        let ccDocumentValidationSchema: ObjectSchema;

        beforeEach(() => {
            ccDocumentValidationSchema = getCheckoutcomFieldsetValidationSchemas({
                paymentMethod: 'oxxo',
                language: { translate },
            });
        });

        it('resolves if valid value', async () => {
            const spy = jest.fn();

            await ccDocumentValidationSchema
                .validate({
                    ...getFormfields.oxxo(),
                })
                .then(spy);

            expect(spy).toHaveBeenCalled();
        });

        it('throws error if ccDocument is incomplete', async () => {
            const errors = await ccDocumentValidationSchema
                .validate({
                    ccDocument: 'DOJH010199HJLZQQ',
                })
                .catch((error: ValidationError) => error.message);

            expect(errors).toBe('ccDocument must be exactly 18 characters');
        });
    });

    describe('iDeal validation schema', () => {
        let iDealValidationSchema: ObjectSchema;

        beforeEach(() => {
            iDealValidationSchema = getCheckoutcomFieldsetValidationSchemas({
                paymentMethod: 'ideal',
                language: { translate },
            });
        });

        it('resolves if valid value', async () => {
            const spy = jest.fn();

            await iDealValidationSchema
                .validate({
                    ...getFormfields.ideal(),
                })
                .then(spy);

            expect(spy).toHaveBeenCalled();
        });

        it('throws error if iban is not present', async () => {
            const errors = await iDealValidationSchema
                .validate({
                    bic: '',
                })
                .catch((error: ValidationError) => error.message);

            expect(errors).toBe('bic is a required field');
        });
    });
});
