import { Address, FormField } from '@bigcommerce/checkout-sdk';

import getAddressFormFieldsValidationSchema from './getAddressFormFieldsValidationSchema';
import mapAddressToFormValues from './mapAddressToFormValues';

export default function isValidAddress(
    address: Address,
    formFields: FormField[],
    validateAddressFields?: boolean
): boolean {
    const addressSchema = getAddressFormFieldsValidationSchema({ formFields, validateAddressFields });

    return addressSchema.isValidSync(mapAddressToFormValues(formFields, address));
}
