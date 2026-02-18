import { memoize } from '@bigcommerce/memoize';
import { object, type ObjectSchema, string, type StringSchema } from 'yup';

import getCustomFormFieldsValidationSchema, {
    type FormFieldsValidationSchemaOptions,
} from './getCustomFormFieldsValidationSchema';

export const WHITELIST_REGEXP = /^[^<>]*$/;

export interface FormFieldValues {
    [key: string]: string | { [id: string]: any };
}

export default memoize(function getFormFieldsValidationSchema({
    formFields,
    translate = () => undefined,
    validateMaxLength = false,
}: FormFieldsValidationSchemaOptions): ObjectSchema<FormFieldValues> {
    return object({
        ...formFields
            .filter(({ custom }) => !custom)
            .reduce((schema, { name, required, label, maxLength }) => {
                schema[name] = string();

                if (required) {
                    schema[name] = schema[name]
                        .trim()
                        .required(translate('required', { label, name }));
                }

                if (validateMaxLength && maxLength) {
                    schema[name] = schema[name]
                        .max(maxLength, translate('max', { label, name, max: maxLength }));
                } else if ((name === 'address1' || name === 'address2') && maxLength) {
                    schema[name] = schema[name]
                        .max(maxLength, translate('max', { label, name, max: maxLength }));
                }

                schema[name] = schema[name].matches(
                    WHITELIST_REGEXP,
                    translate('invalid', { name, label }),
                );

                return schema;
                // eslint-disable-next-line @typescript-eslint/prefer-reduce-type-parameter
            }, {} as { [key: string]: StringSchema }),
    }).concat(
        getCustomFormFieldsValidationSchema({ formFields, translate }),
    ) as ObjectSchema<FormFieldValues>;
});
