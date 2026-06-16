import { type Address, type AddressKey } from '@bigcommerce/checkout-sdk';

import { B2BSessionStorage } from '@bigcommerce/checkout/utility';

import { mapCustomFormFieldsFromFormValues } from '../formFields';

import { type AddressFormValues } from './mapAddressToFormValues';

export default function mapAddressFromFormValues(
    formValues: AddressFormValues,
    storageKey?: string,
): Pick<Address, Exclude<AddressKey, 'extraFields'>> {
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
    };
}
