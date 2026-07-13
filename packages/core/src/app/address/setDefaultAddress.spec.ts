import { type CustomerAddress } from '@bigcommerce/checkout-sdk';

import { getAddress, getCustomerAddressB2B } from './address.mock';
import AddressType from './AddressType';
import setDefaultAddress from './setDefaultAddress';

describe('setDefaultAddress', () => {
    const getCustomerAddress = (overrides: Partial<CustomerAddress> = {}): CustomerAddress => ({
        ...getAddress(),
        id: 1,
        type: 'residential',
        b2b: getCustomerAddressB2B({ isShipping: true, isBilling: true }),
        ...overrides,
    });

    let updateAddress: jest.Mock;

    beforeEach(() => {
        updateAddress = jest.fn().mockResolvedValue(undefined);
    });

    describe('when there is no current address', () => {
        it('applies the default address', async () => {
            const defaultAddress = getCustomerAddress({
                id: 7,
                b2b: getCustomerAddressB2B({ isShipping: true, isDefaultShipping: true }),
            });

            await setDefaultAddress({
                type: AddressType.Shipping,
                currentAddress: undefined,
                addresses: [defaultAddress],
                updateAddress,
            });

            expect(updateAddress).toHaveBeenCalledWith(defaultAddress);
        });

        it('does nothing when there is no default address', async () => {
            await setDefaultAddress({
                type: AddressType.Shipping,
                currentAddress: undefined,
                addresses: [getCustomerAddress()],
                updateAddress,
            });

            expect(updateAddress).not.toHaveBeenCalled();
        });

        it('swallows the error when applying the default address fails', async () => {
            updateAddress.mockRejectedValue(new Error('update failed'));

            const defaultAddress = getCustomerAddress({
                id: 7,
                b2b: getCustomerAddressB2B({ isShipping: true, isDefaultShipping: true }),
            });

            await expect(
                setDefaultAddress({
                    type: AddressType.Shipping,
                    currentAddress: undefined,
                    addresses: [defaultAddress],
                    updateAddress,
                }),
            ).resolves.toBeUndefined();
        });

        it('only considers default addresses of the requested type', async () => {
            const billingOnlyDefault = getCustomerAddress({
                id: 50,
                b2b: getCustomerAddressB2B({ isBilling: true, isDefaultBilling: true }),
            });
            const shippingDefault = getCustomerAddress({
                id: 42,
                b2b: getCustomerAddressB2B({ isShipping: true, isDefaultShipping: true }),
            });

            await setDefaultAddress({
                type: AddressType.Shipping,
                currentAddress: undefined,
                addresses: [billingOnlyDefault, shippingDefault],
                updateAddress,
            });

            expect(updateAddress).toHaveBeenCalledWith(shippingDefault);
        });
    });

    describe('when there is a pre-existing address', () => {
        it('does not overwrite it with the default address', async () => {
            await setDefaultAddress({
                type: AddressType.Shipping,
                currentAddress: getAddress(),
                addresses: [
                    getCustomerAddress({
                        id: 7,
                        b2b: getCustomerAddressB2B({
                            isShipping: true,
                            isDefaultShipping: true,
                        }),
                    }),
                ],
                updateAddress,
            });

            expect(updateAddress).not.toHaveBeenCalled();
        });
    });
});
