import { type Address, type Consignment, type CustomerAddress } from '@bigcommerce/checkout-sdk';
import { omit, uniqWith } from 'lodash';
import { useCallback, useMemo } from 'react';

import { useCapabilities, useCheckout } from '@bigcommerce/checkout/contexts';
import { usePayPalFastlaneAddress } from '@bigcommerce/checkout/paypal-fastlane-integration';

import { decodeAddressLabel, isEqualAddress } from '../../address';
import { isUsingMultiShipping } from '../../shipping';

const mapConsignmentToCustomerAddress = (
    { shippingAddress }: Consignment,
    index: number,
): CustomerAddress => ({
    ...shippingAddress,
    id: -(index + 1),
    type: 'residential',
});

export const useBillingAddressOptions = () => {
    const {
        selectedState: { cart, config, consignments, customer },
    } = useCheckout(({ data }) => ({
        cart: data.getCart(),
        config: data.getConfig(),
        consignments: data.getConsignments(),
        customer: data.getCustomer(),
    }));
    const {
        userJourney: { hasAddressLabel, hasCompanyAddressBook },
    } = useCapabilities();
    const { isPayPalFastlaneEnabled, paypalFastlaneAddresses } = usePayPalFastlaneAddress();

    const isGuest = customer?.isGuest;
    const customerAddresses = customer?.addresses;
    const isRegisteredCustomer = !isGuest;
    const isMultiShippingEnabled = !!config?.checkoutSettings.hasMultiShippingEnabled;
    const hasMultiShippingConsignments =
        !!cart && !!consignments && isUsingMultiShipping(consignments, cart.lineItems);
    const shouldIncludeConsignmentAddresses =
        isRegisteredCustomer &&
        !hasCompanyAddressBook &&
        isMultiShippingEnabled &&
        hasMultiShippingConsignments;

    const { addresses, consignmentAddresses } = useMemo(() => {
        const baseAddresses = (
            isGuest && isPayPalFastlaneEnabled ? paypalFastlaneAddresses : (customerAddresses ?? [])
        ).map((address) => decodeAddressLabel(address, hasAddressLabel));

        if (!shouldIncludeConsignmentAddresses || !consignments) {
            return { addresses: baseAddresses, consignmentAddresses: [] };
        }

        const uniqueConsignmentAddresses = uniqWith(
            consignments.map(mapConsignmentToCustomerAddress),
            isEqualAddress,
        )
            .filter(
                (consignmentAddress) =>
                    !baseAddresses.some((address) => isEqualAddress(address, consignmentAddress)),
            )
            .map((address) => decodeAddressLabel(address, hasAddressLabel));

        return {
            addresses: [...baseAddresses, ...uniqueConsignmentAddresses],
            consignmentAddresses: uniqueConsignmentAddresses,
        };
    }, [
        consignments,
        customerAddresses,
        hasAddressLabel,
        isGuest,
        isPayPalFastlaneEnabled,
        paypalFastlaneAddresses,
        shouldIncludeConsignmentAddresses,
    ]);

    const toBillingAddress = useCallback(
        (address: Partial<Address>): Partial<Address> =>
            consignmentAddresses.some((consignmentAddress) => consignmentAddress === address)
                ? omit(address, ['id', 'type'])
                : address,
        [consignmentAddresses],
    );

    return {
        addresses,
        hasAddresses: addresses.length > 0,
        toBillingAddress,
    };
};
