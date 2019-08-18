import { Address, FormField } from '@bigcommerce/checkout-sdk';

import getAddressValidationSchema from './getAddressValidationSchema';
import mapAddressToFormValues from './mapAddressToFormValues';

export default function isValidAddress(address: Address, formFields: FormField[]): boolean {
    const addressSchema = getAddressValidationSchema({ formFields });

    return addressSchema.isValidSync(mapAddressToFormValues(formFields, address));
}
