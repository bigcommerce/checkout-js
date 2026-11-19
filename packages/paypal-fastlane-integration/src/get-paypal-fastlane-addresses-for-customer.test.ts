import { type CustomerAddress } from '@bigcommerce/checkout-sdk';

import { getAddress } from '@bigcommerce/checkout/test-mocks';

import getPayPalFastlaneAddressesForCustomer from './get-paypal-fastlane-addresses-for-customer';

describe('getPayPalFastlaneAddressesForCustomer', () => {
    const baseAddress = getAddress();
    const bcAddress: CustomerAddress = { ...baseAddress, id: 1, type: 'address', address1: 'BC 1' };
    const bcAddressDuplicatedInFastlane: CustomerAddress = {
        ...baseAddress,
        id: 2,
        type: 'address',
        address1: 'Same address',
    };
    const fastlaneAddress: CustomerAddress = {
        ...baseAddress,
        id: 3,
        type: 'paypal-address',
        address1: 'Fastlane 1',
    };
    const fastlaneDuplicate: CustomerAddress = {
        ...bcAddressDuplicatedInFastlane,
        id: 4,
        type: 'paypal-address',
    };

    const defaultOptions = {
        isGuest: false,
        isPayPalFastlaneEnabled: true,
        isFastlaneForKnownShoppersEnabled: true,
        paypalFastlaneAddresses: [fastlaneAddress, fastlaneDuplicate],
        bcAddresses: [bcAddress, bcAddressDuplicatedInFastlane],
    };

    it('returns BC addresses when Fastlane is not enabled', () => {
        expect(
            getPayPalFastlaneAddressesForCustomer({
                ...defaultOptions,
                isPayPalFastlaneEnabled: false,
            }),
        ).toEqual(defaultOptions.bcAddresses);
    });

    it('returns only Fastlane addresses for guests', () => {
        expect(getPayPalFastlaneAddressesForCustomer({ ...defaultOptions, isGuest: true })).toEqual(
            defaultOptions.paypalFastlaneAddresses,
        );
    });

    it('returns BC addresses for known shoppers when the known shoppers feature is disabled', () => {
        expect(
            getPayPalFastlaneAddressesForCustomer({
                ...defaultOptions,
                isFastlaneForKnownShoppersEnabled: false,
            }),
        ).toEqual(defaultOptions.bcAddresses);
    });

    it('returns BC addresses for known shoppers when the feature flag is not provided', () => {
        expect(
            getPayPalFastlaneAddressesForCustomer({
                ...defaultOptions,
                isFastlaneForKnownShoppersEnabled: undefined,
            }),
        ).toEqual(defaultOptions.bcAddresses);
    });

    it('merges Fastlane addresses with BC addresses for known shoppers without duplicates', () => {
        expect(getPayPalFastlaneAddressesForCustomer(defaultOptions)).toEqual([
            fastlaneAddress,
            fastlaneDuplicate,
            bcAddress,
        ]);
    });
});
