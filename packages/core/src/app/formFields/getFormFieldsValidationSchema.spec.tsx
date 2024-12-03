import { ObjectSchema, ValidationError } from 'yup';

import { getFormFields } from '../address/formField.mock';
import { getShippingAddress } from '../shipping/shipping-addresses.mock';

import { TranslateValidationErrorFunction } from './getCustomFormFieldsValidationSchema';
import {
    FormFieldValues,
    default as getFormFieldsValidationSchema,
} from './getFormFieldsValidationSchema';

describe('getFormFielsValidationSchema', () => {
    const formFields = getFormFields();
    let translate: TranslateValidationErrorFunction;

    beforeEach(() => {
        translate = jest.fn();
    });

    it('resolves for a valid address', async () => {
        const schema = getFormFieldsValidationSchema({ formFields, translate });
        const spy = jest.fn();

        await schema.validate(getShippingAddress()).then(spy);

        expect(spy).toHaveBeenCalled();
    });

    it('uses provided translation key when a required field is missing', async () => {
        const schema = getFormFieldsValidationSchema({
            formFields,
            translate,
        });

        const errors = await schema
            .validate({
                ...getShippingAddress(),
                firstName: undefined,
            })
            .catch((error: ValidationError) => error.message);

        expect(errors).toBe('firstName is a required field');
    });

    it('throws if missing required field with translated error', async () => {
        const schema = getFormFieldsValidationSchema({ formFields, translate });

        const errors = await schema
            .validate({
                ...getShippingAddress(),
                firstName: undefined,
            })
            .catch((error: ValidationError) => error.message);

        expect(translate).toHaveBeenCalledWith('required', {
            label: 'First Name',
            name: 'firstName',
        });

        expect(errors).toBe('firstName is a required field');
    });

    describe('when custom integer field is present', () => {
        let schema: ObjectSchema<Partial<FormFieldValues>>;

        beforeEach(() => {
            schema = getFormFieldsValidationSchema({
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

    describe('google autocomplete validation', () => {
        it('throws error for google maps autocomplete validation for max length', async () => {
            const formFieldsWithMaxLength = formFields.map(field => {
                const { name } = field;
                
                return name === 'address1' ? { ...field, maxLength: 20 } : field;
            });
    
    
            const schema = getFormFieldsValidationSchema({ formFields: formFieldsWithMaxLength, translate, validateGoogleMapAutoCompleteMaxLength: true });
            const errors = await schema
                .validate({
                    ...getShippingAddress(),
                    address1: 'this is a long address 1 from somewhere',
                })
                .catch((error: ValidationError) => error.message);
            

            expect(translate).toHaveBeenCalledWith('max', {
                label: 'Address Line 1',
                name: 'address1',
                max: 20,
            });
            expect(errors).toBe('address1 must be at most 20 characters');
        });

        it('throws no error for max length validation if google autocomplete is not enabled', async () => {
            const spy = jest.fn();
            const formFieldsWithMaxLength = formFields.map(field => {
                const { name } = field;
                
                return name === 'address1' ? { ...field, maxLength: 20 } : field;
            });
    
            const schema = getFormFieldsValidationSchema({ formFields: formFieldsWithMaxLength, translate });
            
            await schema
                .validate({
                    ...getShippingAddress(),
                    address1: 'this is a long address 1 from somewhere',
                })
                .then(spy);

            expect(spy).toHaveBeenCalled();
        });
    });

    describe('address fields max length validation', () => {
        it('throws error for address field 1 validation for max length', async () => {
            const formFieldsWithMaxLength = formFields.map(field => {
                const { name } = field;
                
                if(name === 'address1') {
                    return { ...field, maxLength: 15 };
                }
                
                return field;
            });
    
            const schema = getFormFieldsValidationSchema({ formFields: formFieldsWithMaxLength, translate, validateAddressFields: true });
            const errors = await schema
                .validate({
                    ...getShippingAddress(),
                    address1: 'this is a long address 1 from somewhere',
                })
                .catch((error: ValidationError) => error.message);
            

            expect(translate).toHaveBeenCalledWith('max', {
                label: 'Address Line 1',
                name: 'address1',
                max: 15,
            });
            expect(errors).toBe('address1 must be at most 15 characters');
        });

        it('throws error for address field 2 validation for max length', async () => {
            const formFieldsWithMaxLength = formFields.map(field => {
                const { name } = field;
                
                if(name === 'address2') {
                    return { ...field, maxLength: 10 };
                }
                
                return field;
            });
    
            const schema = getFormFieldsValidationSchema({ formFields: formFieldsWithMaxLength, translate, validateAddressFields: true });
            const errors = await schema
                .validate({
                    ...getShippingAddress(),
                    address2: 'this is a long address 2 from somewhere',
                })
                .catch((error: ValidationError) => error.message);
            

            expect(translate).toHaveBeenCalledWith('max', {
                label: 'Address Line 2',
                name: 'address2',
                max: 10,
            });
            expect(errors).toBe('address2 must be at most 10 characters');
        });

        it('throws no error for max length validation if address validation experiment is not enabled', async () => {
            const spy = jest.fn();
            const formFieldsWithMaxLength = formFields.map(field => {
                const { name } = field;
                
                return name === 'address1' ? { ...field, maxLength: 20 } : field;
            });
    
            const schema = getFormFieldsValidationSchema({ formFields: formFieldsWithMaxLength, translate });
            
            await schema
                .validate({
                    ...getShippingAddress(),
                    address1: 'this is a long address 1 from somewhere',
                })
                .then(spy);

            expect(spy).toHaveBeenCalled();
        });
    });
});
