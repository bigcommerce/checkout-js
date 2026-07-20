import { type Address, type Cart } from '@bigcommerce/checkout-sdk';
import { useCallback } from 'react';

import { useCapabilities, useCheckout } from '@bigcommerce/checkout/contexts';

import { decodeAddressLabel } from './addressLabelUtils';

export default function useAddressLabelDecoder(): <T extends Address | undefined>(address: T) => T {
    const {
        userJourney: { hasAddressLabel },
    } = useCapabilities();
    // cart.companyName exists in the API response but is not yet in the SDK types.
    const { selectedState: cart } = useCheckout(({ data }) => data.getCart());
    const cartCompanyName =
        (cart as (Cart & { companyName?: string }) | undefined)?.companyName ?? '';

    return useCallback(
        <T extends Address | undefined>(address: T): T =>
            hasAddressLabel && address ? decodeAddressLabel(address, cartCompanyName) : address,
        [hasAddressLabel, cartCompanyName],
    );
}
