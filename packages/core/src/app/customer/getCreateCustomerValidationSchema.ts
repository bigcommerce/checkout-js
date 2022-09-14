import { FormField, LanguageService } from '@bigcommerce/checkout-sdk';
import { memoize } from '@bigcommerce/memoize';
import { object, ObjectSchema, string } from 'yup';

import {
    CustomFormFieldValues,
    getCustomFormFieldsValidationSchema,
    TranslateValidationErrorFunction,
} from '../formFields';

import getEmailValidationSchema from './getEmailValidationSchema';
import { PasswordRequirements } from './getPasswordRequirements';

export type CreateAccountFormValues = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    acceptsMarketingEmails?: string[];
    token?: string;
} & CustomFormFieldValues;

export interface CreateCustomerValidationSchema {
    formFields: FormField[];
    language: LanguageService;
    passwordRequirements: PasswordRequirements;
}

function getTranslateCreateCustomerError(
    language?: LanguageService,
): TranslateValidationErrorFunction {
    return (type, { label, min, max }) => {
        if (!language) {
            return;
        }

        if (type === 'required') {
            return language.translate('customer.required_error', { label });
        }

        if (type === 'max' && max) {
            return language.translate('customer.max_error', { label, max });
        }

        if (type === 'min' && min) {
            return language.translate('customer.min_error', { label, min });
        }

        if (type === 'invalid') {
            return language.translate('customer.invalid_characters_error', { label });
        }
    };
}

export default memoize(function getCreateCustomerValidationSchema({
    formFields,
    language,
    passwordRequirements: { description, numeric, alpha, minLength },
}: CreateCustomerValidationSchema): ObjectSchema<CreateAccountFormValues> {
    return object({
        firstName: string().required(language.translate('address.first_name_required_error')),
        lastName: string().required(language.translate('address.last_name_required_error')),
        password: string()
            .required(language.translate('customer.password_required_error') || description)
            .matches(
                numeric,
                language.translate('customer.password_number_required_error') || description,
            )
            .matches(
                alpha,
                language.translate('customer.password_letter_required_error') || description,
            )
            .min(
                minLength,
                language.translate('customer.password_under_minimum_length_error' || description),
            )
            .max(100, language.translate('customer.password_over_maximum_length_error')),
    })
        .concat(getEmailValidationSchema({ language }))
        .concat(
            getCustomFormFieldsValidationSchema({
                formFields,
                translate: getTranslateCreateCustomerError(language),
            }),
        );
});
