import { type FormField, isExtraField } from '@bigcommerce/checkout-sdk/essential';
import { memoize } from '@bigcommerce/memoize';
import { number, object, type ObjectSchema, type Schema, string } from 'yup';

import { type TranslateValidationErrorFunction } from './getCustomFormFieldsValidationSchema';

export interface AddressExtraFieldsValidationSchemaOptions {
    formFields: FormField[];
    translate?: TranslateValidationErrorFunction;
}

export default memoize(function getAddressExtraFieldsValidationSchema({
    formFields,
    translate = () => undefined,
}: AddressExtraFieldsValidationSchemaOptions): ObjectSchema<Record<string, any>> {
    return object({
        extraFields: object(
            formFields
                .filter((field) => isExtraField(field))
                .reduce<Record<string, Schema<unknown>>>((schema, { name, label, required, type, maxLength, max }) => {
                    if (type === 'integer') {
                        let fieldSchema = number()
                            .transform((value) => (isNaN(value) ? undefined : value));

                        const maxValue = typeof max === 'number' ? max : undefined;

                        if (maxValue !== undefined) {
                            fieldSchema = fieldSchema.max(
                                maxValue,
                                translate('max', { label, name, max: maxValue }),
                            );
                        }

                        if (required) {
                            fieldSchema = fieldSchema.required(
                                translate('required', { name, label }),
                            );
                        }

                        schema[name] = fieldSchema;
                    } else {
                        let fieldSchema = string();

                        if (required) {
                            fieldSchema = fieldSchema
                                .trim()
                                .required(translate('required', { name, label }));
                        }

                        if (maxLength) {
                            fieldSchema = fieldSchema.max(
                                maxLength,
                                translate('max', { label, name, max: maxLength }),
                            );
                        }

                        schema[name] = fieldSchema;
                    }

                    return schema;
                }, {}),
        ).nullable(true),
    }) as ObjectSchema<Record<string, any>>;
});
