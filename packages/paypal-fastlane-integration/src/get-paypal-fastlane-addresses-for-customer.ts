import { type CustomerAddress } from '@bigcommerce/checkout-sdk';

import isPayPalFastlaneAddress from './is-paypal-fastlane-address';

interface GetPayPalFastlaneAddressesForCustomerOptions {
    isGuest: boolean;
    isPayPalFastlaneEnabled: boolean;
    isFastlaneForKnownShoppersEnabled?: boolean;
    paypalFastlaneAddresses: CustomerAddress[];
    bcAddresses: CustomerAddress[];
}

/**
 * Returns the addresses that should be offered in address selects:
 * - guests see only PayPal Fastlane addresses;
 * - known shoppers see PayPal Fastlane addresses merged with their address book
 *   (only when the known shoppers feature is enabled);
 * - in any other case the original BC addresses are returned.
 */
const getPayPalFastlaneAddressesForCustomer = ({
    isGuest,
    isPayPalFastlaneEnabled,
    isFastlaneForKnownShoppersEnabled,
    paypalFastlaneAddresses,
    bcAddresses,
}: GetPayPalFastlaneAddressesForCustomerOptions): CustomerAddress[] => {
    if (!isPayPalFastlaneEnabled) {
        return bcAddresses;
    }

    if (isGuest) {
        return paypalFastlaneAddresses;
    }

    if (!isFastlaneForKnownShoppersEnabled) {
        return bcAddresses;
    }

    return [
        ...paypalFastlaneAddresses,
        ...bcAddresses.filter(
            (address) => !isPayPalFastlaneAddress(address, paypalFastlaneAddresses),
        ),
    ];
};

export default getPayPalFastlaneAddressesForCustomer;
