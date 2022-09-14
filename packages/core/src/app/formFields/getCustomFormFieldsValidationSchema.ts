import { FormField } from '@bigcommerce/checkout-sdk';
import { memoize } from '@bigcommerce/memoize';
import {
    array,
    ArraySchema,
    date,
    number,
    NumberSchema,
    object,
    ObjectSchema,
    Schema,
    string,
} from 'yup';

import { DynamicFormFieldType } from '../ui/form';

export type TranslateValidationErrorFunction = (
    validationType: 'max' | 'min' | 'required' | 'invalid',
    field: {
        name: string;
        label: string;
        min?: number;
        max?: number;
    },
) => string | undefined;

export interface FormFieldsValidationSchemaOptions {
    formFields: FormField[];
    translate?: TranslateValidationErrorFunction;
}

export interface CustomFormFieldValues {
    customFields: CustomFormFields;
}

export interface CustomFormFields {
    [id: string]: string | string[] | number;
}

export default memoize(function getCustomFormFieldsValidationSchema({
    formFields,
    translate = () => undefined,
}: FormFieldsValidationSchemaOptions): ObjectSchema<CustomFormFieldValues> {
    return object({
        customFields: object(
            formFields
                .filter(({ custom }) => !!custom)
                .reduce((schema, { name, label, required, fieldType, type, min, max }) => {
                    let maxValue: number | undefined;
                    let minValue: number | undefined;

                    if (type === 'date') {
                        schema[name] = date()
                            // Transform NaN values to undefined to avoid empty string (empty input) to fail date
                            // validation when it's optional
                            .strict(true)
                            .nullable(true)
                            .transform((value, originalValue) =>
                                originalValue === '' ? null : value,
                            );
                    } else if (type === 'integer') {
                        schema[name] = number()
                            // Transform NaN values to undefined to avoid empty string (empty input) to fail number
                            // validation when it's optional
                            .strict(true)
                            .transform((value) => (isNaN(value) ? undefined : value));

                        maxValue = typeof max === 'number' ? max : undefined;
                        minValue = typeof min === 'number' ? min : undefined;
                    } else if (fieldType === DynamicFormFieldType.checkbox) {
                        schema[name] = array();
                    } else {
                        schema[name] = string();
                    }

                    if (maxValue !== undefined) {
                        schema[name] = (schema[name] as NumberSchema).max(
                            maxValue,
                            translate('max', { label, name, max: maxValue + 1 }),
                        );
                    }

                    if (minValue !== undefined) {
                        schema[name] = (schema[name] as NumberSchema).min(
                            minValue,
                            translate('min', { label, name, min: minValue - 1 }),
                        );
                    }

                    if (required) {
                        const requiredErrorMessage = translate('required', { name, label });

                        schema[name] =
                            fieldType === DynamicFormFieldType.checkbox
                                ? (schema[name] as ArraySchema<string>).min(1, requiredErrorMessage)
                                : (schema[name] as ArraySchema<string>).required(
                                      requiredErrorMessage,
                                  );
                    }

                    return schema;
                }, {} as { [key: string]: Schema<any> }),
        ).nullable(true),
    }) as ObjectSchema<CustomFormFieldValues>;
});
