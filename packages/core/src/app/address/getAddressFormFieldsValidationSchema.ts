import { type FormField, type LanguageService } from '@bigcommerce/checkout-sdk';
import { memoize } from 'lodash';
import { type ObjectSchema } from 'yup';

import {
    type FormFieldValues,
    getFormFieldsValidationSchema,
    type TranslateValidationErrorFunction,
} from '../formFields';

export interface AddressFormFieldsValidationSchemaOptions {
    formFields: FormField[];
    language?: LanguageService;
}

export function getTranslateAddressError(
    language?: LanguageService,
): TranslateValidationErrorFunction {
    const requiredFieldErrorTranslationIds: { [fieldName: string]: string } = {
        countryCode: 'address.country',
        firstName: 'address.first_name',
        lastName: 'address.last_name',
        company: 'address.company_name',
        address1: 'address.address_line_1',
        address2: 'address.address_line_2',
        city: 'address.city',
        stateOrProvince: 'address.state',
        stateOrProvinceCode: 'address.state',
        postalCode: 'address.postal_code',
        phone: 'address.phone_number',
    };

    return (type, { label, name, min, max }) => {
        if (!language) {
            return;
        }

        if (type === 'required') {
            if (requiredFieldErrorTranslationIds[name]) {
                return language.translate(
                    `${requiredFieldErrorTranslationIds[name]}_required_error`,
                );
            }

            return language.translate(`address.custom_required_error`, { label });
        }

        if (type === 'max' && max) {
            return language.translate(`address.custom_max_error`, { label, max });
        }

        if (type === 'min' && min) {
            return language.translate(`address.custom_min_error`, { label, min });
        }

        if (type === 'invalid') {
            return language.translate(`address.invalid_characters_error`, { label });
        }
    };
}

export default memoize(function getAddressFormFieldsValidationSchema({
    formFields,
    language,
}: AddressFormFieldsValidationSchemaOptions): ObjectSchema<FormFieldValues> {
    const baseSchema = getFormFieldsValidationSchema({
        formFields,
        translate: getTranslateAddressError(language),
    });

    // Add phone number validation to enforce numbers and optional '+' prefix only
    const phoneField = formFields.find((field) => field.name === 'phone' || field.name === 'tel');
    if (phoneField && language) {
        const phoneLabel = language.translate('address.phone_number_label');
        const fieldName = phoneField.name;
        
        // Get the schema for the appropriate field name (phone or tel)
        if (baseSchema.fields[fieldName]) {
            const phoneSchema = baseSchema.fields[fieldName] as any;
            baseSchema.fields[fieldName] = phoneSchema
                // Transform '+' alone to empty string so required validation catches it
                .transform((value: string | undefined) => {
                    if (value === '+') {
                        return '';
                    }
                    return value;
                })
                .test(
                    'phone-numbers-only',
                    language.translate('address.invalid_characters_error', { label: phoneLabel }),
                    (value: string | undefined) => {
                        // Allow empty values (handled by required validation if needed)
                        if (!value || value === '') {
                            return true;
                        }
                        // Allow optional '+' at start, followed by one or more digits
                        return /^\+?\d+$/.test(value);
                    },
                );
        }
    }

    return baseSchema;
});
