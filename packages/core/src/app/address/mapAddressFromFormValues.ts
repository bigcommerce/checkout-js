import { Address } from '@bigcommerce/checkout-sdk';

import { mapCustomFormFieldsFromFormValues } from '../formFields';

import { AddressFormValues } from './mapAddressToFormValues';

export default function mapAddressFromFormValues(formValues: AddressFormValues): Address {
    const { customFields, ...address } = formValues;
    const shouldSaveAddress = formValues.shouldSaveAddress;

    return {
        ...address,
        shouldSaveAddress,
        customFields: mapCustomFormFieldsFromFormValues(customFields),
    };
}
