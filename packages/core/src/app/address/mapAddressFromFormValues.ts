import { type Address, type AddressKey } from '@bigcommerce/checkout-sdk';

import { mapCustomFormFieldsFromFormValues } from '../formFields';

import { B2BExtraAddressFieldsSessionStorage } from './B2BExtraAddressFieldsSessionStorage';
import { type AddressFormValues } from './mapAddressToFormValues';

export default function mapAddressFromFormValues(formValues: AddressFormValues, storageKey?: string): Pick<Address, Exclude<AddressKey, 'extraFields'>> {
    const { customFields, extraFields, shouldSaveAddress, ...address } = formValues;

    if (storageKey && extraFields && Object.keys(extraFields).length > 0) {
        B2BExtraAddressFieldsSessionStorage.setFields(storageKey, extraFields as Record<string, unknown>);
    }

    return {
        ...address,
        shouldSaveAddress,
        customFields: mapCustomFormFieldsFromFormValues(customFields),
    };
}
