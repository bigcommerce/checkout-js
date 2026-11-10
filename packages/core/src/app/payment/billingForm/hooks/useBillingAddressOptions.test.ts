import { type Address, type Consignment, type CustomerAddress } from '@bigcommerce/checkout-sdk';
import { renderHook } from '@testing-library/react';

import { useCapabilities, useCheckout } from '@bigcommerce/checkout/contexts';
import { usePayPalFastlaneAddress } from '@bigcommerce/checkout/paypal-fastlane-integration';

import { getAddress } from '../../../address/address.mock';
import { getCart } from '../../../cart/carts.mock';
import { getCustomer, getGuestCustomer } from '../../../customer/customers.mock';
import { getConsignment } from '../../../shipping/consignment.mock';

import { useBillingAddressOptions } from './useBillingAddressOptions';

jest.mock('@bigcommerce/checkout/contexts');
jest.mock('@bigcommerce/checkout/paypal-fastlane-integration', () => ({
    usePayPalFastlaneAddress: jest.fn(),
}));

describe('useBillingAddressOptions', () => {
    const savedAddress = getCustomer().addresses[0];

    const createConsignment = (id: string, shippingAddress: Address): Consignment => ({
        ...getConsignment(),
        id,
        shippingAddress,
        address: shippingAddress,
    });

    const firstConsignmentAddress: Address = { ...getAddress(), address1: '1 Consignment Way' };
    const secondConsignmentAddress: Address = { ...getAddress(), address1: '2 Consignment Way' };

    let data: {
        getCart: jest.Mock;
        getConsignments: jest.Mock;
        getCustomer: jest.Mock;
    };

    const mockCapabilities = (userJourney: Record<string, boolean> = {}) => {
        (useCapabilities as jest.Mock).mockReturnValue({
            userJourney: { hasAddressLabel: false, hasCompanyAddressBook: false, ...userJourney },
        });
    };

    const mockFastlane = (
        isPayPalFastlaneEnabled: boolean,
        paypalFastlaneAddresses: CustomerAddress[] = [],
    ) => {
        (usePayPalFastlaneAddress as jest.Mock).mockReturnValue({
            isPayPalFastlaneEnabled,
            paypalFastlaneAddresses,
        });
    };

    const renderUseBillingAddressOptions = () =>
        renderHook(() => useBillingAddressOptions()).result.current;

    beforeEach(() => {
        data = {
            getCart: jest.fn().mockReturnValue(getCart()),
            getConsignments: jest
                .fn()
                .mockReturnValue([
                    createConsignment('consignment-1', firstConsignmentAddress),
                    createConsignment('consignment-2', secondConsignmentAddress),
                ]),
            getCustomer: jest.fn().mockReturnValue(getCustomer()),
        };

        (useCheckout as jest.Mock).mockImplementation(
            (selector: (state: { data: typeof data }) => unknown) => ({
                selectedState: selector({ data }),
            }),
        );

        mockCapabilities();
        mockFastlane(false);
    });

    it('returns only the saved addresses when the order ships to a single address', () => {
        data.getConsignments.mockReturnValue([
            {
                ...createConsignment('consignment-1', firstConsignmentAddress),
                lineItemIds: getCart().lineItems.physicalItems.map(({ id }) => String(id)),
            },
        ]);

        const { addresses } = renderUseBillingAddressOptions();

        expect(addresses).toEqual(getCustomer().addresses);
    });

    it('appends the shipping addresses after the saved addresses when shipping to multiple addresses', () => {
        const { addresses } = renderUseBillingAddressOptions();

        expect(addresses.map(({ address1 }) => address1)).toEqual([
            ...getCustomer().addresses.map(({ address1 }) => address1),
            firstConsignmentAddress.address1,
            secondConsignmentAddress.address1,
        ]);
    });

    it('gives each shipping address a placeholder id and no email', () => {
        data.getConsignments.mockReturnValue([
            createConsignment('consignment-1', {
                ...firstConsignmentAddress,
                email: '',
            } as Address),
            createConsignment('consignment-2', secondConsignmentAddress),
        ]);

        const { addresses } = renderUseBillingAddressOptions();
        const consignmentAddresses = addresses.slice(getCustomer().addresses.length);

        expect(consignmentAddresses.map(({ id }) => id)).toEqual([-1, -2]);
        consignmentAddresses.forEach((address) => {
            expect(address).not.toHaveProperty('email');
            expect(address.type).toBe('residential');
        });
    });

    it('lists a shipping address only once when several consignments share it', () => {
        data.getConsignments.mockReturnValue([
            createConsignment('consignment-1', firstConsignmentAddress),
            createConsignment('consignment-2', { ...firstConsignmentAddress }),
        ]);

        const { addresses } = renderUseBillingAddressOptions();

        expect(
            addresses.filter(({ address1 }) => address1 === firstConsignmentAddress.address1),
        ).toHaveLength(1);
    });

    it('does not repeat a shipping address that matches a saved address', () => {
        data.getConsignments.mockReturnValue([
            createConsignment('consignment-1', { ...getAddress(), ...savedAddress }),
            createConsignment('consignment-2', secondConsignmentAddress),
        ]);

        const { addresses } = renderUseBillingAddressOptions();

        expect(addresses).toHaveLength(getCustomer().addresses.length + 1);
        expect(addresses[addresses.length - 1].address1).toBe(secondConsignmentAddress.address1);
    });

    it('returns only the saved addresses for B2B checkouts with a company address book', () => {
        mockCapabilities({ hasCompanyAddressBook: true });

        const { addresses } = renderUseBillingAddressOptions();

        expect(addresses).toEqual(getCustomer().addresses);
    });

    it('offers the shipping addresses to guests', () => {
        data.getCustomer.mockReturnValue(getGuestCustomer());

        const { addresses, hasAddresses } = renderUseBillingAddressOptions();

        expect(addresses.map(({ address1 }) => address1)).toEqual([
            firstConsignmentAddress.address1,
            secondConsignmentAddress.address1,
        ]);
        expect(hasAddresses).toBe(true);
    });

    it('returns only the Fastlane addresses for a Fastlane guest who has them', () => {
        const fastlaneAddress: CustomerAddress = {
            ...getAddress(),
            address1: 'Fastlane Way',
            id: 99,
            type: 'paypal-address',
        };

        data.getCustomer.mockReturnValue(getGuestCustomer());
        mockFastlane(true, [fastlaneAddress]);

        const { addresses } = renderUseBillingAddressOptions();

        expect(addresses).toEqual([fastlaneAddress]);
    });

    it('offers the shipping addresses to a Fastlane guest without Fastlane addresses', () => {
        data.getCustomer.mockReturnValue(getGuestCustomer());
        mockFastlane(true);

        const { addresses } = renderUseBillingAddressOptions();

        expect(addresses.map(({ address1 }) => address1)).toEqual([
            firstConsignmentAddress.address1,
            secondConsignmentAddress.address1,
        ]);
    });

    it('returns no addresses when there is no customer or consignment', () => {
        data.getCustomer.mockReturnValue(undefined);
        data.getConsignments.mockReturnValue(undefined);

        const { addresses, hasAddresses } = renderUseBillingAddressOptions();

        expect(addresses).toEqual([]);
        expect(hasAddresses).toBe(false);
    });

    describe('toBillingAddress', () => {
        it('removes the placeholder id and type from a shipping address option', () => {
            const { addresses, toBillingAddress } = renderUseBillingAddressOptions();
            const consignmentOption = addresses[addresses.length - 1];

            const billingAddress = toBillingAddress(consignmentOption);

            expect(billingAddress).not.toHaveProperty('id');
            expect(billingAddress).not.toHaveProperty('type');
            expect(billingAddress).toEqual(
                expect.objectContaining({ address1: secondConsignmentAddress.address1 }),
            );
        });

        it('returns a saved address unchanged', () => {
            const { addresses, toBillingAddress } = renderUseBillingAddressOptions();

            expect(toBillingAddress(addresses[0])).toBe(addresses[0]);
        });

        it('returns an empty address unchanged', () => {
            const { toBillingAddress } = renderUseBillingAddressOptions();
            const emptyAddress = {};

            expect(toBillingAddress(emptyAddress)).toBe(emptyAddress);
        });
    });
});
