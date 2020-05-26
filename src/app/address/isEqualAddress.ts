import { Address, AddressRequestBody, BillingAddress, CustomerAddress } from '@bigcommerce/checkout-sdk';
import { isEqual, omit } from 'lodash';

type ComparableAddress = CustomerAddress | Address | BillingAddress | AddressRequestBody;
type ComparableAddressFields = keyof CustomerAddress | keyof Address | keyof BillingAddress;

export default function isEqualAddress(address1?: ComparableAddress, address2?: ComparableAddress): boolean {
    if (!address1 || !address2) {
        return false;
    }

    return isEqual(
        normalizeAddress(address1),
        normalizeAddress(address2)
    );
}

function normalizeAddress(address: ComparableAddress) {
    const ignoredFields: ComparableAddressFields[] = ['id', 'shouldSaveAddress', 'stateOrProvinceCode', 'type', 'email'];

    return omit(
        {
            ...address,
            customFields: (address.customFields || []).filter(({ fieldValue }) => !!fieldValue),
        },
        ignoredFields
    );
}
