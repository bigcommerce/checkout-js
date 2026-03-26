import { type Address, type AddressKey, type FormField } from '@bigcommerce/checkout-sdk';
import { isExtraFormField } from '@bigcommerce/checkout-sdk/essential';

import { mapCustomFormFieldsFromFormValues } from '../formFields';

import { type AddressFormValues } from './mapAddressToFormValues';

export default function mapAddressFromFormValues(formValues: AddressFormValues): Pick<Address, Exclude<AddressKey, 'extraFields'>> {
    const { customFields, extraFields, shouldSaveAddress, ...address } = formValues;

    // TODO: CHECKOUT-9890 Save extraFields extra fields into sessionStorage
    console.log("extraFields", extraFields);

    // TODO: CHECKOUT-9890 Save removed extra fields into sessionStorage
    for (const key of Object.keys(address)) {
        if (isExtraFormField({ name: key } as FormField)) {
            // Adding console log for testing purpose before implementing CHECKOUT-9890
            // eslint-disable-next-line no-console
            console.log(`Removed extra field ${key}:${(address as Record<string, unknown>)[key]} from address form values`);

            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete (address as Record<string, unknown>)[key];
        }
    }

    return {
        ...address,
        shouldSaveAddress,
        customFields: mapCustomFormFieldsFromFormValues(customFields),
    };
}
