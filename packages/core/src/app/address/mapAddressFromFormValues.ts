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
        extraFields: mapAddressExtraFieldsFromFormValues(extraFields),
    };
}
