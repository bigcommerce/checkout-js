import { type CustomerAddress } from '@bigcommerce/checkout-sdk';

import { getAddress } from './address.mock';
import { B2BExtraFieldsSessionStorage } from './B2BExtraFieldsSessionStorage';
import setDefaultAddress from './setDefaultAddress';

describe('setDefaultAddress', () => {
    const addressIdKey = B2BExtraFieldsSessionStorage.SHIPPING_ADDRESS_ID_KEY;

    const getCustomerAddress = (overrides: Partial<CustomerAddress> = {}): CustomerAddress => ({
        ...getAddress(),
        id: 1,
        type: 'residential',
        ...overrides,
    });

    let updateAddress: jest.Mock;

    beforeEach(() => {
        sessionStorage.clear();
        updateAddress = jest.fn().mockResolvedValue(undefined);
    });

    describe('when there is no current address', () => {
        it('applies the default address and stores its id', async () => {
            const defaultAddress = getCustomerAddress({ id: 7 });

            await setDefaultAddress({
                addressIdKey,
                currentAddress: undefined,
                addresses: [defaultAddress],
                defaultAddress,
                updateAddress,
            });

            expect(updateAddress).toHaveBeenCalledWith(defaultAddress);
            expect(B2BExtraFieldsSessionStorage.getAddressId(addressIdKey)).toBe(7);
        });

        it('applies the default address but does not store an id when it has none', async () => {
            const defaultAddress = getCustomerAddress({ id: undefined as unknown as number });

            await setDefaultAddress({
                addressIdKey,
                currentAddress: undefined,
                addresses: [defaultAddress],
                defaultAddress,
                updateAddress,
            });

            expect(updateAddress).toHaveBeenCalledWith(defaultAddress);
            expect(B2BExtraFieldsSessionStorage.getAddressId(addressIdKey)).toBeUndefined();
        });

        it('does nothing when there is no default address', async () => {
            await setDefaultAddress({
                addressIdKey,
                currentAddress: undefined,
                addresses: [getCustomerAddress()],
                defaultAddress: undefined,
                updateAddress,
            });

            expect(updateAddress).not.toHaveBeenCalled();
            expect(B2BExtraFieldsSessionStorage.getAddressId(addressIdKey)).toBeUndefined();
        });

        it('does not store an id when applying the default address fails', async () => {
            updateAddress.mockRejectedValue(new Error('update failed'));

            const defaultAddress = getCustomerAddress({ id: 7 });

            await setDefaultAddress({
                addressIdKey,
                currentAddress: undefined,
                addresses: [defaultAddress],
                defaultAddress,
                updateAddress,
            });

            expect(B2BExtraFieldsSessionStorage.getAddressId(addressIdKey)).toBeUndefined();
        });
    });

    describe('when there is a pre-existing address', () => {
        it('recovers the book id by matching the current address', async () => {
            const currentAddress = getAddress();
            const matchingAddress = getCustomerAddress({ id: 42 });

            await setDefaultAddress({
                addressIdKey,
                currentAddress,
                addresses: [
                    getCustomerAddress({ id: 3, address1: 'Somewhere else' }),
                    matchingAddress,
                ],
                defaultAddress: undefined,
                updateAddress,
            });

            expect(updateAddress).not.toHaveBeenCalled();
            expect(B2BExtraFieldsSessionStorage.getAddressId(addressIdKey)).toBe(42);
        });

        it('does nothing when no book address matches', async () => {
            await setDefaultAddress({
                addressIdKey,
                currentAddress: getAddress(),
                addresses: [getCustomerAddress({ id: 3, address1: 'Somewhere else' })],
                defaultAddress: undefined,
                updateAddress,
            });

            expect(B2BExtraFieldsSessionStorage.getAddressId(addressIdKey)).toBeUndefined();
        });

        it('keeps the stored id when it still matches the current address', async () => {
            B2BExtraFieldsSessionStorage.setAddressId(addressIdKey, 42);

            await setDefaultAddress({
                addressIdKey,
                currentAddress: getAddress(),
                addresses: [getCustomerAddress({ id: 42 })],
                defaultAddress: undefined,
                updateAddress,
            });

            expect(updateAddress).not.toHaveBeenCalled();
            expect(B2BExtraFieldsSessionStorage.getAddressId(addressIdKey)).toBe(42);
        });

        it('replaces a stale stored id when the current address matches a different entry', async () => {
            B2BExtraFieldsSessionStorage.setAddressId(addressIdKey, 99);

            await setDefaultAddress({
                addressIdKey,
                currentAddress: getAddress(),
                addresses: [
                    getCustomerAddress({ id: 3, address1: 'Somewhere else' }),
                    getCustomerAddress({ id: 42 }),
                ],
                defaultAddress: undefined,
                updateAddress,
            });

            expect(updateAddress).not.toHaveBeenCalled();
            expect(B2BExtraFieldsSessionStorage.getAddressId(addressIdKey)).toBe(42);
        });
    });
});
