import {
    Address,
    AddressRequestBody,
    BillingAddress,
    CustomerAddress,
} from '@bigcommerce/checkout-sdk';
import { isEqual, omit } from 'lodash';

type ComparableAddress = CustomerAddress | Address | BillingAddress | AddressRequestBody;
type ComparableAddressFields = keyof CustomerAddress | keyof Address | keyof BillingAddress;

const normalizeAddress = (address: Partial<ComparableAddress>) => {
    const ignoredFields: ComparableAddressFields[] = [
        'id',
        'shouldSaveAddress',
        'stateOrProvince',
        'type',
        'email',
        'country',
        'customFields',
    ];

    return omit(address, ignoredFields);
};

const isEqualToPayPalFastlaneAddress = (
    bcAddress: Partial<ComparableAddress>,
    paypalFastlaneAddress: Partial<ComparableAddress>,
): boolean => isEqual(normalizeAddress(bcAddress), normalizeAddress(paypalFastlaneAddress));

const isPayPalFastlaneAddress = (address: Address, addresses: Address[]): boolean =>
    addresses.some((paypalFastlaneAddress) =>
        isEqualToPayPalFastlaneAddress(address, paypalFastlaneAddress),
    );

export default isPayPalFastlaneAddress;
