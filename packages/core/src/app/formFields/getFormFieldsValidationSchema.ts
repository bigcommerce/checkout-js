import { memoize } from '@bigcommerce/memoize';
import { object, ObjectSchema, string, StringSchema } from 'yup';

import getCustomFormFieldsValidationSchema, {
    FormFieldsValidationSchemaOptions,
} from './getCustomFormFieldsValidationSchema';

export const WHITELIST_REGEXP = /^[^<>]*$/;

export interface FormFieldValues {
    [key: string]: string | { [id: string]: any };
}

export default memoize(function getFormFieldsValidationSchema({
    formFields,
    translate = () => undefined,
    validateGoogleMapAutoCompleteMaxLength = false,
    validateAddressFields = false,
}: FormFieldsValidationSchemaOptions): ObjectSchema<FormFieldValues> {
    return object({
        ...formFields
            .filter(({ custom }) => !custom)
            .reduce((schema, { name, required, label, maxLength }) => {
                schema[name] = string();

                if (required) {
                    schema[name] = schema[name]
                        .trim()
                        .required(translate('required', { label, name}));
                }

                if (name === 'address1' && maxLength && validateGoogleMapAutoCompleteMaxLength) {
                    schema[name] = schema[name]
                        .max(maxLength, translate('max', { label, name, max: maxLength }));
                }

                if ((name === 'address1' || name === 'address2') && maxLength && validateAddressFields) {
                    schema[name] = schema[name]
                        .max(maxLength, translate('max', { label, name, max: maxLength }));
                }

                schema[name] = schema[name].matches(
                    WHITELIST_REGEXP,
                    translate('invalid', { name, label }),
                );

                return schema;
            }, {} as { [key: string]: StringSchema }),
    }).concat(
        getCustomFormFieldsValidationSchema({ formFields, translate }),
    ) as ObjectSchema<FormFieldValues>;
});
