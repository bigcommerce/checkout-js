import {
    type Address,
    type AddressRequestBody,
    type BillingAddress,
    type CustomerAddress,
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
        'isShipping',
        'isBilling',
        'isDefaultShipping',
        'isDefaultBilling',
        'label',
    ];

    return omit(
        {
            ...address,
            customFields: (address.customFields || []).filter(({ fieldValue }) => !!fieldValue),
            // Normalize `extraFields` so an unchanged address compares equal instead of
            // refiring update calls. Guards against any future path where one side has `[]`
            // and the other omits it (e.g. backend behavior flips again, or a saved/customer
            // address arrives with `[]`).
            extraFields: address.extraFields || [],
        },
        ignoredFields,
    );
}
