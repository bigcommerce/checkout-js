import { useCapabilities, useCheckout } from '@bigcommerce/checkout/contexts';
import { type Address, type Cart } from '@bigcommerce/checkout-sdk';
import { useCallback } from 'react';

import { decodeAddressLabel } from './addressLabelUtils';

// Returns a decode function (usable on one address or via `list.map`) that gates on the capability,
// backfills an empty company with cart.companyName, and is a no-op passthrough when off/undefined —
// so callers don't repeat that in every form.
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
            hasAddressLabel && address
                ? decodeAddressLabel({ ...address, company: address.company || cartCompanyName })
                : address,
        [hasAddressLabel, cartCompanyName],
    );
}
