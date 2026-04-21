import { type FormField } from '@bigcommerce/checkout-sdk';

import { type TranslateValidationErrorFunction } from './getCustomFormFieldsValidationSchema';
import getAddressExtraFieldsValidationSchema from './getAddressExtraFieldsValidationSchema';

describe('getAddressExtraFieldsValidationSchema', () => {
    let translate: TranslateValidationErrorFunction;

    beforeEach(() => {
        translate = jest.fn();
    });

    describe('string extra fields', () => {
        const formFields: FormField[] = [
            {
                custom: false,
                default: '',
                id: 'b2bExtraField_100',
                label: 'Company Name',
                name: 'b2bExtraField_100',
                required: true,
                maxLength: 10,
            },
        ];

        it('validates required string field', async () => {
            const schema = getAddressExtraFieldsValidationSchema({ formFields, translate });
            const error = await schema
                .validate({ extraFields: { b2bExtraField_100: '' } })
                .catch((e) => e.message);

            expect(translate).toHaveBeenCalledWith('required', {
                name: 'b2bExtraField_100',
                label: 'Company Name',
            });
            expect(error).toBeDefined();
        });

        it('validates maxLength for string field', async () => {
            const schema = getAddressExtraFieldsValidationSchema({ formFields, translate });
            const error = await schema
                .validate({ extraFields: { b2bExtraField_100: 'this string is too long' } })
                .catch((e) => e.message);

            expect(translate).toHaveBeenCalledWith('max', {
                name: 'b2bExtraField_100',
                label: 'Company Name',
                max: 10,
            });
            expect(error).toBeDefined();
        });

        it('passes for a valid string value', async () => {
            const schema = getAddressExtraFieldsValidationSchema({ formFields, translate });
            const spy = jest.fn();

            await schema.validate({ extraFields: { b2bExtraField_100: 'valid' } }).then(spy);

            expect(spy).toHaveBeenCalled();
        });
    });

    describe('integer extra fields', () => {
        const formFields: FormField[] = [
            {
                custom: false,
                default: '',
                id: 'b2bExtraField_200',
                label: 'Employee Count',
                name: 'b2bExtraField_200',
                required: true,
                type: 'integer',
                max: 100,
            } as FormField,
        ];

        it('validates required integer field', async () => {
            const schema = getAddressExtraFieldsValidationSchema({ formFields, translate });
            const error = await schema
                .validate({ extraFields: { b2bExtraField_200: undefined } })
                .catch((e) => e.message);

            expect(translate).toHaveBeenCalledWith('required', {
                name: 'b2bExtraField_200',
                label: 'Employee Count',
            });
            expect(error).toBeDefined();
        });

        it('validates max for integer field', async () => {
            const schema = getAddressExtraFieldsValidationSchema({ formFields, translate });
            const error = await schema
                .validate({ extraFields: { b2bExtraField_200: 101 } })
                .catch((e) => e.message);

            expect(translate).toHaveBeenCalledWith('max', {
                name: 'b2bExtraField_200',
                label: 'Employee Count',
                max: 100,
            });
            expect(error).toBeDefined();
        });

        it('passes for a valid integer value', async () => {
            const schema = getAddressExtraFieldsValidationSchema({ formFields, translate });
            const spy = jest.fn();

            await schema.validate({ extraFields: { b2bExtraField_200: 50 } }).then(spy);

            expect(spy).toHaveBeenCalled();
        });
    });

    describe('optional extra fields', () => {
        it('passes when optional string field is empty', async () => {
            const formFields: FormField[] = [
                {
                    custom: false,
                    default: '',
                    id: 'b2bExtraField_300',
                    label: 'Notes',
                    name: 'b2bExtraField_300',
                    required: false,
                },
            ];

            const schema = getAddressExtraFieldsValidationSchema({ formFields, translate });
            const spy = jest.fn();

            await schema.validate({ extraFields: { b2bExtraField_300: '' } }).then(spy);

            expect(spy).toHaveBeenCalled();
        });

        it('passes when optional integer field is undefined', async () => {
            const formFields: FormField[] = [
                {
                    custom: false,
                    default: '',
                    id: 'b2bExtraField_400',
                    label: 'Score',
                    name: 'b2bExtraField_400',
                    required: false,
                    type: 'integer',
                } as FormField,
            ];

            const schema = getAddressExtraFieldsValidationSchema({ formFields, translate });
            const spy = jest.fn();

            await schema.validate({ extraFields: { b2bExtraField_400: undefined } }).then(spy);

            expect(spy).toHaveBeenCalled();
        });
    });
});
