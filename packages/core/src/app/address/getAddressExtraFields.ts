import { type CustomerAddress } from '@bigcommerce/checkout-sdk';

interface AddressWithExtraFields {
    extraFields?: CustomerAddress['extraFields'];
}

export default function getAddressExtraFields(address?: AddressWithExtraFields) {
    return address?.extraFields ?? [];
}
