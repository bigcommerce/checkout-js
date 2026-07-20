import { type CustomerAddress } from '@bigcommerce/checkout-sdk';

interface AddressWithExtraFields {
    extraFields?: CustomerAddress['extraFields'];
    b2b?: CustomerAddress['b2b'];
}

export default function getAddressExtraFields(address?: AddressWithExtraFields) {
    return address?.b2b?.extraFields ?? address?.extraFields ?? [];
}
