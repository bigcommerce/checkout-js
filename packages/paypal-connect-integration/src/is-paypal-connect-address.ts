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

const isEqualToPayPalConnectAddress = (
    bcAddress: Partial<ComparableAddress>,
    paypalConnectAddress: Partial<ComparableAddress>,
): boolean => isEqual(normalizeAddress(bcAddress), normalizeAddress(paypalConnectAddress));

const isPayPalConnectAddress = (address: Address, addresses: Address[]): boolean =>
    addresses.some((paypalConnectAddress) =>
        isEqualToPayPalConnectAddress(address, paypalConnectAddress),
    );

export default isPayPalConnectAddress;
