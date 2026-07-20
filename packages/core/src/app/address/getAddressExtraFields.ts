import { type CustomerAddress } from '@bigcommerce/checkout-sdk';

interface AddressWithExtraFields {
    extraFields?: CustomerAddress['extraFields'];
    b2b?: CustomerAddress['b2b'];
}

// Extra fields as a flat array. B2B company addresses nest them under `b2b.extraFields`; others
// carry them on `extraFields`. Shared by isEqualAddress + mapAddressToFormValues so the precedence
// stays consistent.
export default function getAddressExtraFields(address?: AddressWithExtraFields) {
    return address?.b2b?.extraFields ?? address?.extraFields ?? [];
}
