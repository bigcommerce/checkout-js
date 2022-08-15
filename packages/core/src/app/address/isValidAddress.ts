import { Address, FormField } from '@bigcommerce/checkout-sdk';

import getAddressFormFieldsValidationSchema from './getAddressFormFieldsValidationSchema';
import mapAddressToFormValues from './mapAddressToFormValues';

export default function isValidAddress(address: Address, formFields: FormField[]): boolean {
    const addressSchema = getAddressFormFieldsValidationSchema({ formFields });

    return addressSchema.isValidSync(mapAddressToFormValues(formFields, address));
}
