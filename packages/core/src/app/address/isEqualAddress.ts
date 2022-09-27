import {
    Address,
    AddressRequestBody,
    BillingAddress,
    CustomerAddress,
} from '@bigcommerce/checkout-sdk';
import { isEqual, omit } from 'lodash';

type ComparableAddress = CustomerAddress | Address | BillingAddress | AddressRequestBody;
type ComparableAddressFields = keyof CustomerAddress | keyof Address | keyof BillingAddress;

export default function isEqualAddress(
    address1?: ComparableAddress,
    address2?: ComparableAddress,
): boolean {
    if (!address1 || !address2) {
        return false;
    }

    return (
        isEqual(normalizeAddress(address1), normalizeAddress(address2)) &&
        isSameState(address1, address2)
    );
}

function isSameState(address1: ComparableAddress, address2: ComparableAddress): boolean {
    if (address1.stateOrProvince && address1.stateOrProvince === address2.stateOrProvince) {
        return true;
    }

    if (
        address1.stateOrProvinceCode &&
        address1.stateOrProvinceCode === address2.stateOrProvinceCode
    ) {
        return true;
    }

    return (
        address1.stateOrProvince === address2.stateOrProvince &&
        address1.stateOrProvinceCode === address2.stateOrProvinceCode
    );
}

function normalizeAddress(address: ComparableAddress) {
    const ignoredFields: ComparableAddressFields[] = [
        'id',
        'shouldSaveAddress',
        'stateOrProvince',
        'stateOrProvinceCode',
        'type',
        'email',
        'country',
    ];

    return omit(
        {
            ...address,
            customFields: (address.customFields || []).filter(({ fieldValue }) => !!fieldValue),
        },
        ignoredFields,
    );
}
