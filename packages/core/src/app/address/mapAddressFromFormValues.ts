import { type Address } from '@bigcommerce/checkout-sdk';

import { B2BSessionStorage } from '@bigcommerce/checkout/utility';

import {
    mapAddressExtraFieldsFromFormValues,
    mapCustomFormFieldsFromFormValues,
} from '../formFields';

import { type AddressFormValues } from './mapAddressToFormValues';

export default function mapAddressFromFormValues(
    formValues: AddressFormValues,
    storageKey?: string,
): Address {
    const { customFields, extraFields, shouldSaveAddress, ...address } = formValues;

    if (storageKey && extraFields && Object.keys(extraFields).length > 0) {
        const fieldsToStore = {
            ...extraFields,
            shouldSaveAddress,
        };

        B2BSessionStorage.set(storageKey, fieldsToStore as Record<string, unknown>);
    }

    return {
        ...address,
        shouldSaveAddress,
        customFields: mapCustomFormFieldsFromFormValues(customFields),
        // Only carries extra-field values when the form collected them, which only
        // happens when the `hasAddressExtraFields` capability renders the inputs.
        // This keeps both billing and shipping/consignment calls sending extra
        // fields from a single place, and is a no-op for B2C.
        ...(extraFields ? { extraFields: mapAddressExtraFieldsFromFormValues(extraFields) } : {}),
    };
}
