import { type Address, type FormField } from '@bigcommerce/checkout-sdk';

import getAddressFormFieldsValidationSchema from './getAddressFormFieldsValidationSchema';
import mapAddressToFormValues from './mapAddressToFormValues';

export default function isValidAddress(
    address: Address,
    formFields: FormField[],
    validateMaxLength?: boolean,
    isNewPhoneValidationComponentEnabled?: boolean,
): boolean {
    const addressSchema = getAddressFormFieldsValidationSchema({
        formFields,
        validateMaxLength,
        isNewPhoneValidationComponentEnabled,
    });

    return addressSchema.isValidSync(mapAddressToFormValues(formFields, address));
}
