import { type Address, type AddressKey } from '@bigcommerce/checkout-sdk';

import { mapCustomFormFieldsFromFormValues } from '../formFields';

import { type AddressFormValues } from './mapAddressToFormValues';

export default function mapAddressFromFormValues(formValues: AddressFormValues): Pick<Address, Exclude<AddressKey, 'extraFields'>> {
    const { customFields, extraFields, shouldSaveAddress, ...address } = formValues;

    // TODO: CHECKOUT-9890 Save extraFields extra fields into sessionStorage
    console.log("extraFields", extraFields);

    return {
        ...address,
        shouldSaveAddress,
        customFields: mapCustomFormFieldsFromFormValues(customFields),
    };
}
