import { FormField, LanguageService } from '@bigcommerce/checkout-sdk';
import { memoize } from '@bigcommerce/memoize';
import { array, date, number, object, string, ArraySchema, NumberSchema, ObjectSchema, Schema, StringSchema } from 'yup';

import { AddressFormValues } from './mapAddressToFormValues';
import DynamicFormFieldType from './DynamicFormFieldType';

export interface AddressValidationSchemaOptions {
    formFields: FormField[];
    language?: LanguageService;
}

const ERROR_KEYS: { [fieldName: string]: string } = {
    custom: 'address.custom',
    countryCode: 'address.country',
    firstName: 'address.first_name',
    lastName: 'address.last_name',
    company: 'address.company_name',
    address1: 'address.address_line_1',
    address2: 'address.address_line_1',
    city: 'address.city',
    stateOrProvince: 'address.state',
    stateOrProvinceCode: 'address.state',
    postalCode: 'address.postal_code',
    phone: 'address.phone_number',
};

export default memoize(function getAddressValidationSchema({
    formFields,
    language,
}: AddressValidationSchemaOptions): ObjectSchema<Partial<AddressFormValues>> {
    const translate: (
        key: string,
        data?: any
    ) => string | undefined = (key, data) => language && language.translate(key, data);

    return object({
        ...formFields
            .filter(({ custom }) => !custom)
            .reduce((schema, { name, required }) => {
                schema[name] = string();

                if (required) {
                    schema[name] = schema[name].required(
                        translate(`${ERROR_KEYS[name]}_required_error`)
                    );
                }

                return schema;
            },
            {} as { [key: string]: StringSchema }
        ),
        customFields: object(
            formFields
                .filter(({ custom }) => !!custom)
                .reduce((schema, { name, label, required, fieldType, type, min, max }) => {
                    const requiredErrorMessage = translate(`${ERROR_KEYS.custom}_required_error`, { label });
                    let maxValue: number | undefined;
                    let minValue: number | undefined;

                    if (type === 'date') {
                        schema[name] = date()
                            // Transform NaN values to undefined to avoid empty string (empty input) to fail date
                            // validation when it's optional
                            .strict(true)
                            .transform(value => value === '' ? undefined : value);
                    } else if (type === 'integer') {
                        schema[name] = number()
                            // Transform NaN values to undefined to avoid empty string (empty input) to fail number
                            // validation when it's optional
                            .strict(true)
                            .transform(value => isNaN(value) ? undefined : value);

                        maxValue = typeof max === 'number' ? max : undefined;
                        minValue = typeof min === 'number' ? min : undefined;
                    } else if (fieldType === DynamicFormFieldType.checkbox) {
                        schema[name] = array();
                    } else {
                        schema[name] = string();
                    }

                    if (maxValue !== undefined) {
                        schema[name] = (schema[name] as NumberSchema).max(maxValue,
                            translate(`${ERROR_KEYS.custom}_max_error`, { label, max: maxValue + 1 })
                        );
                    }

                    if (minValue !== undefined) {
                        schema[name] = (schema[name] as NumberSchema).min(minValue,
                            translate(`${ERROR_KEYS.custom}_min_error`, { label, min: minValue - 1 })
                        );
                    }

                    if (required) {
                        schema[name] = fieldType === DynamicFormFieldType.checkbox ?
                            (schema[name] as ArraySchema<string>).min(1, requiredErrorMessage) :
                            (schema[name] as ArraySchema<string>).required(requiredErrorMessage);
                    }

                    return schema;
                },
                {} as { [key: string]: Schema<any> }
            )
        ).nullable(true),
    }) as ObjectSchema<Partial<AddressFormValues>> ;
});
