import { createLanguageService } from '@bigcommerce/checkout-sdk';
import { type ValidationError } from 'yup';

import { getAddressFormFields } from './formField.mock';
import getAddressFormFieldsValidationSchema from './getAddressFormFieldsValidationSchema';

describe('getAddressFormFieldsValidationSchema', () => {
    const formFields = getAddressFormFields();
    const language = createLanguageService();

    describe('phone number validation', () => {
        it('accepts phone numbers with only digits', async () => {
            const schema = getAddressFormFieldsValidationSchema({ formFields, language });
            
            const result = await schema.validateAt('phone', { phone: '5551234567' });
            
            expect(result).toBe('5551234567');
        });

        it('accepts phone numbers with leading + and digits', async () => {
            const schema = getAddressFormFieldsValidationSchema({ formFields, language });
            
            const result = await schema.validateAt('phone', { phone: '+15551234567' });
            
            expect(result).toBe('+15551234567');
        });

        it('accepts international phone numbers', async () => {
            const schema = getAddressFormFieldsValidationSchema({ formFields, language });
            
            const validNumbers = [
                '+1234567890',
                '+441234567890',
                '+86123456789',
                '1234567890',
            ];

            for (const number of validNumbers) {
                const result = await schema.validateAt('phone', { phone: number });
                expect(result).toBe(number);
            }
        });

        it('accepts phone number with only + when field is NOT required', async () => {
            const schema = getAddressFormFieldsValidationSchema({ formFields, language });
            
            // Since phone is not required in formFields, '+' should pass
            const result = await schema.validateAt('phone', { phone: '+' });
            
            expect(result).toBe('+');
        });

        it('rejects phone number with only + when field is required with correct error message', async () => {
            // Create a required phone field
            const requiredPhoneFields = [
                {
                    custom: false,
                    default: '',
                    id: 'phone',
                    label: 'Phone',
                    name: 'phone',
                    required: true,
                },
            ];
            
            const schema = getAddressFormFieldsValidationSchema({ 
                formFields: requiredPhoneFields, 
                language 
            });
            
            // '+' alone should trigger required validation error (NOT invalid characters error)
            const error = await schema
                .validateAt('phone', { phone: '+' })
                .catch((err: Error) => err.message);
            
            expect(error).toContain('Phone Number');
            expect(error).toContain('required');
            expect(error).not.toContain('invalid characters');
        });

        it('rejects phone numbers with letters', async () => {
            const schema = getAddressFormFieldsValidationSchema({ formFields, language });
            
            await expect(
                schema.validateAt('phone', { phone: '555abc1234' })
            ).rejects.toThrow();
        });

        it('rejects phone numbers with special characters (except +)', async () => {
            const schema = getAddressFormFieldsValidationSchema({ formFields, language });
            
            const invalidNumbers = [
                '(555) 123-4567',  // parentheses and dashes
                '555.123.4567',    // dots
                '555-123-4567',    // dashes
                '+1-555-123-4567', // dashes after +
                '+1 555 123 4567', // spaces
            ];

            for (const number of invalidNumbers) {
                await expect(
                    schema.validateAt('phone', { phone: number })
                ).rejects.toThrow();
            }
        });

        it('rejects phone numbers with + in the middle', async () => {
            const schema = getAddressFormFieldsValidationSchema({ formFields, language });
            
            await expect(
                schema.validateAt('phone', { phone: '555+1234' })
            ).rejects.toThrow();
        });

        it('rejects phone numbers with multiple + characters', async () => {
            const schema = getAddressFormFieldsValidationSchema({ formFields, language });
            
            await expect(
                schema.validateAt('phone', { phone: '++15551234' })
            ).rejects.toThrow();
        });

        it('accepts empty phone number when not required', async () => {
            const schema = getAddressFormFieldsValidationSchema({ formFields, language });
            
            const result = await schema.validateAt('phone', { phone: '' });
            
            expect(result).toBe('');
        });

        it('accepts undefined phone number when not required', async () => {
            const schema = getAddressFormFieldsValidationSchema({ formFields, language });
            
            const result = await schema.validateAt('phone', { phone: undefined });
            
            expect(result).toBeUndefined();
        });

        it('uses translated error message for invalid characters', async () => {
            const schema = getAddressFormFieldsValidationSchema({ formFields, language });
            
            const error = await schema
                .validateAt('phone', { phone: '555-1234' })
                .catch((err: ValidationError) => err.message);
            
            expect(error).toContain('Phone Number');
        });
    });

    describe('phone field with tel name', () => {
        it('applies validation to tel field name', async () => {
            const telFormFields = [
                {
                    custom: false,
                    default: '',
                    id: 'tel',
                    label: 'Telephone',
                    name: 'tel',
                    required: false,
                },
            ];
            
            const schema = getAddressFormFieldsValidationSchema({ 
                formFields: telFormFields, 
                language 
            });
            
            // Should accept valid format
            const validResult = await schema.validateAt('tel', { tel: '+15551234567' });
            expect(validResult).toBe('+15551234567');
            
            // '+' alone should be accepted when not required
            const plusResult = await schema.validateAt('tel', { tel: '+' });
            expect(plusResult).toBe('+');
        });

        it('rejects tel field with only + when field is required with correct error message', async () => {
            const requiredTelFields = [
                {
                    custom: false,
                    default: '',
                    id: 'tel',
                    label: 'Telephone',
                    name: 'tel',
                    required: true,
                },
            ];
            
            const schema = getAddressFormFieldsValidationSchema({ 
                formFields: requiredTelFields, 
                language 
            });
            
            // '+' alone should trigger required validation error
            const error = await schema
                .validateAt('tel', { tel: '+' })
                .catch((err: Error) => err.message);
            
            expect(error).toBeDefined();
            expect(error).toContain('required');
        });
    });
});
