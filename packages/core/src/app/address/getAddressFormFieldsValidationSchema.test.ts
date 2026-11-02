import { type FormField } from '@bigcommerce/checkout-sdk';
import { type ValidationError } from 'yup';

import { getLanguageService } from '@bigcommerce/checkout/locale';

import { getShippingAddress } from '../shipping/shipping-addresses.mock';

import { getFormFields } from './formField.mock';
import getAddressFormFieldsValidationSchema from './getAddressFormFieldsValidationSchema';

describe('getAddressFormFieldsValidationSchema', () => {
    const countryField: FormField = {
        custom: false,
        default: '',
        fieldType: 'dropdown',
        id: 'field_21',
        label: 'Country',
        name: 'countryCode',
        options: { items: [{ value: 'US', label: 'United States' }] },
        required: true,
        type: 'array',
    };

    it('shows country required error when country is not one of the available countries', async () => {
        const schema = getAddressFormFieldsValidationSchema({
            formFields: [...getFormFields(), countryField],
            language: getLanguageService(),
        });

        const errors = await schema
            .validate({
                ...getShippingAddress(),
                countryCode: 'AU',
            })
            .catch((error: ValidationError) => error.message);

        expect(errors).toBe('Country is required');
    });
});
