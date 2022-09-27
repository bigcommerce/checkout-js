import { ObjectSchema, ValidationError } from 'yup';

import { getFormFields } from '../address/formField.mock';
import { getShippingAddress } from '../shipping/shipping-addresses.mock';

import getCustomFormFieldsValidationSchema, {
    CustomFormFieldValues,
    TranslateValidationErrorFunction,
} from './getCustomFormFieldsValidationSchema';
import getFormFieldsValidationSchema, { FormFieldValues } from './getFormFieldsValidationSchema';

describe('getCustomFormFieldsValidationSchema', () => {
    const formFields = getFormFields();
    let translate: TranslateValidationErrorFunction;

    beforeEach(() => {
        translate = jest.fn();
    });

    describe('when enforce validate safe input', () => {
        let schema: ObjectSchema<Partial<FormFieldValues>>;

        beforeEach(() => {
            schema = getFormFieldsValidationSchema({
                formFields,
                translate,
            });
        });

        it('throws if invalid characters are present', async () => {
            const errors = await schema
                .validate({
                    ...getShippingAddress(),
                    firstName: 'Luis<>',
                })
                .catch((error: ValidationError) => error.message);

            expect(errors).toBe('firstName must match the following: "/^[^<>]*$/"');
        });

        it('does not throw if valid characters are present', async () => {
            expect(
                await schema.isValid({
                    ...getShippingAddress(),
                    firstName: "Luis{}:;()`/-'",
                }),
            ).toBeTruthy();
        });
    });

    describe('when custom integer field is present', () => {
        let schema: ObjectSchema<CustomFormFieldValues>;

        beforeEach(() => {
            schema = getCustomFormFieldsValidationSchema({
                formFields: [
                    ...formFields,
                    {
                        custom: true,
                        min: 3,
                        max: 5,
                        fieldType: 'text',
                        id: 'field_100',
                        name: 'field_100',
                        required: false,
                        type: 'integer',
                    } as any,
                ],
                translate,
            });
        });

        it('throws if min validation fails', async () => {
            const errors = await schema
                .validate({
                    ...getShippingAddress(),
                    customFields: {
                        field_100: 2,
                    },
                })
                .catch((error: ValidationError) => error.message);

            expect(errors).toBe('customFields.field_100 must be greater than or equal to 3');
        });

        it('throws if max validation fails', async () => {
            const errors = await schema
                .validate({
                    ...getShippingAddress(),
                    customFields: {
                        field_100: 6,
                    },
                })
                .catch((error: ValidationError) => error.message);

            expect(errors).toBe('customFields.field_100 must be less than or equal to 5');
        });

        it('resolves if min/max validation pass', async () => {
            const spy = jest.fn();

            await schema
                .validate({
                    ...getShippingAddress(),
                    customFields: {
                        field_100: 4,
                    },
                })
                .then(spy);

            expect(spy).toHaveBeenCalled();
        });
    });

    describe('when custom radio field is present', () => {
        let schema: ObjectSchema<CustomFormFieldValues>;

        beforeEach(() => {
            schema = getCustomFormFieldsValidationSchema({
                formFields: [
                    ...formFields,
                    {
                        options: { items: [{ value: 'x' }, { value: 'y' }] },
                        fieldType: 'dropdown',
                        id: 'field_100',
                        name: 'field_100',
                        required: true,
                        type: 'string',
                        custom: true,
                    } as any,
                ],
                translate,
            });
        });

        it('throws if value empty', async () => {
            const errors = await schema
                .validate({
                    ...getShippingAddress(),
                    customFields: {
                        field_100: '',
                    },
                })
                .catch((error: ValidationError) => error.message);

            expect(errors).toBe('customFields.field_100 is a required field');
        });

        it('resolves if valid value', async () => {
            const spy = jest.fn();

            await schema
                .validate({
                    ...getShippingAddress(),
                    customFields: {
                        field_100: 'x',
                    },
                })
                .then(spy);

            expect(spy).toHaveBeenCalled();
        });
    });
});
