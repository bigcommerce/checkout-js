import { type Address } from '@bigcommerce/checkout-sdk';

import {
    mapAddressExtraFieldsFromFormValues,
    mapCustomFormFieldsFromFormValues,
} from '../formFields';

import { encodeAddressForWrite } from './addressLabelUtils';
import { type AddressFormValues } from './mapAddressToFormValues';

export default function mapAddressFromFormValues(formValues: AddressFormValues): Address {
    const { customFields, extraFields, shouldSaveAddress, label, ...address } = formValues;

    // encodeAddressForWrite folds `label` into `company`; the encoded output also lets the
    // isEqualAddress change-detection compare like-for-like against the stored (encoded) address.
    return encodeAddressForWrite({
        ...address,
        label,
        shouldSaveAddress,
        customFields: mapCustomFormFieldsFromFormValues(customFields),
        // Only carries extra-field values when the form collected them, which only
        // happens when the `hasAddressExtraFields` capability renders the inputs.
        // This keeps both billing and shipping/consignment calls sending extra
        // fields from a single place, and is a no-op for B2C.
        ...(extraFields ? { extraFields: mapAddressExtraFieldsFromFormValues(extraFields) } : {}),
    });
}
