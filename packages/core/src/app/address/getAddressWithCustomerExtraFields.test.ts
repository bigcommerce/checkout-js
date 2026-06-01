import {
    type Address,
    type AddressExtraFieldValue,
    type CustomerAddress,
} from '@bigcommerce/checkout-sdk';

import { getAddress } from './address.mock';
import getAddressWithCustomerExtraFields from './getAddressWithCustomerExtraFields';

const extraFields: AddressExtraFieldValue[] = [
    { fieldId: '100', fieldValue: 'Acme Corp' },
    { fieldId: '200', fieldValue: 'Engineering' },
];

function getCustomerAddress(overrides: Partial<CustomerAddress> = {}): CustomerAddress {
    return {
        ...getAddress(),
        id: 1,
        type: 'residential',
        ...overrides,
    } as CustomerAddress;
}

describe('getAddressWithCustomerExtraFields', () => {
    it('returns the raw address unchanged when hasAddressExtraFields is false (B2C)', () => {
        const raw: Address = { ...getAddress() };
        const customerAddresses: CustomerAddress[] = [getCustomerAddress({ extraFields })];

        const result = getAddressWithCustomerExtraFields(raw, customerAddresses, false);

        expect(result).toBe(raw);
    });

    it('returns undefined when the raw address is undefined', () => {
        const result = getAddressWithCustomerExtraFields(
            undefined,
            [getCustomerAddress({ extraFields })],
            true,
        );

        expect(result).toBeUndefined();
    });

    it('returns the raw address unchanged when it already has extraFields', () => {
        const raw: Address = {
            ...getAddress(),
            extraFields: [{ fieldId: '100', fieldValue: 'Already Here' }],
        };
        const customerAddresses: CustomerAddress[] = [getCustomerAddress({ extraFields })];

        const result = getAddressWithCustomerExtraFields(raw, customerAddresses, true);

        expect(result).toBe(raw);
    });

    it('returns the raw address unchanged when no customer address matches', () => {
        const raw: Address = { ...getAddress() };
        const customerAddresses: CustomerAddress[] = [
            getCustomerAddress({ address1: 'Some other street', extraFields }),
        ];

        const result = getAddressWithCustomerExtraFields(raw, customerAddresses, true);

        expect(result).toBe(raw);
    });

    it('returns the raw address unchanged when the matching customer address has no extraFields', () => {
        const raw: Address = { ...getAddress() };
        const customerAddresses: CustomerAddress[] = [getCustomerAddress()];

        const result = getAddressWithCustomerExtraFields(raw, customerAddresses, true);

        expect(result).toBe(raw);
    });

    it('grafts extraFields from the matching customer address onto the raw address', () => {
        const raw: Address = { ...getAddress() };
        const customerAddresses: CustomerAddress[] = [getCustomerAddress({ extraFields })];

        const result = getAddressWithCustomerExtraFields(raw, customerAddresses, true);

        expect(result).toEqual({ ...raw, extraFields });
        expect(result).not.toBe(raw);
    });

    it('returns the raw address unchanged when customerAddresses is undefined', () => {
        const raw: Address = { ...getAddress() };

        const result = getAddressWithCustomerExtraFields(raw, undefined, true);

        expect(result).toBe(raw);
    });
});
