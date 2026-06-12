import { type CustomerAddress } from '@bigcommerce/checkout-sdk';

import { getAddress } from './address.mock';
import AddressType from './AddressType';
import { B2BExtraFieldsSessionStorage } from './B2BExtraFieldsSessionStorage';
import setDefaultAddress from './setDefaultAddress';

describe('setDefaultAddress', () => {
    const shippingIdKey = B2BExtraFieldsSessionStorage.SHIPPING_ADDRESS_ID_KEY;
    const billingIdKey = B2BExtraFieldsSessionStorage.BILLING_ADDRESS_ID_KEY;

    const getCustomerAddress = (overrides: Partial<CustomerAddress> = {}): CustomerAddress => ({
        ...getAddress(),
        id: 1,
        type: 'residential',
        isShipping: true,
        isBilling: true,
        ...overrides,
    });

    let updateAddress: jest.Mock;

    beforeEach(() => {
        sessionStorage.clear();
        updateAddress = jest.fn().mockResolvedValue(undefined);
    });

    describe('when there is no current address', () => {
        it('applies the default address and stores its id', async () => {
            const defaultAddress = getCustomerAddress({ id: 7, isDefaultShipping: true });

            await setDefaultAddress({
                type: AddressType.Shipping,
                currentAddress: undefined,
                addresses: [defaultAddress],
                updateAddress,
            });

            expect(updateAddress).toHaveBeenCalledWith(defaultAddress);
            expect(B2BExtraFieldsSessionStorage.getAddressId(shippingIdKey)).toBe(7);
        });

        it('applies the default address but does not store an id when it has none', async () => {
            const defaultAddress = getCustomerAddress({
                id: undefined as unknown as number,
                isDefaultShipping: true,
            });

            await setDefaultAddress({
                type: AddressType.Shipping,
                currentAddress: undefined,
                addresses: [defaultAddress],
                updateAddress,
            });

            expect(updateAddress).toHaveBeenCalledWith(defaultAddress);
            expect(B2BExtraFieldsSessionStorage.getAddressId(shippingIdKey)).toBeUndefined();
        });

        it('does nothing when there is no default address', async () => {
            await setDefaultAddress({
                type: AddressType.Shipping,
                currentAddress: undefined,
                addresses: [getCustomerAddress()],
                updateAddress,
            });

            expect(updateAddress).not.toHaveBeenCalled();
            expect(B2BExtraFieldsSessionStorage.getAddressId(shippingIdKey)).toBeUndefined();
        });

        it('does not store an id when applying the default address fails', async () => {
            updateAddress.mockRejectedValue(new Error('update failed'));

            const defaultAddress = getCustomerAddress({ id: 7, isDefaultShipping: true });

            await setDefaultAddress({
                type: AddressType.Shipping,
                currentAddress: undefined,
                addresses: [defaultAddress],
                updateAddress,
            });

            expect(B2BExtraFieldsSessionStorage.getAddressId(shippingIdKey)).toBeUndefined();
        });
    });

    describe('when there is a pre-existing address', () => {
        it('recovers the book id by matching the current address', async () => {
            const currentAddress = getAddress();
            const matchingAddress = getCustomerAddress({ id: 42 });

            await setDefaultAddress({
                type: AddressType.Shipping,
                currentAddress,
                addresses: [
                    getCustomerAddress({ id: 3, address1: 'Somewhere else' }),
                    matchingAddress,
                ],
                updateAddress,
            });

            expect(updateAddress).not.toHaveBeenCalled();
            expect(B2BExtraFieldsSessionStorage.getAddressId(shippingIdKey)).toBe(42);
        });

        it('does nothing when no book address matches', async () => {
            await setDefaultAddress({
                type: AddressType.Shipping,
                currentAddress: getAddress(),
                addresses: [getCustomerAddress({ id: 3, address1: 'Somewhere else' })],
                updateAddress,
            });

            expect(B2BExtraFieldsSessionStorage.getAddressId(shippingIdKey)).toBeUndefined();
        });

        it('keeps the stored id when it still matches the current address', async () => {
            B2BExtraFieldsSessionStorage.setAddressId(shippingIdKey, 42);

            await setDefaultAddress({
                type: AddressType.Shipping,
                currentAddress: getAddress(),
                addresses: [getCustomerAddress({ id: 42 })],
                updateAddress,
            });

            expect(updateAddress).not.toHaveBeenCalled();
            expect(B2BExtraFieldsSessionStorage.getAddressId(shippingIdKey)).toBe(42);
        });

        it('replaces a stale stored id when the current address matches a different entry', async () => {
            B2BExtraFieldsSessionStorage.setAddressId(shippingIdKey, 99);

            await setDefaultAddress({
                type: AddressType.Shipping,
                currentAddress: getAddress(),
                addresses: [
                    getCustomerAddress({ id: 3, address1: 'Somewhere else' }),
                    getCustomerAddress({ id: 42 }),
                ],
                updateAddress,
            });

            expect(updateAddress).not.toHaveBeenCalled();
            expect(B2BExtraFieldsSessionStorage.getAddressId(shippingIdKey)).toBe(42);
        });
    });

    describe('when company rows duplicate fields across types', () => {
        it('matches a shipping row over a content-identical billing-only row for the shipping key', async () => {
            const billingOnly = getCustomerAddress({ id: 50, isShipping: false, isBilling: true });
            const shippingRow = getCustomerAddress({ id: 42, isShipping: true, isBilling: false });

            await setDefaultAddress({
                type: AddressType.Shipping,
                currentAddress: getAddress(),
                addresses: [billingOnly, shippingRow],
                updateAddress,
            });

            expect(B2BExtraFieldsSessionStorage.getAddressId(shippingIdKey)).toBe(42);
        });

        it('does not store a billing-only row id under the shipping key', async () => {
            const billingOnly = getCustomerAddress({ id: 50, isShipping: false, isBilling: true });

            await setDefaultAddress({
                type: AddressType.Shipping,
                currentAddress: getAddress(),
                addresses: [billingOnly],
                updateAddress,
            });

            expect(B2BExtraFieldsSessionStorage.getAddressId(shippingIdKey)).toBeUndefined();
        });

        it('matches a billing row over a content-identical shipping-only row for the billing key', async () => {
            const shippingOnly = getCustomerAddress({ id: 60, isShipping: true, isBilling: false });
            const billingRow = getCustomerAddress({ id: 24, isShipping: false, isBilling: true });

            await setDefaultAddress({
                type: AddressType.Billing,
                currentAddress: getAddress(),
                addresses: [shippingOnly, billingRow],
                updateAddress,
            });

            expect(B2BExtraFieldsSessionStorage.getAddressId(billingIdKey)).toBe(24);
        });
    });
});
