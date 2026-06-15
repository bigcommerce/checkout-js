import {
    type Address,
    type AddressKey,
    B2B_EXTRA_FIELD_PREFIX,
    type FormField,
    isExtraField,
} from '@bigcommerce/checkout-sdk/essential';

import { DynamicFormFieldType } from '@bigcommerce/checkout/ui';
import { B2BSessionStorage } from '@bigcommerce/checkout/utility';

export type AddressFormValues = Pick<
    Address,
    Exclude<AddressKey, 'customFields' | 'extraFields'>
> & {
    customFields: { [id: string]: any };
    extraFields?: { [id: string]: any };
};

export default function mapAddressToFormValues(
    fields: FormField[],
    address?: Address,
    storageKey?: string,
): AddressFormValues {
    const storedExtraFields = storageKey ? B2BSessionStorage.get(storageKey) : undefined;

    const values = {
        ...fields.reduce((addressFormValues, field) => {
            const { name, custom, fieldType, default: defaultValue } = field;

            if (isExtraField(field)) {
                if (!addressFormValues.extraFields) {
                    addressFormValues.extraFields = {};
                }

                // SDK schema prefixes extra-field names with `B2B_EXTRA_FIELD_PREFIX`, but `Address.extraFields[i].fieldId`
                // is the raw id — strip the prefix when matching.
                const rawFieldId = name.startsWith(B2B_EXTRA_FIELD_PREFIX)
                    ? name.slice(B2B_EXTRA_FIELD_PREFIX.length)
                    : name;
                const extraFieldValue = address?.extraFields?.find(
                    ({ fieldId }) => fieldId === rawFieldId,
                )?.fieldValue;

                addressFormValues.extraFields[name] =
                    extraFieldValue ?? storedExtraFields?.[name] ?? defaultValue ?? '';

                return addressFormValues;
            }

            if (custom) {
                if (!addressFormValues.customFields) {
                    addressFormValues.customFields = {};
                }

                const field =
                    address &&
                    address.customFields &&
                    address.customFields.find(({ fieldId }) => fieldId === name);

                const fieldValue = field && field.fieldValue;

                addressFormValues.customFields[name] = getValue(
                    fieldType,
                    fieldValue,
                    defaultValue,
                );

                return addressFormValues;
            }

            if (isSystemAddressFieldName(name)) {
                const fieldValue = address && address[name];

                addressFormValues[name] =
                    getValue(fieldType, fieldValue, defaultValue)?.toString() || '';
            }

            return addressFormValues;
        }, {} as AddressFormValues),
    };

    values.shouldSaveAddress =
        address && address.shouldSaveAddress !== undefined ? address.shouldSaveAddress : true;

    // Manually backfill stateOrProvince to avoid Formik warning (uncontrolled to controlled input)
    if (values.stateOrProvince === undefined) {
        values.stateOrProvince = '';
    }

    if (values.stateOrProvinceCode === undefined) {
        values.stateOrProvinceCode = '';
    }

    return values;
}

function getValue(
    fieldType?: string,
    fieldValue?: string | string[] | number,
    defaultValue?: string,
): string | string[] | number | Date | undefined {
    if (fieldValue === undefined || fieldValue === null) {
        return getDefaultValue(fieldType, defaultValue);
    }

    if (fieldType === DynamicFormFieldType.DATE && typeof fieldValue === 'string') {
        if (fieldValue) {
            const [year, month, day] = fieldValue.split('-');

            return new Date(Number(year), Number(month) - 1, Number(day));
        }

        return undefined;
    }

    return fieldValue;
}

function getDefaultValue(fieldType?: string, defaultValue?: string): string | string[] | Date {
    if (defaultValue && fieldType === DynamicFormFieldType.DATE) {
        return new Date(defaultValue);
    }

    if (fieldType === DynamicFormFieldType.CHECKBOX) {
        return [];
    }

    return defaultValue || '';
}

function isSystemAddressFieldName(
    fieldName: string,
): fieldName is Exclude<keyof Address, 'customFields' | 'shouldSaveAddress' | 'extraFields'> {
    return (
        fieldName !== 'customFields' &&
        fieldName !== 'shouldSaveAddress' &&
        fieldName !== 'extraFields'
    );
}
